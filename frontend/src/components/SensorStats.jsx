import React from 'react';
import Icon from './Icon';
import { chartTimeKey } from '../utils/sensorChart';
import '../styles/sensor-stats.css';

const sensors = [
  {
    key: 'temperature',
    title: 'Nhiệt độ',
    unit: '°C',
    max: 50,
    icon: 'temperature',
    tone: 'red',
    alertLabels: { LOW: 'Nhiệt độ thấp', HIGH: 'Nhiệt độ cao' },
  },
  {
    key: 'humidity',
    title: 'Độ ẩm',
    unit: '%',
    max: 100,
    icon: 'humidity',
    tone: 'blue',
    alertLabels: { LOW: 'Độ ẩm thấp', HIGH: 'Độ ẩm cao' },
  },
  {
    key: 'light',
    title: 'Cường độ ánh sáng',
    unit: 'lux',
    max: 1000,
    icon: 'sun',
    tone: 'yellow',
    alertLabels: { LOW: 'Ánh sáng yếu', HIGH: 'Ánh sáng mạnh' },
  },
];

const alertLabels = {
  NORMAL: 'Bình thường',
  UNKNOWN: 'Chưa có đánh giá',
};

export default function SensorStats({
  readings,
  chart,
  loading,
  error,
  connection,
  retry,
}) {
  return (
    <div
      className="dashboard-stats"
      aria-label="Số đo cảm biến mới nhất"
      aria-busy={loading}
    >
      {sensors.map((sensor) => {
        const labels = { ...alertLabels, ...sensor.alertLabels };
        const reading = readings?.[sensor.key];
        const hasValue =
          typeof reading?.value === 'number' && Number.isFinite(reading.value);
        const value = hasValue ? reading.value : null;
        const reportedStatus = readings?.[`${sensor.key}AlertStatus`];
        const status =
          hasValue && Object.hasOwn(labels, reportedStatus)
            ? reportedStatus
            : 'UNKNOWN';
        const unit = reading?.unit || sensor.unit;
        // Lịch sử đã sắp xếp theo thời gian; bỏ chính số đo hiện tại và bản tin trùng.
        const previous = hasValue
          ? chart?.[sensor.key]?.findLast(
              (point) => chartTimeKey(point.time) < chartTimeKey(reading.time),
            )
          : null;
        const delta = previous
          ? Number((value - previous.value).toFixed(2))
          : null;
        const trendText =
          delta === null
            ? ''
            : delta === 0
              ? 'Không đổi'
              : `${Math.abs(delta).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ${sensor.key === 'humidity' ? 'điểm %' : unit}`;
        const connectionLabel =
          connection === 'connected'
            ? ''
            : connection === 'connecting'
              ? 'Đang kết nối…'
              : 'Mất kết nối trực tiếp · Đang thử lại…';

        return (
          <article
            className={`stat-card sensor-alert-${status.toLowerCase()}`}
            key={sensor.key}
          >
            <div className={`stat-icon ${sensor.tone}`}>
              <Icon name={sensor.icon} />
            </div>
            <div className="stat-content">
              <h2>{sensor.title}</h2>
              <strong>
                {hasValue
                  ? `${value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ${unit}`
                  : '—'}
              </strong>
              <div
                className={`sensor-alert-label sensor-alert-label-${status.toLowerCase()}`}
                role="status"
              >
                {hasValue
                  ? labels[status]
                  : loading
                    ? 'Đang tải số đo…'
                    : error
                      ? 'Chưa tải được số đo'
                      : 'Chưa có số đo'}
              </div>
              {delta !== null && (
                <div
                  className="stat-trend"
                  aria-label={`${delta > 0 ? 'Tăng' : delta < 0 ? 'Giảm' : ''} ${trendText} so với lần đo trước`.trim()}
                >
                  <Icon
                    name="arrow"
                    className={
                      delta < 0
                        ? 'arrow-down'
                        : delta === 0
                          ? 'arrow-steady'
                          : ''
                    }
                  />
                  <b>{trendText}</b>
                  <span>so với lần đo trước</span>
                </div>
              )}
              {reading?.time && (
                <time className="sensor-reading-time" dateTime={reading.time}>
                  Đo lúc {reading.time.replace('T', ' ').split('.')[0]}
                </time>
              )}
              {connectionLabel && (
                <div className="sensor-live-info">{connectionLabel}</div>
              )}
              {error && (
                <div className="sensor-load-error" role="status">
                  <span>{error}</span>
                  <button type="button" onClick={retry} disabled={loading}>
                    Thử lại
                  </button>
                </div>
              )}
            </div>
            <div className={`stat-scale ${sensor.tone}`}>
              <div className="stat-scale-track" aria-hidden="true">
                <span
                  className="stat-scale-fill"
                  style={{
                    width: `${hasValue ? Math.min(100, Math.max(0, (value / sensor.max) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
