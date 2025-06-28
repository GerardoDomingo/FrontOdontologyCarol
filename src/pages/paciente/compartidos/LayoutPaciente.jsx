import React, { useState, useEffect } from 'react';
import BarraPaciente from './BarraPaciente';
import FooterPaciente from './FooterPaciente';
import { Box, useMediaQuery, useTheme, Paper } from '@mui/material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const LayoutPaciente = ({ children }) => {
  // Estado para controlar la apertura/cierre del drawer lateral
  const [drawerOpen, setDrawerOpen] = useState(true);
  
  // Hooks para manejo responsivo y temas
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme } = useThemeContext();

  // Recibir estado del drawer desde BarraPaciente
  const handleDrawerChange = (isOpen) => {
    setDrawerOpen(isOpen);
  };

  // Inicializar estado del drawer según el tamaño de pantalla
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Configuración de colores basados en el tema
  const colors = {
    background: isDarkTheme ? '#0F172A' : '#F8FAFC', // Fondo elegante para el contenido
    contentBg: isDarkTheme ? '#1A1F2C' : '#FFFFFF',  // Fondo para el papel del contenido
    boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
    border: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: colors.background,
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Barra de navegación con props para comunicación de estado */}
      <BarraPaciente onDrawerChange={handleDrawerChange} />
      
      {/* Área de contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px', // Altura del AppBar
          '@media (max-width: 600px)': {
            mt: '56px', // Altura más pequeña en móviles
          },
          ml: isMobile ? 0 : (drawerOpen ? '280px' : '68px'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: colors.contentBg,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: colors.boxShadow,
            border: `1px solid ${colors.border}`,
            height: '100%',
            minHeight: 'calc(100vh - 180px)' 
          }}
        >
          {children}
        </Paper>
      </Box>
      
      {/* Pie de página que se ajusta al estado del drawer */}
      <Box
        component="footer"
        sx={{
          ml: isMobile ? 0 : (drawerOpen ? '280px' : '68px'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <FooterPaciente />
      </Box>
    </Box>
  );
};

export default LayoutPaciente;