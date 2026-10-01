const API_BASE_URL = 'http://127.0.0.1:8000';

async function request(endpoint, { method = 'GET', body } = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail || 'No se pudo completar la solicitud.');
  }

  return payload;
}

export const api = {
  getCitas: () => request('/api/citas'),
  createCita: (data) => request('/api/citas', { method: 'POST', body: data }),
  updateCita: (id, data) => request(`/api/citas/${id}`, { method: 'PUT', body: data }),
  deleteCita: (id) => request(`/api/citas/${id}`, { method: 'DELETE' }),
  getRecordatorios: () => request('/api/recordatorios'),
  createRecordatorio: (data) => request('/api/recordatorios', { method: 'POST', body: data }),
  updateRecordatorio: (id, data) => request(`/api/recordatorios/${id}`, { method: 'PUT', body: data }),
};
