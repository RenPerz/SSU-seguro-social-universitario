import React, { useState, useEffect } from 'react';

const AZUL = '#003770';
const ROJO = '#E30613';
const BLANCO = '#FFFFFF';
const GRIS_BORDE = '#e2e8f0';
const API_URL = 'http://127.0.0.1:8000';

export default function ResultadosLaboratorio() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar resultados desde el backend
  const cargarResultados = async (termino = '') => {
    setCargando(true);
    setError(null);
    try {
      const url = termino
        ? `${API_URL}/api/laboratorios?q=${encodeURIComponent(termino)}`
        : `${API_URL}/api/laboratorios`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setResultados(data);
    } catch (e) {
      setError(e.message);
      setResultados([]);
    } finally {
      setCargando(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarResultados();
  }, []);

  // Buscar con debounce (300 ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarResultados(busqueda);
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const estiloBadge = (estado) => {
    const estilos = {
      listo: { bg: '#d1e7dd', color: '#0f5132' },
      entregado: { bg: '#cfe2ff', color: '#084298' },
      en_proceso: { bg: '#fff3cd', color: '#856404' },
      pendiente: { bg: '#fff3cd', color: '#856404' },
    };
    const s = estilos[estado] || estilos.pendiente;
    return {
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      backgroundColor: s.bg,
      color: s.color,
    };
  };

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

      {/* Estados: cargando / error / tabla */}
      {cargando ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
          Cargando resultados...
        </p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: ROJO, padding: '30px' }}>
          Error al cargar: {error}
        </p>
      ) : resultados.length === 0 ? (
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
              {resultados.map((r) => (
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