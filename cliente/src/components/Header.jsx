import React from 'react';
import ssuLogo from '../assets/logossu.jpg';

export default function Header({ seccionActiva, onCambiarSeccion }) {
  const menuOpciones = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'institucional', label: 'Institucional' },
    { id: 'horarios', label: 'Horarios y Disponibilidad' },
    { id: 'fichas', label: 'Reserva de Fichas' },
    { id: 'medicinas', label: 'Catálogo Medicamentos' },
    { id: 'receyorde', label: 'Recetas y Órdenes' },
    { id: 'laboratorios', label: 'Resultados de Laboratorios' },
    { id: 'biblioteca', label: 'Biblioteca SSU' },
  ];

  return (
    <header style={{ width: '100%', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
      

      {/* Cabecera principal con logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <img 
            src={ssuLogo} 
            alt="Logo Seguro Social Universitario" 
            style={{
              width: 'auto',
              height: '60px',
              display: 'block',
              objectFit: 'contain'
            }}
          />
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.1 }}>
              SSU
            </h1>
            <p style={{ fontSize: '17px', fontWeight: '500', color: '#334155', margin: '4px 0 0 0' }}>
              Seguro Social Universitario Cochabamba
            </p>
          </div>
        </div>

        <span style={{ fontSize: '13px', fontWeight: '700', color: '#b91c1c', letterSpacing: '1px' }}>
          COCHABAMBA - BOLIVIA
        </span>
      </div>

      {/* Barra de navegación */}
      <nav style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '2px solid #0284c7' }}>
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: '0 25px', gap: '4px', overflowX: 'auto' }}>
          {menuOpciones.map((opcion) => {
            const activo = seccionActiva === opcion.id;
            return (
              <li key={opcion.id}>
                <button
                  onClick={() => onCambiarSeccion(opcion.id)}
                  style={{
                    background: activo ? '#0284c7' : 'transparent',
                    color: activo ? '#ffffff' : '#334155',
                    border: 'none',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: activo ? '600' : '500',
                    cursor: 'pointer',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!activo) e.target.style.backgroundColor = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    if (!activo) e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {opcion.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}