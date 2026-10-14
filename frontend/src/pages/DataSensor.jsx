import { sensorLabels } from '../constants/labels';
import React, { useEffect, useRef, useState } from 'react';
import useSensorSearch from '../hooks/useSensorSearch';
import {
  buildSensorSearchParams,
  formatSensorValue,
  formatSensorTime,
} from '../utils/sensorSearch';
import Pagination from '../components/Pagination';
import Icon from '../components/Icon';
import ScrollableTable from '../components/ScrollableTable';
import FilterSelect from '../components/FilterSelect';
import DateRangeCalendar from '../components/DateRangeCalendar';

// Ánh xạ loại cảm biến sang màu và icon trong cột laoai cam bien
const sensorStyles = {
  Light: { className: 'sensor-light', icon: 'sun' },
  Humidity: { className: 'sensor-humidity', icon: 'humidity' },

  Temperature: { className: 'sensor-system', icon: 'temperature' },
};

export default function DataSensor() {
  // useState giúp React nhớ một giá trị giữa các lần cập nhật giao diện.
  // [field, setField]: field là giá trị đang nhớ; setField(...) là hàm đổi giá trị đó.
  // useState('all') nghĩa là lúc mở màn, field = 'all', nên ô chọn hiện "Tất cả".
  // Chọn "Nhiệt độ" sẽ gọi setField('Temperature'). Bảng chưa đổi cho tới khi bấm Tìm kiếm.
  const [field, setField] = useState('all');
  // query nhớ chữ đang nằm trong ô nhập. '' là chuỗi rỗng, tức ô chưa có nội dung.
  // Gõ "29" → setQuery("29") → query thành "29" → ô nhập hiển thị "29".
  const [query, setQuery] = useState('');
  // search nhớ điều kiện đã bấm Tìm kiếm. Ví dụ: { field: "Temperature", query: "29" }.
  // Bảng đọc search, không đọc trực tiếp query. Vì vậy gõ tiếp "30" vẫn chưa làm bảng đổi.
  const [search, setSearch] = useState({ field: 'all', query: '' });
  // size = số dòng muốn xem trên một trang. Ban đầu là 20, đổi được ở ô "20 / trang".
  const [size, setSize] = useState(20);
  // page = trang đang xem. setPage(2) nghĩa là chuyển bảng sang trang 2.
  const [page, setPage] = useState(1);
  const dateDialog = useRef(null);
  const [calendarVersion, setCalendarVersion] = useState(0);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [draftDates, setDraftDates] = useState({ startDate: '', endDate: '' });
  const hasDateRange = !!dateRange.startDate;

  function applyDateRange(event) {
    event.preventDefault();
    if (
      !draftDates.startDate ||
      !draftDates.endDate ||
      draftDates.startDate > draftDates.endDate
    )
      return;
    setDateRange({ ...draftDates });
    setPage(1);
    dateDialog.current.close();
  }

  function clearDateRange() {
    setDateRange({ startDate: '', endDate: '' });
    setDraftDates({ startDate: '', endDate: '' });
    setPage(1);
  }
  // Gom các lựa chọn thành một gói dữ liệu tên params để hàm tìm kiếm phía dưới sử dụng.
  // field: search.field nghĩa là lấy tiêu chí đã xác nhận, không lấy lựa chọn đang sửa dở.
  const params = buildSensorSearchParams({
    page,
    size,
    field: search.field,
    keywords: search.query,
    ...dateRange,
  });

  // rows chỉ gồm các bản ghi của trang hiện tại; total đếm tất cả kết quả phù hợp.
  // Ví dụ có 47 kết quả, size=20, page=2: rows có 20 phần tử nhưng total vẫn là 47.
  const { rows, total, totalPages, loading, error, retry } =
    useSensorSearch(params);
  useEffect(() => {
    if (!loading && !error && page > Math.max(1, totalPages)) {
      setPage(Math.max(1, totalPages));
    }
  }, [loading, error, page, totalPages]);
  const today = new Date();
  const calendarDate =
    rows[0]?.time?.slice(0, 10) ||
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Hàm này chạy khi bấm "Tìm kiếm" hoặc nhấn Enter trong ô nhập.
  function submitSearch(event) {
    // Không cho form điều hướng/tải lại trang vì việc lọc diễn ra ngay trong React.
    event.preventDefault();
    // Chép lựa chọn/ô nhập vào search. { field, query } viết gọn của { field: field, query: query }.
    // Bộ lọc đã xác nhận được gửi lên API; gõ thêm chưa thay đổi bảng.
    setSearch({ field, query });
    retry();
    // Kết quả mới có thể ít trang hơn; không giữ trang cũ vì có thể nằm ngoài danh sách.
    setPage(1);
  }

  // Nút Xóa đặt lại cả ô nhập và bộ lọc đang áp dụng, giữ nguyên số dòng mỗi trang.
  function clearSearch() {
    clearDateRange();
    setField('all');
    setQuery('');
    setSearch({ field: 'all', query: '' });
    retry();
    setPage(1);
  }

  return (
    <div className="sensor-page">
      {/* Bộ lọc: chọn tiêu chí, nhập từ khóa, tìm kiếm và xóa. Icon trong ô được CSS chừa khoảng trống. */}
      <form
        className="sensor-toolbar sensor-search-toolbar"
        role="search"
        aria-label="Tìm dữ liệu cảm biến"
        onSubmit={submitSearch}
      >
        {/* Chọn tiêu chí chỉ cập nhật bản nháp; bấm Tìm kiếm mới lọc bảng. */}
        <div className="sensor-input-wrap sensor-field-select">
          {/* Ô chọn tiêu chí tìm kiếm */}
          <FilterSelect
            // tên tiếng việt
            label="Tiêu chí tìm kiếm"
            // mã tiếng anh
            value={field}
            // hàm on được gọi khi người dùng chọn mục khác
            onChange={setField}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'time', label: 'Thời gian' },
              ...['Temperature', 'Humidity', 'Light'].map((type) => ({
                value: type,
                label: sensorLabels[type],
              })),
            ]}
          />
          <Icon name="fields" />
        </div>
        {/* ô "Nhập nội dung tìm kiếm...".
            value={query}: hiện chữ đang được lưu trong query.
            onChange: mỗi lần gõ/xóa, lấy toàn bộ chữ trong ô đưa vào setQuery.
            placeholder là chữ gợi ý khi ô trống, không phải nội dung dùng để tìm. */}
        <div className="sensor-input-wrap sensor-query">
          {/* nút tìm kiếm */}
          <Icon name="search" />
          <input
            className="form-control"
            aria-label="Nội dung tìm kiếm"
            placeholder="Nhập nội dung tìm kiếm..."
            value={query}
            maxLength={100}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {/* type=submit kích hoạt onSubmit của form cho cả bấm nút và nhấn Enter; btn-primary tạo nền xanh/chữ trắng. */}
        {/* nút chọn ngày */}
        <div className="sensor-toolbar-actions">
          <button
            className={
              'sensor-calendar-button' + (hasDateRange ? ' is-active' : '')
            }
            type="button"
            aria-label="Chọn khoảng ngày"
            aria-haspopup="dialog"
            title="Chọn khoảng ngày"
            onClick={() => {
              setDraftDates({ ...dateRange });
              setCalendarVersion((version) => version + 1);
              dateDialog.current.showModal();
            }}
          >
            <Icon name="calendar" />
          </button>
          <button
            className="btn btn-primary sensor-search-submit"
            type="submit"
          >
            <Icon name="search" />
            Tìm kiếm
          </button>
        </div>

        {/* type=button ngăn nút Xóa vô tình submit form. clearSearch xóa cả bản nháp lẫn bộ lọc đã áp dụng. */}
        <button
          className="btn btn-outline-secondary sensor-reset"
          type="button"
          onClick={clearSearch}
        >
          <Icon name="close" />
          Xóa
        </button>
      </form>
      <dialog
        ref={dateDialog}
        className="sensor-date-dialog"
        aria-labelledby="sensor-date-title"
      >
        <form onSubmit={applyDateRange}>
          <div className="sensor-date-heading">
            <h2 id="sensor-date-title">Chọn khoảng ngày</h2>
            <button
              type="button"
              className="sensor-calendar-button"
              aria-label="Đóng"
              onClick={() => dateDialog.current.close()}
            >
              <Icon name="close" />
            </button>
          </div>
          <p>Hiển thị dữ liệu trong cả ngày bắt đầu và ngày kết thúc.</p>
          <DateRangeCalendar
            key={calendarVersion}
            value={draftDates}
            onChange={setDraftDates}
            initialDate={calendarDate}
          />
          <div className="sensor-date-actions">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => dateDialog.current.close()}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                !draftDates.startDate ||
                !draftDates.endDate ||
                draftDates.startDate > draftDates.endDate
              }
            >
              Áp dụng
            </button>
          </div>
        </form>
      </dialog>
      <section
        className="panel sensor-table-panel"
        aria-label="Dữ liệu đo cảm biến"
        aria-busy={loading}
      >
        {/* Tỉ lệ bốn cột tính theo phần trăm; component dùng cùng colgroup cho đầu bảng và thân bảng. */}
        {/* tạo bảng có đầu mục đứng yên */}
        <ScrollableTable
          className="table sensor-table align-middle mb-0"
          columns={[25, 25, 25, 25]}
        >
          {/* Bốn cột Mã, Thời gian, Loại cảm biến và Giá trị đều rộng 25%.
              table lấy kiểu Bootstrap; align-middle căn dọc ô; mb-0 bỏ margin đáy. scope=col xác định tiêu đề cho cột. */}
          <thead>
            <tr>
              <th scope="col">MÃ</th>
              <th scope="col">THỜI GIAN</th>
              <th scope="col">LOẠI CẢM BIẾN</th>
              <th scope="col">GIÁ TRỊ</th>
            </tr>
          </thead>
          {/* ScrollableTable nhận thead/tbody theo đúng thứ tự, lấy aria-label của tbody đặt vào vùng cuộn có thể focus.
              tabIndex trên tbody sẽ được component bỏ đi; người dùng Tab đến vùng cuộn ngoài thay vì từng dòng. */}
          <tbody tabIndex={0} aria-label="Các bản ghi cảm biến">
            {/* tạo từng dòng trong bảng */}
            {rows.map((row) => {
              // Chọn class màu và icon theo row.type. Loại chưa biết vẫn hiển thị bằng icon data mặc định.
              const style = sensorStyles[row.type] || {
                className: '',
                icon: 'data',
              };
              return (
                <tr key={row.id}>
                  {/* Hiển thị mã gốc; chỉ dùng dấu — khi mã là null/undefined, vẫn giữ mã 0. */}
                  <td className="sensor-id">{row.id ?? '—'}</td>
                  {/* formatSensorTime chỉ thay T bằng dấu cách, không tính lại múi giờ. */}
                  <td className="sensor-time">{formatSensorTime(row.time)}</td>
                  <td>
                    <span className={'sensor-badge ' + style.className}>
                      <Icon name={style.icon} />
                      {/* Chỉ tra nhãn có thật trong sensorLabels; loại lạ hiển thị mã gốc, null/undefined hiển thị —. */}
                      {Object.hasOwn(sensorLabels, row.type)
                        ? sensorLabels[row.type]
                        : (row.type ?? '—')}
                    </span>
                  </td>
                  {/* Ghép số đo và đơn vị, ví dụ 29.2 °C hoặc 58.6 %. CSS căn trái giống đầu mục GIÁ TRỊ. */}
                  <td className="sensor-value">
                    {formatSensorValue(row.value, row.unit)}
                  </td>
                </tr>
              );
            })}
            {/* Không có kết quả: một ô trải toàn bộ bốn cột, không tạo bản ghi giả. */}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="text-center py-5">
                  <div role="status">
                    {loading
                      ? 'Đang tải dữ liệu…'
                      : error || 'Không có dữ liệu phù hợp.'}
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
        {/* Footer nằm ngoài vùng cuộn; total là tổng kết quả sau lọc, không phải số dòng đang hiển thị. */}
        {/* báo lại khi người dùng chuyển trang*/}
        {!loading && !error && (
          <Pagination
            page={page}
            size={size}
            total={total}
            // Đổi trang gửi request mới với bộ lọc đã áp dụng.
            onChange={setPage}
            onSizeChange={(value) => {
              // value đã được Pagination đổi từ string của select thành số.
              setSize(value);
              setPage(1);
            }}
          />
        )}
      </section>
    </div>
  );
}
