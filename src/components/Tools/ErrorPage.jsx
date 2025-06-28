import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Backdrop,
  CircularProgress,
  Divider,
  useMediaQuery,
  useTheme,
  Chip
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Refresh,
  Home,
  Security,
  WifiOff,
  Help,
  ContactSupport,
  ArrowBack,
  ErrorOutline,
  Block,
  BugReport
} from "@mui/icons-material";
import { useThemeContext } from '../../components/Tools/ThemeContext';

// Configuración de tipos de error con animaciones específicas
const errorTypes = {
  400: {
    title: 'Solicitud Incorrecta',
    description: 'La solicitud no pudo ser procesada. Por favor, verifica los datos e inténtalo nuevamente.',
    icon: <ErrorOutline />,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    animation: 'shake',
    actions: [
      { label: 'Atrás', icon: <ArrowBack />, action: 'back', variant: 'outlined' },
      { label: 'Reintentar', icon: <Refresh />, action: 'reload', variant: 'contained' }
    ]
  },
  401: {
    title: 'Acceso No Autorizado',
    description: 'Necesitas iniciar sesión para acceder a esta página.',
    icon: <Security />,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    animation: 'lock',
    actions: [
      { label: 'Atrás', icon: <ArrowBack />, action: 'back', variant: 'outlined' },
      { label: 'Iniciar Sesión', icon: <Security />, to: '/login', variant: 'contained' }
    ]
  },
  403: {
    title: 'Acceso Prohibido',
    description: 'No tienes los permisos necesarios para acceder a este recurso.',
    icon: <Block />,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    animation: 'block',
    actions: [
      { label: 'Atrás', icon: <ArrowBack />, action: 'back', variant: 'outlined' },
      { label: 'Contactar Soporte', icon: <ContactSupport />, to: '/contactanos', variant: 'contained' }
    ]
  },
  404: {
    title: 'Página No Encontrada',
    description: 'La página que buscas no existe o ha sido movida.',
    icon: <Help />,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    animation: 'float',
    actions: [
      { label: 'Atrás', icon: <ArrowBack />, action: 'back', variant: 'outlined' },
      { label: 'Ir a Inicio', icon: <Home />, to: '/', variant: 'contained' }
    ]
  },
  500: {
    title: 'Error del Servidor',
    description: 'Ocurrió un error interno. Nuestro equipo ha sido notificado y está trabajando en solucionarlo.',
    icon: <BugReport />,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    animation: 'glitch',
    actions: [
      { label: 'Atrás', icon: <ArrowBack />, action: 'back', variant: 'outlined' },
      { label: 'Reintentar', icon: <Refresh />, action: 'reload', variant: 'contained' }
    ]
  },
  502: {
    title: 'Sin Conexión',
    description: 'No hay conexión a internet. Verifica tu conexión e inténtalo nuevamente.',
    icon: <WifiOff />,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    animation: 'pulse',
    actions: [
      { label: 'Atrás', icon: <ArrowBack />, action: 'back', variant: 'outlined' },
      { label: 'Reintentar', icon: <Refresh />, action: 'reload', variant: 'contained' }
    ]
  }
};

// Animaciones específicas para cada error
const getErrorAnimation = (animationType) => {
  const animations = {
    shake: {
      animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.6, repeat: Infinity, repeatDelay: 3 }
      }
    },
    lock: {
      animate: {
        rotate: [0, -15, 15, -10, 10, 0],
        transition: { duration: 0.8, repeat: Infinity, repeatDelay: 4 }
      }
    },
    block: {
      animate: {
        scale: [1, 1.1, 1, 1.05, 1],
        transition: { duration: 1, repeat: Infinity, repeatDelay: 2 }
      }
    },
    float: {
      animate: {
        y: [0, -15, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }
    },
    glitch: {
      animate: {
        x: [0, -2, 2, 0],
        opacity: [1, 0.8, 1, 0.9, 1],
        transition: { duration: 0.3, repeat: Infinity, repeatDelay: 2 }
      }
    },
    pulse: {
      animate: {
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
        transition: { duration: 1.5, repeat: Infinity }
      }
    }
  };
  
  return animations[animationType] || animations.float;
};

/**
 * Página de error con diseño minimalista y animaciones específicas
 */
const ErrorPage = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determinar el código de error
  const errorCode = !isOnline ? 502 : location.state?.errorCode || 404;
  const errorMessage = location.state?.errorMessage || errorTypes[errorCode]?.description;
  const errorInfo = errorTypes[errorCode] || errorTypes[404];
  
  // Paleta de colores consistente con el proyecto
  const colors = {
    background: isDarkTheme ? '#0F172A' : '#F8FAFC',
    surface: isDarkTheme ? '#1E293B' : '#FFFFFF',
    surfaceVariant: isDarkTheme ? '#334155' : '#F1F5F9',
    text: isDarkTheme ? '#F1F5F9' : '#334155',
    textSecondary: isDarkTheme ? '#94A3B8' : '#64748B',
    border: isDarkTheme ? 'rgba(148,163,184,0.1)' : 'rgba(226,232,240,0.8)',
    primary: isDarkTheme ? '#3B82F6' : '#2563EB'
  };

  // Monitoreo de conexión
  useEffect(() => {
    const handleOnline = () => {
      setLoadingMessage('Reconectando...');
      setIsLoading(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Manejador de acciones
  const handleAction = (action) => {
    if (action.action === 'back') {
      navigate(-1);
    } else if (action.action === 'reload') {
      setLoadingMessage('Recargando...');
      setIsLoading(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else if (action.to) {
      setLoadingMessage('Redirigiendo...');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };

  // Animaciones principales
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.02, 
      y: -2,
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        backgroundImage: isDarkTheme 
          ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.02) 0%, transparent 50%)',
        transition: 'all 0.3s ease',
        p: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos sutiles */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `${errorInfo.color}08`,
          filter: 'blur(40px)',
          opacity: 0.6
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `${colors.primary}05`,
          filter: 'blur(60px)',
          opacity: 0.4
        }}
      />

      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Paper
            elevation={isDarkTheme ? 0 : 2}
            sx={{
              borderRadius: 3,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              p: { xs: 4, sm: 5, md: 6 }
            }}
          >
            {/* Barra superior con código de error */}
            <motion.div variants={itemVariants}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 4 
              }}>
                <Chip
                  icon={React.cloneElement(errorInfo.icon, { 
                    style: { color: '#fff', fontSize: 20 } 
                  })}
                  label={`Error ${errorCode}`}
                  sx={{
                    background: errorInfo.gradient,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    height: 40,
                    px: 2,
                    boxShadow: `0 4px 20px ${errorInfo.color}40`,
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              </Box>
            </motion.div>

            <Grid container spacing={4} alignItems="center">
              {/* Sección del icono y código */}
              <Grid item xs={12} md={5}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ 
                    textAlign: 'center',
                    position: 'relative'
                  }}>
                    {/* Icono animado */}
                    <Box
                      component={motion.div}
                      {...getErrorAnimation(errorInfo.animation)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: { xs: 120, md: 140 },
                        height: { xs: 120, md: 140 },
                        borderRadius: '50%',
                        background: `${errorInfo.color}15`,
                        border: `3px solid ${errorInfo.color}30`,
                        mb: 3,
                        position: 'relative'
                      }}
                    >
                      {React.cloneElement(errorInfo.icon, {
                        sx: { 
                          fontSize: { xs: 50, md: 60 },
                          color: errorInfo.color
                        }
                      })}
                      
                      {/* Anillo decorativo */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: `2px solid ${errorInfo.color}20`,
                          animation: 'pulse 2s infinite'
                        }}
                      />
                    </Box>
                    
                    {/* Código numérico */}
                    <Typography
                      component={motion.div}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      variant="h1"
                      sx={{
                        fontSize: { xs: '4rem', md: '5rem' },
                        fontWeight: 800,
                        background: errorInfo.gradient,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                        mb: 1,
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {errorCode}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>

              {/* Contenido del error */}
              <Grid item xs={12} md={7}>
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: colors.text,
                      mb: 2,
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {errorInfo.title}
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.textSecondary,
                      mb: 4,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      lineHeight: 1.6,
                      maxWidth: '90%'
                    }}
                  >
                    {errorMessage}
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Divider 
                    sx={{ 
                      mb: 4, 
                      borderColor: colors.border,
                      background: errorInfo.gradient,
                      height: 2,
                      border: 'none'
                    }} 
                  />
                </motion.div>

                {/* Botones de acción mejorados */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <AnimatePresence>
                      {errorInfo.actions.map((action, index) => (
                        <motion.div
                          key={index}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            component={action.to ? Link : 'button'}
                            to={action.to}
                            onClick={() => handleAction(action)}
                            variant={action.variant}
                            startIcon={action.icon}
                            size="large"
                            fullWidth={isMobile}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 4,
                              py: 1.5,
                              minWidth: 140,
                              boxShadow: action.variant === 'contained' 
                                ? `0 4px 15px ${errorInfo.color}30` 
                                : 'none',
                              ...(action.variant === 'contained' && {
                                background: errorInfo.gradient,
                                color: 'white',
                                '&:hover': {
                                  background: errorInfo.gradient,
                                  boxShadow: `0 6px 25px ${errorInfo.color}40`,
                                  transform: 'translateY(-2px)'
                                }
                              }),
                              ...(action.variant === 'outlined' && {
                                borderColor: colors.border,
                                color: colors.textSecondary,
                                borderWidth: 2,
                                '&:hover': {
                                  backgroundColor: `${errorInfo.color}08`,
                                  borderColor: errorInfo.color,
                                  color: errorInfo.color,
                                  transform: 'translateY(-2px)'
                                }
                              }),
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            {action.label}
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>

      {/* Overlay de carga mejorado */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: theme.zIndex.drawer + 1,
          backdropFilter: 'blur(12px)',
          flexDirection: 'column',
          gap: 3
        }}
        open={isLoading}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CircularProgress 
            size={70}
            thickness={4}
            sx={{ 
              color: errorInfo.color,
              filter: `drop-shadow(0 0 10px ${errorInfo.color}50)`
            }} 
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Typography 
            variant="h6"
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 500
            }}
          >
            {loadingMessage}
          </Typography>
        </motion.div>
      </Backdrop>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default ErrorPage;