import { useCallback, useEffect, useState } from 'react';
import { getSensorPage, sensorSearchQuery } from '../services/sensors';

export default function useSensorSearch(params) {
  const query = sensorSearchQuery(params);
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
        const data = await getSensorPage(query, controller.signal);
        if (
          !Array.isArray(data?.items) ||
          !Number.isInteger(data.totalElements) ||
          data.totalElements < 0 ||
          !Number.isInteger(data.totalPages) ||
          data.totalPages < 0
        ) {
          throw new Error('Dữ liệu danh sách cảm biến không hợp lệ.');
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
    void load();
    // Đổi bộ lọc/chuyển trang: bỏ response cũ để nó không ghi đè kết quả mới.
    return () => {
      disposed = true;
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
