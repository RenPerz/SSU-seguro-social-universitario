import React, { useState } from 'react';
import Header from './components/Header';

export default function App() {
  const [seccion, setSeccion] = useState('inicio');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header seccionActiva={seccion} onCambiarSeccion={setSeccion} />

      {/* Contenedor central según el botón activo */}
      <main style={{ flex: 1, padding: '30px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <section style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
            Sección: {seccion.toUpperCase()}
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Aquí se cargarán los módulos correspondientes (servicios, citas, información institucional, etc.).
          </p>
        </section>
      </main>
    </div>
  );
}