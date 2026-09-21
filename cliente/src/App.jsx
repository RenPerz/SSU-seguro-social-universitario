import React, { useState } from 'react';
import Header from './components/Header';

export default function App() {
  const [seccion, setSeccion] = useState('inicio');

  const renderizarContenido = () => {
    switch (seccion) {
      case 'inicio':
        return (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>
              Portal Seguro Social Universitario
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Bienvenido a la plataforma web del SSU Cochabamba. Accede rápidamente a tus consultas, reservas y resultados.
            </p>
          </div>
        );

      case 'institucional':
        return (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>
              Información Institucional
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Misión, visión, organigrama y normativas de atención al asegurado.
            </p>
          </div>
        );

      case 'horarios':
        return (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>
              Horarios y Disponibilidad
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Cronograma de atención médica, turnos de guardia y disponibilidad de especialistas.
            </p>
          </div>
        );

      case 'fichas':
        return (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>
              Reserva de Fichas
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Sistema de fichaje en línea para consulta externa y especialidades.
            </p>
          </div>
        );

      case 'medicinas':
        return (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>
              Catálogo de Medicamentos
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Consulta de stock y vademécum de la farmacia institucional.
            </p>
          </div>
        );

      case 'receyorde':
        return (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>
              Recetas y Órdenes Médicas
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Historial de recetas prescritas y órdenes de exámenes complementarios emitidas.
            </p>
          </div>
        );

      case 'laboratorios':
        return (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>
              Resultados de Laboratorios
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Visualización y descarga de informes de análisis clínicos e imagenología.
            </p>
          </div>
        );

      case 'biblioteca':
        return (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>
              Biblioteca SSU
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Guías clínicas de diagnóstico y tratamiento, protocolos médicos y material educativo.
            </p>
          </div>
        );

      default:
        return <p>Seleccione una opción del menú.</p>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header seccionActiva={seccion} onCambiarSeccion={setSeccion} />

      <main style={{ flex: 1, padding: '30px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <section style={{ 
          backgroundColor: '#ffffff', 
          padding: '30px', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
        }}>
          {renderizarContenido()}
        </section>
      </main>
    </div>
  );
}