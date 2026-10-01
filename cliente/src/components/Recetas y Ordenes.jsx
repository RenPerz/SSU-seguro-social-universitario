import React, { useState, useEffect } from 'react';

export default function RecetasyOrdenes() {
  const [recetas, setRecetas] = useState([]);

  useEffect(() => {
    const datosSimulados = [
      {
        id: "REC-2026-0929",
        fecha: "29 de Septiembre, 2026",
        medico: "Dr. Carlos Mendoza (Medicina General)",
        diagnostico: "Infección respiratoria aguda",
        medicamentos: [
          { nombre: "Amoxicilina 500mg", indicacion: "1 tableta cada 8 horas por 7 días" },
          { nombre: "Ibuprofeno 400mg", indicacion: "1 tableta cada 8 horas en caso de fiebre" }
        ],
        ordenes: [
          { tipo: "Laboratorio", detalle: "Hemograma completo" }
        ]
      }
    ];
    setRecetas(datosSimulados);
  }, []);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
          Recetas y Órdenes Médicas
        </h2>
        <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>
          Historial de recetas prescritas y órdenes de exámenes complementarios emitidas.
        </p>
      </div>

      {recetas.map((receta) => (
        <div 
          key={receta.id} 
          style={{ 
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '15px' }}>
            <strong style={{ color: '#003770', fontSize: '16px' }}>Nº {receta.id}</strong>
            <span style={{ color: '#64748b', fontSize: '14px' }}>{receta.fecha}</span>
          </div>
          <p style={{ margin: '4px 0', color: '#334155', fontSize: '14px' }}><strong>Médico Tratante:</strong> {receta.medico}</p>
          <p style={{ margin: '4px 0', color: '#334155', fontSize: '14px' }}><strong>Diagnóstico:</strong> {receta.diagnostico}</p>

          <h4 style={{ marginTop: '16px', marginBottom: '8px', color: '#0284c7', fontSize: '15px' }}> Medicamentos Recetados:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {receta.medicamentos.map((med, index) => (
              <li key={index} style={{ marginBottom: '6px', color: '#334155', fontSize: '14px' }}>
                <strong>{med.nombre}</strong> — {med.indicacion}
              </li>
            ))}
          </ul>

          {receta.ordenes.length > 0 && (
            <>
              <h4 style={{ marginTop: '16px', marginBottom: '8px', color: '#0284c7', fontSize: '15px' }}> Órdenes de Estudio:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {receta.ordenes.map((orden, index) => (
                  <li key={index} style={{ marginBottom: '6px', color: '#334155', fontSize: '14px' }}>
                    <strong>{orden.tipo}:</strong> {orden.detalle}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>
              Descargar PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
