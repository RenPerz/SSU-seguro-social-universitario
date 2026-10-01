import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import { api } from './services/api';

const initialForm = {
  especialidad: '',
  profesional: '',
  fecha: '',
  hora: '',
  motivo: '',
};

const reminderOptions = [
  { value: '24 H', label: '24 horas antes' },
  { value: '12 H', label: '12 horas antes' },
  { value: '1 H', label: '1 hora antes' },
];

const filterOptions = ['TODAS', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA'];

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
  const [activeSection, setActiveSection] = useState('inicio');
  const [appointments, setAppointments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('TODAS');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderValue, setReminderValue] = useState('24 H');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      const data = await api.getCitas();
      setAppointments(data);
    } catch (error) {
      setErrorMessage(error.message || 'No se pudieron cargar las citas.');
    }
  };

  const loadReminderSettings = async () => {
    try {
      const data = await api.getRecordatorios();
      if (data && data.length > 0) {
        const settings = data[0];
        setReminderEnabled(Boolean(settings.activo));
        setReminderValue(settings.tiempo_recordatorio || '24 H');
      }
    } catch (error) {
      setErrorMessage(error.message || 'No se pudieron cargar los recordatorios.');
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener('ssu:unauthorized', handleUnauthorized);
    if (!session) return () => window.removeEventListener('ssu:unauthorized', handleUnauthorized);
    loadAppointments();
    loadReminderSettings();
    return () => window.removeEventListener('ssu:unauthorized', handleUnauthorized);
  }, [session]);

  const handleAuthenticated = (nextSession) => {
    sessionStorage.setItem('ssu_session', JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ssu_session');
    setSession(null);
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
    } catch (error) {
      setErrorMessage(error.message || '⚠ No se pudo cancelar la cita.');
    }
  };

  const handleSaveReminder = async () => {
    try {
      const settings = await api.getRecordatorios();
      const payload = {
        id_cita: upcomingAppointment?.id || 1,
        tiempo_recordatorio: reminderValue,
        activo: reminderEnabled,
      };

      if (settings && settings.length > 0) {
        await api.updateRecordatorio(settings[0].id_recordatorio, payload);
      } else {
        await api.createRecordatorio(payload);
      }

      setMessage('✓ Recordatorios guardados correctamente.');
    } catch (error) {
      setErrorMessage(error.message || '⚠ No se pudo guardar la configuración de recordatorios.');
    }
  };

  return (
    <div className="app-shell">
      <Header activeSection={activeSection} onSelectSection={setActiveSection} />

      <div className="layout-shell">
        <Sidebar activeItem={activeSection} onSelect={setActiveSection} />

        <main className="main-panel">
          <section className="hero-panel">
            <div>
              <p className="eyebrow">Sistema universitario</p>
              <h1>Hola, {session.user.nombres}</h1>
              <p className="section-subtitle">Gestión rápida de turnos, recordatorios y atención médica.</p>
            </div>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => setActiveSection('citas')}>Ver agenda</button>
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

              <button type="button" className="primary-button primary-button--full" onClick={handleSaveReminder}>
                Guardar recordatorio
              </button>
            </div>
          </section>
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
