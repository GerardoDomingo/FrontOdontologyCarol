import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tab, 
  Tabs, 
  Card, 
  CardContent, 
  IconButton, 
  CircularProgress,
  Fade,
  useTheme,
  useMediaQuery,
  Button,
  Stack,
  Tooltip,
  Divider,
  Container,
  AppBar,
  Paper
} from '@mui/material';
import { 
  FaUserShield, 
  FaFileAlt, 
  FaExclamationTriangle, 
  FaFileContract, 
  FaBuilding,
  FaChevronUp,
  FaArrowLeft
} from 'react-icons/fa';
import AvisoDePrivacidad from './politicas/AvisoPriva';
import DeslindeLegal from './politicas/DeslindeLegal';
import TerminosCondiciones from './politicas/TermiCondicion';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const Configuracion = () => {
  // Estados
  const [selectedTab, setSelectedTab] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Theme
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Manejo del scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (event, newValue) => {
    setLoading(true);
    setSelectedTab(newValue);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Tema y colores
  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    cardBg: isDarkTheme ? '#243447' : '#FFFFFF',
    primary: '#0052A3',
    primaryLight: isDarkTheme ? '#1A6BBE' : '#E6F0FA',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    subtext: isDarkTheme ? '#E0E0E0' : '#666666',
    hover: isDarkTheme ? 'rgba(3,66,124,0.3)' : 'rgba(3,66,124,0.1)',
    tabBg: isDarkTheme ? '#2C3E50' : '#FFFFFF',
    selectedTabBg: isDarkTheme ? '#03427c' : 'rgba(3,66,124,0.1)',
    border: isDarkTheme ? '#34495E' : '#E0E0E0',
    headerBg: isDarkTheme ? '#1A2A3C' : '#F0F7FF'
  };

  const tabs = [
    { 
      label: 'Política de Privacidad', 
      icon: <FaFileAlt size={18} />,
      component: AvisoDePrivacidad
    },
    { 
      label: 'Deslinde Legal', 
      icon: <FaExclamationTriangle size={18} />,
      component: DeslindeLegal
    },
    { 
      label: 'Términos y Condiciones', 
      icon: <FaFileContract size={18} />,
      component: TerminosCondiciones
    }
  ];

  const renderTabContent = () => {
    if (selectedTab === -1) {
      return (
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            color: colors.text,
            textAlign: 'center',
            p: 3
          }}
        >
          <FaFileContract size={60} style={{ color: colors.primary, opacity: 0.6, marginBottom: 16 }} />
          <Typography variant="h6" gutterBottom>
            Selecciona una opción para ver su contenido
          </Typography>
          <Typography variant="body2" color={colors.subtext} sx={{ maxWidth: 500 }}>
            Consulta nuestras políticas y términos para obtener información sobre cómo gestionamos tus datos y los servicios que ofrecemos.
          </Typography>
        </Box>
      );
    }

    const SelectedComponent = tabs[selectedTab].component;
    return <SelectedComponent />;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkTheme 
          ? 'linear-gradient(135deg, #1B2A3A 0%, #243447 100%)'
          : 'linear-gradient(135deg, #F9FDFF 0%, #E3F2FD 100%)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header con título y botón de perfil empresa */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: colors.headerBg,
          borderBottom: `1px solid ${colors.border}`,
          py: 1
        }}
      >
        <Container maxWidth="xl">
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems="center"
            spacing={{ xs: 2, sm: 1 }}
            py={1}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: isDarkTheme ? '#FFFFFF' : colors.primary,
                  textShadow: isDarkTheme ? '1px 1px 3px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                Configuración de la Empresa
              </Typography>
            </Box>
            
            <Button
              component={Link}
              to="/Administrador/PerfilEmpresa"
              variant="contained"
              startIcon={<FaBuilding />}
              sx={{
                bgcolor: colors.primary,
                color: '#FFFFFF',
                px: 3,
                py: 1,
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,82,163,0.25)',
                '&:hover': {
                  bgcolor: '#0046A0',
                  boxShadow: '0 4px 12px rgba(0,82,163,0.35)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Perfil Empresa
            </Button>
          </Stack>
        </Container>
      </AppBar>

      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3 }
        }}
      >
        <Paper
          elevation={isDarkTheme ? 4 : 1}
          sx={{
            borderRadius: '12px',
            bgcolor: colors.cardBg,
            overflow: 'hidden',
            border: isDarkTheme ? `1px solid ${colors.border}` : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant={isTablet ? "scrollable" : "fullWidth"}
            scrollButtons={isTablet ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              bgcolor: colors.tabBg,
              borderBottom: 1,
              borderColor: colors.border,
              '& .MuiTab-root': {
                minHeight: 60,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                fontWeight: 500,
                color: colors.text,
                transition: 'all 0.2s ease',
                py: 2,
                '&:hover': {
                  backgroundColor: colors.hover,
                },
                '&.Mui-selected': {
                  color: isDarkTheme ? '#FFFFFF' : colors.primary,
                  backgroundColor: colors.selectedTabBg,
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary,
                height: 3
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={!isMobile ? tab.label : ""}
                icon={tab.icon}
                iconPosition="start"
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 1
                }}
              />
            ))}
          </Tabs>

          <CardContent 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              bgcolor: colors.cardBg
            }}
          >
            {loading ? (
              <Box 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '400px',
                  gap: 2
                }}
              >
                <CircularProgress size={30} sx={{ color: colors.primary }} />
                <Typography sx={{ color: colors.text }}>
                  Cargando información...
                </Typography>
              </Box>
            ) : (
              <Fade in={!loading} timeout={300}>
                <Box sx={{ minHeight: '400px', color: colors.text }}>
                  {renderTabContent()}
                </Box>
              </Fade>
            )}
          </CardContent>
        </Paper>
      </Container>

      {/* Botón flotante */}
      {showScrollTop && (
        <Fade in={showScrollTop}>
          <IconButton
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              bgcolor: colors.primary,
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: '#0046A0',
                transform: 'translateY(-4px)'
              },
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              zIndex: 1000
            }}
          >
            <FaChevronUp />
          </IconButton>
        </Fade>
      )}
    </Box>
  );
};

export default Configuracion;