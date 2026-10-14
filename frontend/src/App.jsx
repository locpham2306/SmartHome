import React, { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import DataSensor from './pages/DataSensor';
import History from './pages/History';
import Profile from './pages/Profile';
import Icon from './components/Icon';
import avatar from './assets/avatar.png';

const pages = {
  dashboard: 'Tổng quan',
  data: 'Dữ liệu cảm biến',
  history: 'Lịch sử',
  profile: 'Hồ sơ',
};

function currentPage() {
  const key = window.location.hash.slice(1);
  return pages[key] ? key : 'dashboard';
}
export default function App() {
  const [page, setPage] = useState(currentPage);

  const [menuOpen, setMenuOpen] = useState(
    () => window.matchMedia('(min-width: 768px)').matches,
  );
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const resizeMenu = (event) => setMenuOpen(event.matches);
    desktop.addEventListener('change', resizeMenu);
    return () => desktop.removeEventListener('change', resizeMenu);
  }, []);
  // Đồng bộ giao diện khi bấm menu hoặc nút Back/Forward của trình duyệt, đồng thời đóng menu mobile (hiểu đơn giản là đổi trang)
  useEffect(() => {
    const changePage = () => {
      setPage(currentPage());
      if (!window.matchMedia('(min-width: 768px)').matches) {
        setMenuOpen(false);
      }
    };
    // hashchange xử lý cả link nội bộ lẫn Back/Forward
    window.addEventListener('hashchange', changePage);
    return () => window.removeEventListener('hashchange', changePage);
  }, []);
  useEffect(() => {
    // Tên tab trình duyệt thay đổi theo màn đang mở (đổi tên tab)
    document.title = pages[page] + ' - IoT Hub';
    // Chỉ effect đặt tên tab chạy lại khi page đổi; effect lắng nghe hash phía trên chỉ gắn một lần ([]).
  }, [page]);
  return (
    <div
      // Class theo màn cho phép CSS chọn layout có bảng hoặc hồ sơ; không phải URL/path trên server.
      className={
        'app-layout ' +
        (menuOpen ? 'menu-open ' : 'menu-closed ') +
        (page === 'dashboard'
          ? 'dashboard-view'
          : page === 'data'
            ? 'sensor-view table-view'
            : page === 'history'
              ? 'sensor-view history-view table-view'
              : 'sensor-view profile-view')
      }
    >
      {/* Menu bên trái: avatar, tên ứng dụng và bốn liên kết; active đánh dấu màn hiện tại. */}
      <aside
        id="main-sidebar"
        className={'sidebar ' + (menuOpen ? 'is-open' : '')}
      >
        <a className="brand" href="#dashboard">
          <img
            className="brand-avatar"
            src={avatar}
            alt="Ảnh đại diện Phạm Bảo Lộc"
          />
          <span>
            IoT Hub<small>Nhà thông minh</small>
          </span>
        </a>
        <nav className="nav flex-column gap-2" aria-label="Điều hướng chính">
          {/* Object.entries tạo cặp [key,title]; href đổi hash nên không tải lại toàn bộ trang.
              active tô nền link đang mở; aria-current cung cấp thông tin tương đương cho trợ năng. */}
          {Object.entries(pages).map(([key, title]) => (
            <a
              key={key}
              href={'#' + key}
              className={'nav-link ' + (page === key ? 'active' : '')}
              aria-current={page === key ? 'page' : undefined}
            >
              <Icon name={key} />
              <span>{title}</span>
            </a>
          ))}
        </nav>
      </aside>
      <div className="main-layout">
        {/* Nút menu luôn hiện để thu vào hoặc mở ra ở mọi kích thước màn. */}
        <header className="topbar">
          <button
            type="button"
            className="btn btn-outline-secondary menu-toggle"
            // Đảo trạng thái menu; aria-expanded đồng bộ trạng thái và aria-controls trỏ đúng id sidebar.
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="main-sidebar"
            aria-label={menuOpen ? 'Thu gọn menu' : 'Mở menu'}
            title={menuOpen ? 'Thu gọn menu' : 'Mở menu'}
          >
            <Icon name={menuOpen ? 'previous' : 'menu'} />
          </button>
          <div>
            <h1>{pages[page]}</h1>
          </div>
          {/* Chỉ màn Dữ liệu có nhãn nguồn dữ liệu mẫu */}
          {page === 'data' && (
            <span className="sensor-online">
              <i />
              Dữ liệu đã lưu
            </span>
          )}
        </header>
        {/* Màn đang được chọn */}
        <main className="page-content">
          {/* Giữ Dashboard mounted và chỉ ẩn để bảo toàn công tắc/timer khi chuyển màn.
              Ba màn còn lại được tạo lại khi mở, nên bộ lọc trở về giá trị mặc định. */}
          <div hidden={page !== 'dashboard'}>
            <Dashboard />
          </div>
          {page === 'data' && <DataSensor />}
          {page === 'history' && <History />}
          {page === 'profile' && <Profile />}
        </main>
      </div>
    </div>
  );
}
