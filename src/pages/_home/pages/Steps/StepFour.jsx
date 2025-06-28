import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Chip,
    Card,
    CardContent,
    Avatar,
    Divider,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Home as HomeIcon,
    EventAvailable as EventAvailableIcon,
    MedicalServices as MedicalServicesIcon,
    Place as PlaceIcon,
    MonetizationOn as PriceIcon,
    Category as CategoryIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StepFour = ({
    colors,
    isDarkTheme,
    formData,
    onPrev,
    onStepCompletion,
    setNotification
}) => {
    const navigate = useNavigate();
    const [serviceDetails, setServiceDetails] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchServiceDetails = async () => {
            if (!formData.servicio) {
                console.warn('No se ha seleccionado ningún servicio.');
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get('https://back-end-4803.onrender.com/api/servicios/all');
                const selectedService = response.data.find(
                    service => service.title?.toLowerCase() === formData.servicio?.toLowerCase()
                );

                if (!selectedService) {
                    console.warn('El servicio seleccionado no se encuentra en la base de datos.');
                    setNotification({
                        open: true,
                        message: 'Servicio no encontrado en la base de datos',
                        type: 'warning'
                    });
                }

                setServiceDetails(selectedService);
            } catch (error) {
                console.error('Error al cargar los detalles del servicio:', error);
                setNotification({
                    open: true,
                    message: 'Error al cargar los detalles del servicio',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchServiceDetails();
    }, [formData.servicio]);


    const handleConfirm = async () => {
        if (!formData.nombre || !formData.apellidoPaterno || !formData.fechaCita || !formData.horaCita) {
            setNotification({
                open: true,
                message: 'Faltan datos obligatorios para confirmar la cita.',
                type: 'warning'
            });
            return;
        }

        try {
            setLoading(true);

            const citaData = {
                paciente_id: formData.paciente_id ? parseInt(formData.paciente_id) : null,
                nombre: formData.nombre,
                apellido_paterno: formData.apellidoPaterno,
                apellido_materno: formData.apellidoMaterno,
                genero: formData.genero,
                fecha_nacimiento: formData.fechaNacimiento,
                correo: formData.correo || '',
                telefono: formData.telefono || '',
                odontologo_id: formData.odontologo_id || null,
                odontologo_nombre: formData.especialista,
                servicio_id: formData.servicio_id || null,
                servicio_nombre: formData.servicio,
                categoria_servicio: serviceDetails?.category || 'No especificado',
                precio_servicio: serviceDetails?.price || 0.00,
                fecha_hora: `${formData.fechaCita}T${formData.horaCita}`,
                estado: 'Pendiente',
                notas: formData.notas || '',
                horario_id: formData.horario_id || null
            };
    
            console.log('Datos enviados para la cita/tratamiento:', citaData);
            console.log('¿Paciente registrado?:', formData.pacienteExistente ? 'Sí' : 'No');
            console.log('ID del paciente:', formData.paciente_id);

            const response = await axios.post('https://back-end-4803.onrender.com/api/citas/nueva', citaData);

            if (response.status === 201) {
                const esTratamiento = response.data.es_tratamiento;
            
                let mensaje = esTratamiento 
                    ? '¡Tratamiento solicitado correctamente! El odontólogo revisará y confirmará tu solicitud.' 
                    : '¡Cita agendada exitosamente!';
                
                setNotification({
                    open: true,
                    message: mensaje,
                    type: 'success'
                });
    
                setTimeout(() => {
                    setNotification({ open: false, message: '', type: '' });
                }, 3000);
    
                onStepCompletion('step4', true);
                
                // Navegar a la página de confirmación con la información
                navigate('/confirmacion', {
                    state: {
                        // Datos básicos de la cita
                        esTratamiento: esTratamiento,
                        citaId: response.data.cita_id,
                        tratamientoId: response.data.tratamiento_id,
                        fechaCita: formData.fechaCita,
                        horaCita: formData.horaCita,
                        servicio: formData.servicio,
                        especialista: formData.especialista,
                        
                        // Datos importantes para la lógica de alertas
                        pacienteExistente: formData.pacienteExistente || false,
                        correo: formData.correo || '',
                        telefono: formData.telefono || '',
                        omitioCorreo: !formData.correo,
                        omitioTelefono: !formData.telefono,
                        
                        // Datos adicionales que podrían ser útiles
                        genero: formData.genero,
                        nombre: formData.nombre,
                        apellidoPaterno: formData.apellidoPaterno,
                        apellidoMaterno: formData.apellidoMaterno,
                        paciente_id: formData.paciente_id,
                        servicio_id: formData.servicio_id,
                        categoriaServicio: serviceDetails?.category,
                        precioServicio: serviceDetails?.price
                    }
                });
            }
        } catch (error) {
            console.error('Error al guardar la cita/tratamiento:', error);

            let mensajeError = 'Error al procesar tu solicitud. Inténtalo de nuevo.';

            // Si hay un mensaje específico del servidor, lo usamos
            if (error.response && error.response.data && error.response.data.message) {
                mensajeError = error.response.data.message;
            }

            setNotification({
                open: true,
                message: mensajeError,
                type: 'error'
            });

            setTimeout(() => {
                setNotification({ open: false, message: '', type: '' });
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = formData.fechaCita
    ? (() => {
        // Extraer solo la parte de la fecha (YYYY-MM-DD)
        const soloFecha = formData.fechaCita.split('T')[0];
        return new Date(`${soloFecha}T12:00:00`).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
      })()
    : 'Fecha no seleccionada';

    const formattedTime = formData.horaCita || 'Hora no seleccionada';
    const formattedEmail = formData.correo || 'No proporcionado';
    const formattedPhone = formData.telefono || 'No proporcionado';
    const formattedService = formData.servicio || 'No especificado';

    return (
        <Paper
            elevation={3}
            sx={{
                p: { xs: 2, sm: 4 },
                backgroundColor: colors.cardBg,
                borderRadius: 3,
                boxShadow: isDarkTheme
                    ? '0 4px 20px rgba(0,0,0,0.3)'
                    : '0 4px 20px rgba(0,0,0,0.1)'
            }}
        >
            <Typography
                variant="h5"
                sx={{ mb: 3, textAlign: 'center', color: colors.primary, fontWeight: 'bold' }}
            >
                Resumen de tu {serviceDetails && serviceDetails.tratamiento === 1 ? 'Tratamiento' : 'Cita'}
            </Typography>

            <Card
                elevation={6}
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${colors.primary}`,
                    mb: 4,
                    overflow: 'visible'
                }}
            >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Información del Paciente */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        mb: 3,
                        pb: 2,
                        borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                        <Avatar
                            sx={{
                                bgcolor: colors.accent,
                                width: 60,
                                height: 60,
                                mr: 2,
                                mb: { xs: 2, sm: 0 }
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
                                {formData.nombre} {formData.apellidoPaterno} {formData.apellidoMaterno}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.secondary }}>
                                {formData.genero}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Sección de Información de Contacto */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: colors.secondary }}>
                            Información de Contacto
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <EmailIcon sx={{ mr: 1, color: colors.primary }} />
                                    <Typography variant="body2">{formattedEmail}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <PhoneIcon sx={{ mr: 1, color: colors.primary }} />
                                    <Typography variant="body2">{formattedPhone}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Sección de Detalles de la Cita */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: colors.secondary }}>
                            Detalles de la {serviceDetails && serviceDetails.tratamiento === 1 ? 'Primera Cita' : 'Cita'}
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Paper elevation={1} sx={{ p: 1.5, borderLeft: `4px solid ${colors.primary}` }}>
                                    <Typography variant="caption" sx={{ display: 'block', color: colors.secondary }}>
                                        Fecha {serviceDetails && serviceDetails.tratamiento === 1 ? 'Propuesta' : ''}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CalendarIcon sx={{ mr: 1, fontSize: 20, color: colors.primary }} />
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {formattedDate}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Paper elevation={1} sx={{ p: 1.5, borderLeft: `4px solid ${colors.primary}` }}>
                                    <Typography variant="caption" sx={{ display: 'block', color: colors.secondary }}>
                                        Hora {serviceDetails && serviceDetails.tratamiento === 1 ? 'Propuesta' : ''}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TimeIcon sx={{ mr: 1, fontSize: 20, color: colors.primary }} />
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {formattedTime}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={1} sx={{ p: 1.5, borderLeft: `4px solid ${colors.primary}` }}>
                                    <Typography variant="caption" sx={{ display: 'block', color: colors.secondary }}>
                                        Especialista
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <EventAvailableIcon sx={{ mr: 1, fontSize: 20, color: colors.primary }} />
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {formData.especialista || 'No seleccionado'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Sección de Detalles del Servicio */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: colors.secondary }}>
                            Detalles del {serviceDetails && serviceDetails.tratamiento === 1 ? 'Tratamiento' : 'Servicio'}
                        </Typography>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : serviceDetails ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Paper elevation={1} sx={{ p: 1.5, borderLeft: `4px solid ${colors.accent}` }}>
                                        <Typography variant="caption" sx={{ display: 'block', color: colors.secondary }}>
                                            {serviceDetails.tratamiento === 1 ? 'Tratamiento' : 'Servicio'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <MedicalServicesIcon sx={{ mr: 1, fontSize: 20, color: colors.accent }} />
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {serviceDetails.title}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper elevation={1} sx={{ p: 1.5, borderLeft: `4px solid ${colors.accent}` }}>
                                        <Typography variant="caption" sx={{ display: 'block', color: colors.secondary }}>
                                            Categoría
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CategoryIcon sx={{ mr: 1, fontSize: 20, color: colors.accent }} />
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {serviceDetails.category || 'Sin categoría'}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper elevation={1} sx={{ p: 1.5, borderLeft: `4px solid ${colors.accent}`, borderRadius: 1 }}>
                                        <Typography variant="caption" sx={{ display: 'block', color: colors.secondary }}>
                                            Precio
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PriceIcon sx={{ mr: 1, fontSize: 20, color: colors.accent }} />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                ${serviceDetails.price || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        ) : (
                            <Box sx={{ p: 2, bgcolor: isDarkTheme ? 'rgba(255,0,0,0.1)' : '#fff8f8', borderRadius: 1, border: '1px solid #ffcccc' }}>
                                <Typography variant="body2" color="error">
                                    No se encontraron detalles del servicio seleccionado.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {serviceDetails && serviceDetails.tratamiento === 1 && (
                <Box sx={{ mt: 3, mb: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            bgcolor: isDarkTheme ? 'rgba(33, 150, 243, 0.1)' : '#e3f2fd',
                            borderRadius: 2,
                            border: `1px solid ${colors.primary}`,
                            borderLeft: `4px solid ${colors.primary}`
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                color: colors.primary,
                                mb: 1
                            }}
                        >
                            <InfoIcon sx={{ mr: 1 }} /> Información sobre tratamientos
                        </Typography>

                        <Typography variant="body2" paragraph>
                            Has seleccionado un servicio que es un <strong>tratamiento</strong>, lo que implica un proceso que requerirá
                            {serviceDetails.citasEstimadas && serviceDetails.citasEstimadas > 1
                                ? ` aproximadamente ${serviceDetails.citasEstimadas} sesiones.`
                                : ' múltiples sesiones.'}
                        </Typography>

                        <Typography variant="body2">
                            <strong>Próximos pasos:</strong>
                            <Box component="ol" sx={{ mt: 1, pl: 2 }}>
                                <li>Tu solicitud de tratamiento será enviada con la fecha y hora que has seleccionado.</li>
                                <li>Un odontólogo revisará tu caso y confirmará el tratamiento.</li>
                                <li>Recibirás una notificación cuando tu tratamiento sea confirmado.</li>
                                <li>La fecha seleccionada será tu primera cita del tratamiento.</li>
                            </Box>
                        </Typography>
                    </Paper>
                </Box>
            )}

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                gap: 2,
                mt: 4
            }}>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onPrev}
                    fullWidth={window.innerWidth < 600}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 8,
                        px: 3,
                        py: 1.2
                    }}
                >
                    Atrás
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirm}
                    startIcon={<CheckCircleIcon />}
                    fullWidth={window.innerWidth < 600}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 8,
                        px: 3,
                        py: 1.2,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    {serviceDetails && serviceDetails.tratamiento === 1
                        ? 'Solicitar Tratamiento'
                        : 'Confirmar Cita'
                    }
                </Button>
            </Box>
        </Paper>
    );
};

export default StepFour;
