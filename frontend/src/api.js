const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: 'Invalid API response' };
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.details || data.message || `Request failed: ${response.status}`);
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  stats: () => request('/api/stats'),
  filters: () => request('/api/filters'),
  locations: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });
    return request(`/api/locations?${query.toString()}`);
  },
  createLocation: (payload) => request('/api/locations', { method: 'POST', body: JSON.stringify(payload) }),
  updateLocation: (id, payload) => request(`/api/locations/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteLocation: (id) => request(`/api/locations/${id}`, { method: 'DELETE' }),
  importSeed: (replaceExisting = true) => request('/api/import/seed', { method: 'POST', body: JSON.stringify({ replaceExisting }) }),
  importExcel: (file, replaceExisting = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replaceExisting', String(replaceExisting));
    return request('/api/import/excel', { method: 'POST', body: formData });
  }
};
