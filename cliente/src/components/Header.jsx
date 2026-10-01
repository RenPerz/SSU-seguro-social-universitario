import ssuLogo from '../assets/logoSSU.jpg';

const menuOpciones = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'citas', label: 'Mis citas' },
  { id: 'recordatorios', label: 'Recordatorios' },
  { id: 'historial', label: 'Historial' },
  { id: 'perfil', label: 'Perfil' },
  { id: 'notificaciones', label: 'Notificaciones' },
];

export default function Header({ activeSection, onSelectSection }) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <img src={ssuLogo} alt="Logo Seguro Social Universitario" className="topbar__logo" />

        <div>
          <p className="topbar__name">Seguro Social Universitario</p>
          <h1>SSU Cochabamba</h1>
        </div>
      </div>

      <div className="topbar__location">COCHABAMBA · BOLIVIA</div>

      <nav className="topbar__nav" aria-label="Navegación principal">
        {menuOpciones.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`topbar__nav-item ${activeSection === option.id ? 'is-active' : ''}`}
            onClick={() => onSelectSection(option.id)}
          >
            {option.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
