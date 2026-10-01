import { useMemo, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';

const sectionContent = {
  inicio: {
    title: 'Inicio',
    subtitle: 'Bienvenido a tu portal institucional del Seguro Social Universitario.',
    description:
      'Consulta tus citas médicas, realiza seguimientos y accede a la información relevante del servicio universitario en un solo lugar.',
  },
  citas: {
    title: 'Mis citas',
    subtitle: 'Agenda y revisa tus turnos de atención.',
    description:
      'Sección preparada para mostrar la próxima cita, especialidad, profesional y estado actual del servicio.',
  },
  recordatorios: {
    title: 'Recordatorios',
    subtitle: 'No olvides tus citas programadas.',
    description:
      'Módulo visual para configurar alertas con tiempos de anticipación y confirmar recordatorios activos.',
  },
  historial: {
    title: 'Historial',
    subtitle: 'Revisa tus atenciones anteriores.',
    description:
      'Vista preparada para mostrar historial clínico y citas pasadas con filtros por fecha y especialidad.',
  },
  perfil: {
    title: 'Perfil',
    subtitle: 'Información personal y de contacto.',
    description:
      'Espacio destinado para datos del estudiante, contacto de emergencia y datos de la cuenta institucional.',
  },
  notificaciones: {
    title: 'Notificaciones',
    subtitle: 'Mantente informado del estado de tus servicios.',
    description:
      'Panel para alertas, mensajes institucionales y notificaciones de citas o cambios de horario.',
  },
};

export default function App() {
  const [activeSection, setActiveSection] = useState('inicio');

  const currentSection = useMemo(
    () => sectionContent[activeSection] ?? sectionContent.inicio,
    [activeSection]
  );

  return (
    <div className="app-shell">
      <Header
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      <div className="layout-shell">
        <Sidebar activeItem={activeSection} onSelect={setActiveSection} />

        <main className="main-panel">
          <section className="hero-panel">
            <div>
              <p className="eyebrow">Sistema universitario</p>
              <h1>{currentSection.title}</h1>
              <p className="section-subtitle">{currentSection.subtitle}</p>
            </div>

            <button type="button" className="primary-button">
              Ver detalle
            </button>
          </section>

          <div className="stats-grid">
            <StatCard title="Próxima cita" value="07 oct" caption="10:30 AM · Medicina general" tone="blue" />
            <StatCard title="Recordatorios" value="3" caption="Activados para esta semana" tone="green" />
            <StatCard title="Especialidades" value="12" caption="Disponibles para atención" tone="violet" />
            <StatCard title="Estado" value="Confirmada" caption="Sin cambios pendientes" tone="amber" />
          </div>

          <section className="content-panel">
            <div className="panel-header">
              <h2>Resumen general</h2>
              <span>Actualizado hoy</span>
            </div>

            <div className="card-grid">
              <article className="info-card">
                <h3>Próxima cita</h3>
                <p>Medicina General</p>
                <strong>Dr. Carlos Mendoza</strong>
                <span>Seguro Social Universitario · Cochabamba</span>
              </article>

              <article className="info-card">
                <h3>Recordatorios</h3>
                <p>24 horas antes</p>
                <strong>Activado</strong>
                <span>Se enviará notificación automática</span>
              </article>

              <article className="info-card">
                <h3>Atención</h3>
                <p>Área de consulta</p>
                <strong>Consulta externa</strong>
                <span>Sin requerimientos adicionales</span>
              </article>
            </div>
          </section>

          <section className="content-panel content-panel--light">
            <div className="panel-header">
              <h2>Información institucional</h2>
            </div>

            <p className="panel-copy">{currentSection.description}</p>
          </section>
        </main>
      </div>
    </div>
  );
}
