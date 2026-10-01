const API_BASE_URL = 'http://127.0.0.1:8000';

async function request(endpoint, { method = 'GET', body } = {}) {
  const session = sessionStorage.getItem('ssu_session');
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (session) {
    const { access_token: accessToken } = JSON.parse(session);
    options.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem('ssu_session');
      window.dispatchEvent(new Event('ssu:unauthorized'));
    }
    const detail = typeof payload.detail === 'string' ? payload.detail : 'No se pudo completar la solicitud.';
    throw new Error(detail);
  }

  return payload;
}

export const api = {
  getMe: () => request('/api/usuarios/me'),
  updateMe: (data) => request('/api/usuarios/me', { method: 'PUT', body: data }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: data }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: data }),
  getCitas: () => request('/api/citas'),
  getHistorial: () => request('/api/citas/historial'),
  createCita: (data) => request('/api/citas', { method: 'POST', body: data }),
  updateCita: (id, data) => request(`/api/citas/${id}`, { method: 'PUT', body: data }),
  deleteCita: (id) => request(`/api/citas/${id}`, { method: 'DELETE' }),
  getRecordatorios: () => request('/api/recordatorios'),
  createRecordatorio: (data) => request('/api/recordatorios', { method: 'POST', body: data }),
  updateRecordatorio: (id, data) => request(`/api/recordatorios/${id}`, { method: 'PUT', body: data }),
  getNotificaciones: () => request('/api/notificaciones'),
  markNotificationRead: (id) => request(`/api/notificaciones/${id}/leida`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/api/notificaciones/leidas', { method: 'PATCH' }),
  getAdminStats: () => request('/api/admin/estadisticas'),
  getAdminUsers: () => request('/api/admin/usuarios'),
  setAdminUserState: (id, estado) => request(`/api/admin/usuarios/${id}/estado`, { method: 'PATCH', body: { estado } }),
  getAdminProfessionals: () => request('/api/admin/profesionales'),
  createAdminProfessional: (data) => request('/api/admin/profesionales', { method: 'POST', body: data }),
  updateAdminProfessional: (id, data) => request(`/api/admin/profesionales/${id}`, { method: 'PUT', body: data }),
  setAdminProfessionalState: (id, estado) => request(`/api/admin/profesionales/${id}/estado`, { method: 'PATCH', body: { estado } }),
  getAdminSpecialties: () => request('/api/admin/especialidades'),
  createAdminSpecialty: (data) => request('/api/admin/especialidades', { method: 'POST', body: data }),
  updateAdminSpecialty: (id, data) => request(`/api/admin/especialidades/${id}`, { method: 'PUT', body: data }),
  setAdminSpecialtyState: (id, estado) => request(`/api/admin/especialidades/${id}/estado`, { method: 'PATCH', body: { estado } }),
  getAdminAppointments: (filters = {}) => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    return request(`/api/admin/citas${params.size ? `?${params}` : ''}`);
  },
};
