import {
  Avatar, Box, Button, Card, CardContent,
  Chip, CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem,
  Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography, Tooltip
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import format from 'date-fns/format';
import { es } from 'date-fns/locale';
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
  FaFileMedical
} from 'react-icons/fa';

import { useNavigate } from "react-router-dom";


const PatientsReport = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [open, setOpen] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [patientToUpdate, setPatientToUpdate] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    lugar: 'todos',  // Valor por defecto para el lugar
    estado: 'todos',
    searchTerm: ''
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    filterPatients(formData.searchTerm, formData.estado, value);
  };

  // Configuración del tema oscuro
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  useEffect(() => {
    const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkTheme(matchDarkTheme.matches);
    const handleThemeChange = (e) => {
      setIsDarkTheme(e.matches);
    };
    matchDarkTheme.addEventListener('change', handleThemeChange);
    return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
  }, []);

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
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/reportes/pacientes');
        setPatients(response.data);
        setFilteredPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

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
    filterPatients(searchValue, statusFilter, formData.lugar);
  };

  // Función para manejar el filtro de estado
  const handleStatusFilter = (event) => {
    const status = event.target.value;
    setStatusFilter(status);
    filterPatients(searchTerm, status, formData.lugar);
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

  // Función para normalizar texto (mantener esta parte)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Función para cambiar estado (mantener esta parte)
  const handleStatusChange = async (patient) => {
    if (!patient) {
      console.error('No se proporcionó información del paciente');
      return;
    }
    setPatientToUpdate(patient);
    setOpenConfirmDialog(true);
  };

  //handleConfirmStatusChange actual por esta:
  const handleConfirmStatusChange = async () => {
    const expectedName = `${patientToUpdate.nombre} ${patientToUpdate.aPaterno}`;
    const normalizedExpected = normalizeText(expectedName);
    const normalizedInput = normalizeText(confirmName);

    if (normalizedInput !== normalizedExpected) {
      setNotificationMessage('Por favor, escriba el nombre y apellido del paciente correctamente');
      setNotificationType('error');
      setNotificationOpen(true);
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
        setFilteredPatients(updatedPatients);
        setNotificationMessage('Paciente dado de baja exitosamente');
        setNotificationType('success');
      } else {
        throw new Error(response.data.message || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      setNotificationMessage('Error al dar de baja al paciente');
      setNotificationType('error');
    } finally {
      setIsProcessing(false);
      setOpenConfirmDialog(false);
      setConfirmName('');
      setPatientToUpdate(null);
      setNotificationOpen(true);
    }
  };

  // Función para filtrar pacientes
  const filterPatients = (search, status, location) => {
    let filtered = patients.filter(patient => {
      const matchesSearch =
        patient.nombre.toLowerCase().includes(search) ||
        patient.aPaterno.toLowerCase().includes(search) ||
        patient.aMaterno.toLowerCase().includes(search) ||
        patient.email.toLowerCase().includes(search) ||
        patient.telefono.includes(search);
      const matchesStatus = status === 'todos' || patient.estado === status;
      const matchesLocation = location === 'todos' || patient.lugar === location;

      return matchesSearch && matchesStatus && matchesLocation; // Filtra por todos los criterios
    });

    setFilteredPatients(filtered);
  };


  return (
    <Card
      sx={{
        minHeight: '100vh',
        backgroundColor: colors.background, // Usar el color del tema
        borderRadius: '16px',
        boxShadow: isDarkTheme ?
          '0 2px 12px rgba(0,0,0,0.3)' :
          '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease' // Agregar transición suave
      }}
    >
      <Box sx={{ padding: { xs: 2, sm: 2, md: 8 } }}> {/* Padding responsivo */}
        <Typography
          variant="h5"
          sx={{
            marginBottom: 3,
            fontWeight: 600,
            color: '#0052A3', // Gris azulado oscuro
            fontFamily: 'Roboto, sans-serif',
            textAlign: { xs: 'center', sm: 'left' } // Centrado en móvil, izquierda en desktop
          }}
        >
          Gestión de Pacientes
        </Typography>

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
                borderRadius: '8px', // Bordes redondeados
                '& .MuiOutlinedInput-root': {
                  color: colors.text,
                  borderRadius: '8px', // Bordes redondeados
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
                  borderRadius: '8px', // Bordes redondeados
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
                onChange={handleChange}
                name="lugar"
                sx={{
                  backgroundColor: colors.paper,
                  color: colors.text,
                  borderRadius: '8px', // Bordes redondeados
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
                    borderRadius: '8px', // Bordes redondeados
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
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Correo</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Fecha de Registro</TableCell>
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
                    <Tooltip title="Expediente Clínico" arrow>
        <IconButton
        onClick={() => navigate(`/Empleado/ExpedienteClinico`, { 
        state: { 
        id: patient.id,
        nombre: patient.nombre, 
        telefono: patient.telefono, 
        correo: patient.email 
        } 
      })}
        sx={{
          backgroundColor: '#2196f3',
          '&:hover': {
          backgroundColor: '#1976d2',
          },
          padding: '8px',
          borderRadius: '50%',
         }}
        >
             <FaFileMedical style={{ fontSize: '20px', color: 'white' }} />
                </IconButton>
                  </Tooltip>
                      {/* Botón de detalles con tooltip */}
                      <Tooltip title="Ver detalles" arrow>
                        <IconButton
                          onClick={() => handleOpenModal(patient)}
                          sx={{
                            backgroundColor: colors.primary,
                            '&:hover': {
                              backgroundColor: colors.hover,
                            },
                            padding: '8px',  // Tamaño adecuado para que el icono se vea claro
                            borderRadius: '50%', // Asegura que sea circular
                          }}
                        >
                          <FaInfoCircle style={{ fontSize: '20px', color: 'white' }} />
                        </IconButton>
                      </Tooltip>
  
                      {/* Botón de dar de baja con tooltip */}
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
        {/* Diálogo de confirmación actualizado */}
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
        {/* Snackbar para notificaciones */}
        <Snackbar
          open={notificationOpen}
          autoHideDuration={6000}
          onClose={() => setNotificationOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            severity={notificationType}
            onClose={() => setNotificationOpen(false)}
          >
            {notificationMessage}
          </MuiAlert>
        </Snackbar>

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
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FaUserCheck style={{ marginRight: 8, color: colors.primary }} />
                      <Typography sx={{ color: colors.text }}>{selectedPatient.estado}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Card>

  );
};

export default PatientsReport;