import React, { useState, useEffect } from 'react';

export default function ReservaFichas() {
  const [doctores, setDoctores] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [formData, setFormData] = useState({
    id_paciente: 101,
    id_doctor: '',
    id_horario: '',
    motivo: ''
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/doctores')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDoctores(data);
      })
      .catch((err) => console.error('Error al cargar doctores:', err));
  }, []);

  const handleDoctorChange = async (e) => {
    const idDoc = e.target.value;
    setFormData({ ...formData, id_doctor: idDoc, id_horario: '' });
    setHorarios([]);

    if (!idDoc) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/doctores/${idDoc}/horarios`);
      const data = await res.json();
      console.log("Horarios recibidos:", data);
      if (Array.isArray(data)) {
        setHorarios(data);
      } else {
        setHorarios([]);
      }
    } catch (err) {
      console.error('Error al cargar horarios:', err);
      setHorarios([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/citas-con-horario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_paciente: parseInt(formData.id_paciente),
          id_doctor: parseInt(formData.id_doctor),
          id_horario: parseInt(formData.id_horario),
          motivo: formData.motivo
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMensaje(data.mensaje || '¡Ficha médica reservada con éxito!');
      setFormData({ id_paciente: 101, id_doctor: '', id_horario: '', motivo: '' });
      setHorarios([]);
    } catch (err) {
      setError(err.message || 'Error al procesar la reserva.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '24px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
        Reserva de Ficha Médica
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        Seleccione un especialista para visualizar sus turnos y cupos disponibles.
      </p>

      {mensaje && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          {mensaje}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
            Especialista / Médico:
          </label>
          <select
            name="id_doctor"
            value={formData.id_doctor}
            onChange={handleDoctorChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
          >
            <option value="">-- Seleccione un médico --</option>
            {doctores.map((doc) => (
              <option key={doc.id_doctor} value={doc.id_doctor}>
                {doc.nombre_completo} ({doc.especialidad || 'General'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
            Horario de Atención Disponible:
          </label>
          <select
            name="id_horario"
            value={formData.id_horario}
            onChange={handleChange}
            required
            disabled={!formData.id_doctor || horarios.length === 0}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: !formData.id_doctor ? '#f1f5f9' : '#fff' }}
          >
            <option value="">
              {!formData.id_doctor ? '-- Primero seleccione un médico --' : horarios.length === 0 ? '-- No hay turnos disponibles --' : '-- Seleccione un turno --'}
            </option>
            {horarios.map((h) => {
              // Protección contra propiedades nulas o formato de hora en objetos timedelta de python
              const horaInicio = h.hora_inicio ? String(h.hora_inicio).slice(0, 5) : '00:00';
              const horaFin = h.hora_fin ? String(h.hora_fin).slice(0, 5) : '00:00';
              return (
                <option key={h.id_horario} value={h.id_horario}>
                  📅 {h.fecha} ⏰ {horaInicio} - {horaFin} ({h.consultorio || 'Consultorio'}) — Cupos libres: {h.cupos_disponibles}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
            Motivo de consulta:
          </label>
          <textarea
            name="motivo"
            rows="3"
            value={formData.motivo}
            onChange={handleChange}
            placeholder="Breve descripción de los síntomas o consulta..."
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            backgroundColor: cargando ? '#94a3b8' : '#0284c7',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '600',
            cursor: cargando ? 'not-allowed' : 'pointer',
            marginTop: '8px'
          }}
        >
          {cargando ? 'Procesando reserva...' : 'Confirmar Reserva de Ficha'}
        </button>
      </form>
    </div>
  );
}