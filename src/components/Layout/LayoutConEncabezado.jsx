import React from 'react';
import { Box } from '@mui/material';
import BarraNav from './barraNav';
import PieDePagina from './Footer';
import { useThemeContext } from '../Tools/ThemeContext';

const LayoutConEncabezado = ({ children, noPadding = false }) => {
  const { isDarkTheme } = useThemeContext();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Box component="header">
        <BarraNav />
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          p: 0, 
          backgroundColor: isDarkTheme ? '#1d2a38' : '#ffffff',
          position: 'relative',
          overflow: 'visible', 
          border: 'none',
          boxShadow: 'none',
          margin: 0,
          width: '100%',
          maxWidth: 'none'
        }}
      >
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          backgroundColor: isDarkTheme ? '#0D1B2A' : '#03427C',
          color: '#ffffff',
          p: 2,
          textAlign: 'center',
        }}
      >
        <PieDePagina />
      </Box>
    </Box>
  );
};

export default LayoutConEncabezado;