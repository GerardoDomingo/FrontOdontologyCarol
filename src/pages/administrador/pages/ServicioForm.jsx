// Componentes y hooks optimizados para ServicioForm
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import {
  TextField, Button, Grid, MenuItem, FormControl, Select, InputLabel,
  Card, CardContent, Typography, TableContainer, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, IconButton, Tooltip, Chip, Fab, Alert, AlertTitle, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, Slider, Divider, Avatar, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, InputAdornment, Tabs, Tab
} from '@mui/material';

import {
  Search, Add, Close, Edit, Delete, Info, FilterAlt, ArrowDropDown,
  SortSharp, CalendarMonth, CheckCircle, HealthAndSafety, Timer,
  AttachMoney, EventAvailable, Description, MenuBook, Image,
} from '@mui/icons-material';

import { alpha } from '@mui/material/styles';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Importar componentes con lazy loading
const EditServiceDialog = lazy(() => import('./servicios/EditService'));
const NewService = lazy(() => import('./servicios/newService'));
const CategoryService = lazy(() => import('./servicios/CategoryService'));
const Notificaciones = lazy(() => import('../../../components/Layout/Notificaciones'));

// Hook personalizado para gestionar notificaciones
const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: '',
  });

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({
      open: true,
      message,
      type,
    });

    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, 3000);
  }, []);

  const handleClose = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return { notification, showNotification, handleClose };
};

// Hook personalizado para gestionar filtros
const useFilters = (initialMaxPrice = 10000) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    tratamiento: 'all',
    priceRange: [0, initialMaxPrice],
    citas: 'all',
  });
  const [priceRange, setPriceRange] = useState([0, initialMaxPrice]);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filterChips, setFilterChips] = useState([]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));

    // Actualizar chips de filtro
    if (value === 'all' || value === '') {
      setFilterChips(prev => prev.filter(chip => chip.name !== filterName));
    } else {
      const chipLabels = {
        category: 'Categoría',
        tratamiento: 'Tipo',
        citas: 'Número de citas',
        priceRange: 'Rango de precio'
      };

      let chipValue = value;
      if (filterName === 'tratamiento') {
        chipValue = value === 'yes' ? 'Tratamientos' : 'Servicios regulares';
      } else if (filterName === 'citas') {
        chipValue = value === 'single' ? 'Cita única' : 'Múltiples citas';
      }

      // Si ya existe un chip con este nombre, lo actualizamos
      if (filterChips.some(chip => chip.name === filterName)) {
        setFilterChips(prev =>
          prev.map(chip =>
            chip.name === filterName ? { ...chip, value: chipValue } : chip
          )
        );
      } else {
        // Si no existe, lo añadimos
        setFilterChips(prev => [
          ...prev,
          { name: filterName, label: chipLabels[filterName] || filterName, value: chipValue }
        ]);
      }
    }
  }, []);

  const handlePriceChange = useCallback((event, newValue) => {
    setPriceRange(newValue);
  }, []);

  const handlePriceChangeCommitted = useCallback(() => {
    setFilters(prev => ({ ...prev, priceRange }));

    // Actualizar chip de rango de precio
    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
      }).format(price);
    };

    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      const priceChipValue = `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`;

      if (filterChips.some(chip => chip.name === 'priceRange')) {
        setFilterChips(prev =>
          prev.map(chip =>
            chip.name === 'priceRange' ? { ...chip, value: priceChipValue } : chip
          )
        );
      } else {
        setFilterChips(prev => [
          ...prev,
          { name: 'priceRange', label: 'Rango de precio', value: priceChipValue }
        ]);
      }
    } else {
      setFilterChips(prev => prev.filter(chip => chip.name !== 'priceRange'));
    }
  }, [priceRange, maxPrice]);

  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      tratamiento: 'all',
      priceRange: [0, maxPrice],
      citas: 'all',
    });
    setPriceRange([0, maxPrice]);
    setFilterChips([]);
  }, [maxPrice]);

  const removeChip = useCallback((chipName) => {
    setFilterChips(prev => prev.filter(chip => chip.name !== chipName));

    if (chipName === 'priceRange') {
      setPriceRange([0, maxPrice]);
      setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
    } else {
      setFilters(prev => ({ ...prev, [chipName]: 'all' }));
    }
  }, [maxPrice]);

  return {
    searchQuery, setSearchQuery,
    categories, setCategories,
    filters, setFilters,
    priceRange, setPriceRange,
    maxPrice, setMaxPrice,
    filtersExpanded, setFiltersExpanded,
    filterChips, removeChip,
    handleFilterChange,
    handlePriceChange,
    handlePriceChangeCommitted,
    resetFilters
  };
};

// Hook personalizado para gestionar paginación (no usado, pero requerido por alguna referencia)
const usePagination = () => {
  return {
    page: 0,
    rowsPerPage: 99999, // Un número grande para mostrar todos los servicios
    handleChangePage: () => { },
    handleChangeRowsPerPage: () => { }
  };
};

// Hook para manejo de API que implemente cache
const useServicesApi = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función simplificada para obtener todos los servicios
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Solicitud para obtener los servicios
      const response = await fetch("https://back-end-4803.onrender.com/api/servicios/all");
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const servicesData = await response.json();

      // Solicitud para obtener los detalles
      const detailsResponse = await fetch("https://back-end-4803.onrender.com/api/servicios/detalles");
      if (!detailsResponse.ok) throw new Error("Error al obtener los detalles de los servicios");
      const detailsData = await detailsResponse.json();

      // Solicitud para obtener las categorías
      const categoriesResponse = await fetch("https://back-end-4803.onrender.com/api/servicios/categorias");
      const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];

      // Mapear detalles al servicio correcto
      const servicesWithDetails = servicesData.map(service => ({
        ...service,
        benefits: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'beneficio')
          .map(d => d.descripcion),
        includes: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'incluye')
          .map(d => d.descripcion),
        preparation: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'preparacion')
          .map(d => d.descripcion),
        aftercare: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'cuidado')
          .map(d => d.descripcion),
      }));

      // Actualizar el estado con los servicios procesados
      setServices(servicesWithDetails);

      // Calcular el precio máximo para el filtro
      const highestPrice = Math.max(...servicesWithDetails.map(service => parseFloat(service.price || 0))) + 1000;

      return {
        services: servicesWithDetails,
        categories: categoriesResponse.ok ? ['all', ...categoriesData] : ['all'],
        maxPrice: highestPrice
      };
    } catch (error) {
      console.error("Error cargando servicios:", error);
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchServiceById = useCallback(async (serviceId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/get/${serviceId}`);
      if (!response.ok) throw new Error("Error al obtener el servicio");

      const serviceData = await response.json();
      return serviceData;
    } catch (error) {
      console.error("Error obteniendo servicio por ID:", error);
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (serviceId) => {
    setIsLoading(true);

    try {
      const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/delete/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el servicio');
      }

      // Actualizamos el estado local eliminando el servicio
      setServices(prev => prev.filter(service => service.id !== serviceId));

      return true;
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    services,
    isLoading,
    error,
    fetchServices,
    deleteService,
    fetchServiceById
  };
};

// Componente optimizado para la celda de imagen con lazy loading
const ImageCell = React.memo(({ imageUrl, onImageClick }) => {
  // Estado para tracking de carga de imagen
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Función para manejar carga exitosa
  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  // Función para manejar error
  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
  }, []);

  return (
    <Box sx={{ width: 50, height: 50, position: 'relative' }}>
      {imageUrl ? (
        <>
          {!loaded && (
            <Box
              sx={{
                position: 'absolute',
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
          <Avatar
            src={imageUrl}
            variant="rounded"
            sx={{
              width: 50,
              height: 50,
              cursor: 'pointer',
              display: loaded ? 'block' : 'none',
            }}
            onClick={() => onImageClick(imageUrl)}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      ) : (
        <Avatar
          variant="rounded"
          sx={{
            width: 50,
            height: 50,
            backgroundColor: 'rgba(0,0,0,0.1)'
          }}
        >
          <Image sx={{ color: 'rgba(0,0,0,0.3)' }} />
        </Avatar>
      )}
    </Box>
  );
}, (prevProps, nextProps) => prevProps.imageUrl === nextProps.imageUrl);

// Componente para fila de servicio con optimización y memo
const ServiceRow = React.memo(({ service, index, colors, isDarkTheme, onViewDetails, onEdit, onDelete, onImageClick }) => {
  return (
    <TableRow
      sx={{
        height: '69px',
        '&:hover': { backgroundColor: colors.hover },
        transition: 'background-color 0.2s ease',
        borderLeft: service?.tratamiento === 1
          ? `4px solid ${colors.treatment}`
          : `4px solid ${colors.nonTreatment}`
      }}
    >
      <TableCell sx={{ color: colors.text }}>{index + 1}</TableCell>

      {/* Celda de imagen optimizada */}
      <TableCell>
        <ImageCell imageUrl={service?.image_url} onImageClick={onImageClick} />
      </TableCell>

      <TableCell sx={{ color: colors.text }}>
        {service?.title || "N/A"}
        {service?.tratamiento === 1 && service?.citasEstimadas > 1 && (
          <Tooltip title={`Tratamiento de ${service.citasEstimadas} citas`}>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                ml: 1,
                color: colors.treatment
              }}
            >
              <CalendarMonth fontSize="small" sx={{ mr: 0.5 }} />
              {service.citasEstimadas}
            </Box>
          </Tooltip>
        )}
      </TableCell>
      <TableCell sx={{ color: colors.text }}>
        {service?.duration || "N/A"}
      </TableCell>
      <TableCell sx={{ color: colors.text }}>
        ${service?.price ? parseFloat(service.price).toFixed(2) : "N/A"}
      </TableCell>
      <TableCell>
        <Chip
          label={service?.category || "N/A"}
          sx={{
            backgroundColor: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
            color: colors.text,
            fontWeight: '500',
            border: `1px solid ${isDarkTheme ? 'rgba(75,159,255,0.3)' : 'rgba(25,118,210,0.2)'}`,
            fontSize: '0.75rem',
            height: '28px',
          }}
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Botones de acción */}
          <Tooltip title="Ver detalles" arrow>
            <IconButton
              onClick={() => onViewDetails(service)}
              sx={{
                backgroundColor: colors.primary,
                '&:hover': { backgroundColor: colors.hover },
                padding: '8px',
                borderRadius: '50%',
              }}
            >
              <Info fontSize="small" sx={{ color: 'white' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar servicio" arrow>
            <IconButton
              onClick={() => onEdit(service.id)}
              sx={{
                backgroundColor: colors.editButton,
                '&:hover': { backgroundColor: alpha(colors.editButton, 0.8) },
                padding: '8px',
                borderRadius: '50%',
              }}
            >
              <Edit fontSize="small" sx={{ color: 'white' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar servicio" arrow>
            <IconButton
              onClick={() => onDelete(service)}
              sx={{
                backgroundColor: colors.deleteButton,
                '&:hover': { backgroundColor: alpha(colors.deleteButton, 0.8) },
                padding: '8px',
                borderRadius: '50%',
              }}
            >
              <Delete fontSize="small" sx={{ color: 'white' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Implementación personalizada de comparación para evitar renderizados innecesarios
  return (
    prevProps.service?.id === nextProps.service?.id &&
    prevProps.index === nextProps.index &&
    prevProps.isDarkTheme === nextProps.isDarkTheme
  );
});

// Componente para visualizar imagen ampliada - Mejorado
const ImageDialog = React.memo(({ open, imageUrl, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Reset estado cuando se abre nuevo diálogo
    if (open) {
      setImageLoaded(false);
    }
  }, [open, imageUrl]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          background: 'transparent'
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.7)',
          },
          zIndex: 1,
          transition: 'all 0.2s ease',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        p: 0
      }}>
        {!imageLoaded && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        )}
        <Box
          component="img"
          src={imageUrl}
          alt="Imagen ampliada"
          sx={{
            maxWidth: '100%',
            maxHeight: '90vh',
            objectFit: 'contain',
            display: 'block',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            p: 1
          }}
          onLoad={() => setImageLoaded(true)}
        />
      </Box>
    </Dialog>
  );
});

// Componente profesional para mostrar detalles del servicio
const ServiceDetailsDialog = React.memo(({
  open,
  service,
  onClose,
  onImageClick,
  colors
}) => {
  // 1. TODOS los hooks de estado primero
  const [activeTab, setActiveTab] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);

  // 2. Funciones de manejo de eventos
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 3. Variables memoizadas con useMemo - SIN CONDICIONES
  const safeService = useMemo(() => {
    // Si service es null, usar un objeto vacío con arrays vacíos
    if (!service) return {
      benefits: [],
      includes: [],
      preparation: [],
      aftercare: []
    };
    
    // Normalizar el servicio para evitar nulls
    return {
      ...service,
      benefits: service.benefits || [],
      includes: service.includes || [],
      preparation: service.preparation || [],
      aftercare: service.aftercare || []
    };
  }, [service]);

  // 4. Todos los useEffect - SIN CONDICIONES
  useEffect(() => {
    if (service) {
      setDebugInfo({
        hasIncludes: Boolean(service.includes?.length),
        includesLength: service.includes?.length || 0,
        hasPreparation: Boolean(service.preparation?.length),
        preparationLength: service.preparation?.length || 0,
        hasAftercare: Boolean(service.aftercare?.length),
        aftercareLength: service.aftercare?.length || 0,
        hasBenefits: Boolean(service.benefits?.length),
        benefitsLength: service.benefits?.length || 0
      });
    }
  }, [service]);

  // 5. Retorno condicional - DESPUÉS de todos los hooks
  if (!open || !service) return null;

  // 6. Variables normales (no hooks) - DESPUÉS del retorno condicional
  const serviceColor = safeService.tratamiento === 1 ? colors.treatment : colors.nonTreatment;
  const categoryName = safeService.category || "Sin categoría";
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(parseFloat(safeService.price || 0));

  // 7. Renderizado
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper" // Crucial para habilitar el scroll
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '80vh', // Limitamos la altura para forzar el scroll
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        position: 'relative',
        backgroundColor: alpha(serviceColor, 0.05),
        borderBottom: `1px solid ${alpha(serviceColor, 0.2)}`
      }}>
        {/* Background decorativo */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${alpha(serviceColor, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 80% 60%, ${alpha(serviceColor, 0.1)} 0%, transparent 50%)
          `,
          zIndex: 0
        }} />

        <Box sx={{
          position: 'relative',
          zIndex: 1,
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}>
          {/* Avatar y título */}
          <Avatar
            sx={{
              bgcolor: serviceColor,
              color: 'white',
              width: { xs: 50, sm: 56 },
              height: { xs: 50, sm: 56 },
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <HealthAndSafety sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              mb: 0.5
            }}>
              <Chip
                label={categoryName}
                size="small"
                sx={{
                  bgcolor: alpha(serviceColor, 0.1),
                  color: serviceColor,
                  fontWeight: 500,
                  border: `1px solid ${alpha(serviceColor, 0.3)}`,
                  fontSize: '0.7rem',
                  height: 24
                }}
              />

              <Chip
                label={safeService.tratamiento === 1 ? "Tratamiento" : "Servicio"}
                size="small"
                sx={{
                  bgcolor: serviceColor,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24
                }}
                icon={safeService.tratamiento === 1 ?
                  <EventAvailable style={{ color: 'white', fontSize: '0.85rem' }} /> :
                  <HealthAndSafety style={{ color: 'white', fontSize: '0.85rem' }} />
                }
              />
            </Box>

            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                color: colors.titleColor,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              {safeService.title || "Servicio sin título"}
            </Typography>
          </Box>

          {/* Botón de cerrar */}
          <IconButton
            onClick={onClose}
            aria-label="cerrar"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'rgba(0,0,0,0.05)',
              color: colors.text,
              '&:hover': {
                bgcolor: alpha(serviceColor, 0.1),
                color: serviceColor
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Información clave */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          px: { xs: 2, sm: 3 },
          py: 2,
          flexWrap: 'wrap',
          borderBottom: `1px solid ${alpha(colors.divider, 0.7)}`
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: alpha(serviceColor, 0.05),
          border: `1px solid ${alpha(serviceColor, 0.15)}`,
          borderRadius: '8px',
          py: 0.75,
          px: 1.5
        }}>
          <Timer sx={{ color: serviceColor, mr: 1, fontSize: '1rem' }} />
          <Typography sx={{ fontWeight: 500, color: colors.text }}>
            {safeService.duration || "No especificada"}
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: alpha(serviceColor, 0.05),
          border: `1px solid ${alpha(serviceColor, 0.15)}`,
          borderRadius: '8px',
          py: 0.75,
          px: 1.5
        }}>
          <AttachMoney sx={{ color: serviceColor, mr: 0.5, fontSize: '1rem' }} />
          <Typography sx={{ fontWeight: 600, color: colors.text }}>
            {formattedPrice}
          </Typography>
        </Box>

        {safeService.tratamiento === 1 && safeService.citasEstimadas && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(serviceColor, 0.05),
            border: `1px solid ${alpha(serviceColor, 0.15)}`,
            borderRadius: '8px',
            py: 0.75,
            px: 1.5
          }}>
            <CalendarMonth sx={{ color: serviceColor, mr: 1, fontSize: '1rem' }} />
            <Typography sx={{ fontWeight: 500, color: colors.text }}>
              {safeService.citasEstimadas > 1
                ? `${safeService.citasEstimadas} sesiones`
                : "1 sesión"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Contenido principal */}
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Columna de imagen y plan de tratamiento (izquierda) */}
          <Grid item xs={12} md={5}>
            {/* Imagen principal */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: `1px solid ${alpha(serviceColor, 0.2)}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                mb: 3
              }}
            >
              {safeService.image_url ? (
                <Box sx={{ position: 'relative', pt: '75%' }}>
                  <Box
                    component="img"
                    src={safeService.image_url}
                    alt={safeService.title}
                    onClick={() => onImageClick(safeService.image_url)}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      transition: 'transform 0.5s ease',
                      '&:hover': {
                        transform: 'scale(1.03)'
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 1.5,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Tooltip title="Ver imagen completa">
                      <IconButton
                        size="small"
                        onClick={() => onImageClick(safeService.image_url)}
                        sx={{
                          color: 'white',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                      >
                        <Image fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    bgcolor: alpha(serviceColor, 0.05),
                    p: 3
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(serviceColor, 0.1),
                      color: serviceColor,
                      width: 48,
                      height: 48
                    }}
                  >
                    <Image />
                  </Avatar>
                  <Typography variant="body2" color={colors.secondaryText} align="center">
                    No hay imagen disponible para este servicio
                  </Typography>
                </Box>
              )}
            </Card>

            {/* Plan de tratamiento */}
            {safeService.tratamiento === 1 && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  bgcolor: colors.cardBackground,
                  border: `1px solid ${alpha(colors.treatment, 0.2)}`
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(colors.treatment, 0.07),
                      borderBottom: `1px solid ${alpha(colors.treatment, 0.15)}`
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        color: colors.treatment
                      }}
                    >
                      <CalendarMonth sx={{ mr: 1.5 }} />
                      Plan de Tratamiento
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text,
                        lineHeight: 1.7
                      }}
                    >
                      {safeService.citasEstimadas > 1
                        ? `Este tratamiento se completa en aproximadamente ${safeService.citasEstimadas} sesiones distribuidas según el plan personalizado para cada paciente.`
                        : "Este tratamiento se realiza de manera completa en una sola sesión. No requiere visitas adicionales."}
                    </Typography>

                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: '10px',
                        bgcolor: alpha(colors.treatment, 0.05),
                        border: `1px solid ${alpha(colors.treatment, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: colors.treatment,
                          color: 'white',
                          width: 32,
                          height: 32
                        }}
                      >
                        {safeService.citasEstimadas}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color={colors.secondaryText}>
                          Número de sesiones
                        </Typography>
                        <Typography variant="subtitle2" color={colors.text} fontWeight={600}>
                          {safeService.citasEstimadas === 1 ? "Única sesión" : `${safeService.citasEstimadas} sesiones`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Columna de descripción y detalles (derecha) */}
          <Grid item xs={12} md={7}>
            {/* Descripción */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                bgcolor: colors.cardBackground,
                border: `1px solid ${alpha(colors.primary, 0.15)}`,
                mb: 3
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(colors.primary, 0.07),
                    borderBottom: `1px solid ${alpha(colors.primary, 0.15)}`
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 600,
                      color: colors.primary
                    }}
                  >
                    <Description sx={{ mr: 1.5 }} />
                    Acerca de este {safeService.tratamiento === 1 ? 'tratamiento' : 'servicio'}
                  </Typography>
                </Box>

                <Box sx={{ p: 2 }}>
                  {safeService.description ? (
                    <Typography
                      variant="body1"
                      sx={{
                        color: colors.text,
                        lineHeight: 1.7
                      }}
                    >
                      {safeService.description}
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        bgcolor: alpha(colors.primary, 0.05),
                        border: `1px dashed ${alpha(colors.primary, 0.2)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }}
                    >
                      <Info sx={{ color: colors.primary }} />
                      <Typography variant="body2" color={colors.secondaryText}>
                        No hay una descripción disponible para este servicio.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Beneficios */}
            {safeService.benefits.length > 0 && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  bgcolor: colors.cardBackground,
                  border: `1px solid ${alpha(serviceColor, 0.15)}`,
                  mb: 3
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(serviceColor, 0.07),
                      borderBottom: `1px solid ${alpha(serviceColor, 0.15)}`
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        color: serviceColor
                      }}
                    >
                      <CheckCircle sx={{ mr: 1.5 }} />
                      Beneficios principales
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      {safeService.benefits.map((benefit, idx) => (
                        <Grid item xs={12} sm={6} key={idx}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              p: 1.5,
                              height: '100%',
                              gap: 1.5
                            }}
                          >
                            <CheckCircle
                              fontSize="small"
                              sx={{
                                color: serviceColor,
                                mt: 0.3,
                                fontSize: '1rem'
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.text,
                                lineHeight: 1.6
                              }}
                            >
                              {benefit}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Pestañas para detalles adicionales - SIEMPRE MOSTRAR EL COMPONENTE */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            bgcolor: colors.cardBackground,
            border: `1px solid ${alpha(colors.divider, 0.7)}`,
            mt: 1
          }}
        >
          <Box sx={{ borderBottom: `1px solid ${alpha(colors.divider, 0.7)}` }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 48,
                  fontSize: '0.95rem',
                  color: colors.secondaryText,
                  '&.Mui-selected': {
                    color: colors.primary
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: colors.primary
                }
              }}
            >
              {/* Siempre mostrar todas las pestañas */}
              <Tab
                label="El servicio incluye"
                icon={<Info sx={{ fontSize: '1.1rem' }} />}
                iconPosition="start"
              />
              <Tab
                label="Preparación"
                icon={<EventAvailable sx={{ fontSize: '1.1rem' }} />}
                iconPosition="start"
              />
              <Tab
                label="Cuidados posteriores"
                icon={<HealthAndSafety sx={{ fontSize: '1.1rem' }} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 2 }}>
            {/* Pestaña 0: El servicio incluye */}
            <Box
              role="tabpanel"
              hidden={activeTab !== 0}
              sx={{ p: 1 }}
            >
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  {safeService.includes && safeService.includes.length > 0 ? (
                    safeService.includes.map((item, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            p: 2,
                            borderRadius: '8px',
                            bgcolor: colors.paper,
                            border: `1px solid ${alpha(colors.divider, 0.5)}`,
                            height: '100%',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: alpha(colors.primary, 0.3),
                              boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                          <CheckCircle
                            fontSize="small"
                            sx={{
                              color: colors.primary,
                              mr: 1.5,
                              mt: 0.3,
                              fontSize: '1rem'
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.text,
                              lineHeight: 1.6
                            }}
                          >
                            {item}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha(colors.primary, 0.05),
                          borderRadius: '8px',
                          border: `1px dashed ${alpha(colors.primary, 0.2)}`
                        }}
                      >
                        <Typography variant="body2" color={colors.secondaryText}>
                          No hay información disponible sobre lo que incluye el servicio.
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>

            {/* Pestaña 1: Preparación */}
            <Box
              role="tabpanel"
              hidden={activeTab !== 1}
              sx={{ p: 1 }}
            >
              {activeTab === 1 && (
                <Grid container spacing={2}>
                  {safeService.preparation && safeService.preparation.length > 0 ? (
                    safeService.preparation.map((item, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            p: 2,
                            borderRadius: '8px',
                            bgcolor: colors.paper,
                            border: `1px solid ${alpha(colors.divider, 0.5)}`,
                            height: '100%',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: alpha(colors.primary, 0.3),
                              boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                          <CheckCircle
                            fontSize="small"
                            sx={{
                              color: colors.primary,
                              mr: 1.5,
                              mt: 0.3,
                              fontSize: '1rem'
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.text,
                              lineHeight: 1.6
                            }}
                          >
                            {item}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha(colors.primary, 0.05),
                          borderRadius: '8px',
                          border: `1px dashed ${alpha(colors.primary, 0.2)}`
                        }}
                      >
                        <Typography variant="body2" color={colors.secondaryText}>
                          No hay información disponible sobre la preparación para este servicio.
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>

            {/* Pestaña 2: Cuidados posteriores */}
            <Box
              role="tabpanel"
              hidden={activeTab !== 2}
              sx={{ p: 1 }}
            >
              {activeTab === 2 && (
                <Grid container spacing={2}>
                  {safeService.aftercare && safeService.aftercare.length > 0 ? (
                    safeService.aftercare.map((item, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            p: 2,
                            borderRadius: '8px',
                            bgcolor: colors.paper,
                            border: `1px solid ${alpha(colors.divider, 0.5)}`,
                            height: '100%',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: alpha(colors.primary, 0.3),
                              boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                          <CheckCircle
                            fontSize="small"
                            sx={{
                              color: colors.primary,
                              mr: 1.5,
                              mt: 0.3,
                              fontSize: '1rem'
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.text,
                              lineHeight: 1.6
                            }}
                          >
                            {item}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha(colors.primary, 0.05),
                          borderRadius: '8px',
                          border: `1px dashed ${alpha(colors.primary, 0.2)}`
                        }}
                      >
                        <Typography variant="body2" color={colors.secondaryText}>
                          No hay información disponible sobre cuidados posteriores para este servicio.
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </CardContent>
        </Card>
      </DialogContent>

      {/* Footer con botón de cerrar */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          borderTop: `1px solid ${alpha(colors.divider, 0.7)}`,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Button
          variant="contained"
          onClick={onClose}
          startIcon={<Close />}
          sx={{
            bgcolor: colors.primary,
            '&:hover': {
              bgcolor: alpha(colors.primary, 0.85)
            }
          }}
        >
          Cerrar
        </Button>
      </Box>
    </Dialog>
  );
});

// Componente para filtros con virtualización
const FilterSection = React.memo(({
  expanded,
  filters,
  categories,
  priceRange,
  maxPrice,
  formatPrice,
  onFilterChange,
  onPriceChange,
  onPriceChangeCommitted,
  onReset,
  isDarkTheme,
  colors
}) => {
  if (!expanded) return null;

  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: colors.cardBackground, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: colors.inputLabel }}>Categoría</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              label="Categoría"
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
              <MenuItem value="all">Todas las categorías</MenuItem>
              {categories
                .filter(category => category !== 'all')
                .map((category, index) => (
                  <MenuItem key={index} value={category}>{category}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: colors.inputLabel }}>Tipo</InputLabel>
            <Select
              value={filters.tratamiento}
              onChange={(e) => onFilterChange('tratamiento', e.target.value)}
              label="Tipo"
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
              <MenuItem value="all">Todos los tipos</MenuItem>
              <MenuItem value="yes">Tratamientos</MenuItem>
              <MenuItem value="no">Servicios regulares</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: colors.inputLabel }}>Número de citas</InputLabel>
            <Select
              value={filters.citas}
              onChange={(e) => onFilterChange('citas', e.target.value)}
              label="Número de citas"
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
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="single">Cita única</MenuItem>
              <MenuItem value="multiple">Múltiples citas</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color={colors.secondaryText} gutterBottom>
            Rango de precio: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </Typography>
          <Slider
            value={priceRange}
            onChange={onPriceChange}
            onChangeCommitted={onPriceChangeCommitted}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatPrice(value)}
            min={0}
            max={maxPrice}
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: colors.primary,
              },
              '& .MuiSlider-track': {
                backgroundColor: colors.primary,
              },
              '& .MuiSlider-rail': {
                backgroundColor: alpha(colors.primary, 0.3),
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

// Componente para diálogo de confirmación
const ConfirmDialog = React.memo(({
  open,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing,
  colors
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !isProcessing && onClose()}
      PaperProps={{
        sx: {
          backgroundColor: colors.paper,
          color: colors.text,
          maxWidth: '500px',
          width: '100%',
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle
        sx={{
          color: colors.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${colors.divider}`
        }}
      >
        <Delete sx={{ color: colors.deleteButton }} />
        {title}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, color: colors.text }}>
          {message}
        </Typography>

        <Alert
          severity="error"
          sx={{ mt: 2 }}
        >
          <AlertTitle>Esta acción no se puede deshacer.</AlertTitle>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={isProcessing}
          sx={{ color: colors.text }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isProcessing}
          sx={{
            backgroundColor: colors.deleteButton,
            '&:hover': {
              backgroundColor: alpha(colors.deleteButton, 0.8)
            }
          }}
        >
          {isProcessing ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

// Componente principal optimizado
const ServicioForm = () => {
  // Context y APIs
  const { isDarkTheme } = useThemeContext();
  const { notification, showNotification, handleClose: handleNotificationClose } = useNotification();
  const {
    services, isLoading, error, fetchServices, deleteService, fetchServiceById
  } = useServicesApi();

  // Constantes para evitar referencias a la paginación eliminada
  const page = 0;

  // Hooks personalizados
  const {
    searchQuery, setSearchQuery,
    categories, setCategories,
    filters, setFilters,
    priceRange, setPriceRange,
    maxPrice, setMaxPrice,
    filtersExpanded, setFiltersExpanded,
    filterChips, removeChip,
    handleFilterChange,
    handlePriceChange,
    handlePriceChangeCommitted,
    resetFilters
  } = useFilters(10000);

  // Estados locales
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewServiceForm, setOpenNewServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openCategoriesDialog, setOpenCategoriesDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Colores del tema memoizados
  const colors = useMemo(() => ({
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
    treatment: isDarkTheme ? '#66BB6A' : '#4CAF50',
    nonTreatment: isDarkTheme ? '#EF5350' : '#F44336',
    editButton: isDarkTheme ? '#66BB6A' : '#4CAF50',
    deleteButton: isDarkTheme ? '#EF5350' : '#F44336'
  }), [isDarkTheme]);

  // Formatear precio (memoizado)
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchServices();
        if (result) {
          setCategories(result.categories);
          setMaxPrice(result.maxPrice);
          setPriceRange([0, result.maxPrice]);
          setFilters(prev => ({ ...prev, priceRange: [0, result.maxPrice] }));
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    loadData();
  }, [fetchServices, setCategories, setMaxPrice, setPriceRange, setFilters]);

  // Manejar creación de servicio
  const handleServiceCreated = useCallback(() => {
    setOpenNewServiceForm(false);
    fetchServices(true); // Forzar actualización
    showNotification('Servicio creado exitosamente', 'success');
  }, [fetchServices, showNotification]);

  // Manejar eliminación de servicio
  const handleDeleteService = useCallback(async () => {
    if (!serviceToDelete) return;

    setIsProcessing(true);

    try {
      const success = await deleteService(serviceToDelete.id);

      if (success) {
        showNotification(`El servicio "${serviceToDelete.title}" ha sido eliminado correctamente.`, 'success');
      } else {
        throw new Error('Error al eliminar el servicio');
      }

      setOpenConfirmDialog(false);
      setServiceToDelete(null);

    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      showNotification('Hubo un error al eliminar el servicio.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [serviceToDelete, deleteService, showNotification]);

  // Función para mostrar los detalles de un servicio
  const handleViewDetails = useCallback(async (service) => {
    try {
      console.log("Servicio original:", service);

      // 1. Obtener todos los detalles para tenerlos disponibles
      const detailsResponse = await fetch("https://back-end-4803.onrender.com/api/servicios/detalles");
      if (!detailsResponse.ok) throw new Error("Error al obtener los detalles");
      const detailsData = await detailsResponse.json();

      // 2. Obtener el servicio por ID para asegurar datos completos y actualizados
      let serviceDetails = null;
      try {
        serviceDetails = await fetchServiceById(service.id);
      } catch (err) {
        console.warn("No se pudo obtener detalles actualizados, usando datos existentes");
      }

      // 3. Combinar los datos del servicio con los detalles filtrados por servicio_id
      // Usar spread operator para asegurar que se crea un nuevo objeto
      const combinedDetails = {
        ...(serviceDetails || service),
        benefits: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'beneficio')
          .map(d => d.descripcion),
        includes: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'incluye')
          .map(d => d.descripcion),
        preparation: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'preparacion')
          .map(d => d.descripcion),
        aftercare: detailsData
          .filter(d => d.servicio_id === service.id && d.tipo === 'cuidado')
          .map(d => d.descripcion)
      };

      console.log("Servicio combinado:", combinedDetails);

      // Verificación de datos antes de mostrar el diálogo
      if (!combinedDetails.benefits) combinedDetails.benefits = [];
      if (!combinedDetails.includes) combinedDetails.includes = [];
      if (!combinedDetails.preparation) combinedDetails.preparation = [];
      if (!combinedDetails.aftercare) combinedDetails.aftercare = [];

      // Crear una copia para evitar problemas de referencia
      setSelectedService({ ...combinedDetails });
      setOpenDialog(true);
    } catch (error) {
      console.error("Error al cargar detalles del servicio:", error);

      // En caso de error, asegurar que el servicio tiene la estructura correcta
      const safeService = {
        ...service,
        benefits: [],
        includes: [],
        preparation: [],
        aftercare: []
      };

      setSelectedService(safeService);
      setOpenDialog(true);
      showNotification('Error al cargar detalles completos', 'error');
    }
  }, [fetchServiceById, showNotification]);

  // Función para mostrar imagen en grande
  const handleViewImage = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  }, []);

  // Función para seleccionar servicio a editar
  const handleSelectServiceToEdit = useCallback((serviceId) => {
    setSelectedService(serviceId);
    setOpenEditDialog(true);
  }, []);

  // Función para seleccionar servicio a eliminar
  const handleSelectServiceToDelete = useCallback((service) => {
    setServiceToDelete(service);
    setOpenConfirmDialog(true);
  }, []);

  // Filtrar servicios (memoizado)
  const filteredServices = useMemo(() => services
    .filter(service => {
      // Filtro por texto de búsqueda (optimizado para performance)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery || (
          (service.title?.toLowerCase().includes(searchLower) ||
            service.description?.toLowerCase().includes(searchLower) ||
            service.category?.toLowerCase().includes(searchLower))
        );

      // Filtro por categoría
      const matchesCategory =
        filters.category === 'all' || service.category === filters.category;

      // Filtro por tratamiento
      const matchesTratamiento =
        filters.tratamiento === 'all' ||
        (filters.tratamiento === 'yes' && service.tratamiento === 1) ||
        (filters.tratamiento === 'no' && (!service.tratamiento || service.tratamiento === 0));

      // Filtro por rango de precio
      const price = parseFloat(service.price || 0);
      const matchesPrice =
        price >= filters.priceRange[0] && price <= filters.priceRange[1];

      // Filtro por número de citas
      const matchesCitas =
        filters.citas === 'all' ||
        (filters.citas === 'single' && (!service.citasEstimadas || parseInt(service.citasEstimadas) === 1)) ||
        (filters.citas === 'multiple' && service.citasEstimadas && parseInt(service.citasEstimadas) > 1);

      return matchesSearch && matchesCategory && matchesTratamiento && matchesPrice && matchesCitas;
    }), [services, searchQuery, filters]);

  // Calcular precio promedio (memoizado)
  const averagePrice = useMemo(() => {
    if (filteredServices.length === 0) return 0;
    return filteredServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0) / filteredServices.length;
  }, [filteredServices]);

  // Renderizado del componente
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
        {/* Cabecera con título */}
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
            Gestión servicios
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenNewServiceForm(true)}
            sx={{
              backgroundColor: colors.primary,
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.8)
              }
            }}
          >
            Nuevo servicio
          </Button>
        </Box>

        {/* Filtros y Búsqueda */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Filtro de Búsqueda */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar servicio"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: colors.primary }} />
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

          {/* Filtro por Categoría */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por categoría</InputLabel>
              <Select
                value={filters.category}
                label="Filtrar por categoría"
                onChange={(e) => handleFilterChange('category', e.target.value)}
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
                <MenuItem value="all">Todas las categorías</MenuItem>
                {categories
                  .filter(category => category !== 'all')
                  .map((category, index) => (
                    <MenuItem key={index} value={category}>{category}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por Tipo */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por tipo</InputLabel>
              <Select
                value={filters.tratamiento}
                label="Filtrar por tipo"
                onChange={(e) => handleFilterChange('tratamiento', e.target.value)}
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
                <MenuItem value="all">Todos los tipos</MenuItem>
                <MenuItem value="yes">Tratamientos</MenuItem>
                <MenuItem value="no">Servicios regulares</MenuItem>
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
            {filteredServices.length} {filteredServices.length === 1 ? 'servicio' : 'servicios'} encontrados
          </Typography>

          {/* Botones de acciones */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterAlt />}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  backgroundColor: colors.hover
                }
              }}
            >
              {filtersExpanded ? 'Ocultar filtros' : 'Filtros avanzados'}
            </Button>

            {filterChips.length > 0 && (
              <Button
                variant="text"
                onClick={resetFilters}
                sx={{
                  color: colors.secondaryText
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        </Box>

        {/* Panel de filtros */}
        {filtersExpanded && (
          <FilterSection
            expanded={filtersExpanded}
            filters={filters}
            categories={categories}
            priceRange={priceRange}
            maxPrice={maxPrice}
            formatPrice={formatPrice}
            onFilterChange={handleFilterChange}
            onPriceChange={handlePriceChange}
            onPriceChangeCommitted={handlePriceChangeCommitted}
            onReset={resetFilters}
            isDarkTheme={isDarkTheme}
            colors={colors}
          />
        )}

        {/* Chips de filtros activos */}
        {filterChips.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {filterChips.map((chip) => (
              <Chip
                key={chip.name}
                label={`${chip.label}: ${chip.value}`}
                onDelete={() => removeChip(chip.name)}
                sx={{
                  backgroundColor: colors.hover,
                  color: colors.text,
                  '& .MuiChip-deleteIcon': {
                    color: colors.text,
                    '&:hover': {
                      color: colors.deleteButton
                    }
                  }
                }}
              />
            ))}
          </Box>
        )}

        {/* Estado de carga */}
        {isLoading && !services.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabla de servicios */}
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
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Imagen</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Servicio</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Duración</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Precio</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Categoría</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredServices.length > 0 ? (
                filteredServices.map((service, index) => (
                  <ServiceRow
                    key={service?.id || index}
                    service={service}
                    index={index}
                    colors={colors}
                    isDarkTheme={isDarkTheme}
                    onViewDetails={handleViewDetails}
                    onEdit={handleSelectServiceToEdit}
                    onDelete={handleSelectServiceToDelete}
                    onImageClick={handleViewImage}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography sx={{ color: colors.secondaryText, py: 2 }}>
                      {isLoading ? 'Cargando servicios...' : 'No hay servicios disponibles'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Información de resultados */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: colors.secondaryText }}>
            Mostrando {filteredServices.length} servicios
          </Typography>

          {filteredServices.length > 0 && (
            <Typography variant="body2" sx={{ color: colors.secondaryText }}>
              Precio promedio: {formatPrice(averagePrice)}
            </Typography>
          )}
        </Box>

        {/* Dialogos con lazy loading para mejor rendimiento */}
        <Suspense fallback={<CircularProgress />}>
          {/* Diálogo de detalles del servicio - solo se renderiza cuando se abre */}
          {openDialog && selectedService && (
            <ServiceDetailsDialog
              open={openDialog}
              service={selectedService}
              onClose={() => setOpenDialog(false)}
              onImageClick={handleViewImage}
              colors={colors}
            />
          )}
          {/* Diálogo de imagen optimizado como componente independiente */}
          <ImageDialog
            open={openImageDialog}
            imageUrl={selectedImage}
            onClose={() => setOpenImageDialog(false)}
          />

          {/* Diálogo de confirmación como componente independiente */}
          <ConfirmDialog
            open={openConfirmDialog}
            onClose={() => setOpenConfirmDialog(false)}
            onConfirm={handleDeleteService}
            title="Confirmar eliminación"
            message={serviceToDelete ? `¿Estás seguro de que deseas eliminar el servicio "${serviceToDelete.title}"?` : ''}
            isProcessing={isProcessing}
            colors={colors}
          />

          {/* Componentes de diálogo con lazy loading */}
          {openNewServiceForm && (
            <NewService
              open={openNewServiceForm}
              handleClose={() => setOpenNewServiceForm(false)}
              onServiceCreated={handleServiceCreated}
            />
          )}

          {openCategoriesDialog && (
            <CategoryService
              open={openCategoriesDialog}
              handleClose={() => setOpenCategoriesDialog(false)}
            />
          )}

          {openEditDialog && (
            <EditServiceDialog
              open={openEditDialog}
              handleClose={() => setOpenEditDialog(false)}
              serviceId={selectedService}
              onUpdate={() => fetchServices(true)}
            />
          )}

          <Notificaciones
            open={notification.open}
            message={notification.message}
            type={notification.type}
            onClose={handleNotificationClose}
          />
        </Suspense>

        {/* Botón para gestionar categorías */}
        <Tooltip title="Gestionar categorías">
          <Fab
            size="medium"
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              bgcolor: colors.primary,
              '&:hover': {
                bgcolor: alpha(colors.primary, 0.9)
              }
            }}
            onClick={() => setOpenCategoriesDialog(true)}
          >
            <MenuBook />
          </Fab>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default React.memo(ServicioForm);