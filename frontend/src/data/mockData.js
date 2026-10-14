const originalSensorRows = [
  {
    id: 32194,
    time: '2024-05-18T14:32:01',
    type: 'Light',
    value: 1000.0,
    unit: 'lux',
  },
  {
    id: 32193,
    time: '2024-05-18T14:31:45',
    type: 'Humidity',
    value: 58.6,
    unit: '%',
  },
  {
    id: 32192,
    time: '2024-05-18T14:31:30',
    type: 'Temperature',
    value: 29.2,
    unit: '°C',
  },
  {
    id: 32191,
    time: '2024-05-18T14:31:15',
    type: 'Light',
    value: 985.4,
    unit: 'lux',
  },
  {
    id: 32190,
    time: '2024-05-18T14:31:00',
    type: 'Humidity',
    value: 59.1,
    unit: '%',
  },
  {
    id: 32189,
    time: '2024-05-18T14:30:45',
    type: 'Temperature',
    value: 28.8,
    unit: '°C',
  },
  {
    id: 32188,
    time: '2024-05-18T14:30:30',
    type: 'Light',
    value: 992.1,
    unit: 'lux',
  },
  {
    id: 32187,
    time: '2024-05-18T14:30:15',
    type: 'Humidity',
    value: 57.9,
    unit: '%',
  },
];

const originalHistoryRows = [
  {
    id: 300,
    time: '2026-09-17T08:45:00',
    user: 'Pham Bao Loc',
    device: 'Fan',
    action: 'ON',
    status: 'Pending',
  },
  {
    id: 299,
    time: '2026-09-17T08:44:00',
    user: 'Admin',
    device: 'AC',
    action: 'OFF',
    status: 'Pending',
  },
  {
    id: 298,
    time: '2026-09-17T08:43:00',
    user: 'Pham Bao Loc',
    device: 'Light System',
    action: 'ON',
    status: 'Pending',
  },
  {
    id: 297,
    time: '2026-09-17T08:30:00',
    user: 'Pham Bao Loc',
    device: 'Light System',
    action: 'ON',
    status: 'Success',
  },
  {
    id: 296,
    time: '2026-09-17T08:15:00',
    user: 'Admin',
    device: 'Light System',
    action: 'OFF',
    status: 'Success',
  },
  {
    id: 295,
    time: '2026-09-17T07:45:00',
    user: 'Pham Bao Loc',
    device: 'Light System',
    action: 'ON',
    status: 'Failed',
  },
  {
    id: 294,
    time: '2026-09-16T23:25:00',
    user: 'Admin',
    device: 'Light System',
    action: 'OFF',
    status: 'Success',
  },
  {
    id: 293,
    time: '2026-09-16T23:30:00',
    user: 'Pham Bao Loc',
    device: 'Light System',
    action: 'OFF',
    status: 'Failed',
  },
  {
    id: 292,
    time: '2026-09-16T23:30:00',
    user: 'Admin',
    device: 'Light System',
    action: 'ON',
    status: 'Success',
  },
  {
    id: 291,
    time: '2026-09-16T23:30:00',
    user: 'Pham Bao Loc',
    device: 'Light System',
    action: 'ON',
    status: 'Success',
  },
];

// Giữ nguyên giờ hiển thị trong mẫu, không phụ thuộc múi giờ của máy chạy.
function earlierTime(start, index, intervalMinutes) {
  // Gắn Z để Date.parse hiểu đầu vào theo UTC, tránh lệch khi máy phát triển dùng múi giờ khác.
  // index=0 giữ mốc start; mỗi index tiếp theo lùi thêm intervalMinutes phút.
  const timestamp = Date.parse(`${start}Z`) - index * intervalMinutes * 60_000;
  // toISOString luôn xuất UTC; cắt 19 ký tự giữ YYYY-MM-DDTHH:mm:ss như định dạng mẫu ban đầu.
  return new Date(timestamp).toISOString().slice(0, 19);
}

// Thông số nền và biên độ để sinh số đo mô phỏng cho ba loại cảm biến.
const sensorTypes = [
  { type: 'Temperature', unit: '°C', base: 28, amplitude: 4 },
  { type: 'Humidity', unit: '%', base: 64, amplitude: 12 },
  { type: 'Light', unit: 'lux', base: 650, amplitude: 350 },
];

// Ghép 8 dòng gốc với 112 dòng sinh thêm = 120 dòng. Hàm sin tạo dao động cố định, không đổi khi tải lại.
export const sensorRows = [
  ...originalSensorRows,
  ...Array.from({ length: 112 }, (_, index) => {
    // Phép chia dư luân phiên ba loại: index 0/3/6 là nhiệt độ, 1/4/7 là độ ẩm, 2/5/8 là ánh sáng.
    const sensor = sensorTypes[index % sensorTypes.length];
    return {
      id: 32186 - index,
      time: earlierTime('2024-05-18T14:15:00', index, 15),
      type: sensor.type,
      // sin nằm trong [-1,1]: giá trị dao động quanh base trong biên amplitude.
      // toFixed(1) làm tròn một chữ số và trả string; Number đổi lại thành số để định dạng/tìm kiếm.
      value: Number(
        (sensor.base + Math.sin(index * 0.47) * sensor.amplitude).toFixed(1),
      ),
      unit: sensor.unit,
    };
  }),
];

const devices = ['Fan', 'AC', 'Light System'];

// Ghép 10 dòng gốc với 113 dòng sinh thêm = 123 dòng, gồm cả trạng thái Pending để thử bộ lọc Đang xử lý.
export const historyRows = [
  ...originalHistoryRows,
  ...Array.from({ length: 113 }, (_, index) => ({
    id: 290 - index,
    time: earlierTime('2026-09-16T23:00:00', index, 30),
    user: index % 2 === 0 ? 'Pham Bao Loc' : 'Admin',
    device: devices[index % devices.length],
    // Đảo ON/OFF sau mỗi nhóm ba thiết bị; index%7 tạo định kỳ một bản ghi thất bại để thử bộ lọc.
    action: Math.floor(index / devices.length) % 2 === 0 ? 'ON' : 'OFF',
    status: index % 7 === 0 ? 'Failed' : 'Success',
  })),
];
