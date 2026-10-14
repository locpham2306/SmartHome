import { useCallback, useEffect, useState } from 'react';
import { getHistoryPage, historySearchQuery } from '../services/history';

export default function useHistorySearch(params) {
  const query = historySearchQuery(params);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    setResult(null);
    async function load() {
      try {
        const data = await getHistoryPage(query, controller.signal);
        if (
          !Array.isArray(data?.items) ||
          !Number.isInteger(data.totalElements) ||
          data.totalElements < 0 ||
          !Number.isInteger(data.totalPages) ||
          data.totalPages < 0
        ) {
          throw new Error('Dữ liệu lịch sử không hợp lệ.');
        }
        if (!disposed)
          setResult({
            query,
            attempt,
            rows: data.items,
            total: data.totalElements,
            totalPages: data.totalPages,
            error: '',
          });
      } catch (failure) {
        if (!disposed)
          setResult({
            query,
            attempt,
            rows: [],
            total: 0,
            totalPages: 0,
            error:
              failure.name === 'AbortError'
                ? 'Tải dữ liệu quá lâu. Vui lòng thử lại.'
                : failure.message,
          });
      } finally {
        clearTimeout(timer);
      }
    }
    // Chờ người dùng ngừng gõ để tránh gọi API cho từng ký tự.
    const debounce = setTimeout(() => void load(), 300);
    // Đổi bộ lọc/chuyển trang: bỏ response cũ để nó không ghi đè kết quả mới.
    return () => {
      disposed = true;
      clearTimeout(debounce);
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, attempt]);

  const current =
    result?.query === query && result.attempt === attempt ? result : null;
  return {
    rows: current?.rows ?? [],
    total: current?.total ?? 0,
    totalPages: current?.totalPages ?? 0,
    error: current?.error ?? '',
    loading: !current,
    retry,
  };
}
