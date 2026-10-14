import React from 'react';
const paths = {
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4m10-4v4M3 11h18M7 15h2m6 0h2m-10 3h2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  phone: (
    <path d="M5 3h4l2 5-3 2a16 16 0 0 0 6 6l2-3 5 2v4c0 2-3 3-6 2C8 19 3 14 2 7c0-2 1-4 3-4Z" />
  ),
  id: (
    <>
      <rect x="2" y="5" width="20" height="15" rx="2" />
      <circle cx="8" cy="11" r="2" />
      <path d="M5 17c0-4 6-4 6 0m3-7h5m-5 5h5M8 2v4m8-4v4" />
    </>
  ),
  power: (
    <>
      <path d="M12 2v10M6 5a9 9 0 1 0 12 0" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  close: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  fields: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 6 6" />
    </>
  ),
  previous: <path d="m15 5-7 7 7 7" />,
  next: <path d="m9 5 7 7-7 7" />,
  dashboard: <path d="M5 14v6M12 4v16M19 11v9" strokeWidth="4" />,
  data: (
    <>
      <path d="M2 8a15 15 0 0 1 20 0M6 12a9 9 0 0 1 12 0M10 16a3 3 0 0 1 4 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v7h5" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-2c0-6 16-6 16 0v2Z" />
    </>
  ),
  temperature: (
    <>
      <path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z" />
      <path d="M12 8v10" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  humidity: <path d="M12 2S5 13 5 17a7 7 0 0 0 14 0C19 13 12 2 12 2Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 0v3m0 18v3M0 12h3m18 0h3M3.5 3.5l2 2m13 13 2 2m0-17-2 2m-13 13-2 2" />
    </>
  ),
  controls: (
    <>
      <path d="M3 5h6m4 0h8M3 12h12m4 0h2M3 19h3m4 0h11" />
      <circle cx="11" cy="5" r="2" />
      <circle cx="17" cy="12" r="2" />
      <circle cx="8" cy="19" r="2" />
    </>
  ),
  fan: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M10 9C3 3 12-2 15 3c2 3-2 4-2 6m2 1c6-7 11 2 6 5-3 2-4-2-6-2m-1 2c7 6-2 11-5 6-2-3 2-4 2-6m-2-1C3 21-2 12 3 9c3-2 4 2 6 2" />
    </>
  ),
  ac: (
    <path d="M12 1v22M2.5 6.5l19 11M2.5 17.5l19-11M9 3l3 3 3-3M9 21l3-3 3 3M3 10l4-1-1-4m12 14-1-4 4-1M3 14l4 1-1 4M18 5l-1 4 4 1" />
  ),
  light: (
    <>
      <path d="M8 17c0-4-4-4-4-9a8 8 0 0 1 16 0c0 5-4 5-4 9ZM9 20h6m-5 3h4" />
    </>
  ),
  arrow: <path d="M12 21V3m-6 6 6-6 6 6" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
};
export default function Icon({ name, className = '' }) {
  return (
    <svg
      className={'ui-icon ' + className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
