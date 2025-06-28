import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Typography,
  Box,
  Button,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Tooltip,
  Fade,
  Zoom,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Save as SaveIcon, 
  Add as AddIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Link as LinkIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

// Configuración mejorada de redes sociales con iconos y colores
const availableSocials = [
  { 
    label: 'Facebook', 
    name: 'facebook', 
    type: 'url', 
    icon: <FacebookIcon />, 
    color: '#1877F2',
    placeholder: 'https://facebook.com/tu-pagina'
  },
  { 
    label: 'Twitter', 
    name: 'twitter', 
    type: 'url', 
    icon: <TwitterIcon />, 
    color: '#1DA1F2',
    placeholder: 'https://twitter.com/tu-usuario'
  },
  { 
    label: 'LinkedIn', 
    name: 'linkedin', 
    type: 'url', 
    icon: <LinkedInIcon />, 
    color: '#0A66C2',
    placeholder: 'https://linkedin.com/in/tu-perfil'
  },
  { 
    label: 'Instagram', 
    name: 'instagram', 
    type: 'url', 
    icon: <InstagramIcon />, 
    color: '#E4405F',
    placeholder: 'https://instagram.com/tu-usuario'
  },
  { 
    label: 'WhatsApp', 
    name: 'whatsapp', 
    type: 'phone', 
    icon: <WhatsAppIcon />, 
    color: '#25D366',
    placeholder: 'Número de 10 dígitos'
  },
];

const RedesSociales = () => {
  const [socialData, setSocialData] = useState({});
  const [selectedSocial, setSelectedSocial] = useState('');
  const [url, setUrl] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [socialToDelete, setSocialToDelete] = useState(null);
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });
  
  const { isDarkTheme } = useThemeContext();

  // Definición de colores mejorada
  const colors = {
    background: isDarkTheme ? '#263749' : 'rgba(173, 216, 230, 0.2)',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    cardBackground: isDarkTheme ? '#1E2A3A' : '#f8f9fa',
    tableBackground: isDarkTheme ? '#1E2A3A' : '#ffffff',
    tableHeaderBg: isDarkTheme ? '#1B2A3A' : '#e3f2fd',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
    inputText: isDarkTheme ? '#FFFFFF' : '#333333',
    inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',
    inputBorder: isDarkTheme ? '#4B9FFF' : '#e0e0e0',
    primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
    divider: isDarkTheme ? '#445566' : '#e0e0e0',
    success: isDarkTheme ? '#4CAF50' : '#4CAF50',
    error: isDarkTheme ? '#ff6b6b' : '#f44336',
    buttonText: '#FFFFFF'
  };

  // Estilos para los inputs
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
      color: colors.inputText,
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
    },
    '& .MuiSelect-icon': {
      color: colors.inputLabel
    },
    '& .MuiMenuItem-root': {
      color: colors.text
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Cargar las redes sociales de la base de datos
  useEffect(() => {
    const fetchSocials = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/redesSociales/get');
        setSocialData(response.data.reduce((acc, item) => ({ ...acc, [item.nombre_red]: item }), {}));
      } catch (error) {
        console.error('Error al obtener las redes sociales:', error);
        setNotification({
          open: true,
          message: 'Error al cargar las redes sociales',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocials();
  }, []);

  const handleInputChange = (e) => {
    if (selectedSocial === 'whatsapp') {
      // Solo permitir números y hasta 10 dígitos
      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
      setUrl(value);
    } else {
      setUrl(e.target.value);
    }
  };

  const handleSocialSelect = (e) => {
    setSelectedSocial(e.target.value);
    setUrl(''); // Limpiar el campo de URL al seleccionar una nueva red social
  };

  const validateInput = () => {
    if (!url) {
      setNotification({
        open: true,
        message: 'Por favor, ingresa un enlace o número.',
        type: 'error',
      });
      return false;
    }

    if (selectedSocial === 'whatsapp' && url.length !== 10) {
      setNotification({
        open: true,
        message: 'El número de WhatsApp debe tener 10 dígitos.',
        type: 'error',
      });
      return false;
    }

    if (socialData[selectedSocial] && !isEditing) {
      setNotification({
        open: true,
        message: `La red social ${selectedSocial} ya está registrada. Puedes editarla en lugar de agregar una nueva.`,
        type: 'warning',
      });
      return false;
    }

    // Validación básica de URL para redes sociales que no son WhatsApp
    if (selectedSocial !== 'whatsapp') {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setNotification({
          open: true,
          message: 'El enlace debe comenzar con http:// o https://',
          type: 'warning',
        });
        return false;
      }
    }

    return true;
  };

  // Guardar red social (añadir o editar)
  const handleSave = async () => {
    if (validateInput()) {
      setIsSaving(true);
      try {
        if (isEditing !== null) {
          // Editar la red social
          await axios.put(`https://back-end-4803.onrender.com/api/redesSociales/editar/${isEditing}`, {
            nombre_red: selectedSocial,
            url: selectedSocial === 'whatsapp' ? `+52${url}` : url,
          });
          setSocialData({ 
            ...socialData, 
            [selectedSocial]: { 
              ...socialData[selectedSocial], 
              id: isEditing, 
              nombre_red: selectedSocial,
              url: selectedSocial === 'whatsapp' ? `+52${url}` : url 
            } 
          });
          setIsEditing(null);
          setNotification({
            open: true,
            message: 'Red social actualizada con éxito.',
            type: 'success',
          });
        } else {
          // Añadir nueva red social
          const response = await axios.post('https://back-end-4803.onrender.com/api/redesSociales/nuevo', {
            nombre_red: selectedSocial,
            url: selectedSocial === 'whatsapp' ? `+52${url}` : url,
          });
          const newSocial = response.data;
          setSocialData({ ...socialData, [selectedSocial]: newSocial });
          setNotification({
            open: true,
            message: 'Red social agregada con éxito.',
            type: 'success',
          });
        }
        setSelectedSocial('');
        setUrl('');
      } catch (error) {
        console.error('Error al guardar la red social:', error);
        setNotification({
          open: true,
          message: 'Error al guardar la red social.',
          type: 'error',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Abrir diálogo de confirmación para eliminar
  const handleOpenDeleteConfirm = (social) => {
    setSocialToDelete(social);
    setDeleteConfirmOpen(true);
  };

  // Eliminar red social
  const handleDelete = async () => {
    if (!socialToDelete) return;
    
    try {
      const id = socialData[socialToDelete]?.id;
      await axios.delete(`https://back-end-4803.onrender.com/api/redesSociales/eliminar/${id}`);
      const updatedData = { ...socialData };
      delete updatedData[socialToDelete];
      setSocialData(updatedData);
      setNotification({
        open: true,
        message: 'Red social eliminada con éxito.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error al eliminar la red social:', error);
      setNotification({
        open: true,
        message: 'Error al eliminar la red social.',
        type: 'error',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSocialToDelete(null);
    }
  };

  // Editar red social
  const handleEdit = (social) => {
    setIsEditing(socialData[social].id);
    setSelectedSocial(social);
    // Quitar +52 si es WhatsApp
    setUrl(social === 'whatsapp' ? socialData[social].url.replace('+52', '') : socialData[social].url);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(null);
    setSelectedSocial('');
    setUrl('');
  };

  // Obtener ícono para la red social
  const getSocialIcon = (socialName) => {
    const social = availableSocials.find(s => s.name === socialName);
    return social ? social.icon : <LinkIcon />;
  };

  // Obtener color para la red social
  const getSocialColor = (socialName) => {
    const social = availableSocials.find(s => s.name === socialName);
    return social ? social.color : colors.primary;
  };

  // Obtener el nombre amigable para la red social
  const getSocialLabel = (socialName) => {
    const social = availableSocials.find(s => s.name === socialName);
    return social ? social.label : socialName;
  };

  // Renderizar placeholder para el input según la red social seleccionada
  const getInputPlaceholder = () => {
    if (!selectedSocial) return '';
    const social = availableSocials.find(s => s.name === selectedSocial);
    return social ? social.placeholder : '';
  };

  return (
    <Card 
      elevation={3} 
      sx={{
        mt: 4,
        backgroundColor: colors.paper,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            color: colors.text,
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <LinkIcon sx={{ mr: 1.5 }} /> 
          Redes Sociales
        </Typography>
        
        <Divider sx={{ mb: 4, borderColor: colors.divider }} />

        {/* Formulario en una tarjeta separada */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: 4, 
            backgroundColor: colors.cardBackground,
            borderRadius: '12px'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: colors.text,
                fontWeight: 600,
                mb: 2
              }}
            >
              {isEditing ? 'Editar red social' : 'Agregar red social'}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Red social"
                  value={selectedSocial}
                  onChange={handleSocialSelect}
                  fullWidth
                  sx={inputStyles}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
                          color: colors.text
                        }
                      }
                    }
                  }}
                >
                  {availableSocials.map((option) => (
                    <MenuItem 
                      key={option.name} 
                      value={option.name}
                      sx={{
                        color: colors.text,
                        '&:hover': {
                          backgroundColor: colors.hover
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            mr: 1, 
                            bgcolor: option.color,
                            '& .MuiSvgIcon-root': {
                              fontSize: '1rem'
                            }
                          }}
                        >
                          {option.icon}
                        </Avatar>
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label={selectedSocial === 'whatsapp' ? 'Número de WhatsApp' : 'Enlace'}
                  value={url}
                  onChange={handleInputChange}
                  placeholder={getInputPlaceholder()}
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: selectedSocial && (
                      <InputAdornment position="start">
                        {selectedSocial === 'whatsapp' ? (
                          <Typography sx={{ color: colors.secondaryText }}>
                            +52
                          </Typography>
                        ) : (
                          <Box sx={{ 
                            color: getSocialColor(selectedSocial),
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {getSocialIcon(selectedSocial)}
                          </Box>
                        )}
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    selectedSocial === 'whatsapp'
                      ? 'Ingresa los 10 dígitos, ej: 1234567890'
                      : 'Ingresa la URL completa incluyendo https://'
                  }
                  disabled={!selectedSocial}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {isEditing && (
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={handleCancelEdit}
                    sx={{
                      color: colors.text,
                      borderColor: colors.divider,
                      '&:hover': {
                        borderColor: colors.primary,
                        backgroundColor: colors.hover
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                  onClick={handleSave}
                  disabled={!selectedSocial || !url || isSaving}
                  sx={{
                    backgroundColor: colors.primary,
                    color: colors.buttonText,
                    '&:hover': {
                      backgroundColor: isDarkTheme ? '#5BABFF' : '#1565c0'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: isDarkTheme ? '#2C3E50' : '#e0e0e0'
                    }
                  }}
                >
                  {isSaving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isEditing ? (
                    'Actualizar'
                  ) : (
                    'Agregar'
                  )}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de redes sociales */}
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            color: colors.text,
            fontWeight: 600,
            mb: 2
          }}
        >
          Redes sociales registradas
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : Object.keys(socialData).length === 0 ? (
          <Card 
            variant="outlined" 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              backgroundColor: colors.cardBackground, 
              borderColor: colors.divider,
              borderRadius: '8px'
            }}
          >
            <Typography sx={{ color: colors.secondaryText, mb: 2 }}>
              No hay redes sociales registradas
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setSelectedSocial(availableSocials[0].name)}
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  backgroundColor: colors.hover
                }
              }}
            >
              Agregar primera red social
            </Button>
          </Card>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              backgroundColor: colors.tableBackground,
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.tableHeaderBg }}>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                    Red Social
                  </TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                    Enlace / Número
                  </TableCell>
                  <TableCell align="right" sx={{ color: colors.text, fontWeight: 600 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(socialData).map((social) => (
                  <Fade in={true} key={social}>
                    <TableRow 
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.hover
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Zoom in={true}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getSocialColor(social), 
                                width: 32, 
                                height: 32, 
                                mr: 2 
                              }}
                            >
                              {getSocialIcon(social)}
                            </Avatar>
                          </Zoom>
                          <Typography sx={{ color: colors.text }}>
                            {getSocialLabel(social)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: colors.text }}>
                        <Chip 
                          label={socialData[social]?.url} 
                          sx={{
                            backgroundColor: isDarkTheme ? 'rgba(75,159,255,0.1)' : 'rgba(25,118,210,0.08)',
                            color: colors.text,
                            '& .MuiChip-label': {
                              whiteSpace: 'normal'
                            }
                          }}
                          onClick={() => {
                            // Abrir el enlace si es una URL, no si es WhatsApp
                            if (social !== 'whatsapp') {
                              window.open(socialData[social]?.url, '_blank');
                            }
                          }}
                          clickable={social !== 'whatsapp'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar" arrow>
                          <IconButton 
                            onClick={() => handleEdit(social)}
                            sx={{ 
                              color: colors.primary,
                              '&:hover': {
                                backgroundColor: colors.hover,
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar" arrow>
                          <IconButton 
                            onClick={() => handleOpenDeleteConfirm(social)}
                            sx={{ 
                              color: colors.error,
                              '&:hover': {
                                backgroundColor: isDarkTheme ? 'rgba(255,107,107,0.1)' : 'rgba(244,67,54,0.1)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.paper,
            color: colors.text,
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ color: colors.text }}>
          {"Confirmar eliminación"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: colors.secondaryText }}>
            ¿Estás seguro de que deseas eliminar la red social {socialToDelete ? getSocialLabel(socialToDelete) : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ color: colors.text }}
            startIcon={<CloseIcon />}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            sx={{ 
              color: 'white',
              backgroundColor: colors.error,
              '&:hover': {
                backgroundColor: isDarkTheme ? '#ff8c8c' : '#d32f2f'
              }
            }}
            variant="contained"
            startIcon={<DeleteIcon />}
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={handleCloseNotification}
      />
    </Card>
  );
};

export default RedesSociales;