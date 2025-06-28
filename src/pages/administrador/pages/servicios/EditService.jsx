import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, FormControl, InputLabel, Select, MenuItem, Box, IconButton,
  Typography, Paper, Tooltip, Divider, FormControlLabel, Switch
} from '@mui/material';
import {
  Close, Add as AddIcon, Delete as DeleteIcon,
  InfoOutlined, AccessTime, AttachMoney, Category,
  Description, CheckCircle, List, HealthAndSafety,
  Save as SaveIcon, EventAvailable, LocalHospital,
  CalendarMonth
} from '@mui/icons-material';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

/**
 * Componente para editar un servicio dental existente
 * Incluye funcionalidad para indicar si es un tratamiento y el número estimado de citas
 */
const EditService = ({ open, handleClose, serviceId, onUpdate }) => {
  const { isDarkTheme } = useThemeContext();
  const [editedService, setEditedService] = useState(null);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  const [categories, setCategories] = useState([]);

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Theme colors
  const colors = {
    primary: '#03427C',
    background: isDarkTheme ? '#1a1a1a' : '#ffffff',
    paperBg: isDarkTheme ? '#2d2d2d' : '#E5F3FD',
    paperBg2: isDarkTheme ? '#333333' : '#F9FDFF',
    text: isDarkTheme ? '#ffffff' : '#000000',
    error: '#ff3d00',
    treatment: '#E91E63'
  };

  useEffect(() => {
    if (!serviceId) return;

    const fetchData = async () => {
      try {
        console.log("Solicitando servicio con ID:", serviceId);

        // Obtener datos del servicio por ID
        const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/get/${serviceId}`);
        if (!response.ok) throw new Error(`Error ${response.status}: Servicio no encontrado`);
        const data = await response.json();

        const [min, max] = (data.duration || '').split('-').map(d => d.replace(/\D/g, ''));
        setEditedService({
          ...data,
          durationMin: min || '',
          durationMax: max || '',
          benefits: data.benefits?.length ? data.benefits : [''],
          includes: data.includes?.length ? data.includes : [''],
          preparation: data.preparation?.length ? data.preparation : [''],
          aftercare: data.aftercare?.length ? data.aftercare : [''],
          tratamiento: data.tratamiento || 0, // Si no existe, por defecto no es tratamiento
          citasEstimadas: data.citasEstimadas || '1' // Si no existe, por defecto 1 cita
        });

        // Obtener categorías desde el endpoint
        const categoryResponse = await fetch('https://back-end-4803.onrender.com/api/servicios/categorias');
        const categories = await categoryResponse.json();
        setCategories(categories); // Guardar categorías en el estado

      } catch (error) {
        console.error('Error al obtener el servicio:', error);
      }
    };

    fetchData();
  }, [serviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedService(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Manejador especial para el switch de tratamiento
  const handleTratamientoChange = (event) => {
    setEditedService(prev => ({ 
      ...prev, 
      tratamiento: event.target.checked ? 1 : 0,
      // Resetear el campo de citas estimadas si no es tratamiento
      citasEstimadas: event.target.checked ? prev.citasEstimadas : '1'
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setEditedService(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleAddItem = (field) => {
    setEditedService(prev => ({
      ...prev,
      [field]: prev[field] ? [...prev[field], ''] : ['']
    }));
    setNotification({ open: true, message: `agregado ${field}.`, type: 'success' });
  };

  const handleRemoveItem = (field, index) => {
    setEditedService(prev => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });

    setNotification({ open: true, message: `eliminado ${field}.`, type: 'info' });
  };

  useEffect(() => {
    if (notification.open) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.open]);

  const validateForm = () => {
    const newErrors = {};

    if (!editedService.title?.trim()) newErrors.title = 'El título es requerido';
    if (!editedService.description?.trim()) newErrors.description = 'La descripción es requerida';
    if (!editedService.category?.trim()) newErrors.category = 'La categoría es requerida';
    if (!editedService.durationMin) newErrors.durationMin = 'La duración mínima es requerida';
    if (!editedService.durationMax) newErrors.durationMax = 'La duración máxima es requerida';
    if (parseInt(editedService.durationMin) > parseInt(editedService.durationMax)) {
      newErrors.durationMin = 'La duración mínima no puede ser mayor que la máxima';
    }
    if (!editedService.price || editedService.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';

    // Validación para citas estimadas (solo si es tratamiento)
    if (editedService.tratamiento === 1) {
      if (!editedService.citasEstimadas || isNaN(editedService.citasEstimadas)) {
        newErrors.citasEstimadas = 'Ingrese un número válido de citas.';
      } else if (parseInt(editedService.citasEstimadas) < 1) {
        newErrors.citasEstimadas = 'Debe haber al menos 1 cita.';
      } else if (parseInt(editedService.citasEstimadas) > 50) {
        newErrors.citasEstimadas = 'El número de citas parece muy alto.';
      }
    }

    // Validate arrays have at least one non-empty item
    ['benefits', 'includes', 'preparation', 'aftercare'].forEach(field => {
      if (!editedService[field]?.some(item => item.trim())) {
        newErrors[field] = `Debe agregar al menos un ${field}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formattedService = {
      ...editedService,
      duration: `${editedService.durationMin}-${editedService.durationMax} minutos`,
      benefits: editedService.benefits?.filter(b => b.trim()) || [],
      includes: editedService.includes?.filter(i => i.trim()) || [],
      preparation: editedService.preparation?.filter(p => p.trim()) || [],
      aftercare: editedService.aftercare?.filter(a => a.trim()) || []
    };

    try {
      const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/update/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedService)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al actualizar el servicio:', errorData.message || 'Error desconocido');
        setNotification({ open: true, message: errorData.message || 'Error desconocido', type: 'error' });
        return;
      }

      const responseData = await response.json();
      console.log("Servicio actualizado correctamente:", responseData);

      setNotification({ open: false });
      setTimeout(() => {
        setNotification({ open: true, message: 'Servicio actualizado correctamente', type: 'success' });

        setTimeout(() => {
          onUpdate();
          handleClose();
        }, 1500);

      }, 200);

    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      setNotification({ open: true, message: 'Error en la conexión con el servidor.', type: 'error' });
    }
  };

  if (!editedService) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: colors.background
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: editedService.tratamiento === 1 ? colors.treatment : colors.primary,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HealthAndSafety />
          <span>Editar Servicio</span>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.paperBg }}>
          <Typography variant="h6" color={editedService.tratamiento === 1 ? colors.treatment : colors.primary} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Description />
            Detalles del Servicio
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Servicio"
                name="title"
                value={editedService.title || ''}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                InputProps={{
                  startAdornment: <InfoOutlined sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            {/* Campo de tratamiento */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedService.tratamiento === 1}
                    onChange={handleTratamientoChange}
                    color={editedService.tratamiento === 1 ? "secondary" : "primary"}
                    icon={<LocalHospital />}
                    checkedIcon={<LocalHospital />}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: colors.treatment,
                        '&:hover': {
                          backgroundColor: 'rgba(233, 30, 99, 0.1)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: colors.treatment
                      }
                    }}
                  />
                }
                label={
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: editedService.tratamiento === 1 ? colors.treatment : colors.primary,
                      fontWeight: 'medium',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <LocalHospital fontSize="small" />
                    {editedService.tratamiento === 1 ? "Es tratamiento" : "No es tratamiento"}
                  </Typography>
                }
                labelPlacement="end"
                sx={{ 
                  m: 0,
                  backgroundColor: editedService.tratamiento === 1 
                    ? (isDarkTheme ? 'rgba(233, 30, 99, 0.15)' : 'rgba(233, 30, 99, 0.08)') 
                    : 'transparent',
                  p: 1,
                  borderRadius: 1,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  border: editedService.tratamiento === 1 
                    ? `1px solid ${colors.treatment}` 
                    : '1px solid transparent'
                }}
              />
            </Grid>
            
            {/* Duración por cita */}
            <Grid item xs={12}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1,
                  color: editedService.tratamiento === 1 ? colors.treatment : colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AccessTime fontSize="small" />
                Duración por cita
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Duración Mínima"
                name="durationMin"
                value={editedService.durationMin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleChange({ target: { name: 'durationMin', value } });
                }}
                error={!!errors.durationMin}
                helperText={errors.durationMin}
                InputProps={{
                  startAdornment: <AccessTime sx={{ color: 'action.active', mr: 1 }} />,
                  endAdornment: <Typography variant="caption">min</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Duración Máxima"
                name="durationMax"
                value={editedService.durationMax}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleChange({ target: { name: 'durationMax', value } });
                }}
                error={!!errors.durationMax}
                helperText={errors.durationMax}
                InputProps={{
                  startAdornment: <AccessTime sx={{ color: 'action.active', mr: 1 }} />,
                  endAdornment: <Typography variant="caption">min</Typography>
                }}
              />
            </Grid>
            
            {/* Campo de citas estimadas (solo visible si es tratamiento) */}
            {editedService.tratamiento === 1 && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número de citas estimadas"
                  name="citasEstimadas"
                  value={editedService.citasEstimadas}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'citasEstimadas', value } });
                  }}
                  error={!!errors.citasEstimadas}
                  helperText={errors.citasEstimadas || 'Cantidad aproximada de citas para completar el tratamiento'}
                  InputProps={{
                    startAdornment: <CalendarMonth sx={{ color: colors.treatment, mr: 1 }} />,
                    endAdornment: <Typography variant="caption">citas</Typography>
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: colors.treatment,
                      },
                      '&:hover fieldset': {
                        borderColor: colors.treatment,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colors.treatment,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.treatment,
                      '&.Mui-focused': {
                        color: colors.treatment,
                      }
                    }
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio"
                name="price"
                type="number"
                value={editedService.price || ''}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="category"
                  value={editedService.category || ''}
                  onChange={handleChange}
                >
                  {categories.length > 0 ? (
                    categories.map((cat, index) => (
                      <MenuItem key={index} value={cat}>
                        {cat}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Cargando categorías...</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                name="description"
                value={editedService.description || ''}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, backgroundColor: colors.paperBg2 }}>
          <Typography variant="h6" color={editedService.tratamiento === 1 ? colors.treatment : colors.primary} sx={{ mb: 2 }}>
            Detalles Adicionales
          </Typography>

          {[
            { field: 'benefits', label: 'Beneficios', icon: <CheckCircle /> },
            { field: 'includes', label: 'Incluye', icon: <List /> },
            { field: 'preparation', label: 'Preparación', icon: <AccessTime /> },
            { field: 'aftercare', label: 'Cuidados Posteriores', icon: <EventAvailable /> }
          ].map(({ field, label, icon }) => (
            <Box key={field} sx={{ mb: 3 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="subtitle1" color={editedService.tratamiento === 1 ? colors.treatment : colors.primary} sx={{
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  {icon}
                  {label}
                </Typography>
                <Tooltip title={`Agregar ${label}`}>
                  <IconButton
                    onClick={() => handleAddItem(field)}
                    sx={{ color: editedService.tratamiento === 1 ? colors.treatment : colors.primary }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {editedService[field].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`${label} ${index + 1}`}
                    value={item}
                    onChange={(e) => handleArrayChange(field, index, e.target.value)}
                    error={!!errors[field] && index === 0}
                    helperText={index === 0 ? errors[field] : ''}
                  />
                  {editedService[field].length > 1 && (
                    <Tooltip title="Eliminar">
                      <IconButton
                        onClick={() => handleRemoveItem(field, index)}
                        sx={{ color: colors.error }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Paper>
      </DialogContent>
      <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: colors.primary }}>
          Cancelar
        </Button>
        <Tooltip title="Guardar Cambios">
          <IconButton
            onClick={handleSubmit}
            sx={{
              backgroundColor: editedService.tratamiento === 1 ? colors.treatment : colors.primary,
              color: '#fff',
              '&:hover': {
                backgroundColor: editedService.tratamiento === 1 ? colors.treatment : colors.primary,
                opacity: 0.9
              }
            }}
          >
            <SaveIcon />
          </IconButton>
        </Tooltip>
      </DialogActions>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={handleNotificationClose}
      />
    </Dialog>
  );
};

export default EditService;