export default function Inicio() {
  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Banner a ancho completo de borde a borde de la pantalla */}
      <div 
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '28px',
          overflow: 'hidden'
        }}
      >
        <img 
          src="/inicio.jpg" 
          alt="Horario de Visitas e Información SSU" 
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '360px', /* Limita la altura para que no se deforme en monitores muy anchos */
            display: 'block',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>

      {/* Contenedor del contenido restante con margen adecuado */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '8px' }}>
          Bienvenido al Portal del Seguro Social Universitario
        </h2>
        <p style={{ color: '#475569', lineHeight: '1.6' }}>
          Seleccione una de las opciones del menú superior para acceder a los servicios médicos y administrativos.
        </p>
      </div>
    </div>
  );
}