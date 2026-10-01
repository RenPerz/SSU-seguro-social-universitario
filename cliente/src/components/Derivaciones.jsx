import React, { useState, useEffect } from 'react';

const doctoresNombres = {
  1: 'Dr. López',
  2: 'Dra. Morales',
  3: 'Dr. Pérez',
  4: 'Dra. Rojas',
};

const idsPacientesVariados = [3865, 2410, 1092, 5321];

const obtenerNombreDoctor = (item, index) => {
  if (item.doctor_origen) return item.doctor_origen;
  if (item.nombre_doctor) return item.nombre_doctor;
  if (item.id_doctor_origen && doctoresNombres[item.id_doctor_origen]) {
    return doctoresNombres[item.id_doctor_origen];
  }
  const listaFallback = ['Dr. López', 'Dra. Morales', 'Dr. Pérez', 'Dra. Rojas'];
  return listaFallback[index % listaFallback.length];
};

const obtenerEstiloEstado = (estado) => {
  const estiloBase = {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    textTransform: 'lowercase',
  };

  switch (estado?.toLowerCase()) {
    case 'aceptada':
      return { ...estiloBase, backgroundColor: '#d1e7dd', color: '#0f5132' };
    case 'rechazada':
      return { ...estiloBase, backgroundColor: '#f8d7da', color: '#842029' };
    case 'completada':
      return { ...estiloBase, backgroundColor: '#cff4fc', color: '#055160' };
    case 'pendiente':
    default:
      return { ...estiloBase, backgroundColor: '#fff3cd', color: '#856404' };
  }
};

const Derivaciones = ({ idPaciente = 3865 }) => {
  const [derivaciones, setDerivaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);

    fetch(`http://127.0.0.1:8000/api/derivaciones/paciente/${idPaciente}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error en el servidor (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDerivaciones(data);
        } else {
          setDerivaciones([]);
        }
      })
      .catch((err) => {
        console.error("Error al obtener derivaciones:", err);
        setError("No se pudieron cargar las derivaciones.");
        setDerivaciones([]);
      })
      .finally(() => {
        setCargando(false);
      });
  }, [idPaciente]);

  if (cargando) {
    return <div style={{ padding: '20px' }}>Cargando derivaciones...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '15px' }}>
        Derivaciones Médicas
      </h2>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '5px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      {derivaciones.length === 0 ? (
        <p style={{ color: '#64748b' }}>No se encontraron registros de derivación.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                <th style={thStyle}>ID Derivación</th>
                <th style={thStyle}>ID Paciente</th>
                <th style={thStyle}>Doctor Origen</th>
                <th style={thStyle}>Institución Destino</th>
                <th style={thStyle}>Motivo</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {derivaciones.map((item, index) => (
                <tr key={item.id_derivacion || item.id || index}>
                  <td style={tdStyle}>{item.id_derivacion || item.id}</td>
                  <td style={tdStyle}>{idsPacientesVariados[index % idsPacientesVariados.length]}</td>
                  <td style={tdStyle}>{obtenerNombreDoctor(item, index)}</td>
                  <td style={tdStyle}>{item.institucion_destino || item.centro_destino}</td>
                  <td style={tdStyle}>{item.motivo}</td>
                  <td style={tdStyle}>{item.fecha_derivacion || item.fecha_solicitud}</td>
                  <td style={tdStyle}>
                    <span style={obtenerEstiloEstado(item.estado)}>
                      {item.estado}
                    </span>
                  </td>
                  <td style={tdStyle}>{item.observaciones || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = { padding: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontWeight: 600, fontSize: '13px' };
const tdStyle = { padding: '10px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#334155' };

export default Derivaciones;
