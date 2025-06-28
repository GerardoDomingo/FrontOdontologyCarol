// AppointmentContext.js
import React, { createContext, useState, useContext } from 'react';

/**
 * Contexto para gestionar los datos de citas y tratamientos
 * Permite compartir información entre componentes sin usar localStorage
 */
const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointmentData, setAppointmentData] = useState({
    esTratamiento: false,
    citaId: null,
    tratamientoId: null,
    fechaCita: '',
    horaCita: '',
    servicio: '',
    especialista: '',
    pacienteExistente: false,
    correo: '',
    telefono: '',
    omitioCorreo: false,
    omitioTelefono: false
  });

  const updateAppointmentData = (data) => {
    setAppointmentData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  return (
    <AppointmentContext.Provider value={{ appointmentData, updateAppointmentData }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment debe ser usado dentro de un AppointmentProvider');
  }
  return context;
};