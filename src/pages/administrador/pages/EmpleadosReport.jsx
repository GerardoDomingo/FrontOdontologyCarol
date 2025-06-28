import {
  Avatar, Box, Button, Card, CardContent,
  Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, Grid, 
  IconButton, InputAdornment, InputLabel, MenuItem,
  Paper, Select, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, 
  Typography, Tooltip, Tabs, Tab, Divider, Fade,
  Slide, Zoom, useTheme, alpha, Stack
} from '@mui/material';
import Notificaciones from '../../../components/Layout/Notificaciones';
import EmpleadoFormWizard from './EmpleadoForm';
import axios from 'axios';
import format from 'date-fns/format';
import { es } from 'date-fns/locale';
import React, { useEffect, useState, forwardRef } from 'react';
import {
  FaEnvelope, FaInfoCircle, FaPhone, FaSearch,
  FaTimes, FaUserCheck, FaList, FaTh, FaThList,
  FaFilter, FaSortAmountDown, FaSortAmountUp,
  FaBriefcase, FaIdCard, FaUserAlt, FaClock,
  FaPlus, FaEdit, FaUsers, FaTrash, FaCheck,
  FaExclamationTriangle, FaCalendarAlt
} from 'react-icons/fa';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Transición para diálogos
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Componente principal de gestión de empleados
const EmployeeManagement = () => {
  const { isDarkTheme } = useThemeContext();
  
  // Estados principales
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [positionFilter, setPositionFilter] = useState('todos');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [employeeToUpdate, setEmployeeToUpdate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estado para notificaciones
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });
  
  // Estados para vistas y filtros avanzados
  const [viewMode, setViewMode] = useState('table');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: 'nombre', direction: 'asc' });
  const [advancedFiltersActive, setAdvancedFiltersActive] = useState(false);
  const [filterChips, setFilterChips] = useState([]);
  
  // Estado para formulario de filtros
  const [formData, setFormData] = useState({
    puesto: 'todos',
    estado: 'todos',
    searchTerm: '',
    dateCreatedStart: '',
    dateCreatedEnd: '',
    sortBy: 'nombre',
    sortDirection: 'asc'
  });

  // Formulario para añadir/editar empleados
  const [employeeForm, setEmployeeForm] = useState({
    id: null,
    nombre: '',
    aPaterno: '',
    aMaterno: '',
    email: '',
    password: '',
    puesto: '',
    estado: 'activo',
    imagen: '',
    telefono: ''
  });

  // Opciones de puestos disponibles
  const positionOptions = [
    'Odontólogo',
    'Recepcionista',
    'Asistente',
    'Enfermero',
    'Limpieza',
  ];

  // Definición de colores basados en el tema
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
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
    dialogBackground: isDarkTheme ? '#1D2B3A' : '#FFFFFF',
    cardDark: isDarkTheme ? '#1A2433' : '#F1F5F9'
  };

  // Manejadores de vista
  const handleViewChange = (view) => {
    setViewMode(view);
  };

  // Manejador para filtros
  const handleFilterChange = (e) => {
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

  // Actualizar chips de filtros activos
  const updateFilterChips = (name, value) => {
    // No mostramos chips para los valores predeterminados o vacíos
    if (value === 'todos' || value === '' || value === null) {
      setFilterChips(prev => prev.filter(chip => chip.name !== name));
      return;
    }

    const chipLabels = {
      puesto: 'Puesto',
      estado: 'Estado',
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
      [chipName]: chipName === 'puesto' || chipName === 'estado' ? 'todos' : ''
    }));
    
    // Aplicamos los filtros actualizados
    applyFilters({
      ...formData,
      [chipName]: chipName === 'puesto' || chipName === 'estado' ? 'todos' : ''
    });
  };

  // Función para ordenar los empleados
  const handleSort = (field) => {
    const direction = 
      sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    
    setSortConfig({ field, direction });
    
    // Ordenamos los empleados filtrados
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
      if (a[field] === null) return 1;
      if (b[field] === null) return -1;
      
      // Para fechas
      if (field === 'fecha_creacion' || field === 'ultima_actualizacion') {
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
    
    setFilteredEmployees(sortedEmployees);
  };

  // Función para aplicar todos los filtros
  const applyFilters = (filterData = formData) => {
    let filtered = employees.filter(employee => {
      // Filtro por texto de búsqueda
      const fullName = `${employee.nombre || ''} ${employee.aPaterno || ''} ${employee.aMaterno || ''}`.toLowerCase();
      const matchesSearch = filterData.searchTerm === '' || 
        fullName.includes(filterData.searchTerm.toLowerCase()) ||
        (employee.email && employee.email.toLowerCase().includes(filterData.searchTerm.toLowerCase())) ||
        (employee.telefono && employee.telefono.includes(filterData.searchTerm));
      
      // Filtro por estado
      const matchesStatus = filterData.estado === 'todos' || employee.estado === filterData.estado;
      
      // Filtro por puesto
      const matchesPosition = filterData.puesto === 'todos' || employee.puesto === filterData.puesto;
      
      // Filtro por rango de fechas de creación
      const matchesDateRange = true; // Implementado más abajo
      
      return matchesSearch && matchesStatus && matchesPosition && matchesDateRange;
    });
    
    // Si hay filtros de fecha aplicamos aquí
    if (filterData.dateCreatedStart || filterData.dateCreatedEnd) {
      filtered = filtered.filter(employee => {
        if (!employee.fecha_creacion) return false;
        
        const creationDate = new Date(employee.fecha_creacion);
        let matchesStart = true;
        let matchesEnd = true;
        
        if (filterData.dateCreatedStart) {
          const startDate = new Date(filterData.dateCreatedStart);
          matchesStart = creationDate >= startDate;
        }
        
        if (filterData.dateCreatedEnd) {
          const endDate = new Date(filterData.dateCreatedEnd);
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
        
        if (['fecha_creacion', 'ultima_actualizacion'].includes(sortConfig.field)) {
          return sortConfig.direction === 'asc' 
            ? new Date(a[sortConfig.field]) - new Date(b[sortConfig.field])
            : new Date(b[sortConfig.field]) - new Date(a[sortConfig.field]);
        }
        
        if (typeof a[sortConfig.field] === 'string') {
          return sortConfig.direction === 'asc'
            ? a[sortConfig.field].localeCompare(b[sortConfig.field])
            : b[sortConfig.field].localeCompare(a[sortConfig.field]);
        }
        
        return sortConfig.direction === 'asc' 
          ? a[sortConfig.field] - b[sortConfig.field]
          : b[sortConfig.field] - a[sortConfig.field];
      });
    }
    
    setFilteredEmployees(filtered);
    setAdvancedFiltersActive(
      filterData.puesto !== 'todos' || 
      filterData.dateCreatedStart || 
      filterData.dateCreatedEnd
    );
  };
  
  // Función para limpiar todos los filtros
  const handleClearFilters = () => {
    setFormData({
      puesto: 'todos',
      estado: 'todos',
      searchTerm: '',
      dateCreatedStart: '',
      dateCreatedEnd: '',
      sortBy: 'nombre',
      sortDirection: 'asc'
    });
    setFilterChips([]);
    setFilteredEmployees(employees);
    setSortConfig({ field: 'nombre', direction: 'asc' });
    setSearchTerm('');
    setStatusFilter('todos');
    setPositionFilter('todos');
  };

  // Cargar datos de empleados
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Endpoint para obtener todos los empleados
        const response = await axios.get('https://back-end-4803.onrender.com/api/empleados/all');
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setNotification({
          open: true,
          message: 'Error al cargar los empleados',
          type: 'error'
        });
        
        // En caso de error, mostramos mensaje pero no usamos datos de ejemplo
        setEmployees([]);
        setFilteredEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  // Sincronizar searchTerm y statusFilter con formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      searchTerm: searchTerm,
      estado: statusFilter,
      puesto: positionFilter
    }));
  }, [searchTerm, statusFilter, positionFilter]);

  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return 'No disponible';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Abrir modal de detalles
  const handleOpenDetails = (employee) => {
    setSelectedEmployee(employee);
    setDetailsOpen(true);
  };

  // Cerrar modal de detalles
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEmployee(null);
  };

  // Manejar búsqueda
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

  // Manejar filtro de estado
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

  // Manejar filtro de puesto
  const handlePositionFilter = (event) => {
    const position = event.target.value;
    setPositionFilter(position);
    
    // Actualizar formData y aplicar filtros
    const newFormData = {
      ...formData,
      puesto: position
    };
    setFormData(newFormData);
    applyFilters(newFormData);
    
    // Actualizamos los chips de filtro
    if (position !== 'todos') {
      updateFilterChips('puesto', position);
    } else {
      setFilterChips(prev => prev.filter(chip => chip.name !== 'puesto'));
    }
  };
  
  // Colores para estados
  const getStatusColor = (status) => {
    const statusColors = {
      'activo': {
        bg: '#E6F4EA',
        text: '#1B873F',
        border: '#A6E9B9'
      },
      'inactivo': {
        bg: '#FEE2E2',
        text: '#DC2626',
        border: '#FECACA'
      }
    };

    return statusColors[status] || {
      bg: '#F1F5F9',
      text: '#64748B',
      border: '#CBD5E1'
    };
  };

  // Función para cambiar estado
  const handleStatusChange = (employee) => {
    setEmployeeToUpdate(employee);
    setConfirmDialogOpen(true);
  };

  // Confirmar cambio de estado (actualizado sin necesidad de recargar)
  const handleConfirmStatusChange = async () => {
    setIsProcessing(true);
    try {
      if (!employeeToUpdate?.id) {
        throw new Error('ID de empleado no válido');
      }

      // Nuevo estado que queremos aplicar
      const newStatus = employeeToUpdate.estado === 'activo' ? 'inactivo' : 'activo';

      // Llamada a la API para cambiar el estado
      const response = await axios.put(
        `https://back-end-4803.onrender.com/api/empleados/${employeeToUpdate.id}/status`,
        { estado: newStatus }
      );

      if (response.data.success) {
        // Actualizar empleado en la lista principal y filtrada
        const updatedEmployees = employees.map(emp =>
          emp.id === employeeToUpdate.id ? { ...emp, estado: newStatus } : emp
        );
        setEmployees(updatedEmployees);
        setFilteredEmployees(
          filteredEmployees.map(emp =>
            emp.id === employeeToUpdate.id ? { ...emp, estado: newStatus } : emp
          )
        );
                
        setNotification({
          open: true,
          message: `Empleado ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
          type: 'success'
        });
      } else {
        throw new Error(response.data.message || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: 'Error al actualizar el estado del empleado',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
      setConfirmDialogOpen(false);
      setEmployeeToUpdate(null);
    }
  };

  // Abrir formulario para añadir/editar empleado
  const handleOpenEmployeeForm = (employee = null) => {
    if (employee) {
      // Modo edición
      setEditMode(true);
      setEmployeeForm({
        id: employee.id,
        nombre: employee.nombre || '',
        aPaterno: employee.aPaterno || '',
        aMaterno: employee.aMaterno || '',
        email: employee.email || '',
        password: '', // No enviamos la contraseña existente por seguridad
        puesto: employee.puesto || '',
        estado: employee.estado || 'activo',
        imagen: employee.imagen || '',
        telefono: employee.telefono || ''
      });
    } else {
      // Modo añadir
      setEditMode(false);
      setEmployeeForm({
        id: null,
        nombre: '',
        aPaterno: '',
        aMaterno: '',
        email: '',
        password: '',
        puesto: '',
        estado: 'activo',
        imagen: '',
        telefono: ''
      });
    }
    
    setAddEmployeeOpen(true);
  };

  // Manejar cambios en el formulario de empleado
  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar empleado (añadir/editar) - Actualizado para evitar recarga
  const handleSaveEmployee = async (formData) => {
    setIsProcessing(true);
    try {
      let response;
      if (editMode) {
        // Editar empleado existente
        response = await axios.put(`https://back-end-4803.onrender.com/api/empleados/${formData.id}`, formData);
      } else {
        // Añadir nuevo empleado
        response = await axios.post('https://back-end-4803.onrender.com/api/empleados', formData);
      }

      if (response && response.data) {
        const updatedEmployee = response.data;
        
        // Actualizar lista de empleados sin recarga
        if (editMode) {
          // Update existing employee
          const updatedEmployees = employees.map(emp => 
            emp.id === updatedEmployee.id ? updatedEmployee : emp
          );
          setEmployees(updatedEmployees);
          
          // También actualizamos el estado selectedEmployee si es el mismo que estamos editando
          if (selectedEmployee && selectedEmployee.id === updatedEmployee.id) {
            setSelectedEmployee(updatedEmployee);
          }
        } else {
          // Add new employee
          setEmployees(prev => [...prev, updatedEmployee]);
        }
        
        // Reaplicar filtros a los datos actualizados
        const updatedFilteredEmployees = editMode 
          ? filteredEmployees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp) 
          : [...filteredEmployees, updatedEmployee];
        
        setFilteredEmployees(updatedFilteredEmployees);
        
        setNotification({
          open: true,
          message: editMode ? 'Empleado actualizado exitosamente' : 'Empleado añadido exitosamente',
          type: 'success'
        });
        
        setAddEmployeeOpen(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: `Error al ${editMode ? 'actualizar' : 'guardar'} el empleado: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para renderizar la vista de tarjetas
  const renderCardView = () => {
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {filteredEmployees.map((employee, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id || index}>
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
                  label={employee.estado || 'No definido'}
                  sx={{
                    backgroundColor: getStatusColor(employee.estado).bg,
                    color: getStatusColor(employee.estado).text,
                    border: `1px solid ${getStatusColor(employee.estado).border}`,
                    fontWeight: '500',
                    fontSize: '0.75rem',
                    height: '24px',
                    '&:hover': {
                      backgroundColor: getStatusColor(employee.estado).bg,
                    }
                  }}
                />
              </Box>
              
              <CardContent sx={{ pt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Avatar
                    src={employee.imagen || ''}
                    sx={{
                      width: 70,
                      height: 70,
                      bgcolor: colors.primary,
                      fontSize: '1.5rem'
                    }}
                  >
                    {employee.nombre ? employee.nombre.charAt(0) : '?'}
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
                  {`${employee.nombre || ''} ${employee.aPaterno || ''}`}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
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
                      {employee.email || 'No disponible'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FaBriefcase style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: colors.secondaryText,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {employee.puesto || 'No definido'}
                    </Typography>
                  </Box>
                  
                  {employee.telefono && (
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
                        {employee.telefono}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Tooltip title="Ver detalles">
                    <IconButton
                      onClick={() => handleOpenDetails(employee)}
                      sx={{
                        backgroundColor: colors.primary,
                        '&:hover': {
                          backgroundColor: colors.hover,
                        },
                        padding: '6px',
                        color: 'white',
                      }}
                    >
                      <FaInfoCircle size={16} />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => handleOpenEmployeeForm(employee)}
                      sx={{
                        backgroundColor: colors.warning,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 152, 0, 0.8)',
                        },
                        padding: '6px',
                        color: 'white',
                      }}
                    >
                      <FaEdit size={16} />
                    </IconButton>
                  </Tooltip>
                  
                  {employee.estado === 'activo' ? (
                    <Tooltip title="Desactivar">
                      <IconButton
                        onClick={() => handleStatusChange(employee)}
                        sx={{
                          backgroundColor: '#f44336',
                          '&:hover': {
                            backgroundColor: '#d32f2f',
                          },
                          padding: '6px',
                          borderRadius: '50%',
                        }}
                      >
                        <FaTimes size={16} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Activar">
                      <IconButton
                        onClick={() => handleStatusChange(employee)}
                        sx={{
                          backgroundColor: colors.success,
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.8)',
                          },
                          padding: '6px',
                          borderRadius: '50%',
                        }}
                      >
                        <FaUserCheck size={16} />
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
        {filteredEmployees.map((employee, index) => (
          <Paper 
            key={employee.id || index}
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
                  src={employee.imagen || ''}
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: colors.primary,
                    mr: 2
                  }}
                >
                  {employee.nombre ? employee.nombre.charAt(0) : '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 'bold' }}>
                    {`${employee.nombre || ''} ${employee.aPaterno || ''} ${employee.aMaterno || ''}`}
                  </Typography>
                  <Chip
                    label={employee.estado || 'No definido'}
                    sx={{
                      backgroundColor: getStatusColor(employee.estado).bg,
                      color: getStatusColor(employee.estado).text,
                      border: `1px solid ${getStatusColor(employee.estado).border}`,
                      fontWeight: '500',
                      fontSize: '0.75rem',
                      height: '24px',
                      mt: 1,
                      '&:hover': {
                        backgroundColor: getStatusColor(employee.estado).bg,
                      }
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <FaEnvelope style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {employee.email || 'No disponible'}
                  </Typography>
                </Box>
                {employee.telefono && (
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <FaPhone style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                    <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                      {employee.telefono}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FaBriefcase style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {employee.puesto || 'No definido'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <FaIdCard style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    ID: {employee.id || 'No disponible'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FaClock style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    Creado: {employee.fecha_creacion ? formatDate(employee.fecha_creacion) : 'No disponible'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Ver detalles" arrow>
                    <IconButton
                      onClick={() => handleOpenDetails(employee)}
                      sx={{
                        backgroundColor: colors.primary,
                        '&:hover': {
                          backgroundColor: colors.hover,
                        },
                        padding: '6px',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FaInfoCircle size={16} />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Editar" arrow>
                    <IconButton
                      onClick={() => handleOpenEmployeeForm(employee)}
                      sx={{
                        backgroundColor: colors.warning,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 152, 0, 0.8)',
                        },
                        padding: '6px',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    >
                      <FaEdit size={16} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={employee.estado === 'activo' ? 'Desactivar' : 'Activar'} arrow>
                    <IconButton
                      onClick={() => handleStatusChange(employee)}
                      sx={{
                        backgroundColor: employee.estado === 'activo' ? colors.error : colors.success,
                        '&:hover': {
                          backgroundColor: employee.estado === 'activo' ? 'rgba(244, 67, 54, 0.8)' : 'rgba(76, 175, 80, 0.8)',
                        },
                        padding: '6px',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    >
                      {employee.estado === 'activo' ? <FaTimes size={16} /> : <FaUserCheck size={16} />}
                    </IconButton>
                  </Tooltip>
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
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Puesto</TableCell>
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
            {filteredEmployees.map((employee, index) => (
              <TableRow key={index} sx={{
                '&:hover': {
                  backgroundColor: colors.hover
                },
                transition: 'background-color 0.2s ease'
              }}>
                <TableCell sx={{ color: colors.text }}>{index + 1}</TableCell>
                <TableCell sx={{ color: colors.text }}>
                  {`${employee.nombre || ''} ${employee.aPaterno || ''} ${employee.aMaterno || ''}`}
                </TableCell>
                <TableCell sx={{ color: colors.text }}>{employee.email || 'No disponible'}</TableCell>
                <TableCell sx={{ color: colors.text }}>{employee.puesto || 'No definido'}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.estado || 'No definido'}
                    sx={{
                      backgroundColor: getStatusColor(employee.estado).bg,
                      color: getStatusColor(employee.estado).text,
                      border: `1px solid ${getStatusColor(employee.estado).border}`,
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      height: '28px',
                      '&:hover': {
                        backgroundColor: getStatusColor(employee.estado).bg,
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: colors.text }}>
                  {employee.fecha_creacion ? formatDate(employee.fecha_creacion) : 'No disponible'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver detalles" arrow>
                      <IconButton
                        onClick={() => handleOpenDetails(employee)}
                        sx={{
                          backgroundColor: colors.primary,
                          '&:hover': {
                            backgroundColor: colors.hover,
                          },
                          padding: '6px',
                          color: 'white',
                        }}
                      >
                        <FaInfoCircle style={{ fontSize: '20px', color: 'white' }}  />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Editar" arrow>
                      <IconButton
                        onClick={() => handleOpenEmployeeForm(employee)}
                        sx={{
                          backgroundColor: colors.warning,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 152, 0, 0.8)',
                          },
                          padding: '6px',
                          color: 'white',
                        }}
                      >
                        <FaEdit style={{ fontSize: '20px', color: 'white' }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={employee.estado === 'activo' ? 'Desactivar' : 'Activar'} arrow>
                      <IconButton
                        onClick={() => handleStatusChange(employee)}
                        sx={{
                          backgroundColor: employee.estado === 'activo' ? colors.error : colors.success,
                          '&:hover': {
                            backgroundColor: employee.estado === 'activo' ? 'rgba(244, 67, 54, 0.8)' : 'rgba(76, 175, 80, 0.8)',
                          },
                          padding: '6px',
                          color: 'white',
                        }}
                      >
                        {employee.estado === 'activo' ? <FaTimes style={{ fontSize: '20px', color: 'white' }}  /> : <FaUserCheck style={{ fontSize: '20px', color: 'white' }}  />}
                      </IconButton>
                    </Tooltip>
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
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          backgroundColor: colors.dialogBackground,
          color: colors.text,
          borderRadius: '16px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: colors.titleColor, fontWeight: 'bold' }}>
            <FaFilter style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Filtros Avanzados
          </Typography>
          <IconButton 
            onClick={() => setDrawerOpen(false)} 
            sx={{ 
              color: colors.text,
              '&:hover': {
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                color: '#ff6347'
              }
            }}
          >
            <FaTimes />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider sx={{ backgroundColor: colors.divider }} />
      
      <DialogContent sx={{ p: 3 }}>
        {/* Filtro por rango de fechas */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1, fontSize: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
            <FaCalendarAlt style={{ marginRight: '8px' }} />
            Fecha de registro
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium', color: colors.secondaryText }}>Desde</Typography>
              <TextField
                type="date"
                name="dateCreatedStart"
                value={formData.dateCreatedStart}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: isDarkTheme ? alpha(colors.paper, 0.2) : colors.paper,
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.inputBorder,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.primary,
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium', color: colors.secondaryText }}>Hasta</Typography>
              <TextField
                type="date"
                name="dateCreatedEnd"
                value={formData.dateCreatedEnd}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: isDarkTheme ? alpha(colors.paper, 0.2) : colors.paper,
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    color: colors.text,
                    '& fieldset': {
                      borderColor: colors.inputBorder,
                    },
                    '&:hover fieldset': {
                      borderColor: colors.primary,
                    },
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="outlined"
          onClick={handleClearFilters}
          sx={{ 
            color: colors.primary, 
            borderColor: colors.primary,
            borderRadius: '8px' 
          }}
        >
          LIMPIAR FILTROS
        </Button>
        <Button
          variant="contained"
          onClick={() => setDrawerOpen(false)}
          sx={{ 
            backgroundColor: colors.primary,
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          APLICAR FILTROS
        </Button>
      </DialogActions>
    </Dialog>
  );

  // DIÁLOGO DE DETALLES MEJORADO
  const renderEmployeeDetailsDialog = () => (
    <Dialog
      open={detailsOpen}
      onClose={handleCloseDetails}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          backgroundColor: colors.dialogBackground,
          color: colors.text,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: isDarkTheme ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      {selectedEmployee && (
        <>
          <Box 
            sx={{ 
              background: `linear-gradient(45deg, ${colors.primary}, ${isDarkTheme ? '#1A365D' : '#90CAF9'})`,
              p: 3,
              position: 'relative',
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={selectedEmployee.imagen || ''}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: isDarkTheme ? '#2C5282' : '#1565C0',
                    color: '#fff',
                    fontSize: '2rem',
                    border: '3px solid white',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {selectedEmployee.nombre ? selectedEmployee.nombre.charAt(0) : '?'}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    {`${selectedEmployee.nombre || ''} ${selectedEmployee.aPaterno || ''} ${selectedEmployee.aMaterno || ''}`}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={selectedEmployee.puesto || 'Sin puesto'}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                      icon={<FaBriefcase style={{ color: 'white' }} />}
                    />
                    <Chip
                      label={selectedEmployee.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      sx={{
                        backgroundColor: selectedEmployee.estado === 'activo' 
                          ? 'rgba(76, 175, 80, 0.8)' 
                          : 'rgba(244, 67, 54, 0.8)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                      icon={selectedEmployee.estado === 'activo' 
                        ? <FaUserCheck style={{ color: 'white' }} /> 
                        : <FaTimes style={{ color: 'white' }} />}
                    />
                  </Box>
                </Box>
              </Box>
              <IconButton
                aria-label="close"
                onClick={handleCloseDetails}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                <FaTimes />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ px: 3, py: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ 
                mb: 2,
                '& .MuiTabs-indicator': {
                  backgroundColor: colors.primary
                },
                '& .MuiTab-root': {
                  color: colors.secondaryText,
                  '&.Mui-selected': {
                    color: colors.primary
                  }
                }
              }}
            >
              <Tab label="Información General" />
              <Tab label="Contacto" />
              <Tab label="Historial" />
            </Tabs>
            
            <Divider sx={{ mb: 2 }} />
            
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ 
                    backgroundColor: isDarkTheme ? colors.cardDark : '#F8FAFC',
                    boxShadow: 'none',
                    borderRadius: '10px',
                    height: '100%'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: colors.primary }}>
                        Información Básica
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FaIdCard style={{ marginRight: 10, color: colors.primary }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: colors.secondaryText }}>
                            ID
                          </Typography>
                          <Typography sx={{ fontWeight: 500 }}>
                            {selectedEmployee.id || 'No disponible'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FaBriefcase style={{ marginRight: 10, color: colors.primary }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: colors.secondaryText }}>
                            Puesto
                          </Typography>
                          <Typography sx={{ fontWeight: 500 }}>
                            {selectedEmployee.puesto || 'No definido'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FaUserCheck style={{ marginRight: 10, color: selectedEmployee.estado === 'activo' ? colors.success : colors.error }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: colors.secondaryText }}>
                            Estado
                          </Typography>
                          <Typography sx={{ fontWeight: 500, color: selectedEmployee.estado === 'activo' ? colors.success : colors.error }}>
                            {selectedEmployee.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card sx={{ 
                    backgroundColor: isDarkTheme ? colors.cardDark : '#F8FAFC',
                    boxShadow: 'none',
                    borderRadius: '10px',
                    height: '100%'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: colors.primary }}>
                        Fechas Importantes
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FaCalendarAlt style={{ marginRight: 10, color: colors.primary }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: colors.secondaryText }}>
                            Fecha de registro
                          </Typography>
                          <Typography sx={{ fontWeight: 500 }}>
                            {selectedEmployee.fecha_creacion ? formatDate(selectedEmployee.fecha_creacion) : 'No disponible'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FaClock style={{ marginRight: 10, color: colors.primary }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: colors.secondaryText }}>
                            Última actualización
                          </Typography>
                          <Typography sx={{ fontWeight: 500 }}>
                            {selectedEmployee.ultima_actualizacion ? formatDate(selectedEmployee.ultima_actualizacion) : 'No disponible'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ 
                    backgroundColor: isDarkTheme ? colors.cardDark : '#F8FAFC',
                    boxShadow: 'none',
                    borderRadius: '10px'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: colors.primary }}>
                        Información de Contacto
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FaEnvelope style={{ marginRight: 10, color: colors.primary }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: colors.secondaryText }}>
                            Email
                          </Typography>
                          <Typography sx={{ fontWeight: 500 }}>
                            {selectedEmployee.email || 'No disponible'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {selectedEmployee.telefono && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FaPhone style={{ marginRight: 10, color: colors.primary }} />
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', color: colors.secondaryText }}>
                              Teléfono
                            </Typography>
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedEmployee.telefono}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 2 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <FaClock style={{ fontSize: '3rem', color: colors.secondaryText, marginBottom: '1rem' }} />
                <Typography variant="h6" sx={{ color: colors.text }}>
                  Historial no disponible
                </Typography>
                <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                  El historial de actividades del empleado no está disponible actualmente.
                </Typography>
              </Box>
            )}
          </Box>
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${colors.divider}` }}>
            <Button
              onClick={handleCloseDetails}
              sx={{ 
                color: colors.text,
                borderRadius: '8px'
              }}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                handleCloseDetails();
                handleOpenEmployeeForm(selectedEmployee);
              }}
              variant="contained"
              color="primary"
              startIcon={<FaEdit />}
              sx={{ 
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              Editar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  // DIÁLOGO DE CONFIRMACIÓN MEJORADO
  const renderConfirmationDialog = () => (
    <Dialog
      open={confirmDialogOpen}
      onClose={() => !isProcessing && setConfirmDialogOpen(false)}
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          backgroundColor: colors.dialogBackground,
          color: colors.text,
          borderRadius: '16px',
          maxWidth: '400px',
          width: '100%'
        }
      }}
    >
      <Box sx={{ 
        backgroundColor: employeeToUpdate?.estado === 'activo' ? '#FEECEB' : '#E6F4EA',
        color: employeeToUpdate?.estado === 'activo' ? colors.error : colors.success,
        py: 2,
        px: 3,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          {employeeToUpdate?.estado === 'activo' ? (
            <>
              <FaTimes style={{ marginRight: '10px' }} />
              Confirmar desactivación
            </>
          ) : (
            <>
              <FaUserCheck style={{ marginRight: '10px' }} />
              Confirmar activación
            </>
          )}
        </Typography>
      </Box>
      
      <DialogContent sx={{ pt: 3 }}>
        {employeeToUpdate && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={employeeToUpdate.imagen || ''}
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: colors.primary,
                    color: '#fff',
                    mr: 2
                  }}
                >
                  {employeeToUpdate.nombre ? employeeToUpdate.nombre.charAt(0) : '?'}
                </Avatar>
                <Typography>
                  <strong>{employeeToUpdate.nombre} {employeeToUpdate.aPaterno}</strong>
                  <br />
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {employeeToUpdate.puesto || 'Sin puesto'}
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                backgroundColor: isDarkTheme ? colors.cardDark : '#F8FAFC',
                borderRadius: '10px',
                p: 2,
                mb: 2
              }}>
                <Typography variant="body1">
                  {employeeToUpdate?.estado === 'activo' ? (
                    <>¿Está seguro que desea desactivar a este empleado?</>
                  ) : (
                    <>¿Está seguro que desea activar a este empleado?</>
                  )}
                </Typography>
              </Box>
              
              {employeeToUpdate?.puesto === 'Odontólogo' && employeeToUpdate?.estado === 'inactivo' && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: isDarkTheme ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)',
                  borderLeft: `4px solid ${colors.warning}`,
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  <FaExclamationTriangle style={{ color: colors.warning, marginRight: '10px' }} />
                  <Typography variant="body2">
                    Solo puede haber un Odontólogo activo a la vez. Si ya existe uno, se desactivará automáticamente.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => setConfirmDialogOpen(false)}
          disabled={isProcessing}
          sx={{ 
            color: colors.text,
            borderRadius: '8px'
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmStatusChange}
          variant="contained"
          color={employeeToUpdate?.estado === 'activo' ? 'error' : 'success'}
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ 
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          {isProcessing ? 'Procesando...' : 'Confirmar'}
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
            <FaUsers style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Gestión de Empleados
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

        {/* Botón para añadir empleado */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => handleOpenEmployeeForm()}
            sx={{
              backgroundColor: colors.primary,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.8)',
              },
              height: '42px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            Añadir Empleado
          </Button>
        </Box>
        
        {/* Filtros y Búsqueda */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Filtro de Búsqueda */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Buscar empleado"
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
          <Grid item xs={12} sm={4}>
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
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por Puesto */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por puesto</InputLabel>
              <Select
                value={positionFilter}
                label="Filtrar por puesto"
                onChange={handlePositionFilter}
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
                {positionOptions.map((position) => (
                  <MenuItem key={position} value={position}>{position}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'empleado' : 'empleados'} encontrados
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
                borderRadius: '8px',
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
                  color: colors.secondaryText,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    color: '#ff6347'
                  }
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
                  backgroundColor: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
                  color: colors.text,
                  borderRadius: '16px',
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
        
        {/* Diálogo de confirmación de cambio de estado */}
        {renderConfirmationDialog()}
        
        {/* Diálogo de detalles del empleado */}
        {renderEmployeeDetailsDialog()}
        
        {/* Formulario de añadir/editar empleado (como componente separado) */}
        {addEmployeeOpen && (
          <EmpleadoFormWizard
            open={addEmployeeOpen}
            onClose={() => setAddEmployeeOpen(false)}
            editMode={editMode}
            initialData={employeeForm}
            positionOptions={positionOptions}
            onSave={handleSaveEmployee}
            isProcessing={isProcessing}
            colors={colors}
          />
        )}
        
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
  export default EmployeeManagement;