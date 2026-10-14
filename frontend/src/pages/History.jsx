import { deviceLabels, statusLabels } from '../constants/labels';
import React, { useEffect, useState } from 'react';
import useHistorySearch from '../hooks/useHistorySearch';
import Pagination from '../components/Pagination';
import Icon from '../components/Icon';
import ScrollableTable from '../components/ScrollableTable';
import FilterSelect from '../components/FilterSelect';

// Lấy lịch sử đã lưu từ BE; đổi bộ lọc sẽ tải lại danh sách.
export default function History() {
  // useState là cách React nhớ giá trị đang chọn.
  // Ví dụ [device, setDevice]: đọc device để biết đang lọc thiết bị nào; gọi setDevice để đổi thiết bị.
  // Khi gọi một hàm set..., React chạy lại History, lọc lại danh sách rồi cập nhật bảng.
  // Nội dung ô tìm thời gian. Chuỗi rỗng khớp mọi bản ghi vì includes('') luôn true.
  const [query, setQuery] = useState('');
  // Mã thiết bị đang lọc, ví dụ Fan/AC/Light System; all bỏ điều kiện thiết bị.
  const [device, setDevice] = useState('all');
  // Thao tác đang lọc: ON hoặc OFF; all cho phép cả hai.
  const [action, setAction] = useState('all');
  // Trạng thái BE: SUCCESS, ERROR, PENDING hoặc TIMEOUT; all không giới hạn.
  const [status, setStatus] = useState('all');
  // Số dòng/trang, mặc định 20; độc lập với tổng số bản ghi sau lọc.
  const [size, setSize] = useState(20);
  // Trang đang xem bắt đầu từ 1; đổi bất kỳ bộ lọc nào cũng reset về 1.
  const [page, setPage] = useState(1);

  const devices = ['Fan System', 'Air Condition System', 'Light System'];
  const { rows, total, totalPages, loading, error, retry } = useHistorySearch({
    page,
    size,
    time: query,
    device,
    action,
    status,
  });
  useEffect(() => {
    if (!loading && !error && page > Math.max(1, totalPages)) {
      setPage(Math.max(1, totalPages));
    }
  }, [loading, error, page, totalPages]);

  return (
    <div className="history-page">
      {/* Ô tìm thời gian và ba dropdown: thiết bị, thao tác, kết quả thực thi. */}
      <div className="sensor-toolbar history-toolbar">
        {/* Ô tìm trong thời gian */}
        <div className="sensor-input-wrap history-search">
          <Icon name="search" />
          <input
            className="form-control search-input"
            aria-label="Tìm theo thời gian"
            placeholder="Tìm theo thời gian..."
            value={query}
            maxLength={100}
            onChange={(event) => {
              // Lấy chữ vừa gõ vào ô thời gian. query đổi → tính lại rows → bảng đổi ngay.
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        {/* lọc thiết bị */}
        <FilterSelect
          label="Lọc theo thiết bị"
          value={device}
          options={[
            { value: 'all', label: 'Tất cả thiết bị' },
            ...devices.map((name) => ({
              value: name,
              label: deviceLabels[name] || name,
            })),
          ]}
          onChange={(value) => {
            setDevice(value);
            setPage(1);
          }}
        />
        {/* lọc thao tác */}
        <FilterSelect
          label="Lọc theo thao tác"
          value={action}
          options={[
            { value: 'all', label: 'Tất cả thao tác' },
            { value: 'ON', label: 'Bật' },
            { value: 'OFF', label: 'Tắt' },
          ]}
          onChange={(value) => {
            setAction(value);
            setPage(1);
          }}
        />
        {/* lọc trạng thái */}
        <FilterSelect
          label="Lọc theo trạng thái"
          value={status}
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'SUCCESS', label: statusLabels.SUCCESS },
            { value: 'ERROR', label: statusLabels.ERROR },
            { value: 'PENDING', label: statusLabels.PENDING },
            { value: 'TIMEOUT', label: statusLabels.TIMEOUT },
          ]}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </div>
      <section
        className="panel sensor-table-panel history-table-panel"
        aria-label="Lịch sử thiết bị"
        aria-busy={loading}
      >
        {/* tạo bảng 6 cột */}
        <ScrollableTable
          className="table history-table align-middle mb-0"
          columns={[8, 22, 22, 19, 13, 16]}
        >
          {/* Tỉ lệ cột theo thứ tự: Mã 8%, Thời gian 22%, Người điều khiển 22%, Thiết bị 19%, Thao tác 13%, Trạng thái 16%.
              Mảng nhãn tạo sáu th bằng map; scope=col giúp liên kết tiêu đề với nội dung cột. */}
          <thead>
            <tr>
              {[
                'MÃ',
                'THỜI GIAN',
                'NGƯỜI ĐIỀU KHIỂN',
                'THIẾT BỊ',
                'THAO TÁC',
                'TRẠNG THÁI',
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody tabIndex={0} aria-label="Các bản ghi lịch sử">
            {/* Badge thao tác và kết quả có màu riêng; nhãn tiếng Việt lấy từ constants/labels. */}
            {/* tạo nội dung bằng map */}
            {rows.map((row) => (
              <tr key={row.id}>
                {/* key={row.id} nhận diện dòng trong React; fw-semibold làm mã hơi đậm, text-nowrap giữ thời gian trên một dòng. */}
                <td className="fw-semibold">{row.id}</td>
                <td className="text-nowrap">
                  {row.time?.replace('T', ' ') || '—'}
                </td>
                {/* Nếu user rỗng/null/undefined thì dùng Chưa xác định; CSS cho phép tên dài ngắt dòng. */}
                <td className="history-operator">
                  {row.operator || 'Chưa xác định'}
                </td>
                <td>
                  <span
                    className="history-device"
                    data-device={
                      row.device === 'Fan System'
                        ? 'Fan'
                        : row.device === 'Air Condition System'
                          ? 'AC'
                          : row.device
                    }
                  >
                    <span className="history-device-icon">
                      {/* Chọn hình quạt cho Fan, điều hòa cho AC; các mã còn lại ở dữ liệu mẫu dùng hình đèn. */}
                      <Icon
                        name={
                          row.device === 'Fan System'
                            ? 'fan'
                            : row.device === 'Air Condition System'
                              ? 'ac'
                              : 'light'
                        }
                      />
                    </span>
                    {/* Tra nhãn tiếng Việt theo mã; nếu chưa có nhãn thì giữ mã gốc để ô không bị trống. */}
                    {deviceLabels[row.device] || row.device}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      // Class ON tạo nền xanh, OFF tạo nền vàng; đổi màu không làm thay đổi row.action.
                      'history-action ' +
                      (row.action === 'ON' ? 'action-on' : 'action-off')
                    }
                  >
                    <Icon name="power" />
                    {row.action === 'ON' ? 'Bật' : 'Tắt'}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      // Đang xử lý dùng nền vàng và icon lịch sử.
                      'status-badge ' +
                      (row.status === 'SUCCESS'
                        ? 'success'
                        : row.status === 'PENDING'
                          ? 'pending'
                          : row.status === 'TIMEOUT'
                            ? 'timeout'
                            : 'failed')
                    }
                  >
                    <Icon
                      name={
                        row.status === 'SUCCESS'
                          ? 'check'
                          : row.status === 'PENDING'
                            ? 'history'
                            : row.status === 'TIMEOUT'
                              ? 'history'
                              : 'close'
                      }
                    />
                    {statusLabels[row.status] || row.status}
                  </span>
                </td>
              </tr>
            ))}
            {/* Không có kết quả thì một ô colSpan=6 phủ toàn bộ cột; footer vẫn hiện 0–0 trên 0 bản ghi. */}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-secondary py-5">
                  <div role="status">
                    {loading
                      ? 'Đang tải lịch sử…'
                      : error || 'Không có hoạt động phù hợp.'}
                  </div>
                  {error && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={retry}
                    >
                      Thử lại
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </ScrollableTable>
        {/* Tổng bản ghi và phân trang do backend trả về. */}
        {!loading && !error && (
          <Pagination
            page={page}
            size={size}
            total={total}
            // Chọn số trang chỉ thay page; toàn bộ bộ lọc đang chọn vẫn giữ nguyên.
            onChange={setPage}
            onSizeChange={(value) => {
              // Đổi số dòng rồi quay về trang đầu, tránh giữ page lớn hơn số trang mới.
              setSize(value);
              setPage(1);
            }}
          />
        )}
      </section>
    </div>
  );
}
