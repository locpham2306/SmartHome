# IoT Hub

Frontend nhà thông minh sử dụng React 18, Vite 6 và Bootstrap 5.
Giao diện tiếng Việt, chuyển trang bằng URL hash; icon và biểu đồ được vẽ bằng SVG.

## Chạy dự án

Sử dụng Node.js 22.12+ hoặc Node.js 24, chạy tại thư mục chứa `package.json`:

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal. Không mở `index.html` bằng Live Server.
Chạy backend ở `http://localhost:8080`, rồi mở frontend tại `http://localhost:5173`.
Vite chuyển tiếp `/api` và WebSocket `/ws` sang backend; nếu vừa thêm hoặc sửa
`vite.config.js`, cần khởi động lại `npm run dev`.

```bash
npm run build        # Tạo bản build trong dist/
npm run preview      # Xem bản build
npm run format       # Format mã nguồn và tài liệu
npm run format:check # Kiểm tra định dạng
```

## Cấu trúc

```text
src/
  components/       # Icon, phân trang, bảng cuộn, biểu đồ SVG
  constants/        # Nhãn tiếng Việt cho cảm biến, thiết bị, trạng thái
  data/             # Dữ liệu mẫu cho bảng và biểu đồ
  pages/            # Dashboard, DataSensor, History, Profile
  styles/
    common.css      # CSS chung: bố cục, bộ lọc, bảng, phân trang
    dashboard.css   # Màn Tổng quan
    data-sensor.css # Màn Dữ liệu cảm biến
    history.css     # Màn Lịch sử
    profile.css     # Màn Hồ sơ
  utils/            # Tìm kiếm, sắp xếp, phân trang và định dạng cảm biến
  App.jsx           # Sidebar, header và chuyển trang
  main.jsx          # Khởi tạo React, import Bootstrap và CSS
```

`node_modules/` chứa các thư viện đã cài; `dist/` được tạo lại khi build.
Cả hai được bỏ qua bởi Git và Prettier.

## Chức năng hiện tại

- **Tổng quan:** thẻ số liệu, thanh gradient, biểu đồ SVG và công tắc thiết bị.
  Bật quạt có hiệu ứng xoay, đèn phát sáng, điều hòa có luồng gió.
- **Dữ liệu cảm biến:** tìm theo tiêu chí và nội dung, sắp xếp thời gian giảm dần,
  mặc định 20 bản ghi/trang. Nhấn Tìm kiếm hoặc Enter để áp dụng.
- **Lịch sử:** tìm theo thời gian, lọc thiết bị, thao tác và trạng thái;
  mặc định 20 bản ghi/trang. Bộ lọc áp dụng ngay khi thay đổi.
- **Bảng:** tiêu đề cố định, vùng dữ liệu cuộn riêng và phân trang bên dưới.
  Có thể chọn 5, 10, 15, 20, 30 hoặc 50 bản ghi/trang.
- **Hồ sơ:** thông tin liên hệ và các thẻ tài liệu. Các thẻ chưa có URL được
  hiển thị với ghi chú “Chưa có liên kết”. Avatar sử dụng chữ viết tắt BL.

## Dữ liệu và tích hợp

Ba thẻ cảm biến trên Tổng quan đã nối backend:
- Tải số đo ban đầu bằng `GET /api/sensors/latest`.
- Nhận cập nhật qua STOMP WebSocket `/ws`, đăng ký `/topic/sensors`.
- Hiển thị cảnh báo LOW/NORMAL/HIGH/UNKNOWN do backend đánh giá.
- Tự kết nối lại, tải lại số đo sau khi kết nối; có nút thử lại khi tải lỗi.

Proxy này dùng cho môi trường phát triển. Khi triển khai bản build, máy chủ
cần chuyển tiếp `/api` và `/ws` tới backend, hỗ trợ WebSocket upgrade.

Trang Dữ liệu cảm biến tải `GET /api/sensors` với `pageRequest.*` và
`searchRequest.*`. Tìm kiếm, lọc ngày và phân trang được thực hiện tại backend;
không chọn ngày thì bỏ hai tham số ngày. Nhấn Tìm kiếm/Enter để tải kết quả,
kể cả khi giữ nguyên điều kiện; Xóa đặt lại bộ lọc. Có trạng thái đang tải,
lỗi kèm nút thử lại và thông báo danh sách rỗng.

Trang Lịch sử tải `GET /api/action-history`, lọc theo thời gian, thiết bị,
ON/OFF và PENDING/SUCCESS/ERROR/TIMEOUT. Backend phân trang, sắp xếp
`createdAt` giảm dần và trả tên người điều khiển trong trường `operator`.
Các bộ lọc tự áp dụng sau 300 ms; request cũ bị hủy khi đổi điều kiện.
Lịch sử tải khi mở trang hoặc đổi bộ lọc, chưa tự cập nhật qua WebSocket.

Điều khiển thiết bị lấy danh sách và trạng thái từ `GET /api/devices`, gửi
`POST /api/devices/{id}/control?action=ON|OFF`, rồi nhận kết quả từ
`/topic/devices`. Nút chờ khi lệnh đang xử lý; trạng thái bật/tắt chỉ đổi theo
kết quả backend xác nhận. ERROR/TIMEOUT hiển thị thông báo riêng.
“Bật/Tắt tất cả” gửi từng lệnh cho các thiết bị cần thay đổi, theo dõi kết quả
riêng từng thiết bị (không phải một giao dịch bật/tắt đồng thời).

Luồng thiết bị dùng kết nối STOMP riêng và khóa thao tác khi mất kết nối.
Khi mở trang hoặc kết nối lại, FE đọc thêm lệnh gần nhất của từng thiết bị từ
`/api/action-history`. Khi có lệnh đang chờ, FE đối chiếu lại mỗi 5 giây để
khôi phục kết quả nếu bỏ lỡ WebSocket; không tự gửi lại lệnh điều khiển.

Biểu đồ tải `GET /api/sensors/chart?type=Temperature|Humidity|Light&limit=100`
cho từng cảm biến (backend mặc định lấy lịch sử 1 giờ gần nhất), rồi cập nhật
từ cùng kết nối `/topic/sensors` với ba thẻ số đo. Mỗi cảm biến giữ tối đa 100
điểm, sắp xếp theo thời gian thực và loại điểm trùng thời gian. Sau khi kết nối
lại, biểu đồ tải lại lịch sử và giữ các điểm realtime mới đến trong lúc tải.
`SensorChart.jsx` vẽ SVG với thang đo tự điều chỉnh, hỗ trợ rê chuột hoặc phím
mũi tên xem số đo. Danh sách rỗng và lỗi tải có thông báo riêng.

`utils/sensorSearch.js` tạo điều kiện tìm kiếm cho trang Dữ liệu cảm biến;
`useSensorSearch` tải trang từ API và hủy request cũ khi đổi điều kiện.

# SmartHome-Frontend
