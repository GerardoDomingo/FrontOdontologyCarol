import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Container
} from '@mui/material';
import {
  Settings,
  Assessment,
  Business,
  CalendarMonth,
  PeopleAlt,
  MedicalServices,
  MonetizationOn,
  History,
  Dashboard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const Principal = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme } = useThemeContext();

  const colors = {
    background: isDarkTheme ? '#1A1F2C' : '#FFFFFF',
    cardBg: isDarkTheme ? '#111827' : '#FFFFFF',
    cardBgHover: isDarkTheme ? '#1E293B' : '#F8FAFC',
    text: isDarkTheme ? '#F3F4F6' : '#1F2937',
    subtext: isDarkTheme ? '#94A3B8' : '#64748B',
    primary: isDarkTheme ? '#3B82F6' : '#2563EB',
    secondary: isDarkTheme ? '#4ADE80' : '#10B981',
    accent: isDarkTheme ? '#F59E0B' : '#F59E0B',
    divider: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    boxShadow: isDarkTheme
      ? '0 4px 12px rgba(0,0,0,0.3)'
      : '0 2px 6px rgba(0,0,0,0.05)',
    boxShadowHover: isDarkTheme
      ? '0 8px 24px rgba(0,0,0,0.4)'
      : '0 4px 12px rgba(0,0,0,0.1)',
    gradientLight: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    gradientDark: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    buttonGradient: isDarkTheme
      ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
      : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    cardGradient1: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    cardGradient2: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    cardGradient3: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
  };

  // Accesos directos principales
  const mainModules = [
    {
      title: 'Pacientes',
      description: 'Gestiona la información de los pacientes y sus historiales.',
      icon: PeopleAlt,
      color: colors.cardGradient1,
      path: '/Administrador/pacientes',
      buttonText: 'Gestionar Pacientes'
    },
    {
      title: 'Servicios',
      description: 'Administra los servicios odontológicos que ofrece la clínica.',
      icon: MedicalServices,
      color: colors.cardGradient2,
      path: '/Administrador/servicios',
      buttonText: 'Ver Servicios'
    },
    {
      title: 'Citas',
      description: 'Programa y administra las citas de los pacientes.',
      icon: CalendarMonth,
      color: colors.cardGradient3,
      path: '/Administrador/citas',
      buttonText: 'Administrar Citas'
    }
  ];

  // Módulos secundarios
  const secondaryModules = [
    {
      title: 'Estadísticas',
      description: 'Visualiza estadísticas y métricas clave del negocio.',
      icon: Dashboard,
      path: '/Administrador/estadisticas',
    },
    {
      title: 'Finanzas',
      description: 'Gestiona los aspectos económicos de la clínica.',
      icon: MonetizationOn,
      path: '/Administrador/finanzas',
    },
    {
      title: 'Configuración',
      description: 'Personaliza las configuraciones del sistema.',
      icon: Settings,
      path: '/Administrador/configuracion',
    },
    {
      title: 'Reportes',
      description: 'Genera informes y reportes personalizados.',
      icon: Assessment,
      path: '/Administrador/reportes',
    },
    {
      title: 'Historial',
      description: 'Consulta el historial de actividades y cambios.',
      icon: History,
      path: '/Administrador/historial',
    },
    {
      title: 'Perfil de Empresa',
      description: 'Administra la información de la clínica dental.',
      icon: Business,
      path: '/Administrador/PerfilEmpresa',
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Encabezado de bienvenida */}
      <Paper
        elevation={0}
        sx={{
          background: isDarkTheme ? colors.gradientDark : colors.gradientLight,
          borderRadius: 3,
          mb: 4,
          p: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '35%',
            opacity: 0.1,
            background: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${isDarkTheme ? 'ffffff' : '2563eb'}' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z' /%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right',
            backgroundSize: 'cover'
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
              color: isDarkTheme ? '#FFF' : '#1E293B'
            }}
          >
            Bienvenido al Sistema de Odontología Carol
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              maxWidth: '750px',
              color: isDarkTheme ? '#CBD5E1' : '#475569'
            }}
          >
            Administre pacientes, citas, servicios y todas las operaciones de su clínica desde este panel centralizado.
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalendarMonth />}
            onClick={() => navigate('/Administrador/citas')}
            sx={{
              background: colors.buttonGradient,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 1.2,
              px: 3
            }}
          >
            Administrar Citas
          </Button>
        </Box>
      </Paper>

      {/* Sección de módulos principales */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 3,
          color: colors.text,
          fontSize: { xs: '1.2rem', sm: '1.4rem' }
        }}
      >
        Módulos Principales
      </Typography>

      <Grid container spacing={3} mb={5}>
        {mainModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: colors.boxShadow,
                background: module.color,
                color: '#FFF',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: colors.boxShadowHover
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 56,
                    height: 56,
                    mb: 2
                  }}
                >
                  <module.icon sx={{ fontSize: 32, color: '#FFF' }} />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  {module.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    opacity: 0.9,
                    fontSize: { xs: '0.85rem', sm: '0.9rem' }
                  }}
                >
                  {module.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 0 }}>
                <Button
                  fullWidth
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFF',
                    fontWeight: 600,
                    py: 1.5,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.25)'
                    }
                  }}
                  onClick={() => navigate(module.path)}
                >
                  {module.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sección de módulos secundarios */}
      <Box mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: colors.text,
              fontSize: { xs: '1.2rem', sm: '1.4rem' }
            }}
          >
            Accesos Rápidos
          </Typography>
          <Divider sx={{ flex: 1, ml: 2, borderColor: colors.divider }} />
        </Box>

        <Grid container spacing={2}>
          {secondaryModules.map((module, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  backgroundColor: colors.cardBg,
                  transition: 'all 0.3s ease',
                  boxShadow: colors.boxShadow,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  p: { xs: 2, sm: 2.5 },
                  '&:hover': {
                    backgroundColor: colors.cardBgHover,
                    transform: 'translateY(-4px)',
                    boxShadow: colors.boxShadowHover
                  },
                  '&:hover .icon': {
                    color: colors.primary,
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={() => navigate(module.path)}
              >
                <module.icon
                  className="icon"
                  sx={{
                    fontSize: { xs: 34, sm: 40 },
                    color: colors.subtext,
                    mb: 1.5,
                    transition: 'all 0.3s ease'
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    color: colors.text,
                    mb: 1
                  }}
                >
                  {module.title}
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.75rem',
                      color: colors.subtext,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {module.description}
                  </Typography>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Principal;