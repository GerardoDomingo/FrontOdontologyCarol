import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ServicioDetalleDialog from './ServiciosDetalle'; // Ajusta la ruta si es necesario

const ServicioDetalleRouteHandler = () => {
  // Estados para controlar el diálogo
  const [open, setOpen] = useState(false);
  const [servicioId, setServicioId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detectar y manejar rutas de detalle
  useEffect(() => {
    // Verificar si la ruta actual es de detalle
    const match = location.pathname.match(/\/servicios\/detalle\/(\d+)/);
    if (match) {
      setServicioId(match[1]);
      setOpen(true);
    } else {
      // Cerrar el diálogo si la ruta no es de detalle
      setOpen(false);
    }
  }, [location.pathname]);

  // Cerrar el diálogo y volver a la página de servicios
  const handleClose = () => {
    setOpen(false);
    // Navegamos de regreso a la página de servicios
    navigate('/servicios');
  };

  // Función para manejar la agenda de cita
  const handleAgendarCita = (service) => {
    navigate('/agendar-cita', {
      state: { servicioSeleccionado: service }
    });
  };

  return servicioId ? (
    <ServicioDetalleDialog
      open={open}
      onClose={handleClose}
      servicioId={servicioId}
      onAgendarCita={handleAgendarCita}
    />
  ) : null;
};

export default ServicioDetalleRouteHandler;