import { apiRequest } from './api';

export function getLatestSensors(signal) {
  return apiRequest('/api/sensors/latest', { signal });
}

export function getSensorChart(type, signal) {
  const query = new URLSearchParams({ type, limit: '100' });
  return apiRequest(`/api/sensors/chart?${query}`, { signal });
}

export function sensorSearchQuery(params) {
  const query = new URLSearchParams();
  for (const [group, fields] of Object.entries(params)) {
    for (const [key, value] of Object.entries(fields)) {
      if (value !== '' && value != null) query.set(`${group}.${key}`, value);
    }
  }
  return query.toString();
}

export function getSensorPage(query, signal) {
  return apiRequest(`/api/sensors?${query}`, { signal });
}
