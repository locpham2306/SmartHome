import { useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { getLatestSensors, getSensorChart } from '../services/sensors';
import { isSensorSnapshot, mergeSensorReadings } from '../utils/sensorReadings';
import {
  emptyChart,
  appendChartSnapshot,
  isChartPoint,
  mergeChartPoints,
} from '../utils/sensorChart';

export default function useSensorReadings() {
  const [readings, setReadings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState('connecting');
  const [chart, setChart] = useState(emptyChart);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartErrors, setChartErrors] = useState({});
  const refreshRef = useRef(null);
  const chartRefreshRef = useRef(null);
  const retry = useCallback(() => refreshRef.current?.(), []);
  const retryChart = useCallback(() => chartRefreshRef.current?.(), []);

  useEffect(() => {
    let disposed = false;
    let requestController;
    let chartController;
    let liveRevision = 0;

    const refreshChart = async () => {
      chartController?.abort();
      const controller = new AbortController();
      chartController = controller;
      setChartLoading(true);
      const timer = window.setTimeout(() => controller.abort(), 10000);
      const types = {
        temperature: 'Temperature',
        humidity: 'Humidity',
        light: 'Light',
      };
      try {
        await Promise.all(
          Object.entries(types).map(async ([key, type]) => {
            try {
              const points = await getSensorChart(type, controller.signal);
              if (!Array.isArray(points) || !points.every(isChartPoint)) {
                throw new Error('Dữ liệu biểu đồ không hợp lệ.');
              }
              if (
                disposed ||
                chartController !== controller ||
                controller.signal.aborted
              )
                return;
              // Realtime có thể đến trong lúc REST đang tải: giữ các điểm mới đó.
              setChart((previous) => ({
                ...previous,
                [key]: mergeChartPoints(points, previous[key]),
              }));
              setChartErrors((previous) => ({ ...previous, [key]: '' }));
            } catch (failure) {
              if (disposed || chartController !== controller) return;
              setChartErrors((previous) => ({
                ...previous,
                [key]:
                  failure.name === 'AbortError'
                    ? 'Tải biểu đồ quá lâu. Vui lòng thử lại.'
                    : failure.message,
              }));
            }
          }),
        );
      } finally {
        window.clearTimeout(timer);
        if (!disposed && chartController === controller) setChartLoading(false);
      }
    };

    const acceptSnapshot = (snapshot) => {
      if (!isSensorSnapshot(snapshot)) {
        throw new Error('Dữ liệu cảm biến nhận được không hợp lệ.');
      }
      setReadings((previous) => mergeSensorReadings(previous, snapshot));
      setLoading(false);
      setError('');
    };

    const refresh = async () => {
      requestController?.abort();
      const controller = new AbortController();
      requestController = controller;
      const startedRevision = liveRevision;
      let timedOut = false;
      setLoading(true);
      const timer = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 10000);

      try {
        const snapshot = await getLatestSensors(controller.signal);
        if (!disposed && !controller.signal.aborted) acceptSnapshot(snapshot);
      } catch (failure) {
        if (disposed || requestController !== controller) return;
        // Nếu realtime đã nhận số đo trong lúc chờ REST, vẫn hiển thị số đo đó.
        if (
          liveRevision === startedRevision &&
          (timedOut || failure.name !== 'AbortError')
        ) {
          setError(
            timedOut
              ? 'Máy chủ phản hồi quá chậm. Vui lòng thử lại.'
              : failure.message,
          );
        }
      } finally {
        window.clearTimeout(timer);
        if (!disposed && requestController === controller) setLoading(false);
      }
    };

    refreshRef.current = refresh;
    chartRefreshRef.current = refreshChart;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const client = new Client({
      brokerURL: `${protocol}//${window.location.host}/ws`,
      reconnectDelay: 5000,
      connectionTimeout: 10000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: () => {
        if (disposed) return;
        setConnection('connected');
        client.subscribe('/topic/sensors', (message) => {
          if (disposed) return;
          try {
            const body = JSON.parse(message.body);
            if (body?.success !== true)
              throw new Error('Không nhận được dữ liệu cảm biến hợp lệ.');
            acceptSnapshot(body.data);
            setChart((previous) => appendChartSnapshot(previous, body.data));
            liveRevision += 1;
          } catch (failure) {
            setError(failure.message);
          }
        });
        // Tải lại sau mỗi lần kết nối để bù số đo bị lỡ khi mất mạng.
        void refresh();
        void refreshChart();
      },
      onWebSocketClose: () => {
        if (!disposed) setConnection('reconnecting');
      },
      onWebSocketError: () => {
        if (!disposed) setConnection('reconnecting');
      },
      onStompError: () => {
        if (!disposed) {
          setConnection('reconnecting');
          setError(
            'Không đăng ký được cập nhật cảm biến. Đang thử kết nối lại.',
          );
        }
        void client.forceDisconnect();
      },
    });

    void refresh();
    void refreshChart();
    client.activate();
    return () => {
      disposed = true;
      refreshRef.current = null;
      chartRefreshRef.current = null;
      requestController?.abort();
      chartController?.abort();
      void client.deactivate();
    };
  }, []);

  return {
    readings,
    loading,
    error,
    connection,
    retry,
    chart,
    chartLoading,
    chartErrors,
    retryChart,
  };
}
