import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Grow,
  useMediaQuery,
  InputAdornment,
  Paper,
  Divider
} from '@mui/material';
import { 
  Email, 
  ArrowBack, 
  Lock,
  CheckCircleOutline,
  SecurityOutlined,
  LockResetOutlined,
  MarkEmailReadOutlined
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

/**
 * Componente de recuperación de contraseña
 * Maneja el proceso de solicitud y verificación del código de recuperación
 * con diseño mejorado y experiencia de usuario optimizada
 */
const Recuperacion = () => {
  // Estados para controlar el formulario y su comportamiento
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    type: 'success' 
  });
  
  // Hooks de navegación y tema
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery('(max-width:600px)');
  
  // Colores según el tema - Paleta profesional y cálida
  const colors = {
    background: isDarkTheme
      ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
      : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
    primary: isDarkTheme ? "#3B82F6" : "#2563EB", // Azul más cálido
    secondary: isDarkTheme ? "#10B981" : "#059669",
    text: isDarkTheme ? "#F1F5F9" : "#334155",
    subtext: isDarkTheme ? "#94A3B8" : "#64748B",
    cardBg: isDarkTheme ? "#1E293B" : "#FFFFFF",
    cardHover: isDarkTheme ? "#273449" : "#F8FAFC",
    border: isDarkTheme ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    shadow: isDarkTheme
      ? "0 4px 12px rgba(0,0,0,0.25)"
      : "0 4px 12px rgba(0,0,0,0.05)",
    accentGradient: isDarkTheme
      ? "linear-gradient(90deg, #3B82F6, #60A5FA)"
      : "linear-gradient(90deg, #2563EB, #3B82F6)",
    success: isDarkTheme ? "#10B981" : "#059669",
    lightBg: isDarkTheme ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.05)",
    sectionDivider: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
  };

  // Efecto para manejar el contador de reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Manejadores de eventos
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleTokenChange = (e) => {
    // Limitar a sólo caracteres alfanuméricos
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    setToken(value);
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    try {
      setIsLoading(true);
      await axios.post('https://back-end-4803.onrender.com/api/recuperacion', { email });
      setNotification({
        open: true,
        message: 'Se ha reenviado el código a tu correo.',
        type: 'success',
      });
      setCountdown(60); // 1 minuto de espera para reenvío
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error al reenviar el código. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setNotification({ ...notification, open: false });

    // Validación del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setNotification({
        open: true,
        message: 'Por favor, introduce un correo electrónico válido.',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('https://back-end-4803.onrender.com/api/recuperacion', { email });

      if (response.status === 200) {
        setNotification({
          open: true,
          message: 'Se ha enviado un código de recuperación a tu correo.',
          type: 'success',
        });
        setEmailSent(true);
        setActiveStep(1);
        setCountdown(60); // Iniciar contador de reenvío
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.status === 404
          ? 'Correo no encontrado. Por favor, verifica el correo ingresado.'
          : 'Error de conexión. Inténtalo de nuevo más tarde.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!token || token.length < 5) {
      setNotification({
        open: true,
        message: 'Por favor, introduce el código completo que te fue enviado.',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('https://back-end-4803.onrender.com/api/verifyTokene', { token, email });

      if (response.status === 200) {
        setNotification({
          open: true,
          message: 'Código verificado correctamente.',
          type: 'success',
        });
        setActiveStep(2);
        
        // Redirección retrasada para mostrar el éxito
        setTimeout(() => {
          navigate(`/resetContra?token=${encodeURIComponent(token)}`);
        }, 1500);
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Código inválido o expirado. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: colors.background,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '20px', sm: '40px' },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box 
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: colors.accentGradient,
          opacity: 0.05,
          zIndex: 0
        }}
      />
      <Box 
        sx={{
          position: 'absolute',
          bottom: '-5%',
          left: '-5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: colors.accentGradient,
          opacity: 0.05,
          zIndex: 0
        }}
      />

      {/* Botón Atrás con animación hover */}
      <IconButton
        sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          color: colors.primary,
          backgroundColor: colors.lightBg,
          transition: 'all 0.3s ease',
          zIndex: 10,
          '&:hover': {
            backgroundColor: colors.lightBg,
            transform: 'scale(1.05)'
          }
        }}
        component={Link}
        to="/login"
        aria-label="Volver al inicio de sesión"
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ArrowBack />
          <Typography
            variant="body2"
            sx={{ 
              color: colors.subtext, 
              ml: 1,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Atrás
          </Typography>
        </Box>
      </IconButton>

      {/* Contenedor principal */}
      <Card 
        sx={{ 
          maxWidth: 500, 
          width: '100%', 
          borderRadius: '16px', 
          boxShadow: colors.shadow,
          overflow: 'visible',
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease-in-out',
          zIndex: 1,
          '&:hover': {
            boxShadow: isDarkTheme 
              ? '0 10px 30px rgba(0,0,0,0.3)' 
              : '0 10px 30px rgba(0,0,0,0.08)'
          }
        }}
      >
        <CardContent sx={{ 
          textAlign: 'center',
          p: { xs: 3, sm: 4 } 
        }}>
          {/* Icono grande para cada paso */}
          <Box sx={{ mb: 3, mt: 1 }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: colors.lightBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2,
                transition: 'all 0.5s ease-in-out'
              }}
            >
              {activeStep === 0 ? (
                <LockResetOutlined sx={{ fontSize: 35, color: colors.primary }} />
              ) : activeStep === 1 ? (
                <SecurityOutlined sx={{ fontSize: 35, color: colors.primary }} />
              ) : (
                <MarkEmailReadOutlined sx={{ fontSize: 35, color: colors.success }} />
              )}
            </Box>
          </Box>

          {/* Stepper para mostrar progreso */}
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ 
              mb: 4,
              '& .MuiStepIcon-root': {
                color: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                '&.Mui-active, &.Mui-completed': {
                  color: colors.primary
                }
              },
              '& .MuiStepLabel-label': {
                color: colors.subtext,
                '&.Mui-active': {
                  color: colors.text
                }
              }
            }}
          >
            <Step>
              <StepLabel>Solicitar</StepLabel>
            </Step>
            <Step>
              <StepLabel>Verificar</StepLabel>
            </Step>
            <Step>
              <StepLabel>Completado</StepLabel>
            </Step>
          </Stepper>

          {/* Divider decorativo */}
          <Divider 
            sx={{ 
              mb: 3, 
              background: colors.sectionDivider, 
              '&::before, &::after': {
                borderTop: `1px solid ${colors.sectionDivider}`
              }
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.subtext, 
                fontSize: '0.8rem',
                px: 1
              }}
            >
              {activeStep === 0 ? 'PASO 1' : activeStep === 1 ? 'PASO 2' : 'FINALIZADO'}
            </Typography>
          </Divider>

          {/* Título dinámico según el paso actual */}
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              color: colors.text
            }}
          >
            {activeStep === 0 ? 'Recuperar Contraseña' : 
             activeStep === 1 ? 'Verificar Código' : 
             'Verificación Exitosa'}
          </Typography>

          {/* Subtítulo con instrucciones */}
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 4,
              color: colors.subtext,
              fontSize: '0.95rem'
            }}
          >
            {activeStep === 0 
              ? 'Introduce tu correo electrónico para recibir un código de recuperación.' 
              : activeStep === 1 
                ? 'Ingresa el código de verificación enviado a tu correo.' 
                : 'Serás redirigido para establecer tu nueva contraseña.'}
          </Typography>

          {/* Formulario de solicitud de recuperación */}
          <Fade in={activeStep === 0} mountOnEnter unmountOnExit>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  placeholder="ejemplo@correo.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: colors.primary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '& fieldset': {
                        borderColor: colors.border,
                      },
                      '&:hover fieldset': {
                        borderColor: colors.primary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colors.primary,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.subtext,
                      '&.Mui-focused': {
                        color: colors.primary,
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: colors.text,
                    },
                  }}
                />
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disableElevation
                sx={{
                  background: colors.accentGradient,
                  '&:hover': { 
                    background: colors.accentGradient,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                  },
                  py: 1.8,
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Enviar Código de Recuperación'
                )}
              </Button>
            </form>
          </Fade>

          {/* Formulario de verificación de código */}
          <Fade in={activeStep === 1} mountOnEnter unmountOnExit>
            <form onSubmit={handleVerifyToken}>
              <Box 
                sx={{ 
                  mb: 3, 
                  position: 'relative',
                  px: { sm: 3 }
                }}
              >
                <TextField
                  fullWidth
                  label="Código de Verificación"
                  name="token"
                  value={token}
                  onChange={handleTokenChange}
                  required
                  variant="outlined"
                  placeholder="Ingresa el código"
                  inputProps={{ 
                    maxLength: 8,
                    sx: { textAlign: 'center', letterSpacing: '2px', fontWeight: 600 }
                  }}
                  autoComplete="one-time-code"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: colors.primary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '& fieldset': {
                        borderColor: colors.border,
                      },
                      '&:hover fieldset': {
                        borderColor: colors.primary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colors.primary,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.subtext,
                      '&.Mui-focused': {
                        color: colors.primary,
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: colors.text,
                    },
                  }}
                />
                
                {/* Correo al que se envió el código */}
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    mt: 2,
                    borderRadius: '8px',
                    backgroundColor: colors.lightBg
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: colors.subtext,
                      fontSize: '0.8rem'
                    }}
                  >
                    Código enviado a: <Box component="span" sx={{ color: colors.text, fontWeight: 500 }}>{email}</Box>
                  </Typography>
                </Paper>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disableElevation
                sx={{
                  background: colors.accentGradient,
                  '&:hover': { 
                    background: colors.accentGradient,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                  },
                  py: 1.8,
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: 'none',
                  mb: 2,
                  transition: 'all 0.3s ease',
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Verificar Código'
                )}
              </Button>

              {/* Botón para reenviar código */}
              <Button
                variant="text"
                onClick={handleResendCode}
                disabled={countdown > 0 || isLoading}
                sx={{
                  color: colors.primary,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                  '&.Mui-disabled': {
                    color: colors.subtext,
                  }
                }}
              >
                {countdown > 0 
                  ? `Reenviar código (${countdown}s)` 
                  : 'Reenviar código'}
              </Button>
            </form>
          </Fade>

          {/* Mensaje de éxito */}
          <Grow in={activeStep === 2} mountOnEnter unmountOnExit>
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3
                }}
              >
                <CheckCircleOutline 
                  sx={{ 
                    fontSize: 45, 
                    color: colors.success
                  }} 
                />
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 1, 
                  color: colors.text,
                  fontWeight: 'bold'
                }}
              >
                ¡Verificación Exitosa!
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  color: colors.subtext
                }}
              >
                Estás siendo redirigido para cambiar tu contraseña
              </Typography>
              <CircularProgress 
                size={28} 
                sx={{ 
                  color: colors.primary
                }} 
              />
            </Box>
          </Grow>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={handleCloseNotification}
      />
    </Box>
  );
};

export default Recuperacion;