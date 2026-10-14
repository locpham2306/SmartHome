import React, { useState } from 'react';
import Icon from './Icon';
import FilterSelect from './FilterSelect';

const dateKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const displayDate = (date) =>
  date ? date.split('-').reverse().join('/') : 'Chọn ngày';

export default function DateRangeCalendar({ value, onChange, initialDate }) {
  const [year, month] = (value.startDate || initialDate).split('-').map(Number);
  const [view, setView] = useState({ year, month: month - 1 });
  const [active, setActive] = useState('startDate');
  const offset = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const days = new Date(view.year, view.month + 1, 0).getDate();

  function moveMonth(delta) {
    const date = new Date(view.year, view.month + delta, 1);
    if (date.getFullYear() < 1900 || date.getFullYear() > 2100) return;
    setView({ year: date.getFullYear(), month: date.getMonth() });
  }

  function choose(date) {
    if (active === 'startDate') {
      onChange({
        startDate: date,
        endDate: value.endDate >= date ? value.endDate : '',
      });
      setActive('endDate');
    } else {
      onChange({ startDate: value.startDate || date, endDate: date });
    }
  }

  function showField(field) {
    setActive(field);
    if (value[field]) {
      const [nextYear, nextMonth] = value[field].split('-').map(Number);
      setView({ year: nextYear, month: nextMonth - 1 });
    }
  }

  return (
    <div className="range-picker">
      <div className="range-picker-fields">
        {[
          ['startDate', 'Từ ngày'],
          ['endDate', 'Đến ngày'],
        ].map(([field, label]) => (
          <button
            key={field}
            type="button"
            className={active === field ? 'is-active' : ''}
            aria-pressed={active === field}
            onClick={() => showField(field)}
          >
            <span>{label}</span>
            <strong>{displayDate(value[field])}</strong>
            <Icon name="calendar" />
          </button>
        ))}
      </div>
      <div className="range-calendar">
        <div className="range-calendar-heading">
          <button
            type="button"
            className="sensor-calendar-button"
            aria-label="Tháng trước"
            onClick={() => moveMonth(-1)}
            disabled={view.year === 1900 && view.month === 0}
          >
            <Icon name="previous" />
          </button>
          <FilterSelect
            label="Tháng"
            value={view.month}
            options={Array.from({ length: 12 }, (_, index) => ({
              value: index,
              label: `Tháng ${index + 1}`,
            }))}
            onChange={(month) => setView((old) => ({ ...old, month }))}
          />
          <FilterSelect
            label="Năm"
            value={view.year}
            options={Array.from({ length: 201 }, (_, index) => ({
              value: 1900 + index,
              label: String(1900 + index),
            }))}
            onChange={(year) => setView((old) => ({ ...old, year }))}
          />
          <button
            type="button"
            className="sensor-calendar-button"
            aria-label="Tháng sau"
            onClick={() => moveMonth(1)}
            disabled={view.year === 2100 && view.month === 11}
          >
            <Icon name="next" />
          </button>
        </div>
        <div className="range-calendar-weekdays" aria-hidden="true">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div
          className="range-calendar-days"
          role="group"
          aria-label={`Tháng ${view.month + 1} năm ${view.year}`}
        >
          {Array.from({ length: offset }, (_, index) => (
            <span key={`empty-${index}`} />
          ))}
          {Array.from({ length: days }, (_, index) => {
            const date = dateKey(view.year, view.month, index + 1);
            const selected = date === value.startDate || date === value.endDate;
            const inRange =
              value.startDate &&
              value.endDate &&
              date > value.startDate &&
              date < value.endDate;
            return (
              <button
                key={date}
                type="button"
                className={
                  (selected ? 'is-selected ' : '') +
                  (inRange ? 'is-in-range' : '')
                }
                aria-label={displayDate(date)}
                aria-pressed={selected}
                disabled={
                  active === 'endDate' &&
                  !!value.startDate &&
                  date < value.startDate
                }
                onClick={() => choose(date)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="range-calendar-hint" role="status">
          {active === 'startDate' ? 'Chọn ngày bắt đầu' : 'Chọn ngày kết thúc'}
        </div>
      </div>
    </div>
  );
}
