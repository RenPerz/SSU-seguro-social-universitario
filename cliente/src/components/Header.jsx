import React, { useState } from 'react';

import ssuLogo from '../assets/logoSSU.jpg'; 

export default function Header({ seccionActiva, onCambiarSeccion }) {
  const menuOpciones = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'institucional', label: 'Institucional' },
    { id: 'medica', label: 'Área Médica' },
    { id: 'administrativa', label: 'Área Administrativa' },
    { id: 'transparencia', label: 'Transparencia' },
    { id: 'normativa', label: 'Normativa' },
    { id: 'biblioteca', label: 'Biblioteca SSU' },
  ];

  return (
    <header style={{ width: '100%', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
      

      {/* Cabecera institucional con Logo y Títulos */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          
          <img 
            src={ssuLogo} 
            alt="Logo Seguro Social Universitario" 
            style={{
              width: 'auto',   
              height: '150px',  
              display: 'block',
              objectFit: 'contain' 
            }}
          />
          {/* ------------------------------------ */}

          <div>
            <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#003770', margin: 0, lineHeight: 1.1 }}>
              SSU
            </h1>
            <p style={{ fontSize: '28px', fontWeight: '500', color: '#003770', margin: '4px 0 0 0' }}>
              Seguro Social Universitario Cochabamba
            </p>
          </div>
        </div>

        {/* Marcador territorial decorativo */}
        <span style={{ fontSize: '28px', fontWeight: '700', color: '#003770', letterSpacing: '1px' }}>
          COCHABAMBA - BOLIVIA
        </span>
      </div>

      {/* Menú de Botones / Secciones */}
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