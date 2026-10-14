import React, { useEffect, useId, useRef, useState } from 'react';

export default function FilterSelect({ label, value, options, onChange }) {
  const id = useId();
  const root = useRef(null);
  const [open, setOpen] = useState(false);
  const selected = Math.max(
    0,
    options.findIndex((item) => item.value === value),
  );
  const [active, setActive] = useState(selected);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!root.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  function choose(index) {
    onChange(options[index].value);
    setOpen(false);
  }

  return (
    <div className="filter-select" ref={root}>
      <button
        type="button"
        className="form-select filter-select-trigger"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? id : undefined}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onBlur={() => setOpen(false)}
        onClick={() => {
          setActive(selected);
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' || event.key === 'Tab') {
            setOpen(false);
            return;
          }
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
            setActive((index) => {
              if (event.key === 'Home') return 0;
              if (event.key === 'End') return options.length - 1;
              if (!open) return selected;
              return (
                (index +
                  (event.key === 'ArrowDown' ? 1 : -1) +
                  options.length) %
                options.length
              );
            });
          } else if (open && ['Enter', ' '].includes(event.key)) {
            event.preventDefault();
            choose(active);
          }
        }}
      >
        {options[selected]?.label}
      </button>
      {open && (
        <ul
          id={id}
          role="listbox"
          aria-label={label}
          className="filter-select-options"
        >
          {options.map((item, index) => (
            <li
              id={`${id}-${index}`}
              key={item.value}
              role="option"
              aria-selected={item.value === value}
              className={index === active ? 'is-active' : ''}
              onPointerDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(index)}
            >
              <span>{item.label}</span>
              {item.value === value && <span aria-hidden="true">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
