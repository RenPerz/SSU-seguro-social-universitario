import React, { useState, useEffect } from 'react';

const thStyle = { padding: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontWeight: 600, fontSize: '13px', color: '#0f172a' };
const tdStyle = { padding: '10px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#334155' };

const obtenerEstiloEstado = (estado) => {
  const baseStyle = { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' };
  switch (estado?.toLowerCase()) {
    case 'disponible': return { ...baseStyle, backgroundColor: '#d1e7dd', color: '#0f5132' };
    case 'pocos cupos': return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
    case 'agotado': return { ...baseStyle, backgroundColor: '#f8d7da', color: '#842029' };
    default: return { ...baseStyle, backgroundColor: '#e2e8f0', color: '#475569' };
  }
};

const HorariosDisponibilidad = () => {
  const [horarios, setHorarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState('Todas');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/horarios')
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener datos');
        return res.json();
      })
      .then((data) => {
        setHorarios(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error conectando a la API:", error);
        setCargando(false);
      });
  }, []);

  const horariosFiltrados = horarios.filter((item) => {
    const coincideBusqueda = (item.doctor || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                             (item.especialidad || '').toLowerCase().includes(busqueda.toLowerCase());
    const coincideEspecialidad = especialidadFiltro === 'Todas' || item.especialidad === especialidadFiltro;
    return coincideBusqueda && coincideEspecialidad;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '8px' }}>Horarios y Disponibilidad Médica</h2>
      
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por doctor o especialidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '300px' }}
        />
        <select
          value={especialidadFiltro}
          onChange={(e) => setEspecialidadFiltro(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
        >
          <option value="Todas">Todas las especialidades</option>
          <option value="Cardiología">Cardiología</option>
          <option value="Gastroenterología">Gastroenterología</option>
          <option value="Medicina General">Medicina General</option>
          <option value="Pediatría">Pediatría</option>
          <option value="Traumatología">Traumatología</option>
        </select>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p>Cargando horarios desde la base de datos...</p>
      ) : horariosFiltrados.length === 0 ? (
        <p style={{ color: '#64748b' }}>No se encontraron horarios.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={thStyle}>Especialidad</th>
              <th style={thStyle}>Médico</th>
              <th style={thStyle}>Consultorio</th>
              <th style={thStyle}>Días</th>
              <th style={thStyle}>Horario (Turno)</th>
              <th style={thStyle}>Fichas Disp.</th>
              <th style={thStyle}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {horariosFiltrados.map((item) => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.especialidad}</td>
                <td style={{ ...tdStyle, fontWeight: '600' }}>{item.doctor}</td>
                <td style={tdStyle}>{item.consultorio}</td>
                <td style={tdStyle}>{item.dias}</td>
                <td style={tdStyle}>{item.horario} <small>({item.turno})</small></td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{item.fichas_disponibles}</td>
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

export default HorariosDisponibilidad;
