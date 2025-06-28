import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  IconButton,
  FormControlLabel,
  Switch,
  Chip,
  Paper,
  Tooltip,
  Badge,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Save,
  AccessTime,
  Person,
  Delete,
  Add,
  ArrowBack,
  EventAvailable,
  EventBusy,
  Edit,
  Done,
  Info,
  Schedule,
  ViewList,
  ViewModule,
  CalendarViewDay,
  Timer,
  AddAlarm,
  RemoveCircleOutline,
  ExpandMore,
  ExpandLess,
  Settings,
  Search,
  FilterList
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useNavigate } from 'react-router-dom';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Función para calcular la diferencia en minutos entre dos horas
const calcularDiferenciaMinutos = (horaInicio, horaFin) => {
  const [horaInicioHoras, horaInicioMinutos] = horaInicio.split(':').map(Number);
  const [horaFinHoras, horaFinMinutos] = horaFin.split(':').map(Number);
  
  const inicioMinutos = horaInicioHoras * 60 + horaInicioMinutos;
  const finMinutos = horaFinHoras * 60 + horaFinMinutos;
  
  return finMinutos - inicioMinutos;
};

const HorariosForm = () => {
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const [odontologo, setOdontologo] = useState(null);
  const odontologoId = "3";
  
  // Estado para la vista del resumen
  const [vistaResumen, setVistaResumen] = useState('compacta');
  
  // Estado para filtrado y búsqueda (añadido para imitar PatientsReport)
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos');
  
  // Estado para controlar la edición de cada franja horaria
  const [franjasEnEdicion, setFranjasEnEdicion] = useState({});
  
  // Estado para las duraciones manuales por día y por franja
  const [duracionesManuales, setDuracionesManuales] = useState({
    Lunes: { 0: true },
    Martes: { 0: true },
    Miércoles: { 0: true },
    Jueves: { 0: true },
    Viernes: { 0: true },
    Sábado: { 0: true },
    Domingo: { 0: true },
  });

  // Estado para los horarios por día
  const [horariosPorDia, setHorariosPorDia] = useState({
    Lunes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Martes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Miércoles: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Jueves: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Viernes: { activo: true, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Sábado: { activo: false, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
    Domingo: { activo: false, franjas: [{ hora_inicio: '09:00', hora_fin: '12:00', duracion: 50 }] },
  });
  
  // Estado para almacenar información de citas calculadas
  const [infoFranjas, setInfoFranjas] = useState({});
  
  // Vista actual para configuración de días (similar a la vista en PatientsReport)
  const [vistaDias, setVistaDias] = useState('compacta');
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: ''
  });

  // Cargar datos del odontólogo
  useEffect(() => {
    const fetchOdontologo = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/empleados/odontologos/activos');
        if (!response.ok) throw new Error('Error al cargar odontólogos');
        const data = await response.json();

        if (data.length > 0) {
          setOdontologo(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          open: true,
          message: 'Error al cargar información del odontólogo',
          type: 'error'
        });
      }
    };
    fetchOdontologo();
  }, []);

  // Cargar horarios del odontólogo
  useEffect(() => {
    const fetchHorariosOdontologo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://back-end-4803.onrender.com/api/horarios/empleado/${odontologoId}`);

        if (!response.ok) {
          throw new Error('Error al cargar los horarios');
        }

        const data = await response.json();

        if (data && data.horarios) {
          // Procesamos los datos para preservar duraciones manuales
          const nuevosHorarios = { ...data.horarios };
          const nuevosDuracionesManuales = { ...duracionesManuales };
          const nuevasFranjasEnEdicion = {};

          // Para cada día, inicializamos los flags
          Object.keys(nuevosHorarios).forEach(dia => {
            if (!nuevosDuracionesManuales[dia]) {
              nuevosDuracionesManuales[dia] = {};
            }
            if (!nuevasFranjasEnEdicion[dia]) {
              nuevasFranjasEnEdicion[dia] = {};
            }

            // Aseguramos que todas las duraciones son números, no strings
            nuevosHorarios[dia].franjas.forEach((franja, index) => {
              franja.duracion = parseInt(franja.duracion);
              nuevosDuracionesManuales[dia][index] = true;
              nuevasFranjasEnEdicion[dia][index] = false; // No está en edición por defecto
            });
          });

          setHorariosPorDia(nuevosHorarios);
          setDuracionesManuales(nuevosDuracionesManuales);
          setFranjasEnEdicion(nuevasFranjasEnEdicion);
          
          // Calculamos la información de citas para cada franja
          calcularInfoFranjas(nuevosHorarios);
        }
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setNotification({
          open: true,
          message: 'Error al cargar los horarios del odontólogo',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHorariosOdontologo();
  }, []);

  // Función para calcular la información de citas para todas las franjas
  const calcularInfoFranjas = (horarios) => {
    const infoCalculada = {};
    
    Object.keys(horarios).forEach(dia => {
      infoCalculada[dia] = {};
      
      horarios[dia].franjas.forEach((franja, index) => {
        infoCalculada[dia][index] = calcularInfoCitas(franja.hora_inicio, franja.hora_fin, franja.duracion);
      });
    });
    
    setInfoFranjas(infoCalculada);
  };

  // Función para calcular la información de citas para una franja específica
  const calcularInfoCitas = (horaInicio, horaFin, duracion) => {
    const duracionMinutos = parseInt(duracion);
    const tiempoTotalMinutos = calcularDiferenciaMinutos(horaInicio, horaFin);
    
    // Número de citas completas que caben
    const citasCompletas = Math.floor(tiempoTotalMinutos / duracionMinutos);
    
    // Minutos sobrantes
    const minutosSobrantes = tiempoTotalMinutos % duracionMinutos;
    
    // Determinar si hay una recomendación basada en los minutos sobrantes
    let recomendacion = null;
    if (minutosSobrantes >= 10 && minutosSobrantes <= 30) {
      const minutosFaltantes = duracionMinutos - minutosSobrantes;
      
      // Calcular nueva hora de fin si se extendiera
      const [horaFinHoras, horaFinMinutos] = horaFin.split(':').map(Number);
      const totalMinutosHoraFin = horaFinHoras * 60 + horaFinMinutos;
      const nuevaHoraFinMinutos = totalMinutosHoraFin + minutosFaltantes;
      const nuevaHoraFinHoras = Math.floor(nuevaHoraFinMinutos / 60);
      const nuevosMinutos = nuevaHoraFinMinutos % 60;
      const nuevaHoraFin = `${String(nuevaHoraFinHoras).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}`;
      
      recomendacion = {
        tipo: 'extender_horario',
        mensaje: `Extender horario hasta ${nuevaHoraFin} permitiría 1 cita más`,
        minutos: minutosFaltantes,
        nuevaHoraFin: nuevaHoraFin
      };
    } else if (minutosSobrantes > 30) {
      // Calcular nueva hora de fin si se redujera
      const [horaFinHoras, horaFinMinutos] = horaFin.split(':').map(Number);
      const totalMinutosHoraFin = horaFinHoras * 60 + horaFinMinutos;
      const nuevaHoraFinMinutos = totalMinutosHoraFin - minutosSobrantes;
      const nuevaHoraFinHoras = Math.floor(nuevaHoraFinMinutos / 60);
      const nuevosMinutos = nuevaHoraFinMinutos % 60;
      const nuevaHoraFin = `${String(nuevaHoraFinHoras).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}`;
      
      // Alternativa: acortar la duración
      const nuevaDuracion = Math.floor(tiempoTotalMinutos / (citasCompletas + 1));
      const citasConNuevaDuracion = citasCompletas + 1;
      
      recomendacion = {
        tipo: 'optimizar',
        mensaje: `Sobran ${minutosSobrantes} min. Optimiza acortando el horario o ajustando la duración`,
        opcionHorario: {
          mensaje: `Reducir horario a ${nuevaHoraFin} (exacto para ${citasCompletas} citas)`,
          nuevaHoraFin
        },
        opcionDuracion: {
          mensaje: `Cambiar duración a ${nuevaDuracion} min. permitiría ${citasConNuevaDuracion} citas`,
          nuevaDuracion
        }
      };
    }
    
    return {
      citasCompletas,
      minutosSobrantes,
      tiempoTotalMinutos,
      duracionMinutos,
      recomendacion
    };
  };

  // Cambiar estado activo/inactivo de un día
  const handleDiaActivoChange = (dia) => {
    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        activo: !prev[dia].activo
      }
    }));
  };

  // Habilitar edición para una franja horaria específica
  const habilitarEdicion = (dia, index) => {
    setFranjasEnEdicion(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [index]: true
      }
    }));
  };

  // Guardar cambios de una franja horaria específica
  const guardarCambiosFranja = (dia, index) => {
    setFranjasEnEdicion(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [index]: false
      }
    }));
    
    // Recalculamos la información de citas después de guardar cambios
    calcularInfoFranjas(horariosPorDia);
  };

  // Manejar cambios en los campos de horario
  const handleHorarioChange = (dia, index, field, value) => {
    const newHorarios = { ...horariosPorDia };

    // Si el campo es duracion
    if (field === 'duracion') {
      // Convertir a número explícitamente
      const duracionNum = parseInt(value);

      // Validar que sea un número válido
      if (isNaN(duracionNum)) {
        setNotification({
          open: true,
          message: 'La duración debe ser un número válido',
          type: 'error'
        });
        return;
      }

      const duracionFinal = duracionNum > 120 ? 120 : duracionNum;
      if (duracionNum > 120) {
        setNotification({
          open: true,
          message: 'La duración máxima permitida es de 2 horas (120 minutos)',
          type: 'warning'
        });
      }

      newHorarios[dia].franjas[index].duracion = duracionFinal;
    } else {
      newHorarios[dia].franjas[index][field] = value;
    }

    setHorariosPorDia(newHorarios);
    
    // Recalculamos la información de la franja específica que cambió
    const infoActualizada = calcularInfoCitas(
      newHorarios[dia].franjas[index].hora_inicio,
      newHorarios[dia].franjas[index].hora_fin,
      newHorarios[dia].franjas[index].duracion
    );
    
    setInfoFranjas(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [index]: infoActualizada
      }
    }));
  };

  // Aplicar recomendación de extender horario
  const aplicarRecomendacionExtender = (dia, index, nuevaHoraFin) => {
    setHorariosPorDia(prev => {
      const newState = { ...prev };
      newState[dia].franjas[index].hora_fin = nuevaHoraFin;
      return newState;
    });
    
    // Habilitar edición para que el usuario pueda ver y confirmar el cambio
    habilitarEdicion(dia, index);
    
    // Recalcular la información de citas
    setTimeout(() => {
      const newHorarios = { ...horariosPorDia };
      const franja = newHorarios[dia].franjas[index];
      const infoActualizada = calcularInfoCitas(
        franja.hora_inicio,
        nuevaHoraFin,
        franja.duracion
      );
      
      setInfoFranjas(prev => ({
        ...prev,
        [dia]: {
          ...prev[dia],
          [index]: infoActualizada
        }
      }));
    }, 0);
  };

  // Aplicar recomendación de ajustar duración
  const aplicarRecomendacionDuracion = (dia, index, nuevaDuracion) => {
    setHorariosPorDia(prev => {
      const newState = { ...prev };
      newState[dia].franjas[index].duracion = nuevaDuracion;
      return newState;
    });
    
    // Habilitar edición para que el usuario pueda ver y confirmar el cambio
    habilitarEdicion(dia, index);
    
    // Recalcular la información de citas
    setTimeout(() => {
      const newHorarios = { ...horariosPorDia };
      const franja = newHorarios[dia].franjas[index];
      const infoActualizada = calcularInfoCitas(
        franja.hora_inicio,
        franja.hora_fin,
        nuevaDuracion
      );
      
      setInfoFranjas(prev => ({
        ...prev,
        [dia]: {
          ...prev[dia],
          [index]: infoActualizada
        }
      }));
    }, 0);
  };

  // Aplicar recomendación de acortar horario
  const aplicarRecomendacionAcortar = (dia, index, nuevaHoraFin) => {
    setHorariosPorDia(prev => {
      const newState = { ...prev };
      newState[dia].franjas[index].hora_fin = nuevaHoraFin;
      return newState;
    });
    
    // Habilitar edición para que el usuario pueda ver y confirmar el cambio
    habilitarEdicion(dia, index);
    
    // Recalcular la información de citas
    setTimeout(() => {
      const newHorarios = { ...horariosPorDia };
      const franja = newHorarios[dia].franjas[index];
      const infoActualizada = calcularInfoCitas(
        franja.hora_inicio,
        nuevaHoraFin,
        franja.duracion
      );
      
      setInfoFranjas(prev => ({
        ...prev,
        [dia]: {
          ...prev[dia],
          [index]: infoActualizada
        }
      }));
    }, 0);
  };

  // Agregar nueva franja horaria a un día
  const agregarFranjaHoraria = (dia) => {
    const ultimaFranja = horariosPorDia[dia].franjas[horariosPorDia[dia].franjas.length - 1];

    // Calcular nueva hora de inicio (30 min después de la última hora de fin)
    const ultimaHoraFin = new Date(`2023-01-01T${ultimaFranja.hora_fin}:00`);
    ultimaHoraFin.setMinutes(ultimaHoraFin.getMinutes() + 30);
    const nuevaHoraInicio = ultimaHoraFin.toTimeString().slice(0, 5);

    // Calcular nueva hora de fin (1 hora después del nuevo inicio)
    const nuevaHoraFin = new Date(`2023-01-01T${nuevaHoraInicio}:00`);
    nuevaHoraFin.setHours(nuevaHoraFin.getHours() + 1);
    const horaFinStr = nuevaHoraFin.toTimeString().slice(0, 5);

    // Índice de la nueva franja
    const nuevoIndex = horariosPorDia[dia].franjas.length;

    // Duración predeterminada como número
    const duracionPredeterminada = 50;

    // Actualizar estados
    setHorariosPorDia(prev => {
      const newState = { ...prev };
      newState[dia] = {
        ...newState[dia],
        franjas: [
          ...newState[dia].franjas,
          {
            hora_inicio: nuevaHoraInicio,
            hora_fin: horaFinStr,
            duracion: duracionPredeterminada
          }
        ]
      };
      return newState;
    });

    // Marcar duración como manual
    setDuracionesManuales(prev => {
      const newState = { ...prev };
      if (!newState[dia]) newState[dia] = {};
      newState[dia][nuevoIndex] = true;
      return newState;
    });
    
    // Establecer modo de edición para la nueva franja
    setFranjasEnEdicion(prev => {
      const newState = { ...prev };
      if (!newState[dia]) newState[dia] = {};
      newState[dia][nuevoIndex] = true; // Nueva franja en modo edición
      return newState;
    });
    
    // Calcular información de citas para la nueva franja
    setTimeout(() => {
      const infoNuevaFranja = calcularInfoCitas(
        nuevaHoraInicio,
        horaFinStr,
        duracionPredeterminada
      );
      
      setInfoFranjas(prev => ({
        ...prev,
        [dia]: {
          ...prev[dia],
          [nuevoIndex]: infoNuevaFranja
        }
      }));
    }, 0);
  };

  // Eliminar franja horaria
  const eliminarFranjaHoraria = (dia, index) => {
    if (horariosPorDia[dia].franjas.length <= 1) {
      setNotification({
        open: true,
        message: 'Debe haber al menos una franja horaria para los días activos',
        type: 'warning'
      });
      return;
    }

    // Eliminar la franja
    const newHorarios = { ...horariosPorDia };
    newHorarios[dia].franjas.splice(index, 1);
    setHorariosPorDia(newHorarios);

    // Actualizar duracionesManuales
    const newDuracionesManuales = { ...duracionesManuales };
    delete newDuracionesManuales[dia][index];

    // Reindexar los índices posteriores
    const indices = Object.keys(newDuracionesManuales[dia])
      .map(Number)
      .filter(i => i > index);

    indices.forEach(i => {
      newDuracionesManuales[dia][i - 1] = newDuracionesManuales[dia][i];
      delete newDuracionesManuales[dia][i];
    });

    setDuracionesManuales(newDuracionesManuales);
    
    // Actualizar franjasEnEdicion
    const newFranjasEnEdicion = { ...franjasEnEdicion };
    delete newFranjasEnEdicion[dia][index];
    
    // Reindexar los índices posteriores
    const indicesEdicion = Object.keys(newFranjasEnEdicion[dia])
      .map(Number)
      .filter(i => i > index);

    indicesEdicion.forEach(i => {
      newFranjasEnEdicion[dia][i - 1] = newFranjasEnEdicion[dia][i];
      delete newFranjasEnEdicion[dia][i];
    });

    setFranjasEnEdicion(newFranjasEnEdicion);
    
    // Actualizar infoFranjas
    const newInfoFranjas = { ...infoFranjas };
    if (newInfoFranjas[dia]) {
      delete newInfoFranjas[dia][index];
      
      // Reindexar
      const indicesInfo = Object.keys(newInfoFranjas[dia])
        .map(Number)
        .filter(i => i > index);

      indicesInfo.forEach(i => {
        newInfoFranjas[dia][i - 1] = newInfoFranjas[dia][i];
        delete newInfoFranjas[dia][i];
      });
      
      setInfoFranjas(newInfoFranjas);
    }
  };

  // Función para renderizar el panel de optimización/recomendaciones
  const renderPanelOptimizacion = (dia, index, info) => {
    if (!info || !info.recomendacion) return null;
    
    // Recomendación para extender el horario
    if (info.recomendacion.tipo === 'extender_horario') {
      return (
        <Paper 
          elevation={0}
          sx={{ 
            p: 1.5, 
            mt: 1, 
            backgroundColor: isDarkTheme ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.1)',
            border: `1px dashed ${colors.info}`,
            borderRadius: '8px'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddAlarm color="info" fontSize="small" />
            <Typography variant="body2">
              <strong>Recomendación:</strong> {info.recomendacion.mensaje}
            </Typography>
            <Button 
              size="small" 
              variant="outlined" 
              color="info"
              onClick={() => aplicarRecomendacionExtender(dia, index, info.recomendacion.nuevaHoraFin)}
              startIcon={<Timer />}
              sx={{ ml: 'auto !important' }}
            >
              Aplicar
            </Button>
          </Stack>
        </Paper>
      );
    }
    
    // Recomendación para optimizar (con opciones)
    if (info.recomendacion.tipo === 'optimizar') {
      return (
        <Paper 
          elevation={0}
          sx={{ 
            p: 1.5, 
            mt: 1, 
            backgroundColor: isDarkTheme ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)',
            border: `1px dashed ${colors.warning}`,
            borderRadius: '8px'
          }}
        >
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              <strong>Optimización:</strong> {info.recomendacion.mensaje}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                size="small" 
                variant="outlined" 
                color="warning"
                startIcon={<RemoveCircleOutline />}
                onClick={() => aplicarRecomendacionAcortar(dia, index, info.recomendacion.opcionHorario.nuevaHoraFin)}
              >
                Acortar horario
              </Button>
              
              <Button 
                size="small" 
                variant="outlined" 
                color="primary"
                startIcon={<Settings />}
                onClick={() => aplicarRecomendacionDuracion(dia, index, info.recomendacion.opcionDuracion.nuevaDuracion)}
              >
                Ajustar duración
              </Button>
            </Box>
          </Stack>
        </Paper>
      );
    }
    
    return null;
  };

  // Validación del formulario
  const validateForm = () => {
    // Crear una copia profunda para trabajar sin afectar el estado original
    const horariosCopia = JSON.parse(JSON.stringify(horariosPorDia));

    // Verificar días activos
    const hayDiasActivos = Object.values(horariosCopia).some(dia => dia.activo);
    if (!hayDiasActivos) {
      setNotification({
        open: true,
        message: 'Debe haber al menos un día de trabajo activo',
        type: 'error'
      });
      return false;
    }

    let isValid = true;
    let mensajeError = '';

    // Validar cada franja horaria
    Object.entries(horariosCopia).forEach(([dia, config]) => {
      if (!config.activo) return; // Saltar días inactivos

      config.franjas.forEach((franja, index) => {
        // 1. Validar formato de horas
        const inicio = new Date(`2023-01-01T${franja.hora_inicio}:00`);
        const fin = new Date(`2023-01-01T${franja.hora_fin}:00`);

        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
          isValid = false;
          mensajeError = `Formato de hora inválido en ${dia}`;
          return;
        }

        // 2. Validar que fin sea posterior a inicio
        if (fin <= inicio) {
          isValid = false;
          mensajeError = `La hora de fin debe ser posterior a la hora de inicio en ${dia}`;
          return;
        }

        // 3. Validar que la duración sea mayor a 0
        const duracionNum = parseInt(franja.duracion);
        if (isNaN(duracionNum) || duracionNum <= 0) {
          isValid = false;
          mensajeError = `La duración debe ser mayor a 0 en ${dia}`;
          return;
        }

        // 4. Validar que la duración no exceda 120 minutos
        if (duracionNum > 120) {
          isValid = false;
          mensajeError = `La duración no puede exceder las 2 horas (120 minutos) en ${dia}`;
          return;
        }

        // 5. Validar solapamientos
        if (config.franjas.length > 1) {
          for (let i = 0; i < config.franjas.length; i++) {
            if (i === index) continue;

            const otraInicio = new Date(`2023-01-01T${config.franjas[i].hora_inicio}:00`);
            const otraFin = new Date(`2023-01-01T${config.franjas[i].hora_fin}:00`);

            if ((inicio >= otraInicio && inicio < otraFin) ||
              (fin > otraInicio && fin <= otraFin) ||
              (inicio <= otraInicio && fin >= otraFin)) {
              isValid = false;
              mensajeError = `Hay franjas horarias que se solapan en ${dia}`;
              return;
            }
          }
        }
      });
    });

    if (!isValid) {
      setNotification({
        open: true,
        message: mensajeError,
        type: 'error'
      });
      return false;
    }

    return true;
  };

  // Manejar cambio de vista del resumen
  const handleCambioVistaResumen = (event, nuevaVista) => {
    if (nuevaVista !== null) {
      setVistaResumen(nuevaVista);
    }
  };
  
  // Manejar cambio de vista de días
  const handleCambioVistaDias = (view) => {
    setVistaDias(view);
  };
  
  // Manejar cambio en búsqueda
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Manejar cambio en filtro activo
  const handleFiltroActivoChange = (event) => {
    setFiltroActivo(event.target.value);
  };

  // Envío del formulario
  const handleSubmit = async () => {
    // Verificar que no haya franjas en edición
    const hayFranjasEnEdicion = Object.values(franjasEnEdicion).some(dia => 
      Object.values(dia).some(enEdicion => enEdicion)
    );
    
    if (hayFranjasEnEdicion) {
      setNotification({
        open: true,
        message: 'Hay franjas horarias en edición. Por favor, guarde los cambios antes de continuar.',
        type: 'warning'
      });
      return;
    }
    
    if (!validateForm()) return;

    setLoading(true);
    setNotification({ open: false, message: '', type: '' });

    try {
      // Preparar datos para enviar
      const horariosProcesados = [];

      Object.entries(horariosPorDia).forEach(([dia, config]) => {
        if (config.activo) {
          config.franjas.forEach(franja => {
            horariosProcesados.push({
              empleado_id: parseInt(odontologoId),
              dia_semana: dia,
              hora_inicio: franja.hora_inicio,
              hora_fin: franja.hora_fin,
              duracion: parseInt(franja.duracion)
            });
          });
        }
      });

      // Eliminar horarios existentes antes de crear nuevos
      const responseDelete = await fetch(`https://back-end-4803.onrender.com/api/horarios/delete-by-empleado/${odontologoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!responseDelete.ok) {
        const errorData = await responseDelete.json();
        throw new Error(errorData.message || 'Error al eliminar horarios anteriores');
      }

      // Crear nuevos horarios
      const responseCreate = await fetch('https://back-end-4803.onrender.com/api/horarios/create-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(horariosProcesados)
      });

      if (!responseCreate.ok) {
        const errorData = await responseCreate.json();
        throw new Error(errorData.message || 'Error al crear nuevos horarios');
      }

      setNotification({
        open: true,
        message: 'Horarios guardados con éxito!',
        type: 'success'
      });

      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate('/Administrador/horarios');
      }, 2000);

    } catch (error) {
      console.error('Error al guardar horarios:', error);
      setNotification({
        open: true,
        message: error.message || 'Ocurrió un error al guardar los horarios. Por favor intente nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Definición de colores según el tema
  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    tableBackground: isDarkTheme ? '#1E2A3A' : '#e3f2fd',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
    primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
    inputBorder: isDarkTheme ? '#4B9FFF' : '#1976d2',
    inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',
    cardBackground: isDarkTheme ? '#1D2B3A' : '#F8FAFC',
    divider: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    titleColor: isDarkTheme ? '#4B9FFF' : '#0052A3',
    success: isDarkTheme ? '#4caf50' : '#4caf50',
    error: isDarkTheme ? '#f44336' : '#f44336',
    warning: isDarkTheme ? '#ff9800' : '#ff9800',
    info: isDarkTheme ? '#2196f3' : '#2196f3',
    disabled: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.38)',
    highlightBg: isDarkTheme ? 'rgba(0, 188, 212, 0.15)' : 'rgba(3, 66, 124, 0.08)',
  };
  
  // Renderizar vista de calendario (gráfica)
  const renderVistaCalendario = () => {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: colors.paper,
          borderRadius: '8px',
          border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`
        }}
      >
        <Grid container spacing={2}>
          {/* Encabezado de días */}
          {diasSemana.map(dia => (
            <Grid item xs={12/7} key={`header-${dia}`}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  backgroundColor: colors.primary,
                  color: 'white',
                  borderRadius: '4px 4px 0 0'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {dia.substring(0, 3)}
                </Typography>
              </Paper>
            </Grid>
          ))}
          
          {/* Contenido para cada día */}
          {diasSemana.map(dia => (
            <Grid item xs={12/7} key={`content-${dia}`}>
              <Paper
                elevation={0}
                sx={{
                  minHeight: '200px',
                  p: 1,
                  backgroundColor: !horariosPorDia[dia].activo 
                    ? isDarkTheme ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)'
                    : isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '0 0 4px 4px',
                  position: 'relative'
                }}
              >
                {!horariosPorDia[dia].activo && (
                  <Chip
                    size="small"
                    label="Inactivo"
                    color="error"
                    icon={<EventBusy />}
                    sx={{ mb: 1 }}
                  />
                )}
                
                {horariosPorDia[dia].activo && (
                  <Stack spacing={1}>
                    <Chip
                      size="small"
                      label="Activo"
                      color="success"
                      icon={<EventAvailable />}
                      sx={{ mb: 1 }}
                    />
                    
                    {/* Representación visual de franjas horarias */}
                    {horariosPorDia[dia].franjas.map((franja, index) => {
                      // Calcular posición y tamaño relativo para la visualización
                      const horaInicio = parseInt(franja.hora_inicio.split(':')[0]);
                      const minInicio = parseInt(franja.hora_inicio.split(':')[1]);
                      const horaFin = parseInt(franja.hora_fin.split(':')[0]);
                      const minFin = parseInt(franja.hora_fin.split(':')[1]);
                      
                      // Calcular posición entre 8:00 (8.0) y 20:00 (20.0) en porcentaje
                      const inicioDecimal = horaInicio + minInicio/60;
                      const finDecimal = horaFin + minFin/60;
                      
                      // Considerando 8:00 como 0% y 20:00 como 100%, con 12 horas de diferencia
                      const posInicio = ((inicioDecimal - 8) / 12) * 100;
                      const posFin = ((finDecimal - 8) / 12) * 100;
                      const altura = posFin - posInicio;
                      
                      const infoCitas = infoFranjas[dia] && infoFranjas[dia][index];
                      
                      return (
                        <Box 
                          key={index}
                          sx={{
                            position: 'relative',
                            height: '24px',
                            backgroundColor: colors.primary,
                            borderRadius: '4px',
                            marginTop: posInicio > 0 ? `${posInicio * 1.5}px` : 0,
                            minHeight: `${altura * 1.5}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: isDarkTheme ? '#00ACC1' : '#0288D1',
                            }
                          }}
                        >
                          {franja.hora_inicio}-{franja.hora_fin}
                          {infoCitas && (
                            <Chip 
                              size="small" 
                              label={`${infoCitas.citasCompletas} citas`}
                              sx={{ 
                                position: 'absolute',
                                top: -12,
                                right: -5,
                                height: '20px',
                                fontSize: '0.6rem',
                                backgroundColor: colors.info,
                                color: 'white'
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };
  
  // Renderizar vista de tabla
  const renderVistaTabla = () => {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: colors.paper,
          borderRadius: '8px',
          border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`
        }}
      >
        {/* Encabezados de tabla */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr 1fr', sm: '0.8fr 1.2fr 1fr 1fr' },
          fontWeight: 'bold',
          borderBottom: `2px solid ${colors.primary}`,
          pb: 1,
          mb: 2
        }}>
          <Typography variant="subtitle2">Día</Typography>
          <Typography variant="subtitle2">Horarios</Typography>
          <Typography variant="subtitle2" sx={{ display: { xs: 'none', sm: 'block' } }}>Duración</Typography>
          <Typography variant="subtitle2">Citas</Typography>
        </Box>

        {/* Lista de días activos */}
        {diasSemana.filter(dia => horariosPorDia[dia].activo).length > 0 ? (
          diasSemana.filter(dia => horariosPorDia[dia].activo).map((dia) => (
            <React.Fragment key={dia}>
              {horariosPorDia[dia].franjas.map((franja, index) => {
                const infoCitas = infoFranjas[dia] && infoFranjas[dia][index];
                
                return (
                  <Box
                    key={`${dia}-${index}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr 1fr', sm: '0.8fr 1.2fr 1fr 1fr' },
                      py: 1.5,
                      borderBottom: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                      '&:last-child': { borderBottom: 'none' },
                      backgroundColor: index % 2 === 0 ? 'transparent' : isDarkTheme ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'
                    }}
                  >
                    {/* Día de la semana - solo mostrarlo para la primera franja */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      {index === 0 && (
                        <Chip
                          size="small"
                          label={dia}
                          color="primary"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>

                    {/* Horario */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2">
                        {franja.hora_inicio} - {franja.hora_fin}
                      </Typography>
                    </Box>
                    
                    {/* Duración */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                      <Timer fontSize="small" color="action" />
                      <Typography variant="body2">
                        {franja.duracion} min/cita
                      </Typography>
                    </Box>
                    
                    {/* Citas disponibles */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {infoCitas ? (
                        <>
                          <Badge badgeContent={infoCitas.citasCompletas} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                            <Person color="action" />
                          </Badge>
                          <Typography variant="body2">
                            citas
                            {infoCitas.minutosSobrantes > 0 && (
                              <Chip 
                                size="small"
                                label={`+${infoCitas.minutosSobrantes}min`}
                                sx={{ ml: 1, height: '18px', fontSize: '0.7rem' }}
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                          </Typography>
                        </>
                      ) : (
                        <CircularProgress size={16} />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No hay días activos configurados. Activa al menos un día para ver el resumen.
          </Typography>
        )}
      </Paper>
    );
  };
  
  // Renderizar vista compacta (cards)
  const renderVistaCompacta = () => {
    return (
      <Grid container spacing={2}>
        {diasSemana.filter(dia => horariosPorDia[dia].activo).map((dia) => (
          <Grid item xs={12} sm={6} md={4} key={dia}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: colors.paper,
                borderRadius: '8px',
                height: '100%',
                border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  size="small"
                  label={dia}
                  color="primary"
                  sx={{ fontWeight: 'bold', mr: 1 }}
                />
                <Chip
                  size="small"
                  label="Activo"
                  color="success"
                  icon={<EventAvailable fontSize="small" />}
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={1.5}>
                {horariosPorDia[dia].franjas.map((franja, index) => {
                  const infoCitas = infoFranjas[dia] && infoFranjas[dia][index];
                  
                  return (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 1.5,
                        borderRadius: '4px',
                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                      }}
                    >
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime fontSize="small" color="primary" />
                            <strong>{franja.hora_inicio} - {franja.hora_fin}</strong>
                          </Typography>
                          
                          <Chip
                            size="small"
                            label={`${franja.duracion} min/cita`}
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                        
                        {infoCitas && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Badge badgeContent={infoCitas.citasCompletas} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                                <Person color="action" />
                              </Badge>
                              <Typography variant="body2">citas disponibles</Typography>
                            </Box>
                            
                            {infoCitas.minutosSobrantes > 0 && (
                              <Tooltip title="Minutos sobrantes">
                                <Chip 
                                  size="small"
                                  label={`+${infoCitas.minutosSobrantes}min`}
                                  sx={{ height: '20px', fontSize: '0.7rem' }}
                                  color="secondary"
                                  variant="outlined"
                                />
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>
        ))}
        
        {diasSemana.filter(dia => horariosPorDia[dia].activo).length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hay días activos configurados. Activa al menos un día para ver el resumen.
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  };
  
  // Función para renderizar el panel de configuración de día según vista seleccionada
  const renderConfiguracionDia = (dia) => {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 0,
          mb: 2,
          backgroundColor: colors.paper,
          borderRadius: '8px',
          borderLeft: `4px solid ${horariosPorDia[dia].activo ? colors.success : colors.error}`,
          overflow: 'hidden'
        }}
      >
        {/* Encabezado del día */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: horariosPorDia[dia].activo
            ? isDarkTheme ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)'
            : isDarkTheme ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
        }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={horariosPorDia[dia].activo}
                      onChange={() => handleDiaActivoChange(dia)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {dia}
                    </Typography>
                  }
                />
                {horariosPorDia[dia].activo ? (
                  <Chip
                    size="small"
                    label="Activo"
                    color="success"
                    icon={<EventAvailable />}
                    sx={{ ml: 1 }}
                  />
                ) : (
                  <Chip
                    size="small"
                    label="Inactivo"
                    color="error"
                    icon={<EventBusy />}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </Grid>
            
            {horariosPorDia[dia].activo && (
              <Grid item xs={12} sm={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  size="small"
                  onClick={() => agregarFranjaHoraria(dia)}
                  disabled={loading}
                >
                  Agregar franja horaria
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Contenido del día */}
        {horariosPorDia[dia].activo && (
          <Box sx={{ p: 2 }}>
            {horariosPorDia[dia].franjas.map((franja, index) => {
              // Obtener la información de citas para esta franja
              const infoCitas = infoFranjas[dia] && infoFranjas[dia][index];
              const enEdicion = franjasEnEdicion[dia] && franjasEnEdicion[dia][index];
              
              return (
                <Paper 
                  key={index} 
                  elevation={1} 
                  sx={{ 
                    mb: 2, 
                    overflow: 'hidden',
                    border: enEdicion ? `2px solid ${colors.primary}` : 'none',
                    borderRadius: '8px',
                    backgroundColor: enEdicion ? colors.highlightBg : isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                  }}
                >
                  {/* Barra de progreso visualizando citas */}
                  {infoCitas && (
                    <Box sx={{ width: '100%', position: 'relative' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(infoCitas.citasCompletas * infoCitas.duracionMinutos / infoCitas.tiempoTotalMinutos) * 100}
                        sx={{ 
                          height: 6, 
                          borderRadius: 0,
                          backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: colors.success
                          }
                        }}
                      />
                      {infoCitas.minutosSobrantes > 0 && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: `${(infoCitas.minutosSobrantes / infoCitas.tiempoTotalMinutos) * 100}%`,
                            height: 6,
                            backgroundColor: colors.warning,
                            opacity: 0.7
                          }}
                        />
                      )}
                    </Box>
                  )}
                  
                  {/* Contenido de la franja */}
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Hora inicio"
                          type="time"
                          value={franja.hora_inicio}
                          onChange={(e) => handleHorarioChange(dia, index, 'hora_inicio', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          disabled={loading || !enEdicion}
                          sx={{
                            '& .MuiInputBase-input': {
                              color: !enEdicion ? colors.disabled : colors.text
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Hora fin"
                          type="time"
                          value={franja.hora_fin}
                          onChange={(e) => handleHorarioChange(dia, index, 'hora_fin', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          disabled={loading || !enEdicion}
                          sx={{
                            '& .MuiInputBase-input': {
                              color: !enEdicion ? colors.disabled : colors.text
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={8} sm={3}>
                        <TextField
                          label="Duración (min)"
                          type="number"
                          value={franja.duracion}
                          onChange={(e) => handleHorarioChange(dia, index, 'duracion', e.target.value)}
                          fullWidth
                          inputProps={{ min: "15", step: "5" }}
                          disabled={loading || !enEdicion}
                          sx={{
                            '& .MuiInputBase-input': {
                              color: !enEdicion ? colors.disabled : colors.text
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={4} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {enEdicion ? (
                          <Tooltip title="Guardar cambios">
                            <IconButton
                              color="primary"
                              onClick={() => guardarCambiosFranja(dia, index)}
                              disabled={loading}
                            >
                              <Done />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Editar franja">
                            <IconButton
                              color="primary"
                              onClick={() => habilitarEdicion(dia, index)}
                              disabled={loading}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Eliminar franja">
                          <IconButton
                            color="error"
                            onClick={() => eliminarFranjaHoraria(dia, index)}
                            disabled={loading}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      
                      {/* Información de citas disponibles */}
                      {infoCitas && (
                        <Grid item xs={12}>
                          <Paper
                            elevation={0}
                            sx={{ 
                              p: 1.5, 
                              backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                              borderRadius: '4px',
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              gap: { xs: 1, sm: 2 },
                              flexWrap: 'wrap'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Schedule fontSize="small" color="primary" />
                              <Typography variant="body2">
                                Total: <strong>{infoCitas.tiempoTotalMinutos} min.</strong>
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Badge 
                                badgeContent={infoCitas.citasCompletas} 
                                color="primary" 
                                sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                              >
                                <Person color="action" />
                              </Badge>
                              <Typography variant="body2">
                                <strong>{infoCitas.citasCompletas}</strong> citas de <strong>{infoCitas.duracionMinutos} min.</strong>
                              </Typography>
                            </Box>
                            
                            {infoCitas.minutosSobrantes > 0 && (
                              <Chip
                                size="small"
                                icon={<Timer fontSize="small" />}
                                label={`${infoCitas.minutosSobrantes} min. sobrantes`}
                                color="info"
                                variant="outlined"
                                sx={{ ml: { xs: 0, sm: 'auto' } }}
                              />
                            )}
                          </Paper>
                        </Grid>
                      )}
                      
                      {/* Recomendaciones y optimizaciones */}
                      {renderPanelOptimizacion(dia, index, infoCitas)}
                    </Grid>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        {!horariosPorDia[dia].activo && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Este día no está configurado como laborable
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };
  
  return (
    <Card
      sx={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        borderRadius: '16px',
        boxShadow: isDarkTheme ?
          '0 2px 12px rgba(0,0,0,0.3)' :
          '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
        {/* Cabecera con título y selector de vista */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: colors.titleColor,
              fontFamily: 'Roboto, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AccessTime />
            Configuración de Horarios
          </Typography>
          
        </Box>

        {/* Filtros y Búsqueda */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Búsqueda */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar en horarios"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color={colors.primary} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: colors.paper,
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  color: colors.text,
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: colors.inputBorder,
                  },
                  '&:hover fieldset': {
                    borderColor: colors.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.inputLabel,
                },
              }}
            />
          </Grid>

          {/* Filtro Activos/Inactivos */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant={filtroActivo === 'todos' ? 'contained' : 'outlined'}
                onClick={() => setFiltroActivo('todos')}
                sx={{ flex: 1 }}
              >
                Todos
              </Button>
              <Button 
                variant={filtroActivo === 'activos' ? 'contained' : 'outlined'}
                onClick={() => setFiltroActivo('activos')}
                color="success"
                sx={{ flex: 1 }}
              >
                Activos
              </Button>
              <Button 
                variant={filtroActivo === 'inactivos' ? 'contained' : 'outlined'}
                onClick={() => setFiltroActivo('inactivos')}
                color="error"
                sx={{ flex: 1 }}
              >
                Inactivos
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Información del Odontólogo */}
        {odontologo && (
          <Paper elevation={2} sx={{ 
            p: 2, 
            mb: 3, 
            backgroundColor: colors.paper,
            borderRadius: '8px' 
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" />
                  {odontologo.nombre} {odontologo.aPaterno} {odontologo.aMaterno}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {odontologo.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Chip
                  label={odontologo.puesto}
                  color="primary"
                  sx={{ mt: { xs: 1, md: 0 } }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {/* Alerta informativa */}
        <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
          Use el botón <Edit fontSize="small" sx={{ mx: 0.5 }} /> para editar cada franja horaria y <Done fontSize="small" sx={{ mx: 0.5 }} /> para guardar los cambios. 
          El sistema mostrará recomendaciones para optimizar sus horarios según la duración de las citas.
        </Alert>

        {/* Tarjetas para cada día de la semana */}
        {diasSemana
          .filter(dia => {
            if (filtroActivo === 'todos') return true;
            if (filtroActivo === 'activos') return horariosPorDia[dia].activo;
            if (filtroActivo === 'inactivos') return !horariosPorDia[dia].activo;
            return true;
          })
          .filter(dia => searchTerm === '' || dia.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((dia) => renderConfiguracionDia(dia))
        }

        {/* Resumen de horarios */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          mt: 4
        }}>
          <Typography variant="subtitle1" sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 'bold',
            color: colors.titleColor
          }}>
            <AccessTime fontSize="small" />
            Resumen de Horarios Configurados
          </Typography>
          
          <ToggleButtonGroup
            value={vistaResumen}
            exclusive
            onChange={handleCambioVistaResumen}
            size="small"
            aria-label="Tipo de vista"
          >
            <ToggleButton value="compacta" aria-label="Vista compacta">
              <Tooltip title="Vista de tarjetas">
                <ViewModule fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="tabla" aria-label="Vista de tabla">
              <Tooltip title="Vista de tabla">
                <ViewList fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="calendario" aria-label="Vista de calendario">
              <Tooltip title="Vista de calendario">
                <CalendarViewDay fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        {/* Renderizar vista según la selección */}
        {vistaResumen === 'compacta' && renderVistaCompacta()}
        {vistaResumen === 'tabla' && renderVistaTabla()}
        {vistaResumen === 'calendario' && renderVistaCalendario()}
        
        {/* Botones de Acción */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 4, 
          pt: 3,
          borderTop: `1px solid ${colors.divider}`
        }}>
          
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            sx={{
              borderRadius: '6px',
              boxShadow: 3,
              px: 3,
              py: 1,
              '&:hover': {
                boxShadow: 5,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Horarios'}
          </Button>
        </Box>
      </Box>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={() => setNotification({ open: false, message: '', type: '' })}
      />
    </Card>
  );
};

export default HorariosForm;