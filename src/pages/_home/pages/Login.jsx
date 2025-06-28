import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    Tab,
    Tabs,
    Fade,
    useMediaQuery,
    Grow,
    Divider,
    Tooltip,
    useTheme,
    Slide,
    Stack,
    OutlinedInput,
    InputBase
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

// Importación de iconos
import {
    ArrowBack,
    CheckCircle,
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    MedicalServices,
    CalendarToday,
    FolderSpecial,
    Notifications,
    AttachMoney,
    ArrowForward,
    Phone,
    Help,
    Info,
    Security,
    Fingerprint,
    Login as LoginIcon
} from '@mui/icons-material';

// Librerías adicionales
import { motion, AnimatePresence } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaTooth } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const Login = () => {
    // Estados del formulario
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' o 'phone'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: ['', '', '', '', '', '', '', '', '', ''] // Array para 10 dígitos individuales
    });

    // Estados para manejo de errores y validación
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        phone: '',
        general: ''
    });

    // Estados para control de UI y animaciones
    const [captchaValue, setCaptchaValue] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [openNotification, setOpenNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationSeverity, setNotificationSeverity] = useState('success');
    const [isLoading, setIsLoading] = useState(false);
    const [isCaptchaLocked, setIsCaptchaLocked] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [loginAttempt, setLoginAttempt] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false); // Para controlar si ya se envió código
    const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Para mostrar el dialog de confirmación

    // Referencias para los inputs de teléfono
    const phoneInputRefs = useRef([]);
    for (let i = 0; i < 10; i++) {
        if (!phoneInputRefs.current[i]) {
            phoneInputRefs.current[i] = React.createRef();
        }
    }

    // Estados para verificación
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [resendTimer, setResendTimer] = useState(0);

    // Referencias y hooks
    const recaptchaRef = useRef(null);
    const navigate = useNavigate();
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Colores dinámicos basados en el tema
    const colors = {
        primary: isDarkTheme ? '#81D4FA' : '#0052A3',
        primaryDark: isDarkTheme ? '#0288D1' : '#003B7A',
        primaryLight: isDarkTheme ? '#4FC3F7' : '#2979FF',
        secondary: isDarkTheme ? '#E1F5FE' : '#F5F9FF',
        text: isDarkTheme ? '#E1F5FE' : '#1A2027',
        textSecondary: isDarkTheme ? '#B0BEC5' : '#607D8B',
        background: isDarkTheme ? '#1C2A38' : '#F5F9FF',
        paper: isDarkTheme ? '#2a3649' : '#ffffff',
        border: isDarkTheme ? 'rgba(176, 190, 197, 0.3)' : 'rgba(27, 42, 58, 0.2)',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336'
    };

    // Manejo de notificaciones con tiempo de expiración
    useEffect(() => {
        if (openNotification) {
            let duration = notificationSeverity === 'error' ? 5000 : 3000;
            if (notificationMessage.includes('Cuenta bloqueada')) {
                duration = 6000;
            }

            const timer = setTimeout(() => {
                setOpenNotification(false);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [openNotification, notificationMessage, notificationSeverity]);

    // Eliminar mensaje de error general después de 5 segundos
    useEffect(() => {
        if (errors.general) {
            const timer = setTimeout(() => {
                setErrors(prev => ({ ...prev, general: '' }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors.general]);

    // Cargar datos guardados de "Recuérdame"
    useEffect(() => {
        const remembered = localStorage.getItem('rememberMe') === 'true';
        if (remembered) {
            const savedEmail = localStorage.getItem('savedEmail');
            const savedPhone = localStorage.getItem('savedPhone');

            if (savedEmail) {
                setFormData(prev => ({ ...prev, email: savedEmail }));
                setLoginMethod('email');
                setRememberMe(true);
            } else if (savedPhone) {
                // Convertir string a array de dígitos
                const phoneDigits = savedPhone.split('').slice(0, 10);
                const phoneArray = Array(10).fill('');
                phoneDigits.forEach((digit, i) => {
                    phoneArray[i] = digit;
                });

                setFormData(prev => ({ ...prev, phone: phoneArray }));
                setLoginMethod('phone');
                setRememberMe(true);
            }
        }
    }, []);

    // Cargar reCAPTCHA con retries
    useEffect(() => {
        let timeoutId;
        let checkInterval;
        let retries = 0;
        const MAX_RETRIES = 50;

        const loadRecaptcha = () => {
            setIsCaptchaLoading(true);

            if (!window.grecaptcha) {
                timeoutId = setTimeout(() => {
                    setIsCaptchaLoading(false);
                    console.error("❌ reCAPTCHA no se cargó en el tiempo esperado.");
                }, 2000);

                checkInterval = setInterval(() => {
                    if (window.grecaptcha) {
                        setIsCaptchaLoading(false);
                        clearTimeout(timeoutId);
                        clearInterval(checkInterval);
                        console.log("✅ reCAPTCHA cargado correctamente.");
                    } else if (retries >= MAX_RETRIES) {
                        clearTimeout(timeoutId);
                        clearInterval(checkInterval);
                        setIsCaptchaLoading(false);
                        console.error("⚠ reCAPTCHA no se pudo cargar después de varios intentos.");
                    }
                    retries++;
                }, 100);
            } else {
                setIsCaptchaLoading(false);
            }
        };

        loadRecaptcha();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (checkInterval) clearInterval(checkInterval);
        };
    }, []);

    // Función helper para manejar el timeout en fetch
    const fetchWithTimeout = async (url, options, timeout = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('La solicitud tardó demasiado tiempo en responder');
            }
            throw error;
        }
    };

    // Cambiar método de login (email/teléfono)
    const handleLoginMethodChange = (event, newValue) => {
        if (newValue !== null) {
            setLoginMethod(newValue);
            // Limpiar errores cuando se cambia de método
            setErrors({
                email: '',
                password: '',
                phone: '',
                general: ''
            });
        }
    };

    // Manejar cambio en "Recuérdame"
    const handleRememberMeChange = (event) => {
        const checked = event.target.checked;
        setRememberMe(checked);

        if (!checked) {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedPhone');
        }
    };

    // Validar email
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
        return email ? emailRegex.test(email) : false;
    };

    // Validar teléfono (10 dígitos)
    const validatePhone = (phoneArray) => {
        return phoneArray.every(digit => digit !== '');
    };

    // Manejar cambios en el input de email
    const handleEmailChange = (e) => {
        const { value } = e.target;
        setFormData(prevData => ({ ...prevData, email: value }));

        if (value && !validateEmail(value)) {
            setErrors(prev => ({ ...prev, email: 'Correo electrónico inválido.' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }

        // Limpiar error general
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
        }
    };

    // Manejar cambio en contraseña
    const handlePasswordChange = (e) => {
        const { value } = e.target;
        setFormData(prevData => ({ ...prevData, password: value }));

        // Limpiar error de contraseña
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }));
        }

        // Limpiar error general
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
        }
    };

    // Manejar cambios en los inputs de teléfono
    const handlePhoneDigitChange = (index, value) => {
        // Solo permitir dígitos
        if (!/^\d*$/.test(value) && value !== '') {
            return;
        }

        // Actualizar el valor en el índice específico
        const newPhoneArray = [...formData.phone];
        newPhoneArray[index] = value.slice(0, 1); // Solo tomar el primer dígito

        setFormData(prevData => ({
            ...prevData,
            phone: newPhoneArray
        }));

        // Validación
        if (newPhoneArray.some(digit => digit === '')) {
            setErrors(prev => ({ ...prev, phone: 'Ingrese todos los dígitos.' }));
        } else {
            setErrors(prev => ({ ...prev, phone: '' }));
        }

        // Mover al siguiente input si se ingresó un dígito
        if (value !== '' && index < 9) {
            phoneInputRefs.current[index + 1].current.focus();
        }

        // Limpiar error general
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
        }
    };

    // Manejar tecla de retroceso en inputs de teléfono
    const handlePhoneKeyDown = (index, e) => {
        // Si se presiona backspace en un input vacío, mover al anterior
        if (e.key === 'Backspace' && formData.phone[index] === '' && index > 0) {
            phoneInputRefs.current[index - 1].current.focus();
        }

        // Si se presiona flecha izquierda y el cursor está al inicio, mover al anterior
        if (e.key === 'ArrowLeft' && e.target.selectionStart === 0 && index > 0) {
            phoneInputRefs.current[index - 1].current.focus();
        }

        // Si se presiona flecha derecha y el cursor está al final, mover al siguiente
        if (e.key === 'ArrowRight' &&
            e.target.selectionStart === e.target.value.length &&
            index < 9) {
            phoneInputRefs.current[index + 1].current.focus();
        }
    };

    // Manejar pegado de número en el primer input
    const handlePhonePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text/plain').replace(/\D/g, '');
        const digits = pastedText.split('').slice(0, 10);

        // Llenar los inputs con los dígitos pegados
        const newPhoneArray = Array(10).fill('');
        digits.forEach((digit, i) => {
            if (i < 10) {
                newPhoneArray[i] = digit;
            }
        });

        setFormData(prevData => ({
            ...prevData,
            phone: newPhoneArray
        }));

        // Validación
        if (newPhoneArray.some(digit => digit === '')) {
            setErrors(prev => ({ ...prev, phone: 'Ingrese todos los dígitos.' }));
        } else {
            setErrors(prev => ({ ...prev, phone: '' }));
        }

        // Enfocar el último dígito ingresado o el siguiente vacío
        const lastIndex = Math.min(digits.length, 9);
        if (lastIndex < 10) {
            phoneInputRefs.current[lastIndex].current.focus();
        }
    };

    // Manejar cambio en el captcha
    const handleCaptchaChange = (value) => {
        try {
            setCaptchaValue(value);
            setIsCaptchaLoading(false);
            setErrors(prev => ({ ...prev, general: '' }));
        } catch (error) {
            console.error('Error en el captcha:', error);
            setErrors(prev => ({
                ...prev,
                general: 'Error con el captcha. Por favor, inténtalo de nuevo.'
            }));
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
        }
    };

    // Función para guardar credenciales si rememberMe está activo
    const saveCredentials = () => {
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            if (loginMethod === 'email') {
                localStorage.setItem('savedEmail', formData.email);
                localStorage.removeItem('savedPhone');
            } else {
                // Guardar el número como string
                localStorage.setItem('savedPhone', formData.phone.join(''));
                localStorage.removeItem('savedEmail');
            }
        }
    };

    // Validar formulario antes de enviar
    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: '', password: '', phone: '', general: '' };

        // Validar según método de login
        if (loginMethod === 'email') {
            if (!validateEmail(formData.email)) {
                newErrors.email = 'Por favor, ingrese un correo electrónico válido';
                isValid = false;
            }
        } else {
            if (!validatePhone(formData.phone)) {
                newErrors.phone = 'Por favor, complete todos los dígitos';
                isValid = false;
            }
        }

        // Validar contraseña
        if (!formData.password.trim()) {
            newErrors.password = 'Por favor, ingrese su contraseña';
            isValid = false;
        }

        // Validar captcha
        if (!captchaValue) {
            newErrors.general = 'Por favor, complete el captcha';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Manejar el envío del formulario de login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginAttempt(true);

        if (!validateForm()) {
            setTimeout(() => setLoginAttempt(false), 500);
            return;
        }

        // Guardar credenciales si rememberMe está activado
        saveCredentials();
        setIsLoading(true);

        try {
            // Preparar datos según método de login
            const loginData = {
                password: formData.password,
                captchaValue
            };

            if (loginMethod === 'email') {
                loginData.email = formData.email.trim();
                loginData.loginMethod = 'email';
            } else {
                loginData.phone = formData.phone.join('');
                loginData.loginMethod = 'phone';
            }

            const response = await fetch('https://back-end-4803.onrender.com/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(loginData)
            });

            // Procesar la respuesta
            const data = await response.json();

            // Verificar error 500
            if (response.status === 500) {
                navigate('/error', {
                    state: {
                        errorCode: 500,
                        errorMessage: 'Error interno del servidor. Por favor, inténtalo más tarde.'
                    }
                });
                return;
            }

            if (response.ok) {
                // Si la respuesta es correcta, procede con la verificación
                try {
                    const verificationData = loginMethod === 'email'
                        ? { email: formData.email.trim() }
                        : { phone: formData.phone.join('') };

                    const sendCodeResponse = await fetchWithTimeout(
                        'https://back-end-4803.onrender.com/api/send-verification-code',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify(verificationData),
                        },
                        15000
                    );

                    if (sendCodeResponse.ok) {
                        setLoginSuccess(true);
                        setVerificationSent(true); // Marcar que el código se envió exitosamente
                        setNotificationMessage(`Se ha enviado un código de verificación a tu ${loginMethod === 'email' ? 'correo electrónico' : 'número de teléfono'}.`);
                        setNotificationSeverity('success');
                        setOpenNotification(true);

                        // Esperar a que termine la animación de éxito
                        setTimeout(() => {
                            setShowVerificationModal(true);
                            setIsCaptchaLocked(true);
                        }, 1000);
                    } else {
                        const errorData = await sendCodeResponse.json();
                        throw new Error(errorData.message || 'Error al enviar el código de verificación');
                    }
                } catch (error) {
                    console.error('Error en verificación:', error);
                    setErrors(prev => ({
                        ...prev,
                        general: 'Error al enviar el código de verificación. Por favor, intenta nuevamente.'
                    }));
                    setNotificationMessage('Error al enviar código de verificación');
                    setNotificationSeverity('error');
                    setOpenNotification(true);
                }
            } else {
                // Manejar los casos de error cuando response.ok es falso
                if (data.failedAttempts !== undefined) {
                    setNotificationMessage(`Intentos fallidos: ${data.failedAttempts}`);
                    setNotificationSeverity('warning');
                    setOpenNotification(true);
                    setErrors(prev => ({ ...prev, general: 'Contraseña incorrecta.' }));
                } else if (data.lockStatus) {
                    const formattedDate = new Date(data.lockUntil).toLocaleString('es-ES');
                    setNotificationMessage(`Cuenta bloqueada hasta ${formattedDate}`);
                    setNotificationSeverity('error');
                    setOpenNotification(true);
                } else {
                    setErrors(prev => ({ ...prev, general: data.message || 'Error al iniciar sesión.' }));
                }
            }
        } catch (error) {
            console.error('Error en login:', error);
            if (error.message === 'La solicitud tardó demasiado tiempo en responder') {
                navigate('/error', {
                    state: {
                        errorCode: 500,
                        errorMessage: 'El servidor está tardando en responder. Por favor, intenta nuevamente.'
                    }
                });
            } else {
                navigate('/error', {
                    state: {
                        errorCode: 500,
                        errorMessage: 'Error de conexión. Inténtalo de nuevo más tarde.'
                    }
                });
            }
        } finally {
            setIsLoading(false);
            setLoginAttempt(false);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            setCaptchaValue(null);
        }
    };

    // Función para reenviar el código de verificación
    const handleResendCode = async () => {
        if (!canResend) return;

        try {
            setCanResend(false);
            setResendTimer(30); // 30 segundos de espera

            const verificationData = loginMethod === 'email'
                ? { email: formData.email.trim() }
                : { phone: formData.phone.join('') };

            const response = await fetchWithTimeout(
                'https://back-end-4803.onrender.com/api/send-verification-code',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(verificationData),
                },
                15000
            );

            if (response.ok) {
                setNotificationMessage(`Se ha enviado un nuevo código a tu ${loginMethod === 'email' ? 'correo electrónico' : 'número de teléfono'}`);
                setNotificationSeverity('success');
                setOpenNotification(true);

                // Iniciar contador regresivo
                const timer = setInterval(() => {
                    setResendTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setCanResend(true);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setErrors(prev => ({ ...prev, general: 'Error al reenviar el código' }));
                setCanResend(true);
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, general: 'Error al reenviar el código. Inténtalo más tarde' }));
            setCanResend(true);
        }
    };

    // Manejar la verificación del código
    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            setErrors(prev => ({ ...prev, general: 'Por favor, ingresa el código de verificación.' }));
            return;
        }

        if (verificationCode.length !== 6) {
            setErrors(prev => ({ ...prev, general: 'Por favor, ingresa el código completo de 6 caracteres' }));
            return;
        }

        // Validar que solo contenga letras mayúsculas y números
        const codeRegex = /^[A-Z0-9]{6}$/;
        if (!codeRegex.test(verificationCode)) {
            setErrors(prev => ({ ...prev, general: 'El código solo puede contener letras mayúsculas y números' }));
            return;
        }

        setIsVerifying(true);

        try {
            const verificationData = {
                code: verificationCode.trim()
            };

            // Agregar email o phone según el método de login
            if (loginMethod === 'email') {
                verificationData.email = formData.email.trim();
            } else {
                verificationData.phone = formData.phone.join('');
            }

            const response = await fetchWithTimeout(
                'https://back-end-4803.onrender.com/api/verify-verification-code',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(verificationData),
                },
                15000 // 15 segundos de timeout
            );

            const data = await response.json();

            if (!response.ok) {
                setErrors(prev => ({ ...prev, general: data.message || 'Error al verificar el código.' }));
                return;
            }

            setNotificationMessage(data.message || 'Código verificado correctamente.');
            setNotificationSeverity('success');
            setOpenNotification(true);
            setVerificationCode('');
            setShowVerificationModal(false);

            // Guardar en localStorage y redireccionar según el tipo de usuario
            if (data.userType === 'administradores') {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('userType', 'administradores');
                navigate('/Administrador/principal');
            } else if (data.userType === 'pacientes') {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('userType', 'pacientes');
                navigate('/Paciente/principal');
            } else if (data.userType === 'empleados') {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('userType', 'empleados');
                navigate('/Empleado/principal');
            } else {
                setErrors(prev => ({ ...prev, general: 'Tipo de usuario desconocido. Inténtalo nuevamente.' }));
            }
        } catch (error) {
            if (error.message === 'La solicitud tardó demasiado tiempo en responder') {
                setErrors(prev => ({ ...prev, general: 'El servidor está tardando en responder. Por favor, intenta nuevamente.' }));
            } else {
                setErrors(prev => ({ ...prev, general: 'Error de conexión. Inténtalo de nuevo más tarde.' }));
            }
        } finally {
            setIsVerifying(false);
        }
    };

    // Animaciones para la página
    const pageVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeInOut"
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    // Animaciones para el icono principal
    const logoVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
            }
        },
        hover: {
            scale: 1.05,
            rotate: 360,
            transition: {
                duration: 0.5
            }
        },
        tap: {
            scale: 0.95,
            transition: {
                duration: 0.1
            }
        }
    };

    // Animaciones para los elementos del formulario
    const formElementVariants = {
        hidden: {
            y: 20,
            opacity: 0
        },
        visible: (i) => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: 0.1 + (i * 0.1),
                duration: 0.5,
                type: "spring",
                stiffness: 100
            }
        })
    };

    return (
        <Box
            component={motion.div}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            sx={{
                minHeight: '90vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                bgcolor: colors.background,
                backgroundImage: isDarkTheme
                    ? 'radial-gradient(circle at 25% 10%, rgba(41, 64, 90, 0.5) 0%, rgba(28, 42, 56, 0) 50%)'
                    : 'radial-gradient(circle at 25% 10%, rgba(220, 242, 255, 0.8) 0%, rgba(249, 253, 255, 0) 50%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Elementos de fondo decorativos animados */}
            {[...Array(6)].map((_, index) => (
                <Box
                    key={index}
                    component={motion.div}
                    animate={{
                        y: [Math.random() * 20, (Math.random() - 0.5) * 40, Math.random() * 20],
                        opacity: [0.2, 0.3, 0.2],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 5 + Math.random() * 10,
                        ease: "easeInOut"
                    }}
                    sx={{
                        position: 'absolute',
                        width: `${50 + Math.random() * 150}px`,
                        height: `${50 + Math.random() * 150}px`,
                        borderRadius: '50%',
                        background: isDarkTheme
                            ? 'linear-gradient(135deg, rgba(21, 101, 192, 0.1), rgba(9, 50, 97, 0.05))'
                            : 'linear-gradient(135deg, rgba(3, 169, 244, 0.1), rgba(13, 71, 161, 0.05))',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        filter: 'blur(30px)',
                        zIndex: 0
                    }}
                />
            ))}

            {/* Sección Principal - Formulario */}
            <Box
                sx={{
                    flex: { xs: '1', md: '1 1 50%' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 2, sm: 3, md: 4 },
                    position: 'relative',
                    minHeight: { xs: 'auto', md: '100vh' },
                    zIndex: 1
                }}
            >
                {/* Botón Regresar con animación */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <IconButton
                        component={Link}
                        to="/"
                        sx={{
                            position: 'absolute',
                            top: { xs: 10, md: 20 },
                            left: { xs: 10, md: 20 },
                            color: colors.primary,
                            bgcolor: `${colors.primary}15`,
                            zIndex: 10,
                            '&:hover': {
                                bgcolor: `${colors.primary}25`
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

                {/* Contenedor del Formulario con animación */}
                <Grow in={true} timeout={800}>
                    <Paper
                        elevation={6}
                        sx={{
                            width: '100%',
                            maxWidth: { xs: '100%', sm: 510 },
                            p: { xs: 3, sm: 4 },
                            borderRadius: 3,
                            bgcolor: colors.paper,
                            boxShadow: isDarkTheme
                                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                                : '0 8px 32px rgba(0, 82, 163, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Animación de éxito de login */}
                        <AnimatePresence>
                            {loginSuccess && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 100,
                                        backgroundColor: colors.paper,
                                        borderRadius: '16px'
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [1, 0.8, 0]
                                        }}
                                        transition={{
                                            duration: 1,
                                            ease: "easeInOut",
                                            times: [0, 0.5, 1]
                                        }}
                                    >
                                        <CheckCircle
                                            sx={{
                                                fontSize: 80,
                                                color: colors.success
                                            }}
                                        />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Decoración superior */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`
                            }}
                        />

                        {/* Logo y Título */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <motion.div
                                variants={logoVariants}
                                initial="initial"
                                animate="animate"
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        p: 2,
                                        borderRadius: '50%',
                                        bgcolor: `${colors.primary}15`
                                    }}
                                >
                                    <FaTooth size={38} style={{ color: colors.primary }} />
                                </Box>
                            </motion.div>

                            <motion.div
                                variants={formElementVariants}
                                initial="hidden"
                                animate="visible"
                                custom={1}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{
                                        mt: 2,
                                        fontWeight: 700,
                                        color: colors.text,
                                        fontFamily: '"Poppins", sans-serif',
                                        fontSize: { xs: '1.6rem', sm: '2rem' }
                                    }}
                                >
                                    Clínica Dental Carol
                                </Typography>
                            </motion.div>

                            <motion.div
                                variants={formElementVariants}
                                initial="hidden"
                                animate="visible"
                                custom={2}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mt: 1,
                                        color: colors.textSecondary,
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Accede a tu cuenta dental
                                </Typography>
                            </motion.div>
                        </Box>

                        {/* Selector de método de login */}
                        <motion.div
                            variants={formElementVariants}
                            initial="hidden"
                            animate="visible"
                            custom={3}
                        >
                            <Box sx={{ mb: 3 }}>
                                <Tabs
                                    value={loginMethod}
                                    onChange={handleLoginMethodChange}
                                    variant="fullWidth"
                                    sx={{
                                        '& .MuiTab-root': {
                                            fontWeight: 500,
                                            fontSize: '0.95rem',
                                            textTransform: 'none',
                                            color: colors.textSecondary,
                                            minHeight: '48px',
                                            borderRadius: '8px 8px 0 0',
                                            transition: 'all 0.3s ease',
                                            '&.Mui-selected': {
                                                color: colors.primary,
                                                fontWeight: 600
                                            },
                                            '&:hover:not(.Mui-selected)': {
                                                color: `${colors.primary}CC`,
                                                backgroundColor: `${colors.primary}10`
                                            }
                                        },
                                        '& .MuiTabs-indicator': {
                                            height: 3,
                                            borderRadius: '3px 3px 0 0',
                                            backgroundColor: colors.primary
                                        }
                                    }}
                                >
                                    <Tab
                                        icon={<Email sx={{ mr: 1, fontSize: 18 }} />}
                                        iconPosition="start"
                                        label="Correo electrónico"
                                        value="email"
                                    />
                                    <Tab
                                        icon={<Phone sx={{ mr: 1, fontSize: 18 }} />}
                                        iconPosition="start"
                                        label="Teléfono"
                                        value="phone"
                                    />
                                </Tabs>
                            </Box>
                        </motion.div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            {/* Campo Email */}
                            <AnimatePresence mode="wait">
                                {loginMethod === 'email' && (
                                    <motion.div
                                        key="email-input"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TextField
                                            fullWidth
                                            required
                                            label="Correo electrónico"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleEmailChange}
                                            variant="outlined"
                                            margin="normal"
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email sx={{ color: errors.email ? colors.error : colors.primary }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    '& fieldset': {
                                                        borderColor: errors.email ? colors.error : colors.border
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: errors.email ? colors.error : colors.primary
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: errors.email ? colors.error : colors.primary
                                                    }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: errors.email ? colors.error : colors.textSecondary,
                                                    '&.Mui-focused': {
                                                        color: errors.email ? colors.error : colors.primary
                                                    }
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: colors.text
                                                },
                                                '& .MuiFormHelperText-root': {
                                                    margin: '4px 0 0'
                                                }
                                            }}
                                            inputProps={{
                                                autoComplete: 'email'
                                            }}
                                            placeholder="ejemplo@dominio.com"
                                        />
                                    </motion.div>
                                )}

                                {/* Campo Teléfono - Nuevo diseño con campos separados */}
                                {loginMethod === 'phone' && (
                                    <motion.div
                                        key="phone-input"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Box sx={{ mb: 2, mt: 2 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    mb: 1.5,
                                                    color: colors.textSecondary,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Phone sx={{ mr: 1, fontSize: 18, color: colors.primary }} />
                                                Número de teléfono
                                            </Typography>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Contenedor para los 10 inputs de dígitos */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        width: '100%',
                                                        bgcolor: `${colors.primary}10`,
                                                        borderRadius: '12px',
                                                        p: 1.5,
                                                        border: `1px solid ${errors.phone ? colors.error : 'transparent'}`
                                                    }}
                                                >
                                                    {[...Array(10)].map((_, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                flex: 1,
                                                                mx: 0.25,
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            <motion.div
                                                                whileTap={{ scale: 0.95 }}
                                                                transition={{ duration: 0.1 }}
                                                            >
                                                                <InputBase
                                                                    inputRef={phoneInputRefs.current[index]}
                                                                    value={formData.phone[index]}
                                                                    onChange={(e) => handlePhoneDigitChange(index, e.target.value)}
                                                                    onKeyDown={(e) => handlePhoneKeyDown(index, e)}
                                                                    onPaste={index === 0 ? handlePhonePaste : undefined}
                                                                    inputProps={{
                                                                        maxLength: 1,
                                                                        style: {
                                                                            textAlign: 'center',
                                                                            fontSize: '1.3rem',
                                                                            fontWeight: 600,
                                                                            color: colors.text,
                                                                            caretColor: colors.primary
                                                                        },
                                                                        inputMode: 'numeric',
                                                                        pattern: '[0-9]'
                                                                    }}
                                                                    sx={{
                                                                        bgcolor: colors.paper,
                                                                        borderRadius: '8px',
                                                                        height: '48px',
                                                                        width: '100%',
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                        transition: 'all 0.2s',
                                                                        '&.Mui-focused': {
                                                                            boxShadow: `0 0 0 2px ${colors.primary}`
                                                                        }
                                                                    }}
                                                                />
                                                            </motion.div>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>

                                            {/* Mensaje de error para teléfono */}
                                            {errors.phone && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: colors.error,
                                                        mt: 0.5,
                                                        ml: 1,
                                                        display: 'block'
                                                    }}
                                                >
                                                    {errors.phone}
                                                </Typography>
                                            )}

                                            {/* Texto de ayuda */}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    mt: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: colors.textSecondary
                                                }}
                                            >
                                                <Info sx={{ fontSize: 14, mr: 0.5, color: colors.primary }} />
                                                Ingresa 10 dígitos sin espacios ni guiones
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Campo Contraseña */}
                            <motion.div
                                variants={formElementVariants}
                                initial="hidden"
                                animate="visible"
                                custom={5}
                            >
                                <TextField
                                    fullWidth
                                    required
                                    label="Contraseña"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    variant="outlined"
                                    margin="normal"
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: errors.password ? colors.error : colors.primary }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    aria-label={showPassword ? "ocultar contraseña" : "mostrar contraseña"}
                                                    sx={{ color: colors.textSecondary }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            '& fieldset': {
                                                borderColor: errors.password ? colors.error : colors.border
                                            },
                                            '&:hover fieldset': {
                                                borderColor: errors.password ? colors.error : colors.primary
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: errors.password ? colors.error : colors.primary
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: errors.password ? colors.error : colors.textSecondary,
                                            '&.Mui-focused': {
                                                color: errors.password ? colors.error : colors.primary
                                            }
                                        },
                                        '& .MuiInputBase-input': {
                                            color: colors.text
                                        }
                                    }}
                                    inputProps={{
                                        autoComplete: 'current-password'
                                    }}
                                />
                            </motion.div>

                            {/* Opciones adicionales */}
                            <motion.div
                                variants={formElementVariants}
                                initial="hidden"
                                animate="visible"
                                custom={6}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 3,
                                        gap: 1
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={handleRememberMeChange}
                                                sx={{
                                                    color: colors.primary,
                                                    '&.Mui-checked': {
                                                        color: colors.primary
                                                    }
                                                }}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography sx={{
                                                    fontSize: '0.9rem',
                                                    color: colors.textSecondary
                                                }}>
                                                    Recordar cuenta
                                                </Typography>
                                                <Tooltip
                                                    title="Guarda tus datos de acceso para futuros inicios de sesión"
                                                    arrow
                                                    placement="top"
                                                >
                                                    <Info sx={{
                                                        fontSize: 16,
                                                        ml: 0.5,
                                                        color: colors.primary,
                                                        opacity: 0.7
                                                    }} />
                                                </Tooltip>
                                            </Box>
                                        }
                                    />
                                    <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                                        <Link
                                            to="/recuperacion"
                                            style={{
                                                color: colors.primary,
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </motion.div>
                                </Box>
                            </motion.div>

                            {/* ReCAPTCHA */}
                            <motion.div
                                variants={formElementVariants}
                                initial="hidden"
                                animate="visible"
                                custom={7}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mb: 3,
                                    mt: 2,
                                    minHeight: '78px'
                                }}>
                                    {isCaptchaLoading ? (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <CircularProgress size={24} sx={{ color: colors.primary }} />
                                            <Typography variant="caption" display="block" sx={{ mt: 1, color: colors.textSecondary }}>
                                                Cargando captcha...
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey="6Lc74mAqAAAAAL5MmFjf4x0PWP9MtBNEy9ypux_h"
                                            onChange={handleCaptchaChange}
                                            onLoad={() => {
                                                setIsCaptchaLoading(false);
                                                setErrors(prev => ({ ...prev, general: '' }));
                                            }}
                                            onError={() => {
                                                setIsCaptchaLoading(false);
                                                setErrors(prev => ({
                                                    ...prev,
                                                    general: 'Error al cargar el captcha. Por favor, recarga la página.'
                                                }));
                                            }}
                                            onExpired={() => {
                                                setCaptchaValue(null);
                                                setErrors(prev => ({
                                                    ...prev,
                                                    general: 'El captcha ha expirado. Por favor, complétalo nuevamente.'
                                                }));
                                            }}
                                            theme={isDarkTheme ? 'dark' : 'light'}
                                        />
                                    )}
                                </Box>
                            </motion.div>

                            {/* Mensaje de Error General */}
                            <AnimatePresence>
                                {errors.general && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mb: 2,
                                                borderRadius: '8px',
                                                '& .MuiAlert-icon': {
                                                    alignItems: 'center'
                                                }
                                            }}
                                            onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
                                        >
                                            {errors.general}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Modal de Verificación */}
                            <Dialog
                                open={showVerificationModal}
                                // Evitar que se cierre al hacer clic fuera
                                disableEscapeKeyDown
                                onClose={(event, reason) => {
                                    // Solo permitir cerrar con el botón explícito de cerrar, no con clic fuera o ESC
                                    if (reason !== 'backdropClick' && reason !== 'escapeKeyDown' && !isVerifying) {
                                        setShowVerificationModal(false);
                                        setVerificationCode('');
                                        setErrors(prev => ({ ...prev, general: '' }));
                                    }
                                }}
                                fullWidth
                                maxWidth="xs"
                                PaperProps={{
                                    sx: {
                                        borderRadius: 3,
                                        bgcolor: colors.paper,
                                        backgroundImage: isDarkTheme
                                            ? 'linear-gradient(rgba(41, 64, 90, 0.5), rgba(28, 42, 56, 0))'
                                            : 'linear-gradient(rgba(3, 169, 244, 0.05), rgba(13, 71, 161, 0))',
                                        overflow: 'hidden'
                                    }
                                }}
                                TransitionComponent={Slide}
                                TransitionProps={{
                                    direction: 'up',
                                    timeout: 400
                                }}
                            >
                                {/* Decoración superior del modal */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`
                                    }}
                                />

                                <DialogTitle
                                    sx={{
                                        textAlign: 'center',
                                        color: colors.primary,
                                        pb: 1,
                                        pt: 3
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                        <Security sx={{ mr: 1 }} />
                                        Verificación de Seguridad
                                    </Box>
                                    {/* Nota informativa para que el usuario entienda que no debe cerrar */}
                                    <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary, mt: 1, mx: 'auto', maxWidth: '80%' }}>
                                        Debes completar este paso para continuar. No cierres esta ventana.
                                    </Typography>
                                </DialogTitle>

                                <DialogContent>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mb: 3,
                                            textAlign: 'center',
                                            color: colors.textSecondary
                                        }}
                                    >
                                        Se ha enviado un código de verificación a tu{' '}
                                        {loginMethod === 'email' ? 'correo electrónico' : 'número de teléfono'}.
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Código de verificación"
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase();
                                            if (value.length <= 6) {
                                                setVerificationCode(value);
                                                setErrors(prev => ({ ...prev, general: '' }));
                                            }
                                        }}
                                        error={!!errors.general}
                                        helperText={errors.general || 'Ingresa el código de 6 caracteres'}
                                        disabled={isVerifying}
                                        autoFocus
                                        inputProps={{
                                            maxLength: 6,
                                            style: {
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5em',
                                                textAlign: 'center',
                                                color: colors.text
                                            }
                                        }}
                                        placeholder="ABC123"
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                '& fieldset': {
                                                    borderColor: errors.general ? colors.error : colors.border
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.general ? colors.error : colors.primary
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.general ? colors.error : colors.primary
                                                }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: errors.general ? colors.error : colors.textSecondary,
                                                '&.Mui-focused': {
                                                    color: errors.general ? colors.error : colors.primary
                                                }
                                            }
                                        }}
                                    />

                                    {/* Botón de reenvío con contador */}
                                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                                        <Button
                                            onClick={handleResendCode}
                                            disabled={!canResend}
                                            startIcon={canResend ? <Email /> : null}
                                            variant="text"
                                            sx={{
                                                color: colors.primary,
                                                textTransform: 'none',
                                                borderRadius: '8px',
                                                py: 1,
                                                fontWeight: 500,
                                                '&:hover': {
                                                    bgcolor: `${colors.primary}15`
                                                },
                                                '&.Mui-disabled': {
                                                    color: `${colors.textSecondary}80`
                                                }
                                            }}
                                        >
                                            {canResend
                                                ? '¿No recibiste el código? Reenviar'
                                                : `Podrás reenviar en ${resendTimer} segundos`
                                            }
                                        </Button>
                                    </Box>
                                </DialogContent>

                                <DialogActions sx={{ p: { xs: 2, sm: 3 }, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                    <Button
                                        onClick={() => setShowConfirmDialog(true)}
                                        variant="outlined"
                                        disabled={isVerifying}
                                        sx={{
                                            borderColor: `${colors.textSecondary}50`,
                                            color: colors.textSecondary,
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: colors.textSecondary,
                                                bgcolor: `${colors.textSecondary}10`
                                            }
                                        }}
                                    >
                                        Regresar
                                    </Button>
                                    <Button
                                        onClick={handleVerifyCode}
                                        variant="contained"
                                        disabled={isVerifying || verificationCode.length !== 6}
                                        startIcon={!isVerifying && <CheckCircle />}
                                        sx={{
                                            bgcolor: colors.primary,
                                            '&:hover': {
                                                bgcolor: colors.primaryDark
                                            },
                                            minWidth: '120px',
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            py: 1,
                                            px: 3,
                                            fontWeight: 600
                                        }}
                                    >
                                        {isVerifying ? <CircularProgress size={24} /> : 'Verificar'}
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* Dialog de Confirmación */}
                            <Dialog
                                open={showConfirmDialog}
                                onClose={() => setShowConfirmDialog(false)}
                                fullWidth
                                maxWidth="xs"
                                PaperProps={{
                                    sx: {
                                        borderRadius: 3,
                                        bgcolor: colors.paper,
                                        overflow: 'hidden'
                                    }
                                }}
                                TransitionComponent={Slide}
                                TransitionProps={{
                                    direction: 'up',
                                    timeout: 300
                                }}
                            >
                                <DialogTitle
                                    sx={{
                                        textAlign: 'center',
                                        color: colors.warning,
                                        pb: 1,
                                        pt: 3
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                        <Help sx={{ mr: 1 }} />
                                        ¿Cancelar verificación?
                                    </Box>
                                </DialogTitle>

                                <DialogContent>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mb: 2,
                                            textAlign: 'center',
                                            color: colors.textSecondary
                                        }}
                                    >
                                        Si regresas ahora, tendrás que iniciar sesión nuevamente.
                                        ¿Estás seguro que deseas cancelar el proceso de verificación?
                                    </Typography>
                                </DialogContent>

                                <DialogActions sx={{ p: { xs: 2, sm: 3 }, justifyContent: 'space-between' }}>
                                    <Button
                                        onClick={() => setShowConfirmDialog(false)}
                                        variant="outlined"
                                        sx={{
                                            borderColor: `${colors.textSecondary}50`,
                                            color: colors.textSecondary,
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: colors.textSecondary,
                                                bgcolor: `${colors.textSecondary}10`
                                            }
                                        }}
                                    >
                                        Continuar verificación
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            // Cerrar ambos diálogos
                                            setShowConfirmDialog(false);
                                            setShowVerificationModal(false);

                                            // Reiniciar estados relacionados con la verificación
                                            setVerificationCode('');
                                            setIsCaptchaLocked(false);
                                            setVerificationSent(false);
                                            setLoginSuccess(false);

                                            // Restablecer captcha
                                            if (recaptchaRef.current) {
                                                recaptchaRef.current.reset();
                                            }
                                            setCaptchaValue(null);

                                            // Limpiar errores
                                            setErrors(prev => ({
                                                ...prev,
                                                general: ''
                                            }));
                                        }}
                                        variant="contained"
                                        sx={{
                                            bgcolor: colors.warning,
                                            '&:hover': {
                                                bgcolor: '#e68900'
                                            },
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Sí, cancelar
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* Botón de Inicio de Sesión con animación o Botón para volver a la verificación */}
                            <motion.div
                                variants={formElementVariants}
                                initial="hidden"
                                animate="visible"
                                custom={8}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {verificationSent ? (
                                    // Si ya se envió el código de verificación, mostrar botón para abrir el modal
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => setShowVerificationModal(true)}
                                        startIcon={<Fingerprint />}
                                        sx={{
                                            mt: 2,
                                            mb: 3,
                                            py: 1.5,
                                            bgcolor: colors.success,
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                bgcolor: '#3d8b40',
                                                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)'
                                            }
                                        }}
                                    >
                                        Ingresar Código de Verificación
                                    </Button>
                                ) : (
                                    // Botón normal de inicio de sesión
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        disabled={isLoading || !captchaValue}
                                        startIcon={!isLoading && <LoginIcon />}
                                        sx={{
                                            mt: 2,
                                            mb: 3,
                                            py: 1.5,
                                            bgcolor: colors.primary,
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 12px rgba(0, 82, 163, 0.2)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                bgcolor: colors.primaryDark,
                                                boxShadow: '0 6px 16px rgba(0, 82, 163, 0.3)'
                                            },
                                            '&.Mui-disabled': {
                                                bgcolor: isDarkTheme ? 'rgba(41, 64, 90, 0.5)' : 'rgba(27, 42, 58, 0.5)',
                                                color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)'
                                            }
                                        }}
                                    >
                                        {isLoading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            'Iniciar Sesión'
                                        )}

                                        {/* Efecto de ondas al hacer clic */}
                                        <AnimatePresence>
                                            {loginAttempt && !isLoading && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0.5 }}
                                                    animate={{ scale: 2, opacity: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                )}
                            </motion.div>

                            {/* Separador */}
                            <motion.div
                                variants={formElementVariants}
                                initial="hidden"
                                animate="visible"
                                custom={9}
                            >
                                <Divider sx={{
                                    my: 2,
                                    '&::before, &::after': {
                                        borderColor: isDarkTheme ? 'rgba(176, 190, 197, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                                    }
                                }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: colors.textSecondary,
                                            px: 1
                                        }}
                                    >
                                        ¿No tienes cuenta?
                                    </Typography>
                                </Divider>
                            </motion.div>

                            {/* Link de Registro con animación */}
                            <motion.div
                                variants={formElementVariants}
                                initial="hidden"
                                animate="visible"
                                custom={10}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Box sx={{ textAlign: 'center', mt: 1 }}>
                                    <Button
                                        component={Link}
                                        to="/register"
                                        variant="outlined"
                                        startIcon={<ArrowForward />}
                                        sx={{
                                            borderColor: colors.primary,
                                            color: colors.primary,
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            py: 1,
                                            '&:hover': {
                                                borderColor: colors.primaryDark,
                                                backgroundColor: `${colors.primary}10`
                                            }
                                        }}
                                    >
                                        Crear una cuenta
                                    </Button>
                                </Box>
                            </motion.div>
                        </form>
                    </Paper>
                </Grow>
            </Box>

            {/* Sección Lateral - Imagen y Mensaje (visible solo en desktop) */}
            <Box
                sx={{
                    flex: '1 1 50%',
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #0a3d7c 0%, #051f40 100%)',
                    color: 'white',
                    p: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: isTablet ? 0 : '0 16px 16px 0',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                    zIndex: 1
                }}
            >
                {/* Patrón de fondo animado */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.07,
                        backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)',
                        backgroundSize: '20px 20px',
                        animation: 'patternMove 40s linear infinite',
                        '@keyframes patternMove': {
                            '0%': { backgroundPosition: '0 0' },
                            '100%': { backgroundPosition: '100px 100px' }
                        }
                    }}
                />

                {/* Elementos decorativos flotantes */}
                {[1, 2, 3, 4, 5].map((item) => (
                    <motion.div
                        key={item}
                        animate={{
                            y: [Math.random() * 20, (Math.random() - 0.5) * 40, Math.random() * 20],
                            x: [Math.random() * 20, (Math.random() - 0.5) * 40, Math.random() * 20],
                            rotate: [0, Math.random() * 10, 0],
                            scale: [1, 1 + Math.random() * 0.1, 1]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 10 + Math.random() * 15,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            width: Math.random() * 60 + 20,
                            height: Math.random() * 60 + 20,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}

                {/* Icono de diente animado */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 0.12,
                        rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                        scale: {
                            type: "spring",
                            stiffness: 100,
                            delay: 0.1,
                        },
                        rotate: {
                            repeat: Infinity,
                            duration: 10,
                            ease: "easeInOut"
                        }
                    }}
                    style={{
                        position: 'absolute',
                        top: '10%',
                        right: '10%',
                        zIndex: 0
                    }}
                >
                    <MedicalServices
                        sx={{
                            fontSize: 200,
                            opacity: 0.2,
                            filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.2))'
                        }}
                    />
                </motion.div>

                {/* Contenido */}
                <Box
                    sx={{
                        position: 'relative',
                        textAlign: 'center',
                        zIndex: 1,
                        maxWidth: 500
                    }}
                >
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            delay: 0.2
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                mb: 3,
                                fontWeight: 800,
                                fontFamily: '"Poppins", sans-serif',
                                background: 'linear-gradient(90deg, #ffffff 0%, #e0f2ff 100%)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Bienvenido a Carol
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 50,
                            delay: 0.4
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 6,
                                opacity: 0.9,
                                maxWidth: 500,
                                mx: 'auto',
                                fontWeight: 300,
                                lineHeight: 1.5
                            }}
                        >
                            Tu salud dental es nuestra prioridad. Accede para gestionar tus citas y consultar tu historial médico de forma segura.
                        </Typography>
                    </motion.div>

                    {/* Características con animación secuencial */}
                    <Box sx={{ textAlign: 'left', maxWidth: 450, mx: 'auto' }}>
                        {[
                            {
                                text: 'Agenda y gestiona tus citas en línea',
                                icon: <CalendarToday sx={{ mr: 2, color: '#5CC9F5' }} />
                            },
                            {
                                text: 'Accede a tu historial dental completo',
                                icon: <FolderSpecial sx={{ mr: 2, color: '#5CF5A0' }} />
                            },
                            {
                                text: 'Recibe recordatorios personalizados',
                                icon: <Notifications sx={{ mr: 2, color: '#F5C45C' }} />
                            },
                            {
                                text: 'Consulta tratamientos y presupuestos',
                                icon: <AttachMoney sx={{ mr: 2, color: '#F55C9F' }} />
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 70,
                                    delay: 0.6 + index * 0.15
                                }}
                                whileHover={{
                                    x: 5,
                                    scale: 1.02,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 3,
                                        py: 1.5,
                                        px: 2.5,
                                        borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {feature.icon}
                                    <Typography fontWeight={500}>
                                        {feature.text}
                                    </Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Notificaciones */}
            <Notificaciones
                open={openNotification}
                message={notificationMessage}
                handleClose={() => setOpenNotification(false)}
                severity={notificationSeverity}
            />
        </Box>
    );
};

export default Login;