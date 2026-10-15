# Smart Home

Hệ thống IoT sử dụng ESP32, MQTT, Spring Boot, MySQL và React.

## Cấu trúc

- `backend/`: Backend Spring Boot, REST API, MQTT và WebSocket.
- `frontend/`: Giao diện React/Vite.
- `backend/docs/LUONG-CHAY-BAO-CAO.md`: Tài liệu luồng hoạt động.

## Chạy trên Windows

Khởi động MySQL và Mosquitto, kiểm tra cấu hình kết nối của Backend.

Terminal Backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Terminal Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Frontend sử dụng proxy phát triển để gọi Backend ở cổng 8080.
Chương trình ESP32 hiện được quản lý riêng, chưa nằm trong repository này.

## Cập nhật trạng thái lệnh (15/10/2026)

Lịch sử lệnh chỉ còn `PENDING`, `SUCCESS`, `ERROR`. Lệnh quá thời gian chờ cũng
chuyển sang `ERROR`; scheduler vẫn hoạt động để không để lệnh chờ vô hạn.
Với database từ phiên bản trước, dừng Backend và chạy
`backend/docs/migrations/2026-10-15-command-error.sql` trên database ứng dụng
trước khi khởi động bản mới. Script giữ nguyên ID và thông tin lịch sử,
chỉ chuyển trạng thái cũ sang `ERROR`.

## Lịch sử Git

Repository này nhập nhánh `main` từ hai repository bằng `git subtree add`, không squash:

- https://github.com/locpham2306/SmartHome-Backend (commit `078484b`)
- https://github.com/locpham2306/SmartHome-Frontend (commit `065d063`)

Các commit gốc giữ nguyên mã định danh. Trong commit cũ, đường dẫn file vẫn là đường dẫn trước khi nhập; từ commit nhập, code nằm trong `backend/` và `frontend/`.
Các nhánh khác và tag của repository cũ chưa được nhập.
Hai repository cũ không bị thay đổi và không tự đồng bộ với repository này.

Khi tiếp tục phát triển ở đây, thực hiện commit và push từ repository SmartHome.
