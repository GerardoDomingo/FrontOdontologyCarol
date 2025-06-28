import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Chip,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Tabs,
  Tab
} from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PieChartIcon from '@mui/icons-material/PieChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Componente para la vista de Tratamientos
const TratamientosView = ({ data, loading, error, chartType, onChartTypeChange }) => {
  const { darkMode } = useThemeContext();
  
  // Opciones para gráficas de servicios
  const options = {
    title: "Servicios Odontológicos Realizados",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: darkMode ? "#f5f5f5" : "#333",
      fontName: "Roboto"
    },
    pieHole: chartType === "DonutChart" ? 0.4 : 0,
    is3D: chartType === "PieChart3D",
    backgroundColor: 'transparent',
    colors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8710D8"],
    legend: chartType === "Table" ? { position: "top" } : { position: "right" },
    chartArea: { width: '80%', height: '80%' },
    vAxis: chartType === "BarChart" ? { title: "Cantidad" } : {},
    hAxis: chartType === "BarChart" ? { title: "Servicio" } : {}
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ 
          backgroundColor: "#1E3A8A", 
          color: "white", 
          padding: 1, 
          borderRadius: 1, 
          mb: 2, 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">Servicios Odontológicos Realizados</Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={onChartTypeChange}
            size="small"
            aria-label="tipo de gráfica"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiToggleButton-root': { 
                color: 'white',
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.3)' }
              }
            }}
          >
            <ToggleButton value="PieChart" aria-label="gráfica circular">
              <PieChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="DonutChart" aria-label="gráfica de anillo">
              <DonutLargeIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="BarChart" aria-label="gráfica de barras">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="Table" aria-label="tabla">
              <TableChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>
          </Box>
        ) : (
          <Chart
            chartType={chartType === "DonutChart" ? "PieChart" : chartType}
            width="100%"
            height="300px"
            data={data}
            options={options}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Componente para la vista de Ingresos
const IngresosView = ({ data, loading, error, chartType, onChartTypeChange }) => {
  const { darkMode } = useThemeContext();
  
  // Convertir datos para BarChart si es necesario
  const chartData = React.useMemo(() => {
    if (data.length <= 1) return data;
    
    if (chartType === "ColumnChart") {
      return data.map((row, index) => {
        if (index === 0) return row; // Mantener encabezados
        return [row[0], row[1], row[1] > 1000 ? row[1].toString() : null];
      });
    }
    return data;
  }, [data, chartType]);
  
  // Opciones para gráficas de ingresos
  const options = {
    title: "Ingresos Mensual y Anual",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: darkMode ? "#f5f5f5" : "#333",
      fontName: "Roboto"
    },
    backgroundColor: 'transparent',
    colors: ["#4285F4"],
    curveType: chartType === "LineChart" ? "function" : null,
    hAxis: { title: "Mes" },
    vAxis: { title: "Ingresos" },
    legend: { position: "bottom" },
    pointSize: 5,
    lineWidth: 3,
    tooltip: { isHtml: true },
    chartArea: { width: '80%', height: '70%' },
    annotations: {
      textStyle: {
        fontSize: 12,
        color: '#555'
      }
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ 
          backgroundColor: "#1E3A8A", 
          color: "white", 
          padding: 1, 
          borderRadius: 1, 
          mb: 2, 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">Ingresos Mensual y Anual</Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={onChartTypeChange}
            size="small"
            aria-label="tipo de gráfica"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiToggleButton-root': { 
                color: 'white',
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.3)' }
              }
            }}
          >
            <ToggleButton value="LineChart" aria-label="gráfica de línea">
              <ShowChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="ColumnChart" aria-label="gráfica de columnas">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="Table" aria-label="tabla">
              <TableChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>
          </Box>
        ) : (
          <Chart
            chartType={chartType}
            width="100%"
            height="300px"
            data={chartData}
            options={options}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Componente para la vista de Citas por Día
const CitasDiaView = ({ data, loading, error, chartType, onChartTypeChange }) => {
  const { darkMode } = useThemeContext();
  
  // Opciones para gráficas de citas por día
  const options = {
    title: "Citas por Día de la Semana",
    titleTextStyle: {
      fontSize: 16,
      bold: true,
      color: darkMode ? "#f5f5f5" : "#333",
      fontName: "Roboto"
    },
    backgroundColor: 'transparent',
    colors: ["#34A853"],
    legend: { position: "none" },
    hAxis: { title: "Día" },
    vAxis: { title: "Cantidad de Citas" },
    chartArea: { width: '80%', height: '70%' }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ 
          backgroundColor: "#1E3A8A", 
          color: "white", 
          padding: 1, 
          borderRadius: 1, 
          mb: 2, 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">Citas por Día de la Semana</Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={onChartTypeChange}
            size="small"
            aria-label="tipo de gráfica"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiToggleButton-root': { 
                color: 'white',
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.3)' }
              }
            }}
          >
            <ToggleButton value="ColumnChart" aria-label="gráfica de columnas">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="LineChart" aria-label="gráfica de línea">
              <ShowChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="Table" aria-label="tabla">
              <TableChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>
          </Box>
        ) : (
          <Chart
            chartType={chartType}
            width="100%"
            height="300px"
            data={data}
            options={options}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Componente principal del Dashboard
const Dashboard = () => {
  // Contextos
  const { user } = useAuth();
  const { darkMode } = useThemeContext();
  
  // Estados para almacenar datos
  const [dataTratamientos, setDataTratamientos] = useState([["Servicio", "Cantidad"]]);
  const [dataIngresos, setDataIngresos] = useState([["Mes", "Ingresos", { role: "annotation" }]]);
  const [dataCitasDia, setDataCitasDia] = useState([["Día", "Cantidad"]]);
  const [proximasCitas, setProximasCitas] = useState([]);
  const [metricasResumen, setMetricasResumen] = useState({
    citasHoy: 0,
    citasSemana: 0,
    nuevoPacientes: 0,
    ingresosSemana: 0,
    tasaOcupacion: 0
  });
  
  // Estados para tipos de gráficas
  const [tratamientosChartType, setTratamientosChartType] = useState("PieChart");
  const [ingresosChartType, setIngresosChartType] = useState("LineChart");
  const [citasDiaChartType, setCitasDiaChartType] = useState("ColumnChart");
  
  // Estados de UI
  const [loading, setLoading] = useState({
    tratamientos: true,
    ingresos: true,
    citasDia: true,
    proximasCitas: true,
    metricas: true
  });
  const [error, setError] = useState({
    tratamientos: null,
    ingresos: null,
    citasDia: null,
    proximasCitas: null,
    metricas: null
  });
  const [tabSelected, setTabSelected] = useState("general");
  
  // Theme para responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Función para obtener los servicios más realizados
  const fetchTratamientos = async () => {
    setLoading(prev => ({ ...prev, tratamientos: true }));
    try {
      const response = await axios.get("https://back-end-4803.onrender.com/api/Graficas/topservicios");
      
      const formattedData = [["Servicio", "Cantidad"]];
      response.data.slice(0, 5).forEach((item) => {
        formattedData.push([item.servicio_nombre, item.total_realizados]);
      });
      
      setDataTratamientos(formattedData);
      setError(prev => ({ ...prev, tratamientos: null }));
    } catch (err) {
      console.error("Error obteniendo datos de tratamientos:", err);
      setError(prev => ({ ...prev, tratamientos: "Error al cargar los servicios odontológicos" }));
      setDataTratamientos([["Servicio", "Cantidad"]]);
    } finally {
      setLoading(prev => ({ ...prev, tratamientos: false }));
    }
  };

  // Función para obtener ingresos mensuales
  const fetchIngresos = async () => {
    setLoading(prev => ({ ...prev, ingresos: true }));
    try {
      const response = await axios.get("https://back-end-4803.onrender.com/api/Graficas/ingresos-mensuales");
      
      const formattedData = [["Mes", "Ingresos", { role: "annotation" }]];
      const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      
      // Asegurarse de que todos los datos son numéricos para el eje Y
      response.data.forEach((item) => {
        const ingreso = Number(item.total_ingresos);
        const mostrarAnotacion = ingreso > 1000 ? ingreso.toString() : null;
        formattedData.push([meses[item.mes - 1], ingreso, mostrarAnotacion]);
      });
      
      setDataIngresos(formattedData);
      setError(prev => ({ ...prev, ingresos: null }));
    } catch (err) {
      console.error("Error obteniendo datos de ingresos:", err);
      setError(prev => ({ ...prev, ingresos: "Error al cargar los datos de ingresos" }));
      setDataIngresos([["Mes", "Ingresos", { role: "annotation" }]]);
    } finally {
      setLoading(prev => ({ ...prev, ingresos: false }));
    }
  };

  // Función para obtener citas por día de la semana
  const fetchCitasPorDia = async () => {
    setLoading(prev => ({ ...prev, citasDia: true }));
    try {
      const response = await axios.get("https://back-end-4803.onrender.com/api/Graficas/citas-por-dia");
      
      const formattedData = [["Día", "Cantidad"]];
      // En MySQL, WEEKDAY devuelve: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo
      const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      
      // Inicializar todos los días con 0 citas
      const citasPorDia = dias.map(dia => [dia, 0]);
      
      // Asignar el total de citas a cada día según el índice del día de la semana
      response.data.forEach((item) => {
        // El dia_semana ya corresponde directamente con el índice en el array dias
        citasPorDia[item.dia_semana][1] = Number(item.total_citas);
      });
      
      // Completar el array de datos formateado
      citasPorDia.forEach(row => {
        formattedData.push(row);
      });
      
      setDataCitasDia(formattedData);
      setError(prev => ({ ...prev, citasDia: null }));
    } catch (err) {
      console.error("Error obteniendo datos de citas por día:", err);
      setError(prev => ({ ...prev, citasDia: "Error al cargar las citas por día" }));
      setDataCitasDia([["Día", "Cantidad"]]);
    } finally {
      setLoading(prev => ({ ...prev, citasDia: false }));
    }
  };

  // Función para obtener las próximas citas
  const fetchProximasCitas = async () => {
    setLoading(prev => ({ ...prev, proximasCitas: true }));
    try {
      const response = await axios.get("https://back-end-4803.onrender.com/api/Graficas/proximas-citas");
      
      const citasFormateadas = response.data.map(cita => ({
        id: cita.id,
        paciente: `${cita.nombre} ${cita.aPaterno}`,
        servicio: cita.servicio_nombre,
        fecha: new Date(cita.fecha_consulta).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        hora: new Date(cita.fecha_consulta).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        estado: cita.estado
      }));
      
      setProximasCitas(citasFormateadas);
      setError(prev => ({ ...prev, proximasCitas: null }));
    } catch (err) {
      console.error("Error obteniendo próximas citas:", err);
      setError(prev => ({ ...prev, proximasCitas: "Error al cargar las próximas citas" }));
      setProximasCitas([]);
    } finally {
      setLoading(prev => ({ ...prev, proximasCitas: false }));
    }
  };

  // Función para obtener métricas de resumen
  const fetchMetricasResumen = async () => {
    setLoading(prev => ({ ...prev, metricas: true }));
    try {
      const response = await axios.get("https://back-end-4803.onrender.com/api/Graficas/metricas-resumen");
      
      setMetricasResumen({
        citasHoy: response.data.citas_hoy,
        citasSemana: response.data.citas_semana,
        nuevoPacientes: response.data.nuevos_pacientes,
        ingresosSemana: response.data.ingresos_semana,
        tasaOcupacion: response.data.tasa_ocupacion
      });
      setError(prev => ({ ...prev, metricas: null }));
    } catch (err) {
      console.error("Error obteniendo métricas de resumen:", err);
      setError(prev => ({ ...prev, metricas: "Error al cargar las métricas del dashboard" }));
      setMetricasResumen({
        citasHoy: 0,
        citasSemana: 0,
        nuevoPacientes: 0,
        ingresosSemana: 0,
        tasaOcupacion: 0
      });
    } finally {
      setLoading(prev => ({ ...prev, metricas: false }));
    }
  };

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      fetchTratamientos();
      fetchIngresos();
      fetchCitasPorDia();
      fetchProximasCitas();
      fetchMetricasResumen();
    };
    
    cargarDatos();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(cargarDatos, 300000);
    return () => clearInterval(interval);
  }, []);

  // Manejadores para cambio de tipo de gráficas
  const handleTratamientosChartChange = (event, newType) => {
    if (newType !== null) {
      setTratamientosChartType(newType);
    }
  };
  
  const handleIngresosChartChange = (event, newType) => {
    if (newType !== null) {
      setIngresosChartType(newType);
    }
  };
  
  const handleCitasDiaChartChange = (event, newType) => {
    if (newType !== null) {
      setCitasDiaChartType(newType);
    }
  };

  // Función para obtener color de chip según el estado de la cita
  const getChipColor = (estado) => {
    switch (estado) {
      case "Confirmada":
        return { bgcolor: "#D1FAE5", color: "#065F46" };
      case "Pendiente":
        return { bgcolor: "#FEF3C7", color: "#92400E" };
      case "Cancelada":
        return { bgcolor: "#FEE2E2", color: "#B91C1C" };
      case "Completada":
        return { bgcolor: "#E0E7FF", color: "#4F46E5" };
      default:
        return { bgcolor: "#F3F4F6", color: "#1F2937" };
    }
  };

  // Vista de Citas
  const CitasView = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Administración de Citas
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Visualiza y gestiona las citas programadas. Monitorea la distribución por días y los estados de las próximas citas.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <CitasDiaView 
            data={dataCitasDia}
            loading={loading.citasDia}
            error={error.citasDia}
            chartType={citasDiaChartType}
            onChartTypeChange={handleCitasDiaChartChange}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: "#1E3A8A", 
                color: "white", 
                padding: 1, 
                borderRadius: 1, 
                mb: 2
              }}>
                <Typography variant="h6">Resumen de Citas</Typography>
                <EventAvailableIcon />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#E0F2FE' }}>
                    <Typography variant="subtitle2" color="text.secondary">Citas Hoy</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0369A1' }}>
                      {metricasResumen.citasHoy}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#DCFCE7' }}>
                    <Typography variant="subtitle2" color="text.secondary">Citas Semana</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#059669' }}>
                      {metricasResumen.citasSemana}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#F0FDF4' }}>
                    <Typography variant="subtitle2" color="text.secondary">Ocupación</Typography>
                    <Box sx={{ position: 'relative', pt: 1 }}>
                      <Box sx={{ 
                        width: '100%', 
                        height: 10, 
                        bgcolor: '#E5E7EB',
                        borderRadius: 5
                      }}>
                        <Box sx={{ 
                          width: `${metricasResumen.tasaOcupacion}%`, 
                          height: '100%', 
                          bgcolor: '#10B981',
                          borderRadius: 5
                        }}/>
                      </Box>
                      <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                        {metricasResumen.tasaOcupacion}%
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: "#1E3A8A", 
                color: "white", 
                padding: 1, 
                borderRadius: 1, 
                mb: 2
              }}>
                <Typography variant="h6">Próximas Citas</Typography>
                <AccessTimeIcon />
              </Box>
              
              {loading.proximasCitas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <CircularProgress />
                </Box>
              ) : error.proximasCitas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
                  <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error.proximasCitas}</Alert>
                </Box>
              ) : (
                <>
                  <Grid container spacing={2}>
                    {proximasCitas.map((cita) => (
                      <Grid item xs={12} md={6} key={cita.id}>
                        <Paper
                          elevation={1}
                          sx={{ 
                            p: 2, 
                            borderLeft: cita.estado === "Confirmada" ? '4px solid #10B981' : 
                                      cita.estado === "Pendiente" ? '4px solid #F59E0B' : 
                                      cita.estado === "Cancelada" ? '4px solid #EF4444' : '4px solid #6B7280',
                            borderRadius: '4px',
                            backgroundColor: '#FAFAFA',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2
                          }}
                        >
                          <Avatar sx={{ 
                            bgcolor: cita.estado === "Confirmada" ? '#D1FAE5' : 
                                    cita.estado === "Pendiente" ? '#FEF3C7' : 
                                    cita.estado === "Cancelada" ? '#FEE2E2' : '#F3F4F6' 
                          }}>
                            {cita.estado === "Confirmada" ? 
                              <EventAvailableIcon sx={{ color: '#065F46' }} /> : 
                              <PriorityHighIcon sx={{ 
                                color: cita.estado === "Pendiente" ? '#92400E' : 
                                      cita.estado === "Cancelada" ? '#B91C1C' : '#1F2937' 
                              }} />
                            }
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {cita.paciente}
                              </Typography>
                              <Chip 
                                label={cita.estado} 
                                size="small"
                                sx={{ 
                                  ...getChipColor(cita.estado),
                                  height: '24px',
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                              <strong>Servicio:</strong> {cita.servicio}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                {cita.fecha}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {cita.hora}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  // Vista de Pacientes
  const PacientesView = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Gestión de Pacientes
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Análisis de los pacientes registrados en el sistema. Visualiza estadísticas y tendencias importantes.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                backgroundColor: "#1E3A8A", 
                color: "white", 
                padding: 1, 
                borderRadius: 1, 
                mb: 2, 
                textAlign: "center" 
              }}>
                <Typography variant="h6">Nuevos Pacientes por Mes</Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 3 
              }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#FFEDD5', mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#F59E0B' }} />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#F59E0B', mb: 1 }}>
                  {metricasResumen.nuevoPacientes || 0}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Nuevos pacientes este mes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                backgroundColor: "#1E3A8A", 
                color: "white", 
                padding: 1, 
                borderRadius: 1, 
                mb: 2, 
                textAlign: "center" 
              }}>
                <Typography variant="h6">Distribución por Tratamientos</Typography>
              </Box>
              {loading.tratamientos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <CircularProgress />
                </Box>
              ) : error.tratamientos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
                  <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error.tratamientos}</Alert>
                </Box>
              ) : (
                <Chart
                  chartType="BarChart"
                  width="100%"
                  height="300px"
                  data={dataTratamientos}
                  options={{
                    title: "Pacientes por Tipo de Tratamiento",
                    backgroundColor: 'transparent',
                    colors: ["#8B5CF6"],
                    legend: { position: "none" },
                    hAxis: { title: "Cantidad" },
                    vAxis: { title: "Tratamiento" },
                    chartArea: { width: '70%', height: '80%' }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  // Vista de Finanzas
  const FinanzasView = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Análisis Financiero
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Información financiera detallada de la clínica. Monitorea ingresos y proyecciones.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <IngresosView 
            data={dataIngresos}
            loading={loading.ingresos}
            error={error.ingresos}
            chartType={ingresosChartType}
            onChartTypeChange={handleIngresosChartChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                backgroundColor: "#1E3A8A", 
                color: "white", 
                padding: 1, 
                borderRadius: 1, 
                mb: 2, 
                textAlign: "center" 
              }}>
                <Typography variant="h6">Ingresos de la Semana</Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 3 
              }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#DBEAFE', mb: 2 }}>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: '#2563EB' }} />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2563EB', mb: 1 }}>
                  ${metricasResumen.ingresosSemana || 0}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Total facturado esta semana
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                backgroundColor: "#1E3A8A", 
                color: "white", 
                padding: 1, 
                borderRadius: 1, 
                mb: 2, 
                textAlign: "center" 
              }}>
                <Typography variant="h6">Servicios Más Rentables</Typography>
              </Box>
              {loading.tratamientos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <CircularProgress />
                </Box>
              ) : error.tratamientos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
                  <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error.tratamientos}</Alert>
                </Box>
              ) : (
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="300px"
                  data={dataTratamientos}
                  options={{
                    title: "Distribución de Ingresos por Servicio",
                    titleTextStyle: {
                      fontSize: 16,
                      bold: true,
                      color: darkMode ? "#f5f5f5" : "#333",
                      fontName: "Roboto"
                    },
                    pieHole: 0.4,
                    backgroundColor: 'transparent',
                    colors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8710D8"],
                    legend: { position: "right" },
                    chartArea: { width: '80%', height: '80%' }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  // Vista General (Dashboard principal)
  const GeneralView = () => (
    <>
      {/* Tarjetas de métricas resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #3B82F6',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Citas Hoy</Typography>
              <Badge 
                badgeContent={metricasResumen.citasHoy > 0 ? metricasResumen.citasHoy : "0"} 
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem', height: '20px', minWidth: '20px' } }}
              >
                <CalendarMonthIcon fontSize="small" color="action" />
              </Badge>
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.citasHoy}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #10B981',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Citas Semana</Typography>
              <EventAvailableIcon fontSize="small" color="action" />
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.citasSemana}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #F59E0B',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Nuevos Pacientes</Typography>
              <PersonIcon fontSize="small" color="action" />
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.nuevoPacientes}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #EC4899',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Ingresos Semana</Typography>
              <AttachMoneyIcon fontSize="small" color="action" />
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                ${metricasResumen.ingresosSemana}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper
            elevation={2}
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              borderTop: '4px solid #8B5CF6',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Ocupación</Typography>
              <TrendingUpIcon fontSize="small" color="action" />
            </Box>
            {loading.metricas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 'auto' }}>
                {metricasResumen.tasaOcupacion}%
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficas y datos principales */}
      <Grid container spacing={3}>
        {/* Gráfica de servicios */}
        <Grid item xs={12} md={6}>
          <TratamientosView 
            data={dataTratamientos}
            loading={loading.tratamientos}
            error={error.tratamientos}
            chartType={tratamientosChartType}
            onChartTypeChange={handleTratamientosChartChange}
          />
        </Grid>

        {/* Gráfica de ingresos */}
        <Grid item xs={12} md={6}>
          <IngresosView 
            data={dataIngresos}
            loading={loading.ingresos}
            error={error.ingresos}
            chartType={ingresosChartType}
            onChartTypeChange={handleIngresosChartChange}
          />
        </Grid>
        
        {/* Gráfica de citas por día */}
        <Grid item xs={12} md={6}>
          <CitasDiaView 
            data={dataCitasDia}
            loading={loading.citasDia}
            error={error.citasDia}
            chartType={citasDiaChartType}
            onChartTypeChange={handleCitasDiaChartChange}
          />
        </Grid>
        
        {/* Próximas Citas */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: "#1E3A8A", 
                color: "white", 
                padding: 1, 
                borderRadius: 1, 
                mb: 2
              }}>
                <Typography variant="h6">Próximas Citas</Typography>
                <AccessTimeIcon />
              </Box>
              
              {loading.proximasCitas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                  <CircularProgress />
                </Box>
              ) : error.proximasCitas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
                  <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error.proximasCitas}</Alert>
                </Box>
              ) : (
                <List sx={{ 
                  width: '100%', 
                  maxHeight: 300,
                  overflow: 'auto',
                  '& .MuiListItem-root': {
                    borderBottom: '1px solid #f0f0f0',
                    py: 1
                  }
                }}>
                  {proximasCitas.map((cita) => (
                    <ListItem 
                      key={cita.id}
                      sx={{ 
                        borderLeft: cita.estado === "Confirmada" ? '3px solid #10B981' : 
                                   cita.estado === "Pendiente" ? '3px solid #F59E0B' : 
                                   cita.estado === "Cancelada" ? '3px solid #EF4444' : '3px solid #6B7280',
                        backgroundColor: '#FAFAFA', 
                        mb: 1,
                        borderRadius: '4px'
                      }}
                      secondaryAction={
                        <IconButton edge="end" aria-label="opciones">
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: cita.estado === "Confirmada" ? '#D1FAE5' : 
                                  cita.estado === "Pendiente" ? '#FEF3C7' : 
                                  cita.estado === "Cancelada" ? '#FEE2E2' : '#F3F4F6' 
                        }}>
                          {cita.estado === "Confirmada" ? 
                            <EventAvailableIcon sx={{ color: '#065F46' }} /> : 
                            <PriorityHighIcon sx={{ 
                              color: cita.estado === "Pendiente" ? '#92400E' : 
                                     cita.estado === "Cancelada" ? '#B91C1C' : '#1F2937' 
                            }} />
                          }
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {cita.paciente}
                            </Typography>
                            <Chip 
                              label={cita.estado} 
                              size="small"
                              sx={{ 
                                ...getChipColor(cita.estado),
                                height: '20px',
                                '& .MuiChip-label': { px: 1, py: 0.5, fontSize: '0.7rem' }
                              }} 
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.primary">
                              {cita.servicio}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              component="span" 
                              color="text.secondary" 
                              sx={{ display: 'block' }}
                            >
                              {cita.fecha} • {cita.hora}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  // Renderizado de la vista según la pestaña seleccionada
  const renderSelectedView = () => {
    switch (tabSelected) {
      case "citas":
        return <CitasView />;
      case "pacientes":
        return <PacientesView />;
      case "finanzas":
        return <FinanzasView />;
      default:
        return <GeneralView />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{ width: "100%", padding: "16px" }}
    >
      <Container maxWidth="lg">
        {/* Encabezado */}
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 3, 
            p: 2, 
            background: "linear-gradient(90deg, #1E3A8A 0%, #2563EB 100%)",
            color: "white",
            borderRadius: "8px",
            textAlign: "center"
          }}
        >
          <Typography variant="h5" component="h1">
            Panel de Control - Odontología Carol
          </Typography>
        </Paper>

        {/* Notificaciones */}
        <Notificaciones />

        {/* Pestañas */}
        <Paper 
          elevation={2} 
          sx={{ 
            mb: 3, 
            borderRadius: '12px', 
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabSelected} 
            onChange={(e, newValue) => setTabSelected(newValue)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile}
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              background: darkMode ? 'rgba(30, 58, 138, 0.1)' : '#F8FAFC',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                py: 2,
                transition: 'all 0.2s ease',
                borderBottom: '1px solid #E2E8F0',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF',
                },
                '&.Mui-selected': {
                  color: '#2563EB',
                }
              }
            }}
          >
            <Tab 
              label="General" 
              value="general" 
              icon={<TrendingUpIcon />} 
              iconPosition="start" 
            />
            <Tab 
              label="Citas" 
              value="citas" 
              icon={<EventAvailableIcon />} 
              iconPosition="start" 
            />
            <Tab 
              label="Pacientes" 
              value="pacientes" 
              icon={<PersonIcon />} 
              iconPosition="start" 
            />
            <Tab 
              label="Finanzas" 
              value="finanzas" 
              icon={<AttachMoneyIcon />} 
              iconPosition="start" 
            />
          </Tabs>
        </Paper>

        {/* Contenido según pestaña seleccionada */}
        {renderSelectedView()}
        
        {/* Pie de página */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Última actualización: {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Container>
    </motion.div>
  );
};

export default Dashboard;