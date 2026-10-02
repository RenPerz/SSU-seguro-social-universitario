const reminderOptions = [
  { value: '24 H', label: '24 horas antes' },
  { value: '12 H', label: '12 horas antes' },
  { value: '1 H', label: '1 hora antes' },
];

const formatDate = (value) => new Intl.DateTimeFormat('es-BO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(`${value}T00:00:00`));

const formatTime = (value) => {
  const [hours, minutes] = value.split(':');
  const hour = Number(hours);
  return `${((hour + 11) % 12) + 1}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export default function RecordatorioCitas({ appointments, reminders, loading, savingId, onSave }) {
  const upcoming = appointments
    .filter((appointment) => !['CANCELADA', 'ATENDIDA', 'NO_ASISTIO'].includes(appointment.estado))
    .sort((first, second) => new Date(`${first.fecha}T${first.hora}`) - new Date(`${second.fecha}T${second.hora}`));
  const nextAppointment = upcoming[0];

  return (
    <section className="content-panel reminder-page">
      <div className="panel-header">
        <div>
          <p className="eyebrow eyebrow--dark">Agenda personal</p>
          <h2>Recordatorio de Citas</h2>
          <p className="panel-copy">Consulta tus próximas citas y configura tus recordatorios.</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Cargando tus citas...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">No tienes próximas citas programadas.</div>
      ) : (
        <>
          {nextAppointment && (
            <article className="next-appointment">
              <div>
                <p className="eyebrow eyebrow--dark">Próxima cita</p>
                <h3>{nextAppointment.especialidad}</h3>
                <p>{formatDate(nextAppointment.fecha)} · {formatTime(nextAppointment.hora)}</p>
                <p>{nextAppointment.profesional} · {nextAppointment.lugar}</p>
              </div>
              <span className={`status-pill status-pill--${nextAppointment.estado.toLowerCase()}`}>{nextAppointment.estado}</span>
            </article>
          )}

          <div className="reminder-list">
            {upcoming.map((appointment) => {
              const reminder = reminders.find((item) => item.id_cita === appointment.id);
              const reminderValue = reminder?.tiempo_recordatorio || '24 H';
              const enabled = reminder?.activo ?? true;
              return (
                <article className="reminder-card" key={appointment.id}>
                  <div className="reminder-card__info">
                    <p className="appointment-card__date">{formatDate(appointment.fecha)} · {formatTime(appointment.hora)}</p>
                    <h3>{appointment.especialidad}</h3>
                    <p>{appointment.profesional}</p>
                    <span>{appointment.lugar}</span>
                    {reminder?.fecha_programada && <small>Se revisa desde {new Date(reminder.fecha_programada).toLocaleString('es-BO')}</small>}
                  </div>
                  <form className="reminder-card__form" onSubmit={(event) => { event.preventDefault(); onSave(appointment.id, event.currentTarget); }}>
                    <label>
                      <input name="activo" type="checkbox" defaultChecked={enabled} />
                      Recordatorio activado
                    </label>
                    <select name="tiempo_recordatorio" defaultValue={reminderValue}>
                      {reminderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <button type="submit" className="primary-button" disabled={savingId === appointment.id}>
                      {savingId === appointment.id ? 'Guardando...' : 'Guardar'}
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
