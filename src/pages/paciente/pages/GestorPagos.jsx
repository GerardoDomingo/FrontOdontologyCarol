import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  AlertTitle,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Fade,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  PaymentTwoTone,
  CreditCard,
  AccountBalance,
  AccountBalanceWallet,
  Receipt,
  ErrorOutline,
  CheckCircle,
  Schedule,
  MonetizationOn,
  Close,
  ArrowForward,
  Warning,
  Info,
  Payment,
  CalendarToday,
  Person,
  AttachMoney,
  Security,
  QrCode,
  Phone,
  Email,
  LocalHospital
} from '@mui/icons-material';

const GestorPagos = ({ open, onClose, onPagoRealizado }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados principales
  const [paso, setPaso] = useState(0);
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [citasSeleccionadas, setCitasSeleccionadas] = useState([]);
  const [metodoPago, setMetodoPago] = useState('');
  const [procesamientoPago, setProcesamientoPago] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  // Datos de ejemplo - citas pendientes de pago con precios realistas ($200-$800)
  const citasPendientesEjemplo = [
    {
      id: 1,
      fecha: '2024-12-20T10:00:00Z',
      doctor: 'Dra. María González',
      servicio: 'Limpieza dental profunda',
      estado: 'Completada',
      monto: 350.00,
      vencimiento: '2024-12-27T23:59:59Z',
      prioridad: 'normal'
    },
    {
      id: 2,
      fecha: '2024-12-18T14:30:00Z',
      doctor: 'Dr. Carlos Ruiz',
      servicio: 'Consulta especializada',
      estado: 'Completada',
      monto: 280.00,
      vencimiento: '2024-12-25T23:59:59Z',
      prioridad: 'normal'
    },
    {
      id: 3,
      fecha: '2024-12-15T09:15:00Z',
      doctor: 'Dra. Ana López',
      servicio: 'Radiografías y diagnóstico completo',
      estado: 'Completada',
      monto: 420.00,
      vencimiento: '2024-12-22T23:59:59Z',
      prioridad: 'alta'
    },
    {
      id: 4,
      fecha: '2024-12-10T16:00:00Z',
      doctor: 'Dr. Luis Martín',
      servicio: 'Tratamiento preventivo integral',
      estado: 'Completada',
      monto: 220.00,
      vencimiento: '2025-01-10T23:59:59Z',
      prioridad: 'baja'
    },
    {
      id: 5,
      fecha: '2024-12-08T11:30:00Z',
      doctor: 'Dra. María González',
      servicio: 'Empaste múltiple',
      estado: 'Completada',
      monto: 450.00,
      vencimiento: '2024-12-20T23:59:59Z',
      prioridad: 'alta'
    },
    {
      id: 6,
      fecha: '2024-12-05T15:45:00Z',
      doctor: 'Dr. Carlos Ruiz',
      servicio: 'Endodoncia molar',
      estado: 'Completada',
      monto: 750.00,
      vencimiento: '2024-12-18T23:59:59Z',
      prioridad: 'alta'
    }
  ];

  // Cargar citas pendientes
  useEffect(() => {
    if (open) {
      setCitasPendientes(citasPendientesEjemplo);
      setPaso(0);
      setCitasSeleccionadas([]);
      setMetodoPago('');
      setPagoCompletado(false);
      setErrorPago('');
    }
  }, [open]);

  // Pasos del proceso
  const pasos = ['Seleccionar Citas', 'Método de Pago', 'Confirmar Pago'];

  // Obtener prioridad de la cita
  const getPrioridadConfig = (prioridad) => {
    const configs = {
      alta: { color: '#f44336', bg: '#ffebee', label: 'Urgente' },
      normal: { color: '#ff9800', bg: '#fff3e0', label: 'Normal' },
      baja: { color: '#4caf50', bg: '#e8f5e9', label: 'Sin prisa' }
    };
    return configs[prioridad] || configs.normal;
  };

  // Calcular días hasta vencimiento
  const diasHastaVencimiento = (vencimiento) => {
    const hoy = new Date();
    const fechaVencimiento = new Date(vencimiento);
    const diffTime = fechaVencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Manejar selección de citas
  const toggleCitaSeleccionada = (citaId) => {
    setCitasSeleccionadas(prev => {
      if (prev.includes(citaId)) {
        return prev.filter(id => id !== citaId);
      } else {
        return [...prev, citaId];
      }
    });
  };

  // Calcular total a pagar
  const totalAPagar = citasSeleccionadas.reduce((total, citaId) => {
    const cita = citasPendientes.find(c => c.id === citaId);
    return total + (cita?.monto || 0);
  }, 0);

  // Procesar pago (simulación mejorada)
  const procesarPago = async () => {
    setProcesamientoPago(true);
    setErrorPago('');

    try {
      // Simular procesamiento de pago con diferentes tiempos según método
      const tiempoProcesamiento = metodoPago === 'tarjeta' ? 3500 : 
                                 metodoPago === 'transferencia' ? 2500 : 2000;
      
      // Simular progreso realista
      await new Promise(resolve => setTimeout(resolve, tiempoProcesamiento));
      
      // Simular éxito/error aleatorio (95% de éxito para más realismo)
      const exito = Math.random() > 0.05;
      
      if (exito) {
        setPagoCompletado(true);
        
        // Crear registros de pagos realizados
        const pagosRealizados = citasSeleccionadas.map(citaId => {
          const cita = citasPendientes.find(c => c.id === citaId);
          return {
            id: Date.now() + citaId,
            concepto: cita.servicio,
            monto: cita.monto,
            fecha_pago: new Date().toISOString(),
            metodo_pago: getMetodoLabel(metodoPago),
            estado: 'Pagado',
            comprobante: `TXN-${Date.now()}-${citaId.toString().padStart(3, '0')}`,
            servicio: cita.servicio,
            doctor: cita.doctor
          };
        });
        
        // Notificar al componente padre
        if (onPagoRealizado) {
          onPagoRealizado(pagosRealizados);
        }
        
        console.log('Pago procesado exitosamente:', pagosRealizados);
      } else {
        setErrorPago('Error al procesar el pago. Por favor, verifica tus datos e intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error en procesamiento:', error);
      setErrorPago('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setProcesamientoPago(false);
    }
  };

  // Obtener label del método de pago
  const getMetodoLabel = (metodo) => {
    const labels = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia'
    };
    return labels[metodo] || metodo;
  };

  // Renderizar cita pendiente
  const renderCitaPendiente = (cita) => {
    const isSelected = citasSeleccionadas.includes(cita.id);
    const prioridadConfig = getPrioridadConfig(cita.prioridad);
    const dias = diasHastaVencimiento(cita.vencimiento);
    const isVencida = dias < 0;
    const isProximaVencer = dias <= 3 && dias >= 0;

    return (
      <Card 
        key={cita.id}
        elevation={isSelected ? 3 : 1}
        sx={{
          mb: 2,
          border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#1976d2',
            boxShadow: '0 4px 12px rgba(25,118,210,0.15)'
          },
          transition: 'all 0.3s ease'
        }}
        onClick={() => toggleCitaSeleccionada(cita.id)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Checkbox
              checked={isSelected}
              onChange={() => toggleCitaSeleccionada(cita.id)}
              sx={{ mt: -1 }}
            />
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" fontWeight="600">
                  {cita.servicio}
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="700">
                  ${cita.monto.toFixed(2)}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {cita.doctor} • {new Date(cita.fecha).toLocaleDateString('es-ES')}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip 
                  size="small"
                  label={prioridadConfig.label}
                  sx={{ 
                    bgcolor: prioridadConfig.bg, 
                    color: prioridadConfig.color,
                    fontSize: '0.75rem'
                  }}
                />
                
                {isVencida ? (
                  <Chip 
                    size="small"
                    icon={<ErrorOutline />}
                    label={`Vencida hace ${Math.abs(dias)} días`}
                    sx={{ bgcolor: '#ffebee', color: '#f44336' }}
                  />
                ) : isProximaVencer ? (
                  <Chip 
                    size="small"
                    icon={<Warning />}
                    label={`Vence en ${dias} días`}
                    sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}
                  />
                ) : (
                  <Chip 
                    size="small"
                    label={`Vence en ${dias} días`}
                    sx={{ bgcolor: '#e8f5e9', color: '#4caf50' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Renderizar paso 1: Selección de citas
  const renderPaso1 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selecciona las citas que deseas pagar
      </Typography>
      
      {citasPendientes.length > 0 ? (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Información</AlertTitle>
            Tienes {citasPendientes.length} citas pendientes de pago. Selecciona las que deseas liquidar.
          </Alert>
          
          {citasPendientes.map(cita => renderCitaPendiente(cita))}
          
          {citasSeleccionadas.length > 0 && (
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                mt: 2, 
                bgcolor: 'primary.light', 
                color: 'primary.contrastText',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" fontWeight="700" gutterBottom>
                Total a pagar: ${totalAPagar.toFixed(2)}
              </Typography>
              <Typography variant="body1">
                {citasSeleccionadas.length} cita{citasSeleccionadas.length !== 1 ? 's' : ''} seleccionada{citasSeleccionadas.length !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Ahorra tiempo pagando múltiples servicios de una vez
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <Alert severity="success">
          <AlertTitle>¡Excelente!</AlertTitle>
          No tienes citas pendientes de pago.
        </Alert>
      )}
    </Box>
  );

  // Renderizar paso 2: Método de pago
  const renderPaso2 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selecciona tu método de pago
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          Resumen del pago
        </Typography>
        <Typography variant="h4" color="primary" fontWeight="700">
          ${totalAPagar.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {citasSeleccionadas.length} servicio{citasSeleccionadas.length !== 1 ? 's' : ''} médico{citasSeleccionadas.length !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
          Método de pago
        </FormLabel>
        <RadioGroup
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <Paper elevation={1} sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }}>
            <FormControlLabel
              value="efectivo"
              control={<Radio />}
              sx={{ 
                width: '100%', 
                m: 0, 
                p: 3,
                '&:hover': { bgcolor: 'action.hover' }
              }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
                    <AccountBalanceWallet />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      Efectivo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pago directo en recepción de la clínica
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Paper>

          <Paper elevation={1} sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }}>
            <FormControlLabel
              value="tarjeta"
              control={<Radio />}
              sx={{ 
                width: '100%', 
                m: 0, 
                p: 3,
                '&:hover': { bgcolor: 'action.hover' }
              }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                    <CreditCard />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      Tarjeta de Crédito/Débito
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Visa, MasterCard, American Express • Seguro y rápido
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Paper>

          <Paper elevation={1} sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }}>
            <FormControlLabel
              value="transferencia"
              control={<Radio />}
              sx={{ 
                width: '100%', 
                m: 0, 
                p: 3,
                '&:hover': { bgcolor: 'action.hover' }
              }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48 }}>
                    <AccountBalance />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      Transferencia Bancaria
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transferencia electrónica segura
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Paper>
        </RadioGroup>
      </FormControl>

      {metodoPago === 'tarjeta' && (
        <Fade in={true}>
          <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="600">
              Información de la tarjeta
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Número de tarjeta"
                  placeholder="1234 5678 9012 3456"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="MM/AA"
                  placeholder="12/25"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre en la tarjeta"
                  placeholder="Juan Pérez"
                />
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {metodoPago === 'transferencia' && (
        <Fade in={true}>
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <AlertTitle>Información bancaria</AlertTitle>
            Se te proporcionarán los datos bancarios para realizar la transferencia después de confirmar el pago.
          </Alert>
        </Fade>
      )}

      {metodoPago === 'efectivo' && (
        <Fade in={true}>
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            <AlertTitle>Recordatorio importante</AlertTitle>
            Recuerda llevar el monto exacto de ${totalAPagar.toFixed(2)} al momento de tu próxima visita a la clínica.
          </Alert>
        </Fade>
      )}
    </Box>
  );

  // Renderizar paso 3: Confirmación
  const renderPaso3 = () => (
    <Box>
      {!pagoCompletado ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Confirma tu pago
          </Typography>
          
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight="600">
              Resumen del Pago
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {citasSeleccionadas.map(citaId => {
              const cita = citasPendientes.find(c => c.id === citaId);
              return (
                <Box key={citaId} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                  <Box>
                    <Typography variant="body1" fontWeight="500">{cita.servicio}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cita.doctor} • {new Date(cita.fecha).toLocaleDateString('es-ES')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="600" color="primary">
                    ${cita.monto.toFixed(2)}
                  </Typography>
                </Box>
              );
            })}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="600">Total</Typography>
              <Typography variant="h4" color="primary" fontWeight="700">
                ${totalAPagar.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" fontWeight="500">Método de pago:</Typography>
              <Chip 
                icon={
                  metodoPago === 'efectivo' ? <AccountBalanceWallet /> :
                  metodoPago === 'tarjeta' ? <CreditCard /> :
                  <AccountBalance />
                }
                label={getMetodoLabel(metodoPago)}
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Paper>

          {errorPago && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <AlertTitle>Error en el pago</AlertTitle>
              {errorPago}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <AlertTitle>Términos y condiciones</AlertTitle>
            Al confirmar el pago, aceptas nuestros términos y condiciones de servicio. El pago será procesado de forma segura.
          </Alert>

          {/* Indicador de progreso durante el procesamiento */}
          {procesamientoPago && (
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                mb: 2, 
                textAlign: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 2
              }}
            >
              <CircularProgress 
                size={50} 
                sx={{ color: 'white', mb: 2 }} 
              />
              <Typography variant="h6" gutterBottom fontWeight="600">
                Procesando tu pago...
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {metodoPago === 'tarjeta' && 'Verificando datos de la tarjeta y procesando transacción'}
                {metodoPago === 'transferencia' && 'Generando datos bancarios y confirmando transferencia'}
                {metodoPago === 'efectivo' && 'Registrando pago en efectivo en el sistema'}
              </Typography>
              <LinearProgress 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }} 
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                Por favor, no cierres esta ventana
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Avatar sx={{ bgcolor: 'success.light', width: 100, height: 100, mx: 'auto', mb: 3 }}>
            <CheckCircle sx={{ fontSize: 50 }} />
          </Avatar>
          <Typography variant="h4" gutterBottom fontWeight="600">
            ¡Pago Completado!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Tu pago de ${totalAPagar.toFixed(2)} ha sido procesado exitosamente.
          </Typography>
          
          <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'grey.50', borderRadius: 2, maxWidth: 400, mx: 'auto' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Número de confirmación
            </Typography>
            <Typography variant="h5" fontFamily="monospace" fontWeight="600" color="primary">
              TXN-{Date.now()}
            </Typography>
          </Paper>

          <Alert severity="success" sx={{ mt: 2, borderRadius: 2, maxWidth: 500, mx: 'auto' }}>
            <AlertTitle>Confirmación enviada</AlertTitle>
            Recibirás un comprobante por email y SMS en los próximos minutos.
          </Alert>
        </Box>
      )}
    </Box>
  );

  // Manejar siguiente paso
  const handleSiguiente = () => {
    if (paso === 2 && !pagoCompletado) {
      procesarPago();
    } else {
      setPaso(prev => prev + 1);
    }
  };

  // Manejar paso anterior
  const handleAnterior = () => {
    setPaso(prev => prev - 1);
  };

  // Validar si puede continuar
  const puedeContnuar = () => {
    if (paso === 0) return citasSeleccionadas.length > 0;
    if (paso === 1) return metodoPago !== '';
    return true;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 2 }
      }}
    >
      {isMobile && (
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              Realizar Pago
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <DialogTitle sx={{ display: isMobile ? 'none' : 'block', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <PaymentTwoTone />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="600">
              Realizar Pago
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona tus pagos pendientes de forma segura
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        {!pagoCompletado && (
          <Stepper 
            activeStep={paso} 
            sx={{ mb: 4 }}
            orientation={isMobile ? 'vertical' : 'horizontal'}
          >
            {pasos.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        <Box sx={{ mt: 2 }}>
          {paso === 0 && renderPaso1()}
          {paso === 1 && renderPaso2()}
          {paso === 2 && renderPaso3()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1 }}>
        {!pagoCompletado ? (
          <>
            <Button
              onClick={onClose}
              variant="outlined"
              disabled={procesamientoPago}
              sx={{ textTransform: 'none' }}
            >
              Cancelar
            </Button>
            
            <Box sx={{ flex: 1 }} />
            
            {paso > 0 && (
              <Button
                onClick={handleAnterior}
                variant="outlined"
                disabled={procesamientoPago}
                sx={{ textTransform: 'none' }}
              >
                Anterior
              </Button>
            )}
            
            <Button
              onClick={handleSiguiente}
              variant="contained"
              disabled={!puedeContnuar() || procesamientoPago}
              endIcon={procesamientoPago ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
              sx={{ textTransform: 'none', minWidth: 140 }}
            >
              {procesamientoPago ? 'Procesando...' : 
               paso === 2 ? 'Confirmar Pago' : 'Siguiente'}
            </Button>
          </>
        ) : (
          <Button
            onClick={onClose}
            variant="contained"
            fullWidth
            sx={{ textTransform: 'none', py: 1.5 }}
          >
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GestorPagos;