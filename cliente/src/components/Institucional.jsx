import React from 'react';

export default function Institucional() {
  const secciones = [
    {
      titulo: 'Misión',
      texto:
        'El Seguro Social Universitario proporciona servicios integrales de salud de calidad a la población asegurada y estudiantil, promoviendo el bienestar, la atención oportuna y el acceso equitativo a la salud.',
      imagen: '/mision.jpg',
    },
    {
      titulo: 'Visión',
      texto:
        'El Seguro Social Universitario Cochabamba será reconocido por su liderazgo en atención integral en salud, por su cultura organizacional, investigación y docencia, enmarcado en la acreditación de sus servicios.',
      imagen: '/vision.jpg',
    },
    {
      titulo: 'Valores y Principios',
      texto:
        'Los Valores del Seguro Social Universitario son: Lealtad, compromiso, tolerancia, transparencia, respeto, equidad y justicia.',
      imagen: '/valores.jpg',
    },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0' }}>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '32px',
        }}
      >
        Misión, Visión, Valores y Principios.
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {secciones.map((sec, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '28px',
              backgroundColor: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {/* Contenedor de Imagen */}
            <div
              style={{
                flex: '0 0 320px',
                height: '180px',
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              }}
            >
              <img
                src={sec.imagen}
                alt={sec.titulo}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Texto descriptivo */}
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 12px 0',
                }}
              >
                {sec.titulo}
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: '1.65',
                  color: '#475569',
                  margin: 0,
                }}
              >
                {sec.texto}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}