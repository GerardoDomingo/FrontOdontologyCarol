import {
  Avatar, Box, Button, Card, CardContent,
  Chip, CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem,
  Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography, Tooltip, Tabs, Tab, Menu, Divider,
  Drawer, List, ListItem, ListItemIcon, ListItemText, Slider, Switch, FormGroup, FormControlLabel
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Notificaciones from '../../../components/Layout/Notificaciones';
import axios from 'axios';
import format from 'date-fns/format';
import { es } from 'date-fns/locale';
import { addYears, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaEnvelope,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaSyringe,
  FaTimes,
  FaUserCheck,
  FaVenusMars,
  FaList,
  FaTh,
  FaThList,
  FaFilter,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUserAlt,
  FaClock,
  FaAngleDown,
  FaEye,
  FaExclamationTriangle,
  FaBirthdayCake,
  FaCalendarCheck
} from 'react-icons/fa';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const PatientsReport = () => {
  const { isDarkTheme } = useThemeContext();
  
  // Estados principales
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [open, setOpen] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [patientToUpdate, setPatientToUpdate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estado para las notificaciones usando el nuevo componente
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });
  
  // Nuevos estados para filtros avanzados y vistas
  const [viewMode, setViewMode] = useState('table'); // table, grid, detailed
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortConfig, setSortConfig] = useState({ field: 'nombre', direction: 'asc' });
  const [advancedFiltersActive, setAdvancedFiltersActive] = useState(false);
  const [filterChips, setFilterChips] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  // Estado para los filtros
  const [formData, setFormData] = useState({
    lugar: 'todos',
    estado: 'todos',
    genero: 'todos',
    searchTerm: '',
    lugarEspecifico: '',
    hasAlergias: false,
    hasTutor: false,
    dateCreatedStart: '',
    dateCreatedEnd: '',
    sortBy: 'nombre',
    sortDirection: 'asc'
  });

  // Definición de colores
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
    titleColor: isDarkTheme ? '#4B9FFF' : '#0052A3'
  };

  // Manejadores de vista
  const handleViewChange = (view) => {
    setViewMode(view);
  };

  // Manejador para filtros avanzados
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Actualizamos los chips de filtro activos
    updateFilterChips(name, value);
    
    // Aplicamos los filtros
    applyFilters({ ...formData, [name]: value });
  };

  // Manejador para checkbox
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: checked
    }));
    
    // Actualizamos los chips de filtro activos
    updateFilterChips(name, checked ? 'Sí' : 'No');
    
    // Aplicamos los filtros
    applyFilters({ ...formData, [name]: checked });
  };

  // Manejador para filtro de rango de edad
  const handleAgeRangeChange = (event, newValue) => {
    setAgeRange(newValue);
    updateFilterChips('edad', `${newValue[0]}-${newValue[1]} años`);
    applyFilters({ ...formData, ageRange: newValue });
  };

  // Actualizar chips de filtros activos
  const updateFilterChips = (name, value) => {
    // No mostramos chips para los valores predeterminados o vacíos
    if (value === 'todos' || value === '' || value === null) {
      setFilterChips(prev => prev.filter(chip => chip.name !== name));
      return;
    }

    const chipLabels = {
      lugar: 'Lugar',
      estado: 'Estado',
      genero: 'Género',
      hasAlergias: 'Tiene alergias',
      hasTutor: 'Tiene tutor',
      edad: 'Edad',
      dateCreatedStart: 'Desde',
      dateCreatedEnd: 'Hasta'
    };

    // Si ya existe un chip con este nombre, lo actualizamos
    if (filterChips.some(chip => chip.name === name)) {
      setFilterChips(prev => 
        prev.map(chip => 
          chip.name === name ? { ...chip, value } : chip
        )
      );
    } else {
      // Si no existe, lo añadimos
      setFilterChips(prev => [
        ...prev, 
        { name, label: chipLabels[name] || name, value }
      ]);
    }
  };

  // Eliminar chip de filtro
  const handleRemoveChip = (chipName) => {
    setFilterChips(prev => prev.filter(chip => chip.name !== chipName));
    
    // Reseteamos el valor del filtro
    setFormData(prev => ({
      ...prev,
      [chipName]: chipName === 'genero' || chipName === 'lugar' || chipName === 'estado' ? 'todos' : 
                  chipName === 'hasAlergias' || chipName === 'hasTutor' ? false : ''
    }));
    
    // Si es rango de edad, lo reseteamos
    if (chipName === 'edad') {
      setAgeRange([0, 100]);
    }
    
    // Aplicamos los filtros actualizados
    applyFilters({
      ...formData,
      [chipName]: chipName === 'genero' || chipName === 'lugar' || chipName === 'estado' ? 'todos' : 
                  chipName === 'hasAlergias' || chipName === 'hasTutor' ? false : ''
    });
  };

  // Función para ordenar los pacientes
  const handleSort = (field) => {
    const direction = 
      sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    
    setSortConfig({ field, direction });
    
    // Ordenamos los pacientes filtrados
    const sortedPatients = [...filteredPatients].sort((a, b) => {
      if (a[field] === null) return 1;
      if (b[field] === null) return -1;
      
      // Para fechas
      if (field === 'fechaNacimiento' || field === 'fecha_creacion' || field === 'ultima_actualizacion') {
        return direction === 'asc' 
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      }
      
      // Para strings
      if (typeof a[field] === 'string') {
        return direction === 'asc'
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
      
      // Para números
      return direction === 'asc' 
        ? a[field] - b[field]
        : b[field] - a[field];
    });
    
    setFilteredPatients(sortedPatients);
  };

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Error al calcular la edad:', error);
      return null;
    }
  };

  // Función para aplicar todos los filtros
  const applyFilters = (filterData = formData) => {
    let filtered = patients.filter(patient => {
      // Filtro por texto de búsqueda
      const fullName = `${patient.nombre || ''} ${patient.aPaterno || ''} ${patient.aMaterno || ''}`.toLowerCase();
      const matchesSearch = filterData.searchTerm === '' || 
        fullName.includes(filterData.searchTerm.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(filterData.searchTerm.toLowerCase())) ||
        (patient.telefono && patient.telefono.includes(filterData.searchTerm));
      
      // Filtro por estado
      const matchesStatus = filterData.estado === 'todos' || patient.estado === filterData.estado;
      
      // Filtro por lugar
      const matchesLocation = filterData.lugar === 'todos' || patient.lugar === filterData.lugar;
      
      // Filtro por género
      const matchesGenero = filterData.genero === 'todos' || patient.genero === filterData.genero;
      
      // Filtro por alergias
      const matchesAlergias = !filterData.hasAlergias || 
        (patient.alergias && patient.alergias !== '["Ninguna"]' && patient.alergias !== 'Ninguna');
      
      // Filtro por tutor
      const matchesTutor = !filterData.hasTutor || 
        (patient.nombreTutor && patient.nombreTutor.trim() !== '');
      
      // Filtro por rango de edad
      const age = calculateAge(patient.fechaNacimiento);
      const matchesAge = !filterData.ageRange || !age || 
        (age >= filterData.ageRange[0] && age <= filterData.ageRange[1]);
      
      // Filtro por rango de fechas de creación
      const matchesDateRange = true; // Implementado más abajo
      
      return matchesSearch && matchesStatus && matchesLocation && 
             matchesGenero && matchesAlergias && matchesTutor && 
             matchesAge && matchesDateRange;
    });
    
    // Si hay filtros de fecha aplicamos aquí (para simplificar la lógica)
    if (filterData.dateCreatedStart || filterData.dateCreatedEnd) {
      filtered = filtered.filter(patient => {
        if (!patient.fecha_creacion) return false;
        
        const creationDate = new Date(patient.fecha_creacion);
        let matchesStart = true;
        let matchesEnd = true;
        
        if (filterData.dateCreatedStart) {
          const startDate = new Date(filterData.dateCreatedStart);
          matchesStart = creationDate >= startDate;
        }
        
        if (filterData.dateCreatedEnd) {
          const endDate = new Date(filterData.dateCreatedEnd);
          // Ajustamos al final del día
          endDate.setHours(23, 59, 59, 999);
          matchesEnd = creationDate <= endDate;
        }
        
        return matchesStart && matchesEnd;
      });
    }
    
    // Aplicamos la ordenación actual
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        if (a[sortConfig.field] === null) return 1;
        if (b[sortConfig.field] === null) return -1;
        
        // Para fechas
        if (['fechaNacimiento', 'fecha_creacion', 'ultima_actualizacion'].includes(sortConfig.field)) {
          return sortConfig.direction === 'asc' 
            ? new Date(a[sortConfig.field]) - new Date(b[sortConfig.field])
            : new Date(b[sortConfig.field]) - new Date(a[sortConfig.field]);
        }
        
        // Para strings
        if (typeof a[sortConfig.field] === 'string') {
          return sortConfig.direction === 'asc'
            ? a[sortConfig.field].localeCompare(b[sortConfig.field])
            : b[sortConfig.field].localeCompare(a[sortConfig.field]);
        }
        
        // Para números
        return sortConfig.direction === 'asc' 
          ? a[sortConfig.field] - b[sortConfig.field]
          : b[sortConfig.field] - a[sortConfig.field];
      });
    }
    
    setFilteredPatients(filtered);
    setAdvancedFiltersActive(
      filterData.genero !== 'todos' || 
      filterData.hasAlergias || 
      filterData.hasTutor || 
      filterData.dateCreatedStart || 
      filterData.dateCreatedEnd || 
      (filterData.ageRange && (filterData.ageRange[0] > 0 || filterData.ageRange[1] < 100))
    );
  };
  
  // Función para limpiar todos los filtros
  const handleClearFilters = () => {
    setFormData({
      lugar: 'todos',
      estado: 'todos',
      genero: 'todos',
      searchTerm: '',
      lugarEspecifico: '',
      hasAlergias: false,
      hasTutor: false,
      dateCreatedStart: '',
      dateCreatedEnd: '',
      sortBy: 'nombre',
      sortDirection: 'asc'
    });
    setAgeRange([0, 100]);
    setFilterChips([]);
    setFilteredPatients(patients);
    setSortConfig({ field: 'nombre', direction: 'asc' });
    setSearchTerm('');
    setStatusFilter('todos');
  };

  // Cargar datos al inicio
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/reportes/pacientes');
        setPatients(response.data);
        setFilteredPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setNotification({
          open: true,
          message: 'Error al cargar los pacientes',
          type: 'error'
        });
      }
    };
    fetchPatients();
  }, []);

  // Sincronizar searchTerm y statusFilter con formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      searchTerm: searchTerm,
      estado: statusFilter
    }));
  }, [searchTerm, statusFilter]);

  const formatDate = (date) => {
    if (!date) return 'No disponible';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };

  const handleOpenModal = (patient) => {
    setSelectedPatient(patient);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPatient(null);
  };

  // Función para formatear las alergias
  const formatAlergias = (alergias) => {
    if (!alergias) return 'Ninguna alergia';
    try {
      // Si es un string con formato de array, intentar parsearlo
      const alergiasArray = typeof alergias === 'string' ?
        JSON.parse(alergias.replace(/'/g, '"')) : alergias;
      return Array.isArray(alergiasArray) ?
        alergiasArray.join(', ') : 'Ninguna alergia';
    } catch {
      // Si hay error en el parsing, mostrar el texto tal cual
      return alergias;
    }
  };

  // Función para manejar la búsqueda
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    
    // Actualizar formData y aplicar filtros
    const newFormData = {
      ...formData,
      searchTerm: searchValue
    };
    setFormData(newFormData);
    applyFilters(newFormData);
  };

  // Función para manejar el filtro de estado
  const handleStatusFilter = (event) => {
    const status = event.target.value;
    setStatusFilter(status);
    
    // Actualizar formData y aplicar filtros
    const newFormData = {
      ...formData,
      estado: status
    };
    setFormData(newFormData);
    applyFilters(newFormData);
    
    // Actualizamos los chips de filtro
    if (status !== 'todos') {
      updateFilterChips('estado', status);
    } else {
      setFilterChips(prev => prev.filter(chip => chip.name !== 'estado'));
    }
  };
  
  // Estado chip colors
  const getStatusColor = (status) => {
    const statusColors = {
      'Activo': {
        bg: '#E6F4EA', // Verde muy suave
        text: '#1B873F', // Verde oscuro
        border: '#A6E9B9' // Verde medio
      },
      'Inactivo': {
        bg: '#FEE2E2', // Rojo muy suave
        text: '#DC2626', // Rojo oscuro
        border: '#FECACA' // Rojo medio
      },
      'Pendiente': {
        bg: '#FEF3C7', // Amarillo muy suave
        text: '#D97706', // Amarillo oscuro
        border: '#FDE68A' // Amarillo medio
      }
    };

    return statusColors[status] || {
      bg: '#F1F5F9', // Gris muy suave por defecto
      text: '#64748B', // Gris oscuro por defecto
      border: '#CBD5E1' // Gris medio por defecto
    };
  };

  // Función para normalizar texto
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Función para cambiar estado
  const handleStatusChange = async (patient) => {
    if (!patient) {
      console.error('No se proporcionó información del paciente');
      return;
    }
    setPatientToUpdate(patient);
    setOpenConfirmDialog(true);
  };

  // Confirmar cambio de estado
  const handleConfirmStatusChange = async () => {
    const expectedName = `${patientToUpdate.nombre} ${patientToUpdate.aPaterno}`;
    const normalizedExpected = normalizeText(expectedName);
    const normalizedInput = normalizeText(confirmName);

    if (normalizedInput !== normalizedExpected) {
      setNotification({
        open: true,
        message: 'Por favor, escriba el nombre y apellido del paciente correctamente',
        type: 'error'
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (!patientToUpdate?.id) {
        throw new Error('ID de paciente no válido');
      }

      const response = await axios.put(
        `https://back-end-4803.onrender.com/api/reportes/pacientes/${patientToUpdate.id}/status`,
        { estado: 'Inactivo' },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedPatients = patients.map(p =>
          p.id === patientToUpdate.id ? { ...p, estado: 'Inactivo' } : p
        );
        setPatients(updatedPatients);
        
        // Aplicamos los filtros actuales a los datos actualizados
        applyFilters();
        
        setNotification({
          open: true,
          message: 'Paciente dado de baja exitosamente',
          type: 'success'
        });
      } else {
        throw new Error(response.data.message || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: 'Error al dar de baja al paciente',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
      setOpenConfirmDialog(false);
      setConfirmName('');
      setPatientToUpdate(null);
    }
  };

  // Función para renderizar la vista de tarjetas
  const renderCardView = () => {
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {filteredPatients.map((patient, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={patient.id || index}>
            <Card 
              sx={{
                height: '100%',
                backgroundColor: colors.paper,
                borderRadius: '12px',
                boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDarkTheme ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)',
                },
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  right: 16,
                }}
              >
                <Chip
                  label={patient.estado || 'No definido'}
                  sx={{
                    backgroundColor: getStatusColor(patient.estado).bg,
                    color: getStatusColor(patient.estado).text,
                    border: `1px solid ${getStatusColor(patient.estado).border}`,
                    fontWeight: '500',
                    fontSize: '0.75rem',
                    height: '24px',
                    '&:hover': {
                      backgroundColor: getStatusColor(patient.estado).bg,
                    }
                  }}
                />
              </Box>
              
              <CardContent sx={{ pt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 70,
                      height: 70,
                      bgcolor: colors.primary,
                      fontSize: '1.5rem'
                    }}
                  >
                    {patient.nombre ? patient.nombre.charAt(0) : '?'}
                  </Avatar>
                </Box>
                
                <Typography 
                  variant="h6" 
                  align="center" 
                  sx={{ 
                    color: colors.text,
                    fontWeight: 600,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {`${patient.nombre || ''} ${patient.aPaterno || ''}`}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FaPhone style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: colors.secondaryText,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {patient.telefono || 'No disponible'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FaEnvelope style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: colors.secondaryText,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {patient.email || 'No disponible'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FaMapMarkerAlt style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: colors.secondaryText,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {patient.lugar || 'No disponible'}
                    </Typography>
                  </Box>
                  
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Tooltip title="Ver detalles">
                    <IconButton
                      onClick={() => handleOpenModal(patient)}
                      sx={{
                        backgroundColor: colors.primary,
                        '&:hover': {
                          backgroundColor: colors.hover,
                        },
                        padding: '6px',
                        borderRadius: '50%',
                      }}
                    >
                      <FaInfoCircle style={{ fontSize: '16px', color: 'white' }} />
                    </IconButton>
                  </Tooltip>
                  
                  {patient.estado === 'Activo' && (
                    <Tooltip title="Dar de baja">
                      <IconButton
                        onClick={() => handleStatusChange(patient)}
                        sx={{
                          backgroundColor: '#f44336',
                          '&:hover': {
                            backgroundColor: '#d32f2f',
                          },
                          padding: '6px',
                          borderRadius: '50%',
                        }}
                      >
                        <FaTimes style={{ fontSize: '16px', color: 'white' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Función para renderizar la vista detallada
  const renderDetailedView = () => {
    return (
      <Box sx={{ mt: 2 }}>
        {filteredPatients.map((patient, index) => (
          <Paper 
            key={patient.id || index}
            sx={{ 
              mb: 2, 
              p: 3, 
              backgroundColor: colors.paper,
              borderRadius: '12px',
              boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: colors.primary,
                    mr: 2
                  }}
                >
                  {patient.nombre ? patient.nombre.charAt(0) : '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 'bold' }}>
                    {`${patient.nombre || ''} ${patient.aPaterno || ''} ${patient.aMaterno || ''}`}
                  </Typography>
                  <Chip
                    label={patient.estado || 'No definido'}
                    sx={{
                      backgroundColor: getStatusColor(patient.estado).bg,
                      color: getStatusColor(patient.estado).text,
                      border: `1px solid ${getStatusColor(patient.estado).border}`,
                      fontWeight: '500',
                      fontSize: '0.75rem',
                      height: '24px',
                      mt: 1,
                      '&:hover': {
                        backgroundColor: getStatusColor(patient.estado).bg,
                      }
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <FaEnvelope style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {patient.email || 'No disponible'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <FaPhone style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {patient.telefono || 'No disponible'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FaMapMarkerAlt style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {patient.lugar || 'No disponible'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <FaCalendarAlt style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {patient.fechaNacimiento ? formatDate(patient.fechaNacimiento) : 'No disponible'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <FaVenusMars style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {patient.genero || 'No disponible'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FaSyringe style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {formatAlergias(patient.alergias)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Ver detalles">
                    <IconButton
                      onClick={() => handleOpenModal(patient)}
                      sx={{
                        backgroundColor: colors.primary,
                        '&:hover': {
                          backgroundColor: colors.hover,
                        },
                        padding: '8px',
                        borderRadius: '50%',
                      }}
                    >
                      <FaInfoCircle style={{ fontSize: '18px', color: 'white' }} />
                    </IconButton>
                  </Tooltip>
                  
                  {patient.estado === 'Activo' && (
                    <Tooltip title="Dar de baja">
                      <IconButton
                        onClick={() => handleStatusChange(patient)}
                        sx={{
                          backgroundColor: '#f44336',
                          '&:hover': {
                            backgroundColor: '#d32f2f',
                          },
                          padding: '8px',
                          borderRadius: '50%',
                        }}
                      >
                        <FaTimes style={{ fontSize: '18px', color: 'white' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    );
  };

  // Función para renderizar la vista de tabla
  const renderTableView = () => {
    return (
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
          backgroundColor: colors.paper,
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: colors.tableBackground }}>
            <TableRow>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>#</TableCell>
              <TableCell 
                sx={{ color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('nombre')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Nombre
                  {sortConfig.field === 'nombre' && (
                    sortConfig.direction === 'asc' ? 
                      <FaSortAmountUp style={{ marginLeft: 8, fontSize: '0.875rem' }} /> : 
                      <FaSortAmountDown style={{ marginLeft: 8, fontSize: '0.875rem' }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Correo</TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Teléfono</TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell 
                sx={{ color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('fecha_creacion')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Fecha de Registro
                  {sortConfig.field === 'fecha_creacion' && (
                    sortConfig.direction === 'asc' ? 
                      <FaSortAmountUp style={{ marginLeft: 8, fontSize: '0.875rem' }} /> : 
                      <FaSortAmountDown style={{ marginLeft: 8, fontSize: '0.875rem' }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient, index) => (
              <TableRow key={index} sx={{
                '&:hover': {
                  backgroundColor: colors.hover
                },
                transition: 'background-color 0.2s ease'
              }}>
                <TableCell sx={{ color: colors.text }}>{index + 1}</TableCell>
                <TableCell sx={{ color: colors.text }}>
                  {`${patient.nombre || ''} ${patient.aPaterno || ''} ${patient.aMaterno || ''}`}
                </TableCell>
                <TableCell sx={{ color: colors.text }}>{patient.email || 'No disponible'}</TableCell>
                <TableCell sx={{ color: colors.text }}>{patient.telefono || 'No disponible'}</TableCell>
                <TableCell>
                  <Chip
                    label={patient.estado || 'No definido'}
                    sx={{
                      backgroundColor: getStatusColor(patient.estado).bg,
                      color: getStatusColor(patient.estado).text,
                      border: `1px solid ${getStatusColor(patient.estado).border}`,
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      height: '28px',
                      '&:hover': {
                        backgroundColor: getStatusColor(patient.estado).bg,
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: colors.text }}>
                  {patient.fecha_creacion ?
                    format(new Date(patient.fecha_creacion), 'dd/MM/yyyy HH:mm', { locale: es })
                    : 'No disponible'
                  }
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver detalles" arrow>
                      <IconButton
                        onClick={() => handleOpenModal(patient)}
                        sx={{
                          backgroundColor: colors.primary,
                          '&:hover': {
                            backgroundColor: colors.hover,
                          },
                          padding: '8px',
                          borderRadius: '50%',
                        }}
                      >
                        <FaInfoCircle style={{ fontSize: '20px', color: 'white' }} />
                      </IconButton>
                    </Tooltip>

                    {patient.estado === 'Activo' && (
                      <Tooltip title="Dar de baja" arrow>
                        <IconButton
                          onClick={() => handleStatusChange(patient)}
                          sx={{
                            backgroundColor: '#f44336',
                            '&:hover': {
                              backgroundColor: '#d32f2f',
                            },
                            padding: '8px',
                            borderRadius: '50%',
                          }}
                        >
                          <FaTimes style={{ fontSize: '20px', color: 'white' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Panel de filtros avanzados
  const renderAdvancedFiltersPanel = () => (
    <Dialog
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.background,
          color: colors.text,
          borderRadius: '12px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: colors.titleColor, fontWeight: 'bold' }}>
            Filtros Avanzados
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: colors.text }}>
            <FaTimes />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider sx={{ backgroundColor: colors.divider }} />
      
      <DialogContent sx={{ p: 3 }}>
        {/* Filtro por Género */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 500 }}>Género</Typography>
          <FormControl fullWidth>
            <Select
              value={formData.genero}
              name="genero"
              onChange={handleFormChange}
              displayEmpty
              sx={{
                backgroundColor: colors.paper,
                color: colors.text,
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.inputBorder,
                },
              }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Femenino">Femenino</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Filtro por rango de fechas */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 500 }}>
            Fecha de registro
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Desde</Typography>
              <TextField
                type="date"
                name="dateCreatedStart"
                value={formData.dateCreatedStart}
                onChange={handleFormChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: colors.paper,
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.inputBorder,
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Hasta</Typography>
              <TextField
                type="date"
                name="dateCreatedEnd"
                value={formData.dateCreatedEnd}
                onChange={handleFormChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: colors.paper,
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.inputBorder,
                    },
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Filtro por rango de edad */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 500 }}>
            Rango de edad: {ageRange[0]} - {ageRange[1]} años
          </Typography>
          <Slider
            value={ageRange}
            onChange={handleAgeRangeChange}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            sx={{ color: colors.primary }}
          />
        </Box>
        
        {/* Otras opciones de filtro */}
        <Box sx={{ mb: 3 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch 
                  checked={formData.hasAlergias} 
                  onChange={handleCheckboxChange} 
                  name="hasAlergias" 
                  color="primary"
                />
              }
              label="Sólo pacientes con alergias"
              sx={{ color: colors.text, mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch 
                  checked={formData.hasTutor} 
                  onChange={handleCheckboxChange} 
                  name="hasTutor" 
                  color="primary"
                />
              }
              label="Sólo pacientes con tutor"
              sx={{ color: colors.text }}
            />
          </FormGroup>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="outlined"
          onClick={handleClearFilters}
          sx={{ color: colors.primary, borderColor: colors.primary }}
        >
          LIMPIAR FILTROS
        </Button>
        <Button
          variant="contained"
          onClick={() => setDrawerOpen(false)}
          sx={{ backgroundColor: colors.primary }}
        >
          APLICAR FILTROS
        </Button>
      </DialogActions>
    </Dialog>
  );

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
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            Gestión de Pacientes
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Vista de tabla">
              <IconButton 
                onClick={() => handleViewChange('table')}
                sx={{ 
                  color: viewMode === 'table' ? 'white' : colors.text,
                  backgroundColor: viewMode === 'table' ? colors.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: viewMode === 'table' ? colors.primary : colors.hover
                  }
                }}
              >
                <FaList />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Vista de tarjetas">
              <IconButton 
                onClick={() => handleViewChange('grid')}
                sx={{ 
                  color: viewMode === 'grid' ? 'white' : colors.text,
                  backgroundColor: viewMode === 'grid' ? colors.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: viewMode === 'grid' ? colors.primary : colors.hover
                  }
                }}
              >
                <FaTh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Vista detallada">
              <IconButton 
                onClick={() => handleViewChange('detailed')}
                sx={{ 
                  color: viewMode === 'detailed' ? 'white' : colors.text,
                  backgroundColor: viewMode === 'detailed' ? colors.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: viewMode === 'detailed' ? colors.primary : colors.hover
                  }
                }}
              >
                <FaThList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filtros y Búsqueda */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Filtro de Búsqueda */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar paciente"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaSearch color={colors.primary} />
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

          {/* Filtro por Estado */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por estado</InputLabel>
              <Select
                value={statusFilter}
                label="Filtrar por estado"
                onChange={handleStatusFilter}
                sx={{
                  backgroundColor: colors.paper,
                  color: colors.text,
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.inputBorder,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por Lugar */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por lugar</InputLabel>
              <Select
                value={formData.lugar}
                label="Filtrar por lugar"
                onChange={handleFormChange}
                name="lugar"
                sx={{
                  backgroundColor: colors.paper,
                  color: colors.text,
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.inputBorder,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="Ixcatlan">Ixcatlan</MenuItem>
                <MenuItem value="Tepemaxac">Tepemaxac</MenuItem>
                <MenuItem value="Pastora">Pastora</MenuItem>
                <MenuItem value="Ahuacatitla">Ahuacatitla</MenuItem>
                <MenuItem value="Tepeica">Tepeica</MenuItem>
                <MenuItem value="Axcaco">Axcaco</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
            {formData.lugar === 'Otro' && (
              <TextField
                fullWidth
                label="Especifica el lugar"
                variant="outlined"
                value={formData.lugarEspecifico}
                onChange={(e) => setFormData({ ...formData, lugarEspecifico: e.target.value })}
                sx={{
                  marginTop: 2,
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
            )}
          </Grid>
        </Grid>
        
        {/* Botones de acciones y filtros */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          {/* Información de resultados */}
          <Typography sx={{ color: colors.secondaryText }}>
            {filteredPatients.length} {filteredPatients.length === 1 ? 'paciente' : 'pacientes'} encontrados
          </Typography>
          
          {/* Botones de acciones */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined"
              startIcon={<FaFilter />}
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                color: colors.primary, 
                borderColor: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  backgroundColor: colors.hover
                }
              }}
            >
              {advancedFiltersActive ? 'Filtros Activos' : 'Filtros Avanzados'}
            </Button>
            
            {filterChips.length > 0 && (
              <Button 
                variant="text"
                onClick={handleClearFilters}
                sx={{ 
                  color: colors.secondaryText
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Chips de filtros activos */}
        {filterChips.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {filterChips.map((chip) => (
              <Chip
                key={chip.name}
                label={`${chip.label}: ${chip.value}`}
                onDelete={() => handleRemoveChip(chip.name)}
                sx={{
                  backgroundColor: colors.hover,
                  color: colors.text,
                  '& .MuiChip-deleteIcon': {
                    color: colors.text,
                    '&:hover': {
                      color: '#f44336'
                    }
                  }
                }}
              />
            ))}
          </Box>
        )}
        
        {/* Mostrar vista según la selección */}
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'grid' && renderCardView()}
        {viewMode === 'detailed' && renderDetailedView()}
        
        {/* Panel de filtros avanzados */}
        {renderAdvancedFiltersPanel()}
        
        {/* Diálogo de confirmación */}
        <Dialog
          open={openConfirmDialog}
          onClose={() => !isProcessing && setOpenConfirmDialog(false)}
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              color: colors.text
            }
          }}
        >
          <DialogTitle sx={{ color: colors.primary }}>
            Confirmar cambio de estado
          </DialogTitle>
          <DialogContent>
            <Box sx={{ color: colors.text, mb: 2 }}>
              Por favor escriba el nombre y apellido del paciente:
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
              {patientToUpdate ? `${patientToUpdate.nombre} ${patientToUpdate.aPaterno}` : ''}
            </Typography>
            <TextField
              fullWidth
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              label="Nombre y apellido"
              variant="outlined"
              disabled={isProcessing}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.text,
                  '& fieldset': {
                    borderColor: colors.inputBorder,
                  }
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenConfirmDialog(false);
                setConfirmName('');
              }}
              disabled={isProcessing}
              sx={{ color: colors.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              variant="contained"
              color="error"
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isProcessing ? 'Procesando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Diálogo de detalles del paciente */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              color: colors.text
            }
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: colors.primary
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Información del Paciente
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{ color: colors.text }}
            >
              <FaTimes />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedPatient && (
              <Box sx={{ p: 2 }}>
                <Card sx={{
                  mb: 3,
                  boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  backgroundColor: colors.paper
                }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          sx={{
                            width: 100,
                            height: 100,
                            bgcolor: colors.primary,
                            color: '#fff',
                            fontSize: '2rem'
                          }}
                        >
                          {selectedPatient.nombre.charAt(0)}
                        </Avatar>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: colors.primary, mb: 2 }}>
                          {`${selectedPatient.nombre} ${selectedPatient.aPaterno} ${selectedPatient.aMaterno}`}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <FaPhone style={{ marginRight: 8, color: colors.primary }} />
                              <Typography sx={{ color: colors.text }}>{selectedPatient.telefono}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <FaEnvelope style={{ marginRight: 8, color: colors.primary }} />
                              <Typography sx={{ color: colors.text }}>{selectedPatient.email}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <FaCalendarAlt style={{ marginRight: 8, color: colors.primary }} />
                              <Typography sx={{ color: colors.text }}>
                                {selectedPatient.fechaNacimiento ?
                                  formatDate(selectedPatient.fechaNacimiento)
                                  : 'No disponible'
                                }
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <FaVenusMars style={{ marginRight: 8, color: colors.primary }} />
                              <Typography sx={{ color: colors.text }}>{selectedPatient.genero}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FaMapMarkerAlt style={{ marginRight: 8, color: colors.primary }} />
                      <Typography sx={{ color: colors.text }}>{selectedPatient.lugar}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FaSyringe style={{ marginRight: 8, color: colors.primary }} />
                      <Typography sx={{ color: colors.text }}>
                        {formatAlergias(selectedPatient.alergias)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FaUserCheck style={{ marginRight: 8, color: colors.primary }} />
                      <Typography sx={{ color: colors.text }}>{selectedPatient.estado}</Typography>
                    </Box>
                  </Grid>
                  {selectedPatient.nombreTutor && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FaUserAlt style={{ marginRight: 8, color: colors.primary }} />
                        <Typography sx={{ color: colors.text }}>
                          Tutor: {selectedPatient.nombreTutor}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FaCalendarCheck style={{ marginRight: 8, color: colors.primary }} />
                      <Typography sx={{ color: colors.text }}>
                        Última actualización: {selectedPatient.ultima_actualizacion ?
                          format(new Date(selectedPatient.ultima_actualizacion), 'dd/MM/yyyy HH:mm', { locale: es })
                          : 'No disponible'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Componente de notificaciones */}
        <Notificaciones
          open={notification.open}
          message={notification.message}
          type={notification.type}
          handleClose={() => setNotification({ ...notification, open: false })}
        />
      </Box>
    </Card>
  );
};

export default PatientsReport;