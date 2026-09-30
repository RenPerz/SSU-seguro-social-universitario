import React, { useState, useEffect } from 'react';

export default function CatalogoMedicamentos() {
  const [busqueda, setBusqueda] = useState('');
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const consultarMedicamentos = async (termino = '') => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/medicamentos/buscar?q=${encodeURIComponent(termino)}`);
      if (!res.ok) throw new Error('Error al conectar con el servidor backend');
      const data = await res.json();
      setMedicamentos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    consultarMedicamentos('');
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    consultarMedicamentos(busqueda);
  };

  const getBadgeStyle = (disponibilidad) => {
    if (disponibilidad === 'Disponible') {
      return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    }
    if (disponibilidad === 'Stock Bajo') {
      return { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' };
    }
    return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '8px' }}>
        Catálogo y Disponibilidad de Medicamentos
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        Consulta el stock en la farmacia institucional y las indicaciones básicas de tratamiento.
      </p>

      {/* Buscador interactivo */}
      <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Escribe el nombre genérico o comercial (ej. Paracetamol, Ibuprofeno)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Buscar
        </button>
      </form>

      {cargando && <p style={{ color: '#0284c7', fontWeight: '500' }}>Buscando medicamentos...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {/* Lista de medicamentos */}
      {!cargando && !error && (
        <div style={{ display: 'grid', gap: '15px' }}>
          {medicamentos.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No se encontraron medicamentos registrados con ese nombre.</p>
          ) : (
            medicamentos.map((item) => (
              <div
                key={item.id_medicamento}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '18px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                      {item.nombre_generico}
                    </h3>
                    {item.nombre_comercial && (
                      <span style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>
                        ({item.nombre_comercial})
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '6px 0 10px 0', fontSize: '13px', color: '#475569' }}>
                    <strong>Presentación:</strong> {item.presentacion} — <strong>Concentración:</strong> {item.concentracion}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                    <strong>Tratamiento:</strong> {item.descripcion_tratamiento}
                  </p>
                </div>

                <div style={{ textAlign: 'right', minWidth: '130px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      ...getBadgeStyle(item.disponibilidad)
                    }}
                  >
                    {item.disponibilidad}
                  </span>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    Stock: <strong>{item.stock}</strong> u.
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}