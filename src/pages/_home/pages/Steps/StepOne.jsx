import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    InputAdornment,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Tooltip,
    Alert,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Link,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Divider,
    CircularProgress
} from '@mui/material';

import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    HelpOutline as HelpOutlineIcon,
    CalendarMonth as CalendarIcon,
    Assignment as AssignmentIcon,
    GavelRounded as TermsIcon,
    PrivacyTip as PrivacyIcon,
    MedicalServices as MedicalIcon,
    ContactMail as ContactIcon,
    Info as InfoIcon,
    ErrorOutline as ErrorOutlineIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    AccountCircle as AccountCircleIcon,
    ArrowBack as ArrowBackIcon,
    VerifiedUser as VerifiedUserIcon,
    ArrowForward as ArrowForwardIcon,
    EventAvailable as EventAvailableIcon,
    CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import CustomRecaptcha from '../../../../components/Tools/Captcha';

// Regex validations
const nameRegex = /^[A-Za-zÀ-ÿñÑ\s]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|live|uthh\.edu)\.(com|mx)$/;
const phoneRegex = /^\d{10}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const StepOne = ({
    colors,
    isDarkTheme,
    formData,
    onFormDataChange,
    onStepCompletion,
    setNotification
}) => {
    const [errors, setErrors] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [openTermsModal, setOpenTermsModal] = useState(false);
    const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
    const [termsConditions, setTermsConditions] = useState('');
    const [privacyPolicy, setPrivacyPolicy] = useState('');
    const [availableServices, setAvailableServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [selectedServiceDescription, setSelectedServiceDescription] = useState('');
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [openLoginDialog, setOpenLoginDialog] = useState(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await axios.get('https://back-end-4803.onrender.com/api/servicios/all');
                setAvailableServices(data);
            } catch (error) {
                setNotification({ open: true, message: 'Error al cargar los servicios', type: 'error' });
            } finally {
                setLoadingServices(false);
            }
        };
        fetchServices();
    }, []);

    const validateEmail = (value) => {
        if (value && !emailRegex.test(value)) {
            setEmailError('Correo electrónico inválido.');
            return false;
        } else {
            setEmailError('');
            return true;
        }
    };

    useEffect(() => {
        // If a service is already selected when component mounts
        if (formData.servicio) {
            const selectedService = availableServices.find(service => service.title === formData.servicio);
            if (selectedService) {
                const fullDescription = selectedService.description || '';
                const shortDescription = fullDescription.split('.')[0] + '.';
                setSelectedServiceDescription(shortDescription);
            }
        }
    }, [formData.servicio, availableServices]);

    // Modifica esta función en StepOne.jsx
    const checkPatientExists = async (email) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://back-end-4803.onrender.com/api/pacientes/exists?email=${email}`);

            if (response.data.exists && response.data.data) {
                const patientData = response.data.data;

                // CAMBIO IMPORTANTE: Ahora guardamos el ID del paciente
                onFormDataChange({
                    paciente_id: patientData.id, // Guardamos el ID del paciente existente
                    nombre: patientData.nombre,
                    apellidoPaterno: patientData.aPaterno.trim(),
                    apellidoMaterno: patientData.aMaterno.trim(),
                    genero: patientData.genero,
                    fechaNacimiento: patientData.fechaNacimiento.split('T')[0],
                    correo: patientData.email,
                    telefono: patientData.telefono,
                    lugar: patientData.lugar,
                    omitCorreo: false,
                    omitTelefono: false,
                    pacienteExistente: true
                });

                setNotification({
                    open: true,
                    message: 'Datos del paciente cargados correctamente.',
                    type: 'success',
                });

                setTimeout(() => {
                    setNotification({ open: false, message: '', type: '' });
                }, 3000);

                setOpenLoginDialog(false);

            } else {
                setNotification({
                    open: true,
                    message: 'No se encontró un paciente registrado con este correo.',
                    type: 'warning',
                });
                onFormDataChange({ pacienteExistente: false, paciente_id: null }); // Aseguramos que paciente_id sea null
            }
        } catch (error) {
            console.error('Error al verificar el paciente:', error);
            setNotification({
                open: true,
                message: 'Error al verificar el correo electrónico. Inténtalo de nuevo.',
                type: 'error',
            });
            onFormDataChange({ pacienteExistente: false, paciente_id: null }); // Aseguramos que paciente_id sea null
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPrivacyModal = async (event) => {
        event.preventDefault();
        if (!privacyPolicy) await fetchPrivacyPolicy();
        setOpenPrivacyModal(true);
    };

    const handleOpenTermsModal = async (event) => {
        event.preventDefault();
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

    const isFormValid = () => {
        const requiredFields = [
            'nombre',
            'apellidoPaterno',
            'apellidoMaterno',
            'genero',
            'fechaNacimiento',
            'servicio',
            'lugar',
        ];

        if (!formData.omitCorreo) requiredFields.push('correo');
        if (!formData.omitTelefono) requiredFields.push('telefono');
        if (formData.lugar === 'Otro') requiredFields.push('otroLugar');

        const allFieldsFilled = requiredFields.every(
            (field) => formData[field] && !errors[field]
        );

        return allFieldsFilled && termsAccepted && captchaVerified;
    };

    const validateField = (name, value) => {
        let errorMessage = '';

        if ((name === 'correo' && formData.omitCorreo) || (name === 'telefono' && formData.omitTelefono)) {
            return '';
        }

        switch (name) {
            case 'nombre':
                if (!value.trim()) {
                    errorMessage = 'El nombre es obligatorio';
                } else if (!nameRegex.test(value)) {
                    errorMessage = 'Solo se permiten letras y espacios';
                }
                break;
            case 'apellidoPaterno':
                if (!value.trim()) {
                    errorMessage = 'El apellido paterno es obligatorio';
                } else if (!nameRegex.test(value)) {
                    errorMessage = 'Solo se permiten letras y espacios';
                }
                break;
            case 'apellidoMaterno':
                if (!value.trim()) {
                    errorMessage = 'El apellido materno es obligatorio';
                } else if (!nameRegex.test(value)) {
                    errorMessage = 'Solo se permiten letras y espacios';
                }
                break;
            case 'genero':
                if (!value.trim()) {
                    errorMessage = 'El género es obligatorio';
                }
                break;
            case 'fechaNacimiento':
                if (!value.trim()) {
                    errorMessage = 'La fecha de nacimiento es obligatoria';
                } else if (!dateRegex.test(value)) {
                    errorMessage = 'Formato de fecha inválido (YYYY-MM-DD)';
                }
                break;
            case 'correo':
                if (!value.trim()) {
                    errorMessage = 'El correo es obligatorio o marca la casilla "Omitir correo"';
                } else if (!emailRegex.test(value)) {
                    errorMessage = 'Correo electrónico inválido';
                }
                break;
            case 'telefono':
                if (!value.trim()) {
                    errorMessage = 'El teléfono es obligatorio o marca la casilla "Omitir teléfono"';
                } else if (!phoneRegex.test(value)) {
                    errorMessage = 'Debe contener 10 dígitos';
                }
                break;
            case 'lugar':
                if (!value.trim()) {
                    errorMessage = 'El lugar de proveniencia es obligatorio';
                }
                break;
            case 'otroLugar':
                if (formData.lugar === 'Otro' && !value.trim()) {
                    errorMessage = 'Especifica el lugar si seleccionaste "Otro"';
                }
                break;

            default:
                break;
        }
        return errorMessage;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Manejar los checkboxes
        if (type === 'checkbox') {
            onFormDataChange({ [name]: checked });

            if (name === 'omitCorreo' && checked) {
                onFormDataChange({ correo: '' });
                setErrors((prev) => ({ ...prev, correo: '' }));
            } else if (name === 'omitCorreo' && !checked) {
                onFormDataChange({ correo: formData.correo || '' });
            }

            if (name === 'omitTelefono' && checked) {
                onFormDataChange({ telefono: '' });
                setErrors((prev) => ({ ...prev, telefono: '' }));
            } else if (name === 'omitTelefono' && !checked) {
                onFormDataChange({ telefono: formData.telefono || '' });
            }

            return;
        }

        // Manejar la selección del servicio
        if (name === 'servicio') {
            const selectedService = availableServices.find(service => service.title === value);

            if (selectedService) {
                onFormDataChange({
                    servicio: selectedService.title,
                    servicio_id: selectedService.id,
                    categoria_servi: selectedService.category,
                    precio_servicio: selectedService.price
                });

                const fullDescription = selectedService.description || '';
                const shortDescription = fullDescription.split('.')[0] + '.';
                setSelectedServiceDescription(shortDescription);
            } else {
                onFormDataChange({
                    servicio: '',
                    servicio_id: null,
                    categoria_servi: '',
                    precio_servicio: 0.00
                });
                setSelectedServiceDescription('');
            }
        } else {
            // Para todos los demás campos, asignar siempre un valor controlado
            onFormDataChange({ [name]: value || '' });
        }

        const errorMessage = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));

        console.log('Datos actualizados:', { [name]: value });
    };

    const handleNext = () => {
        const requiredFields = [
            'nombre',
            'apellidoPaterno',
            'apellidoMaterno',
            'genero',
            'fechaNacimiento',
            'servicio',
            'lugar',
        ];

        if (formData.lugar === 'Otro') requiredFields.push('otroLugar');
        if (!formData.omitCorreo) requiredFields.push('correo');
        if (!formData.omitTelefono) requiredFields.push('telefono');

        // Validar los campos requeridos
        const newErrors = {};
        requiredFields.forEach((field) => {
            const errorMessage = validateField(field, formData[field]);
            if (errorMessage) newErrors[field] = errorMessage;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setNotification({
                open: true,
                message: 'Por favor, completa todos los campos requeridos correctamente.',
                type: 'error',
            });

            setTimeout(() => {
                setNotification({ open: false, message: '', type: '' });
            }, 3000);

            return;
        }

        if (!termsAccepted || !captchaVerified) {
            setNotification({
                open: true,
                message: 'Debes aceptar los términos y condiciones y resolver el captcha.',
                type: 'error',
            });

            setTimeout(() => {
                setNotification({ open: false, message: '', type: '' });
            }, 3000);

            return;
        }

        onStepCompletion('step1', true);
    };


    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                backgroundColor: colors.cardBg,
                borderRadius: 2,
                boxShadow: isDarkTheme
                    ? '0 6px 24px rgba(0,0,0,0.2)'
                    : '0 6px 24px rgba(0,0,0,0.1)'
            }}
        >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                    variant="h5"
                    sx={{
                        mb: 1.5,
                        color: colors.primary,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase'
                    }}
                >
                    <MedicalIcon sx={{ fontSize: 28 }} /> Identificación del Paciente
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
                >
                    Por favor, complete el formulario con sus datos personales para reservar su cita médica de manera rápida y segura.
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 3,
                        mb: 3,
                        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                        borderLeft: '5px solid',
                        borderColor: 'primary.main',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': { transform: 'translateY(-2px)' }
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            justifyContent: 'space-between',
                            gap: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HelpOutlineIcon color="primary" sx={{ fontSize: 24 }} />
                                <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    color="text.primary"
                                    sx={{ letterSpacing: '0.01em' }}
                                >
                                    ¿Paciente registrado o con cita?
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'center'
                            }}
                        >
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => setOpenLoginDialog(true)}
                                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
                                sx={{
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    px: 2.5,
                                    py: 0.75,
                                    fontSize: '0.85rem',
                                    textTransform: 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }
                                }}
                            >
                                Soy paciente
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setOpenAppointmentDialog(true)}
                                startIcon={<CalendarTodayIcon sx={{ fontSize: 20 }} />}
                                sx={{
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    px: 2.5,
                                    py: 0.75,
                                    fontSize: '0.85rem',
                                    textTransform: 'none',
                                    borderWidth: 2,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderWidth: 2,
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                    }
                                }}
                            >
                                Ver cita
                            </Button>
                        </Box>
                    </Box>
                </Paper>
                {/* Diálogo para verificación de pacientes registrados */}
                <Dialog
                    open={openLoginDialog}
                    onClose={() => setOpenLoginDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            p: 1
                        }
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            pb: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <AccountCircleIcon color="primary" />
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                            Verificación de Paciente
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ mt: 2, px: 3 }}>
                        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                            Por favor, ingrese el correo electrónico con el que se registró anteriormente.
                        </Typography>

                        <TextField
                            label="Correo Electrónico"
                            placeholder="email@ejemplo.com"
                            variant="outlined"
                            fullWidth
                            autoFocus
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e.target.value);
                            }}
                            error={!!emailError}
                            helperText={emailError}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />

                        <Alert
                            severity="info"
                            icon={<InfoIcon />}
                            sx={{
                                borderRadius: 2,
                                mb: 2
                            }}
                        >
                            Al verificar su correo, podremos cargar sus datos previos y agilizar el proceso.
                        </Alert>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenLoginDialog(false)}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                borderRadius: 6,
                                textTransform: 'none',
                                px: 2
                            }}
                        >
                            Atrás
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={!loading && <VerifiedUserIcon />}
                            onClick={() => {
                                if (validateEmail(email)) {
                                    setLoading(true); // Activar el estado de carga
                                    checkPatientExists(email);
                                } else {
                                    setNotification({
                                        open: true,
                                        message: 'Por favor, ingrese un correo electrónico válido.',
                                        type: 'error',
                                    });
                                }
                            }}
                            disabled={!email || !!emailError || loading} // Deshabilitar mientras carga
                            sx={{
                                borderRadius: 6,
                                textTransform: 'none',
                                px: 3,
                                fontWeight: 'bold',
                                boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar'}
                        </Button>


                    </DialogActions>
                </Dialog>

                {/* Diálogo para verificación de citas */}
                <Dialog
                    open={openAppointmentDialog}
                    onClose={() => setOpenAppointmentDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            p: 1
                        }
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            pb: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <CalendarTodayIcon color="primary" />
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                            Verificar Cita
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ mt: 2, px: 3 }}>
                        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                            Por favor, ingrese el correo electrónico asociado a su cita.
                        </Typography>

                        <TextField
                            label="Correo Electrónico"
                            placeholder="email@ejemplo.com"
                            variant="outlined"
                            fullWidth
                            autoFocus
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e.target.value);
                            }}
                            error={!!emailError}
                            helperText={emailError}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />

                        <Alert
                            severity="info"
                            icon={<InfoIcon />}
                            sx={{
                                borderRadius: 2,
                                mb: 2
                            }}
                        >
                            Al verificar su correo, podremos localizar sus citas existentes.
                        </Alert>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenAppointmentDialog(false)}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                borderRadius: 6,
                                textTransform: 'none',
                                px: 2
                            }}
                        >
                            Atrás
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={!loading && <VerifiedUserIcon />}
                            onClick={() => {
                                // Aquí deberías implementar la lógica para buscar citas
                                if (validateEmail(email)) {
                                    setLoading(true);
                                    // Llamar a función para verificar cita
                                }
                            }}
                            disabled={!email || !!emailError || loading}
                            sx={{
                                borderRadius: 6,
                                textTransform: 'none',
                                px: 3,
                                fontWeight: 'bold',
                                boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar Cita'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

            {showAlert && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: 1,
                        boxShadow: 1
                    }}
                    icon={<ErrorOutlineIcon />}
                >
                    Por favor complete los campos obligatorios y verifique las casillas.
                </Alert>
            )}

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        pb: 1
                    }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6" color="primary" fontWeight="500">
                            Información Personal
                        </Typography>
                        <Tooltip title="Todos los campos marcados con * son obligatorios">
                            <HelpOutlineIcon fontSize="small" color="action" />
                        </Tooltip>
                    </Box>
                </Grid>

                {/* Name Fields */}
                <Grid item xs={12} md={4}>
                    <Tooltip title="Ingrese su nombre de pila" placement="top">
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="primary" />
                                    </InputAdornment>
                                ),
                                readOnly: formData.pacienteExistente,
                                style: formData.pacienteExistente ? { backgroundColor: '#f5f5f5' } : {},
                            }}
                            variant="outlined"
                        />
                    </Tooltip>
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Apellido Paterno"
                        name="apellidoPaterno"
                        value={formData.apellidoPaterno}
                        onChange={handleChange}
                        required
                        error={!!errors.apellidoPaterno}
                        helperText={errors.apellidoPaterno}
                        InputProps={{
                            readOnly: formData.pacienteExistente,
                            style: formData.pacienteExistente ? { backgroundColor: '#f5f5f5' } : {},
                        }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Apellido Materno"
                        name="apellidoMaterno"
                        value={formData.apellidoMaterno}
                        onChange={handleChange}
                        required
                        error={!!errors.apellidoMaterno}
                        helperText={errors.apellidoMaterno}
                        InputProps={{
                            readOnly: formData.pacienteExistente,
                            style: formData.pacienteExistente ? { backgroundColor: '#f5f5f5' } : {},
                        }}
                        variant="outlined"
                    />
                </Grid>


                {/* Additional Personal Information */}
                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Género"
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                        required
                        error={!!errors.genero}
                        helperText={errors.genero}
                        variant="outlined"
                        disabled={formData.pacienteExistente} // Deshabilitado si el paciente existe
                    >
                        <MenuItem value="">Selecciona</MenuItem>
                        <MenuItem value="Masculino">Masculino</MenuItem>
                        <MenuItem value="Femenino">Femenino</MenuItem>
                        <MenuItem value="Prefiero no decirlo">Prefiero no decirlo</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Tooltip title="Formato: YYYY-MM-DD" placement="top">
                        <TextField
                            fullWidth
                            label="Fecha de Nacimiento"
                            name="fechaNacimiento"
                            type="date"
                            value={formData.fechaNacimiento || ''}
                            onChange={handleChange}
                            required
                            error={!!errors.fechaNacimiento}
                            helperText={errors.fechaNacimiento || 'Formato: YYYY-MM-DD'}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarIcon color="primary" />
                                    </InputAdornment>
                                ),
                                readOnly: formData.pacienteExistente, // Bloqueado si el paciente existe
                                style: formData.pacienteExistente ? { backgroundColor: '#f5f5f5' } : {}, // Indicador visual de solo lectura
                            }}
                            variant="outlined"
                        />

                    </Tooltip>
                </Grid>

                {/* Lugar de Proveniencia */}
                <Grid item xs={12}>
                    <FormControl
                        fullWidth
                        required
                        error={!!errors.lugar}
                        variant="outlined"
                        disabled={formData.pacienteExistente} // Deshabilitar si el paciente existe
                    >
                        <InputLabel>Lugar de Proveniencia</InputLabel>
                        <Select
                            value={formData.lugar}
                            onChange={handleChange}
                            label="Lugar de Proveniencia"
                            name="lugar"
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


                {/* Campo adicional si el lugar es "Otro" */}
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
                                readOnly: formData.pacienteExistente,
                                style: formData.pacienteExistente ? { backgroundColor: '#f5f5f5' } : {},
                            }}
                            variant="outlined"
                        />
                    </Grid>
                )}
                {/* Información de Contacto */}
                <Grid item xs={12}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        mt: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        pb: 1
                    }}>
                        <ContactIcon color="primary" />
                        <Typography variant="h6" color="primary" fontWeight="500">
                            Información de Contacto
                        </Typography>
                        <Tooltip title="Al menos un método de contacto es requerido">
                            <HelpOutlineIcon fontSize="small" color="action" />
                        </Tooltip>
                    </Box>
                </Grid>

                {/* Correo Electrónico */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Correo Electrónico"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        error={!!errors.correo}
                        helperText={
                            formData.pacienteExistente ? 'Correo no editable' : errors.correo || 'Ingrese su correo electrónico'
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="primary" />
                                </InputAdornment>
                            ),
                            readOnly: formData.pacienteExistente, // Solo lectura si el paciente es existente
                            style: formData.pacienteExistente ? { backgroundColor: '#f5f5f5' } : {},
                        }}
                        variant="outlined"
                        required={!formData.omitCorreo && !formData.pacienteExistente}
                        disabled={formData.omitCorreo && !formData.pacienteExistente} // Deshabilitar si se marca "Omitir correo"
                    />

                    {!formData.pacienteExistente && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.omitCorreo}
                                    onChange={(e) => onFormDataChange({ omitCorreo: e.target.checked })}
                                    color="primary"
                                />
                            }
                            label="Omitir correo"
                        />
                    )}
                </Grid>

                {/* Teléfono */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        error={!!errors.telefono}
                        helperText={
                            formData.pacienteExistente ? 'Teléfono no editable' : errors.telefono || 'Ingrese su teléfono'
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIcon color="primary" />
                                </InputAdornment>
                            ),
                            readOnly: formData.pacienteExistente, // Solo lectura si el paciente es existente
                            style: formData.pacienteExistente ? { backgroundColor: '#f5f5f5' } : {},
                        }}
                        variant="outlined"
                        required={!formData.omitTelefono && !formData.pacienteExistente}
                        disabled={formData.omitTelefono && !formData.pacienteExistente} // Deshabilitar si se marca "Omitir teléfono"
                    />

                    {!formData.pacienteExistente && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.omitTelefono}
                                    onChange={(e) => onFormDataChange({ omitTelefono: e.target.checked })}
                                    color="primary"
                                />
                            }
                            label="Omitir teléfono"
                        />
                    )}
                </Grid>

                {/* Selección del Servicio Section */}
                <Grid item xs={12}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        mt: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        pb: 1
                    }}>
                        <AssignmentIcon color="primary" />
                        <Typography variant="h6" color="primary" fontWeight="500">
                            Selección del Servicio
                        </Typography>
                        <Tooltip title="Seleccione el servicio médico que requiere">
                            <HelpOutlineIcon fontSize="small" color="action" />
                        </Tooltip>
                    </Box>
                </Grid>

                {/* Servicio Seleccionado */}
                <Grid item xs={12} md={6}>
                    <Tooltip title="Escoja el servicio que necesita" placement="top">
                        <FormControl
                            fullWidth
                            required
                            error={!!errors.servicio}
                            variant="outlined"
                        >
                            <InputLabel>Servicio</InputLabel>
                            <Select
                                value={formData.servicio}
                                onChange={handleChange}
                                label="Servicio"
                                name="servicio"
                                fullWidth
                            >
                                <MenuItem value="">Seleccione un servicio</MenuItem>
                                {availableServices.map((service) => (
                                    <MenuItem key={service.id} value={service.title}>
                                        {service.title}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.servicio && <FormHelperText error>{errors.servicio}</FormHelperText>}
                        </FormControl>
                    </Tooltip>
                </Grid>

                {/* Descripción del Servicio */}
                {selectedServiceDescription && (
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: { xs: 'flex-start', md: 'flex-start' },
                                alignItems: 'center',
                                maxWidth: '100%',
                                minHeight: '56px',
                                overflow: 'hidden',
                            }}
                        >
                            <Alert
                                severity="info"
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    wordBreak: 'break-word',
                                    boxSizing: 'border-box',
                                    padding: '8px 16px',
                                    margin: 0, // Eliminar cualquier margen que desplace el select
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'pre-line',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {selectedServiceDescription}
                                </Typography>
                            </Alert>
                        </Box>
                    </Grid>
                )}

                {/* Términos, Política y Captcha */}
                <Grid item xs={12}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        mt: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        pb: 1
                    }}>
                        <TermsIcon color="primary" />
                        <Typography variant="h6" color="primary" fontWeight="500">
                            Términos y Condiciones
                        </Typography>
                        <Tooltip title="Debe aceptar los términos para continuar">
                            <HelpOutlineIcon fontSize="small" color="action" />
                        </Tooltip>
                    </Box>
                </Grid>

                {/* Checkbox para Aceptar Términos y Política */}
                <Grid item xs={12}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        alignItems: 'center',
                        mb: 3,
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: alpha(colors.primary, 0.03)
                    }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Acepto los <Link href="#" onClick={handleOpenTermsModal}>términos y condiciones</Link>
                                    y la <Link href="#" onClick={handleOpenPrivacyModal}>política de privacidad</Link>.
                                </Typography>
                            }
                        />

                        {/* Captcha Centrado */}
                        <Box sx={{ maxWidth: '300px', width: '100%' }}>
                            <CustomRecaptcha
                                onCaptchaChange={setCaptchaVerified}
                                isDarkMode={isDarkTheme}
                            />
                        </Box>
                    </Box>
                </Grid>

                {/* Continue Button */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            py: 1.5,
                            px: 4,
                            borderRadius: 2,
                            boxShadow: 3
                        }}
                        disabled={!isFormValid()}
                        size="large"
                    >
                        Continuar
                    </Button>
                </Grid>

                {/* Terms Modal */}
                <Dialog
                    open={openTermsModal}
                    onClose={handleCloseTermsModal}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TermsIcon /> Términos y Condiciones
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography>{termsConditions}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseTermsModal} color="primary">
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Privacy Modal */}
                <Dialog
                    open={openPrivacyModal}
                    onClose={handleClosePrivacyModal}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PrivacyIcon /> Política de Privacidad
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography>{privacyPolicy}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClosePrivacyModal} color="primary">
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Paper>
    );
};

export default StepOne;