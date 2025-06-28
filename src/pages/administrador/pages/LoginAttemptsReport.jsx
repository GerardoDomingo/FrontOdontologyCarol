import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Button, Dialog, DialogTitle, DialogContent, Grid, IconButton, Card, CardContent, Avatar, TextField } from '@mui/material';
import { FaInfoCircle, FaTimes, FaIdCard, FaCalendarAlt, FaPhone, FaEnvelope } from 'react-icons/fa'; // Íconos
import format from 'date-fns/format';
import Notificaciones from '../../../components/Layout/Notificaciones'; // Importar Notificaciones
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const LoginAttemptsReport = () => {
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null); // Para almacenar el paciente seleccionado
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // Estado para controlar el modal
  const [maxAttempts, setMaxAttempts] = useState(''); // Estado para los intentos máximos
  const [lockTimeMinutes, setLockTimeMinutes] = useState(''); // Estado para el tiempo de bloqueo
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar si se está en modo edición
  const [notificationOpen, setNotificationOpen] = useState(false); // Controlar notificación
  const [notificationMessage, setNotificationMessage] = useState(''); // Mensaje de notificación
  const [notificationType, setNotificationType] = useState('success'); // Tipo de notificación
  const { isDarkTheme } = useThemeContext();

  // Definición de colores
  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#ffffff',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    tableBackground: isDarkTheme ? '#1E2A3A' : '#e3f2fd',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
    inputText: isDarkTheme ? '#FFFFFF' : '#333333',
    inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',
    inputBorder: isDarkTheme ? '#4B9FFF' : '#e0e0e0',
    primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
  };

  // Estilos para los inputs
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.paper,
      color: colors.text,
      '& fieldset': {
        borderColor: colors.inputBorder,
        borderWidth: isDarkTheme ? '2px' : '1px',
      },
      '&:hover fieldset': {
        borderColor: colors.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary,
      }
    },
    '& .MuiInputLabel-root': {
      color: colors.inputLabel,
      '&.Mui-focused': {
        color: colors.primary
      }
    }
  };

  // Obtener los intentos de login y la configuración
  useEffect(() => {
    const fetchLoginAttempts = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/reportes/login-attempts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los intentos de login');
        }
        const data = await response.json();
        const sortedAttempts = data.attempts.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)); // Ordenar por más reciente
        setLoginAttempts(sortedAttempts);

        // Establecer el valor de intentos máximos y tiempo de bloqueo
        setMaxAttempts(data.maxAttempts);
        setLockTimeMinutes(data.lockTimeMinutes);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLoginAttempts();
  }, []);

  // Función para obtener los detalles del paciente
  const handleMoreInfo = async (pacienteId) => {
    try {
      const response = await fetch(`https://back-end-4803.onrender.com/api/reportes/paciente/${pacienteId}`);
      if (!response.ok) {
        throw new Error('Error al obtener la información del paciente');
      }

      const paciente = await response.json();
      setSelectedPaciente(paciente); // Guardar el paciente seleccionado
      setOpen(true); // Abrir el modal
    } catch (err) {
      setError(err.message);
    }
  };

  // Función para cerrar el modal
  const handleClose = () => {
    setOpen(false);
    setSelectedPaciente(null);
  };

  // Función para iniciar el modo de edición
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Función para guardar la configuración actualizada (intentos máximos y tiempo de bloqueo)
  const handleSaveConfig = async () => {
    try {
      const response1 = await fetch('https://back-end-4803.onrender.com/api/reportes/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settingName: 'MAX_ATTEMPTS', settingValue: maxAttempts }),
      });

      const response2 = await fetch('https://back-end-4803.onrender.com/api/reportes/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settingName: 'LOCK_TIME_MINUTES', settingValue: lockTimeMinutes }),
      });

      if (response1.ok && response2.ok) {
        setNotificationMessage('Configuración actualizada exitosamente');
        setNotificationType('success');
        setIsEditing(false);
      } else {
        setNotificationMessage('Error al actualizar la configuración');
        setNotificationType('error');
      }
      setNotificationOpen(true); // Mostrar notificación
    } catch (err) {
      setNotificationMessage('Error al actualizar la configuración');
      setNotificationType('error');
      setNotificationOpen(true); // Mostrar notificación
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setNotificationMessage('');
  };

  // Función para cerrar notificación
  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  // Validación para permitir solo números positivos
  const handleInputChange = (setter) => (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      {error && <Typography color="error">{error}</Typography>}
      <Typography
        variant="h5"
        sx={{
          marginBottom: 2,
          fontWeight: 'bold',
          color: colors.primary
        }}
      >
        Reporte de Intentos de Login
      </Typography>

      {/* Campos de configuración */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Intentos máximos permitidos"
          value={maxAttempts}
          onChange={handleInputChange(setMaxAttempts)}
          fullWidth
          sx={{
            mb: 2,
            ...inputStyles
          }}
          disabled={!isEditing}
        />
        <TextField
          label="Tiempo de bloqueo (minutos)"
          value={lockTimeMinutes}
          onChange={handleInputChange(setLockTimeMinutes)}
          fullWidth
          sx={{
            mb: 2,
            ...inputStyles
          }}
          disabled={!isEditing}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          {!isEditing ? (
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.primary,
                '&:hover': {
                  backgroundColor: colors.hover
                }
              }}
              onClick={handleEdit}
            >
              Editar
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.primary,
                  '&:hover': {
                    backgroundColor: colors.hover
                  }
                }}
                onClick={handleSaveConfig}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: colors.primary,
                  borderColor: colors.primary,
                  '&:hover': {
                    borderColor: colors.hover
                  }
                }}
                onClick={handleCancelEdit}
              >
                Cancelar
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Notificaciones
        open={notificationOpen}
        message={notificationMessage}
        type={notificationType}
        handleClose={handleCloseNotification}
      />

      {/* Tabla */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
          backgroundColor: colors.paper
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: colors.tableBackground }}>
            <TableRow>
              <TableCell sx={{ color: colors.text }}>ID</TableCell>
              <TableCell sx={{ color: colors.text }}>IP Address</TableCell>
              <TableCell sx={{ color: colors.text }}>Paciente ID</TableCell>
              <TableCell sx={{ color: colors.text }}>Fecha/Hora</TableCell>
              <TableCell sx={{ color: colors.text }}>Intentos Fallidos</TableCell>
              <TableCell sx={{ color: colors.text }}>Fecha Bloqueo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loginAttempts.map((attempt) => (
              <TableRow
                key={attempt.id}
                sx={{
                  '&:hover': {
                    backgroundColor: colors.hover
                  }
                }}
              >
                <TableCell sx={{ color: colors.text }}>{attempt.id}</TableCell>
                <TableCell sx={{ color: colors.text }}>{attempt.ip_address}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: colors.primary,
                      '&:hover': {
                        backgroundColor: colors.hover
                      }
                    }}
                    startIcon={<FaInfoCircle />}
                    onClick={() => handleMoreInfo(attempt.paciente_id)}
                  >
                    Más información
                  </Button>
                </TableCell>
                <TableCell sx={{ color: colors.text }}>
                  {format(new Date(attempt.fecha_hora), 'dd/MM/yyyy HH:mm:ss')}
                </TableCell>
                <TableCell sx={{ color: colors.text }}>{attempt.intentos_fallidos}</TableCell>
                <TableCell sx={{ color: colors.text }}>
                  {attempt.fecha_bloqueo ? format(new Date(attempt.fecha_bloqueo), 'dd/MM/yyyy HH:mm:ss') : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
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
          {selectedPaciente ? (
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
                        {selectedPaciente.nombre.charAt(0)}
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: colors.primary, mb: 1 }}>
                        {selectedPaciente.nombre} {selectedPaciente.aPaterno} {selectedPaciente.aMaterno}
                      </Typography>
                      {/* Información del paciente con colores actualizados */}
                      <Typography variant="body1" sx={{ mb: 1, color: colors.text }}>
                        <FaIdCard /> <strong>ID:</strong> {selectedPaciente.id}
                      </Typography>
                      {/* ... resto de la información del paciente con el mismo patrón ... */}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Typography sx={{ color: colors.text }}>Cargando información...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoginAttemptsReport;
