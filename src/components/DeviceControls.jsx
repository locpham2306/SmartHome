import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import useDevices from '../hooks/useDevices';
import '../styles/device-controls.css';

const presentation = {
  'Fan System': { title: 'Quạt', icon: 'fan' },
  'Air Condition System': { title: 'Điều hòa', icon: 'ac' },
  'Light System': { title: 'Đèn', icon: 'light' },
};

function DeviceNotice({ notice }) {
  const [dismissed, setDismissed] = useState(null);
  const [leaving, setLeaving] = useState(null);
  useEffect(() => {
    if (!notice) return;
    const duration = notice.error ? 5000 : 1000;
    const fadeTimer = setTimeout(() => setLeaving(notice), duration - 200);
    const timer = setTimeout(() => setDismissed(notice), duration);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(timer);
    };
  }, [notice]);

  if (!notice || dismissed === notice) return null;
  return (
    <div className={`device-notice${leaving === notice ? ' is-leaving' : ''}`}>
      <div className="device-notice-content">
        <p
          role="status"
          className={`device-result${notice.error ? ' is-error' : ''}`}
        >
          {notice.text}
        </p>
      </div>
    </div>
  );
}

export default function DeviceControls() {
  const {
    devices,
    pending,
    notices,
    ready,
    error,
    connected,
    toggle,
    toggleAll,
    retry,
  } = useDevices();
  const busy = Object.keys(pending).length > 0;
  const allOn =
    devices.length > 0 && devices.every((device) => device.status === 'ON');
  return (
    <article className="device-panel">
      <div className="device-heading">
        <h2>
          <Icon name="controls" />
          Điều khiển thiết bị
        </h2>
        <button
          type="button"
          className="device-toggle-all"
          onClick={toggleAll}
          disabled={!ready || !connected || busy || !devices.length}
          aria-busy={busy}
        >
          <Icon name="power" />
          {busy ? 'Đang xử lý…' : allOn ? 'Tắt tất cả' : 'Bật tất cả'}
        </button>
      </div>
      <div className="device-connection" role="status">
        {error ||
          (!ready
            ? 'Đang tải trạng thái thiết bị…'
            : !connected
              ? 'Chưa kết nối cập nhật thiết bị. Đang kết nối lại…'
              : '')}
        {error && (
          <button type="button" onClick={retry}>
            Thử lại
          </button>
        )}
        {ready && !devices.length && 'Chưa có thiết bị.'}
      </div>
      <div className="device-list">
        {devices.map((device) => {
          const { title, icon } = presentation[device.name] || {
            title: device.name,
            icon: 'controls',
          };
          const on = device.status === 'ON';
          const waiting = !!pending[device.id];
          return (
            <div className="device-control-item" key={device.id}>
              <div className="device-row">
                <span
                  className={`device-icon device-${icon}${on ? ' is-on' : ''}`}
                >
                  <Icon name={icon} />
                  {icon === 'ac' && (
                    <svg
                      className="device-airflow"
                      viewBox="0 0 28 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M2 2h17q4 0 4-2" />
                      <path d="M5 5h19" />
                      <path d="M2 8h14q4 0 4 2" />
                    </svg>
                  )}
                </span>
                <span className="device-name">
                  {title}
                  <span className="device-pending" role="status">
                    {waiting ? 'Đang xử lý…' : ''}
                  </span>
                </span>
                <button
                  className={`device-switch${on ? ' is-on' : ''}`}
                  type="button"
                  role="switch"
                  aria-label={title}
                  aria-checked={on}
                  aria-busy={waiting}
                  disabled={!ready || !connected || waiting}
                  onClick={() => toggle(device.id)}
                >
                  <span />
                </button>
              </div>
              <div className="device-notice-slot">
                <DeviceNotice notice={notices[device.id]} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
