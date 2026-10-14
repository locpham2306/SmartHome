export class ApiError extends Error {
  constructor(message, status = 0, code = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Backend đóng gói kết quả trong BaseResponse; các trang chỉ nhận phần data.
export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Không kết nối được máy chủ. Vui lòng thử lại.');
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(
      'Máy chủ chưa sẵn sàng hoặc trả dữ liệu không hợp lệ.',
      response.status,
    );
  }

  if (!response.ok || body?.success !== true) {
    throw new ApiError(
      body?.message || 'Không tải được dữ liệu. Vui lòng thử lại.',
      response.status,
      body?.strCode,
    );
  }

  return body.data;
}
