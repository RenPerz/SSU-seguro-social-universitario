const menuItems = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'citas', label: 'Mis citas' },
  { id: 'recordatorios', label: 'Recordatorios' },
  { id: 'historial', label: 'Historial' },
  { id: 'perfil', label: 'Perfil' },
  { id: 'notificaciones', label: 'Notificaciones' },
];

export default function Sidebar({ activeItem, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <span className="sidebar__eyebrow">Portal estudiantil</span>
        <h2>SSU</h2>
      </div>

      <nav className="sidebar__nav" aria-label="Menú principal">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar__item ${activeItem === item.id ? 'is-active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__card">
        <p>Atención</p>
        <strong>8:00 - 18:00</strong>
        <span>Lunes a viernes</span>
      </div>
    </aside>
  );
}
