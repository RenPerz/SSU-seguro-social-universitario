import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import AdminPanel from './components/AdminPanel';
import RecordatorioCitas from './components/RecordatorioCitas';
import { api } from './services/api';

const sectionRoutes = {
  inicio: '/dashboard',
  citas: '/citas',
  recordatorios: '/recordatorios',
  historial: '/historial',
  perfil: '/perfil',
  notificaciones: '/notificaciones',
  admin: '/admin',
  'admin-usuarios': '/admin/usuarios',
  'admin-profesionales': '/admin/profesionales',
  'admin-especialidades': '/admin/especialidades',
  'admin-citas': '/admin/citas',
};

const getSectionFromPath = (pathname) => Object.entries(sectionRoutes).find(([, path]) => path === pathname)?.[0]
  || (pathname.startsWith('/admin') ? 'admin' : 'inicio');

const initialForm = {
  especialidad: '',
  profesional: '',
  fecha: '',
  hora: '',
  motivo: '',
};

const profileFields = (user = {}) => ({
  nombres: user.nombres || '',
  apellidos: user.apellidos || '',
  email: user.email || '',
  telefono: user.telefono || '',
});

const reminderOptions = [
  { value: '24 H', label: '24 horas antes' },
  { value: '12 H', label: '12 horas antes' },
  { value: '1 H', label: '1 hora antes' },
];

const filterOptions = ['TODAS', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA'];
const historyFilterOptions = ['TODAS', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIO'];

const historyStatusLabel = (status) => ({
  ATENDIDA: 'Atendida',
  CANCELADA: 'Cancelada',
  NO_ASISTIO: 'No asistió',
}[status] || status);

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return 'Sin hora';
  const [hours, minutes] = value.split(':');
  const hour = Number(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = ((hour + 11) % 12) + 1;
  return `${formattedHour}:${minutes} ${ampm}`;
};

const getStatusClass = (status) => `status-pill status-pill--${status.toLowerCase()}`;

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('ssu_session'));
    } catch {
      return null;
    }
  });
  const [activeSection, setActiveSection] = useState(() => getSectionFromPath(window.location.pathname));
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('TODAS');
  const [historyOrder, setHistoryOrder] = useState('DESC');
  const [notificationsLoading, setNotificationsLoading] = useState(() => Boolean(session?.user));
  const [selectedFilter, setSelectedFilter] = useState('TODAS');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderValue, setReminderValue] = useState('24 H');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState(() => profileFields(session?.user));
  const [profileLoading, setProfileLoading] = useState(false);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [savingReminderId, setSavingReminderId] = useState(null);

  const loadAppointments = async () => {
    try {
      const data = await api.getCitas();
      setAppointments(data);
    } catch (error) {
      setErrorMessage(error.message || 'No se pudieron cargar las citas.');
    }
  };

  const loadNotifications = async () => {
    try {
      setNotifications(await api.getNotificaciones());
    } catch (error) {
      setErrorMessage(error.message || 'No se pudieron cargar las notificaciones.');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const currentUserId = session?.user?.id;

  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener('ssu:unauthorized', handleUnauthorized);
    if (!currentUserId) return () => window.removeEventListener('ssu:unauthorized', handleUnauthorized);

    api.getCitas()
      .then(setAppointments)
      .catch((error) => setErrorMessage(error.message || 'No se pudieron cargar las citas.'));
    api.getHistorial()
      .then(setHistory)
      .catch((error) => setErrorMessage(error.message || 'No se pudo cargar el historial.'));
    api.getNotificaciones()
      .then(setNotifications)
      .catch((error) => setErrorMessage(error.message || 'No se pudieron cargar las notificaciones.'))
      .finally(() => setNotificationsLoading(false));
    setRemindersLoading(true);
    api.getRecordatorios()
      .then((data) => {
        setReminders(data);
        if (data.length > 0) {
          setReminderEnabled(Boolean(data[0].activo));
          setReminderValue(data[0].tiempo_recordatorio || '24 H');
        }
      })
      .catch((error) => setErrorMessage(error.message || 'No se pudieron cargar los recordatorios.'))
      .finally(() => setRemindersLoading(false));
    api.getMe()
      .then((profile) => {
        setProfileForm(profileFields(profile));
        setSession((current) => {
          if (!current) return current;
          const next = { ...current, user: profile };
          sessionStorage.setItem('ssu_session', JSON.stringify(next));
          return next;
        });
      })
      .catch((error) => setErrorMessage(error.message || 'No se pudo cargar el perfil.'));

    return () => window.removeEventListener('ssu:unauthorized', handleUnauthorized);
  }, [currentUserId]);

  useEffect(() => {
    const handleNavigation = () => setActiveSection(getSectionFromPath(window.location.pathname));
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const handleAuthenticated = (nextSession) => {
    sessionStorage.setItem('ssu_session', JSON.stringify(nextSession));
    setNotificationsLoading(true);
    setSession(nextSession);
  };

  const navigateToSection = (section) => {
    const path = sectionRoutes[section] || '/dashboard';
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setActiveSection(section);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ssu_session');
    setSession(null);
  };

  const handleProfileInput = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileLoading(true);
    setMessage('');
    setErrorMessage('');
    try {
      const profile = await api.updateMe(profileForm);
      const next = { ...session, user: profile };
      sessionStorage.setItem('ssu_session', JSON.stringify(next));
      setSession(next);
      setMessage('✓ Perfil actualizado correctamente.');
    } catch (error) {
      setErrorMessage(error.message || '⚠ No se pudo actualizar el perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const upcomingAppointment = useMemo(() => {
    const valid = appointments
      .filter((appointment) => appointment.estado !== 'CANCELADA')
      .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));

    return valid[0] || null;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (selectedFilter === 'TODAS') return appointments;
    return appointments.filter((item) => item.estado === selectedFilter);
  }, [appointments, selectedFilter]);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');

    const requiredFields = ['especialidad', 'profesional', 'fecha', 'hora', 'motivo'];
    const missingField = requiredFields.find((field) => !String(formData[field]).trim());

    if (missingField) {
      setErrorMessage('Completa todos los campos obligatorios antes de registrar la cita.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        estado: 'PENDIENTE',
        lugar: 'Seguro Social Universitario',
      };

      await api.createCita(payload);
      setFormData(initialForm);
      setMessage('✓ Cita registrada correctamente.');
      await loadAppointments();
      await loadNotifications();
    } catch (error) {
      setErrorMessage(error.message || '⚠ No se pudo registrar la cita.');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  const handleCancel = async (appointmentId) => {
    const confirmCancel = window.confirm('¿Estás seguro de que deseas cancelar esta cita?');
    if (!confirmCancel) return;

    try {
      await api.updateCita(appointmentId, { estado: 'CANCELADA' });
      setMessage('✓ Cita cancelada correctamente.');
      setSelectedAppointment(null);
      await loadAppointments();
      await loadNotifications();
    } catch (error) {
      setErrorMessage(error.message || '⚠ No se pudo cancelar la cita.');
    }
  };

  const handleSaveReminder = async (appointmentId, form) => {
    const formData = new FormData(form);
    const reminder = reminders.find((item) => item.id_cita === appointmentId);
    const payload = {
      id_cita: appointmentId,
      tiempo_recordatorio: formData.get('tiempo_recordatorio'),
      activo: formData.get('activo') === 'on',
    };
    setSavingReminderId(appointmentId);
    try {
      const updated = reminder
        ? await api.updateRecordatorio(reminder.id_recordatorio, payload)
        : await api.createRecordatorio(payload);
      setReminders((current) => reminder
        ? current.map((item) => item.id_recordatorio === updated.id_recordatorio ? updated : item)
        : [...current, updated]);
      setReminderEnabled(payload.activo);
      setReminderValue(payload.tiempo_recordatorio);
      setMessage('✓ Recordatorio actualizado correctamente.');
      await loadNotifications();
    } catch (error) {
      setErrorMessage(error.message || '⚠ No se pudo guardar la configuración de recordatorios.');
    } finally {
      setSavingReminderId(null);
    }
  };

  const handleSaveLegacyReminder = async () => {
    const appointment = upcomingAppointment;
    try {
      if (appointment) {
        const existing = reminders.find((item) => item.id_cita === appointment.id);
        const payload = { id_cita: appointment.id, tiempo_recordatorio: reminderValue, activo: reminderEnabled };
        if (existing) {
          await api.updateRecordatorio(existing.id_recordatorio, payload);
        } else {
          await api.createRecordatorio(payload);
        }
        setMessage('✓ Recordatorio actualizado correctamente.');
        await loadNotifications();
      }
    } catch (error) {
      setErrorMessage(error.message || '⚠ No se pudo guardar la configuración de recordatorios.');
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications((current) => current.map((item) => (
        item.id === notificationId ? { ...item, leida: true } : item
      )));
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo actualizar la notificación.');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, leida: true })));
      setMessage('✓ Todas las notificaciones fueron marcadas como leídas.');
    } catch (error) {
      setErrorMessage(error.message || 'No se pudieron actualizar las notificaciones.');
    }
  };

  const filteredHistory = history
    .filter((appointment) => historyFilter === 'TODAS' || appointment.estado === historyFilter)
    .sort((first, second) => {
      const comparison = new Date(`${first.fecha}T${first.hora}`) - new Date(`${second.fecha}T${second.hora}`);
      return historyOrder === 'DESC' ? -comparison : comparison;
    });

  return (
    <div className="app-shell">
      <Header activeSection={activeSection} onSelectSection={navigateToSection} userRole={session.user.rol} />

      <div className="layout-shell">
        <Sidebar activeItem={activeSection} onSelect={navigateToSection} userRole={session.user.rol} />

        <main className="main-panel">
          {activeSection.startsWith('admin') ? (
            session.user.rol === 'administrador' ? (
              <AdminPanel
                activeSection={activeSection}
                onNavigate={navigateToSection}
                currentUser={session.user}
                onLogout={handleLogout}
              />
            ) : (
              <section className="content-panel unauthorized-panel">
                <h2>Acceso no autorizado</h2>
                <p>Tu cuenta no tiene permisos para administrar el sistema.</p>
              </section>
            )
          ) : <>
          <section className="hero-panel">
            <div>
              <p className="eyebrow">Sistema universitario</p>
              <h1>Hola, {session.user.nombres}</h1>
              <p className="section-subtitle">Gestión rápida de turnos, recordatorios y atención médica.</p>
            </div>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => navigateToSection('citas')}>Ver agenda</button>
              <button type="button" className="secondary-button secondary-button--dark" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </section>

          <div className="stats-grid">
            <StatCard
              title="Próxima cita"
              value={upcomingAppointment ? formatDate(upcomingAppointment.fecha) : 'Sin cita'}
              caption={upcomingAppointment ? `${formatTime(upcomingAppointment.hora)} · ${upcomingAppointment.especialidad}` : 'Sin citas programadas'}
              tone="blue"
            />
            <StatCard title="Recordatorios" value={reminderEnabled ? 'Activos' : 'Inactivos'} caption={`${reminderValue} de anticipación`} tone="green" />
            <StatCard title="Citas" value={String(appointments.length)} caption="Totales registradas" tone="violet" />
            <StatCard title="Estado" value={upcomingAppointment?.estado || 'Sin registro'} caption={upcomingAppointment ? upcomingAppointment.profesional : 'Sin información'} tone="amber" />
          </div>

          {message && <div className="feedback feedback--success">{message}</div>}
          {errorMessage && <div className="feedback feedback--error">{errorMessage}</div>}

          {activeSection === 'historial' && (
            <section className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow eyebrow--dark">Atenciones anteriores</p>
                  <h2>Historial de citas</h2>
                </div>
                <label className="history-sort">
                  Ordenar por fecha
                  <select value={historyOrder} onChange={(event) => setHistoryOrder(event.target.value)}>
                    <option value="DESC">Más recientes</option>
                    <option value="ASC">Más antiguas</option>
                  </select>
                </label>
              </div>
              <div className="filter-row" aria-label="Filtrar historial">
                {historyFilterOptions.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`filter-button ${historyFilter === filter ? 'is-active' : ''}`}
                    onClick={() => setHistoryFilter(filter)}
                  >
                    {filter === 'NO_ASISTIO' ? 'NO ASISTIÓ' : filter}
                  </button>
                ))}
              </div>
              <div className="appointments-list history-list">
                {filteredHistory.length === 0 ? (
                  <div className="empty-state">No tienes citas en el historial para este filtro.</div>
                ) : filteredHistory.map((appointment) => (
                  <article className="appointment-card" key={appointment.id}>
                    <div className="appointment-card__top">
                      <div>
                        <p className="appointment-card__date">{formatDate(appointment.fecha)} · {formatTime(appointment.hora)}</p>
                        <h3>{appointment.especialidad}</h3>
                      </div>
                      <span className={getStatusClass(appointment.estado)}>{historyStatusLabel(appointment.estado)}</span>
                    </div>
                    <div className="appointment-card__body">
                      <div><strong>{appointment.profesional}</strong><p>{appointment.lugar}</p></div>
                      <div><span>Motivo</span><p>{appointment.motivo}</p></div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'notificaciones' && (
            <section className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow eyebrow--dark">Avisos personales</p>
                  <h2>Notificaciones</h2>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleMarkAllNotificationsRead}
                  disabled={!notifications.some((item) => !item.leida)}
                >
                  Marcar todas como leídas
                </button>
              </div>
              {notificationsLoading ? (
                <div className="empty-state">Cargando notificaciones...</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">No tienes notificaciones.</div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <article className={`notification-item ${notification.leida ? '' : 'notification-item--unread'}`} key={notification.id}>
                      <span className={`notification-item__icon notification-item__icon--${notification.tipo.toLowerCase()}`} aria-hidden="true">
                        {notification.tipo === 'CONFIRMACION' ? '✓' : notification.tipo === 'CANCELACION' ? '!' : '•'}
                      </span>
                      <div className="notification-item__content">
                        <div className="notification-item__heading">
                          <h3>{notification.titulo}</h3>
                          {!notification.leida && <span className="notification-unread-label">Nueva</span>}
                        </div>
                        <p>{notification.mensaje}</p>
                        <time dateTime={notification.fecha_creacion}>
                          {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.fecha_creacion))}
                        </time>
                      </div>
                      {!notification.leida && (
                        <button type="button" className="notification-read-button" onClick={() => handleMarkNotificationRead(notification.id)}>
                          Marcar como leída
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === 'recordatorios' && (
            <RecordatorioCitas
              appointments={appointments}
              reminders={reminders}
              loading={remindersLoading}
              savingId={savingReminderId}
              onSave={handleSaveReminder}
            />
          )}

          {activeSection !== 'historial' && activeSection !== 'notificaciones' && activeSection !== 'recordatorios' && <>
          {activeSection === 'perfil' && (
            <section className="content-panel profile-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow eyebrow--dark">Cuenta personal</p>
                  <h2>Mi perfil</h2>
                </div>
                <span className="profile-role">{session.user.rol}</span>
              </div>
              <div className="profile-summary">
                <div className="profile-avatar">{session.user.nombres?.charAt(0)}{session.user.apellidos?.charAt(0)}</div>
                <div>
                  <h3>{session.user.nombres} {session.user.apellidos}</h3>
                  <p>Carnet: {session.user.carnet}</p>
                  <p>Estado: {session.user.estado}</p>
                </div>
              </div>
              <form className="appointment-form" onSubmit={handleProfileSubmit}>
                <div className="field-row">
                  <div className="field-group">
                    <label htmlFor="profile-nombres">Nombres</label>
                    <input id="profile-nombres" name="nombres" value={profileForm.nombres} onChange={handleProfileInput} required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="profile-apellidos">Apellidos</label>
                    <input id="profile-apellidos" name="apellidos" value={profileForm.apellidos} onChange={handleProfileInput} required />
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="profile-email">Email</label>
                  <input id="profile-email" name="email" type="email" value={profileForm.email} onChange={handleProfileInput} required />
                </div>
                <div className="field-group">
                  <label htmlFor="profile-telefono">Teléfono</label>
                  <input id="profile-telefono" name="telefono" value={profileForm.telefono} onChange={handleProfileInput} />
                </div>
                <button type="submit" className="primary-button" disabled={profileLoading}>
                  {profileLoading ? 'Guardando...' : 'Editar perfil'}
                </button>
              </form>
            </section>
          )}

          <section className="content-panel">
            <div className="panel-header">
              <h2>Próximas citas</h2>
              <div className="filter-row">
                {filterOptions.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`filter-button ${selectedFilter === filter ? 'is-active' : ''}`}
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="appointments-list">
              {filteredAppointments.length === 0 ? (
                <div className="empty-state">No hay citas para este filtro.</div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <article key={appointment.id} className="appointment-card">
                    <div className="appointment-card__top">
                      <div>
                        <p className="appointment-card__date">{formatDate(appointment.fecha)}</p>
                        <h3>{appointment.especialidad}</h3>
                      </div>
                      <span className={getStatusClass(appointment.estado)}>{appointment.estado}</span>
                    </div>

                    <div className="appointment-card__body">
                      <div>
                        <strong>{appointment.profesional}</strong>
                        <p>{formatTime(appointment.hora)}</p>
                      </div>
                      <div>
                        <span>{appointment.lugar}</span>
                        <p>{appointment.motivo}</p>
                      </div>
                    </div>

                    <div className="appointment-card__actions">
                      <button type="button" onClick={() => setSelectedAppointment(appointment)}>
                        Detalles
                      </button>
                      <button type="button" className="secondary-button" onClick={() => handleCancel(appointment.id)}>
                        Cancelar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="content-panel content-grid">
            <div className="panel-card">
              <div className="panel-header panel-header--compact">
                <h2>Agendar cita</h2>
              </div>

              <form className="appointment-form" onSubmit={handleSubmit}>
                <div className="field-group">
                  <label htmlFor="especialidad">Especialidad</label>
                  <input id="especialidad" name="especialidad" type="text" placeholder="Ej. Medicina General" value={formData.especialidad} onChange={handleInput} />
                </div>

                <div className="field-group">
                  <label htmlFor="profesional">Profesional</label>
                  <input id="profesional" name="profesional" type="text" placeholder="Ej. Dr. Carlos Mendoza" value={formData.profesional} onChange={handleInput} />
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label htmlFor="fecha">Fecha</label>
                    <input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleInput} />
                  </div>

                  <div className="field-group">
                    <label htmlFor="hora">Hora</label>
                    <input id="hora" name="hora" type="time" value={formData.hora} onChange={handleInput} />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="motivo">Motivo</label>
                  <textarea id="motivo" name="motivo" rows="4" placeholder="Describa el motivo de la consulta" value={formData.motivo} onChange={handleInput} />
                </div>

                <button type="submit" className="primary-button primary-button--full" disabled={loading}>
                  {loading ? 'Guardando...' : 'Registrar cita'}
                </button>
              </form>
            </div>

            <div className="panel-card">
              <div className="panel-header panel-header--compact">
                <h2>Recordatorios de citas</h2>
              </div>

              <div className="reminder-toggle">
                <label htmlFor="reminderEnabled">Activar recordatorios</label>
                <input id="reminderEnabled" type="checkbox" checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.target.checked)} />
              </div>

              <div className="field-group">
                <label htmlFor="reminderTime">Tiempo</label>
                <select id="reminderTime" value={reminderValue} onChange={(event) => setReminderValue(event.target.value)}>
                  {reminderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" className="primary-button primary-button--full" onClick={handleSaveLegacyReminder}>
                Guardar recordatorio
              </button>
            </div>
          </section>
          </>}
          </>}
        </main>
      </div>

      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header panel-header--compact">
              <h3>Detalles de cita</h3>
              <button type="button" className="close-button" onClick={() => setSelectedAppointment(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <p><strong>Especialidad:</strong> {selectedAppointment.especialidad}</p>
              <p><strong>Profesional:</strong> {selectedAppointment.profesional}</p>
              <p><strong>Fecha:</strong> {formatDate(selectedAppointment.fecha)}</p>
              <p><strong>Hora:</strong> {formatTime(selectedAppointment.hora)}</p>
              <p><strong>Lugar:</strong> {selectedAppointment.lugar}</p>
              <p><strong>Motivo:</strong> {selectedAppointment.motivo}</p>
              <p><strong>Estado:</strong> {selectedAppointment.estado}</p>
            </div>

            <button type="button" className="primary-button primary-button--full" onClick={() => handleCancel(selectedAppointment.id)}>
              Cancelar cita
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
