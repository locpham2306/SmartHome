import React, { useEffect, useRef, useState } from 'react';
import './copy-time.css';

export default function CopyTime({ value }) {
  const text = value?.slice(0, 19).replace('T', ' ') || '';
  const [status, setStatus] = useState('');
  const timer = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Hỗ trợ trang HTTP trong mạng LAN, nơi Clipboard API có thể không có.
        const input = document.createElement('textarea');
        const focused = document.activeElement;
        input.value = text;
        input.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(input);
        try {
          input.select();
          if (!document.execCommand('copy')) throw new Error('Copy failed');
        } finally {
          input.remove();
          focused?.focus();
        }
      }
      if (mounted.current) setStatus('Đã sao chép');
    } catch {
      if (mounted.current) setStatus('Không sao chép được');
    }
    if (mounted.current) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus(''), 1800);
    }
  };

  return (
    <span className="copy-time">
      <span>{text || '—'}</span>
      {text && (
        <button type="button" className="copy-time-button" onClick={copy}
          title="Sao chép thời gian" aria-label={`Sao chép thời gian ${text}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {status === 'Đã sao chép'
              ? <path d="m5 12 4 4L19 6" />
              : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>}
          </svg>
        </button>
      )}
      <span className="copy-time-feedback" role="status">{status}</span>
    </span>
  );
}
