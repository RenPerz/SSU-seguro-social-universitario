import { useEffect, useState } from 'react';
import { api } from '../services/api';

const sections = [
  { id: 'admin', path: '/admin', label: 'Resumen' },
  { id: 'admin-usuarios', path: '/admin/usuarios', label: 'Usuarios' },
  { id: 'admin-profesionales', path: '/admin/profesionales', label: 'Profesionales' },
  { id: 'admin-especialidades', path: '/admin/especialidades', label: 'Especialidades' },
  { id: 'admin-citas', path: '/admin/citas', label: 'Citas' },
];

const emptyProfessional = { nombres: '', apellidos: '', id_especialidad: '', matricula: '' };
const emptySpecialty = { nombre: '', descripcion: '' };
const displayState = (state) => state === 'ACTIVO' ? 'Activo' : 'Inactivo';

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : 'Sin fecha';
}

export default function AdminPanel({ activeSection, onNavigate, currentUser, onLogout }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('TODOS');
  const [userStateFilter, setUserStateFilter] = useState('TODOS');
  const [appointmentState, setAppointmentState] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [professionalForm, setProfessionalForm] = useState(emptyProfessional);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [specialtyForm, setSpecialtyForm] = useState(emptySpecialty);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let current = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        if (activeSection === 'admin') {
          const result = await api.getAdminStats();
          if (current) setStats(result);
        } else if (activeSection === 'admin-usuarios') {
          const result = await api.getAdminUsers();
          if (current) setUsers(result);
        } else if (activeSection === 'admin-profesionales') {
          const [professionalData, specialtyData] = await Promise.all([
            api.getAdminProfessionals(), api.getAdminSpecialties(),
          ]);
          if (current) {
            setProfessionals(professionalData);
            setSpecialties(specialtyData);
          }
        } else if (activeSection === 'admin-especialidades') {
          const result = await api.getAdminSpecialties();
          if (current) setSpecialties(result);
        } else if (activeSection === 'admin-citas') {
          const result = await api.getAdminAppointments({ estado: appointmentState, fecha: appointmentDate });
          if (current) setAppointments(result);
        }
      } catch (error) {
        if (current) setErrorMessage(error.message || 'No se pudo cargar la información administrativa.');
      } finally {
        if (current) setLoading(false);
      }
    };
    load();
    return () => { current = false; };
  }, [activeSection, appointmentState, appointmentDate]);

  const runAction = async (action, successMessage) => {
    setErrorMessage('');
    setMessage('');
    try {
      await action();
      setMessage(successMessage);
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo completar la operación.');
    }
  };

  const saveProfessional = async (event) => {
    event.preventDefault();
    setSaving(true);
    await runAction(async () => {
      const payload = { ...professionalForm, id_especialidad: Number(professionalForm.id_especialidad) };
      if (editingProfessional) await api.updateAdminProfessional(editingProfessional, payload);
      else await api.createAdminProfessional(payload);
      setProfessionals(await api.getAdminProfessionals());
      setProfessionalForm(emptyProfessional);
      setEditingProfessional(null);
    }, editingProfessional ? 'Profesional actualizado.' : 'Profesional creado.');
    setSaving(false);
  };

  const saveSpecialty = async (event) => {
    event.preventDefault();
    setSaving(true);
    await runAction(async () => {
      if (editingSpecialty) await api.updateAdminSpecialty(editingSpecialty, specialtyForm);
      else await api.createAdminSpecialty(specialtyForm);
      setSpecialties(await api.getAdminSpecialties());
      setSpecialtyForm(emptySpecialty);
      setEditingSpecialty(null);
    }, editingSpecialty ? 'Especialidad actualizada.' : 'Especialidad creada.');
    setSaving(false);
  };

  const filteredUsers = users.filter((user) => {
    const term = search.trim().toLowerCase();
    const textMatches = !term || `${user.nombres} ${user.apellidos} ${user.carnet} ${user.email}`.toLowerCase().includes(term);
    return textMatches && (roleFilter === 'TODOS' || user.rol === roleFilter)
      && (userStateFilter === 'TODOS' || user.estado === userStateFilter);
  });

  const toggleUserState = (user) => {
    const nextState = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    runAction(async () => {
      await api.setAdminUserState(user.id, nextState);
      setUsers((items) => items.map((item) => item.id === user.id ? { ...item, estado: nextState } : item));
    }, 'Estado del usuario actualizado.');
  };

  const toggleProfessionalState = (professional) => {
    const nextState = professional.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    runAction(async () => {
      await api.setAdminProfessionalState(professional.id, nextState);
      setProfessionals((items) => items.map((item) => item.id === professional.id ? { ...item, estado: nextState } : item));
    }, 'Estado del profesional actualizado.');
  };

  const toggleSpecialtyState = (specialty) => {
    const nextState = specialty.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    runAction(async () => {
      await api.setAdminSpecialtyState(specialty.id, nextState);
      setSpecialties((items) => items.map((item) => item.id === specialty.id ? { ...item, estado: nextState } : item));
    }, 'Estado de la especialidad actualizado.');
  };

  return (
    <div className="admin-workspace">
      <section className="admin-heading">
        <div>
          <p className="eyebrow">Gestión institucional</p>
          <h1>Panel administrativo</h1>
          <p>Sesión de {currentUser.nombres} {currentUser.apellidos}</p>
        </div>
        <button type="button" className="secondary-button admin-logout" onClick={onLogout}>Cerrar sesión</button>
      </section>

      <nav className="admin-tabs" aria-label="Secciones administrativas">
        {sections.map((section) => (
          <button key={section.id} type="button" className={`admin-tab ${activeSection === section.id ? 'is-active' : ''}`} onClick={() => onNavigate(section.id)}>
            {section.label}
          </button>
        ))}
      </nav>

      {message && <div className="feedback feedback--success">{message}</div>}
      {errorMessage && <div className="feedback feedback--error">{errorMessage}</div>}
      {loading ? <div className="empty-state">Cargando información...</div> : (
        <>
          {activeSection === 'admin' && stats && (
            <section className="admin-stats-grid" aria-label="Estadísticas administrativas">
              {[
                ['Usuarios registrados', stats.usuarios_registrados, 'Cuentas del sistema', 'blue'],
                ['Citas de hoy', stats.citas_hoy, 'Agenda diaria', 'green'],
                ['Citas pendientes', stats.citas_pendientes, 'Pendientes o confirmadas', 'amber'],
                ['Citas canceladas', stats.citas_canceladas, 'Total registradas', 'violet'],
                ['Profesionales', stats.profesionales_registrados, 'Activos', 'blue'],
                ['Especialidades', stats.especialidades_disponibles, 'Disponibles', 'green'],
              ].map(([title, value, caption, tone]) => (
                <article className={`stat-card stat-card--${tone}`} key={title}>
                  <div className="stat-card__meta">{title}</div>
                  <div className="stat-card__value">{value}</div>
                  <div className="stat-card__caption">{caption}</div>
                </article>
              ))}
            </section>
          )}

          {activeSection === 'admin-usuarios' && (
            <section className="content-panel admin-panel">
              <div className="panel-header"><h2>Gestión de usuarios</h2></div>
              <div className="admin-filters">
                <label className="field-group">Buscar usuario<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, carnet o email" /></label>
                <label className="field-group">Rol<select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="TODOS">Todos</option><option value="estudiante">Estudiante</option><option value="medico">Médico</option><option value="administrador">Administrador</option></select></label>
                <label className="field-group">Estado<select value={userStateFilter} onChange={(event) => setUserStateFilter(event.target.value)}><option value="TODOS">Todos</option><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></label>
              </div>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ID</th><th>Nombre</th><th>Carnet</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
                {filteredUsers.map((user) => <tr key={user.id}><td>{user.id}</td><td>{user.nombres} {user.apellidos}</td><td>{user.carnet}</td><td>{user.email}</td><td>{user.rol}</td><td><span className={`status-pill status-pill--${user.estado.toLowerCase()}`}>{displayState(user.estado)}</span></td><td><button type="button" className="table-action" disabled={user.id === currentUser.id && user.estado === 'ACTIVO'} onClick={() => toggleUserState(user)}>{user.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</button></td></tr>)}
              </tbody></table>{filteredUsers.length === 0 && <div className="empty-state">No hay usuarios que coincidan con los filtros.</div>}</div>
            </section>
          )}

          {activeSection === 'admin-profesionales' && (
            <section className="content-panel admin-panel">
              <div className="panel-header"><h2>Profesionales</h2></div>
              <form className="admin-form" onSubmit={saveProfessional}>
                <label className="field-group">Nombres<input value={professionalForm.nombres} onChange={(event) => setProfessionalForm({ ...professionalForm, nombres: event.target.value })} minLength="2" maxLength="100" required /></label>
                <label className="field-group">Apellidos<input value={professionalForm.apellidos} onChange={(event) => setProfessionalForm({ ...professionalForm, apellidos: event.target.value })} minLength="2" maxLength="100" required /></label>
                <label className="field-group">Especialidad<select value={professionalForm.id_especialidad} onChange={(event) => setProfessionalForm({ ...professionalForm, id_especialidad: event.target.value })} required><option value="">Seleccionar</option>{specialties.filter((item) => item.estado === 'ACTIVO').map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
                <label className="field-group">Matrícula<input value={professionalForm.matricula || ''} onChange={(event) => setProfessionalForm({ ...professionalForm, matricula: event.target.value })} maxLength="50" /></label>
                <div className="admin-form__actions"><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Guardando...' : editingProfessional ? 'Guardar cambios' : 'Crear profesional'}</button>{editingProfessional && <button className="secondary-button" type="button" onClick={() => { setProfessionalForm(emptyProfessional); setEditingProfessional(null); }}>Cancelar</button>}</div>
              </form>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Profesional</th><th>Especialidad</th><th>Matrícula</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
                {professionals.map((professional) => <tr key={professional.id}><td>{professional.nombres} {professional.apellidos}</td><td>{professional.especialidad}</td><td>{professional.matricula || '—'}</td><td>{displayState(professional.estado)}</td><td className="admin-row-actions"><button type="button" className="table-action" onClick={() => { setProfessionalForm({ nombres: professional.nombres, apellidos: professional.apellidos, id_especialidad: String(professional.id_especialidad), matricula: professional.matricula || '' }); setEditingProfessional(professional.id); }}>Editar</button><button type="button" className="table-action" onClick={() => toggleProfessionalState(professional)}>{professional.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</button></td></tr>)}
              </tbody></table>{professionals.length === 0 && <div className="empty-state">No hay profesionales registrados.</div>}</div>
            </section>
          )}

          {activeSection === 'admin-especialidades' && (
            <section className="content-panel admin-panel">
              <div className="panel-header"><h2>Especialidades</h2></div>
              <form className="admin-form admin-form--specialty" onSubmit={saveSpecialty}>
                <label className="field-group">Nombre<input value={specialtyForm.nombre} onChange={(event) => setSpecialtyForm({ ...specialtyForm, nombre: event.target.value })} minLength="3" maxLength="100" required /></label>
                <label className="field-group">Descripción<input value={specialtyForm.descripcion || ''} onChange={(event) => setSpecialtyForm({ ...specialtyForm, descripcion: event.target.value })} maxLength="255" /></label>
                <div className="admin-form__actions"><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Guardando...' : editingSpecialty ? 'Guardar cambios' : 'Crear especialidad'}</button>{editingSpecialty && <button className="secondary-button" type="button" onClick={() => { setSpecialtyForm(emptySpecialty); setEditingSpecialty(null); }}>Cancelar</button>}</div>
              </form>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Especialidad</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
                {specialties.map((specialty) => <tr key={specialty.id}><td>{specialty.nombre}</td><td>{specialty.descripcion || '—'}</td><td>{displayState(specialty.estado)}</td><td className="admin-row-actions"><button type="button" className="table-action" onClick={() => { setSpecialtyForm({ nombre: specialty.nombre, descripcion: specialty.descripcion || '' }); setEditingSpecialty(specialty.id); }}>Editar</button><button type="button" className="table-action" onClick={() => toggleSpecialtyState(specialty)}>{specialty.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</button></td></tr>)}
              </tbody></table>{specialties.length === 0 && <div className="empty-state">No hay especialidades registradas.</div>}</div>
            </section>
          )}

          {activeSection === 'admin-citas' && (
            <section className="content-panel admin-panel">
              <div className="panel-header"><h2>Gestión de citas</h2></div>
              <div className="admin-filters">
                <label className="field-group">Estado<select value={appointmentState} onChange={(event) => setAppointmentState(event.target.value)}><option value="">Todos los estados</option><option value="PENDIENTE">Pendiente</option><option value="CONFIRMADA">Confirmada</option><option value="CANCELADA">Cancelada</option><option value="ATENDIDA">Atendida</option><option value="NO_ASISTIO">No asistió</option></select></label>
                <label className="field-group">Fecha<input type="date" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} /></label>
              </div>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Paciente</th><th>Carnet</th><th>Fecha</th><th>Hora</th><th>Profesional</th><th>Especialidad</th><th>Estado</th></tr></thead><tbody>
                {appointments.map((appointment) => <tr key={appointment.id}><td>{appointment.paciente}</td><td>{appointment.carnet}</td><td>{formatDate(appointment.fecha)}</td><td>{String(appointment.hora).slice(0, 5)}</td><td>{appointment.profesional}</td><td>{appointment.especialidad}</td><td>{appointment.estado}</td></tr>)}
              </tbody></table>{appointments.length === 0 && <div className="empty-state">No hay citas para los filtros seleccionados.</div>}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}