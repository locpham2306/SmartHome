// FILE NÀY DỊCH MÃ TRONG DỮ LIỆU THÀNH CHỮ ĐỂ HIỆN TRÊN MÀN.
// Ví dụ deviceLabels["Fan"] trả về "Quạt". Fan là tên dùng trong xử lý, Quạt là chữ người dùng thấy.

// Ánh xạ mã dữ liệu sang nhãn tiếng Việt để các bộ lọc, bảng và điều khiển dùng cùng cách gọi.
// Giữ nguyên key tiếng Anh vì dữ liệu và các phép lọc so sánh theo key; chỉ value là chữ xuất hiện trên màn.
// Thêm nhãn ở đây chưa tự thêm loại dữ liệu hay icon: phần cấu hình tương ứng nằm ở các màn/data.
export const sensorLabels = {
  Light: 'Ánh sáng',
  Humidity: 'Độ ẩm',
  Temperature: 'Nhiệt độ',
  'Light System': 'Hệ thống đèn',
};
// Light và Light System cùng chỉ đèn nhưng xuất hiện ở các bộ dữ liệu mẫu khác nhau.
export const deviceLabels = {
  'Fan System': 'Quạt',
  'Air Condition System': 'Điều hòa',
  Fan: 'Quạt',
  AC: 'Điều hòa',
  Light: 'Đèn',
  'Light System': 'Hệ thống đèn',
};
// Nhãn kết quả hiển thị trong bảng lịch sử; màu và icon do History.jsx/history.css quyết định.
// Ví dụ row.status="Success" được hiện thành Thành công; giá trị dùng trong select vẫn là Success.
export const statusLabels = {
  SUCCESS: 'Thành công',
  ERROR: 'Thất bại',
  PENDING: 'Đang xử lý',
  TIMEOUT: 'Hết thời gian chờ',
  Success: 'Thành công',
  Failed: 'Thất bại',
  Pending: 'Đang xử lý',
};
