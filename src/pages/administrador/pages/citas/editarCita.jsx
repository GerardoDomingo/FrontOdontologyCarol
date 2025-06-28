import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Typography, Divider, CircularProgress,
} from '@mui/material';
import { Edit, AttachMoney } from '@mui/icons-material';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';
import Notificaciones from '../../../../components/Layout/Notificaciones';

const EditCita = ({ open, handleClose, appointmentData, onUpdate }) => {
  const { isDarkTheme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    paciente_id: '',
    servicio_id: '',
    servicio_nombre: '',
    categoria_servicio: '',
    precio_servicio: '',
    fecha: '',
    hora: '',
    estado: 'Pendiente',
    notas: ''
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: ''
  });

  const [formErrors, setFormErrors] = useState({
    servicio_id: false,
    fecha: false,
    hora: false,
    precio_servicio: false
  });

  // Cargar servicios una sola vez
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
        if (!response.ok) throw new Error('Error al cargar servicios');
        const data = await response.json();
        setServicios(data);
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          open: true,
          message: 'Error al cargar la lista de servicios',
          type: 'error'
        });
      }
    };
    fetchServicios();
  }, []);

  // Reiniciar notificaciones y formulario al abrir el diálogo
  useEffect(() => {
    if (open && appointmentData) {
      // Limpiar notificaciones para evitar persistencia de mensajes antiguos
      setNotification({ open: false, message: '', type: '' });

      const newFormData = {
        paciente_id: appointmentData.paciente_id || '',
        servicio_id: appointmentData.servicio_id ? appointmentData.servicio_id.toString() : '',
        servicio_nombre: appointmentData.servicio_nombre || '',
        categoria_servicio: appointmentData.categoria_servicio || '',
        precio_servicio: appointmentData.precio_servicio ? parseFloat(appointmentData.precio_servicio).toFixed(2) : '',
        fecha: appointmentData.fecha_consulta
          ? new Date(appointmentData.fecha_consulta).toISOString().split('T')[0]
          : '',
        hora: appointmentData.fecha_consulta
          ? new Date(appointmentData.fecha_consulta).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'
          })
          : '',
        estado: appointmentData.estado || 'Pendiente',
        notas: appointmentData.notas || ''
      };

      setFormData(newFormData);
      setOriginalData(newFormData);
    }
  }, [open, appointmentData]);

  // Manejo de cambios en inputs generales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  // Manejo de cambios en el servicio para actualizar nombre, categoría y precio
  const handleServiceChange = (e) => {
    const { value } = e.target; // value del select (string con el ID)
    const selectedService = servicios.find(servicio => servicio.id.toString() === value);

    if (selectedService) {
      console.log('Servicio seleccionado:', selectedService);
      console.log('ID del servicio seleccionado:', selectedService.id);

      setFormData(prev => ({
        ...prev,
        servicio_id: selectedService.id.toString(), // Usar el ID del servicio seleccionado
        servicio_nombre: selectedService.title,
        categoria_servicio: selectedService.category,
        precio_servicio: parseFloat(selectedService.price || 0).toFixed(2)
      }));
    }

    if (formErrors.servicio_id) {
      setFormErrors(prev => ({ ...prev, servicio_id: false }));
    }
  };
  // Validación del formulario
  const validateForm = () => {
    const errors = {
      servicio_id: !formData.servicio_id,
      fecha: !formData.fecha,
      hora: !formData.hora,
      precio_servicio: !formData.precio_servicio || isNaN(formData.precio_servicio)
    };
    setFormErrors(errors);
    return !Object.values(errors).some(err => err);
  };

  const isEqual = (obj1, obj2) => {
    return Object.keys(obj1).every(key => obj1[key] === obj2[key]);
  };

  // Envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isEqual(formData, originalData)) {
      setNotification({
        open: true,
        message: 'No se realizaron cambios en la cita.',
        type: 'info'
      });
      // Mostrar notificación brevemente y luego cerrar
      setTimeout(() => {
        setNotification({ open: false, message: '', type: '' });
        handleClose();
      }, 1000);
      return;
    }

    setLoading(true);
    setNotification({ open: false, message: '', type: '' });

    try {
      const fechaHora = `${formData.fecha}T${formData.hora}:00`;
      const fecha_consulta = new Date(fechaHora);

      const response = await fetch(`https://back-end-4803.onrender.com/api/citas/update/${appointmentData.consulta_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          servicio_id: formData.servicio_id,
          servicio_nombre: formData.servicio_nombre,
          categoria_servicio: formData.categoria_servicio,
          precio_servicio: formData.precio_servicio,
          fecha_consulta: fecha_consulta.toISOString(),
          estado: formData.estado,
          notas: formData.notas
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar la cita');

      setNotification({
        open: true,
        message: '¡Cita actualizada con éxito!',
        type: 'success'
      });

      setTimeout(() => {
        setNotification({ open: false, message: '', type: '' });
        handleClose();
        if (onUpdate) onUpdate();
      }, 2500);

    } catch (error) {
      console.error('Error al actualizar la cita:', error);
      setNotification({
        open: true,
        message: 'Ocurrió un error al actualizar la cita. Por favor intente nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Definición de colores según el tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    cardBg: isDarkTheme ? '#1A2735' : '#ffffff',
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? null : () => { setNotification({ open: false, message: '', type: '' }); handleClose(); }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.cardBg,
          color: colors.text,
          borderRadius: '8px',
          boxShadow: 10
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: colors.primary,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px'
      }}>
        <Edit />
        Editar Cita #{appointmentData?.consulta_id}
      </DialogTitle>

      <DialogContent sx={{ mt: 2, px: 3 }}>
        <Grid container spacing={2}>
          {/* Información del paciente (solo lectura) */}
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
              <strong>Paciente:</strong> {appointmentData?.paciente_nombre} {appointmentData?.paciente_apellido_paterno} {appointmentData?.paciente_apellido_materno}
              {appointmentData?.paciente_genero ? ` (${appointmentData.paciente_genero})` : ""}
            </Typography>
          </Grid>

          {/* Sección del servicio */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Servicio</InputLabel>
              <Select
                name="servicio_id"
                value={formData.servicio_id}
                onChange={handleServiceChange}
                label="Tipo de Servicio"
              >
                {servicios.map(servicio => (
                  <MenuItem key={servicio.id} value={servicio.id.toString()}>
                    {servicio.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled>
              <TextField
                label="Categoría del Servicio"
                value={formData.categoria_servicio}
                fullWidth
                disabled
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="precio_servicio"
              label="Precio del Servicio"
              value={formData.precio_servicio}
              onChange={handleChange}
              fullWidth
              type="number"
              inputProps={{ step: "0.01", min: "0" }}
              InputProps={{
                startAdornment: <AttachMoney sx={{ mr: 1, ml: -0.5 }} />
              }}
              error={formErrors.precio_servicio}
              helperText={formErrors.precio_servicio ? "Ingrese un precio válido" : ""}
              disabled={loading}
            />
          </Grid>

          {/* Sección de detalles de la cita */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              type="date"
              name="fecha"
              label="Fecha"
              value={formData.fecha}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={formErrors.fecha}
              helperText={formErrors.fecha ? "La fecha es requerida" : ""}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              type="time"
              name="hora"
              label="Hora"
              value={formData.hora}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={formErrors.hora}
              helperText={formErrors.hora ? "La hora es requerida" : ""}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Estado de la Cita</InputLabel>
              <Select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                label="Estado de la Cita"
                disabled={loading}
              >
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Confirmada">Confirmada</MenuItem>
                <MenuItem value="Cancelada">Cancelada</MenuItem>
                <MenuItem value="Completada">Completada</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="notas"
              label="Notas adicionales"
              multiline
              rows={4}
              fullWidth
              value={formData.notas}
              onChange={handleChange}
              disabled={loading}
              placeholder="Escriba aquí cualquier información adicional relevante para esta cita..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={() => { setNotification({ open: false, message: '', type: '' }); handleClose(); }}
          color="inherit"
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: '4px' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            borderRadius: '4px',
            boxShadow: 3,
            '&:hover': { boxShadow: 5 }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={() => setNotification({ open: false, message: '', type: '' })}
      />
    </Dialog>
  );
};

export default EditCita;
