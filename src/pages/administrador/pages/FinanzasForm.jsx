import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  InputAdornment,
  CircularProgress,
  Autocomplete,
  Chip,
  Card,
  CardContent,
  IconButton,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Stack,
  Fade,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Receipt,
  Person,
  Payment,
  SaveAlt,
  Cancel,
  CheckCircle,
  PaymentsTwoTone,
  Search,
  AccountBalance,
  MonetizationOn,
  CreditCard,
  AccountBalanceWallet,
  Warning,
  PersonSearch,
  ArrowBack,
  Email,
  ConfirmationNumber,
  Phone,
  CalendarToday,
  MedicalServices,
  AccountCircle,
  FilterList,
  CheckCircleOutline,
  PrintOutlined,
  Refresh,
  PaidOutlined,
  MoreVert,
  GetApp,
  FileCopy,
  Info,
  Close
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../../../components/Tools/AuthContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalPayment = ({
  amount,
  pacienteId,
  citaId,
  concepto,
  onSuccess,
  onError,
  disabled = false
}) => {
  const initialOptions = {
    "client-id": "AYaRi5dbGmcaSuvEzcQFQVIDPJXZkBwm4jDBS1qtsj_z9cYzSU7lefnBIceXQyKE1NvJJOtOJdZh6_w7",
    currency: "USD",
    intent: "capture",
  };

  const createOrder = async (data, actions) => {
    try {
      const response = await axios.post(
        'https://back-end-4803.onrender.com/api/Finanzas/PayPal/crear-orden',
        {
          paciente_id: pacienteId,
          cita_id: citaId,
          monto: amount,
          concepto: concepto
        }
      );

      return response.data.order_id;
    } catch (error) {
      console.error('Error creando orden PayPal:', error);
      onError(error);
    }
  };

  const onApprove = async (data, actions) => {
    try {
      const response = await axios.post(
        'https://back-end-4803.onrender.com/api/Finanzas/PayPal/capturar-orden',
        {
          orderID: data.orderID
        }
      );

      if (response.data.status === 'COMPLETED') {
        onSuccess(response.data);
      } else {
        onError('Pago no completado');
      }
    } catch (error) {
      console.error('Error capturando pago PayPal:', error);
      onError(error);
    }
  };

  if (disabled) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          PayPal no disponible temporalmente
        </Typography>
      </Box>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => {
          console.error('PayPal Checkout onError', err);
          onError(err);
        }}
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal"
        }}
      />
    </PayPalScriptProvider>
  );
};

const FinanzasForm = ({ idPago = null, onSave, onCancel }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados principales
  const [currentStep, setCurrentStep] = useState('selection');
  const [activeTab, setActiveTab] = useState(1); // 0: Buscar, 1: Deudas, 2: Pagados
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);

  // Estados de datos
  const [pacientes, setPacientes] = useState([]);
  const [pacientesConDeudas, setPacientesConDeudas] = useState([]);
  const [pacientesPagados, setPacientesPagados] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [selectedCita, setSelectedCita] = useState(null);
  const [pacienteCompleto, setPacienteCompleto] = useState(null);

  // Estados para menú contextual
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPago, setSelectedPago] = useState(null);

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    montoMin: '',
    montoMax: '',
    fechaDesde: null,
    fechaHasta: null,
    ordenarPor: 'deuda_desc'
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [formErrors, setFormErrors] = useState({});

  // Estado del formulario de pago
  const [paymentData, setPaymentData] = useState({
    metodo_pago: 'Efectivo',
    fecha_pago: new Date(),
    email_pagador: '',
    referencia: '',
    notas: ''
  });

  // Función para mostrar notificaciones
  const showNotif = useCallback((message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  }, []);

  const handleCloseNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  // Cargar pacientes con deudas
  const fetchPacientesConDeudas = useCallback(async () => {
    try {
      setLoading(true);

      const [citasResponse, pagosResponse] = await Promise.all([
        axios.get('https://back-end-4803.onrender.com/api/citas/all'),
        axios.get('https://back-end-4803.onrender.com/api/Finanzas/Pagos/')
      ]);

      const todasCitas = citasResponse.data;
      const todosPagos = pagosResponse.data;

      // Filtrar citas completadas
      const citasCompletadas = todasCitas.filter(cita =>
        cita.estado === 'Completada' &&
        cita.precio_servicio &&
        parseFloat(cita.precio_servicio) > 0 &&
        cita.paciente_id
      );

      const deudasPorPaciente = {};
      const pagadosPorPaciente = {};

      citasCompletadas.forEach(cita => {
        const pagoRelacionado = todosPagos.find(pago =>
          pago.cita_id === cita.consulta_id && ['Pagado', 'Parcial'].includes(pago.estado)
        );

        const pacienteId = cita.paciente_id;
        const precioServicio = parseFloat(cita.precio_servicio) || 0;

        const datosBasicos = {
          paciente_id: pacienteId,
          nombre: cita.paciente_nombre || '',
          apellido_paterno: cita.paciente_apellido_paterno || '',
          apellido_materno: cita.paciente_apellido_materno || '',
          telefono: cita.paciente_telefono || '',
          correo: cita.paciente_correo || '',
          genero: cita.paciente_genero || '',
          fecha_nacimiento: cita.paciente_fecha_nacimiento || ''
        };

        const citaData = {
          id: cita.consulta_id,
          consulta_id: cita.consulta_id,
          servicio_id: cita.servicio_id,
          servicio_nombre: cita.servicio_nombre || 'Servicio no especificado',
          categoria_servicio: cita.categoria_servicio || 'General',
          precio_servicio: precioServicio,
          fecha_consulta: cita.fecha_consulta,
          odontologo_id: cita.odontologo_id,
          odontologo_nombre: cita.odontologo_nombre || 'No especificado',
          notas: cita.notas || '',
          pago: pagoRelacionado || null
        };

        if (pagoRelacionado) {
          // Paciente con pago
          if (!pagadosPorPaciente[pacienteId]) {
            pagadosPorPaciente[pacienteId] = {
              ...datosBasicos,
              citasPagadas: [],
              totalPagado: 0,
              ultimoPago: null
            };
          }
          pagadosPorPaciente[pacienteId].citasPagadas.push(citaData);
          pagadosPorPaciente[pacienteId].totalPagado += precioServicio;

          const fechaPago = new Date(pagoRelacionado.fecha_pago);
          if (!pagadosPorPaciente[pacienteId].ultimoPago || fechaPago > new Date(pagadosPorPaciente[pacienteId].ultimoPago)) {
            pagadosPorPaciente[pacienteId].ultimoPago = pagoRelacionado.fecha_pago;
          }
        } else {
          // Paciente con deuda
          if (!deudasPorPaciente[pacienteId]) {
            deudasPorPaciente[pacienteId] = {
              ...datosBasicos,
              citasPendientes: [],
              totalDeuda: 0,
              ultimaCita: null
            };
          }
          deudasPorPaciente[pacienteId].citasPendientes.push(citaData);
          deudasPorPaciente[pacienteId].totalDeuda += precioServicio;

          const fechaCita = new Date(cita.fecha_consulta);
          if (!deudasPorPaciente[pacienteId].ultimaCita || fechaCita > new Date(deudasPorPaciente[pacienteId].ultimaCita)) {
            deudasPorPaciente[pacienteId].ultimaCita = cita.fecha_consulta;
          }
        }
      });

      const pacientesConDeudas = Object.values(deudasPorPaciente)
        .filter(p => p.citasPendientes.length > 0)
        .sort((a, b) => b.totalDeuda - a.totalDeuda);

      const pacientesPagados = Object.values(pagadosPorPaciente)
        .filter(p => p.citasPagadas.length > 0)
        .sort((a, b) => new Date(b.ultimoPago) - new Date(a.ultimoPago));

      setPacientesConDeudas(pacientesConDeudas);
      setPacientesPagados(pacientesPagados);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      showNotif('Error al cargar información', 'error');
      setLoading(false);
    }
  }, [showNotif]);

  // Cargar información completa del paciente
  const fetchPacienteCompleto = async (pacienteId) => {
    try {
      const response = await axios.get(`https://back-end-4803.onrender.com/api/reportes/pacientes`);
      const paciente = response.data.find(p => p.id === pacienteId);
      if (paciente) {
        setPacienteCompleto(paciente);
      }
    } catch (err) {
      console.warn('No se pudo cargar información adicional del paciente:', err);
    }
  };

  // Cargar pacientes para búsqueda
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/reportes/pacientes');
        setPacientes(response.data);
        await fetchPacientesConDeudas();
      } catch (err) {
        console.error('Error al cargar pacientes:', err);
        showNotif('Error al cargar pacientes', 'error');
      }
    };
    fetchPacientes();
  }, [fetchPacientesConDeudas, showNotif]);

  // Funciones para manejar menu de pagos completados
  const handleMenuClick = (event, pago, paciente) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPago({ ...pago, paciente });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPago(null);
  };

  // Ver detalles del pago
  const handleVerDetalles = async (pago, paciente) => {
    try {
      setLoading(true);
      // Buscar información completa del pago
      const response = await axios.get(`https://back-end-4803.onrender.com/api/Finanzas/Pagos/${pago.pago.id}`);
      setSelectedPaymentDetails({
        pago: response.data,
        cita: pago,
        paciente: paciente
      });
      setShowPaymentDetails(true);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar detalles del pago:', err);
      showNotif('Error al cargar detalles del pago', 'error');
      setLoading(false);
    }
  };

  // Función para acciones del menú contextual
  const handleMenuAction = (action) => {
    switch (action) {
      case 'print':
        showNotif('Función de impresión en desarrollo', 'info');
        break;
      case 'download':
        showNotif('Función de descarga en desarrollo', 'info');
        break;
      case 'copy':
        if (selectedPago?.pago?.comprobante) {
          navigator.clipboard.writeText(selectedPago.pago.comprobante);
          showNotif('Número de comprobante copiado', 'success');
        } else {
          showNotif('No hay comprobante para copiar', 'warning');
        }
        break;
      default:
        break;
    }
    handleMenuClose();
  };

  // Seleccionar paciente desde lista de deudas
  const handleSelectPacienteConDeuda = async (pacienteData, cita) => {
    setLoading(true);

    try {
      setSelectedPaciente({
        id: pacienteData.paciente_id,
        nombre: pacienteData.nombre,
        aPaterno: pacienteData.apellido_paterno,
        aMaterno: pacienteData.apellido_materno,
        telefono: pacienteData.telefono,
        email: pacienteData.correo,
        genero: pacienteData.genero,
        fecha_nacimiento: pacienteData.fecha_nacimiento
      });

      setSelectedCita(cita);

      setPaymentData(prev => ({
        ...prev,
        email_pagador: pacienteData.correo || ''
      }));

      setCurrentStep('payment');

      try {
        await fetchPacienteCompleto(pacienteData.paciente_id);
      } catch (err) {
        console.warn('Error cargando información completa del paciente:', err);
      }

    } catch (error) {
      console.error('Error al seleccionar paciente:', error);
      showNotif('Error al procesar la selección', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar paciente desde búsqueda
  const handleSelectPacienteBusqueda = async (paciente) => {
    try {
      setLoading(true);

      const response = await axios.get(`https://back-end-4803.onrender.com/api/citas/paciente/${paciente.id}`);
      const citasPendientes = response.data.filter(c =>
        c.estado === 'Completada' &&
        c.precio_servicio &&
        parseFloat(c.precio_servicio) > 0
      );

      if (citasPendientes.length === 0) {
        showNotif('Este paciente no tiene servicios pendientes de pago', 'info');
        setLoading(false);
        return;
      }

      setSelectedPaciente(paciente);
      setPacienteCompleto(paciente);

      if (citasPendientes.length === 1) {
        const cita = citasPendientes[0];
        setSelectedCita({
          ...cita,
          id: cita.consulta_id,
          precio_servicio: parseFloat(cita.precio_servicio) || 0
        });
        setPaymentData(prev => ({
          ...prev,
          email_pagador: paciente.email || ''
        }));
        setCurrentStep('payment');
      } else {
        showNotif('Este paciente tiene múltiples servicios pendientes. Seleccione uno específico desde la lista de deudas.', 'info');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      showNotif('Error al cargar información del paciente', 'error');
      setLoading(false);
    }
  };

  // Calcular totales
  const calcularTotales = () => {
    if (!selectedCita) return { subtotal: 0, total: 0 };

    const precio = selectedCita.precio_servicio || selectedCita.precio || selectedCita.monto || 0;
    const subtotal = parseFloat(precio) || 0;
    const total = subtotal;

    return { subtotal, total };
  };

  // Validar y procesar pago
  const handleProcesarPago = async () => {
    if (!selectedCita) {
      showNotif('Error: No se ha seleccionado ningún servicio', 'error');
      return;
    }

    if (!selectedPaciente) {
      showNotif('Error: No se ha seleccionado ningún paciente', 'error');
      return;
    }

    if (!selectedCita.servicio_nombre) {
      showNotif('Error: Información del servicio incompleta', 'error');
      return;
    }

    const errors = {};

    if (paymentData.metodo_pago === 'MercadoPago' && !paymentData.email_pagador.trim()) {
      errors.email_pagador = 'Email requerido para MercadoPago';
    }

    if (paymentData.metodo_pago === 'PayPal' && !paymentData.email_pagador.trim()) {
      errors.email_pagador = 'Email requerido para PayPal';
    }

    if ((paymentData.metodo_pago === 'MercadoPago' || paymentData.metodo_pago === 'PayPal') && !paymentData.referencia.trim()) {
      errors.referencia = 'Referencia/ID de transacción requerida';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showNotif('Complete todos los campos requeridos', 'warning');
      return;
    }

    setFormErrors({});
    setShowConfirmDialog(true);
  };

  // Procesar pago después de confirmación
  const procesarPagoConfirmado = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      if (!selectedCita || !selectedPaciente) {
        throw new Error('Información incompleta del paciente o servicio');
      }

      const citaId = selectedCita.id;
      if (!citaId) {
        throw new Error('La cita seleccionada no tiene un ID válido');
      }

      const totales = calcularTotales();

      // NUEVO: Manejo específico para MercadoPago
      if (paymentData.metodo_pago === 'MercadoPago') {
        try {
          const mpResponse = await axios.post(
            'https://back-end-4803.onrender.com/api/Finanzas/MercadoPago/crear-preferencia',
            {
              paciente_id: selectedPaciente.id,
              cita_id: citaId,
              monto: totales.total,
              concepto: `Pago por servicio: ${selectedCita.servicio_nombre}`,
              email_paciente: paymentData.email_pagador
            }
          );

          // Abrir MercadoPago en nueva ventana
          const ventanaMP = window.open(mpResponse.data.init_point, '_blank');

          showNotif('Redirigiendo a MercadoPago. Complete el pago en la nueva ventana.', 'info');

          // Simular éxito para efectos de demostración
          // En producción, esto se maneja con webhooks
          setTimeout(() => {
            if (ventanaMP && !ventanaMP.closed) {
              showNotif('Procesando pago en MercadoPago...', 'info');
            }
          }, 3000);

          // Registrar intento de pago
          const pagoMercadoPago = {
            paciente_id: selectedPaciente.id,
            cita_id: citaId,
            monto: totales.total,
            subtotal: totales.subtotal,
            total: totales.total,
            concepto: `Pago por servicio: ${selectedCita.servicio_nombre}`,
            metodo_pago: 'MercadoPago',
            fecha_pago: paymentData.fecha_pago,
            estado: 'Pendiente', // Se actualiza con webhook
            comprobante: mpResponse.data.preference_id,
            notas: `Preferencia MercadoPago: ${mpResponse.data.preference_id}`
          };

          const response = await axios.post('https://back-end-4803.onrender.com/api/Finanzas/Pagos', pagoMercadoPago);

          showNotif('Solicitud de pago MercadoPago creada. Complete el pago en la ventana.', 'success');
          setCurrentStep('success');
          await fetchPacientesConDeudas();

          setTimeout(() => {
            if (onSave) onSave(response.data);
          }, 4000);

          return;

        } catch (mpError) {
          console.error('Error MercadoPago:', mpError);
          showNotif('Error al procesar con MercadoPago: ' + (mpError.response?.data?.error || mpError.message), 'error');
          setLoading(false);
          return;
        }
      }

      // NUEVO: Manejo para PayPal se hace en el componente PayPal directamente
      if (paymentData.metodo_pago === 'PayPal') {
        showNotif('Use los botones de PayPal para completar el pago', 'info');
        setLoading(false);
        return;
      }

      // CÓDIGO ORIGINAL: Para Efectivo y otros métodos
      const pagoCompleto = {
        paciente_id: selectedPaciente.id,
        cita_id: citaId,
        monto: totales.total,
        subtotal: totales.subtotal,
        total: totales.total,
        concepto: `Pago por servicio: ${selectedCita.servicio_nombre}`,
        metodo_pago: paymentData.metodo_pago,
        fecha_pago: paymentData.fecha_pago,
        estado: 'Pagado',
        comprobante: paymentData.referencia || `${paymentData.metodo_pago.substring(0, 3).toUpperCase()}-${Date.now()}`,
        notas: paymentData.notas || `Pago procesado vía ${paymentData.metodo_pago}`
      };

      const response = await axios.post('https://back-end-4803.onrender.com/api/Finanzas/Pagos', pagoCompleto);

      showNotif('¡Pago procesado exitosamente!', 'success');
      setCurrentStep('success');

      // ACTUALIZAR LISTAS DESPUÉS DEL PAGO EXITOSO
      await fetchPacientesConDeudas();

      setTimeout(() => {
        if (onSave) onSave(response.data);
      }, 4000);

    } catch (err) {
      console.error('Error al procesar pago:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al procesar el pago. Intente nuevamente.';
      showNotif(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejar éxito de PayPal 
  const handlePayPalSuccess = async (details) => {
    try {
      setLoading(true);
      showNotif('¡Pago PayPal exitoso! Procesando...', 'success');

      // El pago ya se guardó automáticamente en el backend
      setCurrentStep('success');

      // Actualizar listas
      await fetchPacientesConDeudas();

      setTimeout(() => {
        if (onSave) onSave({ id: details.id, message: 'Pago PayPal completado' });
      }, 4000);

    } catch (error) {
      console.error('Error procesando éxito PayPal:', error);
      showNotif('Error procesando pago PayPal', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejar error de PayPal
  const handlePayPalError = (error) => {
    console.error('Error PayPal:', error);
    showNotif('Error en PayPal: ' + (error.message || 'Error desconocido'), 'error');
    setLoading(false);
  };

  // Cancelar y resetear
  const handleCancelar = () => {
    if (currentStep === 'selection') {
      if (onCancel) onCancel();
    } else {
      setShowCancelDialog(true);
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep('selection');
    setSelectedPaciente(null);
    setSelectedCita(null);
    setPacienteCompleto(null);
    setPaymentData({
      metodo_pago: 'Efectivo',
      fecha_pago: new Date(),
      email_pagador: '',
      referencia: '',
      notas: ''
    });
    setFormErrors({});
    setActiveTab(1);
    setFiltros({
      montoMin: '',
      montoMax: '',
      fechaDesde: null,
      fechaHasta: null,
      ordenarPor: 'deuda_desc'
    });
  };

  // Aplicar filtros
  const aplicarFiltros = (lista, tipo = 'deudas') => {
    return lista.filter(paciente => {
      const monto = tipo === 'deudas' ? paciente.totalDeuda : paciente.totalPagado;
      const fecha = tipo === 'deudas' ? paciente.ultimaCita : paciente.ultimoPago;

      if (filtros.montoMin && monto < parseFloat(filtros.montoMin)) return false;
      if (filtros.montoMax && monto > parseFloat(filtros.montoMax)) return false;

      if (filtros.fechaDesde || filtros.fechaHasta) {
        const fechaReferencia = new Date(fecha);
        if (filtros.fechaDesde && fechaReferencia < filtros.fechaDesde) return false;
        if (filtros.fechaHasta && fechaReferencia > filtros.fechaHasta) return false;
      }

      return true;
    }).sort((a, b) => {
      const montoA = tipo === 'deudas' ? a.totalDeuda : a.totalPagado;
      const montoB = tipo === 'deudas' ? b.totalDeuda : b.totalPagado;
      const fechaA = tipo === 'deudas' ? a.ultimaCita : a.ultimoPago;
      const fechaB = tipo === 'deudas' ? b.ultimaCita : b.ultimoPago;

      switch (filtros.ordenarPor) {
        case 'deuda_asc': return montoA - montoB;
        case 'deuda_desc': return montoB - montoA;
        case 'fecha_desc': return new Date(fechaB) - new Date(fechaA);
        case 'fecha_asc': return new Date(fechaA) - new Date(fechaB);
        case 'nombre': return `${a.nombre} ${a.apellido_paterno}`.localeCompare(`${b.nombre} ${b.apellido_paterno}`);
        default: return montoB - montoA;
      }
    });
  };

  // Renderizar filtros compactos
  const renderFiltrosCompactos = () => (
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
          {(filtros.montoMin || filtros.montoMax || filtros.fechaDesde || filtros.fechaHasta) && (
            <Chip label="Activos" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '0.7rem' }} />
          )}
        </Box>
        <Tooltip title="Actualizar datos">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); fetchPacientesConDeudas(); }} disabled={loading}>
            <Refresh sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={showFilters}>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={6} sm={2}>
              <TextField
                size="small"
                fullWidth
                label="Min $"
                type="number"
                value={filtros.montoMin}
                onChange={(e) => setFiltros(prev => ({ ...prev, montoMin: e.target.value }))}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                size="small"
                fullWidth
                label="Max $"
                type="number"
                value={filtros.montoMax}
                onChange={(e) => setFiltros(prev => ({ ...prev, montoMax: e.target.value }))}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '0.875rem' }}>Ordenar por</InputLabel>
                <Select
                  value={filtros.ordenarPor}
                  onChange={(e) => setFiltros(prev => ({ ...prev, ordenarPor: e.target.value }))}
                  label="Ordenar por"
                  sx={{ '& .MuiSelect-select': { fontSize: '0.875rem' } }}
                >
                  <MenuItem value="deuda_desc">Mayor monto</MenuItem>
                  <MenuItem value="deuda_asc">Menor monto</MenuItem>
                  <MenuItem value="fecha_desc">Más reciente</MenuItem>
                  <MenuItem value="fecha_asc">Más antiguo</MenuItem>
                  <MenuItem value="nombre">Nombre A-Z</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => setFiltros({
                  montoMin: '',
                  montoMax: '',
                  fechaDesde: null,
                  fechaHasta: null,
                  ordenarPor: 'deuda_desc'
                })}
                sx={{ fontSize: '0.75rem' }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );

  // Renderizar tarjeta de paciente compacta
  const renderPacienteCard = (paciente, tipo = 'deudas') => {
    const monto = tipo === 'deudas' ? paciente.totalDeuda : paciente.totalPagado;
    const servicios = tipo === 'deudas' ? paciente.citasPendientes : paciente.citasPagadas;
    const fecha = tipo === 'deudas' ? paciente.ultimaCita : paciente.ultimoPago;
    const color = tipo === 'deudas' ? 'error' : 'success';

    return (
      <Card
        key={paciente.paciente_id}
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
          },
          opacity: loading ? 0.7 : 1,
          pointerEvents: loading ? 'none' : 'auto'
        }}
        onClick={async () => {
          if (tipo === 'deudas') {
            if (servicios.length === 1) {
              await handleSelectPacienteConDeuda(paciente, servicios[0]);
            } else {
              showNotif(`${paciente.nombre} tiene ${servicios.length} servicios pendientes. Seleccione uno específico.`, 'info');
            }
          } else if (tipo === 'pagados') {
            // Mostrar detalles directamente al hacer click
            if (servicios.length > 0) {
              await handleVerDetalles(servicios[0], paciente);
            }
          }
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={`${paciente.nombre} ${paciente.apellido_paterno} - ${tipo === 'deudas' ? 'Click para cobrar' : 'Click para ver detalles'}`}>
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
                    {(paciente.nombre || 'P').charAt(0)}
                  </Avatar>
                </Tooltip>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ fontSize: '0.875rem', mb: 0.25 }} noWrap>
                    {`${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`.trim()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {paciente.telefono && (
                      <Tooltip title="Teléfono">
                        <span>{paciente.telefono}</span>
                      </Tooltip>
                    )}
                    {fecha && (
                      <Tooltip title={tipo === 'deudas' ? 'Última cita' : 'Último pago'}>
                        <span>
                          {paciente.telefono && ' • '}
                          {new Date(fecha).toLocaleDateString('es-ES')}
                        </span>
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', ml: 1 }}>
                  <Typography variant="h6" color={`${color}.main`} fontWeight="700" sx={{ fontSize: '1rem' }}>
                    ${monto.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {servicios.length} servicio(s)
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 }}>
                  {servicios.slice(0, 2).map((servicio, index) => (
                    <Tooltip key={index} title={`${servicio.servicio_nombre} - $${servicio.precio_servicio.toFixed(2)}`}>
                      <Chip
                        label={`${servicio.servicio_nombre.slice(0, 10)}${servicio.servicio_nombre.length > 10 ? '...' : ''} • $${servicio.precio_servicio.toFixed(2)}`}
                        size="small"
                        variant="outlined"
                        color={color}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                        onClick={tipo === 'deudas' ? (e) => {
                          e.stopPropagation();
                          handleSelectPacienteConDeuda(paciente, servicio);
                        } : undefined}
                      />
                    </Tooltip>
                  ))}
                  {servicios.length > 2 && (
                    <Tooltip title={`Ver ${servicios.length - 2} servicios más`}>
                      <Chip
                        label={`+${servicios.length - 2}`}
                        size="small"
                        variant="outlined"
                        color="default"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Tooltip>
                  )}
                </Box>

                {tipo === 'pagados' && (
                  <Tooltip title="Más opciones">
                    <IconButton
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={(e) => handleMenuClick(e, servicios[0], paciente)}
                    >
                      <MoreVert sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Renderizar selección de pacientes
  const renderSeleccionPacientes = () => {
    const pacientesFiltradosDeudas = aplicarFiltros(pacientesConDeudas, 'deudas');
    const pacientesFiltradosPagados = aplicarFiltros(pacientesPagados, 'pagados');

    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* Header compacto */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: 'text.primary', fontSize: '1.5rem' }}>
            Gestión de Pagos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Administre los pagos de servicios completados
          </Typography>
        </Box>

        {/* Tabs compactos */}
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
              icon={<PersonSearch sx={{ fontSize: 18 }} />}
              label="Buscar"
              iconPosition="start"
            />
            <Tab
              icon={
                <Badge badgeContent={pacientesConDeudas.length} color="error" max={99}>
                  <Warning sx={{ fontSize: 18 }} />
                </Badge>
              }
              label={`Deudas (${pacientesFiltradosDeudas.length})`}
              iconPosition="start"
            />
            <Tab
              icon={
                <Badge badgeContent={pacientesPagados.length} color="success" max={99}>
                  <CheckCircleOutline sx={{ fontSize: 18 }} />
                </Badge>
              }
              label={`Pagados (${pacientesFiltradosPagados.length})`}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {activeTab === 0 ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mb: 1.5, fontSize: '1rem' }}>
                  Buscar Paciente
                </Typography>
                <Autocomplete
                  options={pacientes}
                  getOptionLabel={(option) => `${option.nombre} ${option.aPaterno} ${option.aMaterno || ''}`.trim()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Escriba el nombre del paciente"
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Search sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', py: 0.75 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, width: 30, height: 30, fontSize: '0.8rem' }}>
                          {option.nombre.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.875rem' }}>
                            {`${option.nombre} ${option.aPaterno} ${option.aMaterno || ''}`.trim()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {option.telefono && `Tel: ${option.telefono}`}
                            {option.email && ` • ${option.email}`}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  )}
                  onChange={(e, value) => {
                    if (value) handleSelectPacienteBusqueda(value);
                  }}
                  loading={loading}
                />
              </Box>
            ) : (
              <Box>
                {renderFiltrosCompactos()}

                {/* Estadísticas compactas */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Tooltip title="Pacientes con deudas pendientes">
                      <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'error.50', borderRadius: 1.5 }}>
                        <Typography variant="h6" fontWeight="700" color="error.main" sx={{ fontSize: '1.25rem' }}>
                          {pacientesFiltradosDeudas.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Con deudas
                        </Typography>
                      </Paper>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Tooltip title="Pacientes al día con sus pagos">
                      <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.50', borderRadius: 1.5 }}>
                        <Typography variant="h6" fontWeight="700" color="success.main" sx={{ fontSize: '1.25rem' }}>
                          {pacientesFiltradosPagados.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Al día
                        </Typography>
                      </Paper>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Tooltip title={`Total ${activeTab === 1 ? 'adeudado' : 'pagado'}`}>
                      <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.50', borderRadius: 1.5 }}>
                        <Typography variant="h6" fontWeight="700" color="warning.main" sx={{ fontSize: '1.25rem' }}>
                          ${(activeTab === 1 ? pacientesFiltradosDeudas : pacientesFiltradosPagados)
                            .reduce((sum, p) => sum + (activeTab === 1 ? p.totalDeuda : p.totalPagado), 0)
                            .toFixed(0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Total {activeTab === 1 ? 'adeudado' : 'pagado'}
                        </Typography>
                      </Paper>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Tooltip title="Total de servicios">
                      <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.50', borderRadius: 1.5 }}>
                        <Typography variant="h6" fontWeight="700" color="primary.main" sx={{ fontSize: '1.25rem' }}>
                          {(activeTab === 1 ? pacientesFiltradosDeudas : pacientesFiltradosPagados)
                            .reduce((sum, p) => sum + (activeTab === 1 ? p.citasPendientes.length : p.citasPagadas.length), 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Servicios
                        </Typography>
                      </Paper>
                    </Tooltip>
                  </Grid>
                </Grid>

                {/* Lista de pacientes */}
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                  <Box>
                    {activeTab === 1 ? (
                      pacientesFiltradosDeudas.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50', borderRadius: 1.5 }}>
                          <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1.5 }} />
                          <Typography variant="h6" gutterBottom color="success.main" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                            ¡Excelente!
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            No hay pacientes con deudas pendientes.
                          </Typography>
                        </Paper>
                      ) : (
                        <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                          {pacientesFiltradosDeudas.map((paciente) => renderPacienteCard(paciente, 'deudas'))}
                        </Box>
                      )
                    ) : (
                      pacientesFiltradosPagados.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1.5 }}>
                          <PaidOutlined sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
                          <Typography variant="h6" gutterBottom color="text.secondary" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                            Sin pagos registrados
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Aún no hay pacientes con pagos completados.
                          </Typography>
                        </Paper>
                      ) : (
                        <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                          {pacientesFiltradosPagados.map((paciente) => renderPacienteCard(paciente, 'pagados'))}
                        </Box>
                      )
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Menu contextual para pagos - SIMPLIFICADO */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 160 }
          }}
        >
          <MenuItem onClick={() => handleMenuAction('print')}>
            <ListItemIcon><PrintOutlined sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary="Imprimir recibo" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction('download')}>
            <ListItemIcon><GetApp sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary="Descargar PDF" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction('copy')}>
            <ListItemIcon><FileCopy sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary="Copiar comprobante" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  // Renderizar procesamiento de pago (más compacto)
  const renderProcesarPago = () => {
    const totales = calcularTotales();

    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Volver a la lista">
            <IconButton
              onClick={() => setCurrentStep('selection')}
              sx={{ mr: 1.5, bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
              size="small"
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" fontWeight="600" color="primary.main" sx={{ fontSize: '1.5rem' }}>
            Procesar Pago
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Información del Paciente y Servicio */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '1rem' }}>
                    <AccountCircle sx={{ mr: 1, fontSize: 18 }} />
                    Paciente
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, width: 40, height: 40, fontSize: '1rem' }}>
                      {(selectedPaciente?.nombre || 'P').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
                        {`${selectedPaciente?.nombre || ''} ${selectedPaciente?.aPaterno || ''}`.trim()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        ID: {selectedPaciente?.id}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedPaciente?.telefono && (
                    <Typography variant="body2" color="text.secondary" display="block" sx={{ fontSize: '0.85rem' }}>
                      Teléfono: {selectedPaciente.telefono}
                    </Typography>
                  )}
                  {selectedPaciente?.email && (
                    <Typography variant="body2" color="text.secondary" display="block" sx={{ fontSize: '0.85rem' }}>
                      Email: {selectedPaciente.email}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '1rem' }}>
                    <MedicalServices sx={{ mr: 1, fontSize: 18 }} />
                    Servicio
                  </Typography>

                  <Typography variant="subtitle1" fontWeight="600" color="primary.main" sx={{ mb: 1, fontSize: '1rem' }}>
                    {selectedCita?.servicio_nombre || 'Servicio no especificado'}
                  </Typography>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      Fecha: {selectedCita?.fecha_consulta ?
                        new Date(selectedCita.fecha_consulta).toLocaleDateString('es-ES') : 'No disponible'
                      }
                    </Typography>
                    {selectedCita?.odontologo_nombre && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        Doctor: {selectedCita.odontologo_nombre}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" color="primary.main" fontWeight="700" sx={{ fontSize: '2rem' }}>
                      ${(parseFloat(selectedCita?.precio_servicio) || 0).toFixed(2)}
                    </Typography>
                    <Chip label="Completada" color="success" size="small" />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Formulario de Pago */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                <Payment sx={{ mr: 1, fontSize: 18 }} />
                Detalles del Pago
              </Typography>

              {/* Método de Pago */}
              <Typography variant="body2" gutterBottom fontWeight="500" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                Método de Pago
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[
                  { key: 'Efectivo', icon: <AccountBalanceWallet />, color: '#4caf50' },
                  { key: 'MercadoPago', icon: <CreditCard />, color: '#00b0ff' },
                  { key: 'PayPal', icon: <AccountBalance />, color: '#0070ba' }
                ].map((metodo) => (
                  <Grid item xs={4} key={metodo.key}>
                    <Tooltip title={`Pagar con ${metodo.key}`}>
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
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>

              {/* Campos específicos del método de pago */}
              <Grid container spacing={2}>
                {(paymentData.metodo_pago === 'MercadoPago' || paymentData.metodo_pago === 'PayPal') && (
                  <Grid item xs={12} sm={6}>
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
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={
                      paymentData.metodo_pago === 'Efectivo' ?
                        'Número de Recibo (Opcional)' :
                        'Referencia/ID de Transacción *'
                    }
                    value={paymentData.referencia}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, referencia: e.target.value }))}
                    error={Boolean(formErrors.referencia)}
                    helperText={formErrors.referencia}
                    placeholder={
                      paymentData.metodo_pago === 'Efectivo' ? 'REC-001' :
                        paymentData.metodo_pago === 'MercadoPago' ? 'MP-123456789' : 'TXN-ABC123DEF'
                    }
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><ConfirmationNumber sx={{ fontSize: 18 }} /></InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DateTimePicker
                      label="Fecha y Hora del Pago"
                      value={paymentData.fecha_pago}
                      onChange={(date) => setPaymentData(prev => ({ ...prev, fecha_pago: date }))}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Notas (opcional)"
                    value={paymentData.notas}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Observaciones adicionales..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
              </Grid>

              {/* 🆕 Sección especial para PayPal */}
              {paymentData.metodo_pago === 'PayPal' && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Paper elevation={0} sx={{
                    p: 2,
                    bgcolor: 'primary.50',
                    borderRadius: 1.5,
                    border: '2px solid',
                    borderColor: 'primary.main'
                  }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main',
                      mb: 2
                    }}>
                      <AccountBalance sx={{ mr: 1, fontSize: 18 }} />
                      Pagar con PayPal
                    </Typography>

                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Monto:</strong> ${totales.total.toFixed(2)} MXN (≈ ${(totales.total * 0.056).toFixed(2)} USD)
                      </Typography>
                      <Typography variant="caption" display="block">
                        PayPal procesa en dólares estadounidenses
                      </Typography>
                    </Alert>

                    <PayPalPayment
                      amount={totales.total}
                      pacienteId={selectedPaciente.id}
                      citaId={selectedCita.id}
                      concepto={`Pago por servicio: ${selectedCita.servicio_nombre}`}
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                      disabled={loading}
                    />

                    <Typography variant="caption" color="text.secondary" sx={{
                      display: 'block',
                      textAlign: 'center',
                      mt: 1
                    }}>
                      Datos de prueba: sb-24ake43790735@business.example.com
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* 🆕 Instrucciones especiales para MercadoPago */}
              {paymentData.metodo_pago === 'MercadoPago' && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Tarjeta de prueba:</strong> 4509 9535 6623 3704 | <strong>CVV:</strong> 123
                    </Typography>
                    <Typography variant="caption" display="block">
                      Al procesar, se abrirá una nueva ventana con MercadoPago
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {/* Resumen de Totales */}
              <Paper sx={{ mt: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ fontSize: '0.9rem' }}>Resumen del Pago</Typography>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={8}>
                    <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.875rem' }}>Total a Pagar:</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" color="primary.main" fontWeight="700" sx={{ fontSize: '1.75rem' }}>
                      ${totales.total.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* 🆕 Botones de Acción Modificados */}
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 2 }}>
                <Tooltip title="Cancelar proceso">
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleCancelar}
                    startIcon={<Cancel />}
                    disabled={loading}
                    sx={{ minWidth: 120, borderRadius: 1.5, fontSize: '0.875rem' }}
                  >
                    Cancelar
                  </Button>
                </Tooltip>

                {/* Botón condicional según método de pago */}
                {paymentData.metodo_pago === 'PayPal' ? (
                  <Tooltip title="Use los botones de PayPal arriba">
                    <Button
                      variant="contained"
                      size="medium"
                      disabled={true}
                      sx={{
                        minWidth: 140,
                        borderRadius: 1.5,
                        fontSize: '0.875rem',
                        bgcolor: 'grey.400'
                      }}
                    >
                      Use PayPal Arriba
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip title={
                    paymentData.metodo_pago === 'MercadoPago'
                      ? "Crear preferencia y abrir MercadoPago"
                      : "Confirmar y procesar el pago"
                  }>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={handleProcesarPago}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={16} /> : <SaveAlt />}
                      sx={{ minWidth: 140, borderRadius: 1.5, fontSize: '0.875rem' }}
                    >
                      {loading ? 'Procesando...' :
                        paymentData.metodo_pago === 'MercadoPago' ? 'Pagar con MercadoPago' :
                          'Procesar Pago'}
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Renderizar confirmación de éxito (más compacto)
  const renderExito = () => (
    <Box sx={{ textAlign: 'center', maxWidth: 500, mx: 'auto', py: 3 }}>
      <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom fontWeight="600" color="success.main" sx={{ fontSize: '1.75rem' }}>
        ¡Pago Procesado Exitosamente!
      </Typography>

      <Typography variant="body1" gutterBottom color="text.secondary" sx={{ mb: 2.5, fontSize: '1rem' }}>
        El pago ha sido registrado correctamente en el sistema
      </Typography>

      <Paper elevation={0} sx={{ p: 2.5, textAlign: 'left', borderRadius: 1.5, border: '1px solid', borderColor: 'success.200', bgcolor: 'success.50' }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="600" color="success.main" sx={{ fontSize: '1.1rem' }}>
          Resumen de la Transacción
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Paciente:</Typography>
            <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
              {`${selectedPaciente?.nombre || ''} ${selectedPaciente?.aPaterno || ''}`.trim()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Servicio:</Typography>
            <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>{selectedCita?.servicio_nombre}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Método de Pago:</Typography>
            <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>{paymentData.metodo_pago}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Fecha:</Typography>
            <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
              {paymentData.fecha_pago.toLocaleDateString('es-ES')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mt: 1.5, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '2px solid', borderColor: 'success.main' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Monto Total Pagado</Typography>
              <Typography variant="h3" color="success.main" fontWeight="700" sx={{ fontSize: '2rem' }}>
                ${calcularTotales().total.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
        <Tooltip title="Registrar otro pago">
          <Button
            variant="contained"
            size="medium"
            onClick={resetForm}
            startIcon={<Payment />}
            sx={{ borderRadius: 1.5, px: 3, fontSize: '0.875rem' }}
          >
            Otro Pago
          </Button>
        </Tooltip>

        <Tooltip title="Imprimir comprobante">
          <Button
            variant="outlined"
            size="medium"
            startIcon={<PrintOutlined />}
            sx={{ borderRadius: 1.5, px: 3, fontSize: '0.875rem' }}
          >
            Imprimir
          </Button>
        </Tooltip>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 2 }}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        {/* Header compacto */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <PaymentsTwoTone sx={{ mr: 1.5, fontSize: 28, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="600" color="primary.main" sx={{ fontSize: '1.75rem' }}>
              Gestión de Finanzas
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              Sistema integral de pagos
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Contenido según paso actual */}
        <Fade in={true} timeout={300}>
          <Box>
            {currentStep === 'selection' && renderSeleccionPacientes()}
            {currentStep === 'payment' && renderProcesarPago()}
            {currentStep === 'success' && renderExito()}
          </Box>
        </Fade>

        {/* Diálogo de detalles de pago */}
        <Dialog
          open={showPaymentDetails}
          onClose={() => setShowPaymentDetails(false)}
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
                Detalles del Pago
              </Typography>
              <IconButton onClick={() => setShowPaymentDetails(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedPaymentDetails && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1.5 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      Información del Paciente
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {`${selectedPaymentDetails.paciente.nombre} ${selectedPaymentDetails.paciente.apellido_paterno}`.trim()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Teléfono:</strong> {selectedPaymentDetails.paciente.telefono || 'No disponible'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedPaymentDetails.paciente.correo || 'No disponible'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1.5 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      Servicio Pagado
                    </Typography>
                    <Typography variant="body2">
                      <strong>Servicio:</strong> {selectedPaymentDetails.cita.servicio_nombre}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha de servicio:</strong> {new Date(selectedPaymentDetails.cita.fecha_consulta).toLocaleDateString('es-ES')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Doctor:</strong> {selectedPaymentDetails.cita.odontologo_nombre}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1.5 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      Información del Pago
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Monto:</strong> ${parseFloat(selectedPaymentDetails.pago.total).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Método:</strong> {selectedPaymentDetails.pago.metodo_pago}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Fecha:</strong> {new Date(selectedPaymentDetails.pago.fecha_pago).toLocaleDateString('es-ES')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Estado:</strong> {selectedPaymentDetails.pago.estado}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Comprobante:</strong> {selectedPaymentDetails.pago.comprobante}
                        </Typography>
                      </Grid>
                      {selectedPaymentDetails.pago.notas && (
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Notas:</strong> {selectedPaymentDetails.pago.notas}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowPaymentDetails(false)} variant="outlined">
              Cerrar
            </Button>
            <Button startIcon={<PrintOutlined />} variant="contained">
              Imprimir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de cancelación */}
        <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="600">Confirmar Cancelación</Typography>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              ¿Desea cancelar el proceso de pago?
            </Alert>
            <Typography variant="body1">
              Se perderán todos los datos ingresados en el formulario.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowCancelDialog(false)} variant="outlined">
              Continuar con el Pago
            </Button>
            <Button onClick={confirmCancel} color="error" variant="contained">
              Cancelar Proceso
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Confirmación de Pago */}
        <Dialog
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: 'hidden'
            }
          }}
        >
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            p: 2.5,
            textAlign: 'center'
          }}>
            <CheckCircle sx={{ fontSize: 36, mb: 1, opacity: 0.9 }} />
            <Typography variant="h5" fontWeight="600" sx={{ fontSize: '1.5rem' }}>
              Confirmar Pago
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5, fontSize: '0.9rem' }}>
              Revise los detalles antes de procesar
            </Typography>
          </Box>

          <DialogContent sx={{ p: 0 }}>
            {/* Monto destacado */}
            <Box sx={{
              textAlign: 'center',
              py: 2.5,
              bgcolor: 'grey.50',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h2" color="primary.main" fontWeight="700" sx={{ mb: 1, fontSize: '3rem' }}>
                ${calcularTotales().total.toFixed(2)}
              </Typography>
              <Chip
                label={paymentData.metodo_pago}
                color="primary"
                size="large"
                sx={{ fontWeight: 600, fontSize: '0.9rem' }}
              />
            </Box>

            {/* Información detallada compacta */}
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                {/* Paciente */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, width: 32, height: 32 }}>
                        <Person sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
                        Paciente
                      </Typography>
                    </Box>

                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1, fontSize: '1rem' }}>
                      {`${selectedPaciente?.nombre || ''} ${selectedPaciente?.aPaterno || ''}`.trim()}
                    </Typography>

                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ConfirmationNumber sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          ID: {selectedPaciente?.id}
                        </Typography>
                      </Box>

                      {selectedPaciente?.telefono && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {selectedPaciente.telefono}
                          </Typography>
                        </Box>
                      )}

                      {selectedPaciente?.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Email sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {selectedPaciente.email}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Servicio */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'success.main', mr: 1.5, width: 32, height: 32 }}>
                        <MedicalServices sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
                        Servicio
                      </Typography>
                    </Box>

                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1, fontSize: '1rem' }}>
                      {selectedCita?.servicio_nombre}
                    </Typography>

                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {selectedCita?.fecha_consulta ?
                            new Date(selectedCita.fecha_consulta).toLocaleDateString('es-ES') : 'No disponible'
                          }
                        </Typography>
                      </Box>

                      {selectedCita?.odontologo_nombre && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccountCircle sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Dr. {selectedCita.odontologo_nombre}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MonetizationOn sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                          ${(parseFloat(selectedCita?.precio_servicio) || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Detalles del pago */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1.5, border: '1px solid', borderColor: 'primary.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, width: 32, height: 32 }}>
                        <Payment sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
                        Detalles del Pago
                      </Typography>
                    </Box>

                    <Grid container spacing={1.5}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                          Método
                        </Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                          {paymentData.metodo_pago}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                          Fecha
                        </Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                          {paymentData.fecha_pago.toLocaleDateString('es-ES')}
                        </Typography>
                      </Grid>

                      {paymentData.referencia && (
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                            Referencia
                          </Typography>
                          <Typography variant="body2" fontWeight="600" sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.875rem'
                          }}>
                            {paymentData.referencia}
                          </Typography>
                        </Grid>
                      )}

                      {paymentData.email_pagador && (
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                            Email
                          </Typography>
                          <Typography variant="body2" fontWeight="600" sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.875rem'
                          }}>
                            {paymentData.email_pagador}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    {paymentData.notas && (
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                          Notas
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {paymentData.notas}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          {/* Footer */}
          <Box sx={{
            p: 2.5,
            bgcolor: 'grey.50',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Stack direction="row" spacing={1.5} justifyContent="center">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="outlined"
                size="large"
                disabled={loading}
                sx={{
                  minWidth: 140,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                Revisar Datos
              </Button>

              <Button
                onClick={procesarPagoConfirmado}
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                sx={{
                  minWidth: 160,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {loading ? 'Procesando...' : 'Confirmar Pago'}
              </Button>
            </Stack>
          </Box>
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

export default FinanzasForm;