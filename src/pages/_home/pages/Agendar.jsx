import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    useMediaQuery,
    useTheme,
    Container,
    Paper,
    Tooltip,
    Zoom,
    CircularProgress} from '@mui/material';
import {
    ArrowBack,
    AccountCircle as AccountCircleIcon,
    PersonSearch as PersonSearchIcon,
    EventAvailable as EventAvailableIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Importación de los pasos
import StepOne from './Steps/StepOne';
import StepTwo from './Steps/StepTwo';
import StepThree from './Steps/StepThree';
import StepFour from './Steps/StepFour';

const steps = [
    {
        label: 'Identificación',
        icon: AccountCircleIcon,
        description: 'Ingresa tus datos personales'
    },
    {
        label: 'Profesional',
        icon: PersonSearchIcon,
        description: 'Selecciona el especialista'
    },
    {
        label: 'Disponibilidad',
        icon: EventAvailableIcon,
        description: 'Elige fecha y hora'
    },
    {
        label: 'Confirmación',
        icon: CheckCircleIcon,
        description: 'Confirma tu cita'
    }
];

const ReservaCitas = () => {
    const { isDarkTheme } = useThemeContext(); const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [stepsCompleted, setStepsCompleted] = useState({
        step1: false,
        step2: false,
        step3: false,
        step4: false
    });
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'info'
    });
    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        genero: '',
        fechaNacimiento: '',
        correo: '',
        telefono: '',
        especialista: '',
        odontologo_id: '',
        lugar: '',
        otroLugar: '',
        servicio: '',
        servicio_id: null, // Asegurarse de que este campo existe
        fechaCita: '',
        horaCita: '',
        omitCorreo: false,
        omitTelefono: false,
        pacienteExistente: false,
        paciente_id: null // Añadir explícitamente este campo
    });

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

    const location = useLocation();
    const servicioSeleccionado = location.state?.servicioSeleccionado || null;

    const colors = {
        background: isDarkTheme ? '#0A1929' : '#F5F7FA',
        primary: isDarkTheme ? '#1E88E5' : '#1976D2',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondary: isDarkTheme ? '#90CAF9' : '#42A5F5',
        cardBg: isDarkTheme ? '#132F4C' : '#ffffff',
        accent: isDarkTheme ? '#82B1FF' : '#2196F3',
        error: '#f44336',
        success: '#4caf50',
        warning: '#ff9800'
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleStepCompletion = (step, isCompleted, stepData = {}) => {
        setStepsCompleted((prev) => ({
            ...prev,
            [step]: isCompleted,
        }));

        handleFormDataChange(stepData);

        if (isCompleted) {
            handleNextStep();
        }
    };

    const handleNextStep = () => {
        setIsLoading(true);
        setTimeout(() => {
            setActiveStep((prev) => prev + 1);
            setIsLoading(false);
            setNotification({
                open: true,
                message: 'Paso completado con éxito',
                type: 'success',
            });
            setTimeout(() => {
                setNotification({ open: false, message: '', type: '' });
            }, 3000);
        }, 1000);
    };

    const handlePrevStep = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleFormDataChange = (newData) => {
        setFormData((prev) => {
            const updatedData = { ...prev, ...newData };
            console.log('Datos actualizados:', updatedData); // Para depuración
            return updatedData;
        });
    };

    const handleDateTimeSelection = (date, time) => {
        setSelectedDate(date);
        setSelectedTime(time);

        // Validar si 'date' es un objeto Date válido antes de usar toISOString()
        if (date instanceof Date && !isNaN(date)) {
            handleFormDataChange({ fechaCita: date.toISOString().split('T')[0] });
        } else {
            console.error('Fecha no válida en handleDateTimeSelection:', date);
        }

        if (time) {
            handleFormDataChange({ horaCita: time });
        }
    };

    useEffect(() => {
        if (servicioSeleccionado) {
            setFormData((prev) => ({
                ...prev,
                servicio: servicioSeleccionado.title,
                servicio_id: servicioSeleccionado.id,
                categoria_servi: servicioSeleccionado.category,
                precio_servicio: servicioSeleccionado.price
            }));

            // Also show a notification
            setNotification({
                open: true,
                message: `Servicio "${servicioSeleccionado.title}" seleccionado. Complete los campos restantes.`,
                type: 'info',
            });
        }
    }, [servicioSeleccionado]);

    const renderStep = () => {
        const commonProps = {
            colors,
            isDarkTheme,
            onNext: handleNextStep,
            onPrev: handlePrevStep,
            formData,
            onFormDataChange: handleFormDataChange,
            onStepCompletion: handleStepCompletion,
            setNotification,
        };

        switch (activeStep) {
            case 0:
                return <StepOne {...commonProps} />;
            case 1:
                return <StepTwo
                    {...commonProps}
                    onFormDataChange={handleFormDataChange}
                />;
            case 2:
                return (
                    <StepThree
                        {...commonProps}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onDateTimeChange={handleDateTimeSelection}
                        onFormDataChange={handleFormDataChange}
                    />
                );
            case 3:
                return <StepFour {...commonProps} />;
            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: colors.background,
                transition: 'all 0.3s ease',
                pb: 4
            }}
        >
            {/* Header */}
            <Paper
                elevation={4}
                sx={{
                    backgroundColor: '#0D47A1', // Azul más oscuro
                    borderRadius: { xs: 0, sm: '0 0 20px 20px' },
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: isDarkTheme
                        ? 'linear-gradient(45deg, #0A3760 30%, #0D47A1 90%)'
                        : 'linear-gradient(45deg, #1565C0 30%, #0D47A1 90%)',
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            py: { xs: 2, sm: 3 },
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}
                    >
                        <Tooltip
                            title="Volver al inicio"
                            placement="right"
                            TransitionComponent={Zoom}
                        >
                            <IconButton
                                component={Link}
                                to="/"
                                sx={{
                                    position: 'absolute',
                                    left: 8,
                                    color: '#ffffff',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    padding: '4px 8px', // Tamaño reducido
                                    fontSize: '0.8rem', // Fuente más pequeña
                                    borderRadius: '20px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <ArrowBack sx={{ fontSize: '1rem' }} />
                                    {!isSmallScreen && (
                                        <Typography
                                            sx={{
                                                color: '#ffffff',
                                                fontSize: '0.85rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            Regresar
                                        </Typography>
                                    )}
                                </Box>
                            </IconButton>
                        </Tooltip>

                        <Typography
                            variant={isSmallScreen ? 'h6' : 'h5'}
                            sx={{
                                color: '#ffffff',
                                fontWeight: 700,
                                textAlign: 'center',
                                maxWidth: '80%',
                                textShadow: '0px 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            Programa tu consulta
                        </Typography>
                    </Box>
                </Container>
            </Paper>


            {/* Stepper */}
            <Container maxWidth="lg" sx={{ mb: 4 }}>
                <Paper
                    elevation={3}
                    sx={{
                        backgroundColor: colors.cardBg,
                        borderRadius: 3,
                        py: 4,
                        px: { xs: 2, sm: 4 },
                        boxShadow: isDarkTheme
                            ? '0 4px 20px rgba(0,0,0,0.3)'
                            : '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                >
                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel
                        orientation="horizontal"
                        sx={{
                            '& .MuiStepLabel-label': {
                                color: colors.text,
                                fontSize: { xs: '0.8rem', sm: '1rem' },
                                fontWeight: 500,
                                mt: 1,
                                display: isSmallScreen ? 'none' : 'block'
                            },
                            '& .MuiStep-root': {
                                minWidth: 'auto',
                            },
                            // Ajusta la posición vertical de la línea
                            '& .MuiStepConnector-alternativeLabel': {
                                top: 20, // Prueba con 10, 12, 14, etc. para centrar
                            },
                            // Grosor y color de la línea
                            '& .MuiStepConnector-line': {
                                borderTopWidth: 2,
                                borderColor: '#ccc',
                                width: '95%',
                                marginLeft: '5px',
                            },
                        }}
                    >
                        {steps.map(({ label, icon: Icon, description }) => (
                            <Step key={label}>
                                <StepLabel
                                    StepIconComponent={({ active, completed }) => (
                                        <Tooltip
                                            title={description}
                                            placement="top"
                                            TransitionComponent={Zoom}
                                        >
                                            <Box
                                                sx={{
                                                    width: 45,
                                                    height: 45,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: `2px solid ${active || completed ? colors.accent : colors.secondary}`,
                                                    backgroundColor: active || completed ? colors.accent : 'transparent',
                                                    transition: 'all 0.3s ease',
                                                    transform: active ? 'scale(1.1)' : 'scale(1)',
                                                    boxShadow: active ? '0 0 15px rgba(33,150,243,0.3)' : 'none'
                                                }}
                                            >
                                                {isLoading && active ? (
                                                    <CircularProgress
                                                        size={24}
                                                        sx={{ color: '#ffffff' }}
                                                    />
                                                ) : (
                                                    <Icon
                                                        sx={{
                                                            color: active || completed ? '#ffffff' : colors.secondary,
                                                            fontSize: 24,
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Tooltip>
                                    )}
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Paper>
            </Container>

            {/* Content */}
            <Container maxWidth="lg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </Container>

            {/* Notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ open: false, message: '', type: '' })}
            />

        </Box>
    );
};

export default ReservaCitas;