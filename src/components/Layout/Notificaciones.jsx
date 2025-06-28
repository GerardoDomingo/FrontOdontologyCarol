import React, { useEffect, useCallback, memo } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';
import { useThemeContext } from '../Tools/ThemeContext';

// Contenedor principal con soporte para tema
const NotificationContainer = styled(Box)(({ isdarkmode }) => ({
  position: 'fixed',
  bottom: '30px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2000,
  padding: '16px 20px',
  borderRadius: '8px',
  boxShadow: isdarkmode 
    ? '0 4px 20px rgba(0, 0, 0, 0.25)' 
    : '0 4px 20px rgba(0, 0, 0, 0.12)',
  backgroundColor: isdarkmode ? '#333' : '#fff',
  border: `1px solid ${isdarkmode ? '#444' : '#e0e0e0'}`,
  minWidth: '350px',
  maxWidth: '90vw',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  
  // Animación optimizada con CSS
  '@keyframes slideUp': {
    '0%': {
      opacity: 0,
      transform: 'translate(-50%, 20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translate(-50%, 0)',
    }
  },
  
  '@keyframes slideDown': {
    '0%': {
      opacity: 1,
      transform: 'translate(-50%, 0)',
    },
    '100%': {
      opacity: 0,
      transform: 'translate(-50%, 20px)',
    }
  },
  
  // Animación de entrada
  '&.entering': {
    animation: 'slideUp 0.3s forwards'
  },
  
  // Animación de salida
  '&.exiting': {
    animation: 'slideDown 0.3s forwards'
  },
  
  // Media queries para responsividad
  '@media (min-width: 600px)': {
    minWidth: '400px',
    maxWidth: '500px',
  },
}));

// Contenedor del icono
const IconContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '16px',
  
  '& .MuiSvgIcon-root': {
    fontSize: '28px',
  },
});

// Botón de cerrar
const CloseButton = styled('button')(({ isdarkmode }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  width: '24px',
  height: '24px',
  padding: 0,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  opacity: 0.6,
  transition: 'opacity 0.2s',
  
  '&:hover': {
    opacity: 1,
  },
  
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    width: '16px',
    height: '2px',
    backgroundColor: isdarkmode ? '#fff' : '#555',
    left: '4px',
    top: '11px',
  },
  
  '&::before': {
    transform: 'rotate(45deg)',
  },
  
  '&::after': {
    transform: 'rotate(-45deg)',
  },
}));

// Barra de progreso
const ProgressBar = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: '3px',
  width: '100%',
  
  '@keyframes shrink': {
    '0%': {
      width: '100%',
    },
    '100%': {
      width: '0%',
    }
  },
  
  animation: 'shrink 3s linear forwards',
});

// Función para obtener colores según tipo y tema
const getTypeColors = (type, isDarkMode) => {
  const colors = {
    success: {
      main: '#4caf50',
      dark: '#3d8b40',
      light: isDarkMode ? '#2e7d32' : '#81c784'
    },
    error: {
      main: '#f44336',
      dark: '#d32f2f',
      light: isDarkMode ? '#c62828' : '#e57373'
    },
    warning: {
      main: '#ff9800',
      dark: '#f57c00',
      light: isDarkMode ? '#e65100' : '#ffb74d'
    },
    info: {
      main: '#2196f3',
      dark: '#1976d2',
      light: isDarkMode ? '#0d47a1' : '#64b5f6'
    }
  };
  
  return colors[type] || colors.info;
};

// Componente de notificaciones
const Notificaciones = memo(({ open, message, type = 'info', handleClose, onClose }) => {
  // Usar el contexto de tema correctamente
  const { isDarkTheme = false } = useThemeContext() || {};
  
  // Usar el callback correcto (handleClose o onClose)
  const closeNotification = useCallback(() => {
    if (handleClose) handleClose();
    if (onClose) onClose();
  }, [handleClose, onClose]);
  
  // Configurar temporizador de cierre
  useEffect(() => {
    let timer = null;
    
    if (open) {
      timer = setTimeout(() => {
        closeNotification();
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open, closeNotification]);
  
  // Selección de iconos y colores
  const IconComponent = type === 'success' ? CheckCircle :
                      type === 'error' ? Error :
                      type === 'warning' ? Warning : Info;
  
  const typeColor = getTypeColors(type, isDarkTheme);
  
  // No renderizar nada si está cerrado
  if (!open) return null;
  
  return (
    <NotificationContainer className={open ? "entering" : "exiting"} isdarkmode={isDarkTheme} role="alert">
      <IconContainer sx={{ color: typeColor.main }}>
        <IconComponent />
      </IconContainer>
      
      <Box sx={{ flex: 1, paddingRight: '20px' }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 500, 
            fontSize: '16px',
            color: isDarkTheme ? '#f5f5f5' : '#333' 
          }}
        >
          {message}
        </Typography>
      </Box>
      
      <CloseButton onClick={closeNotification} isdarkmode={isDarkTheme} aria-label="cerrar" />
      
      <ProgressBar style={{ backgroundColor: typeColor.main }}/>
    </NotificationContainer>
  );
});

Notificaciones.displayName = 'Notificaciones';

export default Notificaciones;