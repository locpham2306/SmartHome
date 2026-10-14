// ĐỌC FILE NÀY NHƯ BƯỚC MỞ ỨNG DỤNG.
// Nạp React và các file CSS, sau đó đặt <App /> vào ô trống có id="root" trong index.html.
// App sẽ dựng menu và màn đầu tiên. Thứ tự import CSS quan trọng vì kiểu viết sau có thể thay kiểu trước.

// ĐIỂM KHỞI ĐỘNG FRONTEND
// index.html tải file này dưới dạng module. React mô tả UI bằng JSX, createRoot quản lý render vào DOM.
// CSS import ở đây được Vite gom khi build; tất cả màn dùng chung một bản Bootstrap.
import React from 'react';
import {
  // Gắn cây React vào #root trong index.html; App quản lý menu và màn đang hiển thị.
  createRoot,
} from 'react-dom/client';
// Nạp Bootstrap trước, rồi CSS chung và CSS từng màn để các quy tắc của dự án ghi đè đúng thứ tự.
import 'bootstrap/dist/css/bootstrap.min.css';
// common.css chứa khung ứng dụng và phần dùng lại; bốn file sau chứa quy tắc riêng từng màn.
// Thứ tự import ảnh hưởng cascade khi hai selector có cùng độ ưu tiên; tránh đảo thứ tự tùy ý.
import './styles/common.css';
import './styles/dashboard.css';
import './styles/data-sensor.css';
import './styles/history.css';
import './styles/profile.css';
import App from './App';

// document.getElementById tìm div#root trong index.html; render khởi tạo cây component App.
// Sau đó các setter useState giúp React cập nhật giao diện liên quan mà không tải lại trang.
createRoot(document.getElementById('root')).render(<App />);
