import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Button,
  Divider,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

/**
 * Componente de Ayuda para Administradores del Sistema Odontología Carol
 * Proporciona guías completas, FAQs y solución de problemas
 */
const AyudaAdmin = () => {
  const { isDarkTheme } = useThemeContext();
  const [expandedSection, setExpandedSection] = useState('getting-started');

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

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  // Guías principales
  const guiasPrincipales = [
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      icon: <SchoolIcon />,
      description: 'Configure su sistema y comience a usar la plataforma',
      content: [
        'Configurar perfil de la clínica en "Configuración"',
        'Agregar información de contacto y horarios',
        'Crear servicios dentales disponibles',
        'Configurar personal médico y administrativo',
        'Personalizar notificaciones del sistema'
      ]
    },
    {
      id: 'patients',
      title: 'Gestión de Pacientes',
      icon: <PeopleIcon />,
      description: 'Administre eficientemente la base de datos de pacientes',
      content: [
        'Registrar nuevos pacientes con información completa',
        'Actualizar datos personales y de contacto',
        'Gestionar historial clínico y tratamientos',
        'Configurar alertas médicas y alergias',
        'Exportar reportes de pacientes'
      ]
    },
    {
      id: 'appointments',
      title: 'Sistema de Citas',
      icon: <EventIcon />,
      description: 'Optimice la programación y gestión de citas',
      content: [
        'Programar citas desde el calendario',
        'Gestionar confirmaciones automáticas',
        'Configurar recordatorios por email/SMS',
        'Manejar cancelaciones y reprogramaciones',
        'Generar reportes de productividad'
      ]
    },
    {
      id: 'reports',
      title: 'Reportes y Estadísticas',
      icon: <AssessmentIcon />,
      description: 'Analice el rendimiento de su clínica',
      content: [
        'Visualizar métricas de ingresos mensuales',
        'Analizar tendencias de pacientes',
        'Reportes de servicios más solicitados',
        'Estadísticas de personal médico',
        'Exportar datos para análisis externos'
      ]
    }
  ];

  // FAQs específicas para administradores
  const faqsAdmin = [
    {
      pregunta: '¿Cómo puedo recuperar una cita eliminada accidentalmente?',
      respuesta: 'Las citas eliminadas se guardan en el historial por 30 días. Vaya a "Historial" > "Citas Eliminadas" y seleccione "Restaurar" en la cita deseada.'
    },
    {
      pregunta: '¿Puedo limitar el acceso de ciertos empleados a información específica?',
      respuesta: 'Sí, en "Gestión de Empleados" puede asignar roles específicos (Recepcionista, Asistente, Doctor) con diferentes niveles de acceso a la información.'
    },
    {
      pregunta: '¿Cómo configuro las notificaciones automáticas para pacientes?',
      respuesta: 'En "Configuración" > "Notificaciones", puede establecer recordatorios automáticos 24h y 2h antes de las citas, así como follow-ups post-tratamiento.'
    },
    {
      pregunta: '¿El sistema realiza respaldos automáticos de los datos?',
      respuesta: 'Sí, se realizan respaldos automáticos diarios. También puede crear respaldos manuales en "Configuración" > "Respaldos y Seguridad".'
    },
    {
      pregunta: '¿Cómo genero reportes financieros mensuales?',
      respuesta: 'Vaya a "Finanzas" > "Reportes", seleccione el período deseado y elija el tipo de reporte (ingresos, gastos, utilidades). Puede exportar en PDF o Excel.'
    },
    {
      pregunta: '¿Puedo personalizar los formularios de registro de pacientes?',
      respuesta: 'Sí, en "Configuración" > "Formularios" puede agregar campos personalizados según las necesidades específicas de su clínica.'
    }
  ];

  // Problemas comunes y soluciones
  const problemasComunes = [
    {
      problema: 'El sistema se siente lento',
      solucion: 'Cierre pestañas innecesarias del navegador, limpie el caché o contacte soporte si persiste.',
      tipo: 'performance'
    },
    {
      problema: 'No puedo acceder a cierta función',
      solucion: 'Verifique sus permisos de usuario o contacte al administrador principal para solicitar acceso.',
      tipo: 'access'
    },
    {
      problema: 'Error al enviar notificaciones',
      solucion: 'Verifique la configuración de email en "Configuración" > "Notificaciones" y pruebe la conexión.',
      tipo: 'email'
    },
    {
      problema: 'Datos inconsistentes en reportes',
      solucion: 'Sincronice la base de datos en "Configuración" > "Mantenimiento" > "Sincronizar Datos".',
      tipo: 'data'
    }
  ];

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'performance': return colors.warning;
      case 'access': return colors.error;
      case 'email': return colors.primary;
      case 'data': return colors.secondary;
      default: return colors.subtext;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
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
        <HelpIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Centro de Ayuda - Panel Administrativo
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          Guías completas para administrar eficientemente su clínica dental
        </Typography>
      </Paper>

      {/* Guías de Inicio Rápido */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {guiasPrincipales.map((guia) => (
          <Grid item xs={12} md={6} key={guia.id}>
            <Card
              sx={{
                height: '100%',
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: colors.primary, mr: 2 }}>
                    {guia.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color={colors.text}>
                    {guia.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color={colors.subtext} sx={{ mb: 3 }}>
                  {guia.description}
                </Typography>
                <List dense>
                  {guia.content.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon sx={{ color: colors.success, fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: colors.text
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQs */}
      <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${colors.border}` }}>
          <Typography variant="h5" fontWeight="bold" color={colors.text}>
            Preguntas Frecuentes
          </Typography>
          <Typography variant="body2" color={colors.subtext}>
            Respuestas a las consultas más comunes de administradores
          </Typography>
        </Box>
        <Box sx={{ p: 1 }}>
          {faqsAdmin.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                bgcolor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                border: 'none'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: colors.primary }} />}
                sx={{
                  px: 2,
                  '&:hover': { bgcolor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium" color={colors.text}>
                  {faq.pregunta}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pt: 0 }}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    bgcolor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    color: colors.text,
                    border: `1px solid ${colors.primary}20`
                  }}
                >
                  {faq.respuesta}
                </Alert>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>

      {/* Solución de Problemas */}
      <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${colors.border}` }}>
          <Typography variant="h5" fontWeight="bold" color={colors.text}>
            Solución de Problemas
          </Typography>
          <Typography variant="body2" color={colors.subtext}>
            Soluciones rápidas para problemas comunes del sistema
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {problemasComunes.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: 'transparent',
                    border: `1px solid ${getTipoColor(item.tipo)}40`,
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={item.tipo}
                        size="small"
                        sx={{
                          bgcolor: `${getTipoColor(item.tipo)}20`,
                          color: getTipoColor(item.tipo),
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold" color={colors.text} gutterBottom>
                      {item.problema}
                    </Typography>
                    <Typography variant="body2" color={colors.subtext}>
                      {item.solucion}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* Recursos Adicionales */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, textAlign: 'center', p: 3 }}>
            <DownloadIcon sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" color={colors.text} gutterBottom>
              Manual de Usuario
            </Typography>
            <Typography variant="body2" color={colors.subtext} sx={{ mb: 3 }}>
              Descarga la guía completa en PDF con todas las funcionalidades del sistema.
            </Typography>
            <Button variant="contained" sx={{ bgcolor: colors.primary }}>
              Descargar PDF
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, textAlign: 'center', p: 3 }}>
            <PlayIcon sx={{ fontSize: 48, color: colors.secondary, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" color={colors.text} gutterBottom>
              Video Tutoriales
            </Typography>
            <Typography variant="body2" color={colors.subtext} sx={{ mb: 3 }}>
              Aprende paso a paso con nuestros tutoriales en video de cada módulo.
            </Typography>
            <Button variant="contained" sx={{ bgcolor: colors.secondary }}>
              Ver Videos
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, textAlign: 'center', p: 3 }}>
            <BugReportIcon sx={{ fontSize: 48, color: colors.accent, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" color={colors.text} gutterBottom>
              Reportar Problema
            </Typography>
            <Typography variant="body2" color={colors.subtext} sx={{ mb: 3 }}>
              ¿Encontraste un error? Repórtalo y nuestro equipo lo solucionará.
            </Typography>
            <Button variant="contained" sx={{ bgcolor: colors.accent }}>
              Reportar Bug
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Información de Contacto Técnico */}
      <Alert
        severity="info"
        sx={{
          mt: 4,
          bgcolor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          border: `1px solid ${colors.primary}40`,
          '& .MuiAlert-message': { color: colors.text }
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          ¿Necesitas ayuda adicional?
        </Typography>
        <Typography variant="body2">
          Nuestro equipo de soporte técnico está disponible de Lunes a Viernes de 8:00 AM a 6:00 PM.
          <br />
          📧 Email: soporte@odontologiacarol.com | 📞 Teléfono: (555) 123-4567
        </Typography>
      </Alert>
    </Container>
  );
};

export default AyudaAdmin;