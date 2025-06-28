import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Paper,
  Divider,
  Avatar,
  Chip,
  useMediaQuery,
  Container
} from '@mui/material';
import { 
  CalendarToday, 
  Healing, 
  History,
  AccessTime,
  ArrowForward,
  Notifications,
  Person,
  HealthAndSafety,
  InsertDriveFile,
  CreditCard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

/**
 * Componente Principal del Portal del Paciente
 * Pantalla de inicio con acceso a las principales funcionalidades
 */
const Principal = () => {
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme => theme.breakpoints.down('md'));

  // Datos de ejemplo para la próxima cita (en un entorno real, se obtendría de una API)
  const [proximaCita, setProximaCita] = useState({
    fecha: '15 de marzo, 2025',
    hora: '10:30 AM',
    doctor: 'Dra. Carol Jiménez',
    tipo: 'Limpieza dental'
  });

  // Colores según el modo del sistema con mejor contraste y paleta más cálida
  const colors = {
    background: isDarkTheme ? '#121F2F' : '#F9FDFF',
    primary: isDarkTheme ? '#3B82F6' : '#0557A5', // Azul principal
    primaryLight: isDarkTheme ? '#60A5FA' : '#3B82F6', 
    secondary: isDarkTheme ? '#4ADE80' : '#10B981', // Verde para elementos secundarios
    accent: isDarkTheme ? '#F59E0B' : '#F59E0B', // Naranja cálido para acentos
    text: isDarkTheme ? '#FFFFFF' : '#1F2937',
    subtext: isDarkTheme ? '#D1D5DB' : '#4B5563',
    cardBg: isDarkTheme ? '#1E2A42' : '#FFFFFF',
    cardBorder: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    cardHoverBg: isDarkTheme ? '#2C3A52' : '#FFFFFF',
    gradientStart: isDarkTheme ? '#1E3A8A' : '#DBEAFE',
    gradientEnd: isDarkTheme ? '#1E40AF' : '#EFF6FF',
    chipBg: isDarkTheme ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)',
    chipText: isDarkTheme ? '#A5B4FC' : '#4F46E5',
    shadow: isDarkTheme ? '0 10px 15px -3px rgba(0,0,0,0.4)' : '0 10px 15px -3px rgba(0,0,0,0.1)'
  };

  // Módulos principales del portal
  const mainModules = [
    {
      title: "Citas",
      description: "Agenda, visualiza o reprograma tus citas dentales",
      icon: <CalendarToday sx={{ fontSize: 48, color: colors.primary }} />,
      path: "/Paciente/citas",
      color: colors.primary
    },
    {
      title: "Tratamientos",
      description: "Revisa tus tratamientos activos y su progreso",
      icon: <Healing sx={{ fontSize: 48, color: colors.secondary }} />,
      path: "/Paciente/tratamientos",
      color: colors.secondary
    },
    {
      title: "Historial Médico",
      description: "Consulta tu historial clínico completo",
      icon: <History sx={{ fontSize: 48, color: colors.accent }} />,
      path: "/Paciente/historial",
      color: colors.accent
    }
  ];

  // Módulos secundarios con acceso rápido
  const quickAccessModules = [
    { title: "Mi Perfil", icon: <Person fontSize="small" />, path: "/Paciente/perfil" },
    { title: "Recetas", icon: <InsertDriveFile fontSize="small" />, path: "/Paciente/recetas" },
    { title: "Pagos", icon: <CreditCard fontSize="small" />, path: "/Paciente/pagos" },
    { title: "Notificaciones", icon: <Notifications fontSize="small" />, path: "/Paciente/notificaciones" }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Bienvenida personalizada con resumen */}
      <Paper 
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 3
        }}
      >
        <Avatar 
          sx={{ 
            width: { xs: 80, md: 100 }, 
            height: { xs: 80, md: 100 },
            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(59,130,246,0.1)',
            color: colors.primary,
            border: `3px solid ${colors.primary}`
          }}
        >
          <Person sx={{ fontSize: { xs: 40, md: 50 } }} />
        </Avatar>
        
        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Box sx={{ mb: 1 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: isDarkTheme ? 'white' : colors.primary,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
              }}
            >
              Bienvenido a tu Portal Dental
            </Typography>
            <Typography 
              variant="subtitle1"
              sx={{ 
                mt: 1, 
                mb: 2,
                color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                maxWidth: { md: '80%' }
              }}
            >
              Gestiona tu salud dental y mantente al día con tus tratamientos, citas y récord médico.
            </Typography>
          </Box>
          
          <Chip 
            icon={<HealthAndSafety />} 
            label="Tu salud dental, nuestra prioridad" 
            sx={{ 
              bgcolor: colors.chipBg, 
              color: colors.chipText,
              fontWeight: 500,
              py: 0.5,
              mb: { xs: 2, md: 0 }
            }} 
          />
        </Box>
      </Paper>

      {/* Tarjeta de próxima cita */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${colors.cardBorder}`,
          bgcolor: colors.cardBg,
          boxShadow: colors.shadow
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTime sx={{ color: colors.accent, mr: 1.5 }} />
          <Typography variant="h6" fontWeight={600} color={colors.text}>
            Tu próxima cita
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ color: colors.primary, mr: 1.5, fontSize: 20 }} />
              <Typography variant="body1" color={colors.text} fontWeight={500}>
                {proximaCita.fecha}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ color: colors.primary, mr: 1.5, fontSize: 20 }} />
              <Typography variant="body1" color={colors.text} fontWeight={500}>
                {proximaCita.hora}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="body1" color={colors.text}>
              <b>Dentista:</b> {proximaCita.doctor}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Chip 
              label={proximaCita.tipo} 
              size="small" 
              sx={{ 
                bgcolor: isDarkTheme ? 'rgba(79, 209, 197, 0.15)' : 'rgba(79, 209, 197, 0.1)', 
                color: isDarkTheme ? '#4FD1C5' : '#319795',
                fontWeight: 500
              }} 
            />
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button 
              variant="outlined" 
              endIcon={<ArrowForward />}
              onClick={() => navigate('/Paciente/citas')}
              sx={{ 
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: isDarkTheme ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'
                }
              }}
            >
              Detalles
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Módulos principales */}
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          fontWeight: 600, 
          color: colors.text,
          pl: 1
        }}
      >
        Servicios principales
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mainModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${colors.cardBorder}`,
                bgcolor: colors.cardBg,
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: colors.shadow,
                  '& .hover-gradient': {
                    opacity: 0.05
                  }
                }
              }}
            >
              {/* Gradiente hover effect */}
              <Box
                className="hover-gradient"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${module.color} 0%, transparent 80%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  zIndex: 0
                }}
              />
              
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                    }}
                  >
                    {module.icon}
                  </Box>
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1.5,
                    color: colors.text
                  }}
                >
                  {module.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.subtext,
                    mb: 3,
                    minHeight: '40px'
                  }}
                >
                  {module.description}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(module.path)}
                  sx={{
                    bgcolor: module.color,
                    color: '#FFFFFF',
                    py: 1.2,
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: module.color,
                      filter: 'brightness(90%)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  Acceder
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Accesos rápidos */}
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          fontWeight: 600, 
          color: colors.text,
          pl: 1
        }}
      >
        Accesos rápidos
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickAccessModules.map((module, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Paper
              elevation={0}
              onClick={() => navigate(module.path)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${colors.cardBorder}`,
                bgcolor: colors.cardBg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                height: '100%',
                minHeight: 120,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  bgcolor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(59,130,246,0.03)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box 
                sx={{ 
                  p: 1.5, 
                  mb: 1.5,
                  borderRadius: '50%',
                  bgcolor: isDarkTheme ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)',
                  color: colors.primary
                }}
              >
                {module.icon}
              </Box>
              <Typography 
                variant="body1" 
                align="center"
                sx={{ 
                  fontWeight: 500,
                  color: colors.text
                }}
              >
                {module.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Principal;