import { useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { apiRequest } from '../services/api';
import {
  getDevices,
  controlDevice,
  getLastDeviceCommand,
} from '../services/devices';

const terminal = ['SUCCESS', 'ERROR'];
const resultText = {
  SUCCESS: 'Điều khiển thành công.',
  ERROR: 'Điều khiển thất bại. Vui lòng kiểm tra thiết bị và thử lại.',
};
const errorText = {
  DEVICE_COMMAND_PENDING: 'Thiết bị đang xử lý một lệnh khác.',
  DEVICE_ALREADY_IN_STATE:
    'Thiết bị đã ở trạng thái yêu cầu. Đang đồng bộ lại.',
  MQTT_PUBLISH_FAILED: 'Không gửi được lệnh tới thiết bị.',
};

export default function useDevices() {
  const [state, setState] = useState({
    devices: [],
    pending: {},
    notices: {},
    ready: false,
    error: '',
    connected: false,
    boardConnection: 'UNKNOWN',
  });
  const actions = useRef({});
  const toggle = useCallback((id) => actions.current.toggle?.(id), []);
  const toggleAll = useCallback(() => actions.current.toggleAll?.(), []);
  const retry = useCallback(() => actions.current.refresh?.(), []);

  useEffect(() => {
    let current = {
      devices: [],
      pending: {},
      notices: {},
      ready: false,
      error: '',
      connected: false,
      boardConnection: 'UNKNOWN',
    };
    let disposed = false,
      revision = 0,
      refreshing = false;
    let connectionVersion = 0;
    const completed = new Map();
    const controllers = new Set();
    const update = (patch) => {
      if (disposed) return;
      current = { ...current, ...patch };
      setState(current);
    };
    const request = async (work) => {
      const controller = new AbortController();
      controllers.add(controller);
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        return await work(controller.signal);
      } finally {
        clearTimeout(timer);
        controllers.delete(controller);
      }
    };

    const acceptConnection = (status) => {
      if (!['ONLINE', 'OFFLINE', 'UNKNOWN'].includes(status)) return;
      connectionVersion++;
      update({ boardConnection: status });
    };
    const loadConnection = async () => {
      const version = connectionVersion;
      try {
        const status = await request((signal) =>
          apiRequest('/api/devices/connection', { signal }));
        if (!disposed && version === connectionVersion) acceptConnection(status);
      } catch {
        if (!disposed && version === connectionVersion)
          update({ boardConnection: 'UNKNOWN' });
      }
    };

    const refresh = async () => {
      if (refreshing || disposed) return;
      refreshing = true;
      const version = revision;
      try {
        const result = await request(async (signal) => {
          const devices = await getDevices(signal);
          if (
            !Array.isArray(devices) ||
            !devices.every(
              (d) =>
                Number.isInteger(d.id) &&
                typeof d.name === 'string' &&
                ['ON', 'OFF'].includes(d.status),
            )
          ) {
            throw new Error('Dữ liệu thiết bị không hợp lệ.');
          }
          const histories = await Promise.all(
            devices.map(async (device) => {
              const page = await getLastDeviceCommand(device.name, signal);
              if (!Array.isArray(page?.items))
                throw new Error('Không tải được trạng thái lệnh.');
              return page.items[0];
            }),
          );
          // Đọc lại trạng thái sau lịch sử để không dùng snapshot trước khi lệnh hoàn tất.
          const latestDevices = await getDevices(signal);
          if (!Array.isArray(latestDevices))
            throw new Error('Dữ liệu thiết bị không hợp lệ.');
          const latestById = new Map(latestDevices.map((device) => [device.id, device]));
          const syncedDevices = devices.map((device) => {
            const latest = latestById.get(device.id);
            if (!latest || !['ON', 'OFF'].includes(latest.status))
              throw new Error('Dữ liệu thiết bị không hợp lệ.');
            return { ...device, status: latest.status };
          });
          return { devices: syncedDevices, histories };
        });
        if (disposed || revision !== version) return;
        const pending = {},
          notices = { ...current.notices };
        result.devices.forEach((device, i) => {
          const history = result.histories[i];
          // Không ghi đè lệnh POST vẫn đang gửi, kể cả khi refresh cùng lúc.
          if (current.pending[device.id]?.sending) {
            pending[device.id] = current.pending[device.id];
            return;
          }
          if (history?.status === 'PENDING')
            pending[device.id] = {
              historyId: history.id,
              action: history.action,
            };
          else if (current.pending[device.id]) {
            const matches =
              history && current.pending[device.id].historyId === history.id;
            notices[device.id] = {
              error: !matches || history.status !== 'SUCCESS',
              text: matches
                ? resultText[history.status] || 'Đã đồng bộ trạng thái.'
                : notices[device.id]?.text ||
                  'Đã tải lại trạng thái thiết bị. Không xác định được kết quả lệnh trước.',
            };
          }
          // Lịch sử xác nhận kết quả lệnh, không ghi đè trạng thái hiện tại của thiết bị.
          if (history && terminal.includes(history.status))
            completed.set(device.id, history.id);
        });
        update({
          devices: result.devices,
          pending,
          notices,
          ready: true,
          error: '',
        });
      } catch (failure) {
        if (!disposed)
          update({
            ready: false,
            error:
              failure.name === 'AbortError'
                ? 'Tải trạng thái thiết bị quá lâu. Vui lòng thử lại.'
                : failure.message,
          });
      } finally {
        refreshing = false;
      }
    };

    const acceptResult = (data) => {
      if (
        !data ||
        !Number.isInteger(data.deviceId) ||
        !Number.isInteger(data.historyId) ||
        !terminal.includes(data.status) ||
        !['ON', 'OFF'].includes(data.deviceStatus)
      )
        return;
      const id = data.deviceId;
      if (data.historyId <= (completed.get(id) ?? 0)) return;
      completed.set(id, data.historyId);
      revision++;
      const pending = { ...current.pending };
      const waiting = pending[id];
      // ACK có thể tới trước response POST; so historyId lại khi POST hoàn tất.
      if (
        waiting &&
        !waiting.sending &&
        (!waiting.historyId || waiting.historyId <= data.historyId)
      )
        delete pending[id];
      update({
        devices: current.devices.map((device) =>
          device.id === id ? { ...device, status: data.deviceStatus } : device,
        ),
        pending,
        notices: {
          ...current.notices,
          [id]: {
            error: data.status !== 'SUCCESS',
            text: resultText[data.status],
          },
        },
      });
    };

    const send = async (id, action) => {
      if (
        !current.ready ||
        !current.connected ||
        current.pending[id] ||
        disposed
      )
        return;
      revision++;
      update({
        pending: { ...current.pending, [id]: { sending: true, action } },
        notices: { ...current.notices, [id]: null },
      });
      try {
        const response = await request((signal) =>
          controlDevice(id, action, signal),
        );
        if (disposed) return;
        if (
          response?.deviceId !== id ||
          !Number.isInteger(response.historyId) ||
          response.action !== action
        )
          throw new Error('Phản hồi điều khiển không hợp lệ.');
        revision++;
        const pending = { ...current.pending };
        if ((completed.get(id) ?? 0) < response.historyId)
          pending[id] = { historyId: response.historyId, action };
        else delete pending[id];
        update({ pending });
      } catch (failure) {
        if (disposed) return;
        revision++;
        const pending = { ...current.pending };
        // Không tự gửi lại POST: lỗi mạng có thể xảy ra sau khi BE đã nhận lệnh.
        pending[id] = { action, uncertain: true };
        update({
          pending,
          notices: {
            ...current.notices,
            [id]: {
              error: true,
              text:
                errorText[failure.code] ||
                'Chưa xác nhận được lệnh. Đang kiểm tra lại trạng thái.',
            },
          },
        });
        void refresh();
      }
    };
    actions.current = {
      refresh,
      toggle: (id) => {
        const device = current.devices.find((item) => item.id === id);
        if (device) void send(id, device.status === 'ON' ? 'OFF' : 'ON');
      },
      toggleAll: () => {
        if (Object.keys(current.pending).length || !current.devices.length)
          return;
        const action = current.devices.every((device) => device.status === 'ON')
          ? 'OFF'
          : 'ON';
        current.devices
          .filter((device) => device.status !== action)
          .forEach((device) => void send(device.id, action));
      },
    };
    const client = new Client({
      brokerURL: `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`,
      reconnectDelay: 5000,
      connectionTimeout: 10000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: () => {
        if (disposed) return;
        client.subscribe('/topic/devices', (message) => {
          try {
            const body = JSON.parse(message.body);
            if (body.success) acceptResult(body.data);
          } catch {
            update({
              error:
                'Không đọc được phản hồi thiết bị. Hãy tải lại trạng thái.',
            });
          }
        });
        client.subscribe('/topic/device-connection', (message) => {
          try {
            const body = JSON.parse(message.body);
            if (body.success) acceptConnection(body.data);
          } catch {
            acceptConnection('UNKNOWN');
          }
        });
        update({ connected: true });
        void loadConnection();
        void refresh();
      },
      onWebSocketClose: () => update({ connected: false }),
      onWebSocketError: () => update({ connected: false }),
      onStompError: () => {
        update({ connected: false });
        client.forceDisconnect();
      },
    });
    void refresh();
    client.activate();
    // Chỉ đối chiếu lịch sử khi có lệnh đang chờ hoặc lần tải trước bị lỗi.
    const poll = setInterval(() => {
      if (Object.keys(current.pending).length || !current.ready) void refresh();
    }, 5000);
    return () => {
      disposed = true;
      actions.current = {};
      clearInterval(poll);
      controllers.forEach((controller) => controller.abort());
      void client.deactivate();
    };
  }, []);
  return { ...state, toggle, toggleAll, retry };
}
