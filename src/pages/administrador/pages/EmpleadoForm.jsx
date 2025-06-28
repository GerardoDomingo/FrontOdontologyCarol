import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Grid, TextField, Button, Typography,
  FormControl, InputLabel, Select, MenuItem,
  IconButton, CircularProgress, Stepper, Step,
  StepLabel, Paper, Avatar, Divider, InputAdornment,
  Alert, Fade, LinearProgress, Tooltip, Chip,
  Slide, StepButton, StepContent, useTheme, alpha
} from '@mui/material';
import {
  FaTimes, FaUser, FaEnvelope, FaLock,
  FaBriefcase, FaIdBadge, FaUserMd,
  FaPhone, FaIdCard, FaUserCheck, FaEye,
  FaEyeSlash, FaArrowRight, FaArrowLeft,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaShieldAlt, FaInfoCircle, FaSave, FaUserEdit,
  FaClipboardCheck
} from 'react-icons/fa';
import axios from 'axios';
import CryptoJS from 'crypto-js';

// Transición para el diálogo
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Formulario de asistente paso a paso para añadir/editar empleados
const EmpleadoFormWizard = ({
  open,
  onClose,
  editMode,
  initialData,
  positionOptions,
  onSave,
  isProcessing,
  colors
}) => {
  // Estados para el formulario mejorado
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialData || {
    nombre: '',
    aPaterno: '',
    aMaterno: '',
    email: '',
    telefono: '',
    password: '',
    passwordConfirm: '',
    puesto: '',
    estado: 'activo',
    imagen: ''
  });

  // Estados para validación
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [stepIsValid, setStepIsValid] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isPasswordSafe, setIsPasswordSafe] = useState(false);
  const [isPasswordFiltered, setIsPasswordFiltered] = useState(false);
  const [isLoadingPassword, setIsLoading] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});

  // Pasos del formulario
  const steps = [
    'Información Personal',
    'Datos de Contacto',
    'Información Laboral',
    'Contraseña',
    'Confirmación'
  ];

  // Expresiones regulares para validación
  const nameRegex = /^[A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
  const phoneRegex = /^\d{10}$/;

  // Estilos para los componentes del formulario
  const formStyles = {
    container: {
      backgroundColor: colors.paper,
      padding: 3,
      borderRadius: '12px',
      marginTop: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    stepContent: {
      minHeight: '300px'
    },
    title: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 2,
      display: 'flex',
      alignItems: 'center'
    },
    iconSpacing: {
      marginRight: 1
    },
    passwordStrength: {
      width: '100%',
      height: 6,
      marginTop: 1,
      backgroundColor: alpha('#e0e0e0', 0.3),
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden'
    },
    strengthIndicator: {
      height: '100%',
      transition: 'width 0.3s ease, background-color 0.3s ease',
      borderRadius: 3
    },
    fieldHelperText: {
      fontSize: '0.75rem',
      color: colors.secondaryText,
      marginTop: 0.5
    },
    errorChip: {
      margin: '4px',
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      color: '#f44336',
      borderColor: '#f44336'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 3
    },
    avatarContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 2
    },
    largeAvatar: {
      width: 100,
      height: 100,
      fontSize: '2.5rem',
      backgroundColor: colors.primary
    },
    stepper: {
      backgroundColor: 'transparent',
      '& .MuiStepConnector-root': {
        left: 'calc(-50% + 12px)',
        right: 'calc(50% + 12px)',
      },
      '& .MuiStepConnector-line': {
        borderTopWidth: 3,
        borderRadius: 1,
      },
      '& .MuiStepLabel-iconContainer': {
        paddingRight: 1,
      },
      '& .MuiStepLabel-alternativeLabel': {
        fontSize: '0.85rem'
      }
    },
    stepIcon: {
      color: colors.primary,
      width: 30,
      height: 30,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${colors.primary}`,
      backgroundColor: 'transparent'
    },
    completedStepIcon: {
      backgroundColor: colors.primary,
      color: 'white',
      width: 30,
      height: 30,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeStepIcon: {
      backgroundColor: alpha(colors.primary, 0.1),
      width: 30,
      height: 30,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${colors.primary}`,
    },
    input: {
      '& .MuiOutlinedInput-root': {
        color: colors.text,
        '& fieldset': {
          borderColor: colors.inputBorder,
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
      }
    }
  };

  // Validar el paso actual al cambiar de paso o al modificar datos
  useEffect(() => {
    validateStep(activeStep);
  }, [activeStep, formData]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Actualizar el estado del formulario
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Marcar el campo como tocado
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar el campo
    validateField(name, value);
  };

  // Función para validar campos individuales
  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (!nameRegex.test(value)) {
          error = 'El nombre solo puede contener letras y espacios';
        }
        break;

      case 'aPaterno':
        if (!value.trim()) {
          error = 'El apellido paterno es obligatorio';
        } else if (!nameRegex.test(value)) {
          error = 'El apellido solo puede contener letras y espacios';
        }
        break;

      case 'aMaterno':
        if (value && !nameRegex.test(value)) {
          error = 'El apellido solo puede contener letras y espacios';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'El email es obligatorio';
        } else if (!emailRegex.test(value)) {
          error = 'Email inválido. Debe usar gmail, hotmail, outlook, yahoo, live o uthh.edu';
        }
        break;

      case 'telefono':
        if (value && !phoneRegex.test(value)) {
          error = 'El teléfono debe contener 10 dígitos';
        }
        break;

      case 'puesto':
        if (!value) {
          error = 'Debe seleccionar un puesto';
        }
        break;

      case 'password':
        if (!editMode && !value) {
          error = 'La contraseña es obligatoria';
        } else if (value) {
          const pwdErrors = checkPasswordRules(value);
          setPasswordErrors(pwdErrors);
          if (pwdErrors.length > 0) {
            error = 'La contraseña no cumple con los requisitos';
          }

          // Si hay contraseña de confirmación, validar que coincidan
          if (formData.passwordConfirm && value !== formData.passwordConfirm) {
            setErrors(prev => ({
              ...prev,
              passwordConfirm: 'Las contraseñas no coinciden'
            }));
          } else if (formData.passwordConfirm) {
            setErrors(prev => ({
              ...prev,
              passwordConfirm: ''
            }));
          }
        }
        break;

      case 'passwordConfirm':
        if (!editMode && !value) {
          error = 'Debe confirmar la contraseña';
        } else if (value !== formData.password) {
          error = 'Las contraseñas no coinciden';
        }
        break;
    }

    // Actualizar el estado de errores
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return !error;
  };

  // Función para verificar reglas personalizadas de contraseña
  const checkPasswordRules = (password) => {
    const errors = [];
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;
    const noRepeatingChars = !/(.)\1{2}/.test(password);

    if (!hasUpperCase) errors.push('Debe tener al menos una letra mayúscula');
    if (!hasLowerCase) errors.push('Debe tener al menos una letra minúscula');
    if (!hasNumber) errors.push('Debe tener al menos un número');
    if (!hasSpecialChar) errors.push('Debe tener al menos un símbolo especial');
    if (!hasMinLength) errors.push('Debe tener al menos 8 caracteres');
    if (!noRepeatingChars) errors.push('No puede tener caracteres repetidos más de 2 veces');

    // Calcular la fortaleza de la contraseña (0-100)
    let strength = 0;
    if (hasUpperCase) strength += 20;
    if (hasLowerCase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;
    if (hasMinLength) strength += 20;

    setPasswordStrength(strength);

    return errors;
  };

  // Función para verificar tanto la seguridad como las reglas de la contraseña
  const checkPasswordValidity = async (password) => {
    const customErrors = checkPasswordRules(password);

    if (customErrors.length > 0) {
      setIsPasswordSafe(false);
      return false;
    }

    setIsLoading(true);
    try {
      const hashedPassword = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
      const prefix = hashedPassword.slice(0, 5);
      const suffix = hashedPassword.slice(5);

      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const hashes = response.data.split('\n').map(line => line.split(':')[0]);

      if (hashes.includes(suffix.toUpperCase())) {
        setErrors(prev => ({
          ...prev,
          password: 'Contraseña insegura: ha sido filtrada en brechas de datos.'
        }));
        setIsPasswordSafe(false);
        setIsPasswordFiltered(true);
        return false;
      } else {
        setErrors(prev => ({
          ...prev,
          password: ''
        }));
        setIsPasswordSafe(true);
        setIsPasswordFiltered(false);
        return true;
      }
    } catch (error) {
      console.error('Error al verificar la contraseña:', error);
      setErrors(prev => ({
        ...prev,
        password: 'Error al verificar la contraseña.'
      }));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Validar el paso actual
  const validateStep = (step) => {
    let isValid = false;

    switch (step) {
      case 0: // Información Personal
        isValid = validateField('nombre', formData.nombre) &&
          validateField('aPaterno', formData.aPaterno) &&
          validateField('aMaterno', formData.aMaterno || '');
        break;

      case 1: // Datos de Contacto
        isValid = validateField('email', formData.email) &&
          validateField('telefono', formData.telefono || '');
        break;

      case 2: // Información Laboral
        isValid = validateField('puesto', formData.puesto);
        break;

      case 3: // Contraseña
        if (editMode && !formData.password) {
          // En modo edición, la contraseña es opcional
          isValid = true;
        } else {
          isValid = validateField('password', formData.password) &&
            validateField('passwordConfirm', formData.passwordConfirm);
        }
        break;

      case 4: // Confirmación
        // Todos los campos deben ser válidos
        const allFieldsValid = [
          'nombre', 'aPaterno', 'email', 'puesto'
        ].every(field => !errors[field]);

        if (editMode && !formData.password) {
          // En modo edición, si no hay contraseña nueva, solo validar otros campos
          isValid = allFieldsValid;
        } else {
          // Validar también contraseña
          isValid = allFieldsValid &&
            !errors.password &&
            !errors.passwordConfirm;
        }
        break;
    }

    // Actualizar el estado de completed steps
    if (isValid) {
      setCompletedSteps(prev => ({
        ...prev,
        [step]: true
      }));
    } else {
      const newCompleted = { ...completedSteps };
      delete newCompleted[step];
      setCompletedSteps(newCompleted);
    }

    setStepIsValid(isValid);
    return isValid;
  };

  // Manejar el avance al siguiente paso
  const handleNext = async () => {
    // Si estamos en el paso de contraseña y hay una contraseña nueva
    if (activeStep === 3 && formData.password && !isPasswordSafe) {
      // Verificar la contraseña contra el servicio de filtrados
      const isPasswordValid = await checkPasswordValidity(formData.password);
      if (!isPasswordValid) {
        return; // No avanzar si la contraseña no es válida
      }
    }

    if (activeStep === steps.length - 2) {
      // Antes de ir a la confirmación, verificar que todo el formulario sea válido
      const isFormValid = [0, 1, 2, 3].every(step => {
        setActiveStep(step);
        return validateStep(step);
      });

      if (isFormValid) {
        setFormComplete(true);
        setActiveStep(steps.length - 1);
      }
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  // Manejar el retroceso al paso anterior
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  // Manejar ir a un paso específico
  const handleStep = (step) => {
    setActiveStep(step);
  };

  // Manejar el guardado del formulario
  const handleSave = () => {
    // Crear el objeto a guardar (sin passwordConfirm)
    const { passwordConfirm, ...dataToSave } = formData;

    // Llamar a la función de guardado del componente padre
    onSave(dataToSave);
  };

  // Generar iniciales para el avatar
  const getInitials = () => {
    const { nombre, aPaterno } = formData;
    if (nombre && aPaterno) {
      return `${nombre.charAt(0)}${aPaterno.charAt(0)}`;
    } else if (nombre) {
      return nombre.charAt(0);
    }
    return '';
  };

  // Renderizar el avatar
  const renderAvatar = () => (
    <Box sx={formStyles.avatarContainer}>
      <Avatar
        sx={formStyles.largeAvatar}
        src={formData.imagen || ''}
      >
        {!formData.imagen && getInitials()}
        {!formData.imagen && !getInitials() && <FaUser />}
      </Avatar>
    </Box>
  );

  // Renderizar el indicador de fortaleza de contraseña
  const renderPasswordStrength = () => (
    <Box>
      <Box sx={formStyles.passwordStrength}>
        <Box
          sx={{
            ...formStyles.strengthIndicator,
            width: `${passwordStrength}%`,
            backgroundColor:
              passwordStrength < 40 ? '#f44336' : // Rojo
                passwordStrength < 60 ? '#ff9800' : // Naranja
                  passwordStrength < 80 ? '#ffeb3b' : // Amarillo
                    '#4caf50'                          // Verde
          }}
        />
      </Box>
      <Typography variant="caption" sx={{
        display: 'flex',
        justifyContent: 'space-between',
        color: colors.secondaryText
      }}>
        <span>Débil</span>
        <span>Fuerte</span>
      </Typography>
    </Box>
  );

  // Renderizar icono personalizado para el Stepper
  const customStepIcon = (stepIndex, active, completed) => {
    if (completed) {
      return (
        <Box sx={formStyles.completedStepIcon}>
          <FaCheckCircle size={18} />
        </Box>
      );
    } else if (active) {
      return (
        <Box sx={formStyles.activeStepIcon}>
          <Typography sx={{ fontWeight: 'bold', color: colors.primary }}>{stepIndex + 1}</Typography>
        </Box>
      );
    } else {
      return (
        <Box sx={formStyles.stepIcon}>
          <Typography sx={{ fontWeight: 'bold', color: colors.primary }}>{stepIndex + 1}</Typography>
        </Box>
      );
    }
  };

  // Renderizar contenido según el paso actual
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Información Personal
        return (
          <Box sx={formStyles.stepContent}>
            <Typography sx={formStyles.title}>
              <FaUser style={formStyles.iconSpacing} /> Información Personal
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!(formTouched.nombre && errors.nombre)}
                  helperText={(formTouched.nombre && errors.nombre) || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser color={colors.primary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    ...formStyles.input,
                    mb: 2
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido Paterno"
                  name="aPaterno"
                  value={formData.aPaterno}
                  onChange={handleChange}
                  error={!!(formTouched.aPaterno && errors.aPaterno)}
                  helperText={(formTouched.aPaterno && errors.aPaterno) || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaIdCard color={colors.primary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={formStyles.input}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido Materno (opcional)"
                  name="aMaterno"
                  value={formData.aMaterno || ''}
                  onChange={handleChange}
                  error={!!(formTouched.aMaterno && errors.aMaterno)}
                  helperText={(formTouched.aMaterno && errors.aMaterno) || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaIdCard color={colors.primary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={formStyles.input}
                />
              </Grid>
            </Grid>

            <Alert
              severity="info"
              icon={<FaInfoCircle />}
              sx={{ mt: 3, borderRadius: '8px' }}
            >
              Esta información será utilizada para identificar al empleado en el sistema.
            </Alert>
          </Box>
        );

      case 1: // Datos de Contacto
        return (
          <Box sx={formStyles.stepContent}>
            <Typography sx={formStyles.title}>
              <FaEnvelope style={formStyles.iconSpacing} /> Datos de Contacto
            </Typography>

            {renderAvatar()}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!(formTouched.email && errors.email)}
                  helperText={(formTouched.email && errors.email) || 'Ejemplo: usuario@gmail.com'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaEnvelope color={colors.primary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    ...formStyles.input,
                    mb: 2
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono (10 dígitos)"
                  name="telefono"
                  value={formData.telefono || ''}
                  onChange={handleChange}
                  error={!!(formTouched.telefono && errors.telefono)}
                  helperText={(formTouched.telefono && errors.telefono) || 'Ejemplo: 7711234567'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaPhone color={colors.primary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={formStyles.input}
                />
              </Grid>
            </Grid>

            <Alert
              severity="info"
              icon={<FaInfoCircle />}
              sx={{ mt: 3, borderRadius: '8px' }}
            >
              Estos datos se utilizarán para contactar al empleado. El correo electrónico también será su nombre de usuario.
            </Alert>
          </Box>
        );

      case 2: // Información Laboral
        return (
          <Box sx={formStyles.stepContent}>
            <Typography sx={formStyles.title}>
              <FaBriefcase style={formStyles.iconSpacing} /> Información Laboral
            </Typography>

            {renderAvatar()}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={!!(formTouched.puesto && errors.puesto)}
                  sx={{ mb: 2 }}
                >
                  <InputLabel sx={{ color: colors.inputLabel }}>Puesto</InputLabel>
                  <Select
                    name="puesto"
                    value={formData.puesto}
                    label="Puesto"
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start" sx={{ ml: 1, mr: 1 }}>
                        <FaUserMd color={colors.primary} />
                      </InputAdornment>
                    }
                    sx={{
                      color: colors.text,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: (formTouched.puesto && errors.puesto)
                          ? colors.error : colors.inputBorder,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.primary,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.primary,
                      }
                    }}
                  >
                    {positionOptions.map((position) => (
                      <MenuItem key={position} value={position}>
                        {position}
                        {position === 'Odontólogo' && (
                          <Tooltip
                            title="Solo puede existir un Odontólogo activo a la vez"
                            arrow
                            placement="right"
                          >
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <FaInfoCircle style={{ fontSize: '14px', color: colors.primary }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {(formTouched.puesto && errors.puesto) && (
                    <Typography variant="caption" color="error">
                      {errors.puesto}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      color: colors.secondaryText
                    }}
                  >
                    Estado del empleado
                  </Typography>
                  <Box sx={{
                    p: 2,
                    backgroundColor: colors.background === '#F9FDFF' ? '#f5f5f5' : '#1D2B3A',
                    border: '1px solid',
                    borderColor: colors.divider,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FaUserCheck style={{
                        marginRight: '8px',
                        color: formData.estado === 'activo' ? '#4caf50' : '#f44336'
                      }} />
                      <Typography>
                        {formData.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      color={formData.estado === 'activo' ? 'error' : 'success'}
                      size="small"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        estado: prev.estado === 'activo' ? 'inactivo' : 'activo'
                      }))}
                      sx={{ borderRadius: '8px' }}
                    >
                      {formData.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </Box>
                </FormControl>
              </Grid>
            </Grid>

            {formData.puesto === 'Odontólogo' && (
              <Alert
                severity="warning"
                icon={<FaExclamationTriangle />}
                sx={{ mt: 3, borderRadius: '8px' }}
              >
                Solo puede existir un Odontólogo activo en el sistema. Si ya existe uno, será desactivado automáticamente.
              </Alert>
            )}
          </Box>
        );

      case 3: // Contraseña
        return (
          <Box sx={formStyles.stepContent}>
            <Typography sx={formStyles.title}>
              <FaLock style={formStyles.iconSpacing} /> Configuración de Contraseña
            </Typography>

            {editMode && (
              <Alert
                severity="info"
                icon={<FaInfoCircle />}
                sx={{ mb: 2, borderRadius: '8px' }}
              >
                Si no desea cambiar la contraseña, deje los campos en blanco.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!(formTouched.password && errors.password)}
                  helperText={(formTouched.password && errors.password) || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock color={colors.primary} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          edge="end"
                        >
                          {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    ...formStyles.input,
                    mb: 1
                  }}
                />

                {isLoadingPassword && (
                  <LinearProgress sx={{ mb: 1, borderRadius: '4px' }} />
                )}

                {formData.password && renderPasswordStrength()}

                {passwordErrors.length > 0 && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                      La contraseña debe cumplir con los siguientes requisitos:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                      {passwordErrors.map((error, index) => (
                        <Chip
                          key={index}
                          label={error}
                          variant="outlined"
                          size="small"
                          icon={<FaTimesCircle />}
                          sx={formStyles.errorChip}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Contraseña"
                  name="passwordConfirm"
                  type={passwordConfirmVisible ? "text" : "password"}
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  error={!!(formTouched.passwordConfirm && errors.passwordConfirm)}
                  helperText={(formTouched.passwordConfirm && errors.passwordConfirm) || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock color={colors.primary} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setPasswordConfirmVisible(!passwordConfirmVisible)}
                          edge="end"
                        >
                          {passwordConfirmVisible ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={formStyles.input}
                />
              </Grid>
            </Grid>

            <Alert
              severity="info"
              icon={<FaShieldAlt />}
              sx={{ mt: 3, borderRadius: '8px' }}
            >
              Use una contraseña única y segura. No comparta la misma contraseña con otros servicios.
            </Alert>
          </Box>
        );

      case 4: // Confirmación
        return (
          <Box sx={formStyles.stepContent}>
            <Typography sx={formStyles.title}>
              <FaCheckCircle style={formStyles.iconSpacing} /> Resumen de información
            </Typography>

            {renderAvatar()}

            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: colors.paper,
                borderRadius: '12px',
                mb: 2,
                border: `1px solid ${colors.divider}`
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color={colors.primary} sx={{ fontWeight: 'bold' }}>
                    Información Personal
                  </Typography>
                  <Divider sx={{ mb: 1 }} />

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Nombre:</strong> {formData.nombre} {formData.aPaterno} {formData.aMaterno}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Correo:</strong> {formData.email}
                  </Typography>

                  {formData.telefono && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Teléfono:</strong> {formData.telefono}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color={colors.primary} sx={{ fontWeight: 'bold' }}>
                    Información Laboral
                  </Typography>
                  <Divider sx={{ mb: 1 }} />

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Puesto:</strong> {formData.puesto}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Estado:</strong> {' '}
                    <Chip
                      label={formData.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      size="small"
                      sx={{
                        backgroundColor: formData.estado === 'activo' ? '#E6F4EA' : '#FEE2E2',
                        color: formData.estado === 'activo' ? '#1B873F' : '#DC2626',
                      }}
                    />
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Contraseña:</strong> {editMode && !formData.password ? 'No modificada' : '••••••••'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Alert
              severity="success"
              icon={<FaCheckCircle />}
              sx={{ borderRadius: '8px' }}
            >
              Por favor verifique que toda la información sea correcta antes de guardar.
            </Alert>
          </Box>
        );

      default:
        return <div>Error: Paso desconocido</div>;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !isProcessing && onClose()}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          backgroundColor: colors.background,
          color: colors.text,
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{
        background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.primary}90 90%)`,
        p: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center' }}>
            {editMode ? (
              <>
                <FaUserEdit style={{ marginRight: '10px' }} /> Editar Empleado
              </>
            ) : (
              <>
                <FaUserCheck style={{ marginRight: '10px' }} /> Añadir Nuevo Empleado
              </>
            )}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={isProcessing}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            <FaTimes />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Stepper para mostrar el progreso */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          nonLinear
          sx={{
            ...formStyles.stepper,
            mb: 3
          }}
        >
          {steps.map((label, index) => (
            <Step key={label} completed={Boolean(completedSteps[index])}>
              <StepButton
                onClick={() => handleStep(index)}
                disabled={index === steps.length - 1 && !formComplete}
                icon={customStepIcon(index, activeStep === index, !!completedSteps[index])}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: activeStep === index ? colors.primary : colors.secondaryText,
                    textAlign: 'center'
                  }}
                >
                  {label}
                </Typography>
              </StepButton>
            </Step>
          ))}
        </Stepper>

        {/* Contenedor principal del formulario */}
        <Box sx={formStyles.container}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        pt: 2,
        borderTop: `1px solid ${colors.divider}`
      }}>
        <Box sx={{ width: '100%', ...formStyles.buttonContainer }}>
          {activeStep === 0 ? (
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isProcessing}
              sx={{
                color: colors.text,
                borderColor: colors.divider,
                borderRadius: '8px'
              }}
            >
              Cancelar
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isProcessing}
              startIcon={<FaArrowLeft />}
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                borderRadius: '8px'
              }}
            >
              Atrás
            </Button>
          )}

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isProcessing || !formComplete}
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <FaSave />}
              sx={{
                backgroundColor: colors.primary,
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isProcessing ? 'Guardando...' : (editMode ? 'Actualizar' : 'Guardar')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isProcessing || !stepIsValid}
              endIcon={<FaArrowRight />}
              sx={{
                backgroundColor: colors.primary,
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              Siguiente
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EmpleadoFormWizard;