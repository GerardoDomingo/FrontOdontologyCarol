import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  CircularProgress,
  InputAdornment,
  Divider,
  Chip,
  Fade,
  Grow,
  useMediaQuery,
  Paper,
  Grid
} from '@mui/material';
import { 
  Lock, 
  ArrowBack, 
  Visibility, 
  VisibilityOff,
  CheckCircle,
  Cancel,
  InfoOutlined
} from '@mui/icons-material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import zxcvbn from 'zxcvbn';
import CryptoJS from 'crypto-js';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

/**
 * Componente para cambiar contraseña después de la recuperación
 * Incluye validación robusta de contraseñas y verificación de seguridad
 */
const CambiarContraseña = () => {
  // Estados para controlar el formulario
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordSafetyChecking, setPasswordSafetyChecking] = useState(false);
  const [isPasswordFiltered, setIsPasswordFiltered] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
    noRepeating: true
  });
  
  // Estados para controlar la UI
  const [searchParams] = useSearchParams();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Hooks y contexto
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Token de verificación
  const token = searchParams.get('token');

  // Efecto para verificar que existe un token válido
  useEffect(() => {
    if (!token) {
      setNotification({
        open: true,
        message: 'No se ha proporcionado un token válido para cambiar la contraseña',
        type: 'error'
      });
      
      // Redireccionar al usuario después de 3 segundos
      setTimeout(() => {
        navigate('/recuperacion');
      }, 3000);
    }
  }, [token, navigate]);

  // Función que evalúa las reglas de contraseña
  const evaluatePasswordRules = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noRepeating: !/(.)\1{2}/.test(password)
    };
  };

  // Manejador de cambio en los campos de contraseña
  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === 'newPassword') {
      setNewPassword(value);
      
      // Evaluar la fortaleza de la contraseña
      const strength = zxcvbn(value).score;
      setPasswordStrength(strength);
      
      // Verificar reglas de contraseña
      setPasswordRules(evaluatePasswordRules(value));
      
      // Iniciar verificación de contraseña filtrada después de 500ms
      // para evitar muchas solicitudes mientras el usuario escribe
      if (value.length >= 8) {
        const debounceTimer = setTimeout(() => {
          checkPasswordSafety(value);
        }, 500);
        
        return () => clearTimeout(debounceTimer);
      } else {
        setIsPasswordFiltered(false);
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  // Alternar visibilidad de contraseñas
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Verificar si la contraseña ha sido comprometida
  const checkPasswordSafety = async (password) => {
    if (password.length < 8) return;
    
    setPasswordSafetyChecking(true);
    try {
      const hashedPassword = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
      const prefix = hashedPassword.slice(0, 5);
      const suffix = hashedPassword.slice(5);

      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const hashes = response.data.split('\n').map(line => line.split(':')[0]);

      setIsPasswordFiltered(hashes.includes(suffix.toUpperCase()));
    } catch (error) {
      console.error('Error al verificar la contraseña:', error);
    } finally {
      setPasswordSafetyChecking(false);
    }
  };

  // Cerrar notificaciones
  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Verificar que existe un token válido
    if (!token) {
      setErrorMessage('El token es inválido o ha expirado.');
      return;
    }

    // Verificar que las contraseñas coinciden
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    // Verificar que se cumplen todas las reglas de contraseña
    const allRulesMet = Object.values(passwordRules).every(rule => rule);
    if (!allRulesMet) {
      setErrorMessage('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }

    // Verificar que la contraseña es lo suficientemente fuerte
    if (passwordStrength < 3) {
      setErrorMessage('La contraseña debe ser fuerte o muy fuerte para ser válida.');
      return;
    }

    // Verificar que la contraseña no ha sido comprometida
    if (isPasswordFiltered) {
      setErrorMessage('Esta contraseña ha sido comprometida en filtraciones de datos. Por favor, elige otra.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        'https://back-end-4803.onrender.com/api/resetPassword', 
        { token, newPassword },
        { timeout: 8000 }
      );

      if (response.status === 200) {
        setIsSuccess(true);
        setNotification({
          open: true,
          message: '¡Contraseña actualizada correctamente!',
          type: 'success'
        });

        // Redireccionar después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.message || 'Error al actualizar la contraseña.');
      } else if (error.code === 'ECONNABORTED') {
        setErrorMessage('La solicitud ha expirado. Por favor, inténtalo de nuevo.');
      } else {
        setErrorMessage('Error al cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.');
      }
      
      setNotification({
        open: true,
        message: 'Error al cambiar la contraseña',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener color para la barra de fortaleza
  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0: return '#f44336'; // error.main
      case 1: return '#ffcdd2'; // error.light
      case 2: return '#ffc107'; // warning.main
      case 3: return '#a5d6a7'; // success.light
      case 4: return '#4caf50'; // success.main
      default: return '#e0e0e0'; // grey[300]
    }
  };

  // Obtener texto para la fortaleza
  const getStrengthText = (strength) => {
    const texts = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
    return texts[strength] || '';
  };

  // Verificar si las contraseñas coinciden
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';
  
  // Verificar si el formulario es válido para enviar
  const isFormValid = 
    passwordsMatch && 
    Object.values(passwordRules).every(rule => rule) && 
    passwordStrength >= 3 && 
    !isPasswordFiltered;

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '16px', md: '24px' },
        position: 'relative'
      }}
    >
      {/* Botón para volver atrás */}
      <IconButton
        sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          color: '#00bcd4',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#e1f5fe',
            transform: 'scale(1.05)'
          }
        }}
        component={Link}
        to="/recuperacion"
        aria-label="Volver a recuperación"
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ArrowBack />
          <Typography
            variant="body2"
            sx={{ 
              color: '#707070', 
              ml: 1,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Atrás
          </Typography>
        </Box>
      </IconButton>

      {/* Contenedor principal */}
      <Card 
        sx={{ 
          maxWidth: 500, 
          width: '100%', 
          borderRadius: '16px', 
          boxShadow: 3,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 8
          },
          mb: 4
        }}
      >
        <CardContent sx={{ padding: { xs: 3, md: 4 } }}>
          {/* Mensaje de éxito después de cambiar contraseña */}
          {isSuccess ? (
            <Grow in={isSuccess}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle 
                  sx={{ 
                    fontSize: 70, 
                    color: '#4caf50',
                    mb: 2
                  }} 
                />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  ¡Contraseña Actualizada!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Tu contraseña ha sido cambiada exitosamente.
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Serás redirigido al inicio de sesión...
                </Typography>
                <CircularProgress 
                  size={24} 
                  sx={{ mt: 2, color: '#00bcd4' }} 
                />
              </Box>
            </Grow>
          ) : (
            <Fade in={!isSuccess}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                  Cambiar Contraseña
                </Typography>
                <Typography variant="body2" sx={{ mb: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                  Crea una nueva contraseña segura para tu cuenta
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Campo para nueva contraseña */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nueva Contraseña"
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={newPassword}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={toggleShowNewPassword}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* Campo para confirmar contraseña */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirmar Contraseña"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        required
                        error={confirmPassword !== '' && !passwordsMatch}
                        helperText={confirmPassword !== '' && !passwordsMatch ? 'Las contraseñas no coinciden' : ''}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={toggleShowConfirmPassword}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* Indicador de fortaleza */}
                    <Grid item xs={12}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          borderRadius: '8px',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Fortaleza de la contraseña: 
                          <Chip 
                            label={getStrengthText(passwordStrength)}
                            size="small"
                            sx={{ 
                              ml: 1,
                              backgroundColor: getStrengthColor(passwordStrength),
                              color: '#fff',
                              fontWeight: 500
                            }}
                          />
                        </Typography>

                        {/* Barra de progreso de fortaleza */}
                        <Box
                          sx={{
                            height: '6px',
                            width: '100%',
                            backgroundColor: '#eeeeee',
                            borderRadius: '3px',
                            mt: 1,
                            mb: 2,
                            position: 'relative',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${(passwordStrength + 1) * 20}%`,
                              backgroundColor: getStrengthColor(passwordStrength),
                              borderRadius: '3px',
                              transition: 'width 0.4s ease-in-out, background-color 0.4s ease-in-out',
                            }}
                          />
                        </Box>

                        {/* Requisitos de contraseña */}
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                          Requisitos:
                        </Typography>
                        
                        <Grid container spacing={1}>
                          {[
                            { rule: 'length', label: 'Mín. 8 caracteres' },
                            { rule: 'uppercase', label: 'Al menos 1 mayúscula' },
                            { rule: 'number', label: 'Al menos 1 número' },
                            { rule: 'special', label: 'Al menos 1 símbolo' },
                            { rule: 'noRepeating', label: 'Sin caracteres repetidos' }
                          ].map((req) => (
                            <Grid item xs={12} sm={6} key={req.rule}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: passwordRules[req.rule] 
                                    ? '#4caf50' 
                                    : '#757575'
                                }}
                              >
                                {passwordRules[req.rule] 
                                  ? <CheckCircle fontSize="small" sx={{ mr: 1 }} /> 
                                  : <Cancel fontSize="small" sx={{ mr: 1 }} />
                                }
                                <Typography variant="caption">
                                  {req.label}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Mensaje de seguridad de la contraseña */}
                        {newPassword.length >= 8 && (
                          <Box 
                            sx={{ 
                              mt: 2, 
                              display: 'flex', 
                              alignItems: 'center',
                              bgcolor: isPasswordFiltered 
                                ? '#ffcdd2' 
                                : '#e8f5e9',
                              py: 1,
                              px: 2,
                              borderRadius: '4px',
                              opacity: passwordSafetyChecking ? 0.7 : 1,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {passwordSafetyChecking ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                <Typography variant="caption">
                                  Verificando seguridad...
                                </Typography>
                              </Box>
                            ) : isPasswordFiltered ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <InfoOutlined fontSize="small" sx={{ mr: 1, color: '#c62828' }} />
                                <Typography variant="caption" sx={{ color: '#c62828' }}>
                                  Esta contraseña ha sido filtrada en brechas de seguridad. Elige otra.
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircle fontSize="small" sx={{ mr: 1, color: '#2e7d32' }} />
                                <Typography variant="caption" sx={{ color: '#2e7d32' }}>
                                  Contraseña segura
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Paper>
                    </Grid>

                    {/* Mensaje de error */}
                    {errorMessage && (
                      <Grid item xs={12}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#f44336', 
                            textAlign: 'center',
                            p: 1,
                            bgcolor: '#ffebee',
                            borderRadius: '4px'
                          }}
                        >
                          {errorMessage}
                        </Typography>
                      </Grid>
                    )}

                    {/* Botón de envío */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disableElevation
                        disabled={isLoading || !isFormValid}
                        sx={{
                          py: 1.5,
                          mt: 1,
                          backgroundColor: '#00bcd4',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            backgroundColor: '#00a3ba',
                            transform: 'translateY(-2px)'
                          },
                          '&:disabled': {
                            backgroundColor: '#e0e0e0',
                          }
                        }}
                      >
                        {isLoading ? 
                          <CircularProgress size={24} sx={{ color: 'white' }} /> : 
                          'Cambiar Contraseña'
                        }
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        handleClose={handleCloseNotification}
      />
    </Box>
  );
};

export default CambiarContraseña;