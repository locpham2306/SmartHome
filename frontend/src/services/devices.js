import { apiRequest } from './api';

export const getDevices = (signal) => apiRequest('/api/devices', { signal });
export const controlDevice = (id, action, signal) =>
  apiRequest(`/api/devices/${id}/control?${new URLSearchParams({ action })}`, {
    method: 'POST',
    signal,
  });
export function getLastDeviceCommand(name, signal) {
  const query = new URLSearchParams({
    'searchRequest.device': name,
    'pageRequest.page': '1',
    'pageRequest.size': '1',
    'pageRequest.sortBy': 'id',
    'pageRequest.sortDir': 'desc',
  });
  return apiRequest(`/api/action-history?${query}`, { signal });
}
