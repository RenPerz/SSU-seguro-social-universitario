import { useState, useEffect } from 'react';

export default function Derivaciones({ idPaciente = 101 }) {
  const [derivaciones, setDerivaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/derivaciones/paciente/${idPaciente}`)
      .then((res) => res.json())
      .then((data) => {
        setDerivaciones(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al cargar las derivaciones:', error);
        setCargando(false);
      });
  }, [idPaciente]);

  if (cargando) return <p style={{ textAlign: 'center', padding: '20px' }}>Cargando derivaciones médicas...</p>;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ 
        color: '#0f172a', 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        marginTop: 0, 
        marginBottom: '16px',
        borderBottom: '2px solid #007bc7',
        paddingBottom: '8px'
      }}>
        Traslados y Derivaciones
      </h2>

      {derivaciones.length === 0 ? (
        <p style={{ color: '#666' }}>No hay derivaciones registradas para este paciente.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {derivaciones.map((item) => (
            <div 
              key={item.id} 
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#1e3a8a', 
                fontSize: '1.15rem',
                fontWeight: '600' 
              }}>
                {item.centro_destino}
              </h3>
              
              <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <p style={{ margin: '4px 0' }}><strong>Médico:</strong> {item.medico_derivante}</p>
                <p style={{ margin: '4px 0' }}><strong>Motivo:</strong> {item.motivo}</p>
                <p style={{ margin: '4px 0' }}><strong>Fecha:</strong> {item.fecha_solicitud}</p>
              </div>

              <div style={{ marginTop: '12px' }}>
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    backgroundColor: item.estado === 'Aprobado' ? '#d1fae5' : '#fef3c7',
                    color: item.estado === 'Aprobado' ? '#065f46' : '#92400e'
                  }}
                >
                  {item.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
