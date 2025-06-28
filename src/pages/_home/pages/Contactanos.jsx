import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  Grid,
  CircularProgress,
  useTheme,
  Paper,
  Card,
  CardContent,
  Avatar,
  useMediaQuery
} from '@mui/material';
import { 
  Phone, 
  Email, 
  LocationOn, 
  WhatsApp, 
  Send
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Notificaciones from '../../../components/Layout/Notificaciones';
import CustomRecaptcha from '../../../components/Tools/Captcha';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const ContactoIlustracion = '/assets/svg/contact.svg';

/**
 * Componente de página de contacto con diseño profesional y limpio
 * Enfocado en facilitar la comunicación con los pacientes
 */
const Contacto = () => {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [empresa, setEmpresa] = useState({
    nombre_pagina: 'Consultorio Dental',
    slogan: 'Tu sonrisa es nuestra prioridad',
    telefono_principal: '',
    correo_electronico: '',
    direccion: ''
  });
  
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info',
  });
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempt, setSubmitAttempt] = useState(false);

  // Expresiones regulares para validación
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\d{10,15}$/;

  // Colores según el tema - manteniendo paleta azul consistente
  const colors = {
    primary: isDarkTheme ? '#3B82F6' : '#2563EB',
    primaryLight: isDarkTheme ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.05)',
    primaryDark: isDarkTheme ? '#2563EB' : '#1D4ED8',
    background: isDarkTheme ? '#0F172A' : '#F8FAFC',
    cardBg: isDarkTheme ? '#1E293B' : '#FFFFFF',
    text: isDarkTheme ? '#F1F5F9' : '#334155',
    textSecondary: isDarkTheme ? '#94A3B8' : '#64748B',
    divider: isDarkTheme ? 'rgba(148,163,184,0.1)' : 'rgba(226,232,240,0.8)',
    success: isDarkTheme ? '#10B981' : '#059669',
    error: isDarkTheme ? '#EF4444' : '#DC2626',
    whatsapp: '#25D366',
    whatsappHover: '#128C7E',
    shadow: isDarkTheme 
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
      : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
  };

  // Obtener datos de la empresa
  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/perfilEmpresa/empresa');
        if (!response.ok) {
          throw new Error('Error al obtener los datos de la empresa');
        }
        const data = await response.json();
        setEmpresa({
          nombre_pagina: data.nombre_pagina || 'Consultorio Dental',
          slogan: data.slogan || 'Tu sonrisa es nuestra prioridad',
          telefono_principal: data.telefono_principal || '',
          correo_electronico: data.correo_electronico || '',
          calle_numero: data.calle_numero || '',
          localidad: data.localidad || '',
          municipio: data.municipio || '',
          estado: data.estado || '',
          direccion: `${data.calle_numero || ''}, ${data.localidad || ''}, ${data.municipio || ''}, ${data.estado || ''}`
        });
      } catch (error) {
        console.error('Error al cargar datos de empresa:', error);
        setError(error.message);
      } finally {
        setLoadingEmpresa(false);
      }
    };
    
    fetchEmpresaData();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marcar campo como tocado
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validar en tiempo real si ya se ha intentado enviar
    if (submitAttempt) {
      validateField(name, value);
    }
  };

  // Marcar campo como tocado cuando pierde el foco
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    validateField(name, value);
  };

  // Validar un campo específico
  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          errorMessage = 'Por favor, ingresa tu nombre';
        } else if (value.trim().length < 3) {
          errorMessage = 'El nombre debe tener al menos 3 caracteres';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errorMessage = 'Por favor, ingresa tu correo electrónico';
        } else if (!emailRegex.test(value)) {
          errorMessage = 'Introduce un correo electrónico válido';
        }
        break;
        
      case 'telefono':
        if (!value.trim()) {
          errorMessage = 'Por favor, ingresa tu número de teléfono';
        } else if (!phoneRegex.test(value)) {
          errorMessage = 'El teléfono debe tener entre 10 y 15 dígitos';
        }
        break;
        
      case 'mensaje':
        if (!value.trim()) {
          errorMessage = 'Por favor, escribe tu mensaje';
        } else if (value.trim().length < 10) {
          errorMessage = 'Tu mensaje debe tener al menos 10 caracteres';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    return !errorMessage;
  };

  // Validar todo el formulario
  const validateForm = () => {
    const fieldNames = ['nombre', 'email', 'telefono', 'mensaje'];
    let isValid = true;
    
    // Marcar todos los campos como tocados
    const newTouched = {};
    fieldNames.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    // Validar cada campo
    fieldNames.forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) isValid = false;
    });
    
    // Validar captcha
    if (!captchaVerified) {
      setErrors(prev => ({
        ...prev,
        captcha: 'Por favor, completa la verificación de seguridad'
      }));
      isValid = false;
    } else {
      setErrors(prev => ({
        ...prev,
        captcha: ''
      }));
    }
    
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempt(true);
    
    // Validar formulario completo
    const isValid = validateForm();
    if (!isValid) {
      setNotification({
        open: true,
        message: 'Por favor, corrige los errores en el formulario',
        type: 'error'
      });
      return;
    }
    
    setLoadingSubmit(true);
    
    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/contacto/msj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setNotification({
          open: true,
          message: 'Mensaje enviado con éxito. Pronto nos pondremos en contacto contigo.',
          type: 'success'
        });
        
        // Resetear formulario
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          mensaje: ''
        });
        setTouched({});
        setSubmitAttempt(false);
        setCaptchaVerified(false);
      } else {
        setNotification({
          open: true,
          message: 'Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo.',
          type: 'warning'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error de conexión. Comprueba tu conexión a internet e intenta de nuevo.',
        type: 'error'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Definir estilos para campos de texto
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.5)' : '#FFFFFF',
      borderRadius: '10px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: isDarkTheme ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 0.8)',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: colors.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary,
        borderWidth: '2px',
      },
      '& input, & textarea': {
        color: colors.text,
      },
    },
    '& .MuiInputLabel-root': {
      color: colors.textSecondary,
      '&.Mui-focused': {
        color: colors.primary,
      },
    },
    '& .MuiFormHelperText-root': {
      margin: '4px 0 0 0',
      fontWeight: 500,
    },
    mb: 2.5,
  };

  // Definir campos del formulario
  const formFields = [
    { 
      name: 'nombre', 
      label: 'Nombre completo', 
      icon: <Phone sx={{ color: 'transparent' }} />,
      autoComplete: 'name'
    },
    { 
      name: 'email', 
      label: 'Correo electrónico', 
      type: 'email', 
      icon: <Phone sx={{ color: 'transparent' }} />,
      autoComplete: 'email'
    },
    { 
      name: 'telefono', 
      label: 'Número de teléfono', 
      icon: <Phone sx={{ color: 'transparent' }} />,
      autoComplete: 'tel'
    }
  ];

  // Definir información de contacto
  const contactInfo = [
    {
      icon: <Phone />,
      title: 'Teléfono',
      value: empresa.telefono_principal || 'Cargando...',
      loading: loadingEmpresa,
      action: empresa.telefono_principal ? {
        label: 'Llamar ahora',
        href: `tel:${empresa.telefono_principal}`,
        color: colors.primary
      } : null
    },
    {
      icon: <Email />,
      title: 'Correo',
      value: empresa.correo_electronico || 'Cargando...',
      loading: loadingEmpresa,
      action: empresa.correo_electronico ? {
        label: 'Enviar email',
        href: `mailto:${empresa.correo_electronico}`,
        color: colors.primary
      } : null
    },
    {
      icon: <WhatsApp />,
      title: 'WhatsApp',
      value: empresa.telefono_principal || 'Cargando...',
      loading: loadingEmpresa,
      action: empresa.telefono_principal ? {
        label: 'Contactar por WhatsApp',
        href: `https://wa.me/${empresa.telefono_principal ? empresa.telefono_principal.replace(/\D/g, '') : ''}`,
        color: colors.whatsapp
      } : null
    },
    {
      icon: <LocationOn />,
      title: 'Dirección',
      value: empresa.direccion || 'Cargando...',
      loading: loadingEmpresa,
      action: null
    }
  ];

  // Animaciones para elementos
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.background,
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Columna izquierda - Información y SVG */}
          <Grid item xs={12} md={5} lg={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  color: colors.text,
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.8rem', md: '2.25rem' }
                }}
              >
                Contacta con nosotros
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: colors.textSecondary,
                  mb: 4,
                  lineHeight: 1.7,
                  maxWidth: '95%'
                }}
              >
                Estamos aquí para atender tus dudas y ayudarte a programar una cita. 
                Puedes contactarnos mediante cualquiera de los siguientes medios.
              </Typography>

              {/* Tarjetas de información de contacto */}
              {contactInfo.map((item, index) => (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    mb: 2,
                    backgroundColor: colors.cardBg,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `1px solid ${colors.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: colors.shadow,
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: colors.primaryLight,
                          color: colors.primary,
                          mr: 2
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: colors.text
                          }}
                        >
                          {item.title}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                      
                      {item.action && (
                        <Button
                          size="small"
                          variant="outlined"
                          href={item.action.href}
                          target={item.action.href?.startsWith('http') ? '_blank' : undefined}
                          sx={{
                            borderColor: item.action.color,
                            color: item.action.color,
                            '&:hover': {
                              borderColor: item.action.color,
                              backgroundColor: `${item.action.color}10`
                            }
                          }}
                        >
                          {item.action.label}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Ilustración */}
              {!isMobile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ marginTop: '40px' }}
                >
                  <Box
                    component="img"
                    src={ContactoIlustracion}
                    alt="Contacto"
                    sx={{
                      width: '100%',
                      maxWidth: '400px',
                      maxHeight: '350px',
                      display: 'block',
                      objectFit: 'contain'
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          </Grid>

          {/* Columna derecha - Formulario */}
          <Grid item xs={12} md={7} lg={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: colors.cardBg,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: `1px solid ${colors.divider}`,
                  height: '100%'
                }}
              >
                {/* Barra superior decorativa */}
                <Box
                  sx={{
                    height: '5px',
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryDark})`
                  }}
                />

                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: colors.text
                    }}
                  >
                    Envíanos un mensaje
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
                      mb: 4
                    }}
                  >
                    Complete el formulario a continuación y nos pondremos en contacto con usted lo antes posible.
                  </Typography>
                  
                  {/* Formulario de contacto */}
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    {formFields.map((field) => (
                      <TextField
                        key={field.name}
                        fullWidth
                        required
                        name={field.name}
                        label={field.label}
                        type={field.type || 'text'}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={touched[field.name] && !!errors[field.name]}
                        helperText={touched[field.name] && errors[field.name]}
                        variant="outlined"
                        autoComplete={field.autoComplete}
                        sx={textFieldStyles}
                      />
                    ))}
                    
                    <TextField
                      fullWidth
                      required
                      name="mensaje"
                      label="Mensaje"
                      multiline
                      rows={4}
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.mensaje && !!errors.mensaje}
                      helperText={touched.mensaje && errors.mensaje}
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                    
                    {/* ReCAPTCHA */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        my: 3
                      }}
                    >
                      <CustomRecaptcha 
                        onCaptchaChange={setCaptchaVerified} 
                        isDarkTheme={isDarkTheme} 
                      />
                    </Box>
                    
                    {errors.captcha && (
                      <Typography 
                        variant="body2" 
                        color="error" 
                        sx={{ 
                          textAlign: 'center',
                          mb: 2,
                          fontWeight: 500
                        }}
                      >
                        {errors.captcha}
                      </Typography>
                    )}
                    
                    {/* Botón de envío */}
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loadingSubmit}
                      startIcon={loadingSubmit ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: '10px',
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: colors.primaryDark,
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {loadingSubmit ? 'Enviando mensaje...' : 'Enviar mensaje'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default Contacto;