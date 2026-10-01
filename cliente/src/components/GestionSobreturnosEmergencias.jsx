import React, { useState, useEffect } from 'react';

const AZUL = '#003770';
const ROJO = '#E30613';
const BLANCO = '#FFFFFF';
const GRIS_BORDE = '#e2e8f0';
const API_URL = 'http://127.0.0.1:8000';

export default function GestionSobreturnosEmergencias() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    paciente: '',
    ci: '',
    tipo: 'sobreturno',
    motivo: '',
    medico: '',
  });

  // Cargar ingresos del día desde el backend
  const cargarRegistros = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/sobreturnos`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setRegistros(data);
    } catch (e) {
      setError(e.message);
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const agregarRegistro = async (e) => {
    e.preventDefault();
    if (!form.paciente || !form.ci || !form.motivo) return;

    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/sobreturnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente: form.paciente,
          ci: form.ci,
          tipo: form.tipo,
          motivo: form.motivo,
          medico: form.medico || null,
        }),
      });
      if (!res.ok) {
        const detalle = await res.json().catch(() => ({}));
        throw new Error(detalle.detail || `Error ${res.status}`);
      }
      // Recargar la lista para tener los datos reales del servidor
      await cargarRegistros();
      setForm({ paciente: '', ci: '', tipo: 'sobreturno', motivo: '', medico: '' });
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const estiloBadge = (tipo) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    backgroundColor: tipo === 'emergencia' ? ROJO : '#ffd6d9',
    color: tipo === 'emergencia' ? BLANCO : '#8a030b',
  });

  return (
    <div>
      <h2 style={{ fontSize: '22px', color: AZUL, marginBottom: '6px' }}>
        Gestión de Sobreturnos y Emergencias
      </h2>
      <p style={{ color: '#475569', marginBottom: '20px', lineHeight: '1.6' }}>
        Registro y seguimiento de pacientes sin cita previa y emergencias.
      </p>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Formulario */}
        <div style={{ border: `1px solid ${GRIS_BORDE}`, borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: AZUL, marginBottom: '16px', fontSize: '16px' }}>
            Registrar nuevo ingreso
          </h3>
          <form onSubmit={agregarRegistro}>
            <Campo label="Nombre del paciente">
              <input
                type="text"
                name="paciente"
                value={form.paciente}
                onChange={manejarCambio}
                placeholder="Ej: Ana Flores Gutiérrez"
                required
                style={inputStyle}
              />
            </Campo>

            <Campo label="Carnet de identidad">
              <input
                type="text"
                name="ci"
                value={form.ci}
                onChange={manejarCambio}
                placeholder="Ej: 9988776"
                required
                style={inputStyle}
              />
            </Campo>

            <Campo label="Tipo de atención">
              <select name="tipo" value={form.tipo} onChange={manejarCambio} style={inputStyle}>
                <option value="sobreturno">Sobreturno</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </Campo>

            <Campo label="Motivo">
              <textarea
                name="motivo"
                rows="3"
                value={form.motivo}
                onChange={manejarCambio}
                placeholder="Describa brevemente el motivo de consulta"
                required
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Campo>

            <Campo label="Médico asignado">
              <input
                type="text"
                name="medico"
                value={form.medico}
                onChange={manejarCambio}
                placeholder="Ej: Dr. Ramírez"
                style={inputStyle}
              />
            </Campo>

            <button
              type="submit"
              disabled={guardando}
              style={{
                padding: '10px 20px',
                backgroundColor: guardando ? '#94a3b8' : ROJO,
                color: BLANCO,
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: guardando ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              {guardando ? 'Registrando...' : 'Registrar ingreso'}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div style={{ border: `1px solid ${GRIS_BORDE}`, borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: AZUL, marginBottom: '16px', fontSize: '16px' }}>
            Ingresos del día
          </h3>

          {cargando ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>
              Cargando ingresos...
            </p>
          ) : registros.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '30px', fontStyle: 'italic' }}>
              No hay ingresos registrados hoy.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {registros.map((r) => (
                <div
                  key={r.id}
                  style={{
                    border: `1px solid ${GRIS_BORDE}`,
                    borderLeft: `4px solid ${r.tipo === 'emergencia' ? ROJO : AZUL}`,
                    borderRadius: '6px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: '#1e293b' }}>{r.paciente}</strong>
                    <span style={estiloBadge(r.tipo)}>{r.tipo}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    CI: {r.ci} · {r.hora}
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
                    <strong>Motivo:</strong> {r.motivo}
                  </div>
                  {r.medico && (
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>
                      <strong>Médico:</strong> {r.medico}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                    Estado: <strong>{r.estado}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: AZUL }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: '10px 12px',
  border: `1.5px solid ${GRIS_BORDE}`,
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
};