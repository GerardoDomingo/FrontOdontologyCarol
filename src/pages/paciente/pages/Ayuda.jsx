import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Button,
  Alert,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Launch as LaunchIcon,
  AccountCircle as ProfileIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  LocalHospital as HealthIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  QuestionAnswer as QAIcon,
  Schedule as ScheduleIcon,
  Favorite as HeartIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  TipsAndUpdates as TipIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useNavigate } from 'react-router-dom';

/**
 * Centro de Ayuda para Pacientes
 * Diseñado para guiar a los pacientes de manera amigable y comprensible
 */
const AyudaPaciente = () => {
  const { isDarkTheme } = useThemeContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(false);

  const colors = {
    background: isDarkTheme ? '#0F172A' : '#F8FAFC',
    cardBg: isDarkTheme ? '#1E293B' : '#FFFFFF',
    primary: isDarkTheme ? '#3B82F6' : '#2563EB',
    secondary: isDarkTheme ? '#10B981' : '#059669',
    accent: isDarkTheme ? '#F59E0B' : '#D97706',
    text: isDarkTheme ? '#F1F5F9' : '#1E293B',
    subtext: isDarkTheme ? '#94A3B8' : '#64748B',
    border: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    success: isDarkTheme ? '#10B981' : '#059669',
    warning: isDarkTheme ? '#F59E0B' : '#D97706',
    error: isDarkTheme ? '#EF4444' : '#DC2626'
  };

  // Funcionalidades principales para pacientes
  const funcionesPrincipales = [
    {
      id: 'perfil',
      nombre: 'Mi Perfil Personal',
      descripcion: 'Mantén actualizada tu información y preferencias',
      icono: <ProfileIcon />,
      ruta: '/Paciente/perfil',
      acceso: 'Portal Privado',
      frecuenciaUso: 'Semanal',
      beneficios: [
        'Información siempre actualizada',
        'Comunicación eficiente con la clínica',
        'Historial médico accesible',
        'Preferencias personalizadas'
      ],
      pasosRapidos: [
        'Ingresa a tu portal personal',
        'Verifica tu información de contacto',
        'Actualiza datos médicos importantes',
        'Guarda los cambios'
      ],
      consejosPaciente: [
        'Mantén tu número de teléfono actualizado',
        'Informa sobre alergias o condiciones médicas',
        'Revisa tu información mensualmente'
      ]
    },
    {
      id: 'citas',
      nombre: 'Mis Citas Médicas',
      descripcion: 'Programa y gestiona tus citas de manera fácil',
      icono: <EventIcon />,
      ruta: '/agendar-cita',
      acceso: 'Público',
      frecuenciaUso: 'Mensual',
      beneficios: [
        'Agenda citas las 24 horas',
        'Recordatorios automáticos',
        'Confirmación inmediata',
        'Reprogramación fácil'
      ],
      pasosRapidos: [
        'Selecciona el tipo de consulta',
        'Elige fecha y hora disponible',
        'Confirma tus datos',
        'Recibe confirmación por email'
      ],
      consejosPaciente: [
        'Agenda con anticipación para mejores horarios',
        'Llega 15 minutos antes de tu cita',
        'Trae tu identificación y documentos médicos'
      ]
    },
    {
      id: 'pagos',
      nombre: 'Mis Pagos y Facturas',
      descripcion: 'Consulta tu estado de cuenta y realiza pagos',
      icono: <PaymentIcon />,
      ruta: '/Paciente/pagos',
      acceso: 'Portal Privado',
      frecuenciaUso: 'Mensual',
      beneficios: [
        'Estado de cuenta en tiempo real',
        'Historial de pagos completo',
        'Múltiples métodos de pago',
        'Recibos digitales'
      ],
      pasosRapidos: [
        'Revisa tu estado de cuenta',
        'Identifica pagos pendientes',
        'Selecciona método de pago',
        'Descarga tu recibo'
      ],
      consejosPaciente: [
        'Revisa tu estado de cuenta mensualmente',
        'Guarda los recibos digitales',
        'Pregunta sobre planes de pago si los necesitas'
      ]
    },
    {
      id: 'servicios',
      nombre: 'Servicios Disponibles',
      descripcion: 'Conoce todos nuestros tratamientos dentales',
      icono: <HealthIcon />,
      ruta: '/servicios',
      acceso: 'Público',
      frecuenciaUso: 'Ocasional',
      beneficios: [
        'Información detallada de tratamientos',
        'Precios transparentes',
        'Duración estimada',
        'Preparación necesaria'
      ],
      pasosRapidos: [
        'Explora el catálogo de servicios',
        'Lee las descripciones detalladas',
        'Consulta precios y duración',
        'Contacta para más información'
      ],
      consejosPaciente: [
        'Lee bien las preparaciones necesarias',
        'Pregunta sobre opciones de tratamiento',
        'Consulta sobre seguros dentales'
      ]
    }
  ];

  // Preguntas frecuentes dinámicas
  const preguntasFrecuentes = [
    {
      pregunta: '¿Cómo puedo agendar mi primera cita?',
      respuesta: 'Es muy fácil. Ve a la sección "Agendar Cita" en nuestro sitio web, selecciona el tipo de consulta que necesitas, elige la fecha y hora que mejor te convenga, y completa tus datos. Recibirás una confirmación inmediata por email.',
      categoria: 'Citas'
    },
    {
      pregunta: '¿Qué documentos debo traer a mi primera consulta?',
      respuesta: 'Trae tu identificación oficial, cualquier seguro dental que tengas, lista de medicamentos que tomas actualmente, y si tienes radiografías dentales recientes. También es útil una lista de tus preocupaciones dentales.',
      categoria: 'Primera Visita'
    },
    {
      pregunta: '¿Cómo puedo acceder a mi historial dental?',
      respuesta: 'Una vez que tengas tu cuenta de paciente, puedes acceder a tu historial dental completo desde tu portal personal. Ahí encontrarás diagnósticos, tratamientos realizados, imágenes y recomendaciones.',
      categoria: 'Portal'
    },
    {
      pregunta: '¿Qué métodos de pago aceptan?',
      respuesta: 'Aceptamos efectivo, tarjetas de débito y crédito (Visa, Mastercard), transferencias bancarias y trabajamos con varios seguros dentales. También ofrecemos planes de pago para tratamientos extensos.',
      categoria: 'Pagos'
    },
    {
      pregunta: '¿Puedo reprogramar o cancelar mi cita?',
      respuesta: 'Sí, puedes reprogramar o cancelar tu cita hasta 24 horas antes. Puedes hacerlo a través de tu portal de paciente o llamándonos directamente. Te recomendamos avisar con anticipación.',
      categoria: 'Citas'
    }
  ];

  // Tips de salud dental
  const tipsSaludDental = [
    {
      titulo: 'Cepillado Efectivo',
      descripcion: 'Cepíllate al menos 2 veces al día con movimientos circulares suaves',
      icono: <HeartIcon sx={{ color: colors.success }} />
    },
    {
      titulo: 'Hilo Dental Diario',
      descripcion: 'Usa hilo dental cada noche para eliminar placa entre los dientes',
      icono: <StarIcon sx={{ color: colors.primary }} />
    },
    {
      titulo: 'Visitas Regulares',
      descripcion: 'Programa limpiezas cada 6 meses para mantener tu salud oral',
      icono: <ScheduleIcon sx={{ color: colors.accent }} />
    },
    {
      titulo: 'Dieta Saludable',
      descripcion: 'Limita azúcares y bebidas ácidas que dañan el esmalte dental',
      icono: <TipIcon sx={{ color: colors.warning }} />
    }
  ];

  // Filtrar funciones según búsqueda
  const funcionesFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return funcionesPrincipales;
    
    const termino = searchTerm.toLowerCase();
    return funcionesPrincipales.filter(funcion => 
      funcion.nombre.toLowerCase().includes(termino) ||
      funcion.descripcion.toLowerCase().includes(termino) ||
      funcion.beneficios.some(b => b.toLowerCase().includes(termino)) ||
      funcion.consejosPaciente.some(c => c.toLowerCase().includes(termino))
    );
  }, [searchTerm, funcionesPrincipales]);

  const limpiarBusqueda = () => setSearchTerm('');
  const irAFuncion = (ruta) => navigate(ruta);

  const getAccesoColor = (acceso) => {
    return acceso === 'Portal Privado' ? colors.primary : colors.secondary;
  };

  const handleFAQChange = (panel) => (event, isExpanded) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Amigable */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ¡Hola! Te ayudamos a navegar tu portal
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          Encuentra todo lo que necesitas para cuidar tu salud dental
        </Typography>
        
        {/* Estadísticas amigables */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold">🦷</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Sonrisas Cuidadas</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold">24/7</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Portal Disponible</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold">🕒</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Citas Rápidas</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold">💳</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Pagos Seguros</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Panel Principal */}
        <Grid item xs={12} lg={8}>
          {/* Buscador */}
          <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, mb: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" color={colors.text} gutterBottom>
              ¿Qué necesitas hacer hoy?
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Busca por: perfil, citas, pagos, servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.primary }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={limpiarBusqueda} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {/* Grid de Funciones */}
          <Grid container spacing={3}>
            {funcionesFiltradas.map((funcion) => (
              <Grid item xs={12} md={6} key={funcion.id}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDarkTheme ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.15)',
                      borderColor: getAccesoColor(funcion.acceso)
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: `${getAccesoColor(funcion.acceso)}20`, color: getAccesoColor(funcion.acceso), mr: 2 }}>
                          {funcion.icono}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color={colors.text}>
                            {funcion.nombre}
                          </Typography>
                          <Typography variant="body2" color={colors.subtext}>
                            {funcion.descripcion}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={funcion.acceso}
                        size="small"
                        sx={{
                          bgcolor: `${getAccesoColor(funcion.acceso)}20`,
                          color: getAccesoColor(funcion.acceso),
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    {/* Información útil */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      <Typography variant="body2" color={colors.text}>
                        <strong>Uso recomendado:</strong> {funcion.frecuenciaUso}
                      </Typography>
                    </Box>

                    {/* Pasos rápidos */}
                    <Typography variant="subtitle2" fontWeight="bold" color={colors.text} gutterBottom>
                      Pasos rápidos:
                    </Typography>
                    <List dense sx={{ mb: 2 }}>
                      {funcion.pasosRapidos.slice(0, 2).map((paso, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.2 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                bgcolor: getAccesoColor(funcion.acceso),
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {index + 1}
                            </Box>
                          </ListItemIcon>
                          <ListItemText 
                            primary={paso}
                            primaryTypographyProps={{ variant: 'body2', color: colors.text }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {/* Consejo del día */}
                    {funcion.consejosPaciente[0] && (
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 2,
                          bgcolor: `${colors.primary}10`,
                          border: `1px solid ${colors.primary}30`
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          💡 Consejo:
                        </Typography>
                        <Typography variant="body2">
                          {funcion.consejosPaciente[0]}
                        </Typography>
                      </Alert>
                    )}

                    {/* Botón de acceso */}
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => irAFuncion(funcion.ruta)}
                      startIcon={<LaunchIcon />}
                      sx={{
                        bgcolor: getAccesoColor(funcion.acceso),
                        fontWeight: 'bold'
                      }}
                    >
                      {funcion.acceso === 'Portal Privado' ? 'Ir a Mi Portal' : 'Explorar'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Panel Lateral */}
        <Grid item xs={12} lg={4}>
          {/* Tips de Salud Dental */}
          <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HeartIcon sx={{ color: colors.success, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold" color={colors.text}>
                  Tips para tu Sonrisa
                </Typography>
              </Box>
              
              {tipsSaludDental.map((tip, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: `1px solid ${colors.border}`, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {tip.icono}
                    <Typography variant="subtitle2" fontWeight="bold" color={colors.text} sx={{ ml: 1 }}>
                      {tip.titulo}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color={colors.subtext}>
                    {tip.descripcion}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Contacto Rápido */}
          <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color={colors.text} gutterBottom>
                ¿Necesitas Ayuda Personal?
              </Typography>
              
              <Typography variant="body2" color={colors.subtext} sx={{ mb: 2 }}>
                Nuestro equipo está listo para ayudarte
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PhoneIcon />}
                    onClick={() => navigate('/Contact')}
                    sx={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Contactar Clínica
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/agendar-cita')}
                    sx={{ borderColor: colors.secondary, color: colors.secondary }}
                  >
                    Agendar Cita
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, p: 2, bgcolor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                <Typography variant="body2" color={colors.text} align="center">
                  <strong>Horarios:</strong><br />
                  Lun-Vie: 8:00 AM - 6:00 PM<br />
                  Sáb: 9:00 AM - 2:00 PM
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sección de Preguntas Frecuentes */}
      <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, mt: 4 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <QAIcon sx={{ color: colors.primary, mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" color={colors.text}>
              Preguntas Frecuentes
            </Typography>
          </Box>
          
          {preguntasFrecuentes.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expandedFAQ === index}
              onChange={handleFAQChange(index)}
              sx={{
                bgcolor: 'transparent',
                boxShadow: 'none',
                border: `1px solid ${colors.border}`,
                borderRadius: 1,
                mb: 1,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="medium" color={colors.text} sx={{ flexGrow: 1 }}>
                    {faq.pregunta}
                  </Typography>
                  <Chip
                    label={faq.categoria}
                    size="small"
                    sx={{
                      bgcolor: `${colors.primary}20`,
                      color: colors.primary,
                      ml: 2
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color={colors.subtext}>
                  {faq.respuesta}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default AyudaPaciente;