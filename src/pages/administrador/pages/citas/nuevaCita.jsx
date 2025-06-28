import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Typography, FormHelperText, Box, CircularProgress,
  Divider, Alert, AlertTitle, Step, StepLabel, Stepper, Paper, Chip,
  IconButton, alpha, Radio, RadioGroup, FormControlLabel, Card, CardContent, Container,
  InputAdornment, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  CalendarMonth, Person, EventAvailable, Checklist, Search,
  ArrowBackIosNew, CheckCircle, PersonAdd, Close, Event,
  HealthAndSafety, AccessTime, ArrowForwardIos, ArrowBack,
  MedicalServices,
  CleaningServices, Face, Spa, Bloodtype, MedicalInformation, Apps,
  Category, InfoOutlined, Update, Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import moment from 'moment-timezone';

// Componente principal para crear una nueva cita o tratamiento
const NuevoAgendamiento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkTheme } = useThemeContext();

  // Obtiene la ruta de origen desde el estado o usa una ruta predeterminada
  const previousPath = location.state?.from || "/Administrador/citas";

  // Estados comunes
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  const [isTratamiento, setIsTratamiento] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [filtroServicio, setFiltroServicio] = useState('todos');

  // Estados específicos para citas
  const [selectedDate, setSelectedDate] = useState(null);
  const [workDays, setWorkDays] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [occupiedTimes, setOccupiedTimes] = useState([]);


  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Datos del paciente (comunes)
    paciente_id: '',
    paciente_nombre: '',
    paciente_apellido_paterno: '',
    paciente_apellido_materno: '',
    paciente_genero: '',
    paciente_fecha_nacimiento: null,
    paciente_telefono: '',
    paciente_correo: '',

    // Datos comunes
    servicios_seleccionados: [],
    odontologo_id: '',
    notas: '',

    // Datos específicos de cita
    fecha_consulta: null,
    hora_consulta: null,
    estado: 'Pendiente',

    // Datos específicos de tratamiento
    nombre_tratamiento: '',
    fecha_inicio: null,
    fecha_estimada_fin: null,
    total_citas_programadas: 1,
    costo_total: 0
  });

  // Estados de validación
  const [formErrors, setFormErrors] = useState({
    // Validaciones comunes
    paciente_id: false,
    paciente_nombre: false,
    paciente_apellido_paterno: false,
    paciente_apellido_materno: false,
    paciente_genero: false,
    paciente_fecha_nacimiento: false,
    servicios_seleccionados: false,
    odontologo_id: false,

    // Validaciones de cita
    fecha_consulta: false,
    hora_consulta: false,

    // Validaciones de tratamiento
    nombre_tratamiento: false,
    fecha_inicio: false,
    fecha_estimada_fin: false,
    total_citas_programadas: false
  });

  // Pasos generales unificados para ambos tipos
  const steps = ['Seleccionar Paciente', 'Elegir Servicio', 'Programar Cita', 'Confirmar'];

  // Colores del tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
    step: isDarkTheme ? '#00BCD4' : '#2196f3',
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#E53935',
    info: '#03A9F4',
    purple: '#9C27B0',
  };

  // Cargar datos al iniciar
  useEffect(() => {
    resetForm();
    fetchServicios();
    fetchOdontologos();
    fetchPacientes();
  }, []);

  // Verificar validez del paso actual
  useEffect(() => {
    validateStepAsync();
  }, [activeStep, formData, showNewPatientForm]);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      paciente_id: '',
      paciente_nombre: '',
      paciente_apellido_paterno: '',
      paciente_apellido_materno: '',
      paciente_genero: '',
      paciente_fecha_nacimiento: null,
      paciente_telefono: '',
      paciente_correo: '',
      servicios_seleccionados: [],
      odontologo_id: '',
      fecha_consulta: null,
      hora_consulta: null,
      estado: 'Pendiente',
      notas: '',

      // Campos específicos de tratamiento
      nombre_tratamiento: '',
      fecha_inicio: null,
      fecha_estimada_fin: null,
      total_citas_programadas: 1,
      costo_total: 0
    });

    setFormErrors({
      paciente_id: false,
      paciente_nombre: false,
      paciente_apellido_paterno: false,
      paciente_apellido_materno: false,
      paciente_genero: false,
      paciente_fecha_nacimiento: false,
      servicios_seleccionados: false,
      odontologo_id: false,
      fecha_consulta: false,
      hora_consulta: false,

      // Validaciones de tratamiento
      nombre_tratamiento: false,
      fecha_inicio: false,
      fecha_estimada_fin: false,
      total_citas_programadas: false
    });

    setActiveStep(0);
    setError('');
    setSuccess('');
    setSearchQuery('');
    setSearchResults([]);
    setShowNewPatientForm(false);
    setSelectedDate(null);
    setIsTratamiento(false);
    setIsStepValid(false);
    setNotification({
      open: false,
      message: '',
      type: ''
    });
  };

  // Fetching de servicios
  const fetchServicios = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
      if (!response.ok) throw new Error('Error al cargar servicios');
      const data = await response.json();

      // Debug: Mostrar información de los servicios en consola
      console.log('=== DEPURACIÓN DE SERVICIOS ===');
      console.log('Servicios cargados del backend:', data.length);

      // Mostrar el primer servicio como ejemplo
      if (data.length > 0) {
        console.log('Ejemplo del primer servicio:', data[0]);
        console.log('Campo tratamiento:', data[0].tratamiento, 'Tipo:', typeof data[0].tratamiento);
      }

      // Listar todos los tratamientos
      console.log('Servicios marcados como tratamientos:');
      const tratamientos = data.filter(s => parseInt(s.tratamiento, 10) === 1);
      console.log('Total de tratamientos encontrados:', tratamientos.length);
      tratamientos.forEach(t => {
        console.log(`- ${t.title}: ID=${t.id}, Tratamiento=${t.tratamiento}, Citas=${t.citasEstimadas}`);
      });

      setServicios(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la lista de servicios');
    } finally {
      setLoading(false);
    }
  };

  // Fetching de odontólogos
  const fetchOdontologos = async () => {
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/empleados/odontologos/activos');
      if (!response.ok) throw new Error('Error al cargar odontólogos');
      const data = await response.json();
      setOdontologos(data);

      // Si solo hay un odontólogo, seleccionarlo automáticamente
      if (data.length === 1) {
        const odontologo = data[0];
        setFormData(prev => ({
          ...prev,
          odontologo_id: odontologo.id
        }));

        if (!isTratamiento) {
          fetchDisponibilidad(odontologo.id);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la lista de odontólogos');
    }
  };

  // Obtener días laborables del odontólogo
  useEffect(() => {
    if (!formData.odontologo_id) return;
    setIsLoading(true);

    axios.get(`https://back-end-4803.onrender.com/api/horarios/dias_laborales?odontologo_id=${formData.odontologo_id}`)
      .then((response) => {
        const daysMap = {
          'Domingo': 0,
          'Lunes': 1,
          'Martes': 2,
          'Miércoles': 3,
          'Jueves': 4,
          'Viernes': 5,
          'Sábado': 6
        };
        const availableDays = response.data.map(day => daysMap[day]);
        setWorkDays(availableDays);
      })
      .catch((error) => {
        console.error('Error fetching working days:', error);
        setNotification({
          open: true,
          message: 'Error al obtener los días laborales del odontólogo.',
          type: 'error',
        });
      })
      .finally(() => setIsLoading(false));
  }, [formData.odontologo_id]);

  // Fetch horarios disponibles para una fecha
  const fetchAvailableTimes = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      console.error('Fecha no válida para obtener horarios:', date);
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];
    setIsLoading(true);

    axios.get(`https://back-end-4803.onrender.com/api/horarios/disponibilidad?odontologo_id=${formData.odontologo_id}&fecha=${formattedDate}`)
      .then((response) => {
        console.log('Respuesta de horarios disponibles:', response.data);

        const disponibles = [];
        const ocupados = [];

        // Procesar los datos similar a StepThree
        response.data.forEach((franja) => {
          const horarioId = franja.horario_id;

          if (franja.slots_disponibles) {
            Object.entries(franja.slots_disponibles).forEach(([timeSlot, isAvailable]) => {
              if (isAvailable) {
                disponibles.push(timeSlot); // Solo guardamos el string de la hora
              } else {
                ocupados.push(timeSlot);
              }
            });
          }
        });

        // Ordenar los horarios para mejor presentación
        disponibles.sort();
        ocupados.sort();

        console.log('Horarios disponibles procesados:', disponibles);
        console.log('Horarios ocupados procesados:', ocupados);

        setAvailableTimes(disponibles);
        setOccupiedTimes(ocupados);
      })
      .catch((error) => {
        console.error('Error al obtener horarios disponibles:', error);
        setNotification({
          open: true,
          message: 'Error al obtener los horarios disponibles.',
          type: 'error',
        });
      })
      .finally(() => setIsLoading(false));
  };

  // Handler para selección de fecha
  const handleDateSelection = (date) => {
    // Para todos los casos, usamos esta fecha como fecha inicial o fecha de consulta
    setSelectedDate(date);

    if (isTratamiento) {
      // Para tratamiento, actualizamos la fecha de inicio
      setFormData(prev => ({
        ...prev,
        fecha_inicio: date,
        fecha_consulta: date
      }));

      // Calculamos automáticamente la fecha estimada de fin (un mes por cada cita programada)
      const endDate = new Date(date);
      endDate.setMonth(endDate.getMonth() + (formData.total_citas_programadas - 1));

      setFormData(prev => ({
        ...prev,
        fecha_estimada_fin: endDate
      }));
    } else {
      // Para consulta regular
      setFormData(prev => ({
        ...prev,
        fecha_consulta: date
      }));
    }

    if (formErrors.fecha_consulta) {
      setFormErrors(prev => ({
        ...prev,
        fecha_consulta: false
      }));
    }

    // Fetch available times for the selected date
    if (formData.odontologo_id) {
      fetchAvailableTimes(date);
    }

    // Validar paso después de la selección
    validateStepAsync();
  };

  // Fetching de pacientes
  const fetchPacientes = async () => {
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/pacientes/all');
      if (!response.ok) throw new Error('Error al cargar pacientes');
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la lista de pacientes');
    }
  };

  // Buscar pacientes
  const handleSearchPatient = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Filter patients using the correct field names from your database
      const filteredPacientes = pacientes.filter(paciente =>
        paciente.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.aPaterno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.aMaterno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.telefono?.includes(searchQuery)
      );

      setSearchResults(filteredPacientes);
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      setError('Ocurrió un error al buscar pacientes');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, pacientes]);

  // Buscar al escribir (con debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearchPatient();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearchPatient]);

  // Seleccionar paciente existente
  const handleSelectPatient = (paciente) => {
    let fechaNacimiento = null;
    if (paciente.fechaNacimiento) {
      fechaNacimiento = new Date(paciente.fechaNacimiento);
    } else {
      const currentYear = new Date().getFullYear();
      fechaNacimiento = new Date(currentYear, 0, 1);
    }

    setFormData(prev => ({
      ...prev,
      paciente_id: paciente.id,
      paciente_nombre: paciente.nombre,
      paciente_apellido_paterno: paciente.aPaterno,
      paciente_apellido_materno: paciente.aMaterno || '',
      paciente_genero: paciente.genero || 'No especificado',
      paciente_fecha_nacimiento: fechaNacimiento,
      paciente_telefono: paciente.telefono || '',
      paciente_correo: paciente.email || '',
    }));

    // Clear search and results
    setSearchQuery('');
    setSearchResults([]);
    setShowNewPatientForm(false);
    validateStepAsync();
  };

  // Activar formulario de nuevo paciente
  const handleNewPatient = () => {
    setShowNewPatientForm(true);
    setFormData(prev => ({
      ...prev,
      paciente_id: '',
      paciente_nombre: '',
      paciente_apellido_paterno: '',
      paciente_apellido_materno: '',
      paciente_telefono: '',
      paciente_correo: '',
      paciente_alergias: '',
    }));
    // Limpiar errores relacionados
    setFormErrors(prev => ({
      ...prev,
      paciente_nombre: false,
      paciente_apellido_paterno: false
    }));
    validateStepAsync();
  };

  // Manejar cambios en el formulario de paciente
  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
    validateStepAsync();
  };

  // Manejar selección de servicios
  const handleServiceSelection = (servicio) => {
    // Debugging para verificar la estructura del servicio recibido
    console.log('Servicio seleccionado:', servicio);

    const isAlreadySelected = formData.servicios_seleccionados.length > 0 &&
      formData.servicios_seleccionados[0].servicio_id === servicio.servicio_id;

    // Si ya está seleccionado, deseleccionar
    if (isAlreadySelected) {
      setFormData(prev => ({
        ...prev,
        servicios_seleccionados: [],
        nombre_tratamiento: ''
      }));
      setIsTratamiento(false);
    } else {
      // SOLUCIÓN CORREGIDA: Usar el campo 'tratamiento' de la BD
      // Si el servicio.tratamiento es 1, es un tratamiento, si es 0, no lo es
      const esTratamiento = servicio.tratamiento === 1;

      // Imprimir para depuración - Usar la propiedad tratamiento directamente
      console.log(`Servicio "${servicio.nombre || servicio.title}" - Campo tratamiento:`, servicio.tratamiento);
      console.log(`¿Es tratamiento? (Valor númerico): ${servicio.tratamiento}, Convertido a booleano: ${esTratamiento}`);

      setIsTratamiento(esTratamiento);

      // Obtener la cantidad de citas estimadas - asegurar que sea un número
      const citasEstimadas = parseInt(servicio.citasEstimadas || 1, 10);

      // Si no está seleccionado, seleccionar nuevo
      setFormData(prev => {
        const newData = {
          ...prev,
          servicios_seleccionados: [{
            servicio_id: servicio.servicio_id || servicio.id,
            nombre: servicio.nombre || servicio.title,
            categoria_nombre: servicio.categoria_nombre || servicio.category || 'General',
            precio: servicio.precio || servicio.price || 0,
            es_tratamiento: esTratamiento,
            citas_estimadas: citasEstimadas
          }]
        };

        // Si es tratamiento, actualizar campos específicos
        if (esTratamiento) {
          newData.nombre_tratamiento = servicio.nombre || servicio.title || '';
          newData.total_citas_programadas = citasEstimadas;
          newData.costo_total = parseFloat(servicio.precio || servicio.price || 0) * citasEstimadas;
        }

        return newData;
      });
    }

    // Limpiar error
    if (formErrors.servicios_seleccionados) {
      setFormErrors(prev => ({
        ...prev,
        servicios_seleccionados: false
      }));
    }
    validateStepAsync();
  };

  // Calcular el precio total
  const calcularPrecioTotal = () => {
    if (formData.servicios_seleccionados.length === 0) {
      return '0.00';
    }

    if (isTratamiento) {
      return parseFloat(formData.costo_total || 0).toFixed(2);
    } else {
      return parseFloat(formData.servicios_seleccionados[0].precio || 0).toFixed(2);
    }
  };

  // Manejar selección de odontólogo
  const handleOdontologoChange = (e) => {
    const odontologoId = e.target.value;
    setFormData(prev => ({
      ...prev,
      odontologo_id: odontologoId,
      fecha_consulta: null,
      hora_consulta: null
    }));

    // Resetear selección de fecha
    setSelectedDate(null);
    setAvailableTimes([]);

    // Limpiar error
    if (formErrors.odontologo_id) {
      setFormErrors(prev => ({
        ...prev,
        odontologo_id: false
      }));
    }
    validateStepAsync();
  };

  // Simulación de disponibilidad (legacy)
  const fetchDisponibilidad = (odontologoId) => {
    // Esta función se mantiene para compatibilidad
  };

  // Manejar selección de hora
  const handleHourSelection = (hora) => {
    setFormData(prev => ({
      ...prev,
      hora_consulta: hora
    }));

    if (formErrors.hora_consulta) {
      setFormErrors(prev => ({
        ...prev,
        hora_consulta: false
      }));
    }
    validateStepAsync();
  };

  // Manejar cambios en el número de citas programadas
  const handleCitasProgramadasChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);

    setFormData(prev => {
      // Calcular costo total basado en precio por cita
      const precioPorCita = prev.servicios_seleccionados.length > 0
        ? parseFloat(prev.servicios_seleccionados[0].precio || 0)
        : 0;

      // Calcular nueva fecha estimada fin
      let nuevaFechaFin = null;
      if (prev.fecha_inicio) {
        nuevaFechaFin = new Date(prev.fecha_inicio);
        nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + (value - 1));
      }

      return {
        ...prev,
        total_citas_programadas: value,
        costo_total: precioPorCita * value,
        fecha_estimada_fin: nuevaFechaFin || prev.fecha_estimada_fin
      };
    });
    validateStepAsync();
  };

  // Manejar cambios generales en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Para el resto de campos, asignar directamente
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
    validateStepAsync();
  };

  // Validar el paso actual de forma asíncrona
  const validateStepAsync = () => {
    setTimeout(() => {
      const isValid = validateStep();
      setIsStepValid(isValid);
    }, 0);
  };

  // Validar el paso actual antes de avanzar
  const validateStep = () => {
    switch (activeStep) {
      case 0: // Validar datos del paciente
        if (showNewPatientForm) {
          const errors = {
            paciente_nombre: !formData.paciente_nombre.trim(),
            paciente_apellido_paterno: !formData.paciente_apellido_paterno.trim(),
            paciente_apellido_materno: !formData.paciente_apellido_materno.trim(),
            paciente_genero: !formData.paciente_genero,
            paciente_fecha_nacimiento: !formData.paciente_fecha_nacimiento,
          };
          setFormErrors(prev => ({ ...prev, ...errors }));
          return !Object.values(errors).some(error => error);
        } else {
          if (!formData.paciente_id) {
            setFormErrors(prev => ({ ...prev, paciente_id: true }));
            return false;
          }
          return true;
        }

      case 1: // Validar datos del servicio
        if (formData.servicios_seleccionados.length === 0) {
          setFormErrors(prev => ({ ...prev, servicios_seleccionados: true }));
          return false;
        }
        return true;

      case 2: // Validar fechas
        if (isTratamiento) {
          // Validar programación del tratamiento - INCLUIR HORA
          const citasErrors = {
            odontologo_id: !formData.odontologo_id,
            fecha_consulta: !formData.fecha_consulta,
            hora_consulta: !formData.hora_consulta, // Añadido la verificación de hora
            total_citas_programadas: formData.total_citas_programadas < 1
          };

          setFormErrors(prev => ({ ...prev, ...citasErrors }));
          return !Object.values(citasErrors).some(error => error);
        } else {
          // Validación para cita regular (sin cambios)
          const errors = {
            odontologo_id: !formData.odontologo_id,
            fecha_consulta: !formData.fecha_consulta,
            hora_consulta: !formData.hora_consulta
          };
          setFormErrors(prev => ({ ...prev, ...errors }));
          return !Object.values(errors).some(error => error);
        }

      default:
        return true;
    }
  };

  // Avanzar al siguiente paso
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  // Retroceder al paso anterior
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    if (!date) return 'No seleccionada';
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Preparar datos para envío
  const prepareDataForSubmission = () => {
    // Determinar si es un paciente nuevo
    const esNuevoPaciente = showNewPatientForm;

    // Obtener información del odontólogo seleccionado
    const odontologo = odontologos.find(o => o.id === formData.odontologo_id) || {};

    // Tomar el primer servicio como principal
    const servicioPrincipal = formData.servicios_seleccionados[0] || {};

    // Formatear fecha de nacimiento a YYYY-MM-DD
    let fechaNacimiento = null;
    if (formData.paciente_fecha_nacimiento) {
      fechaNacimiento = moment.utc(formData.paciente_fecha_nacimiento).format("YYYY-MM-DD");
    } else {
      fechaNacimiento = moment().subtract(30, 'years').format("YYYY-MM-DD");
    }

    // Datos comunes del paciente
    const datosComunes = {
      // Datos del paciente
      paciente_id: esNuevoPaciente ? null : formData.paciente_id,
      nombre: formData.paciente_nombre,
      apellido_paterno: formData.paciente_apellido_paterno,
      apellido_materno: formData.paciente_apellido_materno,
      genero: formData.paciente_genero || 'No especificado',
      fecha_nacimiento: fechaNacimiento,
      correo: formData.paciente_correo || '',
      telefono: formData.paciente_telefono || '',

      // Datos del odontólogo
      odontologo_id: formData.odontologo_id,
      odontologo_nombre: odontologo ?
        `${odontologo.nombre || ''} ${odontologo.aPaterno || ''} ${odontologo.aMaterno || ''}`.trim() :
        '',

      // Datos del servicio
      servicio_id: servicioPrincipal.servicio_id,
      servicio_nombre: servicioPrincipal.nombre,
      categoria_servicio: servicioPrincipal.categoria_nombre || 'General',
      precio_servicio: servicioPrincipal.precio || 0,

      // Control
      es_nuevo_paciente: esNuevoPaciente,

      // Notas
      notas: formData.notas || ''
    };

    // Datos específicos según tipo
    if (isTratamiento) {
      // Datos para tratamiento
      return {
        ...datosComunes,
        // Datos específicos de tratamiento
        nombre_tratamiento: formData.nombre_tratamiento,
        fecha_inicio: formData.fecha_inicio ? formData.fecha_inicio.toISOString() : null,
        fecha_estimada_fin: formData.fecha_estimada_fin ? formData.fecha_estimada_fin.toISOString() : null,
        total_citas_programadas: formData.total_citas_programadas,
        costo_total: formData.costo_total,
        estado: formData.estado || 'Pre-Registro'
      };
    } else {
      // Datos para cita regular
      let fechaHora = null;
      if (formData.fecha_consulta && formData.hora_consulta) {
        // Formatear la fecha completa para mantener la zona horaria correcta
        const fecha = moment(formData.fecha_consulta).format('YYYY-MM-DD');
        const hora = formData.hora_consulta;

        // Usar moment para combinar fecha y hora correctamente y obtener un string ISO sin conversiones
        fechaHora = moment.tz(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm', moment.tz.guess()).format('YYYY-MM-DDTHH:mm:00');
      }

      return {
        ...datosComunes,
        // Datos específicos de cita
        fecha_hora: fechaHora?.toISOString(),
        estado: formData.estado || 'Pendiente'
      };
    }
  };

  // Enviar el formulario
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar campos obligatorios
      if (!formData.paciente_nombre || !formData.paciente_apellido_paterno ||
        !formData.fecha_consulta || !formData.hora_consulta ||
        formData.servicios_seleccionados.length === 0 || !formData.odontologo_id) {
        throw new Error('Por favor complete todos los campos obligatorios antes de continuar.');
      }

      // Formatear fecha y hora en el formato ISO correcto
      let fechaHora = null;
      if (formData.fecha_consulta && formData.hora_consulta) {
        // Usar moment-timezone con zona local para construir fecha/hora correctamente  
        const fecha = moment(formData.fecha_consulta).format('YYYY-MM-DD');
        const hora = formData.hora_consulta;

        // Crear un objeto moment directamente con la fecha y hora exactas sin conversión
        // Usamos .utc(false) para asegurar que se mantenga como hora local sin conversión UTC
        fechaHora = moment.tz(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm', moment.tz.guess()).format('YYYY-MM-DDTHH:mm:00');

        console.log("Fecha y hora corregidas:", fecha, hora);
        console.log("Fecha y hora concatenadas:", fechaHora);
      }

      // Obtener información del servicio seleccionado
      const servicioPrincipal = formData.servicios_seleccionados[0] || {};

      // Obtener información del odontólogo
      const odontologo = odontologos.find(o => o.id === formData.odontologo_id) || {};
      const odontologoNombre = odontologo
        ? `${odontologo.nombre || ''} ${odontologo.aPaterno || ''} ${odontologo.aMaterno || ''}`.trim()
        : '';

      // Preparar fecha de nacimiento con formato correcto
      let fechaNacimiento = null;
      if (formData.paciente_fecha_nacimiento) {
        const fechaNacObj = formData.paciente_fecha_nacimiento instanceof Date
          ? formData.paciente_fecha_nacimiento
          : new Date(formData.paciente_fecha_nacimiento);

        // Solo usar si es una fecha válida
        if (!isNaN(fechaNacObj.getTime())) {
          fechaNacimiento = moment(fechaNacObj).format('YYYY-MM-DD');
        } else {
          // Si no es válida, usar la fecha actual menos 30 años
          fechaNacimiento = moment().subtract(30, 'years').format('YYYY-MM-DD');
        }
      } else {
        // Si no hay fecha, usar la fecha actual menos 30 años
        fechaNacimiento = moment().subtract(30, 'years').format('YYYY-MM-DD');
      }

      // Armar el objeto con los datos para el endpoint
      const requestData = {
        // Datos del paciente
        paciente_id: showNewPatientForm ? null : formData.paciente_id, // null si es nuevo paciente
        nombre: formData.paciente_nombre.trim(),
        apellido_paterno: formData.paciente_apellido_paterno.trim(),
        apellido_materno: formData.paciente_apellido_materno.trim(),
        genero: formData.paciente_genero || 'No especificado',
        fecha_nacimiento: fechaNacimiento,
        correo: (formData.paciente_correo || '').trim(),
        telefono: (formData.paciente_telefono || '').trim(),

        // Datos del odontólogo
        odontologo_id: formData.odontologo_id,
        odontologo_nombre: odontologoNombre,

        // Datos del servicio
        servicio_id: servicioPrincipal.servicio_id,
        servicio_nombre: (servicioPrincipal.nombre || '').trim(),
        categoria_servicio: (servicioPrincipal.categoria_nombre || 'General').trim(),
        precio_servicio: parseFloat(servicioPrincipal.precio || 0),

        // Fecha y hora en formato que espera el endpoint
        fecha_hora: fechaHora,

        // Estado y notas adicionales
        estado: 'Pendiente',
        notas: (formData.notas || '').trim()
      };

      // Mostrar datos de depuración
      console.log('Datos enviados para la cita/tratamiento:', requestData);
      console.log('¿Paciente nuevo?:', showNewPatientForm ? 'Sí' : 'No');
      console.log('¿Es tratamiento?:', isTratamiento ? 'Sí' : 'No');
      console.log('Fecha ISO:', fechaHora);

      // Hacer la petición con axios
      const response = await axios.post('https://back-end-4803.onrender.com/api/citas/nueva', requestData);

      // Manejar respuesta exitosa
      if (response.status === 201) {
        // Obtener información del resultado
        const { es_tratamiento, cita_id, tratamiento_id, pre_registro_id } = response.data;

        // Construir mensaje según el tipo de operación
        let mensaje = '';
        if (es_tratamiento) {
          mensaje = showNewPatientForm
            ? '¡Solicitud de tratamiento registrada! Nos pondremos en contacto pronto.'
            : '¡Tratamiento creado con éxito!';
        } else {
          mensaje = showNewPatientForm
            ? '¡Solicitud de cita registrada! Nos pondremos en contacto pronto.'
            : '¡Cita creada con éxito!';
        }

        // Mostrar notificación de éxito
        setNotification({
          open: true,
          message: mensaje,
          type: 'success'
        });

        // Esperar 2 segundos y redirigir
        setTimeout(() => {
          navigate(previousPath);
        }, 2000);
      }
    } catch (error) {
      console.error('Error al crear:', error);

      // Mostrar mensaje de error detallado
      let mensajeError = error.message || 'Error al procesar tu solicitud. Inténtalo de nuevo.';

      // Obtener mensaje de error del servidor si está disponible
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          mensajeError = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          mensajeError = error.response.data;
        }
      }

      setNotification({
        open: true,
        message: `Error: ${mensajeError}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener información del odontólogo seleccionado
  const selectedOdontologo = odontologos.find(o => o.id === formData.odontologo_id);

  // Renderizar paso de selección de paciente
  const renderPatientSelectionStep = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color={colors.primary} sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${isDarkTheme ? '#2D3748' : '#E2E8F0'}`,
          pb: 1
        }}>
          <Person />
          Selección de Paciente
        </Typography>

        {!showNewPatientForm ? (
          <>
            {/* Búsqueda de pacientes existentes */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Buscar paciente (nombre, apellido, correo o teléfono)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                disabled={!!formData.paciente_id} // Deshabilitar si hay un paciente seleccionado
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                  endAdornment: isSearching ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }}
              />

              <Button
                variant="contained"
                color="secondary"
                startIcon={<PersonAdd />}
                onClick={handleNewPatient}
                disabled={!!formData.paciente_id} // Deshabilitar si hay un paciente seleccionado
                sx={{ mt: 2 }}
              >
                Nuevo Paciente
              </Button>
            </Box>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                <Box component="ul" sx={{ p: 0, m: 0, listStyleType: 'none' }}>
                  {searchResults.map((paciente) => (
                    <Box
                      component="li"
                      key={paciente.id}
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { backgroundColor: 'action.hover' },
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => handleSelectPatient(paciente)}
                    >
                      <Box>
                        <Typography variant="body1" component="div" sx={{ fontWeight: 'medium' }}>
                          {paciente.nombre} {paciente.aPaterno} {paciente.aMaterno || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {paciente.email || 'Sin correo'} • {paciente.telefono || 'Sin teléfono'}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" sx={{ minWidth: 0 }}>
                        Seleccionar
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Mensaje cuando no hay resultados */}
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No se encontraron pacientes con esos datos. Puedes crear un nuevo paciente.
              </Alert>
            )}

            {/* Paciente seleccionado */}
            {formData.paciente_id && (
              <Paper
                elevation={3}
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: alpha(colors.primary, 0.1),
                  border: `1px solid ${alpha(colors.primary, 0.3)}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">
                      {formData.paciente_nombre} {formData.paciente_apellido_paterno} {formData.paciente_apellido_materno}
                    </Typography>

                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Correo:</strong> {formData.paciente_correo || 'No especificado'}
                    </Typography>

                    <Typography variant="body1">
                      <strong>Teléfono:</strong> {formData.paciente_telefono || 'No especificado'}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Close />}
                    onClick={() => {
                      // Limpiar la selección del paciente
                      setFormData(prev => ({
                        ...prev,
                        paciente_id: '',
                        paciente_nombre: '',
                        paciente_apellido_paterno: '',
                        paciente_apellido_materno: '',
                        paciente_genero: '',
                        paciente_fecha_nacimiento: null,
                        paciente_telefono: '',
                        paciente_correo: '',
                        paciente_alergias: '',
                      }));
                      setSearchQuery('');
                      setSearchResults([]);
                      validateStepAsync();
                    }}
                  >
                    Cancelar Selección
                  </Button>
                </Box>
              </Paper>
            )}
          </>
        ) : (
          <>
            {/* Formulario de nuevo paciente */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Datos del Nuevo Paciente</Typography>
                <IconButton
                  onClick={() => {
                    setShowNewPatientForm(false);
                    setFormErrors(prev => ({
                      ...prev,
                      paciente_nombre: false,
                      paciente_apellido_paterno: false,
                      paciente_genero: false,
                      paciente_fecha_nacimiento: false,
                    }));
                    validateStepAsync();
                  }}
                  color="default"
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="paciente_nombre"
                    label="Nombre *"
                    fullWidth
                    value={formData.paciente_nombre}
                    onChange={handlePatientFormChange}
                    error={formErrors.paciente_nombre}
                    helperText={formErrors.paciente_nombre ? "El nombre es obligatorio" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="paciente_apellido_paterno"
                    label="Apellido Paterno *"
                    fullWidth
                    value={formData.paciente_apellido_paterno}
                    onChange={handlePatientFormChange}
                    error={formErrors.paciente_apellido_paterno}
                    helperText={formErrors.paciente_apellido_paterno ? "El apellido paterno es obligatorio" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="paciente_apellido_materno"
                    label="Apellido Materno *"
                    fullWidth
                    value={formData.paciente_apellido_materno}
                    onChange={handlePatientFormChange}
                    error={formErrors.paciente_apellido_materno}
                    helperText={formErrors.paciente_apellido_materno ? "El apellido materno es obligatorio" : ""}
                  />
                </Grid>

                {/* Género */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formErrors.paciente_genero}>
                    <InputLabel id="genero-select-label">Género *</InputLabel>
                    <Select
                      labelId="genero-select-label"
                      id="genero-select"
                      name="paciente_genero"
                      value={formData.paciente_genero || ''}
                      onChange={handlePatientFormChange}
                      label="Género *"
                    >
                      <MenuItem value="Masculino">Masculino</MenuItem>
                      <MenuItem value="Femenino">Femenino</MenuItem>
                      <MenuItem value="Otro">Otro</MenuItem>
                      <MenuItem value="No especificado">Prefiero no decirlo</MenuItem>
                    </Select>
                    {formErrors.paciente_genero && (
                      <FormHelperText>Por favor seleccione un género</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Fecha de nacimiento */}
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha de Nacimiento *"
                      value={formData.paciente_fecha_nacimiento}
                      onChange={(date) => {
                        // Si es un paciente nuevo, usamos el 1 de enero del año seleccionado
                        if (showNewPatientForm && date) {
                          const year = date.getFullYear();
                          const simplifiedDate = new Date(year, 0, 1); // 1 de enero del año seleccionado

                          setFormData(prev => ({
                            ...prev,
                            paciente_fecha_nacimiento: simplifiedDate
                          }));
                        } else {
                          // Si es un paciente existente, usamos la fecha completa
                          setFormData(prev => ({
                            ...prev,
                            paciente_fecha_nacimiento: date
                          }));
                        }

                        if (formErrors.paciente_fecha_nacimiento) {
                          setFormErrors(prev => ({
                            ...prev,
                            paciente_fecha_nacimiento: false
                          }));
                        }
                        validateStepAsync();
                      }}
                      // Para pacientes nuevos, mostrar solo selección de año
                      views={showNewPatientForm ? ['year'] : ['year', 'month', 'day']}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: formErrors.paciente_fecha_nacimiento,
                          helperText: formErrors.paciente_fecha_nacimiento
                            ? "La fecha de nacimiento es obligatoria"
                            : showNewPatientForm
                              ? "Solo seleccione el año de nacimiento"
                              : ""
                        }
                      }}
                      disableFuture
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="paciente_telefono"
                    label="Teléfono"
                    fullWidth
                    value={formData.paciente_telefono}
                    onChange={handlePatientFormChange}
                    placeholder="(Opcional)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="paciente_correo"
                    label="Correo electrónico"
                    fullWidth
                    value={formData.paciente_correo}
                    onChange={handlePatientFormChange}
                    placeholder="(Opcional)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="notas"
                    label="Notas del paciente"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.notas}
                    onChange={handlePatientFormChange}
                    placeholder="(Opcional) Indique cualquier información adicional relevante para el paciente"
                  />
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Box>
    );
  };


  // Función renderServiceSelectionStep ajustada con categorías coloreadas
  const renderServiceSelectionStep = () => {
    // Asignar colores por categoría
    const getCategoriaColor = (categoria) => {
      // Lista de colores disponibles
      const coloresDisponibles = [
        colors.primary,
        colors.info,
        colors.purple,
        colors.error,
        colors.success,
        colors.warning
      ];

      // Generamos un índice basado en la primera letra de la categoría (simple pero dinámico)
      const primeraLetra = (categoria || 'General').charAt(0).toUpperCase();
      const indice = primeraLetra.charCodeAt(0) % coloresDisponibles.length;

      // Devolvemos el color correspondiente
      return coloresDisponibles[indice];
    };

    // Usamos un solo icono genérico para todas las categorías
    const getCategoriaIcon = () => {
      return <Category />;
    };

    return (
      <Box sx={{ p: 2 }}>
        {/* Encabezado con título y filtros */}
        <Box sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          borderBottom: `1px solid ${isDarkTheme ? '#2D3748' : '#E2E8F0'}`,
          pb: 2
        }}>
          <Typography variant="h5" color={colors.primary} sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600
          }}>
            <EventAvailable fontSize="large" />
            Seleccione un Servicio
          </Typography>

          {/* Filtros rápidos */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<Apps />}
              label="Todos"
              color={filtroServicio === 'todos' ? 'primary' : 'default'}
              variant={filtroServicio === 'todos' ? 'filled' : 'outlined'}
              onClick={() => setFiltroServicio('todos')}
              sx={{ fontWeight: 500 }}
            />
            <Chip
              icon={<MedicalServices fontSize="small" />}
              label="Tratamientos"
              color={filtroServicio === 'tratamientos' ? 'primary' : 'default'}
              variant={filtroServicio === 'tratamientos' ? 'filled' : 'outlined'}
              onClick={() => setFiltroServicio('tratamientos')}
              sx={{ fontWeight: 500 }}
            />
            <Chip
              icon={<EventAvailable fontSize="small" />}
              label="Consultas"
              color={filtroServicio === 'consultas' ? 'info' : 'default'}
              variant={filtroServicio === 'consultas' ? 'filled' : 'outlined'}
              onClick={() => setFiltroServicio('consultas')}
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>

        {formErrors.servicios_seleccionados && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '10px'
            }}
          >
            <AlertTitle>Selección requerida</AlertTitle>
            Por favor seleccione un servicio para continuar
          </Alert>
        )}

        {/* Panel principal */}
        <Grid container spacing={3}>
          {/* Lista de servicios - diseño simplificado */}
          <Grid item xs={12} md={formData.servicios_seleccionados.length > 0 ? 7 : 12}>
            {servicios.length === 0 ? (
              <Box sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: '12px',
                bgcolor: alpha(colors.primary, 0.05),
                border: `1px dashed ${alpha(colors.primary, 0.3)}`
              }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Cargando servicios disponibles...
                </Typography>
              </Box>
            ) : (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                {/* Tabla de servicios con diseño profesional */}
                <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          width="40%"
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: alpha(colors.primary, 0.05),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          Servicio
                        </TableCell>
                        <TableCell
                          width="20%"
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: alpha(colors.primary, 0.05),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          Categoría
                        </TableCell>
                        <TableCell
                          width="25%"
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: alpha(colors.primary, 0.05),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          Precio
                        </TableCell>
                        <TableCell
                          width="15%"
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: alpha(colors.primary, 0.05),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          Seleccionar
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {servicios
                        .filter(servicio => {
                          // Filtrar según selección
                          if (filtroServicio === 'todos') return true;
                          if (filtroServicio === 'tratamientos') return parseInt(servicio.tratamiento, 10) === 1;
                          if (filtroServicio === 'consultas') return parseInt(servicio.tratamiento, 10) !== 1;
                          return true;
                        })
                        .map(servicio => {
                          const esTratamiento = parseInt(servicio.tratamiento, 10) === 1;
                          const isSelected = formData.servicios_seleccionados.length > 0 &&
                            formData.servicios_seleccionados[0].servicio_id === servicio.id;
                          const categoriaColor = getCategoriaColor(servicio.category);

                          return (
                            <TableRow
                              key={servicio.id}
                              hover
                              onClick={() => handleServiceSelection({
                                servicio_id: servicio.id,
                                nombre: servicio.title,
                                categoria_nombre: servicio.category,
                                precio: servicio.price,
                                tratamiento: servicio.tratamiento,
                                citasEstimadas: servicio.citasEstimadas || 1
                              })}
                              sx={{
                                cursor: 'pointer',
                                bgcolor: isSelected ? alpha(esTratamiento ? colors.primary : colors.info, 0.1) : 'transparent',
                                '&:hover': {
                                  bgcolor: isSelected ? alpha(esTratamiento ? colors.primary : colors.info, 0.15) : alpha(colors.primary, 0.05)
                                }
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{
                                    mr: 2,
                                    bgcolor: alpha(esTratamiento ? colors.primary : colors.info, 0.1),
                                    borderRadius: '50%',
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {esTratamiento ?
                                      <MedicalServices sx={{ color: colors.primary }} /> :
                                      <EventAvailable sx={{ color: colors.info }} />
                                    }
                                  </Box>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight={isSelected ? 'bold' : 'medium'}>
                                      {servicio.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      maxWidth: '400px'
                                    }}>
                                      {servicio.description || 'Sin descripción'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={servicio.category || 'General'}
                                  size="small"
                                  color="default"
                                  sx={{
                                    bgcolor: alpha(categoriaColor, 0.1),
                                    color: categoriaColor,
                                    borderColor: alpha(categoriaColor, 0.3),
                                    fontWeight: 500
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="subtitle1" fontWeight="bold" color={esTratamiento ? 'primary' : 'info'}>
                                  ${parseFloat(servicio.price).toFixed(2)}
                                </Typography>
                                {esTratamiento && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    <Event fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                    {servicio.citasEstimadas || 1} citas estimadas
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Radio
                                  checked={isSelected}
                                  color={esTratamiento ? 'primary' : 'info'}
                                  size="medium"
                                  sx={{
                                    '& .MuiSvgIcon-root': {
                                      fontSize: 22,
                                    }
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Si no hay resultados después de filtrar */}
                {servicios.filter(servicio => {
                  if (filtroServicio === 'todos') return true;
                  if (filtroServicio === 'tratamientos') return parseInt(servicio.tratamiento, 10) === 1;
                  if (filtroServicio === 'consultas') return parseInt(servicio.tratamiento, 10) !== 1;
                  return true;
                }).length === 0 && (
                    <Box sx={{
                      p: 4,
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        No se encontraron servicios para el filtro seleccionado
                      </Typography>
                    </Box>
                  )}
              </Paper>
            )}
          </Grid>

          {/* Panel de detalles del servicio seleccionado */}
          {formData.servicios_seleccionados.length > 0 && (
            <Grid item xs={12} md={5}>
              <Paper elevation={3} sx={{
                p: 0,
                position: 'sticky',
                top: 24,
                overflow: 'hidden',
                borderRadius: '12px',
                height: '100%',
                border: `1px solid ${alpha(formData.servicios_seleccionados[0].es_tratamiento ? colors.primary : colors.info, 0.3)}`
              }}>
                {/* Header */}
                <Box sx={{
                  bgcolor: formData.servicios_seleccionados[0].es_tratamiento ? colors.primary : colors.info,
                  color: 'white',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {formData.servicios_seleccionados[0].es_tratamiento ? (
                      <MedicalServices sx={{ mr: 1.5, fontSize: '1.5rem' }} />
                    ) : (
                      <EventAvailable sx={{ mr: 1.5, fontSize: '1.5rem' }} />
                    )}
                    <Typography variant="h6" fontWeight="bold">
                      {formData.servicios_seleccionados[0].es_tratamiento ? 'Tratamiento Dental' : 'Consulta Dental'}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        servicios_seleccionados: [],
                        nombre_tratamiento: ''
                      }));
                      setIsTratamiento(false);
                    }}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>

                {/* Detalles del servicio */}
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    {formData.servicios_seleccionados[0].nombre}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={getCategoriaIcon(formData.servicios_seleccionados[0].categoria_nombre)}
                      label={formData.servicios_seleccionados[0].categoria_nombre}
                      variant="outlined"
                      size="medium"
                      sx={{
                        borderColor: alpha(getCategoriaColor(formData.servicios_seleccionados[0].categoria_nombre), 0.5),
                        color: getCategoriaColor(formData.servicios_seleccionados[0].categoria_nombre)
                      }}
                    />
                  </Box>

                  {/* Detalles específicos para tratamientos */}
                  {formData.servicios_seleccionados[0].es_tratamiento && (
                    <>
                      <Divider sx={{ my: 2 }} />

                      <Box sx={{
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: alpha(colors.primary, 0.08),
                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                        mb: 2
                      }}>
                        <Typography variant="subtitle1" sx={{
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: 'bold',
                          color: colors.primary,
                          mb: 1.5
                        }}>
                          <InfoOutlined sx={{ mr: 1 }} />
                          Información del Tratamiento
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Número de citas */}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: alpha(colors.primary, 0.2),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}>
                              <Event color="primary" />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Número de Citas
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {formData.servicios_seleccionados[0].citas_estimadas} citas
                              </Typography>
                            </Box>
                          </Box>

                          {/* Frecuencia */}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: alpha(colors.info, 0.2),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}>
                              <Update color="info" />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Frecuencia
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                Citas mensuales
                              </Typography>
                            </Box>
                          </Box>

                          {/* Duración estimada */}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: alpha(colors.success, 0.2),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}>
                              <CalendarMonth color="success" />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Duración Estimada
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {formData.servicios_seleccionados[0].citas_estimadas} {parseInt(formData.servicios_seleccionados[0].citas_estimadas, 10) > 1 ? 'meses' : 'mes'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* Precio */}
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{
                    bgcolor: alpha(formData.servicios_seleccionados[0].es_tratamiento ? colors.primary : colors.info, 0.08),
                    p: 2,
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {formData.servicios_seleccionados[0].es_tratamiento ? 'Precio Total Estimado:' : 'Precio:'}
                    </Typography>

                    <Typography variant="h5" fontWeight="bold" color={formData.servicios_seleccionados[0].es_tratamiento ? 'primary' : 'info'}>
                      ${calcularPrecioTotal()}
                    </Typography>
                  </Box>

                  {/* Nota informativa para tratamientos */}
                  {formData.servicios_seleccionados[0].es_tratamiento && (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
                      <AlertTitle>Nota importante</AlertTitle>
                      El costo total puede variar según las necesidades específicas que se identifiquen durante el tratamiento.
                    </Alert>
                  )}

                  {/* Se elimina el botón "Continuar con este servicio" ya que está el botón "Siguiente" global */}
                </CardContent>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  // Renderizar paso de programación unificado (combina fecha/hora para cita y programación para tratamiento)
  const renderSchedulingStep = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color={colors.primary} sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${isDarkTheme ? '#2D3748' : '#E2E8F0'}`,
          pb: 1
        }}>
          <CalendarMonth />
          {isTratamiento ? 'Programar Primera Cita del Tratamiento' : 'Selección de Fecha y Hora'}
        </Typography>

        {/* Información del servicio seleccionado */}
        {formData.servicios_seleccionados.length > 0 && (
          <Paper elevation={3} sx={{
            p: 3,
            mb: 3,
            borderLeft: `6px solid ${isTratamiento ? colors.primary : colors.info}`,
            backgroundColor: alpha(isTratamiento ? colors.primary : colors.info, 0.05),
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Icono decorativo */}
            <Box sx={{
              position: 'absolute',
              right: -15,
              top: -15,
              opacity: 0.07,
              transform: 'rotate(15deg)',
              fontSize: '150px'
            }}>
              {isTratamiento ? <MedicalServices fontSize="inherit" /> : <EventAvailable fontSize="inherit" />}
            </Box>

            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {isTratamiento ? (
                  <MedicalServices sx={{ mr: 1, color: colors.primary }} />
                ) : (
                  <EventAvailable sx={{ mr: 1, color: colors.info }} />
                )}
                <Typography variant="h6" color={isTratamiento ? colors.primary : colors.info}>
                  {isTratamiento ? 'Tratamiento Dental' : 'Consulta Dental'}
                </Typography>

                <Chip
                  label={isTratamiento ? "Tratamiento" : "Consulta"}
                  size="small"
                  color={isTratamiento ? "primary" : "info"}
                  sx={{ ml: 2 }}
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
                {isTratamiento ? (
                  <>
                    Está programando un <strong>tratamiento de {formData.nombre_tratamiento}</strong> que
                    requiere <strong>{formData.total_citas_programadas} citas</strong> para completarse.
                  </>
                ) : (
                  <>
                    Está programando una <strong>consulta de {formData.servicios_seleccionados[0].nombre}</strong>.
                  </>
                )}
              </Typography>

              <Typography variant="body1" sx={{ mt: 1.5, fontStyle: 'italic', color: isTratamiento ? colors.primary : colors.info }}>
                {isTratamiento ? (
                  <>Ahora seleccione la fecha para la primera cita del tratamiento.</>
                ) : (
                  <>Seleccione la fecha y hora para su cita.</>
                )}
              </Typography>

              {isTratamiento && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha(colors.primary, 0.1), borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Nota:</strong> Las citas de seguimiento se programarán mensualmente a partir
                    de la fecha que seleccione para la primera cita.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Información del odontólogo - Siempre visible pero sin selector si solo hay uno */}
          {odontologos.length === 1 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: alpha(colors.primary, 0.1) }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  <HealthAndSafety sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                  Odontólogo asignado: Dr. {odontologos[0].nombre} {odontologos[0].aPaterno} {odontologos[0].aMaterno || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Especialidad: {odontologos[0].puesto || 'Odontólogo'}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            // Selección de odontólogo (solo si hay más de uno)
            <Grid item xs={12}>
              <FormControl fullWidth error={formErrors.odontologo_id}>
                <InputLabel id="odontologo-select-label">Odontólogo</InputLabel>
                <Select
                  labelId="odontologo-select-label"
                  id="odontologo-select"
                  name="odontologo_id"
                  value={formData.odontologo_id}
                  onChange={handleOdontologoChange}
                  label="Odontólogo"
                >
                  {odontologos.map((odontologo) => (
                    <MenuItem key={odontologo.id} value={odontologo.id}>
                      {`Dr. ${odontologo.nombre} ${odontologo.aPaterno} ${odontologo.aMaterno || ''}`}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.odontologo_id && (
                  <FormHelperText>Por favor seleccione un odontólogo</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}


          {/* Calendario para selección de fecha (común para ambos) */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                <Event sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Seleccione una fecha para {isTratamiento ? "la primera cita del tratamiento" : "su cita"}
              </Typography>

              {isLoading && !formData.odontologo_id ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : !formData.odontologo_id ? (
                <Alert severity="info">
                  Por favor seleccione un odontólogo para ver sus días disponibles
                </Alert>
              ) : (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={handleDateSelection}
                    minDate={new Date()}
                    disablePast
                    sx={{ width: '100%' }}
                    // Función para determinar si una fecha debe estar deshabilitada
                    shouldDisableDate={(date) => {
                      // Si no hay días laborales definidos, solo deshabilitar domingos
                      if (!workDays || workDays.length === 0) {
                        return date.getDay() === 0;
                      }
                      // Deshabilitar días que no son laborales para el odontólogo
                      return !workDays.includes(date.getDay());
                    }}
                    loading={isLoading}
                  />
                </LocalizationProvider>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                <AccessTime sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Horarios disponibles para {isTratamiento ? "la primera cita" : "su cita"}
              </Typography>

              {isLoading && selectedDate ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : !formData.odontologo_id ? (
                <Alert severity="info">
                  Por favor seleccione un odontólogo primero
                </Alert>
              ) : !selectedDate ? (
                <Alert severity="info">
                  Seleccione primero una fecha para ver los horarios disponibles
                </Alert>
              ) : availableTimes.length === 0 && occupiedTimes.length === 0 ? (
                <Alert severity="warning">
                  No hay horarios configurados para esta fecha
                </Alert>
              ) : (
                <Box>
                  {/* Horarios disponibles */}
                  {availableTimes.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 'medium',
                        color: colors.primary
                      }}>
                        <Box component="span" sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          display: 'inline-block',
                          bgcolor: colors.primary,
                          mr: 1,
                          verticalAlign: 'middle'
                        }}></Box>
                        Horarios disponibles
                      </Typography>

                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha(colors.primary, 0.05),
                        border: `1px solid ${alpha(colors.primary, 0.1)}`
                      }}>
                        {availableTimes.map((hora) => (
                          <Chip
                            key={hora}
                            label={hora}
                            onClick={() => handleHourSelection(hora)}
                            color={formData.hora_consulta === hora ? 'primary' : 'default'}
                            variant={formData.hora_consulta === hora ? 'filled' : 'outlined'}
                            sx={{
                              m: 0.5,
                              fontWeight: formData.hora_consulta === hora ? 'bold' : 'normal',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Horarios ocupados */}
                  {occupiedTimes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 'medium',
                        color: 'error.main'
                      }}>
                        <Box component="span" sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          display: 'inline-block',
                          bgcolor: 'error.main',
                          mr: 1,
                          verticalAlign: 'middle'
                        }}></Box>
                        Horarios ocupados
                      </Typography>

                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha('#f44336', 0.05),
                        border: `1px solid ${alpha('#f44336', 0.1)}`
                      }}>
                        {occupiedTimes.map((hora) => (
                          <Tooltip
                            key={hora}
                            title="Este horario ya está ocupado"
                            arrow
                            placement="top"
                          >
                            <Box sx={{ position: 'relative', m: 0.5 }}>
                              <Chip
                                label={hora}
                                color="error"
                                variant="outlined"
                                disabled
                                sx={{
                                  opacity: 0.7,
                                  cursor: 'not-allowed'
                                }}
                              />
                              <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: 8,
                                right: 8,
                                height: 2,
                                bgcolor: 'error.main',
                                transform: 'translateY(-50%) rotate(-45deg)',
                                pointerEvents: 'none'
                              }} />
                            </Box>
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {availableTimes.length === 0 && occupiedTimes.length > 0 && (
                    <Alert
                      severity="warning"
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'warning.main'
                      }}
                      icon={<ScheduleIcon />}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Sin disponibilidad
                      </Typography>
                      <Typography variant="body2">
                        Todos los horarios de esta fecha ya están ocupados.
                        Por favor seleccione otra fecha o contacte al administrador.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}

              {formErrors.hora_consulta && selectedDate && (
                <FormHelperText error>Debe seleccionar una hora</FormHelperText>
              )}
            </Paper>
          </Grid>
          {/* Resumen de fechas para tratamiento */}
          {isTratamiento && selectedDate && (
            <Grid item xs={12} md={5}>
              <Paper elevation={3} sx={{
                p: 0,
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                {/* Header */}
                <Box sx={{
                  bgcolor: alpha(colors.primary, 0.1),
                  p: 2,
                  borderBottom: `1px solid ${alpha(colors.primary, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Event sx={{ mr: 1.5, color: colors.primary }} />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Programación del Tratamiento
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5 }}>
                  {/* Timeline visual */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    my: 2,
                    position: 'relative',
                    pb: 2
                  }}>
                    {/* Línea de tiempo */}
                    <Box sx={{
                      position: 'absolute',
                      top: 12,
                      left: 10,
                      bottom: 0,
                      width: 4,
                      bgcolor: alpha(colors.primary, 0.2),
                      zIndex: 0
                    }} />

                    {/* Puntos y texto */}
                    <Box sx={{ width: '100%' }}>
                      {/* Primera cita */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                        <Box sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: colors.primary,
                          mr: 2,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          1
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Primera cita
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(selectedDate)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Citas intermedias */}
                      {formData.total_citas_programadas > 2 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: alpha(colors.primary, 0.7),
                            mr: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            fontSize: '0.8rem'
                          }}>
                            ...
                          </Box>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              Citas intermedias
                            </Typography>
                            <Typography variant="body2">
                              {formData.total_citas_programadas - 2} citas mensuales
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Última cita */}
                      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <Box sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: colors.success.main,
                          mr: 2,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {formData.total_citas_programadas}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Finalización estimada
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(formData.fecha_estimada_fin)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{
                    p: 2,
                    bgcolor: alpha(colors.info, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${alpha(colors.info, 0.3)}`
                  }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ mr: 1, fontSize: '1rem', color: colors.info }} />
                      <strong>Duración estimada:</strong> {formData.total_citas_programadas} meses
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Resumen de la fecha y hora seleccionada para citas regulares */}
          {!isTratamiento && formData.fecha_consulta && formData.hora_consulta && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: 'success.light', color: 'white' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Fecha y hora seleccionada:
                </Typography>
                <Typography variant="h6">
                  {formatDate(formData.fecha_consulta)} a las {formData.hora_consulta}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Campo de notas */}
          <Grid item xs={12}>
            <TextField
              name="notas"
              label="Notas adicionales"
              multiline
              rows={3}
              fullWidth
              value={formData.notas}
              onChange={handleChange}
              placeholder="Añada cualquier indicación o comentario relevante para esta cita"
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Renderizar confirmación unificada
  const renderConfirmationStep = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color={colors.primary} sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${isDarkTheme ? '#2D3748' : '#E2E8F0'}`,
          pb: 1
        }}>
          <Checklist />
          Confirmación {isTratamiento ? 'del Tratamiento' : 'de Cita'}
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Por favor revise que todos los datos sean correctos antes de confirmar.
        </Alert>

        <Grid container spacing={3}>
          {/* Datos del paciente */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 'bold',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Person fontSize="small" />
                Datos del Paciente
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Nombre:</strong> {formData.paciente_nombre} {formData.paciente_apellido_paterno} {formData.paciente_apellido_materno}
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Teléfono:</strong> {formData.paciente_telefono || 'No especificado'}
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Correo:</strong> {formData.paciente_correo || 'No especificado'}
              </Typography>

              {showNewPatientForm && (
                <Chip label="Nuevo paciente" color="secondary" size="small" sx={{ mt: 1 }} />
              )}
            </Paper>
          </Grid>

          {/* Datos de la cita o tratamiento */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 'bold',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {isTratamiento ? (
                  <><MedicalServices fontSize="small" />Detalles del Tratamiento</>
                ) : (
                  <><CalendarMonth fontSize="small" />Detalles de la Cita</>
                )}
              </Typography>

              {isTratamiento ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Tratamiento:</strong> {formData.nombre_tratamiento}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Primera cita:</strong> {formatDate(formData.fecha_inicio)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Número de sesiones:</strong> {formData.total_citas_programadas}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Finalización estimada:</strong> {formatDate(formData.fecha_estimada_fin)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Frecuencia:</strong> Mensual (una cita cada mes)
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Fecha:</strong> {formatDate(formData.fecha_consulta)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Hora:</strong> {formData.hora_consulta}
                  </Typography>
                </>
              )}

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Odontólogo:</strong> {selectedOdontologo ?
                  `Dr. ${selectedOdontologo.nombre} ${selectedOdontologo.aPaterno} ${selectedOdontologo.aMaterno || ''}` :
                  'No seleccionado'}
              </Typography>

              {formData.notas && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Notas:</strong> {formData.notas}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Servicios seleccionados */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 'bold',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <EventAvailable fontSize="small" />
                {isTratamiento ? 'Detalles del Servicio' : 'Servicio Seleccionado'}
              </Typography>

              <Box sx={{ ml: 1 }}>
                {formData.servicios_seleccionados.map((servicio, index) => (
                  <Box key={servicio.servicio_id} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: index < formData.servicios_seleccionados.length - 1 ? '1px dashed' : 'none',
                    borderColor: 'divider',
                    py: 1
                  }}>
                    <Typography variant="body1">
                      {servicio.nombre}
                      {servicio.es_tratamiento && ` (Tratamiento - ${formData.total_citas_programadas} citas)`}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${parseFloat(servicio.precio || 0).toFixed(2)}
                      {servicio.es_tratamiento && ` por cita`}
                    </Typography>
                  </Box>
                ))}

                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 2,
                  pt: 1,
                  borderTop: '2px solid',
                  borderColor: colors.primary
                }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    TOTAL
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color={colors.primary}>
                    ${calcularPrecioTotal()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Renderizar contenido según el paso actual
  const renderContent = () => {
    switch (activeStep) {
      case 0:
        return renderPatientSelectionStep();
      case 1:
        return renderServiceSelectionStep();
      case 2:
        return renderSchedulingStep();
      case 3:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(previousPath)}
          sx={{
            borderRadius: '8px',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          Volver
        </Button>
        <Typography
          variant="h4"
          color={colors.primary}
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '25%',
              width: '50%',
              height: 4,
              borderRadius: 2,
              bgcolor: isTratamiento ? alpha(colors.primary, 0.5) : alpha(colors.info, 0.5)
            }
          }}
        >
          {activeStep === 3
            ? (isTratamiento ? 'Confirmar Nuevo Tratamiento' : 'Confirmar Nueva Cita')
            : (isTratamiento ? 'Agendar Tratamiento' : 'Agendar Cita')}
        </Typography>
        <Box sx={{ width: 100 }}></Box> {/* Espacio para mantener el layout centrado */}
      </Box>

      <Card
        elevation={4}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: alpha(isTratamiento ? colors.primary : colors.info, 0.2)
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Stepper */}
          <Box sx={{
            p: 3,
            background: isDarkTheme
              ? `linear-gradient(135deg, ${alpha(colors.primary, 0.15)} 0%, ${alpha(colors.primary, 0.05)} 100%)`
              : `linear-gradient(135deg, ${alpha(colors.primary, 0.08)} 0%, ${alpha(colors.primary, 0.02)} 100%)`
          }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                '& .MuiStepIcon-root': {
                  fontSize: '2rem',
                  filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))',
                  transition: 'all 0.3s ease',
                  '&.Mui-completed': { color: '#4caf50' },
                  '&.Mui-active': {
                    color: isTratamiento ? colors.primary : colors.info,
                    transform: 'scale(1.2)',
                    filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
                  }
                },
                '& .MuiStepLabel-label': {
                  mt: 1,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  '&.Mui-active': {
                    fontWeight: 700,
                    color: isTratamiento ? colors.primary : colors.info
                  }
                },
                '& .MuiStepConnector-line': {
                  height: 3,
                  borderRadius: 1.5,
                  border: 0,
                  backgroundColor: alpha(colors.primary, 0.2)
                },
                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                  backgroundColor: isTratamiento ? colors.primary : colors.info
                },
                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                  backgroundColor: '#4caf50'
                }
              }}
            >
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Contenido del paso actual */}
          <Box sx={{ p: 0 }}>
            {error && (
              <Alert severity="error" sx={{ mx: 3, mt: 3, borderRadius: '8px' }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mx: 3, mt: 3, borderRadius: '8px' }}>
                {success}
              </Alert>
            )}

            <Paper
              elevation={0}
              sx={{
                m: 3,
                border: '1px solid',
                borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {renderContent()}
            </Paper>
          </Box>

          {/* Botones de navegación */}
          <Box sx={{
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid',
            borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
          }}>
            <Box>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  color="inherit"
                  startIcon={<ArrowBackIosNew />}
                  disabled={loading}
                  sx={{ borderRadius: '8px', py: 1, px: 2 }}
                >
                  Atrás
                </Button>
              )}
            </Box>

            <Box>
              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIos />}
                  disabled={!isStepValid || loading}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 3,
                    boxShadow: '0 4px 12px rgba(0, 120, 200, 0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 14px rgba(0, 120, 200, 0.3)'
                    }
                  }}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="success"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 3,
                    backgroundColor: '#2e7d32',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                    '&:hover': {
                      backgroundColor: '#1b5e20',
                      boxShadow: '0 6px 14px rgba(46, 125, 50, 0.3)'
                    }
                  }}
                >
                  {loading ? 'Guardando...' : 'Confirmar'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={handleNotificationClose}
      />
    </Container>
  );
};

export default NuevoAgendamiento;