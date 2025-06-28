import React from 'react';
import BarraEmpleados from './BarraEmpleados'; // Barra de navegación especial para pacientes
import FooterEmpleado from './FooterEmpleado'; // Pie de página especial para pacientes

const LayoutPaciente = ({ children }) => {
  return (
    <div className="layout-paciente">
      <header>
        <BarraEmpleados/>
      </header>
      <main className="main-content-paciente">
        {children}
      </main>
      <footer>
        <FooterEmpleado />
      </footer>
    </div>
  );
}

export default LayoutPaciente;