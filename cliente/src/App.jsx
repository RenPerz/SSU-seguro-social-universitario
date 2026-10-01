import React, { useState } from 'react';
import Header from './components/Header';
import CatalogoMedicamentos from './components/CatalogoMedicamentos';
import Derivaciones from './components/Derivaciones';
import Institucional from './components/Institucional';
import Inicio from './components/Inicio';
import ResultadosLaboratorio from './components/ResultadosLaboratorio';
import GestionSobreturnosEmergencias from './components/GestionSobreturnosEmergencias';
import ReservaFichas from './components/ReservaFichas';
import RecetasyOrdenes from './components/Recetas y Ordenes';
import BajasMedicas from './components/BajasMedicas';

export default function App() {
  const [seccion, setSeccion] = useState('inicio');

  const renderizarContenido = () => {
    switch (seccion) {
      case 'inicio':
        return <Inicio />;

      case 'institucional':
        return <Institucional />;

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
        return <ReservaFichas />;

      case 'medicinas':
        return <CatalogoMedicamentos />;

      case 'receyorde':
        return <RecetasyOrdenes />;
        

      // 👇 NUEVA: Resultados de Laboratorio (componente real)
      case 'laboratorios':
        return <ResultadosLaboratorio />;

      // 👇 NUEVA: Sobreturnos y Emergencias
      case 'sobreturnos':
        return <GestionSobreturnosEmergencias />;

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

        case 'bajas_medicas':   
      return <BajasMedicas />;  

      case 'derivaciones':
        return <Derivaciones />;

      default:
        return <p>Seleccione una opción del menú.</p>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header seccionActiva={seccion} onCambiarSeccion={setSeccion} />

      <main style={{ flex: 1, padding: '30px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <section
          style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {renderizarContenido()}
        </section>
      </main>
    </div>
  );
}
