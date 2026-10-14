import { apiRequest } from './api';

export function historySearchQuery({
  page,
  size,
  time,
  device,
  action,
  status,
}) {
  const query = new URLSearchParams({
    'pageRequest.page': page,
    'pageRequest.size': size,
    'pageRequest.sortBy': 'createdAt',
    'pageRequest.sortDir': 'desc',
    'searchRequest.device': device,
    'searchRequest.action': action,
    'searchRequest.actionStatus': status,
  });
  const keyword = time.trim().replace(/(\d)t(?=\d)/gi, '$1 ');
  if (keyword) query.set('searchRequest.time', keyword);
  return query.toString();
}

export function getHistoryPage(query, signal) {
  return apiRequest(`/api/action-history?${query}`, { signal });
}
