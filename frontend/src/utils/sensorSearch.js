// FILE NÀY XỬ LÝ TÌM KIẾM, KHÔNG VẼ GIAO DIỆN.
// DataSensor.jsx đưa danh sách và điều kiện vào, file này trả về các dòng phù hợp.
// filter = giữ các dòng đúng điều kiện; sort = đổi thứ tự; slice = lấy một đoạn để hiện một trang.
// Ví dụ chọn Nhiệt độ, nhập 29: bỏ loại khác trước, tìm số/chữ chứa 29, xếp mới nhất trước rồi lấy một trang.

import { sensorLabels } from '../constants/labels.js';

// Chuẩn hóa tên: bỏ khoảng trắng hai đầu, chữ hoa và dấu tiếng Việt để nhận diện tên cảm biến.
function normalizeSensorName(name) {
  // Ví dụ " Độ ẩm " → "độ ẩm" → tách ký tự/dấu theo NFD → "đo am" → "do am".
  // Chỉ dùng cách bỏ dấu này để nhận diện tên loại đầy đủ, không áp dụng cho toàn bộ tìm kiếm chuỗi con.
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

// Tạo tham số tìm kiếm/phân trang gửi lên API.
export function buildSensorSearchParams({
  page = 1,
  size = 20,
  field = 'all',
  keywords = '',
  startDate = '',
  endDate = '',
} = {}) {
  // Trim không sửa query trên ô nhập; nó chỉ làm sạch tham số truyền vào hàm tìm kiếm.
  const trimmedKeywords = keywords.trim();
  // Khi chọn Tất cả, tên loại đầy đủ (Việt/Anh, có/không dấu) chuyển thành lọc loại; không đổi ô nhập.
  // find trả về mã đầu tiên có tên khớp; some thử cả mã tiếng Anh lẫn nhãn tiếng Việt.
  // Ví dụ field=all, keywords="nhiet do" → sensorType="Temperature". Từ "nhiet" không khớp tên đầy đủ.
  const sensorType =
    field === 'all' &&
    ['Temperature', 'Humidity', 'Light'].find((type) =>
      [type, sensorLabels[type]].some(
        (name) =>
          normalizeSensorName(name) === normalizeSensorName(trimmedKeywords),
      ),
    );
  return {
    pageRequest: { page, size, sortBy: 'time', sortDir: 'desc' },
    searchRequest: {
      startDate,
      endDate,
      field: sensorType || field,
      // Khi đã nhận diện loại, xóa keyword để không bắt số đo phải chứa chính tên loại đó.
      keywords: sensorType ? '' : trimmedKeywords,
    },
  };
}

// Lọc trên toàn bộ dữ liệu rồi mới phân trang, tránh bỏ sót kết quả nằm ngoài trang hiện tại.
export function searchSensorRows(source, { pageRequest, searchRequest }) {
  const { page, size } = pageRequest;
  const { field, keywords, startDate, endDate } = searchRequest;
  const keyword = keywords.trim().toLowerCase();
  // filter tạo mảng mới; sort phía sau chỉ sắp xếp mảng kết quả, không sửa source gốc.
  const matches = source
    .filter((row) => {
      if (startDate || endDate) {
        const date = row.time?.slice(0, 10);
        if (!date || (startDate && date < startDate) || (endDate && date > endDate))
          return false;
      }
      if (field !== 'all' && field !== 'time' && row.type !== field)
        return false;
      // Tìm được cả thời gian dạng ISO và dạng có dấu cách đang hiển thị trong bảng.
      const times =
        row.time == null ? [] : [row.time, formatSensorTime(row.time)];
      // Cho phép tìm mã bằng "32194" hoặc "#32194", đúng cả hai cách người dùng có thể nhập.
      const ids = row.id == null ? [] : [row.id, `#${row.id}`];
      // Danh sách trường được thử theo tiêu chí:
      // all: mã, thời gian, mã loại, giá trị; time: chỉ thời gian; loại cụ thể: mã, giá trị, thời gian sau khi lọc loại.
      // Không thêm unit vào danh sách, nên từ khóa "lux" không phải cách tìm giá trị có đơn vị.
      const values =
        field === 'all'
          ? [...ids, ...times, row.type, row.value]
          : field === 'time'
            ? times
            : [...ids, row.value, ...times];
      // Chỉ cần một trường chứa từ khóa là giữ dòng. String cho phép so sánh cả số và chữ; ?? giữ số 0.
      // includes("") trả true nên ô nhập rỗng vẫn hiện mọi dòng thuộc loại đang chọn.
      return values.some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(keyword),
      );
    })
    // Sắp xếp thời gian mới trước; giá trị thời gian thiếu xuống cuối, cùng thời gian thì xét mã.
    .sort((a, b) => {
      if (a.time == null) return b.time == null ? 0 : 1;
      if (b.time == null) return -1;
      return Date.parse(b.time) - Date.parse(a.time) || b.id - a.id;
    });
  return {
    // Trang 1/size20: slice(0,20); trang 2: slice(20,40). total không bị cắt theo trang.
    rows: matches.slice((page - 1) * size, page * size),
    total: matches.length,
  };
}

// Ghép số đo và đơn vị cho ô GIÁ TRỊ; giá trị thiếu hiện gạch ngang, số 0 vẫn được giữ.
export function formatSensorValue(value, unit) {
  return value == null ? '—' : `${value}${unit ? ` ${unit}` : ''}`;
}

// Đổi dấu T thành khoảng trắng cho dễ đọc, không chuyển múi giờ của chuỗi mẫu.
// Ví dụ "2024-05-18T14:32:01" thành "2024-05-18 14:32:01"; dữ liệu null/undefined thành —.
export function formatSensorTime(time) {
  return time == null ? '—' : time.replace('T', ' ');
}
