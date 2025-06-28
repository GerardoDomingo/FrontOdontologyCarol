import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { FaTooth } from 'react-icons/fa';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const 
FooterAdmin = () => {
  const { isDarkTheme } = useThemeContext();

  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F8FAFC',
    text: isDarkTheme ? '#E8F1FF' : '#64748B',
    accent: isDarkTheme ? '#4B9FFF' : '#1976d2',
    divider: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)'
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.background,
        borderTop: `1px solid ${colors.divider}`,
        py: 3,
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          {/* Logo e ícono */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1
            }}
          >
            <FaTooth 
              size={24} 
              color={colors.accent}
              style={{ transform: 'rotate(-10deg)' }}
            />
            <Typography 
              variant="h6"
              sx={{
                color: colors.accent,
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              Carol
            </Typography>
          </Box>

          {/* Copyright */}
          <Typography 
            variant="body2"
            sx={{
              color: colors.text,
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            © {new Date().getFullYear()} Clínica Dental Carol. Todos los derechos reservados
          </Typography>

          {/* Texto adicional */}
          <Typography
            variant="caption"
            sx={{
              color: colors.text,
              opacity: 0.8,
              mt: 0.5
            }}
          >
            Portal Administrativo
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default FooterAdmin;