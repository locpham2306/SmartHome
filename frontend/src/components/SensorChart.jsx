import React, { useLayoutEffect, useRef, useState } from 'react';
import { chartTimeKey } from '../utils/sensorChart';
import '../styles/sensor-chart.css';

const definitions = [
  { id: 'humidity', color: '#2877ff', label: 'Độ ẩm', unit: '%' },
  { id: 'temperature', color: '#ee5274', label: 'Nhiệt độ', unit: '°C' },
  { id: 'light', color: '#f4ae16', label: 'Ánh sáng', unit: 'lux' },
];
const formatValue = (value) =>
  value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
// BE trả LocalDateTime. Dùng cùng một mốc tính khoảng cách, không đổi giờ hiển thị.
const timePosition = (time) => Date.parse(time.slice(0, 23) + 'Z');

export default function SensorChart({
  lightOnly = false,
  data,
  loading,
  error,
  onRetry,
}) {
  const chartRef = useRef(null);
  const [activeTime, setActiveTime] = useState(null);
  const [{ width, height }, setDimensions] = useState({
    width: 574,
    height: 300,
  });
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setDimensions({ width, height });
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  const series = definitions
    .filter(({ id }) => (lightOnly ? id === 'light' : id !== 'light'))
    .map((item) => ({ ...item, values: data[item.id] }));
  const times = [
    ...new Set(
      series.flatMap(({ values }) =>
        values.map((point) => chartTimeKey(point.time)),
      ),
    ),
  ].sort();
  const allValues = series.flatMap(({ values }) =>
    values.map((point) => point.value),
  );
  const min = Math.min(0, ...allValues);
  const highest = Math.max(100, ...allValues);
  const step = Math.max(1, 10 ** Math.floor(Math.log10((highest - min) / 5)));
  const yMin = Math.floor(min / step) * step;
  const yMax = Math.ceil(highest / step) * step;
  const left = lightOnly ? 57 : 43,
    right = Math.max(left + 1, width - 24);
  const top = height < 160 ? 10 : 20,
    bottom = Math.max(top + 1, height - 32);
  const first = timePosition(times[0] || '2000-01-01T00:00:00');
  const last = timePosition(times.at(-1) || '2000-01-01T00:00:00');
  const xFor = (time) =>
    last === first
      ? (left + right) / 2
      : left + ((timePosition(time) - first) / (last - first)) * (right - left);
  const yFor = (value) =>
    bottom - ((value - yMin) / (yMax - yMin)) * (bottom - top);
  const selected = times.includes(activeTime) ? activeTime : null;
  const activeX = selected ? xFor(selected) : left;
  const tooltipWidth = Math.min(224, width - 8);
  const tooltipHeight = 30 + series.length * 22;
  const tooltipX = Math.max(
    4,
    Math.min(activeX + 12, width - tooltipWidth - 4),
  );
  const tickCount = height < 160 ? 2 : 5;
  // Chia mốc theo thời gian thực, không theo chỉ số bản ghi: dữ liệu có
  // khoảng ngắt vẫn giữ các nhãn cách đều, không dồn sát hai đầu biểu đồ.
  const maxIntervals = Math.max(1, Math.min(6, Math.floor((right - left) / 90)));
  const desiredStep = Math.max(1000, (last - first) / maxIntervals);
  const timeSteps = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600]
    .map((seconds) => seconds * 1000);
  const timeStep = timeSteps.find((step) => step >= desiredStep)
    ?? Math.ceil(desiredStep / 3600000) * 3600000;
  const labelTimes = [];
  if (times.length) {
    if (first === last) {
      labelTimes.push(first);
    } else {
      for (let time = Math.ceil(first / timeStep) * timeStep; time <= last; time += timeStep) {
        labelTimes.push(time);
      }
      if (!labelTimes.length) labelTimes.push((first + last) / 2);
    }
  }

  const showNearestPoint = (event) => {
    const matrix = chartRef.current.getScreenCTM();
    if (!matrix || !times.length) return;
    const { x, y } = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    if (x < left || x > right || y < top || y > bottom)
      return setActiveTime(null);
    setActiveTime(
      times.reduce((nearest, time) =>
        Math.abs(xFor(time) - x) < Math.abs(xFor(nearest) - x) ? time : nearest,
      ),
    );
  };

  return (
    <>
      {(error || loading) && (
        <div className="chart-data-status" role="status">
          {error ? (
            <>
              <span>{error}</span>{' '}
              <button type="button" onClick={onRetry} disabled={loading}>
                Thử lại biểu đồ
              </button>
            </>
          ) : (
            'Đang tải biểu đồ…'
          )}
        </div>
      )}
      <svg
        className="sensor-chart"
        ref={chartRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        tabIndex={0}
        onPointerMove={showNearestPoint}
        onPointerLeave={() => setActiveTime(null)}
        onFocus={() => setActiveTime(times.at(-1) ?? null)}
        onBlur={() => setActiveTime(null)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setActiveTime(null);
          if (
            times.length &&
            (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
          ) {
            event.preventDefault();
            const index = selected ? times.indexOf(selected) : times.length - 1;
            setActiveTime(
              times[
                Math.max(
                  0,
                  Math.min(
                    times.length - 1,
                    index + (event.key === 'ArrowRight' ? 1 : -1),
                  ),
                )
              ],
            );
          }
        }}
        aria-label={
          lightOnly
            ? 'Cường độ ánh sáng theo thời gian, đơn vị lux'
            : 'Nhiệt độ và độ ẩm theo thời gian'
        }
      >
        <defs>
          {series.map(({ color, id }) => (
            <linearGradient
              key={id}
              id={'fill-' + id}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity=".08" />
              <stop offset="100%" stopColor={color} stopOpacity=".01" />
            </linearGradient>
          ))}
        </defs>
        {Array.from(
          { length: tickCount + 1 },
          (_, i) => yMin + (i * (yMax - yMin)) / tickCount,
        ).map((value) => (
          <g key={value}>
            <line
              x1={left}
              y1={yFor(value)}
              x2={right}
              y2={yFor(value)}
              className="chart-grid"
            />
            <text x={left - 10} y={yFor(value) + 5} textAnchor="end">
              {formatValue(value)}
            </text>
          </g>
        ))}
        {labelTimes.map((timestamp) => {
          const time = new Date(timestamp).toISOString().slice(0, 23);
          const x = xFor(time);
          return (
          <g key={time}>
            <line
              x1={xFor(time)}
              y1={top}
              x2={xFor(time)}
              y2={bottom}
              className="chart-grid"
            />
            <text
              x={x}
              y={bottom + 24}
              className="chart-time-label"
              textAnchor={x < left + 30 ? 'start' : x > right - 30 ? 'end' : 'middle'}
            >
              {time.slice(11, timeStep >= 60000 && first !== last ? 16 : 19)}
            </text>
          </g>
          );
        })}
        {series.map(({ values, color, id }) => {
          if (!values.length) return null;
          const points = values.map((point) => [
            xFor(point.time),
            yFor(point.value),
          ]);
          const path = points
            .map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`)
            .join(' ');
          return (
            <g key={id} data-series={id} data-point-count={values.length}>
              <path
                d={`${path} L${points.at(-1)[0]},${bottom} L${points[0][0]},${bottom} Z`}
                fill={'url(#fill-' + id + ')'}
              />
              <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
              {points.length === 1 && (
                <circle
                  cx={points[0][0]}
                  cy={points[0][1]}
                  r="4"
                  fill={color}
                />
              )}
            </g>
          );
        })}
        {!times.length && (
          <text x={width / 2} y={(top + bottom) / 2} textAnchor="middle">
            {loading
              ? 'Đang tải số đo…'
              : error
                ? 'Chưa tải được lịch sử'
                : 'Chưa có dữ liệu trong 1 giờ gần nhất'}
          </text>
        )}
        {selected && (
          <g className="chart-inspection" pointerEvents="none">
            <line
              x1={activeX}
              x2={activeX}
              y1={top}
              y2={bottom}
              className="chart-crosshair"
            />
            {series.map(({ values, color, id }) => {
              const point = values.find(
                (point) => chartTimeKey(point.time) === selected,
              );
              return point ? (
                <circle
                  key={id}
                  cx={activeX}
                  cy={yFor(point.value)}
                  r="5"
                  fill="white"
                  stroke={color}
                  strokeWidth="2.5"
                />
              ) : null;
            })}
            <g
              transform={`translate(${tooltipX}, ${Math.max(4, Math.min(top, height - tooltipHeight - 4))})`}
              role="tooltip"
            >
              <rect
                width={tooltipWidth}
                height={tooltipHeight}
                rx="6"
                className="chart-tooltip-surface"
              />
              <text x="12" y="20" className="chart-tooltip-time">
                {selected.slice(0, 19).replace('T', ' ')}
              </text>
              {series.map(({ values, color, id, label, unit }, index) => {
                const point = values.find(
                  (point) => chartTimeKey(point.time) === selected,
                );
                return (
                  <g key={id} transform={`translate(12, ${40 + index * 22})`}>
                    <circle cx="3" cy="-4" r="3" fill={color} />
                    <text x="14" y="0">
                      {label}:{' '}
                      {point ? `${formatValue(point.value)} ${unit}` : '—'}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        )}
      </svg>
    </>
  );
}
