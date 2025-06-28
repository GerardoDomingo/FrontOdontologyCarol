import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Container, Box, Card, Typography, CircularProgress, Dialog,
  IconButton, Tooltip, Chip, Menu, MenuItem, Badge, Paper,
  Fade, Grid, Avatar, Divider, Button, useMediaQuery,
  FormControl, InputLabel, Select, OutlinedInput, Tabs, Tab,
  TextField, Autocomplete, SwipeableDrawer, ListItemIcon, ListItemText,
  Link, Skeleton, Backdrop, InputBase
} from "@mui/material";
import {
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Today as TodayIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  PersonOutline as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  CheckCircleOutline as CheckIcon,
  CancelOutlined as CancelIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Event as EventIcon,
  AssignmentOutlined as AssignmentIcon,
  AttachMoney as PriceIcon,
  Description as DescriptionIcon,
  EmojiPeople as PatientIcon,
  WatchLater as WatchLaterIcon,
  List as ListIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import axios from "axios";
import DetalleCitaPaciente from "./DetalleCitaPaciente";
import Notificaciones from "../../../components/Layout/Notificaciones";
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { styled, useTheme, alpha } from '@mui/material/styles';

// Configuración de idioma para moment
moment.locale("es");
const localizer = momentLocalizer(moment);

// Mensajes en español para el calendario
const messages = {
  today: "Hoy",
  previous: "Anterior",
  next: "Siguiente",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Cita",
  noEventsInRange: "No hay citas programadas en este período",
  showMore: (total) => `+${total} más`,
  allDay: "Todo el día"
};

// Mapeo de categorías a colores según la tabla real de servicios
const categoryColors = {
  "Preventivo": "#4CAF50", // Verde
  "Higiene": "#03A9F4",   // Azul claro
  "Periodoncia": "#9C27B0", // Púrpura
  "Estética": "#E91E63",  // Rosa
  "Cirugía": "#F44336",   // Rojo
  "Restauración": "#FF9800", // Naranja
  "Prótesis": "#795548",  // Marrón
  "Ortodoncia": "#3F51B5", // Índigo
  "General": "#607D8B",   // Azul grisáceo
  "default": "#9E9E9E"    // Gris
};

// Tipo de evento (consulta o tratamiento)
const tipoEventoConfig = {
  "consulta": {
    icon: LocalHospitalIcon,
    color: "#607D8B",
    bgColor: "rgba(96, 125, 139, 0.1)"
  },
  "tratamiento": {
    icon: AssignmentIcon,
    color: "#4CAF50",
    bgColor: "rgba(76, 175, 80, 0.1)"
  }
};

// Mapeo de estados de citas a colores e iconos
const statusConfig = {
  "Pendiente": {
    color: "#FF9800", // Naranja
    icon: WatchLaterIcon,
    bgColor: "#FFF3E0"
  },
  "Confirmada": {
    color: "#4CAF50", // Verde
    icon: CheckIcon,
    bgColor: "#E8F5E9"
  },
  "Cancelada": {
    color: "#F44336", // Rojo
    icon: CancelIcon,
    bgColor: "#FFEBEE"
  },
  "Completada": {
    color: "#3F51B5", // Índigo
    icon: AssignmentIcon,
    bgColor: "#E8EAF6"
  },
  "PRE-REGISTRO": {
    color: "#9C27B0", // Púrpura
    icon: PersonIcon,
    bgColor: "#F3E5F5"
  }
};

// Componentes estilizados
const CalendarCard = styled(Card)(({ theme, darkTheme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  backgroundColor: darkTheme ? "#102a43" : "#ffffff",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  border: `1px solid ${darkTheme ? "#1e3a5c" : "#e0e0e0"}`,
  transition: "all 0.3s ease",
  height: "100%",
  position: "relative", // Para poder posicionar el indicador de carga
}));

const ToolbarWrapper = styled(Box)(({ theme, darkTheme }) => ({
  padding: theme.spacing(2),
  backgroundColor: darkTheme ? "#0f2337" : "#f8faff",
  borderBottom: `1px solid ${darkTheme ? "#1e3a5c" : "#e0e0e0"}`,
}));

const StyledBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: statusConfig[status]?.color || "#9e9e9e",
    color: '#fff',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      content: '""',
    },
  },
}));

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

const StatusChip = styled(Chip)(({ theme, status, isDarkTheme }) => ({
  backgroundColor: isDarkTheme ? alpha(statusConfig[status]?.color || "#9e9e9e", 0.2) : statusConfig[status]?.bgColor || "#f5f5f5",
  color: statusConfig[status]?.color || "#9e9e9e",
  fontWeight: 600,
  border: `1px solid ${statusConfig[status]?.color || "#9e9e9e"}`,
  '& .MuiChip-icon': {
    color: statusConfig[status]?.color || "#9e9e9e",
  }
}));

const EventTooltip = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 320,
  minWidth: 280,
  backgroundColor: theme.palette.mode === 'dark' ? '#1a365d' : '#ffffff',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  borderRadius: theme.shape.borderRadius,
}));

// Componente de carga mejorado que solo afecta al calendario
const CalendarLoading = ({ loading, isDarkTheme }) => {
  if (!loading) return null;
  
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isDarkTheme ? "rgba(16, 42, 67, 0.8)" : "rgba(255, 255, 255, 0.8)",
        zIndex: 10,
        borderRadius: "12px",
        backdropFilter: "blur(4px)"
      }}
    >
      <CircularProgress 
        size={60} 
        thickness={4} 
        sx={{ 
          color: isDarkTheme ? "#90caf9" : "#1976d2",
          mb: 2 
        }} 
      />
      <Typography
        variant="h6"
        sx={{
          color: isDarkTheme ? "#fff" : "#333",
          fontWeight: 500
        }}
      >
        Actualizando agenda...
      </Typography>
    </Box>
  );
};

// Componente para la barra de herramientas personalizada del calendario
const CustomToolbar = ({ date, view, onView, onNavigate, isDarkTheme, onRefresh, onPrint, onSearch, onFilter, filterActive, odontologos, selectedOdontologo, onOdontologoChange, estados, selectedEstado, onEstadoChange, pacientes, selectedPaciente, onPacienteChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToToday = () => {
    onNavigate('TODAY');
  };

  // Formato para el título del calendario
  const formattedDate = () => {
    if (view === Views.MONTH) {
      return moment(date).format('MMMM YYYY');
    } else if (view === Views.WEEK) {
      const start = moment(date).startOf('week').format('D MMM');
      const end = moment(date).endOf('week').format('D MMM');
      return `${start} - ${end}, ${moment(date).format('YYYY')}`;
    } else {
      return moment(date).format('dddd, D [de] MMMM YYYY');
    }
  };

  return (
    <ToolbarWrapper darkTheme={isDarkTheme}>
      <Grid container spacing={2} alignItems="center">
        {/* Fila 1: Navegación y vista actual */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => onNavigate('PREV')}
                sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2' }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>

              <Tooltip title="Ir a hoy">
                <IconButton
                  onClick={goToToday}
                  sx={{
                    mx: 0.5,
                    color: isDarkTheme ? '#90caf9' : '#1976d2',
                    bgcolor: isDarkTheme ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      bgcolor: isDarkTheme ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.16)'
                    }
                  }}
                >
                  <TodayIcon />
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={() => onNavigate('NEXT')}
                sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2' }}
              >
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 600,
                color: isDarkTheme ? '#90caf9' : '#1976d2',
                textTransform: 'capitalize',
                ml: 1,
                fontSize: { xs: '0.95rem', sm: '1.1rem' }
              }}
            >
              {formattedDate()}
            </Typography>

            {filterActive && (
              <Chip
                label="Filtros activos"
                size="small"
                color="secondary"
                onDelete={() => {
                  onFilter('all');
                  if (onOdontologoChange) onOdontologoChange('all');
                  if (onEstadoChange) onEstadoChange('all');
                  if (onPacienteChange) onPacienteChange('all');
                }}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </Grid>

        {/* Fila 1: Botones de vista */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Box sx={{ display: 'flex', bgcolor: isDarkTheme ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
              <Button
                size="small"
                onClick={() => onView(Views.MONTH)}
                variant={view === Views.MONTH ? "contained" : "text"}
                sx={{
                  minWidth: '64px',
                  color: view !== Views.MONTH ? (isDarkTheme ? '#90caf9' : '#1976d2') : '#fff',
                  '&.MuiButton-text': {
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: isDarkTheme ? '#bbdefb' : '#1565c0'
                    }
                  }
                }}
              >
                Mes
              </Button>
              <Button
                size="small"
                onClick={() => onView(Views.WEEK)}
                variant={view === Views.WEEK ? "contained" : "text"}
                sx={{
                  minWidth: '64px',
                  color: view !== Views.WEEK ? (isDarkTheme ? '#90caf9' : '#1976d2') : '#fff',
                  '&.MuiButton-text': {
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: isDarkTheme ? '#bbdefb' : '#1565c0'
                    }
                  }
                }}
              >
                Semana
              </Button>
              <Button
                size="small"
                onClick={() => onView(Views.DAY)}
                variant={view === Views.DAY ? "contained" : "text"}
                sx={{
                  minWidth: '64px',
                  color: view !== Views.DAY ? (isDarkTheme ? '#90caf9' : '#1976d2') : '#fff',
                  '&.MuiButton-text': {
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: isDarkTheme ? '#bbdefb' : '#1565c0'
                    }
                  }
                }}
              >
                Día
              </Button>
              <Button
                size="small"
                onClick={() => onView(Views.AGENDA)}
                variant={view === Views.AGENDA ? "contained" : "text"}
                sx={{
                  minWidth: '74px',
                  color: view !== Views.AGENDA ? (isDarkTheme ? '#90caf9' : '#1976d2') : '#fff',
                  '&.MuiButton-text': {
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: isDarkTheme ? '#bbdefb' : '#1565c0'
                    }
                  }
                }}
              >
                Agenda
              </Button>
            </Box>

            <Tooltip title="Actualizar calendario">
              <IconButton
                onClick={onRefresh}
                sx={{
                  color: isDarkTheme ? '#90caf9' : '#1976d2',
                  bgcolor: isDarkTheme ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    bgcolor: isDarkTheme ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.16)'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Filtrar citas">
              <IconButton
                onClick={handleClick}
                sx={{
                  color: filterActive ? (isDarkTheme ? '#ce93d8' : '#7b1fa2') : (isDarkTheme ? '#90caf9' : '#1976d2'),
                  bgcolor: filterActive
                    ? (isDarkTheme ? 'rgba(206, 147, 216, 0.08)' : 'rgba(123, 31, 162, 0.08)')
                    : (isDarkTheme ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)'),
                  '&:hover': {
                    bgcolor: filterActive
                      ? (isDarkTheme ? 'rgba(206, 147, 216, 0.16)' : 'rgba(123, 31, 162, 0.16)')
                      : (isDarkTheme ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.16)')
                  }
                }}
              >
                <Badge color="secondary" variant="dot" invisible={!filterActive}>
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              TransitionComponent={Fade}
              PaperProps={{
                elevation: 3,
                sx: {
                  minWidth: 200,
                  maxWidth: 300,
                  mt: 1.5,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  bgcolor: isDarkTheme ? '#1e3a5c' : '#ffffff'
                }
              }}
            >
              <MenuItem
                onClick={() => { onFilter('all'); handleClose(); }}
                dense
                sx={{
                  py: 1,
                  color: isDarkTheme ? '#fff' : 'inherit'
                }}
              >
                <ListItemIcon>
                  <EventIcon fontSize="small" sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2' }} />
                </ListItemIcon>
                Todas las citas
              </MenuItem>
              <MenuItem
                onClick={() => { onFilter('today'); handleClose(); }}
                dense
                sx={{
                  py: 1,
                  color: isDarkTheme ? '#fff' : 'inherit'
                }}
              >
                <ListItemIcon>
                  <TodayIcon fontSize="small" sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2' }} />
                </ListItemIcon>
                Citas de hoy
              </MenuItem>
              <MenuItem
                onClick={() => { onFilter('upcoming'); handleClose(); }}
                dense
                sx={{
                  py: 1,
                  color: isDarkTheme ? '#fff' : 'inherit'
                }}
              >
                <ListItemIcon>
                  <WatchLaterIcon fontSize="small" sx={{ color: '#FF9800' }} />
                </ListItemIcon>
                Próximas citas
              </MenuItem>
              <MenuItem
                onClick={() => { onFilter('past'); handleClose(); }}
                dense
                sx={{
                  py: 1,
                  color: isDarkTheme ? '#fff' : 'inherit'
                }}
              >
                <ListItemIcon>
                  <AssignmentIcon fontSize="small" sx={{ color: '#3F51B5' }} />
                </ListItemIcon>
                Citas pasadas
              </MenuItem>

              <Divider />

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  px: 2,
                  py: 0.5,
                  color: isDarkTheme ? '#90caf9' : '#1976d2',
                  fontWeight: 600
                }}
              >
                Por Estado
              </Typography>

              {Object.keys(statusConfig).map(status => (
                <MenuItem
                  key={status}
                  onClick={() => { onFilter('status', status); handleClose(); }}
                  dense
                  sx={{
                    py: 1,
                    color: isDarkTheme ? '#fff' : 'inherit'
                  }}
                >
                  <ListItemIcon>
                    {React.createElement(statusConfig[status].icon, {
                      style: { color: statusConfig[status].color },
                      fontSize: "small"
                    })}
                  </ListItemIcon>
                  {status}
                </MenuItem>
              ))}

              <Divider />

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  px: 2,
                  py: 0.5,
                  color: isDarkTheme ? '#90caf9' : '#1976d2',
                  fontWeight: 600
                }}
              >
                Por Categoría de Servicio
              </Typography>

              {Object.keys(categoryColors).filter(cat => cat !== 'default').map(category => (
                <MenuItem
                  key={category}
                  onClick={() => { onFilter('category', category); handleClose(); }}
                  dense
                  sx={{
                    py: 1,
                    color: isDarkTheme ? '#fff' : 'inherit'
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: categoryColors[category],
                      mr: 2
                    }}
                  />
                  {category}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Grid>

{/* Fila 2: Filtros avanzados */}
<Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 2, md: 3 },
              alignItems: 'flex-start',
              mt: 2
            }}
          >
            {/* Búsqueda de paciente con mejor diseño */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              width: { xs: '100%', sm: 'auto' }, 
              flex: { xs: '1 1 100%', sm: '1 1 250px', md: '0 1 280px' },
              gap: 0.5
            }}>
              <Typography variant="caption" sx={{ fontWeight: 500, ml: 1, color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                Buscar paciente
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                borderRadius: '8px',
                overflow: 'hidden',
                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                },
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}>
                <IconButton size="small" sx={{ ml: 1, color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}>
                  <SearchIcon fontSize="small" />
                </IconButton>
                <InputBase
                  placeholder="Nombre del paciente..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchInput.trim()) {
                      onSearch(searchInput);
                      setSearchInput('');
                    }
                  }}
                  sx={{
                    ml: 0.5,
                    flex: 1,
                    fontSize: '0.95rem',
                    height: '42px',
                    '& .MuiInputBase-input': {
                      p: 0,
                      color: isDarkTheme ? '#fff' : 'inherit'
                    }
                  }}
                  endAdornment={searchInput && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        onSearch(searchInput);
                        setSearchInput('');
                      }}
                      sx={{ color: isDarkTheme ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', mr: 1 }}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  )}
                />
              </Box>
            </Box>

            {/* Selector de paciente (Nuevo) con mejor diseño */}
            {pacientes && pacientes.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: { xs: '100%', sm: 'auto' }, 
                flex: { xs: '1 1 100%', sm: '1 1 200px' },
                gap: 0.5
              }}>
                <Typography variant="caption" sx={{ fontWeight: 500, ml: 1, color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  Filtrar por paciente
                </Typography>
                <Select
                  value={selectedPaciente}
                  onChange={(e) => onPacienteChange(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: '42px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '& .MuiSelect-select': { 
                      display: 'flex', 
                      alignItems: 'center',
                      pl: 2,
                      py: 1.3,
                      color: isDarkTheme ? '#fff' : 'inherit'
                    },
                    bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.9)',
                    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                    '&:hover': {
                      borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { 
                        bgcolor: isDarkTheme ? '#1e3a5c' : '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        mt: 0.5,
                        maxHeight: '300px'
                      }
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected === 'all') {
                      return <Typography sx={{ color: isDarkTheme ? '#fff' : 'inherit' }}>Todos los pacientes</Typography>;
                    }
                    const paciente = pacientes.find(p => p.id === selected);
                    return paciente ? `${paciente.nombre} ${paciente.apellido_paterno}` : 'Seleccionar';
                  }}
                >
                  <MenuItem value="all">Todos los pacientes</MenuItem>
                  {pacientes.map((paciente) => (
                    <MenuItem key={paciente.id} value={paciente.id}>
                      {`${paciente.nombre} ${paciente.apellido_paterno}`}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            )}

            {/* Selector de odontólogo con mejor diseño */}
            {odontologos && odontologos.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: { xs: '100%', sm: 'auto' }, 
                flex: { xs: '1 1 100%', sm: '1 1 200px' },
                gap: 0.5
              }}>
                <Typography variant="caption" sx={{ fontWeight: 500, ml: 1, color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  Filtrar por odontólogo
                </Typography>
                <Select
                  value={selectedOdontologo}
                  onChange={(e) => onOdontologoChange(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: '42px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '& .MuiSelect-select': { 
                      display: 'flex', 
                      alignItems: 'center',
                      pl: 2,
                      py: 1.3,
                      color: isDarkTheme ? '#fff' : 'inherit'
                    },
                    bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.9)',
                    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                    '&:hover': {
                      borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { 
                        bgcolor: isDarkTheme ? '#1e3a5c' : '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        mt: 0.5,
                        maxHeight: '300px'
                      }
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected === 'all') {
                      return <Typography sx={{ color: isDarkTheme ? '#fff' : 'inherit' }}>Todos los odontólogos</Typography>;
                    }
                    const odontologo = odontologos.find(o => o.id === selected);
                    return odontologo ? odontologo.nombre : 'Seleccionar';
                  }}
                >
                  <MenuItem value="all">Todos los odontólogos</MenuItem>
                  {odontologos.map((odontologo) => (
                    <MenuItem key={odontologo.id} value={odontologo.id}>
                      {odontologo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            )}

            {/* Selector de estado con mejor diseño */}
            {estados && estados.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: { xs: '100%', sm: 'auto' }, 
                flex: { xs: '1 1 100%', sm: '1 1 200px' },
                gap: 0.5
              }}>
                <Typography variant="caption" sx={{ fontWeight: 500, ml: 1, color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  Filtrar por estado
                </Typography>
                <Select
                  value={selectedEstado}
                  onChange={(e) => onEstadoChange(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: '42px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '& .MuiSelect-select': { 
                      display: 'flex', 
                      alignItems: 'center',
                      pl: 2,
                      py: 1.3,
                      color: isDarkTheme ? '#fff' : 'inherit' 
                    },
                    bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.9)',
                    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                    '&:hover': {
                      borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { 
                        bgcolor: isDarkTheme ? '#1e3a5c' : '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        mt: 0.5,
                        maxHeight: '300px'
                      }
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected === 'all') {
                      return <Typography sx={{ color: isDarkTheme ? '#fff' : 'inherit' }}>Todos los estados</Typography>;
                    }
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {React.createElement(statusConfig[selected].icon, {
                          style: {
                            color: statusConfig[selected].color,
                            fontSize: 16,
                            marginRight: 8
                          }
                        })}
                        {selected}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="all">Todos los estados</MenuItem>
                  {estados.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {React.createElement(statusConfig[estado].icon, {
                          style: {
                            color: statusConfig[estado].color,
                            fontSize: 16,
                            marginRight: 8
                          }
                        })}
                        {estado}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            )}
          </Box>
        </Grid>      </Grid>
    </ToolbarWrapper>
  );
};

// Componente principal del calendario
const CalendarioAgenda = () => {
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCita, setSelectedCita] = useState(null);
  const [openNotification, setOpenNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("error");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [date, setDate] = useState(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [odontologos, setOdontologos] = useState([]);
  const [selectedOdontologo, setSelectedOdontologo] = useState('all');
  const [estadosCitas, setEstadosCitas] = useState(Object.keys(statusConfig));
  const [selectedEstado, setSelectedEstado] = useState('all');
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState('all');
  const [tratamientos, setTratamientos] = useState({});
  const [pacienteColors, setPacienteColors] = useState({});
  const [estadisticas, setEstadisticas] = useState({
    totalCitas: 0,
    citasPendientes: 0,
    citasConfirmadas: 0,
    citasCanceladas: 0,
    citasCompletadas: 0,
    preRegistros: 0
  });
  const [todayCitas, setTodayCitas] = useState(0);

  // Colores del tema
  const colors = {
    background: isDarkTheme ? "#0a1929" : "#f8faff",
    cardBackground: isDarkTheme ? "#102a43" : "#ffffff",
    primary: isDarkTheme ? "#90caf9" : "#1976d2",
    secondary: isDarkTheme ? "#ce93d8" : "#9c27b0",
    success: isDarkTheme ? "#81c784" : "#4caf50",
    warning: isDarkTheme ? "#ffb74d" : "#ff9800",
    error: isDarkTheme ? "#e57373" : "#f44336",
    text: isDarkTheme ? "#ffffff" : "#333333",
    secondaryText: isDarkTheme ? "#b0bec5" : "#757575",
    pastDayBackground: isDarkTheme ? "#0d2234" : "#f5f5f5",
    todayBackground: isDarkTheme ? "#1a365d" : "#e3f2fd",
    todayHighlight: isDarkTheme ? "#2563eb" : "#1976d2",
    border: isDarkTheme ? "#1e3a5c" : "#e0e0e0",
    hover: isDarkTheme ? "rgba(144, 202, 249, 0.08)" : "rgba(25, 118, 210, 0.04)",
  };

  // Generar colores para pacientes
  const generatePatientColors = useCallback((patientIds) => {
    const colorScheme = [
      "#2196F3", "#9C27B0", "#4CAF50", "#FFC107", "#FF5722", 
      "#03A9F4", "#673AB7", "#8BC34A", "#FFA000", "#FF7043",
      "#00BCD4", "#7E57C2", "#66BB6A", "#FFB300", "#F4511E", 
      "#0097A7", "#5E35B1", "#43A047", "#FB8C00", "#E64A19"
    ];
    
    const patientColors = {};
    patientIds.forEach((id, index) => {
      patientColors[id] = colorScheme[index % colorScheme.length];
    });
    
    return patientColors;
  }, []);

  // Función para cargar los tratamientos y mapearlos por ID
  const fetchTratamientos = useCallback(async () => {
    try {
      const response = await fetch("https://back-end-4803.onrender.com/api/tratamientos/all");
      if (!response.ok) throw new Error("Error al obtener los tratamientos");

      const data = await response.json();
      const tratamientosMap = {};

      data.forEach(tratamiento => {
          tratamientosMap[tratamiento.id] = tratamiento;
      });

      setTratamientos(tratamientosMap);
      return tratamientosMap;
    } catch (error) {
      console.error("Error cargando tratamientos:", error);
      setNotificationMessage("No fue posible cargar los tratamientos. Por favor, intente más tarde.");
      setNotificationType("error");
      setOpenNotification(true);
      return {};
    }
  }, []);

  // Función para obtener citas
  const fetchCitas = useCallback(async () => {
    try {
      const response = await fetch("https://back-end-4803.onrender.com/api/citas/all");
      if (!response.ok) throw new Error("Error al obtener las citas");

      const data = await response.json();
      const citasFiltradas = data.filter(cita => !cita.archivado);
      
      // Agrupar las citas por tratamiento para verificar y asignar números
      const citasPorTratamiento = {};

      // Primero agrupar todas las citas por tratamiento_id
      citasFiltradas.forEach(cita => {
        if (cita.tratamiento_id) {
          if (!citasPorTratamiento[cita.tratamiento_id]) {
            citasPorTratamiento[cita.tratamiento_id] = [];
          }
          citasPorTratamiento[cita.tratamiento_id].push(cita);
        }
      });

      // Ordenar las citas de cada tratamiento por fecha y asignar número
      Object.keys(citasPorTratamiento).forEach(tratamientoId => {
        // Ordenar por fecha de consulta
        citasPorTratamiento[tratamientoId].sort((a, b) => {
          return new Date(a.fecha_consulta) - new Date(b.fecha_consulta);
        });

        // Asignar número de cita secuencial (1, 2, 3...) en el orden de las fechas
        citasPorTratamiento[tratamientoId].forEach((cita, index) => {
          cita.numero_cita_calculado = index + 1;
        });
      });

      // Actualizar las citas con los números calculados
      const citasActualizadas = citasFiltradas.map(cita => {
        if (cita.tratamiento_id && citasPorTratamiento[cita.tratamiento_id]) {
          const citaEnGrupo = citasPorTratamiento[cita.tratamiento_id].find(
            c => c.consulta_id === cita.consulta_id
          );
          if (citaEnGrupo) {
            return { ...cita, numero_cita_calculado: citaEnGrupo.numero_cita_calculado };
          }
        }
        return cita;
      });

      return citasActualizadas;
    } catch (error) {
      console.error("Error cargando citas:", error);
      setNotificationMessage("No fue posible cargar las citas. Por favor, intente más tarde.");
      setNotificationType("error");
      setOpenNotification(true);
      return [];
    }
  }, []);

  // Función para obtener eventos
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    
    try {
      // Obtener datos de múltiples endpoints en paralelo
      const [tratamientosData, citasData] = await Promise.all([
        fetchTratamientos(),
        fetchCitas()
      ]);
      
      if (!citasData || citasData.length === 0) {
        setLoading(false);
        return;
      }
      
      // Extraer pacientes únicos
      const uniquePatients = [];
      const uniquePatientsIds = new Set();
      
      citasData.forEach(cita => {
        if (cita.paciente_id && !uniquePatientsIds.has(cita.paciente_id)) {
          uniquePatientsIds.add(cita.paciente_id);
          uniquePatients.push({
            id: cita.paciente_id,
            nombre: cita.paciente_nombre || "",
            apellido_paterno: cita.paciente_apellido_paterno || "",
            apellido_materno: cita.paciente_apellido_materno || ""
          });
        }
      });
      
      // Generar colores para los pacientes
      const patientColors = generatePatientColors(Array.from(uniquePatientsIds));
      setPacienteColors(patientColors);
      setPacientes(uniquePatients);
      
      // Extraer odontólogos únicos
      const uniqueOdontologos = [];
      const uniqueOdontologosIds = new Set();
      
      citasData.forEach(cita => {
        if (cita.odontologo_id && !uniqueOdontologosIds.has(cita.odontologo_id)) {
          uniqueOdontologosIds.add(cita.odontologo_id);
          uniqueOdontologos.push({
            id: cita.odontologo_id,
            nombre: cita.odontologo_nombre || "Sin nombre"
          });
        }
      });
      
      setOdontologos(uniqueOdontologos);
      
      // Mapeo y formateo de los eventos
      const formattedEvents = citasData.map((cita) => {
        const startDate = moment(cita.fecha_consulta).toDate();

        // Determinar duración (predeterminada: 30 minutos)
        let duration = 30;
        if (cita.duracion) {
          duration = parseInt(cita.duracion);
        }

        const endDate = new Date(startDate.getTime() + duration * 60000);

        // Determinar si el evento es pasado
        const isPast = startDate < new Date();

        // Determinar si es un tratamiento o una consulta normal
        const esTratamiento = cita.tratamiento_id || cita.es_tratamiento === 1;
        const tipoEvento = esTratamiento ? "tratamiento" : "consulta";

        // Número de cita de tratamiento (usar el calculado o el original)
        const numCitaTratamiento = cita.numero_cita_calculado || cita.numero_cita_tratamiento || 1;

        // Relacionar con la información del tratamiento completo
        let tratamientoInfo = null;
        if (esTratamiento && cita.tratamiento_id && tratamientosData[cita.tratamiento_id]) {
          tratamientoInfo = tratamientosData[cita.tratamiento_id];
        }

        // Procesamiento mejorado del título
        let title = cita.servicio_nombre;
        if (esTratamiento && cita.categoria_servicio) {
          title = `${cita.categoria_servicio} - ${cita.servicio_nombre}`;
          if (numCitaTratamiento) {
            title += ` (${numCitaTratamiento})`;
          }
        }
        
        // Determinar el color según paciente (para identificar todas las citas de un mismo paciente)
        const pacienteColor = cita.paciente_id ? patientColors[cita.paciente_id] : null;
        // Color de la categoría del servicio (para diferenciar tipos de servicio)
        const categoriaColor = categoryColors[cita.categoria_servicio] || categoryColors.default;
        
        return {
          id: cita.consulta_id,
          title: title,
          start: startDate,
          end: endDate,
          startTime: moment(startDate).format("HH:mm"),
          duration: duration,
          categoria: cita.categoria_servicio || "General",
          color: categoriaColor,
          pacienteColor: pacienteColor,
          estado: cita.estado || "Pendiente",
          isPast: isPast,
          opacity: isPast ? 0.7 : 1,
          odontologo_id: cita.odontologo_id,
          odontologo_nombre: cita.odontologo_nombre || "No asignado",
          paciente_nombre: `${cita.paciente_nombre || ''} ${cita.paciente_apellido_paterno || ''} ${cita.paciente_apellido_materno || ''}`.trim(),
          paciente_id: cita.paciente_id,
          esTratamiento: esTratamiento,
          tipoEvento: tipoEvento,
          tratamiento_id: cita.tratamiento_id,
          numero_cita_tratamiento: numCitaTratamiento,
          tratamientoInfo: tratamientoInfo,
          notas: cita.notas,
          servicio_id: cita.servicio_id,
          precio_servicio: cita.precio_servicio,
          paciente_genero: cita.paciente_genero,
          paciente_correo: cita.paciente_correo,
          paciente_telefono: cita.paciente_telefono,
          paciente_fecha_nacimiento: cita.paciente_fecha_nacimiento,
          fecha_solicitud: cita.fecha_solicitud
        };
      });
      
      // Calcular estadísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const stats = {
        totalCitas: formattedEvents.length,
        citasPendientes: formattedEvents.filter(e => e.estado === 'Pendiente').length,
        citasConfirmadas: formattedEvents.filter(e => e.estado === 'Confirmada').length,
        citasCanceladas: formattedEvents.filter(e => e.estado === 'Cancelada').length,
        citasCompletadas: formattedEvents.filter(e => e.estado === 'Completada').length,
        preRegistros: formattedEvents.filter(e => e.estado === 'PRE-REGISTRO').length
      };
      
      // Contar citas programadas para hoy
      const citasHoy = formattedEvents.filter(event => 
        event.start >= today && event.start < tomorrow
      ).length;
      
      setTodayCitas(citasHoy);
      setEstadisticas(stats);
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
      updateCategoryCounts(formattedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los eventos:", error);
      setNotificationMessage("No fue posible cargar las citas. Por favor, intente más tarde.");
      setNotificationType("error");
      setOpenNotification(true);
      setLoading(false);
    }
  }, [fetchTratamientos, fetchCitas, generatePatientColors]);

  // Actualizar conteo de categorías
  const updateCategoryCounts = (eventsArray) => {
    const counts = eventsArray.reduce((acc, event) => {
      const category = event.categoria || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    setCategoryCounts(counts);
  };

  // Efecto inicial para cargar datos
  useEffect(() => {
    fetchEvents();

    // Actualización periódica cada 2 minutos
    const interval = setInterval(fetchEvents, 120000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Aplicar filtros
  const applyFilter = useCallback((filterType, value) => {
    let filtered = [...events];
    let isFilterActive = filterType !== 'all';

    // Aplicar filtro por tipo
    if (filterType === 'all') {
      // Reiniciar odontólogo, paciente y estado seleccionados
      setSelectedOdontologo('all');
      setSelectedEstado('all');
      setSelectedPaciente('all');
    } else if (filterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      filtered = filtered.filter(event =>
        event.start >= today && event.start < tomorrow
      );
    } else if (filterType === 'upcoming') {
      const now = new Date();
      filtered = filtered.filter(event => event.start >= now);
    } else if (filterType === 'past') {
      const currentDate = new Date();
      filtered = filtered.filter(event => event.start < currentDate);
    } else if (filterType === 'status') {
      filtered = filtered.filter(event => event.estado === value);
      setSelectedEstado(value);
    } else if (filterType === 'category') {
      filtered = filtered.filter(event => event.categoria === value);
    }

    // Aplicar filtro adicional por odontólogo (si está seleccionado)
    if (selectedOdontologo !== 'all') {
      filtered = filtered.filter(event =>
        event.odontologo_id === selectedOdontologo
      );
    }

    // Aplicar filtro adicional por paciente (si está seleccionado)
    if (selectedPaciente !== 'all') {
      filtered = filtered.filter(event =>
        event.paciente_id === selectedPaciente
      );
    }

    // Aplicar filtro adicional por estado (si está seleccionado)
    if (selectedEstado !== 'all' && filterType !== 'status') {
      filtered = filtered.filter(event =>
        event.estado === selectedEstado
      );
    }

    setFilteredEvents(filtered);
    setFilterActive(isFilterActive || selectedOdontologo !== 'all' || selectedEstado !== 'all' || selectedPaciente !== 'all');
  }, [events, selectedOdontologo, selectedEstado, selectedPaciente]);

  // Cambio de odontólogo
  const handleOdontologoChange = useCallback((value) => {
    setSelectedOdontologo(value);
    let filtered = [...events];

    if (value !== 'all') {
      filtered = filtered.filter(event => event.odontologo_id === value);
      setFilterActive(true);
    }

    // Aplicar filtro adicional por estado (si está seleccionado)
    if (selectedEstado !== 'all') {
      filtered = filtered.filter(event => event.estado === selectedEstado);
    }
    
    // Aplicar filtro adicional por paciente (si está seleccionado)
    if (selectedPaciente !== 'all') {
      filtered = filtered.filter(event => event.paciente_id === selectedPaciente);
    }

    setFilteredEvents(filtered);
  }, [events, selectedEstado, selectedPaciente]);

  // Cambio de estado
  const handleEstadoChange = useCallback((value) => {
    setSelectedEstado(value);
    let filtered = [...events];

    if (value !== 'all') {
      filtered = filtered.filter(event => event.estado === value);
      setFilterActive(true);
    }

    // Aplicar filtro adicional por odontólogo (si está seleccionado)
    if (selectedOdontologo !== 'all') {
      filtered = filtered.filter(event => event.odontologo_id === selectedOdontologo);
    }
    
    // Aplicar filtro adicional por paciente (si está seleccionado)
    if (selectedPaciente !== 'all') {
      filtered = filtered.filter(event => event.paciente_id === selectedPaciente);
    }

    setFilteredEvents(filtered);
  }, [events, selectedOdontologo, selectedPaciente]);

  // Cambio de paciente 
  const handlePacienteChange = useCallback((value) => {
    setSelectedPaciente(value);
    let filtered = [...events];

    if (value !== 'all') {
      filtered = filtered.filter(event => event.paciente_id === value);
      setFilterActive(true);
    }

    // Aplicar filtro adicional por odontólogo (si está seleccionado)
    if (selectedOdontologo !== 'all') {
      filtered = filtered.filter(event => event.odontologo_id === selectedOdontologo);
    }
    
    // Aplicar filtro adicional por estado (si está seleccionado)
    if (selectedEstado !== 'all') {
      filtered = filtered.filter(event => event.estado === selectedEstado);
    }

    setFilteredEvents(filtered);
  }, [events, selectedOdontologo, selectedEstado]);

  // Búsqueda de paciente
  const handleSearch = useCallback((searchText) => {
    if (!searchText.trim()) {
      setFilteredEvents(events);
      setFilterActive(false);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = events.filter(event =>
      (event.paciente_nombre && event.paciente_nombre.toLowerCase().includes(searchLower))
    );

    setFilteredEvents(filtered);
    setFilterActive(true);

    // Mostrar mensaje si no hay resultados
    if (filtered.length === 0) {
      setNotificationMessage(`No se encontraron citas para "${searchText}"`);
      setNotificationType("info");
      setOpenNotification(true);
    }
  }, [events]);

  // Manejador para imprimir
  const handlePrint = () => {
    window.print();
  };

  // Manejador para seleccionar un evento
  const handleSelectEvent = useCallback((event) => {
    setSelectedCita(event);
    setOpenDialog(true);
  }, []);

  // Función para manejar el tooltip al hacer hover sobre un evento
  const handleEventMouseOver = useCallback((event, e) => {
    if (!event) return;

    // Obtener posición del elemento
    const targetRect = e.currentTarget.getBoundingClientRect();

    // Configurar contenido del tooltip con información mejorada
    setTooltipContent({
      id: event.id,
      title: event.title,
      paciente: event.paciente_nombre,
      pacienteId: event.paciente_id,
      odontologo: event.odontologo_nombre,
      time: event.startTime,
      duration: `${event.duration} min`,
      categoria: event.categoria,
      estado: event.estado,
      color: event.color,
      pacienteColor: event.pacienteColor,
      isPast: event.isPast,
      esTratamiento: event.esTratamiento,
      tratamiento_id: event.tratamiento_id,
      numero_cita_tratamiento: event.numero_cita_tratamiento,
      tratamientoInfo: event.tratamientoInfo
    });

    // Posicionar tooltip (ajustando según sea móvil o desktop)
    setTooltipPosition({
      left: targetRect.left + window.scrollX + (isMobile ? 0 : targetRect.width / 2),
      top: targetRect.bottom + window.scrollY
    });

    setShowTooltip(true);
  }, [isMobile]);

  const handleEventMouseOut = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // Función mejorada para el estilo de los eventos
  const eventStyleGetter = useCallback((event) => {
    const statusColor = statusConfig[event.estado]?.color || categoryColors.default;
    const pacienteColor = event.pacienteColor || categoryColors.default;
    
    // Determinar si hay más citas del mismo paciente
    const pacienteCitas = events.filter(e => e.paciente_id === event.paciente_id).length;
    const multiplesCitas = pacienteCitas > 1;

    // Estilo base del evento
    const baseStyle = {
      backgroundColor: multiplesCitas ? pacienteColor : event.color, // Usar color del paciente si tiene múltiples citas
      opacity: event.opacity,
      color: "white",
      fontSize: "13px",
      padding: "4px 8px",
      borderRadius: "4px",
      fontWeight: 500,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      cursor: "pointer",
      transition: "all 0.2s ease"
    };

    // Personalización según tipo de evento y estado
    if (event.esTratamiento) {
      // Estilo para tratamientos
      return {
        style: {
          ...baseStyle,
          borderLeft: `4px solid ${statusColor}`,
          borderRight: `4px solid ${event.color}`, // Borde derecho con el color de categoría
          backgroundImage: `linear-gradient(45deg, ${multiplesCitas ? adjustColor(pacienteColor, 10) : adjustColor(event.color, 10)} 25%, ${multiplesCitas ? pacienteColor : event.color} 25%, ${multiplesCitas ? pacienteColor : event.color} 50%, ${multiplesCitas ? adjustColor(pacienteColor, 10) : adjustColor(event.color, 10)} 50%, ${multiplesCitas ? adjustColor(pacienteColor, 10) : adjustColor(event.color, 10)} 75%, ${multiplesCitas ? pacienteColor : event.color} 75%, ${multiplesCitas ? pacienteColor : event.color})`,
          backgroundSize: '10px 10px',
        }
      };
    } else {
      // Estilo para consultas normales
      return {
        style: {
          ...baseStyle,
          borderLeft: `4px solid ${statusColor}`,
          borderRight: multiplesCitas ? `4px solid ${event.color}` : 'none', // Mostrar borde de categoría si tiene múltiples citas
        }
      };
    }
  }, [events]);

  // Función auxiliar para ajustar colores (aclarar/oscurecer)
  const adjustColor = (hex, percent) => {
    // Convertir hex a RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // Ajustar valores
    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));

    // Convertir de vuelta a hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Función mejorada para el estilo de las celdas de días
  const dayPropGetter = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar si es hoy
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      // Contar citas para el día de hoy
      const citasHoy = events.filter(event => 
        new Date(event.start).getDate() === date.getDate() &&
        new Date(event.start).getMonth() === date.getMonth() &&
        new Date(event.start).getFullYear() === date.getFullYear()
      ).length;

      return {
        style: {
          backgroundColor: colors.todayBackground,
          position: 'relative',
          borderRadius: "4px",
          // Quitamos el borde y el boxShadow aquí para evitar conflictos
          // El borde se aplicará con CSS en .rbc-today
          filter: 'drop-shadow(0 0 2px rgba(25, 118, 210, 0.4))',
        },
        className: 'today-cell'
      };
    }

    // Verificar si es un día pasado
    if (date < today) {
      return {
        style: {
          backgroundColor: colors.pastDayBackground,
          opacity: 0.8,
        },
      };
    }

    // Verificar si es fin de semana
    const day = date.getDay();
    if (day === 0 || day === 6) { // 0 = domingo, 6 = sábado
      return {
        style: {
          backgroundColor: isDarkTheme ? '#0f223a' : '#f0f4f8',
        },
      };
    }

    return {};
  }, [colors.pastDayBackground, colors.todayBackground, colors.todayHighlight, isDarkTheme, events]);

  // Componentes de personalización del calendario
  const components = useMemo(() => ({
    toolbar: (toolbarProps) => (
      <CustomToolbar
        {...toolbarProps}
        isDarkTheme={isDarkTheme}
        onRefresh={fetchEvents}
        onPrint={handlePrint}
        onSearch={handleSearch}
        onFilter={applyFilter}
        filterActive={filterActive}
        odontologos={odontologos}
        selectedOdontologo={selectedOdontologo}
        onOdontologoChange={handleOdontologoChange}
        estados={estadosCitas}
        selectedEstado={selectedEstado}
        onEstadoChange={handleEstadoChange}
        pacientes={pacientes}
        selectedPaciente={selectedPaciente}
        onPacienteChange={handlePacienteChange}
      />
    ),
    // Personalización del formato de tiempo en el evento
    eventTimeRangeFormat: ({ start, end }) => {
      return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
    },
    eventContainerWrapper: ({ children }) => {
      return React.cloneElement(children, {
        style: {
          ...children.props.style,
          cursor: 'pointer'
        }
      });
    },
    // Componente mejorado para el encabezado de las fechas (resaltar el día de hoy)
    dateCellWrapper: (props) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isToday = 
        props.value.getDate() === today.getDate() &&
        props.value.getMonth() === today.getMonth() &&
        props.value.getFullYear() === today.getFullYear();
      
      // Contar citas para este día
      const citasDia = events.filter(event => 
        new Date(event.start).getDate() === props.value.getDate() &&
        new Date(event.start).getMonth() === props.value.getMonth() &&
        new Date(event.start).getFullYear() === props.value.getFullYear()
      ).length;
      
      return (
        <div
          className={isToday ? "rbc-day-bg today-cell" : "rbc-day-bg"}
          style={{
            position: "relative",
            ...props.style
          }}
        >
          {props.children}
          
          {/* Indicador del día actual (modificado para no interferir con la fecha) */}
          {isToday && (
            <Tooltip title="Hoy">
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: `2px solid ${colors.todayHighlight}`,
                  borderRadius: "4px",
                  pointerEvents: "none",
                  zIndex: 0
                }}
              />
            </Tooltip>
          )}
          
          {/* Mostrar indicador de cantidad de citas si hay más de 0 */}
          {citasDia > 0 && (
            <Tooltip title={`${citasDia} citas programadas`}>
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 8,
                  fontSize: "0.7rem",
                  padding: "1px 6px",
                  backgroundColor: isDarkTheme ? "rgba(25, 118, 210, 0.2)" : "rgba(25, 118, 210, 0.1)",
                  color: colors.primary,
                  borderRadius: "10px",
                  border: `1px solid ${colors.primary}`,
                  cursor: "pointer",
                  zIndex: 1
                }}
              >
                {citasDia}
              </div>
            </Tooltip>
          )}
        </div>
      );
    }
  }), [isDarkTheme, colors.primary, colors.todayHighlight, fetchEvents, filterActive, odontologos, selectedOdontologo, estadosCitas, selectedEstado, pacientes, selectedPaciente, handleOdontologoChange, handleEstadoChange, handlePacienteChange, applyFilter, handleSearch, events]);

  return (
    <>
      {/* Fondo de página con gradiente mejorado */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: colors.background,
          zIndex: -1,
          backgroundImage: isDarkTheme
            ? 'linear-gradient(180deg, rgba(13, 37, 63, 0.9) 0%, rgba(10, 25, 41, 1) 100%)'
            : 'linear-gradient(180deg, rgba(225, 245, 254, 0.9) 0%, rgba(248, 250, 255, 1) 100%)',
        }}
      />

      <Container maxWidth="xl" sx={{ pt: 9, pb: 5 }}>
        {/* Encabezado con indicador de citas de hoy */}
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: colors.text,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <DateRangeIcon fontSize="large" sx={{ color: colors.primary }} />
                Sistema de Agenda de Citas
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: colors.secondaryText,
                  mb: 0.5,
                }}
              >
                Odontología Carol - Panel de Administración
              </Typography>
              
              {/* Indicador de citas para hoy */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1,
                  p: 1,
                  borderRadius: '8px',
                  backgroundColor: colors.todayBackground,
                  border: `1px solid ${colors.todayHighlight}`,
                  maxWidth: 'fit-content'
                }}
              >
                <TodayIcon sx={{ color: colors.todayHighlight, mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkTheme ? '#fff' : '#333' }}>
                  Hoy: {moment().format('dddd, D [de] MMMM')}
                </Typography>
                <Chip
                  size="small"
                  label={`${todayCitas} citas`}
                  sx={{
                    ml: 2,
                    bgcolor: todayCitas > 0 ? colors.todayHighlight : 'grey.500',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<InfoIcon />}
                onClick={() => setIsDrawerOpen(true)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                }}
              >
                Panel Informativo
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Estadísticas rápidas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: isDarkTheme ? 'rgba(144, 202, 249, 0.05)' : '#e3f2fd',
                border: `1px solid ${isDarkTheme ? 'rgba(144, 202, 249, 0.1)' : '#bbdefb'}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  opacity: 0.1,
                  transform: 'rotate(15deg)',
                }}
              >
                <EventIcon sx={{ fontSize: 80, color: colors.primary }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="100%" height={60} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary }}>
                  {estadisticas.totalCitas}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: colors.secondaryText, fontWeight: 500 }}>
                Total de Citas
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: isDarkTheme ? 'rgba(255, 152, 0, 0.05)' : '#fff8e1',
                border: `1px solid ${isDarkTheme ? 'rgba(255, 152, 0, 0.1)' : '#ffe082'}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  opacity: 0.1,
                  transform: 'rotate(15deg)',
                }}
              >
                <WatchLaterIcon sx={{ fontSize: 80, color: '#ff9800' }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="100%" height={60} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {estadisticas.citasPendientes}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: colors.secondaryText, fontWeight: 500 }}>
                Pendientes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: isDarkTheme ? 'rgba(76, 175, 80, 0.05)' : '#e8f5e9',
                border: `1px solid ${isDarkTheme ? 'rgba(76, 175, 80, 0.1)' : '#c8e6c9'}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  opacity: 0.1,
                  transform: 'rotate(15deg)',
                }}
              >
                <CheckIcon sx={{ fontSize: 80, color: '#4caf50' }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="100%" height={60} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {estadisticas.citasConfirmadas}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: colors.secondaryText, fontWeight: 500 }}>
                Confirmadas
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: isDarkTheme ? 'rgba(244, 67, 54, 0.05)' : '#ffebee',
                border: `1px solid ${isDarkTheme ? 'rgba(244, 67, 54, 0.1)' : '#ffcdd2'}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  opacity: 0.1,
                  transform: 'rotate(15deg)',
                }}
              >
                <CancelIcon sx={{ fontSize: 80, color: '#f44336' }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="100%" height={60} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {estadisticas.citasCanceladas}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: colors.secondaryText, fontWeight: 500 }}>
                Canceladas
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: isDarkTheme ? 'rgba(63, 81, 181, 0.05)' : '#e8eaf6',
                border: `1px solid ${isDarkTheme ? 'rgba(63, 81, 181, 0.1)' : '#c5cae9'}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  opacity: 0.1,
                  transform: 'rotate(15deg)',
                }}
              >
                <AssignmentIcon sx={{ fontSize: 80, color: '#3f51b5' }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="100%" height={60} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3f51b5' }}>
                  {estadisticas.citasCompletadas}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: colors.secondaryText, fontWeight: 500 }}>
                Completadas
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: isDarkTheme ? 'rgba(156, 39, 176, 0.05)' : '#f3e5f5',
                border: `1px solid ${isDarkTheme ? 'rgba(156, 39, 176, 0.1)' : '#e1bee7'}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  opacity: 0.1,
                  transform: 'rotate(15deg)',
                }}
              >
                <PersonIcon sx={{ fontSize: 80, color: '#9c27b0' }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="100%" height={60} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {estadisticas.preRegistros}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: colors.secondaryText, fontWeight: 500 }}>
                Pre-registros
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Calendario con carga mejorada */}
        <CalendarCard darkTheme={isDarkTheme}>
          <CalendarLoading loading={loading} isDarkTheme={isDarkTheme} />
          <Box
            sx={{
              "& .rbc-calendar": {
                fontFamily: theme.typography.fontFamily,
              },
              "& .rbc-header": {
                padding: "10px 6px",
                fontWeight: 600,
                fontSize: "14px",
                color: colors.text,
                textTransform: "uppercase",
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
              },
              "& .rbc-month-view": {
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                overflow: "hidden",
              },
              "& .rbc-day-bg": {
                transition: "background-color 0.2s ease",
              },
              "& .rbc-off-range-bg": {
                backgroundColor: isDarkTheme ? "#0a1929" : "#f5f5f5",
              },
              "& .rbc-off-range": {
                color: isDarkTheme ? "#546e7a" : "#9e9e9e",
              },
              "& .rbc-date-cell": {
                padding: "4px 8px",
                textAlign: "right",
                color: colors.text,
                position: "relative",
                zIndex: 2,
              },
              "& .rbc-today": {
                backgroundColor: colors.todayBackground,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: `2px solid ${colors.todayHighlight}`,
                  borderRadius: "4px",
                  pointerEvents: "none",
                  zIndex: 1
                }
              },
              "& .today-cell": {
                position: "relative",
                "& .rbc-date-cell": {
                  color: colors.todayHighlight,
                  fontWeight: "bold",
                  zIndex: 3,
                  position: "relative"
                }
              },
              "& .rbc-event": {
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                },
              },
              "& .rbc-show-more": {
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: colors.primary,
                fontWeight: 500,
                borderRadius: '4px',
                padding: '0 4px',
                marginTop: '2px',
                '&:hover': {
                  backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
                }
              },
              "& .rbc-agenda-view table.rbc-agenda-table": {
                fontSize: isMobile ? "0.8rem" : "inherit",
                borderRadius: "8px",
                overflow: "hidden",
                border: `1px solid ${colors.border}`,
              },
              "& .rbc-agenda-view table.rbc-agenda-table thead > tr > th": {
                padding: isMobile ? "6px" : "12px 8px",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: colors.text,
                backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                borderBottom: `1px solid ${colors.border}`,
              },
              "& .rbc-agenda-view table.rbc-agenda-table tbody > tr > td": {
                padding: isMobile ? "4px 6px" : "10px 8px",
                borderBottom: `1px solid ${colors.border}`,
                color: colors.text,
              },
              "& .rbc-agenda-time-cell": {
                fontWeight: 500,
                color: isDarkTheme ? '#90caf9' : '#1976d2',
              },
              "& .rbc-agenda-date-cell": {
                fontWeight: 500,
                color: isDarkTheme ? '#ffb74d' : '#f57c00',
              },
              "& .rbc-agenda-event-cell": {
                fontWeight: 400,
              },
              "& .rbc-time-view": {
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                overflow: "hidden",
              },
              "& .rbc-time-header": {
                borderBottom: `1px solid ${colors.border}`,
              },
              "& .rbc-time-header-content": {
                borderLeft: `1px solid ${colors.border}`,
              },
              "& .rbc-time-content": {
                borderTop: `1px solid ${colors.border}`,
              },
              "& .rbc-time-gutter": {
                color: colors.secondaryText,
              },
              "& .rbc-timeslot-group": {
                borderBottom: `1px solid ${colors.border}`,
              },
              "& .rbc-day-slot .rbc-time-slot": {
                borderTop: `1px dotted ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
              },
              "@media print": {
                "& .rbc-toolbar": {
                  display: "none",
                },
                "& .rbc-agenda-view table.rbc-agenda-table": {
                  border: "1px solid #000",
                },
                "& .rbc-agenda-view table.rbc-agenda-table thead > tr > th": {
                  border: "1px solid #000",
                  color: "#000",
                  fontWeight: "bold"
                },
                "& .rbc-agenda-view table.rbc-agenda-table tbody > tr > td": {
                  border: "1px solid #000",
                  color: "#000"
                }
              },
              // Estado de carga
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{
                height: isMobile ? 500 : 700,
                fontSize: isMobile ? "0.8rem" : "0.9rem"
              }}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              view={currentView}
              date={date}
              onView={setCurrentView}
              onNavigate={newDate => setDate(newDate)}
              messages={messages}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              components={components}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={() => { }}
              selectable={false}
              popup={true}
              onDoubleClickEvent={handleSelectEvent}
              onMouseOverEvent={handleEventMouseOver}
              onMouseOutEvent={handleEventMouseOut}
              longPressThreshold={250}
            />
          </Box>
        </CalendarCard>

        {/* Tooltip personalizado mejorado */}
        {showTooltip && tooltipContent && (
          <EventTooltip
            sx={{
              position: 'absolute',
              zIndex: 9999,
              left: `${tooltipPosition.left}px`,
              top: `${tooltipPosition.top}px`,
              transform: 'translateX(-50%)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 6,
                  minWidth: 6,
                  height: '100%',
                  borderRadius: '4px',
                  // Mostrar el color del paciente si tiene varias citas
                  bgcolor: tooltipContent.pacienteColor || tooltipContent.color,
                  mr: 1.5
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                {/* Tipo de evento (tratamiento o consulta) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5
                  }}
                >
                  <Chip
                    size="small"
                    icon={tooltipContent.esTratamiento ?
                      <AssignmentIcon style={{ fontSize: 14, color: '#4CAF50' }} /> :
                      <LocalHospitalIcon style={{ fontSize: 14, color: '#607D8B' }} />
                    }
                    label={tooltipContent.esTratamiento ? 'Tratamiento' : 'Consulta'}
                    sx={{
                      backgroundColor: tooltipContent.esTratamiento ?
                        (isDarkTheme ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)') :
                        (isDarkTheme ? 'rgba(96, 125, 139, 0.15)' : 'rgba(96, 125, 139, 0.1)'),
                      color: tooltipContent.esTratamiento ? '#4CAF50' : '#607D8B',
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      '& .MuiChip-label': {
                        px: 1
                      }
                    }}
                  />

                  {/* Mostrar categoría de servicio */}
                  <Chip
                    size="small"
                    label={tooltipContent.categoria}
                    sx={{
                      backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                      color: tooltipContent.color,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      border: `1px solid ${tooltipContent.color}`,
                      '& .MuiChip-label': {
                        px: 1
                      }
                    }}
                  />

                  {/* Mostrar número de cita si es un tratamiento */}
                  {tooltipContent.esTratamiento && tooltipContent.numero_cita_tratamiento && (
                    <Chip
                      size="small"
                      label={`Cita ${tooltipContent.numero_cita_tratamiento}`}
                      sx={{
                        backgroundColor: isDarkTheme ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)',
                        color: '#FF9800',
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ lineHeight: 1.3 }}
                >
                  {tooltipContent.title}
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: tooltipContent.pacienteColor || 'text.secondary', fontSize: 18 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 220
                      }}
                    >
                      {tooltipContent.paciente || 'Paciente no asignado'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <LocalHospitalIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2">
                      {tooltipContent.odontologo || 'Odontólogo no asignado'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {tooltipContent.time}
                      <span style={{ opacity: 0.8, marginLeft: 4 }}>
                        ({tooltipContent.duration})
                      </span>
                    </Typography>
                  </Box>
                </Box>

                {/* Mostrar información del tratamiento si existe */}
                {tooltipContent.tratamientoInfo && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Tratamiento:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {tooltipContent.tratamientoInfo.nombre_tratamiento}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progreso:
                        </Typography>
                        <Typography variant="caption" fontWeight={500}>
                          {tooltipContent.tratamientoInfo.citas_completadas} de {tooltipContent.tratamientoInfo.total_citas_programadas} citas
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  {/* Estado */}
                  <StatusChip
                    size="small"
                    label={tooltipContent.estado}
                    status={tooltipContent.estado}
                    isDarkTheme={isDarkTheme}
                    icon={React.createElement(statusConfig[tooltipContent.estado]?.icon || InfoIcon, {
                      style: { fontSize: 14 }
                    })}
                    sx={{ height: 22, fontWeight: 500 }}
                  />
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => handleSelectEvent(tooltipContent)}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    color: tooltipContent.esTratamiento ? '#4CAF50' : colors.primary,
                    borderColor: tooltipContent.esTratamiento ? '#4CAF50' : colors.primary,
                    '&:hover': {
                      borderColor: tooltipContent.esTratamiento ? '#2E7D32' : colors.hover,
                      backgroundColor: tooltipContent.esTratamiento ? 'rgba(76, 175, 80, 0.08)' : colors.hover
                    }
                  }}
                  startIcon={tooltipContent.esTratamiento ?
                    <AssignmentIcon /> :
                    <InfoIcon />
                  }
                >
                  Ver detalles
                </Button>
              </Box>
            </Box>
          </EventTooltip>
        )}
      </Container>

      {/* Panel lateral mejorado */}
      <SwipeableDrawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpen={() => setIsDrawerOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box sx={{ width: 320, p: 3, height: '100%', overflow: 'auto', bgcolor: isDarkTheme ? '#102a43' : '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2, color: colors.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon />
            Panel Informativo
          </Typography>

          {/* Información de hoy destacada */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: colors.todayBackground,
              border: `1px solid ${colors.todayHighlight}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
              <TodayIcon sx={{ fontSize: 80, color: colors.todayHighlight }} />
            </Box>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.todayHighlight, mb: 1 }}>
              {moment().format('dddd, D [de] MMMM')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: isDarkTheme ? '#fff' : '#333' }}>
                Citas programadas:
              </Typography>
              <Chip 
                label={todayCitas}
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: colors.todayHighlight,
                  color: 'white'
                }}
              />
            </Box>
            
            {/* Botón para ver citas de hoy */}
            <Button
              size="small"
              variant="outlined"
              fullWidth
              onClick={() => {
                applyFilter('today');
                setIsDrawerOpen(false);
              }}
              sx={{ 
                mt: 1,
                borderColor: colors.todayHighlight,
                color: colors.todayHighlight,
                '&:hover': {
                  borderColor: colors.todayHighlight,
                  bgcolor: alpha(colors.todayHighlight, 0.1)
                }
              }}
            >
              Ver agenda de hoy
            </Button>
          </Paper>

          <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text }}>
            Estadísticas de Citas
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: isDarkTheme ? 'rgba(144, 202, 249, 0.08)' : '#e3f2fd',
                    borderRadius: 2
                  }}
                >
                  {loading ? (
                    <Skeleton variant="text" width="100%" height={40} />
                  ) : (
                    <Typography variant="h5" sx={{ color: colors.primary, fontWeight: 600 }}>
                      {estadisticas.totalCitas}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    Total Citas
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: isDarkTheme ? 'rgba(255, 183, 77, 0.08)' : '#fff8e1',
                    borderRadius: 2
                  }}
                >
                  {loading ? (
                    <Skeleton variant="text" width="100%" height={40} />
                  ) : (
                    <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 600 }}>
                      {estadisticas.citasPendientes}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    Pendientes
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: isDarkTheme ? 'rgba(129, 199, 132, 0.08)' : '#e8f5e9',
                    borderRadius: 2
                  }}
                >
                  {loading ? (
                    <Skeleton variant="text" width="100%" height={40} />
                  ) : (
                    <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 600 }}>
                      {estadisticas.citasConfirmadas}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    Confirmadas
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: isDarkTheme ? 'rgba(229, 115, 115, 0.08)' : '#ffebee',
                    borderRadius: 2
                  }}
                >
                  {loading ? (
                    <Skeleton variant="text" width="100%" height={40} />
                  ) : (
                    <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 600 }}>
                      {estadisticas.citasCanceladas}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    Canceladas
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Leyenda de pacientes (Nuevo) */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text, display: 'flex', alignItems: 'center' }}>
            <PeopleIcon fontSize="small" sx={{ mr: 0.5, color: colors.primary }} />
            Pacientes con múltiples citas
          </Typography>

          <Box sx={{ mb: 3 }}>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={100} />
            ) : (
              pacientes
                .filter(paciente => {
                  // Filtrar pacientes con más de 1 cita
                  const pacienteCitas = events.filter(e => e.paciente_id === paciente.id);
                  return pacienteCitas.length > 1;
                })
                .sort((a, b) => {
                  // Ordenar por cantidad de citas (descendente)
                  const citasA = events.filter(e => e.paciente_id === a.id).length;
                  const citasB = events.filter(e => e.paciente_id === b.id).length;
                  return citasB - citasA;
                })
                .slice(0, 5) // Mostrar los 5 principales
                .map(paciente => {
                  const pacienteCitas = events.filter(e => e.paciente_id === paciente.id);
                  const color = pacienteColors[paciente.id];
                  return (
                    <Box
                      key={paciente.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        '&:hover': {
                          bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => {
                        setSelectedPaciente(paciente.id);
                        setIsDrawerOpen(false);
                        setFilterActive(true);
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: color || '#9e9e9e',
                            mr: 1
                          }}
                        />
                        <Typography variant="body2" sx={{ color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                          {`${paciente.nombre} ${paciente.apellido_paterno}`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          size="small" 
                          label={pacienteCitas.length} 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem', 
                            bgcolor: isDarkTheme ? alpha(color, 0.2) : alpha(color, 0.1),
                            color: color,
                            fontWeight: 600,
                            border: `1px solid ${color}`
                          }} 
                        />
                      </Box>
                    </Box>
                  );
                })
            )}
            {pacientes.filter(p => events.filter(e => e.paciente_id === p.id).length > 1).length > 5 && (
              <Button 
                size="small" 
                fullWidth 
                variant="text" 
                sx={{ mt: 1, textTransform: 'none' }}
                onClick={() => {
                  setSelectedPaciente('all');
                  setIsDrawerOpen(false);
                }}
              >
                Ver todos
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text }}>
            Categorías de Servicios
          </Typography>

          <Box sx={{ mb: 3 }}>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={180} />
            ) : (
              Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1]) // Ordenar por cantidad (descendente)
                .map(([category, count]) => (
                  <Box
                    key={category}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      '&:hover': {
                        bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer'
                      },
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      applyFilter('category', category);
                      setIsDrawerOpen(false);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: categoryColors[category] || categoryColors.default,
                          mr: 1
                        }}
                      />
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        {category}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: categoryColors[category] || colors.text
                      }}
                    >
                      {count}
                    </Typography>
                  </Box>
                ))
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text }}>
            Leyenda de Estados
          </Typography>

          <Box sx={{ mb: 3 }}>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={180} />
            ) : (
              Object.entries(statusConfig).map(([status, config]) => {
                // Contar citas por estado
                const count = events.filter(e => e.estado === status).length;
                return (
                  <Box
                    key={status}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : config.bgColor,
                      '&:hover': {
                        bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : alpha(config.bgColor, 0.8),
                        cursor: 'pointer'
                      },
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      handleEstadoChange(status);
                      setIsDrawerOpen(false);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {React.createElement(config.icon, {
                        style: {
                          color: config.color,
                          marginRight: 8,
                          fontSize: 18
                        }
                      })}
                      <Typography variant="body2" sx={{ color: isDarkTheme ? config.color : 'inherit' }}>
                        {status}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: config.color
                      }}
                    >
                      {count}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </SwipeableDrawer>

      {/* Notificaciones */}
      <Notificaciones
        open={openNotification}
        message={notificationMessage}
        type={notificationType}
        handleClose={() => setOpenNotification(false)}
      />

      {/* Diálogo de detalles de cita mejorado */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: {
            borderRadius: '12px',
            backgroundColor: colors.cardBackground,
            overflow: 'hidden'
          }
        }}
      >
        {selectedCita ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Cabecera del diálogo */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: selectedCita.esTratamiento ?
                  (isDarkTheme ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)') :
                  (isDarkTheme ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.05)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Icono según tipo de cita */}
                <Avatar
                  sx={{
                    bgcolor: selectedCita.esTratamiento ?
                      '#4CAF50' : '#1976d2',
                    width: 48,
                    height: 48
                  }}
                >
                  {selectedCita.esTratamiento ?
                    <AssignmentIcon /> :
                    <InfoIcon />
                  }
                </Avatar>

                <Box>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: colors.text }}>
                    {selectedCita.esTratamiento ?
                      'Detalle de Tratamiento' :
                      'Detalle de Consulta'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <StatusChip
                      size="small"
                      label={selectedCita.estado}
                      status={selectedCita.estado}
                      isDarkTheme={isDarkTheme}
                      icon={React.createElement(
                        statusConfig[selectedCita.estado]?.icon || InfoIcon,
                        { fontSize: 'small' }
                      )}
                    />

                    {selectedCita.esTratamiento && selectedCita.numero_cita_tratamiento && (
                      <Chip
                        size="small"
                        label={`Cita ${selectedCita.numero_cita_tratamiento}`}
                        color="warning"
                        variant="outlined"
                        sx={{ height: 24 }}
                      />
                    )}

                    <Chip
                      size="small"
                      label={selectedCita.categoria}
                      sx={{
                        backgroundColor: categoryColors[selectedCita.categoria] || categoryColors.default,
                        color: 'white',
                        fontSize: '0.75rem',
                        height: 24
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <IconButton
                aria-label="close"
                onClick={() => setOpenDialog(false)}
                sx={{ color: colors.text }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Contenido principal */}
            <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Columna izquierda: Información de la cita */}
              <Box
                sx={{
                  width: { xs: '100%', md: '60%' },
                  p: 3,
                  borderRight: { xs: 'none', md: `1px solid ${colors.border}` },
                  borderBottom: { xs: `1px solid ${colors.border}`, md: 'none' }
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: colors.text }}>
                  {selectedCita.title}
                </Typography>

                <Grid container spacing={2}>
                  {/* Fecha y hora */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Fecha y Hora
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DateRangeIcon sx={{ mr: 1, color: colors.primary, fontSize: 20 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {moment(selectedCita.start).format('dddd, D [de] MMMM, YYYY')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon sx={{ mr: 1, color: colors.primary, fontSize: 20 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {moment(selectedCita.start).format('HH:mm')} hrs
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Información de servicio */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Servicio
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocalHospitalIcon sx={{ mr: 1, color: colors.primary, fontSize: 20 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedCita.title}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PriceIcon sx={{ mr: 1, color: colors.primary, fontSize: 20 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          ${selectedCita.precio_servicio || 0}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Información de paciente */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Paciente
                        </Typography>

                        {selectedCita.paciente_id && (
                          <Button
                            size="small"
                            variant="text"
                            component={Link}
                            to={`/Administrador/pacientes/perfil/${selectedCita.paciente_id}`}
                            sx={{ textTransform: 'none' }}
                            startIcon={<PersonIcon />}
                          >
                            Ver ficha
                          </Button>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: pacienteColors[selectedCita.paciente_id] || colors.primary,
                            width: 36,
                            height: 36,
                            mr: 1.5,
                            fontSize: '1rem'
                          }}
                        >
                          {selectedCita.paciente_nombre ? selectedCita.paciente_nombre.charAt(0) : 'P'}
                        </Avatar>

                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedCita.paciente_nombre || 'Paciente sin nombre'}
                          </Typography>

                          <Grid container spacing={1} sx={{ mt: 0.5 }}>
                            {selectedCita.paciente_telefono && (
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" color="textSecondary" sx={{ mr: 0.5 }}>
                                    Teléfono:
                                  </Typography>
                                  <Typography variant="body2">
                                    {selectedCita.paciente_telefono}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}

                            {selectedCita.paciente_correo && (
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" color="textSecondary" sx={{ mr: 0.5 }}>
                                    Email:
                                  </Typography>
                                  <Typography variant="body2">
                                    {selectedCita.paciente_correo}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}

                            {selectedCita.paciente_fecha_nacimiento && (
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" color="textSecondary" sx={{ mr: 0.5 }}>
                                    Fecha nac.:
                                  </Typography>
                                  <Typography variant="body2">
                                    {moment(selectedCita.paciente_fecha_nacimiento).format('DD/MM/YYYY')}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}

                            {selectedCita.paciente_genero && (
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" color="textSecondary" sx={{ mr: 0.5 }}>
                                    Género:
                                  </Typography>
                                  <Typography variant="body2">
                                    {selectedCita.paciente_genero}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                          
                          {/* Mostrar total de citas del paciente */}
                          {selectedCita.paciente_id && (
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mt: 1,
                                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                borderRadius: 1,
                                p: 0.5,
                                pl: 1
                              }}
                            >
                              <Typography variant="body2" color="textSecondary" sx={{ mr: 0.5 }}>
                                Total citas:
                              </Typography>
                              <Chip 
                                size="small" 
                                label={events.filter(e => e.paciente_id === selectedCita.paciente_id).length} 
                                color="primary"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Button
                                size="small"
                                sx={{ ml: 'auto', minWidth: 'auto', p: 0.5 }}
                                onClick={() => {
                                  setSelectedPaciente(selectedCita.paciente_id);
                                  setOpenDialog(false);
                                  setFilterActive(true);
                                }}
                              >
                                Ver
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Odontólogo */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Odontólogo
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalHospitalIcon sx={{ mr: 1, color: colors.primary, fontSize: 20 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedCita.odontologo_nombre || 'No asignado'}
                        </Typography>
                      </Box>
                      
                      {/* Mostrar total de citas del odontólogo */}
                      {selectedCita.odontologo_id && (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mt: 1,
                            bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 1,
                            p: 0.5,
                            pl: 1
                          }}
                        >
                          <Typography variant="caption" color="textSecondary" sx={{ mr: 0.5 }}>
                            Total citas:
                          </Typography>
                          <Chip 
                            size="small" 
                            label={events.filter(e => e.odontologo_id === selectedCita.odontologo_id).length} 
                            color="info"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          <Button
                            size="small"
                            sx={{ ml: 'auto', minWidth: 'auto', p: 0.5 }}
                            onClick={() => {
                              setSelectedOdontologo(selectedCita.odontologo_id);
                              setOpenDialog(false);
                              setFilterActive(true);
                            }}
                          >
                            Ver
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Estado de la cita */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: statusConfig[selectedCita.estado]?.bgColor ||
                          (isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'),
                        border: `1px solid ${statusConfig[selectedCita.estado]?.color || colors.border}`,
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Estado
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {React.createElement(
                          statusConfig[selectedCita.estado]?.icon || InfoIcon,
                          { style: { marginRight: 8, color: statusConfig[selectedCita.estado]?.color } }
                        )}
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: statusConfig[selectedCita.estado]?.color
                          }}
                        >
                          {selectedCita.estado}
                        </Typography>
                      </Box>
                      
                      {/* Fecha de solicitud */}
                      {selectedCita.fecha_solicitud && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Solicitado el:
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 500 }}>
                            {moment(selectedCita.fecha_solicitud).format('DD/MM/YYYY')}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Notas */}
                  {selectedCita.notas && (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '8px',
                          backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Notas
                        </Typography>

                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {selectedCita.notas}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Columna derecha: Acciones y detalles adicionales */}
              <Box
                sx={{
                  width: { xs: '100%', md: '40%' },
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: colors.text }}>
                  Acciones
                </Typography>

                <Grid container spacing={2}>
                  {/* Botones de acción según estado */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          '& .MuiButton-root': {
                            justifyContent: 'flex-start',
                            px: 2
                          }
                        }}
                      >
                        {/* Mostrar diferentes botones según el estado */}
                        {selectedCita.estado === 'Pendiente' && (
                          <>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<CheckIcon />}
                              fullWidth
                              sx={{ textTransform: 'none' }}
                            >
                              Confirmar Cita
                            </Button>

                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              fullWidth
                              sx={{ textTransform: 'none' }}
                            >
                              Cancelar Cita
                            </Button>
                          </>
                        )}

                        {selectedCita.estado === 'Confirmada' && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<AssignmentIcon />}
                              fullWidth
                              sx={{ textTransform: 'none' }}
                            >
                              Marcar como Completada
                            </Button>

                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              fullWidth
                              sx={{ textTransform: 'none' }}
                            >
                              Cancelar Cita
                            </Button>
                          </>
                        )}

                        {/* Botón para reagendar */}
                        {['Pendiente', 'Confirmada'].includes(selectedCita.estado) && (
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<DateRangeIcon />}
                            fullWidth
                            sx={{ textTransform: 'none' }}
                          >
                            Reprogramar Cita
                          </Button>
                        )}

                        {/* Si es completada mostrar otras opciones */}
                        {selectedCita.estado === 'Completada' && (
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<DescriptionIcon />}
                            fullWidth
                            sx={{ textTransform: 'none' }}
                          >
                            Ver Historial Médico
                          </Button>
                        )}

                        {/* Botón para editar información */}
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          fullWidth
                          sx={{ textTransform: 'none' }}
                        >
                          Editar Información
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Si es tratamiento, mostrar información adicional */}
                  {selectedCita.esTratamiento && selectedCita.tratamientoInfo && (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '8px',
                          backgroundColor: isDarkTheme ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.05)',
                          border: `1px solid ${isDarkTheme ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{
                            color: '#4CAF50',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <AssignmentIcon fontSize="small" />
                          Información del Tratamiento
                        </Typography>

                        <Box sx={{ mt: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              ID del Tratamiento:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              #{selectedCita.tratamiento_id || 'N/A'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              Cita actual:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {selectedCita.numero_cita_tratamiento || '1'} de {selectedCita.tratamientoInfo.total_citas_programadas || '?'}
                            </Typography>
                          </Box>
                          
                          {/* Fechas de tratamiento */}
                          {selectedCita.tratamientoInfo.fecha_inicio && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="textSecondary">
                                Fecha inicio:
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {moment(selectedCita.tratamientoInfo.fecha_inicio).format('DD/MM/YYYY')}
                              </Typography>
                            </Box>
                          )}
                          
                          {selectedCita.tratamientoInfo.fecha_estimada_fin && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="textSecondary">
                                Fecha est. fin:
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {moment(selectedCita.tratamientoInfo.fecha_estimada_fin).format('DD/MM/YYYY')}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Progreso del tratamiento */}
                          <Box sx={{ mt: 1, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" color="textSecondary">
                                Progreso:
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="#4CAF50">
                                {Math.round((selectedCita.tratamientoInfo.citas_completadas / 
                                selectedCita.tratamientoInfo.total_citas_programadas) * 100)}%
                              </Typography>
                            </Box>
                            <Box sx={{ width: '100%', bgcolor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, height: 8, overflow: 'hidden' }}>
                              <Box 
                                sx={{ 
                                  width: `${Math.round((selectedCita.tratamientoInfo.citas_completadas / 
                                  selectedCita.tratamientoInfo.total_citas_programadas) * 100)}%`,
                                  bgcolor: '#4CAF50',
                                  height: '100%'
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Botón para ver tratamiento completo */}
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            sx={{
                              mt: 1,
                              bgcolor: '#4CAF50',
                              '&:hover': { bgcolor: '#388E3C' },
                              textTransform: 'none'
                            }}
                            startIcon={<AssignmentIcon />}
                          >
                            Ver Tratamiento Completo
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                  
                  {/* Otras citas del paciente */}
                  {selectedCita.paciente_id && events.filter(e => 
                    e.paciente_id === selectedCita.paciente_id && 
                    e.id !== selectedCita.id
                  ).length > 0 && (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '8px',
                          backgroundColor: isDarkTheme ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                          border: `1px solid ${isDarkTheme ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)'}`
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{
                            color: colors.primary,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <DateRangeIcon fontSize="small" />
                          Otras Citas del Paciente
                        </Typography>
                        
                        <Box sx={{ mt: 1 }}>
                          {events.filter(e => 
                            e.paciente_id === selectedCita.paciente_id && 
                            e.id !== selectedCita.id
                          )
                          .sort((a, b) => new Date(a.start) - new Date(b.start))
                          .slice(0, 3)
                          .map(cita => (
                            <Box 
                              key={cita.id}
                              sx={{ 
                                mb: 1, 
                                p: 1, 
                                borderRadius: 1,
                                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }
                              }}
                              onClick={() => handleSelectEvent(cita)}
                            >
                              <Box 
                                sx={{ 
                                  width: 4,
                                  height: '100%',
                                  bgcolor: statusConfig[cita.estado]?.color,
                                  borderRadius: 2,
                                  mr: 1
                                }}
                              />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="caption" display="block" color="textSecondary">
                                  {moment(cita.start).format('DD/MM/YYYY - HH:mm')}
                                </Typography>
                                <Typography variant="body2" noWrap>
                                  {cita.title}
                                </Typography>
                              </Box>
                              <StatusChip
                                size="small"
                                label={cita.estado}
                                status={cita.estado}
                                isDarkTheme={isDarkTheme}
                                sx={{ ml: 1, height: 20 }}
                              />
                            </Box>
                          ))}
                          
                          {events.filter(e => 
                            e.paciente_id === selectedCita.paciente_id && 
                            e.id !== selectedCita.id
                          ).length > 3 && (
                            <Button
                              size="small"
                              fullWidth
                              variant="text"
                              onClick={() => {
                                setSelectedPaciente(selectedCita.paciente_id);
                                setOpenDialog(false);
                                setFilterActive(true);
                              }}
                              sx={{ mt: 1, textTransform: 'none' }}
                            >
                              Ver todas ({events.filter(e => e.paciente_id === selectedCita.paciente_id).length})
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          </Box>
        ) : (
          // Estado de carga para el diálogo
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando detalles...
            </Typography>
          </Box>
        )}
      </Dialog>
    </>
  );
};

export default CalendarioAgenda;