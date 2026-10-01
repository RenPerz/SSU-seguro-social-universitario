import React, { useState, useEffect } from 'react';

const thStyle = { padding: '10px 12px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontWeight: 600, fontSize: '13px', color: '#0f172a' };
const tdStyle = { padding: '10px 12px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#334155' };

const obtenerEstiloEstado = (estado) => {
  const baseStyle = { padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' };
  switch (estado?.toLowerCase()) {
    case 'vigente': return { ...baseStyle, backgroundColor: '#d1e7dd', color: '#0f5132' };
    case 'concluida': return { ...baseStyle, backgroundColor: '#e2e8f0', color: '#475569' };
    default: return { ...baseStyle, backgroundColor: '#e2e8f0', color: '#475569' };
  }
};

const BajasMedicas = () => {
  const [bajas, setBajas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/bajas-medicas')
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener datos');
        return res.json();
      })
      .then((data) => {
        setBajas(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error conectando a la API:", error);
        setCargando(false);
      });
  }, []);

  const bajasFiltradas = bajas.filter((item) => {
    const termino = busqueda.toLowerCase();
    return (item.paciente || '').toLowerCase().includes(termino) || 
           (item.matricula || '').toLowerCase().includes(termino) ||
           (item.nro_certificado || '').toLowerCase().includes(termino) ||
           (item.doctor || '').toLowerCase().includes(termino) ||
           (item.tipo_baja || '').toLowerCase().includes(termino);
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '4px' }}>Certificados de Baja Médica (Incapacidad Temporal)</h2>
      <p style={{ color: '#475569', marginBottom: '20px', fontSize: '14px' }}>
        Registro de certificados de incapacidad laboral emitidos por los médicos del Seguro Social Universitario.
      </p>
      
      {/* Buscador */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por N° certificado, paciente, matrícula o motivo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '380px', fontSize: '13px' }}
        />
      </div>

      {/* Tabla de Certificados */}
      {cargando ? (
        <p>Cargando registro de bajas médicas...</p>
      ) : bajasFiltradas.length === 0 ? (
        <p style={{ color: '#64748b' }}>No se encontraron certificados de baja médica registrados.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={thStyle}>N° Certificado</th>
              <th style={thStyle}>Asegurado / Paciente</th>
              <th style={thStyle}>Matrícula</th>
              <th style={thStyle}>Médico / Especialidad</th>
              <th style={thStyle}>Motivo</th>
              <th style={thStyle}>Días</th>
              <th style={thStyle}>Periodo (Inicio - Fin)</th>
              <th style={thStyle}>Diagnóstico</th>
              <th style={thStyle}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {bajasFiltradas.map((item) => (
              <tr key={item.id}>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: '#0369a1' }}>{item.nro_certificado}</td>
                <td style={{ ...tdStyle, fontWeight: '600' }}>{item.paciente}</td>
                <td style={tdStyle}><code>{item.matricula}</code></td>
                <td style={tdStyle}>
                  <div>{item.doctor}</div>
                  <small style={{ color: '#64748b' }}>{item.especialidad}</small>
                </td>
                <td style={tdStyle}>{item.tipo_baja}</td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>{item.dias_incapacidad} d.</td>
                <td style={tdStyle}>{item.fecha_inicio} al {item.fecha_fin}</td>
                <td style={tdStyle}>{item.diagnostico}</td>
                <td style={tdStyle}>
                  <span style={obtenerEstiloEstado(item.estado)}>{item.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BajasMedicas;
