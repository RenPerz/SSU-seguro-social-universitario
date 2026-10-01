import React, { useState } from 'react';

const AZUL = '#003770';
const ROJO = '#E30613';
const BLANCO = '#FFFFFF';
const GRIS_BORDE = '#e2e8f0';

export default function ResultadosLaboratorio() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados] = useState([
    {
      id: 1,
      paciente: 'Juan Pérez Mamani',
      ci: '8765432',
      examen: 'Hemograma completo',
      fecha: '2026-09-28',
      estado: 'listo',
      resultado: 'Valores dentro del rango normal',
    },
    {
      id: 2,
      paciente: 'María Quispe Rojas',
      ci: '7654321',
      examen: 'Glucosa en ayunas',
      fecha: '2026-09-29',
      estado: 'pendiente',
      resultado: '-',
    },
    {
      id: 3,
      paciente: 'Carlos Choque Villca',
      ci: '6543210',
      examen: 'Perfil lipídico',
      fecha: '2026-09-29',
      estado: 'listo',
      resultado: 'Colesterol elevado (220 mg/dL)',
    },
  ]);

  const filtrados = resultados.filter(
    (r) =>
      r.paciente.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.ci.includes(busqueda) ||
      r.examen.toLowerCase().includes(busqueda.toLowerCase())
  );

  const estiloBadge = (estado) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    backgroundColor: estado === 'listo' ? '#d1e7dd' : '#fff3cd',
    color: estado === 'listo' ? '#0f5132' : '#856404',
  });

  return (
    <div>
      <h2 style={{ fontSize: '22px', color: AZUL, marginBottom: '6px' }}>
        Resultados de Laboratorio
      </h2>
      <p style={{ color: '#475569', marginBottom: '20px', lineHeight: '1.6' }}>
        Consulta y registro de exámenes de laboratorio clínico.
      </p>

      {/* Buscador */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por paciente, CI o examen..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '10px 14px',
            border: `1.5px solid ${GRIS_BORDE}`,
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: AZUL,
            color: BLANCO,
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Nuevo Resultado
        </button>
      </div>

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontStyle: 'italic' }}>
          No se encontraron resultados.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: AZUL, color: BLANCO }}>
                <th style={thStyle}>Paciente</th>
                <th style={thStyle}>CI</th>
                <th style={thStyle}>Examen</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${GRIS_BORDE}` }}>
                  <td style={tdStyle}>{r.paciente}</td>
                  <td style={tdStyle}>{r.ci}</td>
                  <td style={tdStyle}>{r.examen}</td>
                  <td style={tdStyle}>{r.fecha}</td>
                  <td style={tdStyle}>
                    <span style={estiloBadge(r.estado)}>{r.estado}</span>
                  </td>
                  <td style={tdStyle}>{r.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px' };
const tdStyle = { padding: '12px 16px', color: '#334155' };