import React, { useState, useEffect } from 'react';
import BarraAdmin from './BarraAdmin';
import FooterAdmin from './FooterAdmin';
import { Box, useMediaQuery, useTheme, Paper } from '@mui/material';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const LayoutAdmin = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme } = useThemeContext();

  // Manejar el cambio de estado del drawer
  const handleDrawerChange = (isOpen) => {
    setDrawerOpen(isOpen);
  };

  // Estado inicial basado en el tamaño de pantalla
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const colors = {
    background: isDarkTheme ? '#0F172A' : '#F8FAFC',
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
      {/* Barra de navegación y drawer lateral */}
      <BarraAdmin onDrawerChange={handleDrawerChange} />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px',
          '@media (max-width: 600px)': { mt: '56px' },
          ml: isMobile ? 0 : (drawerOpen ? '280px' : '0'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: isDarkTheme ? '#1A1F2C' : '#FFFFFF',
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

      {/* Footer con margen ajustable */}
      <Box
        component="footer"
        sx={{
          ml: isMobile ? 0 : (drawerOpen ? '280px' : '68px'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <FooterAdmin />
      </Box>
    </Box>
  );
};

export default LayoutAdmin;