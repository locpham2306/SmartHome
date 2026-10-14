export const CHART_LIMIT = 100;
export const emptyChart = () => ({ temperature: [], humidity: [], light: [] });

// Chuẩn hóa phần giây để REST và WebSocket nhận cùng một số đo chỉ tạo một điểm.
export function chartTimeKey(time) {
  const [seconds, fraction = ''] = time.split('.');
  return `${seconds}.${fraction.padEnd(9, '0')}`;
}

export function isChartPoint(point) {
  return (
    point &&
    Number.isFinite(point.value) &&
    typeof point.time === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?$/.test(point.time) &&
    Number.isFinite(Date.parse(point.time))
  );
}

// Đối số sau được ưu tiên nếu trùng thời gian. Giữ thứ tự thời gian và giới hạn bộ nhớ.
export function mergeChartPoints(previous, incoming) {
  const points = new Map();
  for (const point of [...previous, ...incoming]) {
    if (isChartPoint(point)) points.set(chartTimeKey(point.time), point);
  }
  return [...points.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-CHART_LIMIT)
    .map(([, point]) => point);
}

export function appendChartSnapshot(chart, snapshot) {
  return Object.fromEntries(
    Object.entries(chart).map(([key, points]) => [
      key,
      mergeChartPoints(points, snapshot[key] ? [snapshot[key]] : []),
    ]),
  );
}
