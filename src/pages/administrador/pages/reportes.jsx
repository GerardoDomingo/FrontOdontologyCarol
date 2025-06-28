import React, { useState, useEffect } from 'react';
import { Box, Typography, Tab, Tabs, Card, CardContent, CircularProgress } from '@mui/material';
import { FaSignInAlt, FaFileAlt, FaUserFriends } from 'react-icons/fa';
import LoginAttemptsReport from './LoginAttemptsReport';
import LogsReport from './LogsReport';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const Reportes = () => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDarkTheme } = useThemeContext();

  // Definición de colores
  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    tableBackground: isDarkTheme ? '#1E2A3A' : '#e3f2fd',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
    primary: isDarkTheme ? '#0052A3' : '#1976d2',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
  };

  const handleTabChange = (event, newValue) => {
    setLoading(true);
    setSelectedTab(newValue);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'background-color 0.3s ease'
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 'bold',
          color: colors.primary,
          fontFamily: 'Roboto, sans-serif',
          textAlign: 'center',
        }}
      >
        Reportes del Sistema
      </Typography>

      <Tabs
        value={selectedTab ?? false}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{
          mb: 4,
          backgroundColor: colors.paper,
          borderRadius: '12px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            color: colors.text,
            '&:hover': {
              backgroundColor: colors.hover,
            },
            transition: '0.3s',
          },
          '& .Mui-selected': {
            color: `${colors.primary} !important`,
          },
        }}
      >
        <Tab
          label="Intentos de Login"
          icon={<FaSignInAlt />}
          sx={{ fontFamily: 'Roboto, sans-serif' }}
        />
        <Tab
          label="Auditoría del Sistema"
          icon={<FaFileAlt />}
          sx={{ fontFamily: 'Roboto, sans-serif' }}
        />
      </Tabs>

      <Card
        sx={{
          backgroundColor: colors.paper,
          boxShadow: isDarkTheme
            ? '0px 6px 20px rgba(0, 0, 0, 0.3)'
            : '0px 6px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                color: colors.text
              }}
            >
              <CircularProgress sx={{ color: colors.primary }} />
              <Typography variant="body1" sx={{ ml: 2, color: colors.text }}>
                Cargando...
              </Typography>
            </Box>
          ) : selectedTab === null ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: colors.text
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: colors.primary,
                  mb: 2
                }}
              >
                Selecciona una opción para ver su contenido
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.secondaryText,
                  textAlign: 'center'
                }}
              >
                Elige una de las pestañas superiores para visualizar el reporte correspondiente
              </Typography>
            </Box>
          ) : (
            <>
              {selectedTab === 0 && <LoginAttemptsReport isDarkTheme={isDarkTheme} colors={colors} />}
              {selectedTab === 1 && <LogsReport isDarkTheme={isDarkTheme} colors={colors} />}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reportes;