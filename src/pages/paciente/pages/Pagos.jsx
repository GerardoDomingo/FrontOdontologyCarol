import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Avatar,
  Alert,
  Badge,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Stack,
  Fade,
  Tooltip,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  AccountBalance,
  MonetizationOn,
  CheckCircle,
  Warning,
  ArrowBack,
  Email,
  Phone,
  CalendarToday,
  MedicalServices,
  AccountCircle,
  FilterList,
  CheckCircleOutline,
  PrintOutlined,
  Refresh,
  PaidOutlined,
  Info,
  Close,
  Receipt,
  TrendingUp,
  Schedule,
  ErrorOutline,
  Payment,
  CreditCard,
  SaveAlt,
  Cancel,
  ConfirmationNumber
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../../../components/Tools/AuthContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

const PacienteFinanzasView = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados principales
  const [activeTab, setActiveTab] = useState(0); // 0: Deudas, 1: Pagados
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Estados para proceso de pago
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Estados de datos
  const [serviciosDeuda, setServiciosDeuda] = useState([]);
  const [serviciosPagados, setServiciosPagados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalDeuda: 0,
    totalPagado: 0,
    serviciosPendientes: 0,
    serviciosCompletados: 0
  });

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: null,
    fechaHasta: null,
    ordenarPor: 'fecha_desc'
  });

  // Estados para notificaciones
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');

  // Estado del formulario de pago
  const [paymentData, setPaymentData] = useState({
    metodo_pago: 'MercadoPago',
    fecha_pago: new Date(),
    email_pagador: user?.email || '',
    referencia: '',
    notas: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Función para mostrar notificaciones
  const showNotif = useCallback((message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  }, []);

  const handleCloseNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  // Cargar datos financieros del paciente
  const fetchDatosFinancieros = useCallback(async () => {
    if (!user?.id) {
      showNotif('Error: No se pudo identificar al paciente', 'error');
      return;
    }

    try {
      setLoading(true);

      const [citasResponse, pagosResponse] = await Promise.all([
        axios.get(`https://back-end-4803.onrender.com/api/citas/paciente/${user.id}`),
        axios.get('https://back-end-4803.onrender.com/api/Finanzas/Pagos/')
      ]);

      const todasCitas = citasResponse.data;
      const todosPagos = pagosResponse.data;

      // Filtrar solo citas completadas con precio
      const citasCompletadas = todasCitas.filter(cita =>
        cita.estado === 'Completada' &&
        cita.precio_servicio &&
        parseFloat(cita.precio_servicio) > 0
      );

      const serviciosConDeuda = [];
      const serviciosConPago = [];
      let totalDeuda = 0;
      let totalPagado = 0;

      citasCompletadas.forEach(cita => {
        const pagoRelacionado = todosPagos.find(pago =>
          pago.cita_id === cita.consulta_id && 
          pago.paciente_id === user.id &&
          ['Pagado', 'Parcial'].includes(pago.estado)
        );

        const precioServicio = parseFloat(cita.precio_servicio) || 0;
        
        const servicioData = {
          id: cita.consulta_id,
          servicio_nombre: cita.servicio_nombre || 'Servicio no especificado',
          categoria_servicio: cita.categoria_servicio || 'General',
          precio_servicio: precioServicio,
          fecha_consulta: cita.fecha_consulta,
          odontologo_nombre: cita.odontologo_nombre || 'No especificado',
          notas: cita.notas || '',
          estado_cita: cita.estado,
          pago: pagoRelacionado || null
        };

        if (pagoRelacionado) {
          serviciosConPago.push(servicioData);
          totalPagado += precioServicio;
        } else {
          serviciosConDeuda.push(servicioData);
          totalDeuda += precioServicio;
        }
      });

      // Ordenar por fecha más reciente primero
      serviciosConDeuda.sort((a, b) => new Date(b.fecha_consulta) - new Date(a.fecha_consulta));
      serviciosConPago.sort((a, b) => {
        if (a.pago && b.pago) {
          return new Date(b.pago.fecha_pago) - new Date(a.pago.fecha_pago);
        }
        return new Date(b.fecha_consulta) - new Date(a.fecha_consulta);
      });

      setServiciosDeuda(serviciosConDeuda);
      setServiciosPagados(serviciosConPago);
      setEstadisticas({
        totalDeuda,
        totalPagado,
        serviciosPendientes: serviciosConDeuda.length,
        serviciosCompletados: serviciosConPago.length
      });

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos financieros:', err);
      showNotif('Error al cargar información financiera', 'error');
      setLoading(false);
    }
  }, [user?.id, showNotif]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDatosFinancieros();
  }, [fetchDatosFinancieros]);

  // Iniciar proceso de pago
  const handleIniciarPago = (servicio) => {
    setSelectedServiceForPayment(servicio);
    setPaymentData(prev => ({
      ...prev,
      email_pagador: user?.email || '',
      referencia: '',
      notas: ''
    }));
    setFormErrors({});
    setShowPaymentForm(true);
  };

  // Ver detalles de un servicio
  const handleVerDetalles = async (servicio) => {
    if (servicio.pago) {
      try {
        setLoading(true);
        const response = await axios.get(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/${servicio.pago.id}`);
        setSelectedDetails({
          servicio,
          pagoCompleto: response.data
        });
        setShowDetails(true);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar detalles del pago:', err);
        showNotif('Error al cargar detalles del pago', 'error');
        setLoading(false);
      }
    } else {
      setSelectedDetails({
        servicio,
        pagoCompleto: null
      });
      setShowDetails(true);
    }
  };

  // Validar formulario de pago
  const validatePaymentForm = () => {
    const errors = {};

    if (!paymentData.email_pagador.trim()) {
      errors.email_pagador = 'Email requerido';
    } else if (!/\S+@\S+\.\S+/.test(paymentData.email_pagador)) {
      errors.email_pagador = 'Email inválido';
    }

    if (!paymentData.referencia.trim()) {
      errors.referencia = 'Referencia/ID de transacción requerida';
    }

    return errors;
  };

  // Procesar pago
  const handleProcesarPago = () => {
    const errors = validatePaymentForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showNotif('Complete todos los campos requeridos', 'warning');
      return;
    }

    setFormErrors({});
    setShowConfirmDialog(true);
  };

  // Confirmar y enviar pago
  const confirmarPago = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      if (!selectedServiceForPayment) {
        throw new Error('No se ha seleccionado un servicio');
      }

      const pagoCompleto = {
        paciente_id: user.id,
        cita_id: selectedServiceForPayment.id,
        monto: selectedServiceForPayment.precio_servicio,
        subtotal: selectedServiceForPayment.precio_servicio,
        total: selectedServiceForPayment.precio_servicio,
        concepto: `Pago por servicio: ${selectedServiceForPayment.servicio_nombre}`,
        metodo_pago: paymentData.metodo_pago,
        fecha_pago: paymentData.fecha_pago,
        estado: 'Pagado',
        comprobante: paymentData.referencia,
        notas: paymentData.notas || `Pago procesado vía ${paymentData.metodo_pago}`
      };

      await axios.post('https://back-end-4803.onrender.com/api/Finanzas/Pagos', pagoCompleto);

      showNotif('¡Pago procesado exitosamente!', 'success');
      setShowPaymentForm(false);
      setShowSuccessDialog(true);

      // Actualizar datos después del pago exitoso
      await fetchDatosFinancieros();

      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 4000);

    } catch (err) {
      console.error('Error al procesar pago:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al procesar el pago. Intente nuevamente.';
      showNotif(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar proceso de pago
  const cancelarPago = () => {
    setShowPaymentForm(false);
    setSelectedServiceForPayment(null);
    setPaymentData({
      metodo_pago: 'MercadoPago',
      fecha_pago: new Date(),
      email_pagador: user?.email || '',
      referencia: '',
      notas: ''
    });
    setFormErrors({});
  };

  // Aplicar filtros
  const aplicarFiltros = (lista) => {
    return lista.filter(servicio => {
      const fecha = servicio.pago ? 
        new Date(servicio.pago.fecha_pago) : 
        new Date(servicio.fecha_consulta);

      if (filtros.fechaDesde && fecha < filtros.fechaDesde) return false;
      if (filtros.fechaHasta && fecha > filtros.fechaHasta) return false;

      return true;
    }).sort((a, b) => {
      const fechaA = a.pago ? 
        new Date(a.pago.fecha_pago) : 
        new Date(a.fecha_consulta);
      const fechaB = b.pago ? 
        new Date(b.pago.fecha_pago) : 
        new Date(b.fecha_consulta);

      switch (filtros.ordenarPor) {
        case 'fecha_desc': return fechaB - fechaA;
        case 'fecha_asc': return fechaA - fechaB;
        case 'monto_desc': return b.precio_servicio - a.precio_servicio;
        case 'monto_asc': return a.precio_servicio - b.precio_servicio;
        default: return fechaB - fechaA;
      }
    });
  };

  // Renderizar filtros
  const renderFiltros = () => (
    <Paper elevation={0} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        cursor: 'pointer'
      }} onClick={() => setShowFilters(!showFilters)}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.875rem' }}>
            Filtros
          </Typography>
          {(filtros.fechaDesde || filtros.fechaHasta) && (
            <Chip label="Activos" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '0.7rem' }} />
          )}
        </Box>
        <Tooltip title="Actualizar datos">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); fetchDatosFinancieros(); }} disabled={loading}>
            <Refresh sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={showFilters}>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '0.875rem' }}>Ordenar por</InputLabel>
                <Select
                  value={filtros.ordenarPor}
                  onChange={(e) => setFiltros(prev => ({ ...prev, ordenarPor: e.target.value }))}
                  label="Ordenar por"
                  sx={{ '& .MuiSelect-select': { fontSize: '0.875rem' } }}
                >
                  <MenuItem value="fecha_desc">Más reciente</MenuItem>
                  <MenuItem value="fecha_asc">Más antiguo</MenuItem>
                  <MenuItem value="monto_desc">Mayor monto</MenuItem>
                  <MenuItem value="monto_asc">Menor monto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => setFiltros({
                  fechaDesde: null,
                  fechaHasta: null,
                  ordenarPor: 'fecha_desc'
                })}
                sx={{ fontSize: '0.75rem' }}
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );

  // Renderizar tarjeta de servicio
  const renderServicioCard = (servicio, tipo = 'deuda') => {
    const fecha = tipo === 'deuda' ? 
      new Date(servicio.fecha_consulta) : 
      new Date(servicio.pago?.fecha_pago || servicio.fecha_consulta);
    const color = tipo === 'deuda' ? 'error' : 'success';

    return (
      <Card
        key={servicio.id}
        elevation={0}
        sx={{
          mb: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 1,
            transform: 'translateY(-1px)'
          }
        }}
        onClick={() => handleVerDetalles(servicio)}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={`${servicio.servicio_nombre} - Click para ver detalles`}>
                  <Avatar
                    sx={{
                      bgcolor: `${color}.main`,
                      mr: 1.5,
                      width: 36,
                      height: 36,
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    {tipo === 'deuda' ? <Schedule /> : <CheckCircle />}
                  </Avatar>
                </Tooltip>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ fontSize: '0.875rem', mb: 0.25 }} noWrap>
                    {servicio.servicio_nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    <Tooltip title={tipo === 'deuda' ? 'Fecha del servicio' : 'Fecha de pago'}>
                      <span>
                        <CalendarToday sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                        {fecha.toLocaleDateString('es-ES')}
                      </span>
                    </Tooltip>
                    {servicio.odontologo_nombre && (
                      <Tooltip title="Doctor que atendió">
                        <span>
                          {' • '}Dr. {servicio.odontologo_nombre}
                        </span>
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color={`${color}.main`} fontWeight="700" sx={{ fontSize: '1rem' }}>
                  ${servicio.precio_servicio.toFixed(2)}
                </Typography>
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                  <Chip
                    label={tipo === 'deuda' ? 'Pendiente' : 'Pagado'}
                    color={color}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  {tipo === 'deuda' && (
                    <Tooltip title="Pagar ahora">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleIniciarPago(servicio); 
                        }}
                        sx={{ 
                          bgcolor: 'primary.50',
                          '&:hover': { bgcolor: 'primary.100' }
                        }}
                      >
                        <Payment sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                {servicio.pago && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                    {servicio.pago.metodo_pago}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Renderizar estadísticas
  const renderEstadisticas = () => (
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      <Grid item xs={6} sm={3}>
        <Tooltip title="Servicios pendientes de pago">
          <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'error.50', borderRadius: 1.5 }}>
            <Typography variant="h6" fontWeight="700" color="error.main" sx={{ fontSize: '1.25rem' }}>
              {estadisticas.serviciosPendientes}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Pendientes
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Tooltip title="Servicios pagados">
          <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.50', borderRadius: 1.5 }}>
            <Typography variant="h6" fontWeight="700" color="success.main" sx={{ fontSize: '1.25rem' }}>
              {estadisticas.serviciosCompletados}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Pagados
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Tooltip title="Total adeudado">
          <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.50', borderRadius: 1.5 }}>
            <Typography variant="h6" fontWeight="700" color="warning.main" sx={{ fontSize: '1.25rem' }}>
              ${estadisticas.totalDeuda.toFixed(0)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Total adeudado
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Tooltip title="Total pagado">
          <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.50', borderRadius: 1.5 }}>
            <Typography variant="h6" fontWeight="700" color="primary.main" sx={{ fontSize: '1.25rem' }}>
              ${estadisticas.totalPagado.toFixed(0)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Total pagado
            </Typography>
          </Paper>
        </Tooltip>
      </Grid>
    </Grid>
  );

  // Renderizar contenido principal
  const renderContenido = () => {
    const serviciosFiltradosDeuda = aplicarFiltros(serviciosDeuda);
    const serviciosFiltradosPagados = aplicarFiltros(serviciosPagados);

    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: 'text.primary', fontSize: '1.5rem' }}>
            Mis Finanzas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Consulte el estado de sus pagos y realice pagos pendientes
          </Typography>
        </Box>

        {/* Estadísticas */}
        {renderEstadisticas()}

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontSize: '0.85rem',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: 44,
                px: 2
              }
            }}
          >
            <Tab
              icon={
                <Badge badgeContent={serviciosFiltradosDeuda.length} color="error" max={99}>
                  <Warning sx={{ fontSize: 18 }} />
                </Badge>
              }
              label={`Servicios Pendientes (${serviciosFiltradosDeuda.length})`}
              iconPosition="start"
            />
            <Tab
              icon={
                <Badge badgeContent={serviciosFiltradosPagados.length} color="success" max={99}>
                  <CheckCircleOutline sx={{ fontSize: 18 }} />
                </Badge>
              }
              label={`Pagos Realizados (${serviciosFiltradosPagados.length})`}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {renderFiltros()}

            {/* Contenido de las tabs */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <Box>
                {activeTab === 0 ? (
                  serviciosFiltradosDeuda.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50', borderRadius: 1.5 }}>
                      <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1.5 }} />
                      <Typography variant="h6" gutterBottom color="success.main" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                        ¡Perfecto!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No tienes servicios pendientes de pago.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          Tienes <strong>{serviciosFiltradosDeuda.length}</strong> servicio(s) pendiente(s) de pago por un total de <strong>${estadisticas.totalDeuda.toFixed(2)}</strong>.
                          Haz click en el botón de pago para procesar tu pago.
                        </Typography>
                      </Alert>
                      <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                        {serviciosFiltradosDeuda.map((servicio) => renderServicioCard(servicio, 'deuda'))}
                      </Box>
                    </Box>
                  )
                ) : (
                  serviciosFiltradosPagados.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1.5 }}>
                      <PaidOutlined sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
                      <Typography variant="h6" gutterBottom color="text.secondary" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                        Sin pagos registrados
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aún no has realizado ningún pago.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          Has realizado <strong>{serviciosFiltradosPagados.length}</strong> pago(s) por un total de <strong>${estadisticas.totalPagado.toFixed(2)}</strong>
                        </Typography>
                      </Alert>
                      <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                        {serviciosFiltradosPagados.map((servicio) => renderServicioCard(servicio, 'pagado'))}
                      </Box>
                    </Box>
                  )
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 2 }}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        {/* Header compacto */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <AccountBalance sx={{ mr: 1.5, fontSize: 28, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="600" color="primary.main" sx={{ fontSize: '1.75rem' }}>
              Estado Financiero
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              Bienvenido, {user?.nombre || 'Paciente'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Contenido principal */}
        <Fade in={true} timeout={300}>
          <Box>
            {renderContenido()}
          </Box>
        </Fade>

        {/* Formulario de Pago */}
        <Dialog
          open={showPaymentForm}
          onClose={cancelarPago}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1, color: 'primary.main' }} />
                Procesar Pago
              </Typography>
              <IconButton onClick={cancelarPago} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedServiceForPayment && (
              <Box>
                {/* Información del servicio */}
                <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'primary.50', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="600">
                    Servicio a Pagar
                  </Typography>
                  <Typography variant="body2">
                    <strong>Servicio:</strong> {selectedServiceForPayment.servicio_nombre}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fecha:</strong> {new Date(selectedServiceForPayment.fecha_consulta).toLocaleDateString('es-ES')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Doctor:</strong> Dr. {selectedServiceForPayment.odontologo_nombre}
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="700" sx={{ mt: 1 }}>
                    Total: ${selectedServiceForPayment.precio_servicio.toFixed(2)}
                  </Typography>
                </Paper>

                {/* Selección de método de pago */}
                <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ mb: 1.5 }}>
                  Método de Pago
                </Typography>

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {[
                    { key: 'MercadoPago', icon: <CreditCard />, color: '#00b0ff' },
                    { key: 'PayPal', icon: <AccountBalance />, color: '#0070ba' }
                  ].map((metodo) => (
                    <Grid item xs={6} key={metodo.key}>
                      <Card
                        variant={paymentData.metodo_pago === metodo.key ? "outlined" : "elevation"}
                        sx={{
                          cursor: 'pointer',
                          borderColor: paymentData.metodo_pago === metodo.key ? metodo.color : 'transparent',
                          borderWidth: paymentData.metodo_pago === metodo.key ? 2 : 1,
                          bgcolor: paymentData.metodo_pago === metodo.key ? `${metodo.color}15` : 'background.paper',
                          '&:hover': { boxShadow: 2 },
                          borderRadius: 1.5
                        }}
                        onClick={() => setPaymentData(prev => ({ ...prev, metodo_pago: metodo.key }))}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                          <Box sx={{ color: metodo.color, mb: 0.5, fontSize: 20 }}>
                            {metodo.icon}
                          </Box>
                          <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                            {metodo.key}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Campos del formulario */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email del Pagador *"
                      type="email"
                      value={paymentData.email_pagador}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, email_pagador: e.target.value }))}
                      error={Boolean(formErrors.email_pagador)}
                      helperText={formErrors.email_pagador}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18 }} /></InputAdornment>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Referencia/ID de Transacción *"
                      value={paymentData.referencia}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, referencia: e.target.value }))}
                      error={Boolean(formErrors.referencia)}
                      helperText={formErrors.referencia}
                      placeholder={paymentData.metodo_pago === 'MercadoPago' ? 'MP-123456789' : 'TXN-ABC123DEF'}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><ConfirmationNumber sx={{ fontSize: 18 }} /></InputAdornment>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                      <DateTimePicker
                        label="Fecha y Hora del Pago"
                        value={paymentData.fecha_pago}
                        onChange={(date) => setPaymentData(prev => ({ ...prev, fecha_pago: date }))}
                        renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Notas (opcional)"
                      value={paymentData.notas}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, notas: e.target.value }))}
                      placeholder="Observaciones adicionales..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={cancelarPago} variant="outlined" startIcon={<Cancel />}>
              Cancelar
            </Button>
            <Button 
              onClick={handleProcesarPago} 
              variant="contained" 
              startIcon={<SaveAlt />}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Procesar Pago'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Confirmación */}
        <Dialog
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="600">Confirmar Pago</Typography>
          </DialogTitle>
          <DialogContent>
            {selectedServiceForPayment && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Está a punto de procesar el pago. Verifique que todos los datos sean correctos.
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1.5 }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="600">
                        Resumen del Pago
                      </Typography>
                      <Typography variant="body2">
                        <strong>Servicio:</strong> {selectedServiceForPayment.servicio_nombre}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Monto:</strong> ${selectedServiceForPayment.precio_servicio.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Método:</strong> {paymentData.metodo_pago}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {paymentData.email_pagador}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Referencia:</strong> {paymentData.referencia}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowConfirmDialog(false)} variant="outlined">
              Revisar
            </Button>
            <Button 
              onClick={confirmarPago} 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
            >
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Éxito */}
        <Dialog
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="600" color="success.main">
              ¡Pago Procesado!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Su pago ha sido registrado exitosamente en el sistema.
            </Typography>
            {selectedServiceForPayment && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1.5 }}>
                <Typography variant="body2">
                  <strong>Servicio:</strong> {selectedServiceForPayment.servicio_nombre}
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="700">
                  Monto: ${selectedServiceForPayment.precio_servicio.toFixed(2)}
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button onClick={() => setShowSuccessDialog(false)} variant="contained">
              Entendido
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de detalles */}
        <Dialog
          open={showDetails}
          onClose={() => setShowDetails(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                <Info sx={{ mr: 1, color: 'primary.main' }} />
                Detalles del Servicio
              </Typography>
              <IconButton onClick={() => setShowDetails(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedDetails && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1.5 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      Información del Servicio
                    </Typography>
                    <Typography variant="body2">
                      <strong>Servicio:</strong> {selectedDetails.servicio.servicio_nombre}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Categoría:</strong> {selectedDetails.servicio.categoria_servicio}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha:</strong> {new Date(selectedDetails.servicio.fecha_consulta).toLocaleDateString('es-ES')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Doctor:</strong> {selectedDetails.servicio.odontologo_nombre}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Monto:</strong> ${selectedDetails.servicio.precio_servicio.toFixed(2)}
                    </Typography>
                    {selectedDetails.servicio.notas && (
                      <Typography variant="body2">
                        <strong>Notas:</strong> {selectedDetails.servicio.notas}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  {selectedDetails.pagoCompleto ? (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1.5 }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="600">
                        Información del Pago
                      </Typography>
                      <Typography variant="body2">
                        <strong>Estado:</strong> {selectedDetails.pagoCompleto.estado}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Método:</strong> {selectedDetails.pagoCompleto.metodo_pago}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fecha de pago:</strong> {new Date(selectedDetails.pagoCompleto.fecha_pago).toLocaleDateString('es-ES')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Monto pagado:</strong> ${parseFloat(selectedDetails.pagoCompleto.total).toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Comprobante:</strong> {selectedDetails.pagoCompleto.comprobante}
                      </Typography>
                      {selectedDetails.pagoCompleto.notas && (
                        <Typography variant="body2">
                          <strong>Notas del pago:</strong> {selectedDetails.pagoCompleto.notas}
                        </Typography>
                      )}
                    </Paper>
                  ) : (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1.5 }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="600">
                        Estado del Pago
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ErrorOutline sx={{ color: 'error.main', mr: 1 }} />
                        <Typography variant="body2" color="error.main" fontWeight="600">
                          Pendiente de pago
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Este servicio aún no ha sido pagado. Puede procesar el pago usando los métodos disponibles.
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Monto a pagar:</strong> ${selectedDetails.servicio.precio_servicio.toFixed(2)}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => {
                          setShowDetails(false);
                          handleIniciarPago(selectedDetails.servicio);
                        }}
                        startIcon={<Payment />}
                      >
                        Pagar Ahora
                      </Button>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowDetails(false)} variant="outlined">
              Cerrar
            </Button>
            {selectedDetails?.pagoCompleto && (
              <Button startIcon={<PrintOutlined />} variant="contained">
                Imprimir Comprobante
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Notificaciones */}
        <Notificaciones
          open={showNotification}
          message={notificationMessage}
          type={notificationType}
          handleClose={handleCloseNotification}
        />
      </Paper>
    </Box>
  );
};

export default PacienteFinanzasView;