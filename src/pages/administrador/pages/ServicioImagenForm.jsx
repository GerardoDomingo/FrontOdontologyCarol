import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  TextField,
  Paper,
  IconButton,
  Avatar
} from '@mui/material';
import { 
  Save, 
  Image, 
  Delete, 
  CloudUpload,
  ArrowBack
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/AuthContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useNavigate, useParams } from 'react-router-dom';

const ServicioImagenForm = () => {
  const navigate = useNavigate();
  const { servicioId } = useParams();
  const { isDarkTheme } = useThemeContext();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [servicio, setServicio] = useState(null);
  const [loadingServicio, setLoadingServicio] = useState(true);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [dragging, setDragging] = useState(false);
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: ''
  });

  // Cargar datos del servicio
  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/${servicioId}`);
        if (!response.ok) throw new Error('Error al cargar el servicio');
        
        const data = await response.json();
        setServicio(data);
        
        // Si hay una imagen, establecer la vista previa
        if (data.image_url) {
          setImagePreview(data.image_url);
        }
      } catch (error) {
        console.error('Error:', error);
        setNotification({
          open: true,
          message: 'Error al cargar los datos del servicio',
          type: 'error'
        });
      } finally {
        setLoadingServicio(false);
      }
    };
    
    if (servicioId) {
      fetchServicio();
    } else {
      setLoadingServicio(false);
    }
  }, [servicioId]);

  // Manejar clic en el área de arrastrar y soltar
  const handleAreaClick = () => {
    fileInputRef.current.click();
  };

  // Manejar selección de archivo desde el explorador
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // Manejar evento de arrastrar sobre
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  // Manejar evento de arrastrar fuera
  const handleDragLeave = () => {
    setDragging(false);
  };

  // Manejar evento de soltar archivo
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  // Procesar archivo seleccionado
  const handleFile = (file) => {
    // Verificar si es una imagen
    if (!file.type.match('image.*')) {
      setNotification({
        open: true,
        message: 'Solo se permiten archivos de imagen (jpg, png, jpeg, etc.)',
        type: 'error'
      });
      return;
    }
    
    // Verificar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        open: true,
        message: 'El archivo es demasiado grande. El tamaño máximo es 5MB.',
        type: 'error'
      });
      return;
    }
    
    // Crear URL para vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Guardar archivo para subir
    setImageFile(file);
    setDeleteImage(false);
  };

  // Eliminar imagen
  const handleDeleteImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setDeleteImage(true);
  };

  // Envío del formulario
  const handleSubmit = async () => {
    setLoading(true);
    setNotification({ open: false, message: '', type: '' });

    try {
      // Crear FormData para la imagen
      const formData = new FormData();
      formData.append('servicio_id', servicioId);
      
      if (deleteImage) {
        formData.append('delete_image', 'true');
      } else if (imageFile) {
        formData.append('image', imageFile);
      } else if (!imagePreview && !imageFile) {
        // No se ha seleccionado ninguna imagen y no se quiere eliminar la actual
        setNotification({
          open: true,
          message: 'No se ha realizado ningún cambio en la imagen',
          type: 'info'
        });
        setLoading(false);
        return;
      }

      // Enviar al servidor
      const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/update-image/${servicioId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al actualizar la imagen');

      setNotification({
        open: true,
        message: deleteImage 
          ? 'Imagen eliminada con éxito' 
          : imageFile 
            ? 'Imagen actualizada con éxito' 
            : 'No se realizaron cambios',
        type: 'success'
      });

      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate('/admin/servicios');
      }, 2000);

    } catch (error) {
      console.error('Error al actualizar la imagen:', error);
      setNotification({
        open: true,
        message: 'Ocurrió un error al actualizar la imagen. Por favor intente nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Definición de colores según el tema
  const colors = {
    background: isDarkTheme ? '#0D1B2A' : '#f5f5f5',
    paper: isDarkTheme ? '#1A2735' : '#ffffff',
    primary: isDarkTheme ? '#00BCD4' : '#03427C',
    text: isDarkTheme ? '#ffffff' : '#1a1a1a',
    divider: isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
  };

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Card sx={{
        mb: 4,
        backgroundColor: colors.paper,
        color: colors.text,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        <CardHeader
          title={
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Image />
              Gestión de Imagen del Servicio
            </Typography>
          }
          sx={{
            backgroundColor: colors.primary,
            color: 'white',
            borderBottom: `1px solid ${colors.divider}`
          }}
        />

        <CardContent sx={{ p: 3 }}>
          {loadingServicio ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Información del servicio */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Detalles del Servicio
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              {servicio && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nombre del Servicio"
                      value={servicio.title || ''}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Categoría"
                      value={servicio.category || ''}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Duración"
                      value={servicio.duration || ''}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Precio"
                      value={`$${parseFloat(servicio.price || 0).toFixed(2)}`}
                      fullWidth
                      disabled
                    />
                  </Grid>
                </>
              )}

              {/* Sección de carga de imagen */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                  Imagen del Servicio
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {/* Área de visualización de imagen actual */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {imagePreview ? 'Imagen Actual / Vista Previa' : 'No hay imagen'}
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        height: 250, 
                        border: `1px solid ${colors.divider}`,
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                      }}
                    >
                      {imagePreview ? (
                        <>
                          <img 
                            src={imagePreview} 
                            alt="Vista previa" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '100%', 
                              objectFit: 'contain' 
                            }} 
                          />
                          <IconButton 
                            color="error" 
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.7)'
                              }
                            }}
                            onClick={handleDeleteImage}
                          >
                            <Delete />
                          </IconButton>
                        </>
                      ) : (
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Image sx={{ fontSize: 48, opacity: 0.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No hay imagen
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  
                  {/* Área para subir nueva imagen */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Subir Nueva Imagen
                    </Typography>
                    
                    <Paper
                      sx={{
                        height: 250,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: `2px dashed ${dragging ? colors.primary : colors.divider}`,
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        backgroundColor: dragging 
                          ? isDarkTheme ? 'rgba(0, 188, 212, 0.1)' : 'rgba(3, 66, 124, 0.05)'
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: isDarkTheme ? 'rgba(0, 188, 212, 0.05)' : 'rgba(3, 66, 124, 0.02)',
                          border: `2px dashed ${colors.primary}`
                        }
                      }}
                      onClick={handleAreaClick}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                      
                      <CloudUpload sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Arrastra una imagen aquí o haz clic para seleccionar
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Formatos: JPG, PNG, JPEG, GIF (Máx. 5MB)
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </CardContent>

        <CardActions sx={{ p: 3, borderTop: `1px solid ${colors.divider}`, justifyContent: 'space-between' }}>
          <Button
            onClick={() => navigate('/admin/servicios')}
            color="inherit"
            variant="outlined"
            startIcon={<ArrowBack />}
            disabled={loading}
            sx={{ borderRadius: '4px' }}
          >
            Volver
          </Button>
          
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || loadingServicio}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            sx={{
              borderRadius: '4px',
              boxShadow: 3,
              '&:hover': { boxShadow: 5 }
            }}
          >
            {loading ? 'Guardando...' : (deleteImage ? 'Eliminar Imagen' : 'Guardar Imagen')}
          </Button>
        </CardActions>
      </Card>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={() => setNotification({ open: false, message: '', type: '' })}
      />
    </Box>
  );
};

export default ServicioImagenForm;