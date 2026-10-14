import React from 'react';
import Icon from './Icon';

export default function Pagination({
  page,
  total,
  size,
  onChange,
  onSizeChange,
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  const visiblePages = Array.from(
    { length: pages },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      pages <= 5 ||
      number === 1 ||
      number === pages ||
      Math.abs(number - page) <= 1,
  );
  const pageItems = visiblePages.flatMap((number, index) =>
    index > 0 && number - visiblePages[index - 1] > 1
      ? [`gap-${number}`, number]
      : [number],
  );
  return (
    <div className="pagination-footer">
      <span className="pagination-summary">
        Hiển thị {total ? (page - 1) * size + 1 : 0}–
        {Math.min(page * size, total)} trên {total}
        {' bản ghi'}
      </span>
      <div className="pagination-actions">
        {onSizeChange && (
          <select
            className="form-select pagination-size"
            aria-label="Số bản ghi mỗi trang"
            value={size}
            onChange={(event) => onSizeChange(Number(event.target.value))}
          >
            {[5, 10, 15, 20, 30, 50].map((value) => (
              <option key={value} value={value}>
                {value} / trang
              </option>
            ))}
          </select>
        )}
        <nav aria-label="Phân trang" className="pagination-buttons">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
          >
            {onSizeChange && <Icon name="previous" />}Trước
          </button>
          {pageItems.map((number) =>
            typeof number === 'string' ? (
              <span
                key={number}
                className="pagination-ellipsis"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={number}
                className={
                  'btn btn-sm ' +
                  (page === number ? 'btn-primary' : 'btn-outline-secondary')
                }
                aria-current={page === number ? 'page' : undefined}
                aria-label={`Trang ${number}`}
                onClick={() => onChange(number)}
              >
                {number}
              </button>
            ),
          )}
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === pages}
            onClick={() => onChange(page + 1)}
          >
            Sau{onSizeChange && <Icon name="next" />}
          </button>
        </nav>
      </div>
    </div>
  );
}
