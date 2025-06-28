import ArrowBack from '@mui/icons-material/ArrowBack';
import ContactSupport from '@mui/icons-material/ContactSupport';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import {
  Alert,
  AlertTitle,
  alpha,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Fade,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Modal,
  Paper,
  Select,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { AnimatePresence, motion } from 'framer-motion';
import React, { forwardRef, useEffect, useRef, useState, createRef } from 'react';
import {
  FaBirthdayCake,
  FaCheckCircle,
  FaPencilAlt,
  FaClipboardCheck,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaInfoCircle,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaPlusCircle,
  FaShieldAlt,
  FaUser
} from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import Notificaciones from '../../../components/Layout/Notificaciones';
import ErrorBoundary from '../../../components/Tools/ErrorBoundary';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

/**
 * Componente de registro rediseñado con mejor UX/UI para profesionales
 * - Interfaz mejorada con estilos consistentes
 * - Diseño totalmente responsivo
 * - Experiencia de usuario optimizada por pasos
 * - Validación en tiempo real y retroalimentación visual
 */
const Register = () => {
  // Estado para gestionar el paso activo en el formulario
  const [activeStep, setActiveStep] = useState(0);

  // Datos del formulario con valores iniciales
  const [formData, setFormData] = useState({
    nombre: '',
    aPaterno: '',
    aMaterno: '',
    fechaNacimiento: '',
    esMayorDeEdad: true,
    genero: '',
    lugar: '',
    otroLugar: '',
    telefono: '',
    email: '',
    alergias: [],
    condicionesMedicas: [],
    otraAlergia: '',
    otraCondicion: '',
    tipoTutor: '',
    nombreTutor: '',
    password: '',
    confirmPassword: '',
    telefono1: '',
    telefono2: '',
    telefono3: '',
    telefono4: '',
    noTieneEmail: false,
    noTieneTelefono: false,
    isNumberConfirmed: false,
  });
  // Estados para errores y validaciones
  const [errors, setErrors] = useState({});
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifiedComplete, setIsVerifiedComplete] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [openNotification, setOpenNotification] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSafe, setIsPasswordSafe] = useState(false);
  const [isPasswordFiltered, setIsPasswordFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showChangeEmailConfirmation, setShowChangeEmailConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(true);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [openTermsModal, setOpenTermsModal] = useState(false);
  const [allAccepted, setAllAccepted] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  // Array con todos los pasos del formulario
  const steps = ['Datos personales', 'Información de contacto', 'Revisar datos', 'Crear contraseña'];
  const nameRegex = /^[A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
  const phoneRegex = /^\d{10}$/;
  const today = new Date().toISOString().split('T')[0];

  // Definición de colores más profesionales
  const colors = {
    primary: isDarkTheme ? '#1E88E5' : '#0052A3',
    primaryDark: isDarkTheme ? '#1565C0' : '#003B7A',
    primaryLight: isDarkTheme ? '#42A5F5' : '#2979FF',
    secondary: isDarkTheme ? '#E3F2FD' : '#F5F9FF',
    text: isDarkTheme ? '#E1F5FE' : '#1A2027',
    textSecondary: isDarkTheme ? '#B0BEC5' : '#607D8B',
    background: isDarkTheme ? '#1C2A38' : '#F5F9FF',
    paper: isDarkTheme ? '#2a3649' : '#ffffff',
    border: isDarkTheme ? 'rgba(176, 190, 197, 0.3)' : 'rgba(27, 42, 58, 0.2)',
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#D32F2F',
    info: '#0277BD',
    whatsapp: '#25D366',
    whatsappHover: '#128C7E',
  };

  // Estilos comunes para los componentes del formulario
  const formStyles = {
    textField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: isDarkTheme ? alpha(colors.paper, 0.4) : colors.paper,
        '&:hover': {
          backgroundColor: isDarkTheme ? alpha(colors.paper, 0.6) : '#FFFFFF',
        },
        '&:hover fieldset': {
          borderColor: colors.primary,
          borderWidth: '1px',
        },
        '&.Mui-focused fieldset': {
          borderColor: colors.primary,
          borderWidth: '2px',
        },
        '& .MuiInputBase-input': {
          padding: '14px 14px',
        }
      },
      '& .MuiInputLabel-root': {
        color: colors.textSecondary,
        '&.Mui-focused': {
          color: colors.primary,
        }
      },
      '& .MuiInputBase-input': {
        color: colors.text
      },
      '& .MuiInputAdornment-root .MuiSvgIcon-root, & .MuiInputAdornment-root svg': {
        color: colors.primary
      }
    },
    select: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: isDarkTheme ? alpha(colors.paper, 0.4) : colors.paper,
        '&:hover': {
          backgroundColor: isDarkTheme ? alpha(colors.paper, 0.6) : '#FFFFFF',
        },
        '&:hover fieldset': {
          borderColor: colors.primary,
        },
        '&.Mui-focused fieldset': {
          borderColor: colors.primary,
        }
      },
      '& .MuiInputLabel-root': {
        color: colors.textSecondary,
        '&.Mui-focused': {
          color: colors.primary,
        }
      },
      '& .MuiSelect-select': {
        padding: '14px 14px',
      }
    },
    button: {
      primary: {
        backgroundColor: colors.primary,
        color: '#FFFFFF',
        fontWeight: 500,
        borderRadius: '8px',
        padding: '10px 24px',
        boxShadow: `0 4px 6px -1px ${alpha(colors.primary, 0.2)}, 0 2px 4px -1px ${alpha(colors.primary, 0.1)}`,
        textTransform: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: colors.primaryDark,
          boxShadow: `0 10px 15px -3px ${alpha(colors.primary, 0.3)}, 0 4px 6px -2px ${alpha(colors.primary, 0.1)}`,
          transform: 'translateY(-2px)'
        },
        '&:active': {
          transform: 'translateY(0px)'
        },
        '&.Mui-disabled': {
          backgroundColor: alpha(colors.primary, 0.4),
          color: '#FFFFFF'
        }
      },
      secondary: {
        color: colors.primary,
        backgroundColor: alpha(colors.primary, 0.08),
        fontWeight: 500,
        borderRadius: '8px',
        padding: '10px 24px',
        border: `1px solid ${alpha(colors.primary, 0.2)}`,
        textTransform: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: alpha(colors.primary, 0.15),
          borderColor: alpha(colors.primary, 0.3),
        }
      },
      whatsapp: {
        backgroundColor: colors.whatsapp,
        color: '#FFFFFF',
        fontWeight: 500,
        borderRadius: '8px',
        padding: '10px 16px',
        textTransform: 'none',
        boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.2), 0 2px 4px -1px rgba(37, 211, 102, 0.1)',
        '&:hover': {
          backgroundColor: colors.whatsappHover,
          boxShadow: '0 6px 10px -2px rgba(37, 211, 102, 0.25), 0 4px 6px -2px rgba(37, 211, 102, 0.15)',
        }
      }
    },
    heading: {
      color: colors.primary,
      fontWeight: 600,
      position: 'relative',
      paddingBottom: '16px',
      marginBottom: '20px',
      '&:after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '40px',
        height: '3px',
        backgroundColor: colors.primary,
        borderRadius: '8px'
      }
    },
    card: {
      backgroundColor: colors.paper,
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`
    }
  };

  // Stepper personalizado con estilos mejorados
  const CustomStepConnector = styled(StepConnector)({
    '& .MuiStepConnector-line': {
      borderColor: isDarkTheme ? alpha(colors.border, 0.5) : colors.border,
      borderTopWidth: 3,
    },
  });

  const CustomStepIcon = ({ active, completed, icon }) => {
    return (
      <Box
        sx={{
          height: 40,
          width: 40,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: completed
            ? colors.success
            : active
              ? colors.primary
              : isDarkTheme
                ? alpha(colors.textSecondary, 0.2)
                : alpha(colors.textSecondary, 0.1),
          border: completed || active
            ? 'none'
            : `2px solid ${isDarkTheme ? alpha(colors.textSecondary, 0.3) : alpha(colors.textSecondary, 0.2)}`,
          transition: 'all 0.3s ease',
          color: completed || active
            ? '#FFFFFF'
            : colors.textSecondary,
          boxShadow: (completed || active)
            ? `0 0 0 5px ${alpha(completed ? colors.success : colors.primary, 0.15)}`
            : 'none',
          zIndex: 1
        }}
      >
        {completed ? (
          <FaCheckCircle size={20} />
        ) : (
          <Typography
            variant="body1"
            sx={{
              fontWeight: active ? 700 : 500,
              fontSize: '16px'
            }}
          >
            {icon}
          </Typography>
        )}
      </Box>
    );
  };

  // Input personalizado para el teléfono con formato de grupos
  const PhoneDigitInput = forwardRef(({ value, onChange, error, helperText, ...props }, ref) => {
    // Referencias para los inputs
    const phoneInputRefs = useRef(Array(10).fill(0).map(() => createRef()));

    // Estado local (solo para UI)
    const [activeIndex, setActiveIndex] = useState(-1); // Índice de la casilla activa
    const [phoneFieldActive, setPhoneFieldActive] = useState(false); // Campo completo activo

    // Efecto para inicializar según teléfono existente
    useEffect(() => {
      if (formData.telefono && formData.telefono.length > 0 && !formData.isNumberConfirmed) {
        // Si hay un número parcial, enfocar la siguiente posición
        const nextIndex = Math.min(formData.telefono.length, 9);
        if (phoneInputRefs.current[nextIndex]?.current) {
          phoneInputRefs.current[nextIndex].current.focus();
        }
      }
    }, []);

    // Función para manejar entrada en cada dígito
    const handleDigitInput = (index, e) => {
      if (formData.isNumberConfirmed) return;

      const inputValue = e.target.value.replace(/\D/g, '');
      const lastChar = inputValue.slice(-1);

      if (lastChar) {
        // Actualizar el valor en formData
        const newPhone = formData.telefono.split('');
        newPhone[index] = lastChar;

        setFormData({
          ...formData,
          telefono: newPhone.join('')
        });

        // Avanzar al siguiente campo si hay un valor y no es el último
        if (index < 9) {
          phoneInputRefs.current[index + 1].current.focus();
          setActiveIndex(index + 1);
        }
      }
    };

    // Manejar teclas especiales
    const handleKeyDown = (index, e) => {
      if (formData.isNumberConfirmed) return;

      if (e.key === 'Backspace') {
        // Si el campo actual está vacío y no es el primero, retroceder
        if (!formData.telefono[index] && index > 0) {
          phoneInputRefs.current[index - 1].current.focus();
          setActiveIndex(index - 1);
        } else if (formData.telefono[index]) {
          // Si el campo actual tiene valor, borrarlo
          const newPhone = formData.telefono.split('');
          newPhone[index] = '';

          setFormData({
            ...formData,
            telefono: newPhone.join('')
          });
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        phoneInputRefs.current[index - 1].current.focus();
        setActiveIndex(index - 1);
      } else if (e.key === 'ArrowRight' && index < 9) {
        phoneInputRefs.current[index + 1].current.focus();
        setActiveIndex(index + 1);
      }
    };

    // Manejar pegado de número completo
    const handlePaste = (e) => {
      if (formData.isNumberConfirmed) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const digits = pastedText.replace(/\D/g, '').substring(0, 10);

      if (digits) {
        setFormData({
          ...formData,
          telefono: digits
        });

        // Si se pegaron todos los dígitos, enfocar el último campo
        if (digits.length === 10) {
          phoneInputRefs.current[9].current.focus();
          setActiveIndex(9);
        } else if (digits.length > 0) {
          // Enfocar la siguiente posición después del último dígito
          phoneInputRefs.current[digits.length].current.focus();
          setActiveIndex(digits.length);
        }
      }
    };

    // Confirmar el número
    const handleConfirmNumber = () => {
      if (formData.telefono.length === 10) {
        setFormData(prev => ({
          ...prev,
          isNumberConfirmed: true
        }));
        setActiveIndex(-1);
        setPhoneFieldActive(false);
      } else {
        // Mostrar un mensaje de error si el número no está completo
        setErrors(prev => ({
          ...prev,
          telefono: 'Debes ingresar los 10 dígitos para confirmar'
        }));

        // Enfocar la primera casilla vacía
        const emptyIndex = formData.telefono.split('').findIndex(digit => !digit);
        if (emptyIndex >= 0) {
          phoneInputRefs.current[emptyIndex].current.focus();
          setActiveIndex(emptyIndex);
        } else {
          phoneInputRefs.current[0].current.focus();
          setActiveIndex(0);
        }
      }
    };

    // Editar el número (desbloquear)
    const handleEditNumber = () => {
      setFormData(prev => ({
        ...prev,
        isNumberConfirmed: false
      }));
      // Enfocar el primer dígito al editar
      phoneInputRefs.current[0].current.focus();
      setActiveIndex(0);
      setPhoneFieldActive(true);
    };

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            color: colors.primary,
            mr: 1
          }}>
            <FaPhone size={18} />
          </Box>
          
          <Typography
            variant="body1"
            sx={{
              color: colors.primary,
              fontWeight: 500
            }}
          >
            Número de teléfono
          </Typography>
        </Box>
    
        {/* Contenedor principal del input */}
        <Box 
          sx={{
            backgroundColor: '#f5f9ff',
            p: 1.5,
            borderRadius: '8px',
            mb: 1
          }}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* 10 casillas con inputs */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 0.5 },
              flex: 1
            }}>
              {Array(10).fill(0).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '34px',
                    height: '42px',
                    position: 'relative'
                  }}
                >
                  {/* Caja visual */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#fff',
                      border: `1px solid ${activeIndex === index ? colors.primary : '#e0e0e0'}`,
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: colors.text,
                      position: 'relative',
                      boxShadow: activeIndex === index ? `0 0 0 1px ${colors.primary}` : 'none',
                      '&::after': activeIndex === index && !formData.telefono[index] ? {
                        content: '"|"',
                        position: 'absolute',
                        color: colors.primary,
                        fontWeight: 400,
                        animation: 'blink 1s infinite',
                        '@keyframes blink': {
                          '0%, 100%': {
                            opacity: 1,
                          },
                          '50%': {
                            opacity: 0,
                          },
                        },
                      } : {}
                    }}
                  >
                    {formData.telefono[index] || ''}
                  </Box>
    
                  {/* Input real */}
                  <input
                    ref={phoneInputRefs.current[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={formData.telefono[index] || ''}
                    onChange={(e) => handleDigitInput(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : null}
                    onFocus={() => {
                      setActiveIndex(index);
                      setPhoneFieldActive(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        const anyFocused = phoneInputRefs.current.some(
                          ref => document.activeElement === ref.current
                        );
                        if (!anyFocused) {
                          setPhoneFieldActive(false);
                          setActiveIndex(-1);
                        }
                      }, 10);
                    }}
                    disabled={formData.isNumberConfirmed || formData.noTieneTelefono}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      opacity: 0,
                      cursor: formData.isNumberConfirmed ? 'not-allowed' : 'text',
                      zIndex: 2
                    }}
                  />
    
                  {/* Área clickeable */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      cursor: formData.isNumberConfirmed || formData.noTieneTelefono ? 'not-allowed' : 'text',
                      zIndex: 3,
                      border: 'none',
                      backgroundColor: 'transparent'
                    }}
                    onClick={() => {
                      if (!formData.isNumberConfirmed && !formData.noTieneTelefono) {
                        phoneInputRefs.current[index].current.focus();
                        setActiveIndex(index);
                        setPhoneFieldActive(true);
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
            
            {/* Botón de confirmar/editar */}
            {!formData.noTieneTelefono && (
              <Button
                size="small"
                variant={formData.isNumberConfirmed ? "outlined" : "contained"}
                color={formData.isNumberConfirmed ? "secondary" : "primary"}
                onClick={formData.isNumberConfirmed ? handleEditNumber : handleConfirmNumber}
                disabled={formData.telefono.length === 0}
                sx={{
                  ml: 2,
                  minWidth: 'auto',
                  height: '38px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {formData.isNumberConfirmed ? "Editar" : "Confirmar"}
              </Button>
            )}
          </Box>
        </Box>
    
        {/* Mensaje de información */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          <InfoIcon sx={{ color: colors.primary, fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            Ingresa 10 dígitos sin espacios ni guiones
          </Typography>
        </Box>
    
        {/* Error message */}
        {error && (
          <FormHelperText error sx={{ ml: 0, mt: 1 }}>
            {helperText}
          </FormHelperText>
        )}
    
        {/* Success message */}
        {formData.isNumberConfirmed && !error && (
          <FormHelperText sx={{ color: colors.success, ml: 0, mt: 1 }}>
            Número confirmado correctamente
          </FormHelperText>
        )}
    
        {/* No tengo teléfono checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.noTieneTelefono}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  noTieneTelefono: e.target.checked,
                  telefono: e.target.checked ? '' : formData.telefono,
                  isNumberConfirmed: false
                });
    
                if (e.target.checked) {
                  setErrors(prev => ({ ...prev, telefono: '' }));
                  setPhoneFieldActive(false);
                  setActiveIndex(-1);
                }
              }}
              sx={{
                color: colors.primary,
                '&.Mui-checked': {
                  color: colors.primary,
                }
              }}
              disabled={formData.isNumberConfirmed}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: colors.text }}>
              No tengo número de teléfono
            </Typography>
          }
          sx={{ mt: 1 }}
        />
      </Box>
    );
  });

  // Handlers y funciones
  const handleAcceptChange = (event) => {
    setAllAccepted(event.target.checked);
  };

  const parseFechaLocal = (fechaStr) => {
    const [year, month, day] = fechaStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  const handleOpenPrivacyModal = async (event) => {
    event.stopPropagation();
    if (!privacyPolicy) await fetchPrivacyPolicy();
    setOpenPrivacyModal(true);
  };

  const handleOpenTermsModal = async (event) => {
    event.stopPropagation();
    if (!termsConditions) await fetchTermsConditions();
    setOpenTermsModal(true);
  };

  const handleClosePrivacyModal = () => setOpenPrivacyModal(false);
  const handleCloseTermsModal = () => setOpenTermsModal(false);

  const fetchPrivacyPolicy = async () => {
    try {
      const response = await axios.get('https://back-end-4803.onrender.com/api/politicas/politicas_privacidad');
      const activePolicy = response.data.find(policy => policy.estado === 'activo');
      setPrivacyPolicy(activePolicy ? activePolicy.contenido : 'No se encontraron políticas de privacidad activas.');
    } catch (error) {
      console.error('Error al obtener las políticas de privacidad', error);
      setPrivacyPolicy('Error al cargar las políticas de privacidad.');
    }
  };

  const fetchTermsConditions = async () => {
    try {
      const response = await axios.get('https://back-end-4803.onrender.com/api/termiCondicion/terminos_condiciones');
      const activeTerms = response.data.find(term => term.estado === 'activo');
      setTermsConditions(activeTerms ? activeTerms.contenido : 'No se encontraron términos y condiciones activos.');
    } catch (error) {
      console.error('Error al obtener los términos y condiciones', error);
      setTermsConditions('Error al cargar los términos y condiciones.');
    }
  };

  const handleCloseNotification = () => {
    setOpenNotification(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Función para verificar reglas personalizadas de contraseña
  const checkPasswordRules = (password) => {
    const errors = [];
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;
    const noRepeatingChars = !/(.)\1{2}/.test(password);

    if (!hasUpperCase) errors.push('Debe tener al menos una letra mayúscula.');
    if (!hasNumber) errors.push('Debe tener al menos un número.');
    if (!hasSpecialChar) errors.push('Debe tener al menos un símbolo especial.');
    if (!hasMinLength) errors.push('Debe tener más de 8 caracteres.');
    if (!noRepeatingChars) errors.push('No puede tener más de 3 letras seguidas iguales.');

    return errors;
  };

  // Función para verificar tanto la seguridad como las reglas de la contraseña
  const checkPasswordValidity = async (password) => {
    const customErrors = checkPasswordRules(password);

    if (customErrors.length > 0) {
      setPasswordError(customErrors.join(' '));
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
        setPasswordError('Contraseña insegura: ha sido filtrada en brechas de datos.');
        setIsPasswordSafe(false);
        setIsPasswordFiltered(true);
        return false;
      } else {
        setPasswordError('');
        setIsPasswordSafe(true);
        setIsPasswordFiltered(false);
        return true;
      }
    } catch (error) {
      console.error('Error al verificar la contraseña:', error);
      setPasswordError('Error al verificar la contraseña.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el cambio en los campos
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    // Para checkboxes, usar el valor de checked
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: fieldValue,
    }));

    // Validaciones específicas por campo
    if (name === 'noTieneEmail' && checked) {
      // Si marca que no tiene email, establecer un valor por defecto para el email y limpiar errores
      setFormData(prev => ({
        ...prev,
        email: 'sin-correo@clinica.local',       
         [name]: checked
      }));
      setIsEmailVerified(true); // Considerar como verificado automáticamente
      setErrors(prev => ({ ...prev, email: '' }));
    } else if (name === 'noTieneEmail' && !checked) {
      // Si desmarca que no tiene email, limpiar el email generado
      setFormData(prev => ({
        ...prev,
        email: '',
        [name]: checked
      }));
      setIsEmailVerified(false);
    }

    // Validación de la contraseña
    if (name === 'password') {
      const strength = zxcvbn(value).score;
      setPasswordStrength(strength);
      checkPasswordValidity(value).then((isValid) => {
        if (!isValid) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            password: 'La contraseña no cumple con los requisitos o ha sido filtrada.',
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            password: '',
          }));
        }
      });
    }

    if (name === 'nombre') {
      const trimmedValue = value.trim();
      if (!nameRegex.test(trimmedValue)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          nombre: 'El nombre solo debe contener letras, espacios y acentos.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          nombre: '',
        }));
      }
    }

    if (name === 'aPaterno') {
      if (!nameRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          aPaterno: 'El apellido paterno solo debe contener letras',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          aPaterno: '',
        }));
      }
    }

    if (name === 'aMaterno') {
      if (!nameRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          aMaterno: 'El apellido materno solo debe contener letras',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          aMaterno: '',
        }));
      }
    }

    // Manejar fecha de nacimiento
    if (name === 'fechaNacimiento') {
      const hoy = new Date();
      const nacimiento = new Date(value);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      const esMenorDeEdad =
        edad < 18 ||
        (edad === 18 &&
          (hoy.getMonth() < nacimiento.getMonth() ||
            (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())));

      setFormData((prevData) => ({
        ...prevData,
        esMayorDeEdad: !esMenorDeEdad,
      }));

      if (!esMenorDeEdad) {
        setFormData((prevData) => ({
          ...prevData,
          tipoTutor: '',
          nombreTutor: '',
        }));
        setErrors((prevErrors) => ({
          ...prevErrors,
          tipoTutor: '',
          nombreTutor: '',
        }));
      }
    }

    if (name === 'tipoTutor' && !formData.esMayorDeEdad) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        tipoTutor: value ? '' : 'Selecciona el tipo de tutor',
      }));
    }

    if (name === 'relacionTutor') {
      const trimmedValue = value.trim();
      if (!nameRegex.test(trimmedValue) || trimmedValue === '') {
        setErrors((prevErrors) => ({
          ...prevErrors,
          relacionTutor: 'La relación solo debe contener letras, espacios y acentos.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          relacionTutor: '',
        }));
      }
      setFormData((prevData) => ({
        ...prevData,
        [name]: trimmedValue,
      }));
    }

    if (name === 'nombreTutor') {
      if (!nameRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          nombreTutor: 'El nombre del tutor solo debe contener letras y espacios.',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          nombreTutor: '',
        }));
      }
    }

    if (name === 'email') {
      const trimmedValue = value.trim();

      if (!emailRegex.test(trimmedValue) && !formData.noTieneEmail) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: 'Verifique que su correo sea válido',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: '',
        }));
      }
    }

    if (name === 'telefono') {
      if (!phoneRegex.test(value) && !formData.noTieneTelefono) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          telefono: 'Verifique que su numero de telefono sea valido',
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          telefono: '',
        }));
      }
    }

    if (name === 'alergias' && value.includes('Otro')) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        otraAlergia: formData.otraAlergia ? '' : 'Especifica la alergia',
      }));
    }

    if (name === 'otraAlergia') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        otraAlergia: value.trim() ? '' : 'Especifica la alergia',
      }));
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Manejo del submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevenir múltiples envíos
    if (isSubmitting || isLoading) return;

    try {
      setIsSubmitting(true);
      setIsLoading(true);

      // Validaciones iniciales
      let newErrors = {};

      // Validación para "Otro" en alergias
      if (formData.alergias.includes('Otro') && !formData.otraAlergia.trim()) {
        newErrors.otraAlergia = 'Especifica la alergia';
      }

      // Validación de lugar "Otro"
      if (formData.lugar === 'Otro' && !formData.otroLugar.trim()) {
        newErrors.otroLugar = 'Especifica el lugar';
      }

      // Validación de tutor si es menor de edad
      if (!formData.esMayorDeEdad) {
        if (!formData.tipoTutor) {
          newErrors.tipoTutor = 'Selecciona el tipo de tutor';
        }

        if (formData.tipoTutor === 'Otro' && !formData.relacionTutor?.trim()) {
          newErrors.relacionTutor = 'Especifica el tipo de tutor';
        }

        if (!formData.nombreTutorNombre?.trim()) {
          newErrors.nombreTutorNombre = 'El nombre del tutor es requerido';
        }

        if (!formData.nombreTutorApellidos?.trim()) {
          newErrors.nombreTutorApellidos = 'Los apellidos del tutor son requeridos';
        }
      }

      // Si hay errores de validación, detener el proceso
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Por favor, completa todos los campos requeridos');
      }

      // Verificar contraseña
      const isPasswordValid = await checkPasswordValidity(formData.password);
      if (!isPasswordValid || passwordStrength < 3) {
        throw new Error(
          passwordStrength < 3
            ? 'La contraseña debe ser al menos "Fuerte" para continuar.'
            : 'La contraseña debe cumplir con los requisitos y no estar comprometida.'
        );
      }

      // Preparar datos para el envío
      const dataToSubmit = {
        nombre: formData.nombre,
        aPaterno: formData.aPaterno,
        aMaterno: formData.aMaterno,
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
        lugar: formData.lugar === 'Otro' ? formData.otroLugar : formData.lugar,
        telefono: formData.noTieneTelefono ? '' : formData.telefono,
        email: formData.email,

        // Procesar alergias y agregar "otra alergia" si es necesario
        alergias: formData.alergias.includes('Otro')
          ? [...formData.alergias.filter(a => a !== 'Otro'), formData.otraAlergia]
          : formData.alergias,

        // Procesar condiciones médicas y agregar "otra condición" si es necesario
        condicionesMedicas: formData.condicionesMedicas.includes('OtraCondicion')
          ? [...formData.condicionesMedicas.filter(c => c !== 'OtraCondicion'), formData.otraCondicion]
          : formData.condicionesMedicas,

        // Resto de datos
        tipoTutor: formData.tipoTutor,
        nombreTutor: formData.nombreTutor,
        password: formData.password,
        noTieneTelefono: formData.noTieneTelefono,
        noTieneEmail: formData.noTieneEmail
      };

      // Enviar datos al backend
      const response = await axios.post(
        'https://back-end-4803.onrender.com/api/register',
        dataToSubmit,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Verificación del error 500
      if (response.status === 500) {
        navigate('/error', {
          state: {
            errorCode: 500,
            errorMessage: 'Error interno del servidor. Por favor, inténtalo más tarde.'
          }
        });
        return;
      }

      // Manejar respuesta exitosa
      if (response.status === 200 || response.status === 201) {
        setNotificationMessage('¡Registro exitoso! Redirigiendo...');
        setNotificationType('success');
        setOpenNotification(true);

        // Redirigir después de mostrar el mensaje
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }

    } catch (error) {
      // Manejar específicamente errores de red o del servidor
      if (error.response?.status === 500) {
        navigate('/error', {
          state: {
            errorCode: 500,
            errorMessage: 'Error interno del servidor. Por favor, inténtalo más tarde.'
          }
        });
        return;
      }

      // Para errores de red (sin respuesta del servidor)
      if (!error.response) {
        navigate('/error', {
          state: {
            errorCode: 500,
            errorMessage: 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.'
          }
        });
        return;
      }

      let errorMessage = 'Error en el registro. Intenta nuevamente.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setNotificationMessage(errorMessage);
      setNotificationType('error');
      setOpenNotification(true);

    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = () => {
    // Permitir la edición del correo electrónico
    setIsEmailEditable(true);
    setShowChangeEmailConfirmation(false);

    // Reinicia los estados relacionados con la verificación
    setIsEmailSent(false);
    setIsEmailVerified(false);
    setIsVerifiedComplete(false);
    setEmailVerificationError('');
    setFormData((prevFormData) => ({
      ...prevFormData,
      verificationToken: '',
    }));

    // Notificación
    setNotificationMessage('Por favor, ingresa el nuevo correo y verifica nuevamente.');
    setNotificationType('info');
    setOpenNotification(true);
  };

  const handleVerifyEmail = async () => {
    const trimmedEmail = formData.email.trim();

    if (!formData.email) {
      setEmailVerificationError('Por favor, ingresa un correo electrónico.');
      return;
    }

    if (!trimmedEmail) {
      setEmailVerificationError('Por favor, ingresa un correo electrónico.');
      return;
    }

    // Verificar si el correo tiene el formato y dominio correcto
    if (!emailRegex.test(formData.email) && !formData.noTieneEmail) {
      setEmailVerificationError('Verifique que su correo sea ingresado correctamente');
      return;
    }

    setIsVerifyingEmail(true);
    setEmailVerificationError('');

    try {
      const response = await axios.post('https://back-end-4803.onrender.com/api/send-verification-email', {
        email: trimmedEmail,
      });

      if (response.status === 200) {
        setIsEmailSent(true);
        setIsEmailEditable(false);
        setNotificationMessage('Correo de verificación enviado.');
        setNotificationType('success');
        setOpenNotification(true);
      }
    } catch (error) {
      // Verifica si el servidor responde con un mensaje indicando que el correo ya está registrado
      if (error.response && error.response.status === 400 && error.response.data.message) {
        if (error.response.data.message === 'El correo electrónico ya está registrado.') {
          setEmailVerificationError('El correo electrónico ya está registrado. Por favor, intenta con otro correo.');
          setNotificationMessage('El correo electrónico ya está registrado.');
          setNotificationType('error');
          setOpenNotification(true);
        } else {
          setEmailVerificationError(error.response.data.message);
        }
      } else {
        setEmailVerificationError('Error al enviar el correo de verificación.');
      }
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Verificar el token de verificación
  const handleVerifyToken = async () => {
    if (!formData.verificationToken) {
      setEmailVerificationError('Por favor, ingresa el token de verificación.');
      return;
    }

    try {
      const response = await axios.post('https://back-end-4803.onrender.com/api/verify-token', {
        email: formData.email,
        token: formData.verificationToken,
      });

      if (response.status === 200) {
        setIsEmailVerified(true);
        setIsVerifiedComplete(true);
        setEmailVerificationError('');
        setNotificationMessage('Correo verificado correctamente.');
        setNotificationType('success');
        setOpenNotification(true);
      }
    } catch (error) {
      // Mostrar el mensaje específico que el servidor envía
      if (error.response && error.response.status === 400) {
        setEmailVerificationError(error.response.data.message);
      } else {
        setEmailVerificationError('Error en el servidor al verificar el token.');
      }
    }
  };

  const validateStep = () => {
    const stepErrors = {};
    const nameRegex = /^[A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]+$/;

    if (activeStep === 0) {
      // Validación de nombre y apellidos
      if (!formData.nombre || !nameRegex.test(formData.nombre)) {
        stepErrors.nombre = 'El nombre solo debe contener letras, espacios y acentos.';
      }
      if (!formData.aPaterno || !nameRegex.test(formData.aPaterno)) {
        stepErrors.aPaterno = 'El apellido paterno solo debe contener letras, espacios y acentos.';
      }
      if (!formData.aMaterno || !nameRegex.test(formData.aMaterno)) {
        stepErrors.aMaterno = 'El apellido materno solo debe contener letras, espacios y acentos.';
      }

      // Validación de género y lugar de procedencia
      if (!formData.genero) {
        stepErrors.genero = 'Selecciona un género';
      }
      if (!formData.lugar) {
        stepErrors.lugar = 'Selecciona un lugar de proveniencia';
      }
      if (formData.lugar === 'Otro' && !formData.otroLugar) {
        stepErrors.otroLugar = 'Especifica el lugar';
      }

      // Validación de campos personales
      if (!formData.fechaNacimiento) {
        stepErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
      }
      if (formData.tipoTutor === 'Otro' && (!formData.relacionTutor || formData.relacionTutor.trim() === '')) {
        stepErrors.relacionTutor = 'Por favor, especifica la relación con el menor.';
      }

      // Validar tutor si es menor de edad
      const hoy = new Date();
      const nacimiento = new Date(formData.fechaNacimiento);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      const esMenorDeEdad =
        edad < 18 || (edad === 18 && (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())));

      if (esMenorDeEdad) {
        if (!formData.tipoTutor) {
          stepErrors.tipoTutor = 'Selecciona el tipo de tutor';
        }
        if (!formData.nombreTutor || formData.nombreTutor.trim() === '') {
          stepErrors.nombreTutor = 'El nombre del tutor es obligatorio';
        }
      }
    }

    if (activeStep === 1) {
      // Para teléfono, solo validar si no ha marcado que no tiene teléfono
      if (!formData.telefono && !formData.noTieneTelefono) {
        stepErrors.telefono = 'El teléfono es requerido';
      } else if (formData.telefono && !phoneRegex.test(formData.telefono) && !formData.noTieneTelefono) {
        stepErrors.telefono = 'El teléfono debe contener 10 dígitos numéricos';
      }

      // Para email, solo validar si no ha marcado que no tiene email
      if (!formData.email && !formData.noTieneEmail) {
        stepErrors.email = 'El correo electrónico es requerido';
      } else if (formData.email && !emailRegex.test(formData.email) && !formData.noTieneEmail) {
        stepErrors.email = 'El formato del correo electrónico no es válido';
      }

      if (formData.alergias.includes('Otro') && !formData.otraAlergia.trim()) {
        stepErrors.otraAlergia = 'Especifica la alergia';
      }

      // Si no tiene ni email ni teléfono, mostrar un error
      if (formData.noTieneEmail && formData.noTieneTelefono) {
        stepErrors.contactError = 'Debe proporcionar al menos un método de contacto (email o teléfono)';
      }

      // Verificar si el email ha sido verificado (solo si no marcó que no tiene email)
      if (!isEmailVerified && !formData.noTieneEmail) {
        stepErrors.email = 'Debes verificar tu correo electrónico';
      }
    }

    if (activeStep === 3) {
      if (!formData.password) stepErrors.password = 'La contraseña es requerida';
      if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const alergiasInfo = {
    'Ninguna': 'No tengo alergias conocidas',
    'Penicilina': 'Antibiótico común usado en odontología',
    'Látex': 'Presente en guantes y algunos materiales dentales',
    'Anestesia Local': 'Utilizada en procedimientos dentales',
    'Metales': 'Como níquel o mercurio en amalgamas dentales',
    'Ibuprofeno/AINES': 'Medicamentos para dolor e inflamación',
    'Aspirina': 'Medicamento común para el dolor',
    'Clorhexidina': 'Antiséptico usado en enjuagues bucales'
  };

  // Lista simplificada de condiciones médicas relevantes para odontología
  const condicionesMedicas = [
    {
      value: 'Ninguna',
      label: 'Ninguna condición médica relevante'
    },
    {
      value: 'Hipertension',
      label: 'Hipertensión',
      info: 'Presión arterial alta'
    },
    {
      value: 'Diabetes',
      label: 'Diabetes',
      info: 'Afecta la cicatrización y puede requerir precauciones'
    },
    {
      value: 'ProblemasCardiacos',
      label: 'Problemas cardíacos',
      info: 'Como válvulas cardíacas artificiales o historial de endocarditis'
    },
    {
      value: 'Embarazo',
      label: 'Embarazo',
      info: 'Relevante para ciertos procedimientos y medicamentos'
    },
    {
      value: 'Anticoagulantes',
      label: 'Toma anticoagulantes',
      info: 'Medicamentos que afectan la coagulación de la sangre'
    },
    {
      value: 'Epilepsia',
      label: 'Epilepsia',
      info: 'Puede ser relevante para ciertos tratamientos'
    },
    {
      value: 'Sinusitis',
      label: 'Sinusitis crónica',
      info: 'Puede estar relacionada con problemas dentales'
    }
  ];

  // Función para determinar el color de fortaleza de la contraseña
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 2) return colors.error;
    if (passwordStrength === 2) return colors.warning;
    return colors.success;
  };

  // Función para determinar el texto de fortaleza de la contraseña
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Muy débil';
      case 1: return 'Débil';
      case 2: return 'Regular';
      case 3: return 'Fuerte';
      case 4: return 'Muy fuerte';
      default: return '';
    }
  };

  // Obtener la edad a partir de la fecha de nacimiento
  const getEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return `${edad} años`;
  };

  // Contenido por pasos
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {/* Datos Personales Título */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={formStyles.heading}
                  >
                    Datos Personales
                  </Typography>
                </Grid>

                {/* Campos de nombre y apellidos */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]/g, '');
                    }}
                    required
                    error={!!errors.nombre}
                    helperText={errors.nombre || 'Solo letras, espacios y acentos.'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaUser style={{ color: errors.nombre ? colors.error : colors.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={formStyles.textField}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno"
                    name="aPaterno"
                    value={formData.aPaterno}
                    onChange={handleChange}
                    required
                    error={!!errors.aPaterno}
                    helperText={errors.aPaterno || 'Solo letras, espacios y acentos.'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaUser style={{ color: errors.aPaterno ? colors.error : colors.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={formStyles.textField}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Apellido Materno"
                    name="aMaterno"
                    value={formData.aMaterno}
                    onChange={handleChange}
                    required
                    error={!!errors.aMaterno}
                    helperText={errors.aMaterno || 'Solo letras, espacios y acentos.'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaUser style={{ color: errors.aMaterno ? colors.error : colors.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={formStyles.textField}
                  />
                </Grid>

                {/* Género y Fecha de Nacimiento */}
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    required
                    error={!!errors.genero}
                    sx={formStyles.select}
                  >
                    <InputLabel>Género</InputLabel>
                    <Select
                      value={formData.genero}
                      onChange={handleChange}
                      label="Género"
                      name="genero"
                      startAdornment={
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <FaIdCard style={{ color: colors.primary }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Masculino">Masculino</MenuItem>
                      <MenuItem value="Femenino">Femenino</MenuItem>
                      <MenuItem value="Otro">Prefiero no decirlo</MenuItem>
                    </Select>
                    {errors.genero && (
                      <FormHelperText error>{errors.genero}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Campo de Fecha de Nacimiento */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    name="fechaNacimiento"
                    type="date"
                    inputProps={{
                      max: today,
                      style: {
                        fontSize: '1rem',
                        padding: '12px',
                        cursor: 'pointer'
                      }
                    }}
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required
                    error={!!errors.fechaNacimiento}
                    helperText={errors.fechaNacimiento || 'Selecciona tu fecha de nacimiento'}
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        fontSize: '1rem',
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaBirthdayCake style={{ color: errors.fechaNacimiento ? colors.error : colors.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={formStyles.textField}
                  />
                </Grid>

                {/* Mensaje de menor de edad */}
                {formData.fechaNacimiento && !formData.esMayorDeEdad && (
                  <Grid item xs={12}>
                    <Alert
                      severity="info"
                      icon={<InfoIcon sx={{ fontSize: '1.5rem' }} />}
                      sx={{
                        mt: 1,
                        borderRadius: '10px',
                        backgroundColor: alpha(colors.info, 0.1),
                        color: colors.text,
                        border: `1px solid ${alpha(colors.info, 0.2)}`,
                        '& .MuiAlert-icon': {
                          color: colors.info
                        },
                        '& .MuiAlert-message': {
                          padding: '8px 0'
                        },
                        animation: 'fadeIn 0.5s ease-in-out',
                        '@keyframes fadeIn': {
                          '0%': {
                            opacity: 0,
                            transform: 'translateY(-10px)'
                          },
                          '100%': {
                            opacity: 1,
                            transform: 'translateY(0)'
                          }
                        }
                      }}
                    >
                      Al ser menor de edad, necesitaremos los datos del tutor.
                    </Alert>
                  </Grid>
                )}

                {/* Campos del tutor */}
                {formData.fechaNacimiento && !formData.esMayorDeEdad && (
                  <>
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        sx={{
                          ...formStyles.heading,
                          mt: 2,
                          fontSize: '1.1rem',
                          '&:after': {
                            width: '30px',
                            height: '2px',
                          }
                        }}
                      >
                        Datos del Tutor
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl
                        fullWidth
                        required
                        error={!!errors.tipoTutor}
                        sx={formStyles.select}
                      >
                        <InputLabel>Tipo de Tutor</InputLabel>
                        <Select
                          value={formData.tipoTutor || ''}
                          onChange={handleChange}
                          label="Tipo de Tutor"
                          name="tipoTutor"
                          startAdornment={
                            <InputAdornment position="start" sx={{ mr: 1 }}>
                              <FaShieldAlt style={{ color: colors.primary }} />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="Madre">Madre</MenuItem>
                          <MenuItem value="Padre">Padre</MenuItem>
                          <MenuItem value="Abuelo/a">Abuelo/a</MenuItem>
                          <MenuItem value="Tío/a">Tío/a</MenuItem>
                          <MenuItem value="Hermano/a">Hermano/a</MenuItem>
                          <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                        {errors.tipoTutor && (
                          <FormHelperText error>{errors.tipoTutor}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    {formData.tipoTutor === 'Otro' && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Especificar tipo de tutor"
                          name="relacionTutor"
                          value={formData.relacionTutor || ''}
                          onChange={handleChange}
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]/g, '');
                          }}
                          required
                          error={!!errors.relacionTutor}
                          helperText={errors.relacionTutor || 'Ejemplo: Tío, Abuelo, etc.'}
                          sx={formStyles.textField}
                        />
                      </Grid>
                    )}

                    {/* Nombre del Tutor separado en campos */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nombre del Tutor"
                        name="nombreTutorNombre"
                        value={formData.nombreTutorNombre || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]/g, '');
                          handleChange({ ...e, target: { ...e.target, value } });
                          const nombreCompleto = `${value} ${formData.nombreTutorApellidos || ''}`.trim();
                          setFormData(prev => ({
                            ...prev,
                            nombreTutorNombre: value,
                            nombreTutor: nombreCompleto
                          }));
                        }}
                        required
                        error={!!errors.nombreTutorNombre}
                        helperText={errors.nombreTutorNombre || 'Ingresa el nombre'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FaUser style={{ color: errors.nombreTutorNombre ? colors.error : colors.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={formStyles.textField}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Apellidos del Tutor"
                        name="nombreTutorApellidos"
                        value={formData.nombreTutorApellidos || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^A-Za-zÀ-ÿ\u00f1\u00d1\u00e0-\u00fc\s]/g, '');
                          handleChange({ ...e, target: { ...e.target, value } });
                          const nombreCompleto = `${formData.nombreTutorNombre || ''} ${value}`.trim();
                          setFormData(prev => ({
                            ...prev,
                            nombreTutorApellidos: value,
                            nombreTutor: nombreCompleto
                          }));
                        }}
                        required
                        error={!!errors.nombreTutorApellidos}
                        helperText={errors.nombreTutorApellidos || 'Ingresa los apellidos'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FaUser style={{ color: errors.nombreTutorApellidos ? colors.error : colors.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={formStyles.textField}
                      />
                    </Grid>
                  </>
                )}

                {/* Lugar de Procedencia */}
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    required
                    error={!!errors.lugar}
                    sx={{
                      ...formStyles.select,
                      mt: 2
                    }}
                  >
                    <InputLabel>Lugar de Proveniencia</InputLabel>
                    <Select
                      value={formData.lugar || ''}
                      onChange={handleChange}
                      label="Lugar de Proveniencia"
                      name="lugar"
                      startAdornment={
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <FaMapMarkerAlt style={{ color: colors.primary }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Ixcatlan">Ixcatlan</MenuItem>
                      <MenuItem value="Tepemaxac">Tepemaxac</MenuItem>
                      <MenuItem value="Pastora">Pastora</MenuItem>
                      <MenuItem value="Ahuacatitla">Ahuacatitla</MenuItem>
                      <MenuItem value="Tepeica">Tepeica</MenuItem>
                      <MenuItem value="Axcaco">Axcaco</MenuItem>
                      <MenuItem value="Otro">Otro</MenuItem>
                    </Select>
                    {errors.lugar && <FormHelperText error>{errors.lugar}</FormHelperText>}
                  </FormControl>
                </Grid>

                {formData.lugar === 'Otro' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Especificar Lugar"
                      name="otroLugar"
                      value={formData.otroLugar}
                      onChange={handleChange}
                      required
                      error={!!errors.otroLugar}
                      helperText={errors.otroLugar || 'Escribe el lugar específico'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaMapMarkerAlt style={{ color: errors.otroLugar ? colors.error : colors.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={formStyles.textField}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {/* Información importante sobre métodos de contacto */}
                <Grid item xs={12}>
                  <Alert
                    severity="info"
                    icon={<InfoIcon />}
                    sx={{
                      borderRadius: '8px',
                      mb: 3,
                      backgroundColor: alpha(colors.info, 0.08),
                      color: colors.text,
                      border: `1px solid ${alpha(colors.info, 0.2)}`,
                      '& .MuiAlert-icon': {
                        color: colors.info
                      }
                    }}
                  >
                    <AlertTitle sx={{ fontWeight: 600 }}>Información importante</AlertTitle>
                    Es recomendable proporcionar al menos un método de contacto (correo electrónico o teléfono) para poder
                    recibir notificaciones y comunicaciones importantes sobre su atención médica.
                  </Alert>
                </Grid>

                {/* Error si no tiene ni email ni teléfono */}
                {errors.contactError && (
                  <Grid item xs={12}>
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: '8px',
                        mb: 2,
                        backgroundColor: alpha(colors.error, 0.08),
                        color: colors.text,
                        border: `1px solid ${alpha(colors.error, 0.2)}`,
                        '& .MuiAlert-icon': {
                          color: colors.error
                        }
                      }}
                    >
                      {errors.contactError}
                    </Alert>
                  </Grid>
                )}

                {/* Sección de Verificación de Email */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={formStyles.heading}
                  >
                    Información de Contacto
                  </Typography>
                </Grid>

                {/* Campo de Email y Botones */}
                <Grid item xs={12}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'flex-start' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      name="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setIsEmailSent(false);
                        setIsEmailVerified(false);
                        setIsVerifiedComplete(false);
                      }}
                      required={!formData.noTieneEmail}
                      error={!!errors.email || !!emailVerificationError}
                      helperText={errors.email || emailVerificationError}
                      disabled={!isEmailEditable || formData.noTieneEmail}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaEnvelope style={{ color: (errors.email || emailVerificationError) ? colors.error : colors.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={formStyles.textField}
                    />

                    {!isEmailVerified && !formData.noTieneEmail && (
                      <Button
                        variant="contained"
                        onClick={handleVerifyEmail}
                        disabled={isVerifyingEmail || isVerifiedComplete || isEmailSent || formData.noTieneEmail}
                        sx={{
                          ...formStyles.button.primary,
                          minWidth: '150px',
                          height: '56px'
                        }}
                      >
                        {isVerifiedComplete ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaCheckCircle /> Verificado
                          </Box>
                        ) : isVerifyingEmail ? (
                          <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
                        ) : isEmailSent ? (
                          'Correo Enviado'
                        ) : (
                          'Verificar Correo'
                        )}
                      </Button>
                    )}
                  </Box>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.noTieneEmail}
                        onChange={handleChange}
                        name="noTieneEmail"
                        sx={{
                          color: colors.primary,
                          '&.Mui-checked': {
                            color: colors.primary,
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        No tengo correo electrónico
                      </Typography>
                    }
                    sx={{ mt: 1 }}
                  />
                </Grid>

                {/* Código de Verificación */}
                {isEmailSent && !isEmailVerified && !formData.noTieneEmail && (
                  <Grid item xs={12}>
                    <Box sx={{
                      bgcolor: alpha(colors.primary, 0.05),
                      p: 3,
                      borderRadius: '12px',
                      border: `1px solid ${alpha(colors.primary, 0.1)}`
                    }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, color: colors.primary, fontWeight: 500 }}>
                        Ingresa el código de verificación enviado a tu correo
                      </Typography>

                      <TextField
                        fullWidth
                        label="Código de verificación"
                        name="verificationToken"
                        value={formData.verificationToken}
                        onChange={(e) => setFormData({ ...formData, verificationToken: e.target.value })}
                        required
                        error={!!errors.verificationToken}
                        helperText={errors.verificationToken}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FaLock style={{ color: errors.verificationToken ? colors.error : colors.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={formStyles.textField}
                      />

                      <Box sx={{
                        display: 'flex',
                        gap: 2,
                        mt: 3,
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}>
                        <Button
                          variant="contained"
                          onClick={handleVerifyToken}
                          sx={formStyles.button.primary}
                        >
                          Validar Código
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={() => setShowChangeEmailConfirmation(true)}
                          sx={formStyles.button.secondary}
                        >
                          Cambiar correo
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Campo de teléfono con formato personalizado */}
                <Grid item xs={12}>
                  <PhoneDigitInput
                    error={!!errors.telefono}
                    helperText={errors.telefono}
                  />
                </Grid>



                {/* Sección de Alergias */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      ...formStyles.heading,
                      mt: 4
                    }}
                  >
                    Información de Salud
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: colors.primary }}>
                    Información Médica
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Alergias */}
                    <Grid item xs={12} md={6}>
                      <FormControl
                        fullWidth
                        error={!!errors.alergias}
                        sx={{
                          ...formStyles.select,
                          mb: 1
                        }}
                      >
                        <InputLabel>Alergias</InputLabel>
                        <Select
                          multiple
                          value={formData.alergias || []}
                          onChange={(e) => {
                            const { value } = e.target;

                            // Si seleccionas "NingunaAlergia", deselecciona todas las demás alergias
                            if (value.includes('NingunaAlergia')) {
                              setFormData({
                                ...formData,
                                alergias: ['NingunaAlergia'],
                                otraAlergia: ''
                              });
                            } else {
                              // Remover "NingunaAlergia" si se seleccionan otras alergias
                              setFormData({
                                ...formData,
                                alergias: (typeof value === 'string') ? value.split(',') : value.filter(alergia => alergia !== 'NingunaAlergia')
                              });
                            }
                          }}
                          label="Alergias"
                          name="alergias"
                          renderValue={(selected) => {
                            if (selected.includes('NingunaAlergia')) return 'Ninguna alergia';
                            if (selected.length === 0) return 'Seleccione alergias';

                            return selected.map(val => {
                              if (val === 'Otro') return formData.otraAlergia || 'Otra alergia';
                              return val;
                            }).join(', ');
                          }}
                        >
                          <MenuItem value="NingunaAlergia">
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%'
                            }}>
                              <Typography>Ninguna alergia</Typography>
                              {formData.alergias?.includes('NingunaAlergia') ? (
                                <FaCheckCircle style={{ color: colors.primary }} />
                              ) : (
                                <FaPlusCircle style={{ color: colors.textSecondary, opacity: 0.6 }} />
                              )}
                            </Box>
                          </MenuItem>

                          <Divider sx={{ my: 1 }} />

                          {Object.entries(alergiasInfo).filter(([k]) => k !== 'Ninguna').map(([alergia, info]) => (
                            <MenuItem
                              key={alergia}
                              value={alergia}
                              disabled={formData.alergias?.includes('NingunaAlergia')}
                            >
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography>{alergia}</Typography>
                                  {info && (
                                    <Tooltip title={info} arrow placement="right">
                                      <IconButton size="small" sx={{ ml: 1, color: colors.textSecondary, p: 0.2 }}>
                                        <FaInfoCircle size={12} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                                {formData.alergias?.includes(alergia) ? (
                                  <FaCheckCircle style={{ color: colors.primary }} />
                                ) : (
                                  <FaPlusCircle style={{ color: colors.textSecondary, opacity: 0.6 }} />
                                )}
                              </Box>
                            </MenuItem>
                          ))}

                          <MenuItem
                            value="Otro"
                            disabled={formData.alergias?.includes('NingunaAlergia')}
                          >
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%'
                            }}>
                              <Typography>Otra alergia</Typography>
                              {formData.alergias?.includes('Otro') ? (
                                <FaCheckCircle style={{ color: colors.primary }} />
                              ) : (
                                <FaPlusCircle style={{ color: colors.textSecondary, opacity: 0.6 }} />
                              )}
                            </Box>
                          </MenuItem>
                        </Select>
                        {errors.alergias && (
                          <FormHelperText error>{errors.alergias}</FormHelperText>
                        )}
                      </FormControl>

                      {/* Campo para especificar otra alergia */}
                      {formData.alergias?.includes('Otro') && (
                        <TextField
                          fullWidth
                          label="Especificar Alergia"
                          name="otraAlergia"
                          value={formData.otraAlergia || ''}
                          onChange={handleChange}
                          required
                          error={!!errors.otraAlergia}
                          helperText={errors.otraAlergia}
                          size="small"
                          sx={{
                            ...formStyles.textField,
                            mb: 2
                          }}
                        />
                      )}
                    </Grid>

                    {/* Condiciones médicas */}
                    <Grid item xs={12} md={6}>
                      <FormControl
                        fullWidth
                        error={!!errors.condicionesMedicas}
                        sx={formStyles.select}
                      >
                        <InputLabel>Condiciones médicas</InputLabel>
                        <Select
                          multiple
                          value={formData.condicionesMedicas || []}
                          onChange={(e) => {
                            const { value } = e.target;

                            // Si seleccionas "NingunaCondicion", limpiar otras condiciones
                            if (value.includes('NingunaCondicion')) {
                              setFormData({
                                ...formData,
                                condicionesMedicas: ['NingunaCondicion'],
                                otraCondicion: ''
                              });
                            } else {
                              // Filtrar condiciones seleccionadas
                              const condicionesSeleccionadas = typeof value === 'string'
                                ? value.split(',')
                                : value.filter(c => c !== 'NingunaCondicion');

                              setFormData({
                                ...formData,
                                condicionesMedicas: condicionesSeleccionadas
                              });
                            }
                          }}
                          label="Condiciones médicas"
                          name="condicionesMedicas"
                          renderValue={(selected) => {
                            if (selected.includes('NingunaCondicion')) return 'Ninguna condición médica';
                            if (selected.length === 0) return 'Seleccione condiciones';

                            return selected.map(val => {
                              if (val === 'OtraCondicion') return formData.otraCondicion || 'Otra condición';
                              const condition = condicionesMedicas.find(c => c.value === val);
                              return condition ? condition.label : val;
                            }).join(', ');
                          }}
                        >
                          <MenuItem value="NingunaCondicion">
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%'
                            }}>
                              <Typography>Ninguna condición médica</Typography>
                              {formData.condicionesMedicas?.includes('NingunaCondicion') ? (
                                <FaCheckCircle style={{ color: colors.primary }} />
                              ) : (
                                <FaPlusCircle style={{ color: colors.textSecondary, opacity: 0.6 }} />
                              )}
                            </Box>
                          </MenuItem>

                          <Divider sx={{ my: 1 }} />

                          {condicionesMedicas.filter(c => c.value !== 'Ninguna').map((condicion) => (
                            <MenuItem
                              key={condicion.value}
                              value={condicion.value}
                              disabled={formData.condicionesMedicas?.includes('NingunaCondicion')}
                            >
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography>{condicion.label}</Typography>
                                  {condicion.info && (
                                    <Tooltip title={condicion.info} arrow>
                                      <IconButton size="small" sx={{ ml: 1, color: colors.textSecondary, p: 0.2 }}>
                                        <FaInfoCircle size={12} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                                {formData.condicionesMedicas?.includes(condicion.value) ? (
                                  <FaCheckCircle style={{ color: colors.primary }} />
                                ) : (
                                  <FaPlusCircle style={{ color: colors.textSecondary, opacity: 0.6 }} />
                                )}
                              </Box>
                            </MenuItem>
                          ))}

                          <MenuItem
                            value="OtraCondicion"
                            disabled={formData.condicionesMedicas?.includes('NingunaCondicion')}
                          >
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%'
                            }}>
                              <Typography>Otra condición médica</Typography>
                              {formData.condicionesMedicas?.includes('OtraCondicion') ? (
                                <FaCheckCircle style={{ color: colors.primary }} />
                              ) : (
                                <FaPlusCircle style={{ color: colors.textSecondary, opacity: 0.6 }} />
                              )}
                            </Box>
                          </MenuItem>
                        </Select>
                        {errors.condicionesMedicas && (
                          <FormHelperText error>{errors.condicionesMedicas}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Campo para especificar otra condición médica */}
                    {formData.condicionesMedicas?.includes('OtraCondicion') && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Especificar condición médica"
                          name="otraCondicion"
                          value={formData.otraCondicion || ''}
                          onChange={handleChange}
                          required
                          error={!!errors.otraCondicion}
                          helperText={errors.otraCondicion || 'Por favor, especifique la condición médica'}
                          size="small"
                          sx={formStyles.textField}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Modal de Confirmación */}
              <Modal
                open={showChangeEmailConfirmation}
                onClose={() => setShowChangeEmailConfirmation(false)}
              >
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: 400,
                  bgcolor: colors.paper,
                  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
                  p: 4,
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`
                }}>
                  <Typography variant="h6" sx={{ mb: 2, color: colors.primary, fontWeight: 600 }}>
                    Cambiar correo electrónico
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 3, color: colors.text }}>
                    ¿Estás seguro de que deseas cambiar el correo? Esto invalidará el código enviado anteriormente.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowChangeEmailConfirmation(false)}
                      sx={formStyles.button.secondary}
                    >
                      Cancelar
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleEmailChange}
                      sx={formStyles.button.primary}
                    >
                      Sí, cambiar correo
                    </Button>
                  </Box>
                </Box>
              </Modal>
            </Box>
          </motion.div>
        );
      case 2: // Revisar datos
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                    color: colors.primary
                  }}>
                    <FaClipboardCheck size={24} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        m: 0
                      }}
                    >
                      Revisa tu información
                    </Typography>
                  </Box>

                  <Alert
                    severity="info"
                    sx={{
                      mb: 4,
                      borderRadius: '8px',
                      backgroundColor: alpha(colors.info, 0.08),
                      color: colors.text,
                      border: `1px solid ${alpha(colors.info, 0.2)}`,
                      '& .MuiAlert-icon': {
                        color: colors.info
                      }
                    }}
                  >
                    Por favor, verifica que toda la información sea correcta antes de continuar.
                  </Alert>
                </Grid>

                {/* Sección Datos Personales */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: '12px',
                      backgroundColor: alpha(colors.paper, 0.6),
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        pb: 1,
                        borderBottom: `1px solid ${colors.border}`
                      }}
                    >
                      <FaUser /> Datos Personales
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            mb: 0.5
                          }}
                        >
                          Nombre completo
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: colors.text
                          }}
                        >
                          {`${formData.nombre} ${formData.aPaterno} ${formData.aMaterno}`}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            mb: 0.5
                          }}
                        >
                          Género
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: colors.text
                          }}
                        >
                          {formData.genero || 'No especificado'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            mb: 0.5
                          }}
                        >
                          Fecha de Nacimiento
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: colors.text
                          }}
                        >
                          {formData.fechaNacimiento
                            ? parseFechaLocal(formData.fechaNacimiento).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                            : 'No especificada'
                          }
                          {formData.fechaNacimiento && ` (${getEdad(formData.fechaNacimiento)})`}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            mb: 0.5
                          }}
                        >
                          Lugar de Proveniencia
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: colors.text
                          }}
                        >
                          {formData.lugar === 'Otro'
                            ? formData.otroLugar
                            : formData.lugar || 'No especificado'}
                        </Typography>
                      </Grid>

                      {!formData.esMayorDeEdad && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.textSecondary,
                              mb: 0.5,
                              fontWeight: 500
                            }}
                          >
                            Información del Tutor
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: colors.textSecondary,
                                  mb: 0.5
                                }}
                              >
                                Tipo de Tutor
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  color: colors.text
                                }}
                              >
                                {formData.tipoTutor === 'Otro'
                                  ? formData.relacionTutor
                                  : formData.tipoTutor || 'No especificado'}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: colors.textSecondary,
                                  mb: 0.5
                                }}
                              >
                                Nombre del Tutor
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  color: colors.text
                                }}
                              >
                                {formData.nombreTutor || 'No especificado'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>

                {/* Sección Información de Contacto */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: '12px',
                      backgroundColor: alpha(colors.paper, 0.6),
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        pb: 1,
                        borderBottom: `1px solid ${colors.border}`
                      }}
                    >
                      <FaEnvelope /> Información de Contacto
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            mb: 0.5
                          }}
                        >
                          Correo Electrónico
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: formData.noTieneEmail ? colors.warning : colors.text,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {formData.noTieneEmail
                            ? (
                              <>
                                <FaExclamationTriangle size={16} />
                                No proporcionado
                              </>
                            )
                            : (
                              <>
                                {formData.email || 'No especificado'}
                                {isEmailVerified && (
                                  <Tooltip title="Correo verificado">
                                    <VerifiedUser sx={{ fontSize: 18, color: colors.success }} />
                                  </Tooltip>
                                )}
                              </>
                            )
                          }
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            mb: 0.5
                          }}
                        >
                          Teléfono
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: formData.noTieneTelefono ? colors.warning : colors.text,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {formData.noTieneTelefono
                            ? (
                              <>
                                <FaExclamationTriangle size={16} />
                                No proporcionado
                              </>
                            )
                            : (
                              formData.telefono
                                ? `${formData.telefono.substring(0, 3)}-${formData.telefono.substring(3, 6)}-${formData.telefono.substring(6, 8)}-${formData.telefono.substring(8, 10)}`
                                : 'No especificado'
                            )
                          }
                        </Typography>
                      </Grid>
                    </Grid>

                    {(formData.noTieneEmail || formData.noTieneTelefono) && (
                      <Alert
                        severity="warning"
                        sx={{
                          mt: 2,
                          borderRadius: '8px',
                          backgroundColor: alpha(colors.warning, 0.08),
                          color: colors.text,
                          border: `1px solid ${alpha(colors.warning, 0.2)}`,
                          '& .MuiAlert-icon': {
                            color: colors.warning
                          }
                        }}
                      >
                        <AlertTitle sx={{ fontWeight: 600 }}>Información de contacto limitada</AlertTitle>
                        <Typography variant="body2">
                          Tener información de contacto completa es importante para notificaciones sobre citas y tratamientos.
                          Si es posible, considere proporcionar ambos métodos de contacto en el futuro.
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => setShowContactDialog(true)}
                          startIcon={<ContactSupport />}
                          sx={{
                            ...formStyles.button.secondary,
                            mt: 1,
                            backgroundColor: alpha(colors.warning, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(colors.warning, 0.2)
                            }
                          }}
                        >
                          Más información
                        </Button>
                      </Alert>
                    )}
                  </Paper>
                </Grid>

                {/* Sección Información de Salud */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: '12px',
                      backgroundColor: alpha(colors.paper, 0.6),
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        pb: 1,
                        borderBottom: `1px solid ${colors.border}`
                      }}
                    >
                      <FaShieldAlt /> Información de Salud
                    </Typography>

                    {/* Sección de Alergias */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        mb: 0.5
                      }}
                    >
                      Alergias
                    </Typography>

                    {formData.alergias && formData.alergias.length > 0 ? (
                      <Box sx={{ mt: 1, mb: 3 }}>
                        {formData.alergias.map((alergia, index) => (
                          <Chip
                            key={index}
                            label={alergia === 'Otro' ? formData.otraAlergia : alergia}
                            sx={{
                              m: 0.5,
                              backgroundColor: alergia === 'NingunaAlergia'
                                ? alpha(colors.success, 0.1)
                                : alpha(colors.primary, 0.1),
                              color: alergia === 'NingunaAlergia'
                                ? colors.success
                                : colors.primary,
                              fontWeight: 500
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: colors.text,
                          mb: 3
                        }}
                      >
                        No especificadas
                      </Typography>
                    )}

                    {/* Sección de Condiciones Médicas */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        mb: 0.5
                      }}
                    >
                      Condiciones Médicas
                    </Typography>

                    {formData.condicionesMedicas && formData.condicionesMedicas.length > 0 ? (
                      <Box sx={{ mt: 1 }}>
                        {formData.condicionesMedicas.map((condicion, index) => {
                          // Determinar la etiqueta a mostrar
                          let label;
                          if (condicion === 'NingunaCondicion') {
                            label = 'Ninguna condición médica';
                          } else if (condicion === 'OtraCondicion') {
                            label = formData.otraCondicion || 'Otra condición';
                          } else {
                            // Buscar el label en el array de condicionesMedicas
                            const foundCondition = condicionesMedicas.find(c => c.value === condicion);
                            label = foundCondition ? foundCondition.label : condicion;
                          }

                          return (
                            <Chip
                              key={index}
                              label={label}
                              sx={{
                                m: 0.5,
                                backgroundColor: condicion === 'NingunaCondicion'
                                  ? alpha(colors.success, 0.1)
                                  : alpha(colors.primary, 0.1),
                                color: condicion === 'NingunaCondicion'
                                  ? colors.success
                                  : colors.primary,
                                fontWeight: 500
                              }}
                            />
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: colors.text
                        }}
                      >
                        No especificadas
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Modal de información de contacto */}
              <Modal
                open={showContactDialog}
                onClose={() => setShowContactDialog(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                  timeout: 500,
                }}
              >
                <Fade in={showContactDialog}>
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 500,
                    bgcolor: colors.paper,
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    p: 4,
                    outline: 'none',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, mb: 2 }}>
                      Importancia de la información de contacto
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 2, color: colors.text }}>
                      Para ofrecerle la mejor atención posible, es importante que podamos comunicarnos con usted para:
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            minWidth: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.primary,
                            mt: 0.3
                          }}
                        >
                          1
                        </Box>
                        <Typography variant="body1" sx={{ color: colors.text }}>
                          Recordarle sus citas programadas y posibles cambios
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            minWidth: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.primary,
                            mt: 0.3
                          }}
                        >
                          2
                        </Box>
                        <Typography variant="body1" sx={{ color: colors.text }}>
                          Enviarle información importante sobre su tratamiento
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            minWidth: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.primary,
                            mt: 0.3
                          }}
                        >
                          3
                        </Box>
                        <Typography variant="body1" sx={{ color: colors.text }}>
                          Contactarlo en caso de emergencias o situaciones imprevistas
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 3, color: colors.text }}>
                      Sin un método de contacto, podría perderse información importante relacionada con su atención médica.
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowContactDialog(false)}
                        sx={formStyles.button.secondary}
                      >
                        Entendido
                      </Button>

                      <Button
                        variant="contained"
                        component={RouterLink}
                        to="/Contact"
                        sx={formStyles.button.primary}
                      >
                        Contactar soporte
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              </Modal>
            </Box>
          </motion.div>
        );
      case 3: // Crear contraseña
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              <Grid container spacing={3}>
                {/* Título */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={formStyles.heading}
                  >
                    Configura tu Contraseña
                  </Typography>
                </Grid>

                {/* Campo Contraseña */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value !== formData.confirmPassword) {
                        setErrors(prev => ({
                          ...prev,
                          confirmPassword: 'Las contraseñas no coinciden',
                        }));
                      } else {
                        setErrors(prev => ({
                          ...prev,
                          confirmPassword: '',
                        }));
                      }
                    }}
                    required
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaLock style={{ color: errors.password ? colors.error : colors.primary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            sx={{ color: colors.primary }}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={formStyles.textField}
                  />
                </Grid>

                {/* Campo Confirmar Contraseña */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value !== formData.password) {
                        setErrors(prev => ({
                          ...prev,
                          confirmPassword: 'Las contraseñas no coinciden',
                        }));
                      } else {
                        setErrors(prev => ({
                          ...prev,
                          confirmPassword: '',
                        }));
                      }
                    }}
                    required
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaLock style={{ color: errors.confirmPassword ? colors.error : colors.primary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            sx={{ color: colors.primary }}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={formStyles.textField}
                  />
                </Grid>

                {/* Mensajes de Estado y Seguridad */}
                <Grid item xs={12}>
                  {passwordError && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 2,
                        borderRadius: '10px',
                        backgroundColor: alpha(colors.error, isDarkTheme ? 0.2 : 0.1),
                        color: colors.text,
                        border: `1px solid ${alpha(colors.error, 0.3)}`,
                        '& .MuiAlert-icon': {
                          color: colors.error
                        }
                      }}
                    >
                      {passwordError}
                    </Alert>
                  )}

                  {isPasswordFiltered && (
                    <Alert
                      severity="warning"
                      sx={{
                        mb: 2,
                        borderRadius: '10px',
                        backgroundColor: alpha(colors.warning, isDarkTheme ? 0.2 : 0.1),
                        color: colors.text,
                        border: `1px solid ${alpha(colors.warning, 0.3)}`,
                        '& .MuiAlert-icon': {
                          color: colors.warning
                        }
                      }}
                    >
                      Contraseña filtrada. Por favor, elige otra.
                    </Alert>
                  )}

                  {isPasswordSafe && !isPasswordFiltered && (
                    <Alert
                      icon={<FaCheckCircle />}
                      severity="success"
                      sx={{
                        mb: 2,
                        borderRadius: '10px',
                        backgroundColor: alpha(colors.success, isDarkTheme ? 0.2 : 0.1),
                        color: colors.text,
                        border: `1px solid ${alpha(colors.success, 0.3)}`,
                        '& .MuiAlert-icon': {
                          color: colors.success
                        }
                      }}
                    >
                      Contraseña segura
                    </Alert>
                  )}
                </Grid>

                {/* Indicador de Fortaleza */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1
                    }}>
                      <Typography
                        variant="body2"
                        color={colors.textSecondary}
                      >
                        Fortaleza de la contraseña
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getPasswordStrengthColor(),
                          fontWeight: 600
                        }}
                      >
                        {getPasswordStrengthText()}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        height: '8px',
                        bgcolor: alpha(colors.textSecondary, 0.1),
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(passwordStrength / 4) * 100}%`,
                          bgcolor: getPasswordStrengthColor(),
                          transition: 'all 0.3s ease',
                          borderRadius: '4px'
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color={colors.textSecondary}>
                      Tu contraseña debe tener:
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: colors.textSecondary
                          }} />
                          <Typography variant="body2" color={colors.textSecondary}>
                            Al menos 8 caracteres
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: colors.textSecondary
                          }} />
                          <Typography variant="body2" color={colors.textSecondary}>
                            Al menos una letra mayúscula
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: colors.textSecondary
                          }} />
                          <Typography variant="body2" color={colors.textSecondary}>
                            Al menos un número
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: colors.textSecondary
                          }} />
                          <Typography variant="body2" color={colors.textSecondary}>
                            Al menos un símbolo especial
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Términos y condiciones */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: alpha(colors.primary, 0.05),
                      borderRadius: '12px',
                      mt: 2,
                      border: `1px solid ${alpha(colors.primary, 0.1)}`
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allAccepted}
                          onChange={handleAcceptChange}
                          name="acceptAll"
                          sx={{
                            color: colors.primary,
                            '&.Mui-checked': {
                              color: colors.primary,
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          Al registrarte, confirmas que estás de acuerdo con nuestros{' '}
                          <Link
                            component="span"
                            onClick={handleOpenTermsModal}
                            sx={{
                              cursor: 'pointer',
                              color: colors.primary,
                              textDecoration: 'none',
                              borderBottom: `1px dashed ${colors.primary}`,
                              '&:hover': {
                                borderBottom: `1px solid ${colors.primary}`,
                              }
                            }}
                          >
                            términos y condiciones
                          </Link>
                          {' '}y que entiendes nuestra{' '}
                          <Link
                            component="span"
                            onClick={handleOpenPrivacyModal}
                            sx={{
                              cursor: 'pointer',
                              color: colors.primary,
                              textDecoration: 'none',
                              borderBottom: `1px dashed ${colors.primary}`,
                              '&:hover': {
                                borderBottom: `1px solid ${colors.primary}`,
                              }
                            }}
                          >
                            política de privacidad
                          </Link>.
                        </Typography>
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        );
      default:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4
            }}
          >
            <Typography
              variant="h6"
              color="error"
              sx={{ mb: 2 }}
            >
              Ha ocurrido un error
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
            >
              Paso no reconocido en el formulario
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={formStyles.button.primary}
            >
              Reiniciar Formulario
            </Button>
          </Box>
        );
    }
  };

  return (
    <ErrorBoundary>
      <Box
        sx={{
          minHeight: '100vh',
          background: isDarkTheme
            ? `linear-gradient(135deg, ${colors.background} 0%, ${alpha(colors.paper, 0.7)} 100%)`
            : `linear-gradient(135deg, ${colors.background} 0%, ${colors.secondary} 100%)`,
          py: { xs: 4, md: 6 },
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Botón Regresar con animación */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <IconButton
            component={RouterLink}
            to="/"
            sx={{
              position: 'absolute',
              top: { xs: 10, md: 20 },
              left: { xs: 10, md: 20 },
              color: colors.primary,
              bgcolor: `${alpha(colors.primary, 0.1)}`,
              zIndex: 10,
              padding: { xs: '8px', sm: '12px' },
              '&:hover': {
                bgcolor: `${alpha(colors.primary, 0.2)}`
              }
            }}
          >
            <ArrowBack />
            <Typography
              sx={{
                ml: 1,
                color: colors.primary,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Regresar
            </Typography>
          </IconButton>
        </motion.div>

        <Container maxWidth="md">
          <Notificaciones
            open={openNotification}
            message={notificationMessage}
            type={notificationType}
            handleClose={handleCloseNotification}
          />

          <Card
            elevation={0}
            sx={{
              ...formStyles.card,
              overflow: 'visible',
              position: 'relative'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Logo y título */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: colors.primary,
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 700,
                      fontSize: { xs: '1.75rem', sm: '2.25rem' },
                      position: 'relative',
                      display: 'inline-block',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60px',
                        height: '4px',
                        backgroundColor: colors.primary,
                        borderRadius: '4px'
                      }
                    }}
                  >
                    Registro
                  </Typography>
                </motion.div>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 3,
                    color: colors.textSecondary,
                    maxWidth: '500px',
                    mx: 'auto'
                  }}
                >
                  Completa el formulario para crear tu cuenta. El proceso es simple y seguro.
                </Typography>
              </Box>

              {/* Stepper personalizado */}
              <Box sx={{ mb: 5, px: { xs: 0, sm: 3 }, position: 'relative' }}>
                <Stepper
                  activeStep={activeStep}
                  connector={<CustomStepConnector />}
                  sx={{
                    '& .MuiStepLabel-iconContainer': {
                      p: 0,
                      pr: 2
                    },
                    '& .MuiStepLabel-labelContainer': {
                      width: isMobile ? 'auto' : 'auto',
                      color: 'red'
                    }
                  }}
                >
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconComponent={() => <CustomStepIcon active={activeStep === index} completed={activeStep > index} icon={index + 1} />}
                      >
                        {!isMobile && (
                          <Typography
                            sx={{
                              color: activeStep === index ? colors.primary : colors.textSecondary,
                              fontWeight: activeStep === index ? 600 : 400,
                              fontSize: '0.9rem'
                            }}
                          >
                            {label}
                          </Typography>
                        )}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {getStepContent(activeStep)}
                </AnimatePresence>

                <Box sx={{ mt: 4 }}>
                  {/* Box para los botones */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: activeStep === 0 ? 'flex-end' : 'space-between',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2
                    }}
                  >
                    {activeStep !== 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: isMobile ? '100%' : 'auto' }}
                      >
                        <Button
                          onClick={handleBack}
                          sx={{
                            ...formStyles.button.secondary,
                            width: isMobile ? '100%' : 'auto'
                          }}
                          variant="outlined"
                          disabled={isLoading}
                          startIcon={<Box sx={{ transform: 'rotate(180deg)' }}>→</Box>}
                        >
                          Regresar
                        </Button>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: isMobile ? '100%' : 'auto' }}
                    >
                      <Button
                        variant="contained"
                        type={activeStep === steps.length - 1 ? "submit" : "button"}
                        onClick={activeStep === steps.length - 1 ? undefined : handleNext}
                        disabled={
                          isLoading ||
                          isSubmitting ||
                          (activeStep === steps.length - 1 && !allAccepted) ||
                          (activeStep === 1 && !isEmailVerified && !formData.noTieneEmail)
                        }
                        sx={{
                          ...formStyles.button.primary,
                          width: isMobile ? '100%' : 'auto'
                        }}
                        endIcon={activeStep !== steps.length - 1 ? '→' : null}
                      >
                        {(isLoading || isSubmitting) ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <CircularProgress
                              size={20}
                              sx={{
                                color: 'white',
                                animation: 'spin 1s linear infinite',
                                '@keyframes spin': {
                                  '0%': { transform: 'rotate(0deg)' },
                                  '100%': { transform: 'rotate(360deg)' }
                                }
                              }}
                            />
                            <span>Procesando...</span>
                          </Box>
                        ) : (
                          activeStep === steps.length - 1 ? 'Completar Registro' : 'Siguiente'
                        )}
                      </Button>
                    </motion.div>
                  </Box>
                </Box>

                {/* Modales de Privacy y Terms */}
                <Modal
                  open={openPrivacyModal || openTermsModal}
                  onClose={openPrivacyModal ? handleClosePrivacyModal : handleCloseTermsModal}
                >
                  <Box
                    sx={{
                      width: '90%',
                      maxWidth: 600,
                      maxHeight: '85vh',
                      bgcolor: colors.paper,
                      p: { xs: 3, sm: 4 },
                      m: 'auto',
                      mt: '5vh',
                      borderRadius: '16px',
                      overflowY: 'auto',
                      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: colors.primary,
                        fontWeight: 600,
                        mb: 3,
                        pb: 2,
                        borderBottom: `2px solid ${colors.border}`
                      }}
                    >
                      {openPrivacyModal ? 'Políticas de Privacidad' : 'Términos y Condiciones'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: colors.text,
                        whiteSpace: 'pre-line',
                        lineHeight: 1.7
                      }}
                    >
                      {openPrivacyModal ? privacyPolicy : termsConditions}
                    </Typography>
                    <Button
                      onClick={openPrivacyModal ? handleClosePrivacyModal : handleCloseTermsModal}
                      sx={{
                        ...formStyles.button.primary,
                        mt: 3,
                        py: 1.5
                      }}
                      variant="contained"
                      fullWidth
                    >
                      Cerrar
                    </Button>
                  </Box>
                </Modal>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default Register;