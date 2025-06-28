import React, { useState, useMemo, useEffect } from 'react';
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
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Clear as ClearIcon,
  Launch as LaunchIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Lightbulb as TipIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { useNavigate } from 'react-router-dom';

/**
 * Centro de Ayuda Administrativo Inteligente
 * Diseñado específicamente para administradores con contenido dinámico
 */
const AyudaAdmin = () => {
  const { isDarkTheme } = useThemeContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

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

  // Módulos principales con información dinámica
  const modulosAdmin = [
    {
      id: 'pacientes',
      nombre: 'Gestión de Pacientes',
      descripcion: 'Administra toda la base de datos de pacientes',
      icono: <GroupIcon />,
      ruta: '/Administrador/pacientes',
      categoria: 'gestion',
      prioridad: 'alta',
      tiempoUso: '15 min/día',
      beneficios: [
        'Control total de información de pacientes',
        'Historial médico completo',
        'Reportes de actividad',
        'Gestión de contactos'
      ],
      flujoTrabajo: [
        'Registrar nuevo paciente',
        'Actualizar información médica',
        'Generar reportes',
        'Exportar datos'
      ],
      consejos: [
        'Mantén siempre actualizada la información de contacto',
        'Revisa periódicamente los datos médicos importantes',
        'Utiliza los filtros para encontrar pacientes rápidamente'
      ]
    },
    {
      id: 'citas',
      nombre: 'Sistema de Citas',
      descripcion: 'Gestiona todas las citas médicas y agenda',
      icono: <ScheduleIcon />,
      ruta: '/Administrador/citas',
      categoria: 'operacion',
      prioridad: 'critica',
      tiempoUso: '30 min/día',
      beneficios: [
        'Programación eficiente de citas',
        'Control de disponibilidad',
        'Notificaciones automáticas',
        'Gestión de cancelaciones'
      ],
      flujoTrabajo: [
        'Revisar agenda del día',
        'Programar nuevas citas',
        'Confirmar asistencias',
        'Gestionar cambios'
      ],
      consejos: [
        'Revisa la agenda cada mañana',
        'Confirma citas 24h antes',
        'Mantén espacios de emergencia'
      ],
      modulosRelacionados: [
        { nombre: 'Nueva Cita', ruta: '/Administrador/citas/nueva' },
        { nombre: 'Calendario', ruta: '/Administrador/CalendarioCita' }
      ]
    },
    {
      id: 'servicios',
      nombre: 'Catálogo de Servicios',
      descripcion: 'Administra servicios dentales y precios',
      icono: <StarIcon />,
      ruta: '/Administrador/servicios',
      categoria: 'configuracion',
      prioridad: 'media',
      tiempoUso: '10 min/semana',
      beneficios: [
        'Control de precios actualizado',
        'Gestión de servicios activos',
        'Información detallada',
        'Categorización efectiva'
      ],
      flujoTrabajo: [
        'Revisar servicios activos',
        'Actualizar precios',
        'Agregar nuevos servicios',
        'Verificar descripciones'
      ],
      consejos: [
        'Actualiza precios mensualmente',
        'Mantén descripciones claras',
        'Categoriza servicios apropiadamente'
      ]
    },
    {
      id: 'finanzas',
      nombre: 'Control Financiero',
      descripcion: 'Monitorea ingresos, gastos y finanzas',
      icono: <MoneyIcon />,
      ruta: '/Administrador/finanzas',
      categoria: 'finanzas',
      prioridad: 'alta',
      tiempoUso: '20 min/día',
      beneficios: [
        'Control total de ingresos',
        'Seguimiento de gastos',
        'Reportes financieros',
        'Análisis de rentabilidad'
      ],
      flujoTrabajo: [
        'Revisar ingresos diarios',
        'Registrar gastos',
        'Generar reportes mensuales',
        'Analizar tendencias'
      ],
      consejos: [
        'Registra gastos inmediatamente',
        'Revisa reportes semanalmente',
        'Planifica presupuestos mensuales'
      ]
    },
    {
      id: 'estadisticas',
      nombre: 'Dashboard Analítico',
      descripcion: 'Visualiza métricas y estadísticas clave',
      icono: <TrendingIcon />,
      ruta: '/Administrador/Estadisticas',
      categoria: 'analisis',
      prioridad: 'media',
      tiempoUso: '15 min/día',
      beneficios: [
        'Métricas en tiempo real',
        'Gráficas interactivas',
        'Tendencias del negocio',
        'KPIs importantes'
      ],
      flujoTrabajo: [
        'Revisar métricas matutinas',
        'Analizar tendencias',
        'Exportar reportes',
        'Tomar decisiones basadas en datos'
      ],
      consejos: [
        'Revisa las métricas cada mañana',
        'Enfócate en tendencias, no en fluctuaciones diarias',
        'Usa los datos para tomar decisiones'
      ]
    },
    {
      id: 'empleados',
      nombre: 'Gestión de Personal',
      descripcion: 'Administra empleados y roles del equipo',
      icono: <GroupIcon />,
      ruta: '/Administrador/empleados',
      categoria: 'recursos',
      prioridad: 'media',
      tiempoUso: '5 min/día',
      beneficios: [
        'Control de accesos del personal',
        'Gestión de roles',
        'Información de empleados',
        'Reportes de actividad'
      ],
      flujoTrabajo: [
        'Revisar accesos activos',
        'Actualizar información',
        'Gestionar permisos',
        'Monitorear actividad'
      ],
      consejos: [
        'Revisa periódicamente los accesos',
        'Mantén actualizada la información del personal',
        'Asigna roles apropiadamente'
      ]
    }
  ];

  // Tips dinámicos para administradores
  const tipsAdministrador = [
    {
      categoria: 'Productividad',
      tip: 'Revisa el dashboard cada mañana para tener una visión general del día',
      icono: <DashboardIcon sx={{ color: colors.primary }} />
    },
    {
      categoria: 'Finanzas',
      tip: 'Exporta reportes financieros al final de cada mes para análisis',
      icono: <MoneyIcon sx={{ color: colors.success }} />
    },
    {
      categoria: 'Pacientes',
      tip: 'Utiliza los filtros de búsqueda para encontrar pacientes rápidamente',
      icono: <GroupIcon sx={{ color: colors.accent }} />
    },
    {
      categoria: 'Citas',
      tip: 'Mantén siempre espacios de emergencia en la agenda diaria',
      icono: <ScheduleIcon sx={{ color: colors.error }} />
    }
  ];

  // Filtrar módulos según búsqueda y categoría
  const modulosFiltrados = useMemo(() => {
    let modulos = modulosAdmin;
    
    // Filtrar por categoría si hay tab activo
    const categorias = ['todas', 'gestion', 'operacion', 'finanzas', 'analisis'];
    if (activeTab > 0) {
      modulos = modulos.filter(m => m.categoria === categorias[activeTab]);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      modulos = modulos.filter(modulo => 
        modulo.nombre.toLowerCase().includes(termino) ||
        modulo.descripcion.toLowerCase().includes(termino) ||
        modulo.beneficios.some(b => b.toLowerCase().includes(termino)) ||
        modulo.flujoTrabajo.some(f => f.toLowerCase().includes(termino))
      );
    }
    
    return modulos;
  }, [searchTerm, activeTab, modulosAdmin]);

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'critica': return colors.error;
      case 'alta': return colors.warning;
      case 'media': return colors.success;
      default: return colors.subtext;
    }
  };

  const limpiarBusqueda = () => setSearchTerm('');
  const irAModulo = (ruta) => navigate(ruta);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Ejecutivo */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Centro de Control Administrativo
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Gestiona tu clínica dental de manera eficiente y profesional
          </Typography>
          
          {/* Métricas rápidas */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold">14</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Módulos Activos</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold">95%</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Tiempo Activo</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold">24/7</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Disponibilidad</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold">★ 4.9</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Satisfacción</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Panel Principal de Búsqueda */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color={colors.text} gutterBottom>
                Buscar Módulos y Funciones
              </Typography>
              
              <TextField
                fullWidth
                placeholder="¿Qué necesitas gestionar hoy? (ej: citas, pacientes, finanzas...)"
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
                sx={{ mb: 2 }}
              />

              {/* Tabs de categorías */}
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <Tab label="Todas" />
                <Tab label="Gestión" />
                <Tab label="Operación" />
                <Tab label="Finanzas" />
                <Tab label="Análisis" />
              </Tabs>
            </Box>
          </Paper>

          {/* Grid de Módulos */}
          <Grid container spacing={3}>
            {modulosFiltrados.map((modulo) => (
              <Grid item xs={12} md={6} key={modulo.id}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDarkTheme ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.15)',
                      borderColor: colors.primary
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header con prioridad */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: `${colors.primary}20`, color: colors.primary, mr: 2 }}>
                          {modulo.icono}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color={colors.text}>
                            {modulo.nombre}
                          </Typography>
                          <Typography variant="body2" color={colors.subtext}>
                            {modulo.descripcion}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={modulo.prioridad}
                        size="small"
                        sx={{
                          bgcolor: `${getPrioridadColor(modulo.prioridad)}20`,
                          color: getPrioridadColor(modulo.prioridad),
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}
                      />
                    </Box>

                    {/* Métricas de uso */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: colors.primary, mr: 1 }} />
                        <Typography variant="body2" color={colors.text}>
                          Tiempo promedio: <strong>{modulo.tiempoUso}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    {/* Beneficios principales */}
                    <Typography variant="subtitle2" fontWeight="bold" color={colors.text} gutterBottom>
                      Beneficios principales:
                    </Typography>
                    <List dense sx={{ mb: 2 }}>
                      {modulo.beneficios.slice(0, 2).map((beneficio, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.2 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <CheckIcon sx={{ fontSize: 16, color: colors.success }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={beneficio}
                            primaryTypographyProps={{ variant: 'body2', color: colors.text }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {/* Módulos relacionados */}
                    {modulo.modulosRelacionados && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color={colors.subtext} gutterBottom display="block">
                          Módulos relacionados:
                        </Typography>
                        {modulo.modulosRelacionados.map((rel, index) => (
                          <Chip
                            key={index}
                            label={rel.nombre}
                            size="small"
                            sx={{
                              mr: 0.5,
                              bgcolor: `${colors.secondary}20`,
                              color: colors.secondary,
                              fontSize: '0.7rem'
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Botón de acceso */}
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => irAModulo(modulo.ruta)}
                      startIcon={<LaunchIcon />}
                      sx={{
                        bgcolor: colors.primary,
                        mt: 2,
                        fontWeight: 'bold'
                      }}
                    >
                      Acceder al Módulo
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Panel Lateral de Tips y Recomendaciones */}
        <Grid item xs={12} lg={4}>
          {/* Tips del día */}
          <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TipIcon sx={{ color: colors.accent, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold" color={colors.text}>
                  Tips de Gestión
                </Typography>
              </Box>
              
              {tipsAdministrador.map((tip, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: `1px solid ${colors.border}`, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {tip.icono}
                    <Typography variant="subtitle2" fontWeight="bold" color={colors.text} sx={{ ml: 1 }}>
                      {tip.categoria}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color={colors.subtext}>
                    {tip.tip}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Estado del sistema */}
          <Paper sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color={colors.text} gutterBottom>
                Estado del Sistema
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color={colors.text}>Rendimiento</Typography>
                  <Typography variant="body2" color={colors.success}>98%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={98} 
                  sx={{ 
                    bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: colors.success }
                  }} 
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Alert 
                severity="success" 
                sx={{ 
                  bgcolor: `${colors.success}20`,
                  border: `1px solid ${colors.success}40`
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Sistema funcionando correctamente
                </Typography>
                <Typography variant="caption">
                  Todos los módulos están operativos
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AyudaAdmin;