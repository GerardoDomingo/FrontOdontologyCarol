import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container, 
  Grid, 
  Fade, 
  Zoom,
  CircularProgress,
  Divider,
  Avatar,
  Backdrop,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Alert
} from '@mui/material';
import { 
  CheckCircleOutline, 
  AccessTime, 
  CalendarMonth, 
  MedicalServices,
  ArrowForward,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  VerifiedUser as VerifiedUserIcon,
  HourglassTop as HourglassTopIcon,
  NotificationsActive as NotificationsActiveIcon,
  Home as HomeIcon,
  CheckCircle,
  Warning as WarningIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ErrorOutline as ErrorOutlineIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';
import moment from 'moment';
import 'moment/locale/es';
import { motion } from 'framer-motion';

// Animaciones (se mantienen igual)
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const fallConfetti = keyframes`
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

// Estilos de componentes (mantenemos los mismos)
const ConfirmationContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  }
}));

const MainPaper = styled(Paper)(({ theme, isDarkTheme }) => ({
  padding: theme.spacing(5),
  borderRadius: 24,
  width: '100%',
  boxShadow: isDarkTheme 
    ? '0 10px 30px rgba(0,0,0,0.25)' 
    : '0 10px 40px rgba(3,66,124,0.15)',
  background: isDarkTheme 
    ? 'linear-gradient(145deg, #2C2C2C 0%, #323232 100%)' 
    : 'linear-gradient(145deg, #FFFFFF 0%, #F8FBFF 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: isDarkTheme
      ? 'linear-gradient(90deg, #2196F3, #4CAF50, #2196F3)'
      : 'linear-gradient(90deg, #03427c, #4CAF50, #03427c)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s infinite linear`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: 16,
  }
}));

const SuccessCircle = styled(Box)(({ theme, isDarkTheme }) => ({
  width: 120,
  height: 120,
  borderRadius: '50%',
  backgroundColor: isDarkTheme ? '#2C2C2C' : '#F1F8E9',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  position: 'relative',
  animation: `${pulse} 2s infinite`,
  boxShadow: `0 0 30px ${isDarkTheme ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`,
  border: '3px solid #4CAF50',
  [theme.breakpoints.down('sm')]: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing(3),
  }
}));

const InfoCard = styled(Card)(({ theme, isDarkTheme }) => ({
  borderRadius: 20,
  marginBottom: theme.spacing(3),
  boxShadow: isDarkTheme 
    ? '0 8px 20px rgba(0,0,0,0.2)' 
    : '0 8px 20px rgba(0,0,0,0.05)',
  border: `1px solid ${isDarkTheme ? '#404040' : '#E8F5FF'}`,
  backgroundColor: isDarkTheme ? '#333333' : '#FFFFFF',
  overflow: 'visible',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: isDarkTheme 
      ? '0 12px 28px rgba(0,0,0,0.3)' 
      : '0 12px 28px rgba(3,66,124,0.12)',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: 16,
  }
}));

const SectionHeader = styled(Box)(({ theme, isDarkTheme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(0, 1),
  '& .section-icon': {
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #444444 0%, #555555 100%)' 
      : 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    color: isDarkTheme ? '#FFFFFF' : '#03427c',
    marginRight: theme.spacing(1.5),
    padding: theme.spacing(1),
    borderRadius: '50%',
    display: 'flex',
    boxShadow: isDarkTheme 
      ? '0 4px 8px rgba(0,0,0,0.2)' 
      : '0 4px 8px rgba(3,66,124,0.1)',
  }
}));

const InfoRow = styled(Box)(({ theme, isDarkTheme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2.5),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:last-child': {
    marginBottom: 0
  },
  '&:hover': {
    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(3,66,124,0.02)',
    transform: 'translateX(5px)',
  },
  '& .info-icon': {
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #404040 0%, #505050 100%)' 
      : 'linear-gradient(135deg, #F5F9FF 0%, #E3F2FD 100%)',
    color: isDarkTheme ? '#CCCCCC' : '#03427c',
    borderRadius: '50%',
    width: 42,
    height: 42,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
    boxShadow: isDarkTheme 
      ? '0 3px 5px rgba(0,0,0,0.2)' 
      : '0 3px 5px rgba(0,0,0,0.05)',
  },
  '& .info-content': {
    flex: 1
  }
}));

const MainButton = styled(Button)(({ theme, isDarkTheme }) => ({
  marginTop: theme.spacing(4),
  padding: '14px 28px',
  borderRadius: 30,
  boxShadow: isDarkTheme 
    ? '0 8px 16px rgba(0,0,0,0.3)' 
    : '0 8px 16px rgba(3,66,124,0.2)',
  transition: 'all 0.3s ease',
  fontWeight: 'bold',
  fontSize: '1rem',
  textTransform: 'none',
  animation: `${float} 3s ease-in-out infinite`,
  background: isDarkTheme
    ? 'linear-gradient(45deg, #424242 0%, #616161 100%)'
    : 'linear-gradient(45deg, #03427c 0%, #0277BD 100%)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: isDarkTheme 
      ? '0 12px 24px rgba(0,0,0,0.4)' 
      : '0 12px 24px rgba(3,66,124,0.3)',
    background: isDarkTheme
      ? 'linear-gradient(45deg, #424242 30%, #757575 100%)'
      : 'linear-gradient(45deg, #03427c 30%, #039BE5 100%)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 24px',
    fontSize: '0.9rem',
  }
}));

const AlertBox = styled(Box)(({ theme, isDarkTheme }) => ({
  padding: theme.spacing(2, 2.5),
  backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.1)' : '#FFF8E1',
  borderRadius: 12,
  border: '1px solid #FFB74D',
  marginTop: theme.spacing(3),
  display: 'flex',
  alignItems: 'flex-start',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 5px 15px rgba(255, 152, 0, 0.1)',
  },
  '& .alert-icon': {
    color: '#F57C00',
    marginRight: theme.spacing(1.5),
    marginTop: 2,
    animation: `${pulse} 2s infinite`,
  }
}));

// Cambiado de styled component a función de estilos
// Esto resuelve el error "ContactAlert is not a function"
const contactAlertStyles = ({ theme, isDarkTheme, severity }) => {
  // Definir colores según la severidad
  let bgColor, borderColor, iconColor;
  
  if (severity === 'warning') {
    bgColor = isDarkTheme ? 'rgba(255, 152, 0, 0.1)' : '#FFF3E0';
    borderColor = isDarkTheme ? '#FF9800' : '#FFB74D';
    iconColor = '#F57C00';
  } else if (severity === 'error') {
    bgColor = isDarkTheme ? 'rgba(244, 67, 54, 0.1)' : '#FFEBEE';
    borderColor = isDarkTheme ? '#F44336' : '#EF5350';
    iconColor = '#D32F2F';
  } else { // info
    bgColor = isDarkTheme ? 'rgba(33, 150, 243, 0.1)' : '#E3F2FD';
    borderColor = isDarkTheme ? '#2196F3' : '#90CAF9';
    iconColor = '#1976D2';
  }
  
  return {
    padding: theme.spacing(2, 2.5),
    backgroundColor: bgColor,
    borderRadius: 12,
    border: `1px solid ${borderColor}`,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'flex-start',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: `0 5px 15px rgba(0, 0, 0, 0.1)`,
    },
    '& .alert-icon': {
      color: iconColor,
      marginRight: theme.spacing(1.5),
      marginTop: 2,
      animation: severity === 'error' ? `${pulse} 2s infinite` : 'none',
    }
  };
};

const Confetti = styled(Box)(({ delay, duration, left }) => ({
  position: 'absolute',
  top: '-20px',
  left: `${left}%`,
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
  animation: `${fallConfetti} ${duration}s ease-in ${delay}s infinite`,
  zIndex: 0,
}));

/**
 * Componente de confirmación para mostrar el estado de citas y tratamientos
 * Proporciona feedback visual al usuario sobre su solicitud y los próximos pasos
 */
const Confirmacion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkTheme } = useThemeContext();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Configurar confeti
  const confettiCount = 15;
  const confetti = [...Array(confettiCount)].map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 3
  }));
  
  // Obtener datos de location.state o localStorage
  const { state } = location;
  const esTratamiento = state?.esTratamiento || localStorage.getItem('es_tratamiento') === 'true';
  const fechaCita = state?.fechaCita || 'No disponible';
  const horaCita = state?.horaCita || 'No disponible';
  const servicio = state?.servicio || 'No disponible';
  const especialista = state?.especialista || 'No disponible';
  
  // Nuevos campos para el manejo de alertas de contacto
  const tieneCorreo = state?.correo || localStorage.getItem('correo');
  const tieneTelefono = state?.telefono || localStorage.getItem('telefono');
  const omitioCorreo = state?.omitioCorreo || localStorage.getItem('omitCorreo') === 'true';
  const omitioTelefono = state?.omitioTelefono || localStorage.getItem('omitTelefono') === 'true';
  const pacienteExistente = state?.pacienteExistente || localStorage.getItem('paciente_existente') === 'true';

  useEffect(() => {
    // Activar animación después de un pequeño retraso para mejor efecto
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);

    // Scroll al inicio cuando se monta el componente
    window.scrollTo(0, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleVolver = () => {
    setLoading(true);
    setOpenBackdrop(true);
    
    // Simular tiempo de carga antes de redirigir
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  // Formatear fecha de la cita si está disponible
  const formattedDate = fechaCita !== 'No disponible' 
  ? (() => {
      const fechaStr = typeof fechaCita === 'string' ? fechaCita : fechaCita.toISOString();
      const soloFecha = fechaStr.split('T')[0];
      return moment(`${soloFecha}T12:00:00`).locale('es').format('dddd, D [de] MMMM [de] YYYY');
    })()
  : 'Fecha por confirmar';
    
  // Pasos del proceso según tipo (tratamiento o cita)
  const stepsTratamiento = [
    { label: 'Solicitud enviada', icon: CheckCircleOutline, completed: true },
    { label: 'Revisión', icon: HourglassTopIcon, completed: false },
    { label: 'Confirmación', icon: VerifiedUserIcon, completed: false },
    { label: 'Primera cita', icon: EventAvailableIcon, completed: false }
  ];

  const stepsCita = [
    { label: 'Cita agendada', icon: CheckCircleOutline, completed: true },
    { label: 'Asistencia', icon: EventAvailableIcon, completed: false }
  ];

  const pasos = esTratamiento ? stepsTratamiento : stepsCita;
  
  // Función para determinar la información de alerta de contacto
  const getContactAlertInfo = () => {
    // Verificar si el usuario es un paciente existente
    const pacienteExistente = state?.pacienteExistente || localStorage.getItem('paciente_existente') === 'true';
    
    // Si es un paciente existente, no mostramos alertas de advertencia o error
    if (pacienteExistente) {
      return {
        severity: 'info',
        icon: <InfoIcon />,
        title: 'Te mantendremos informado',
        message: esTratamiento 
          ? 'El odontólogo revisará tu solicitud y te contactará para confirmar los detalles del tratamiento. Mantente pendiente de tu correo y teléfono ya registrados.' 
          : 'Te enviaremos un recordatorio por correo o teléfono antes de tu cita.',
      };
    }
    
    // Para pacientes nuevos
    const noTieneContacto = (omitioCorreo || !tieneCorreo) && (omitioTelefono || !tieneTelefono);
    
    if (noTieneContacto) {
      return {
        severity: 'error',
        icon: <ErrorOutlineIcon />,
        title: 'No ingresaste información de contacto',
        message: 'Será más difícil comunicarnos contigo para actualizaciones o cambios. Por favor, comunícate directamente con la clínica o asiste personalmente para cualquier información.',
      };
    } else if (omitioCorreo || omitioTelefono) {
      return {
        severity: 'warning',
        icon: <WarningIcon />,
        title: 'Información de contacto incompleta',
        message: 'Te contactaremos mediante la información proporcionada, pero podría ser más difícil comunicarnos para actualizaciones importantes.',
      };
    } else {
      return {
        severity: 'info',
        icon: <InfoIcon />,
        title: 'Te mantendremos informado',
        message: esTratamiento 
          ? 'El odontólogo revisará tu solicitud y te contactará para confirmar los detalles del tratamiento. Mantente pendiente de tu correo y teléfono.' 
          : 'Te enviaremos un recordatorio por correo o teléfono antes de tu cita.',
      };
    }
  };
  
  const contactAlertInfo = getContactAlertInfo();

  return (
    <ConfirmationContainer maxWidth="md">
      {/* Confeti animado */}
      {visible && confetti.map((conf) => (
        <Confetti
          key={conf.id}
          left={conf.left}
          delay={conf.delay}
          duration={conf.duration}
        />
      ))}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <MainPaper elevation={3} isDarkTheme={isDarkTheme}>
          {/* Círculo de éxito */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.3 
            }}
          >
            <SuccessCircle isDarkTheme={isDarkTheme}>
              <CheckCircle 
                sx={{ 
                  fontSize: isMobile ? 50 : 60, 
                  color: '#4CAF50'
                }} 
              />
            </SuccessCircle>
          </motion.div>
          
          {/* Título principal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              component="h1" 
              align="center"
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 1,
                background: isDarkTheme
                  ? 'linear-gradient(90deg, #4CAF50, #8BC34A)'
                  : 'linear-gradient(90deg, #03427c, #4CAF50)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {esTratamiento 
                ? '¡Solicitud de Tratamiento Enviada!' 
                : '¡Cita Agendada con Éxito!'}
            </Typography>
          </motion.div>
          
          {/* Subtítulo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Typography 
              variant="subtitle1" 
              align="center"
              sx={{ 
                mb: 4,
                maxWidth: '85%',
                mx: 'auto',
                color: isDarkTheme ? '#CCCCCC' : '#606060',
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              {esTratamiento 
                ? 'Tu solicitud de tratamiento ha sido recibida y será revisada por un especialista próximamente. Te contactaremos a la brevedad.' 
                : 'Tu cita ha sido registrada correctamente. Te esperamos en la fecha y hora indicadas para brindarte la mejor atención.'}
            </Typography>
          </motion.div>
          
          {/* Alerta de contacto (CORREGIDA) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Box 
              sx={{
                maxWidth: '90%',
                mx: 'auto',
                mb: 3
              }}
            >
              {/* Aquí aplicamos los estilos con la función contactAlertStyles en lugar del componente ContactAlert */}
              <Box 
                sx={contactAlertStyles({ 
                  theme, 
                  isDarkTheme, 
                  severity: contactAlertInfo.severity 
                })}
              >
                {React.cloneElement(contactAlertInfo.icon, { 
                  className: "alert-icon",
                  fontSize: "small"
                })}
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      color: isDarkTheme ? '#FFFFFF' : '#333333', 
                      mb: 0.5,
                      fontSize: isMobile ? '0.9rem' : '1rem'
                    }}
                  >
                    {contactAlertInfo.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkTheme ? '#CCCCCC' : '#666666',
                      fontSize: isMobile ? '0.85rem' : '0.875rem'
                    }}
                  >
                    {contactAlertInfo.message}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
          
          <Divider 
            sx={{ 
              mb: 4, 
              backgroundColor: isDarkTheme ? '#444444' : '#E0E0E0',
              opacity: 0.6
            }} 
          />
          
          {/* Contenedor de información principal */}
          <Grid container spacing={isTablet ? 3 : 4} direction={isTablet ? "column" : "row"}>
            {/* Columna: Información de la cita/tratamiento */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <InfoCard isDarkTheme={isDarkTheme}>
                  <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                    {/* Encabezado de sección */}
                    <SectionHeader isDarkTheme={isDarkTheme}>
                      <Avatar className="section-icon">
                        <MedicalServices fontSize="small" />
                      </Avatar>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: isDarkTheme ? '#FFFFFF' : '#03427c',
                        fontSize: isMobile ? '1.1rem' : '1.25rem'
                      }}>
                        Detalles de tu {esTratamiento ? 'Tratamiento' : 'Cita'}
                      </Typography>
                    </SectionHeader>
                    
                    {/* Información del servicio */}
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <Box className="info-icon">
                        <MedicalServices fontSize="small" />
                      </Box>
                      <Box className="info-content">
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          color: isDarkTheme ? '#FFFFFF' : '#03427c',
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                          Servicio
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: isDarkTheme ? '#CCCCCC' : '#666666',
                          fontSize: isMobile ? '0.85rem' : '0.875rem'
                        }}>
                          {servicio}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    {/* Información del especialista */}
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <Box className="info-icon">
                        <PersonIcon fontSize="small" />
                      </Box>
                      <Box className="info-content">
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          color: isDarkTheme ? '#FFFFFF' : '#03427c',
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                          Especialista
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: isDarkTheme ? '#CCCCCC' : '#666666',
                          fontSize: isMobile ? '0.85rem' : '0.875rem'
                        }}>
                          {especialista}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    {/* Información de fecha */}
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <Box className="info-icon">
                        <CalendarMonth fontSize="small" />
                      </Box>
                      <Box className="info-content">
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            color: isDarkTheme ? '#FFFFFF' : '#03427c',
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            mr: 1
                          }}>
                            {esTratamiento ? 'Fecha propuesta' : 'Fecha de la cita'}
                          </Typography>
                          {esTratamiento && (
                            <Chip 
                              size="small" 
                              label="Pendiente" 
                              color="warning"
                              sx={{ 
                                height: '20px', 
                                fontSize: '0.7rem',
                                mt: isMobile ? 0.5 : 0
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: isDarkTheme ? '#CCCCCC' : '#666666',
                          fontSize: isMobile ? '0.85rem' : '0.875rem',
                          textTransform: 'capitalize'
                        }}>
                          {formattedDate}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    {/* Información de hora */}
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <Box className="info-icon">
                        <AccessTime fontSize="small" />
                      </Box>
                      <Box className="info-content">
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          color: isDarkTheme ? '#FFFFFF' : '#03427c',
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                          {esTratamiento ? 'Hora propuesta' : 'Hora de la cita'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: isDarkTheme ? '#CCCCCC' : '#666666',
                          fontSize: isMobile ? '0.85rem' : '0.875rem'
                        }}>
                          {horaCita}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    {/* Información de contacto proporcionada */}
                    <InfoRow isDarkTheme={isDarkTheme}>
                      <Box className="info-icon">
                        {tieneCorreo && !omitioCorreo ? (
                          <EmailIcon fontSize="small" />
                        ) : tieneTelefono && !omitioTelefono ? (
                          <PhoneIcon fontSize="small" />
                        ) : (
                          <WarningIcon fontSize="small" />
                        )}
                      </Box>
                      <Box className="info-content">
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          color: isDarkTheme ? '#FFFFFF' : '#03427c',
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}>
                          Información de contacto
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: isDarkTheme ? '#CCCCCC' : '#666666',
                          fontSize: isMobile ? '0.85rem' : '0.875rem'
                        }}>
                          {tieneCorreo && !omitioCorreo ? 'Correo electrónico proporcionado' : ''}
                          {tieneCorreo && !omitioCorreo && tieneTelefono && !omitioTelefono ? ' y ' : ''}
                          {tieneTelefono && !omitioTelefono ? 'Teléfono proporcionado' : ''}
                          {!tieneCorreo || omitioCorreo ? 'Sin correo electrónico' : ''}
                          {(!tieneCorreo || omitioCorreo) && (!tieneTelefono || omitioTelefono) ? ' y ' : ''}
                          {!tieneTelefono || omitioTelefono ? 'Sin teléfono' : ''}
                        </Typography>
                      </Box>
                    </InfoRow>
                    
                    {/* Alerta para tratamientos */}
                    {esTratamiento && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                      >
                        <AlertBox isDarkTheme={isDarkTheme}>
                          <NotificationsActiveIcon fontSize="small" className="alert-icon" />
                          <Box>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              color: '#F57C00', 
                              mb: 0.5,
                              fontSize: isMobile ? '0.9rem' : '1rem'
                            }}>
                              Importante
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: isDarkTheme ? '#CCCCCC' : '#666666',
                              fontSize: isMobile ? '0.85rem' : '0.875rem'
                            }}>
                              El odontólogo evaluará tu caso y confirmará o ajustará la fecha y hora propuestas según sea necesario.
                            </Typography>
                          </Box>
                        </AlertBox>
                      </motion.div>
                    )}
                  </CardContent>
                </InfoCard>
              </motion.div>
            </Grid>
            
            {/* Columna: Proceso y siguientes pasos */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <InfoCard isDarkTheme={isDarkTheme}>
                  <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                    {/* Encabezado de sección */}
                    <SectionHeader isDarkTheme={isDarkTheme}>
                      <Avatar className="section-icon">
                        <EventAvailableIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: isDarkTheme ? '#FFFFFF' : '#03427c',
                        fontSize: isMobile ? '1.1rem' : '1.25rem'
                      }}>
                        Proceso y Siguientes Pasos
                      </Typography>
                    </SectionHeader>
                    
                    {/* Stepper vertical para mejor visualización */}
                    <Stepper 
                      activeStep={0} 
                      orientation="vertical"
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: isDarkTheme ? '#CCCCCC' : '#666666',
                          fontSize: isMobile ? '0.85rem' : '0.875rem'
                        },
                        '& .MuiStepConnector-line': {
                          minHeight: 20,
                          borderLeftColor: isDarkTheme ? '#444444' : '#E0E0E0'
                        }
                      }}
                    >
                      {pasos.map((paso, index) => (
                        <Step key={paso.label} completed={index === 0}>
                          <StepLabel
                            StepIconComponent={({ active, completed }) => (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                  delay: 1.2 + (index * 0.2),
                                  type: "spring",
                                  stiffness: 260,
                                  damping: 20
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: index === 0 ? '#4caf50' : (isDarkTheme ? '#555555' : '#9e9e9e'),
                                    width: 36,
                                    height: 36,
                                    boxShadow: index === 0 ? '0 0 10px rgba(76,175,80,0.5)' : 'none'
                                  }}
                                >
                                  <paso.icon sx={{ color: 'white', fontSize: 20 }} />
                                </Avatar>
                              </motion.div>
                            )}
                          >
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: index === 0 ? 600 : 400,
                                color: index === 0 ? (isDarkTheme ? '#FFFFFF' : '#03427c') : (isDarkTheme ? '#AAAAAA' : '#666666'),
                                fontSize: isMobile ? '0.9rem' : '1rem'
                              }}
                            >
                              {paso.label}
                            </Typography>
                            {index === 0 && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: isDarkTheme ? '#AAAAAA' : '#666666', 
                                  mt: 0.5,
                                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                                }}
                              >
                                {esTratamiento 
                                  ? 'Tu solicitud ha sido registrada en el sistema.' 
                                  : 'Tu cita ha sido reservada exitosamente.'}
                              </Typography>
                            )}
                            {index === 1 && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: isDarkTheme ? '#AAAAAA' : '#666666', 
                                  mt: 0.5,
                                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                                }}
                              >
                                {esTratamiento 
                                  ? 'Un especialista evaluará tu caso próximamente.' 
                                  : 'Recuerda acudir puntualmente a tu consulta.'}
                              </Typography>
                            )}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    
                    {/* Información adicional */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                    >
                      <Box 
                        sx={{ 
                          mt: 3, 
                          p: 2, 
                          bgcolor: isDarkTheme ? 'rgba(66, 165, 245, 0.1)' : '#E3F2FD', 
                          borderRadius: 2, 
                          border: `1px solid ${isDarkTheme ? '#2196F3' : '#90CAF9'}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)',
                          }
                        }}
                      >
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: isDarkTheme ? '#90CAF9' : '#0277BD',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                          }}
                        >
                          <NotificationsActiveIcon fontSize="small" sx={{ mr: 1 }} />
                          Recordatorio
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: isDarkTheme ? '#CCCCCC' : '#555555',
                          fontSize: isMobile ? '0.85rem' : '0.875rem'
                        }}>
                          {esTratamiento 
                            ? 'Recibirás una notificación cuando el odontólogo confirme tu tratamiento. Puedes consultar el estado en cualquier momento.' 
                            : 'Llega 15 minutos antes de la hora programada. Si necesitas cancelar, hazlo con al menos 24 horas de anticipación.'}
                        </Typography>
                      </Box>
                    </motion.div>
                  </CardContent>
                </InfoCard>
              </motion.div>
            </Grid>
          </Grid>
          
          {/* Botón para volver al inicio */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MainButton
                variant="contained"
                size="large"
                onClick={handleVolver}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <HomeIcon />}
                endIcon={loading ? null : <ArrowForward />}
                sx={{ 
                  backgroundColor: isDarkTheme ? '#616161' : '#03427c',
                  '&:hover': { backgroundColor: isDarkTheme ? '#424242' : '#02305c' }
                }}
                isDarkTheme={isDarkTheme}
              >
                {loading ? 'Redirigiendo...' : 'Volver al inicio'}
              </MainButton>
            </motion.div>
          </Box>
        </MainPaper>
      </motion.div>
      
      <Backdrop
        sx={{ 
          color: '#FFFFFF', 
          zIndex: 1201,
          flexDirection: 'column',
          backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(3, 66, 124, 0.8)'
        }}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" size={50} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
          Redirigiendo al inicio...
        </Typography>
      </Backdrop>
    </ConfirmationContainer>
  );
};

export default Confirmacion;