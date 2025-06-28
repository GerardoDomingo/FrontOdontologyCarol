import React, { useState, useEffect, Suspense, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Fade,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Tooltip,
    IconButton,
    Slide,
    Zoom,
    CardMedia,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    useMediaQuery,
    useTheme as useMuiTheme,
    IconButton as MuiIconButton,
    Skeleton,
    Stack,
    Divider,
    Avatar,
    Paper,
    Collapse,
    SwipeableDrawer,
    Backdrop,
    Grow,
    Fab,
    Snackbar,
    Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Timer,
    AttachMoney,
    CheckCircleOutline,
    Warning,
    Info,
    Schedule,
    LocalHospital,
    Star,
    Assignment,
    CalendarMonth,
    HelpOutline,
    Close,
    CheckCircle,
    AccessTime,
    Description,
    ThumbUp,
    ThumbDown,
    Share,
    ContentCopy,
    MedicalServices,
    ExpandMore,
    ExpandLess,
    WhatsApp as WhatsAppIcon,
    Email as EmailIcon,
    Link as LinkIcon,
    ArrowUpward,
    ZoomIn,
    ZoomOut,
    KeyboardArrowUp
} from '@mui/icons-material';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Componente principal del diálogo de detalles del servicio
const ServicioDetalleDialog = ({ open, onClose, servicioId, onAgendarCita, service: initialService = null }) => {
    // Estados para datos y UI
    const [service, setService] = useState(initialService);
    const [loading, setLoading] = useState(!initialService);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const { isDarkTheme } = useThemeContext();
    const [imageLoading, setImageLoading] = useState(true);
    const muiTheme = useMuiTheme();
    const fullScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(muiTheme.breakpoints.down('lg'));
    
    // Estados para interacción
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [imageZoomed, setImageZoomed] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Referencias
    const dialogContentRef = useRef(null);
    const imageRef = useRef(null);
    
    // Optimización: Cache para servicios
    const [serviceCache, setServiceCache] = useState({});

    // Configuración de colores
    const colors = {
        background: isDarkTheme ? '#121212' : '#f8f9fa',
        primary: isDarkTheme ? '#00BCD4' : '#03427C',
        text: isDarkTheme ? '#ffffff' : '#1a1a1a',
        secondary: isDarkTheme ? '#A0AEC0' : '#666666',
        cardBg: isDarkTheme ? '#1E1E1E' : '#ffffff',
        accent: isDarkTheme ? '#4FD1C5' : '#2B6CB0',
        success: isDarkTheme ? '#4CAF50' : '#4CAF50',
        warning: isDarkTheme ? '#FF9800' : '#FF9800',
        cardBorder: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        cardShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
        gradient: isDarkTheme
            ? 'linear-gradient(135deg, #1E1E1E 0%, #121212 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        treatment: isDarkTheme ? '#5CDB5C' : '#4CAF50', // Verde más brillante en oscuro
        nonTreatment: isDarkTheme ? '#FF7070' : '#FF5252', // Rojo más brillante en oscuro
    };

    // Control de scroll para mostrar/ocultar botón "volver arriba"
    useEffect(() => {
        if (!dialogContentRef.current) return;
        
        const handleScroll = () => {
            const scrollTop = dialogContentRef.current.scrollTop;
            setShowScrollTop(scrollTop > 300);
        };
        
        const contentElement = dialogContentRef.current;
        contentElement.addEventListener('scroll', handleScroll);
        
        return () => {
            if (contentElement) {
                contentElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [open]);

    // Prefetch servicios en segundo plano
    useEffect(() => {
        if (servicioId && !serviceCache[servicioId] && !initialService) {
            const prefetchService = async () => {
                try {
                    const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/get/${servicioId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setServiceCache(prev => ({ ...prev, [servicioId]: data }));
                    }
                } catch (error) {
                    console.log("Prefetch en segundo plano falló silenciosamente");
                }
            };
            prefetchService();
        }
    }, [servicioId, serviceCache, initialService]);

    // Gestionar apertura/cierre del diálogo
    useEffect(() => {
        if (open) {
            if (initialService) {
                setService(initialService);
                setLoading(false);
                setError(null);
            } else if (servicioId) {
                // Cargar desde caché si existe
                if (serviceCache[servicioId]) {
                    setService(serviceCache[servicioId]);
                    setLoading(false);
                    setError(null);
                } else {
                    setLoading(true);
                    setError(null);
                    fetchService();
                }
            }
            // Reducir el tiempo de espera para la animación
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            if (!initialService) {
                // Solo limpiamos el servicio si no fue proporcionado inicialmente
                setTimeout(() => {
                    if (!open) setService(null);
                }, 200);
            }
        }
    }, [open, servicioId, initialService, serviceCache]);

    // Función para obtener datos del servicio
    const fetchService = async () => {
        try {
            const controller = new AbortController();
            // Reducir timeout para mejorar percepción de velocidad
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            // Usar una variable para monitorear si ya se procesó la respuesta
            let isProcessed = false;

            // Implementar un timeout de renderizado para mostrar datos parciales
            const renderTimeoutId = setTimeout(() => {
                if (!isProcessed && serviceCache[servicioId]) {
                    // Si después de 300ms no tenemos respuesta pero tenemos datos en caché, los usamos temporalmente
                    setService(serviceCache[servicioId]);
                    setLoading(false);
                }
            }, 300);

            const response = await fetch(
                `https://back-end-4803.onrender.com/api/servicios/get/${servicioId}`,
                {
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);
            clearTimeout(renderTimeoutId);
            isProcessed = true;

            if (!response.ok) throw new Error('No se pudo obtener la información del servicio.');
            const data = await response.json();

            // Actualizar la caché con los datos nuevos
            setServiceCache(prev => ({ ...prev, [servicioId]: data }));
            setService(data);
        } catch (error) {
            if (error.name === 'AbortError') {
                setError('La solicitud tardó demasiado. Por favor, inténtalo de nuevo.');
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar cita
    const handleAgendarCita = () => {
        if (onAgendarCita && service) {
            onAgendarCita(service);  
        }
        onClose();
    };

    // Función para copiar información del servicio
    const copyServiceInfo = () => {
        if (!service) return;
        
        const messageText = createServiceMessage();
        
        navigator.clipboard.writeText(messageText)
            .then(() => {
                showNotification('Información copiada al portapapeles', 'success');
            })
            .catch(() => {
                showNotification('No se pudo copiar la información', 'error');
            });
    };
    
    // Mostrar notificación
    const showNotification = (message, severity = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };
    
    // Cerrar notificación
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    // Crear mensaje con datos del servicio para compartir
    const createServiceMessage = () => {
        if (!service) return '';
        
        // Incluir información sobre si es tratamiento y número de citas
        const treatmentInfo = service.tratamiento === 1 
            ? `\n• Tipo: Tratamiento${service.citasEstimadas > 1 ? ` (${service.citasEstimadas} citas aprox.)` : ''}`
            : '\n• Tipo: Servicio (sesión única)';
            
        return `*ODONTOLOGÍA CAROL*\n\n*${service.title}*\n\n${service.description}\n\n*Detalles del servicio:*\n• Precio: $${service.price}\n• Duración estimada: ${service.duration}${treatmentInfo}\n\nPuedes agendar tu cita o solicitar más información sobre este servicio a través de nuestra página web.\n\n*Visítanos en:* https://odontologiacarol.com\n\nTu sonrisa es nuestra prioridad.\nOdontología Carol - Atención dental de calidad.`;
    };
    
    // Compartir vía WhatsApp
    const shareViaWhatsApp = () => {
        const message = createServiceMessage();
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        showNotification('Abriendo WhatsApp...', 'success');
        setShowShareOptions(false);
    };
    
    // Compartir vía Email
    const shareViaEmail = () => {
        const subject = `Información sobre servicio dental: ${service?.title || 'Odontología Carol'}`;
        const body = createServiceMessage().replace(/\*/g, '').replace(/\n/g, '%0D%0A');
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.open(mailtoUrl, '_blank');
        showNotification('Preparando email...', 'success');
        setShowShareOptions(false);
    };

    // Función para manejar secciones activas
    const handleSectionActivity = (sectionTitle) => {
        setActiveSection(activeSection === sectionTitle ? null : sectionTitle);
    };
    
    // Volver al inicio del diálogo
    const scrollToTop = () => {
        if (dialogContentRef.current) {
            dialogContentRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    
    // Componente para encabezados de sección
    const SectionHeader = ({ icon: Icon, title, description, color = colors.primary }) => (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                pb: 1,
                borderBottom: `2px solid ${color}`,
                transition: 'all 0.2s ease'
            }}
        >
            <Avatar sx={{ 
                bgcolor: color, 
                mr: 1.5,
                boxShadow: `0 2px 8px ${color}30`
            }}>
                <Icon sx={{ color: '#fff', fontSize: 20 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                    color: colors.text, 
                    fontWeight: 600, 
                    lineHeight: 1.2 
                }}>
                    {title}
                </Typography>
                <Typography variant="caption" sx={{ 
                    color: colors.secondary, 
                    display: 'block', 
                    mt: 0.5 
                }}>
                    {description}
                </Typography>
            </Box>
        </Box>
    );

    // Componente de Esqueleto para cargar
    const SkeletonLoader = () => (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={5} lg={4}>
                    <Skeleton 
                        variant="rectangular" 
                        height={350} 
                        sx={{ 
                            borderRadius: 2, 
                            mb: 2,
                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                        }} 
                    />
                </Grid>
                <Grid item xs={12} md={7} lg={8}>
                    <Skeleton 
                        variant="text" 
                        height={60} 
                        sx={{ 
                            mb: 1,
                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                        }} 
                    />
                    <Skeleton 
                        variant="text" 
                        height={40} 
                        sx={{ 
                            mb: 1,
                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                        }} 
                    />
                    <Skeleton 
                        variant="text" 
                        height={80} 
                        sx={{ 
                            mb: 2,
                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                        }} 
                    />

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Skeleton 
                            variant="rectangular" 
                            width={100} 
                            height={32} 
                            sx={{ 
                                borderRadius: 16,
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                            }} 
                        />
                        <Skeleton 
                            variant="rectangular" 
                            width={100} 
                            height={32} 
                            sx={{ 
                                borderRadius: 16,
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                            }} 
                        />
                    </Box>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {[1, 2, 3, 4].map((item) => (
                    <Grid item xs={12} sm={6} key={item}>
                        <Card sx={{ 
                            height: '100%', 
                            borderRadius: 2,
                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                            border: `1px solid ${colors.cardBorder}`
                        }}>
                            <CardContent>
                                <Skeleton 
                                    variant="text" 
                                    height={40} 
                                    sx={{ 
                                        mb: 2,
                                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                                    }} 
                                />
                                <Stack spacing={2}>
                                    {[1, 2, 3].map(i => (
                                        <Skeleton 
                                            key={i}
                                            variant="text" 
                                            height={24} 
                                            width={`${Math.floor(60 + Math.random() * 40)}%`}
                                            sx={{ 
                                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                                            }} 
                                        />
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    // Componente para mostrar errores
    const ErrorDisplay = ({ message }) => (
        <Box
            sx={{
                textAlign: 'center',
                py: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
            }}
        >
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: isDarkTheme ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Warning sx={{ fontSize: 40, color: '#f44336' }} />
            </Box>
            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600 }}>
                No pudimos cargar el servicio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                {message || 'Servicio no encontrado'}
            </Typography>
            <Button
                variant="outlined"
                onClick={() => {
                    setLoading(true);
                    setError(null);
                    fetchService();
                }}
                sx={{ 
                    mt: 2,
                    borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : colors.primary,
                    color: isDarkTheme ? 'rgba(255,255,255,0.8)' : colors.primary,
                    '&:hover': {
                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.5)' : colors.primary,
                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)'
                    }
                }}
            >
                Intentar nuevamente
            </Button>
        </Box>
    );

    // Componente para mostrar el indicador de tratamiento
    const TreatmentIndicator = ({ isTreatment, sessionCount }) => (
        <Paper
            elevation={isDarkTheme ? 3 : 2}
            sx={{
                p: 1.5,
                borderRadius: 2,
                mb: 2,
                backgroundColor: isDarkTheme 
                    ? (isTreatment ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 82, 82, 0.15)')
                    : (isTreatment ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)'),
                border: `1px solid ${isTreatment ? colors.treatment : colors.nonTreatment}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                transition: 'transform 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkTheme ? 4 : 3
                }
            }}
        >
            <Avatar 
                sx={{ 
                    bgcolor: isTreatment ? colors.treatment : colors.nonTreatment,
                    width: 40,
                    height: 40,
                    boxShadow: `0 3px 6px ${isTreatment ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 82, 82, 0.3)'}`
                }}
            >
                {isTreatment ? <MedicalServices /> : <Info />}
            </Avatar>
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                    {isTreatment ? 'Tratamiento Dental' : 'Servicio Regular'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.secondary }}>
                    {isTreatment && sessionCount > 1 
                        ? `Requiere aproximadamente ${sessionCount} citas`
                        : 'Se realiza en una única sesión'}
                </Typography>
            </Box>
        </Paper>
    );

    // Componente de sección de información
    const InfoSection = ({ section, index }) => {
        const isActive = activeSection === section.title;

        return (
            <Grid item xs={12} sm={6} key={section.title}>
                <Fade in={isVisible} timeout={300 + section.delay}>
                    <Card
                        sx={{
                            backgroundColor: colors.cardBg,
                            height: '100%',
                            borderRadius: 2,
                            boxShadow: isActive ? `0 8px 24px rgba(${section.color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(',')}, 0.25)` : 'none',
                            border: `1px solid ${isActive ? section.color : colors.cardBorder}`,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                            '&:hover': {
                                boxShadow: `0 6px 16px rgba(${section.color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(',')}, 0.15)`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                        onClick={() => setActiveSection(isActive ? null : section.title)}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                background: section.color || colors.primary
                            }}
                        />
                        <CardContent sx={{ p: 3 }}>
                            <SectionHeader
                                icon={section.icon}
                                title={section.title}
                                description={section.description}
                                color={section.color || colors.primary}
                            />
                            <List
                                sx={{
                                    mt: 1,
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    scrollbarWidth: 'thin',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        borderRadius: '10px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                        borderRadius: '10px',
                                        '&:hover': {
                                            background: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                                        }
                                    }
                                }}
                                dense={isMobile}
                            >
                                {section.data && section.data.length > 0 ? (
                                    section.data.map((item, idx) => (
                                        <Fade
                                            key={idx}
                                            in={true}
                                            timeout={300 + (idx * 30)}
                                        >
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    px: 1,
                                                    py: 0.7,
                                                    borderRadius: 1,
                                                    mb: 0.5,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.04)',
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}
                                                button
                                                component="div"
                                            >
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <section.itemIcon
                                                        sx={{
                                                            color: section.color || colors.primary,
                                                            fontSize: isMobile ? 18 : 20
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    sx={{
                                                        color: colors.text,
                                                        my: 0,
                                                        '& .MuiListItemText-primary': {
                                                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                                                            lineHeight: 1.5
                                                        }
                                                    }}
                                                />
                                            </ListItem>
                                        </Fade>
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ color: colors.secondary, py: 2, px: 1, fontStyle: 'italic' }}>
                                        No hay información disponible
                                    </Typography>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Fade>
            </Grid>
        );
    };

    // Componente de imagen ampliable
    const ZoomableImage = ({ src, alt }) => {
        return (
            <Box sx={{ position: 'relative' }}>
                {/* Contenedor de la imagen */}
                <Box
                    ref={imageRef}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        minHeight: 250,
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => setImageZoomed(true)}
                >
                    {imageLoading && (
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            animation="wave"
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0,
                                bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                            }}
                        />
                    )}
                    
                    {/* Imagen final de alta calidad */}
                    <CardMedia
                        component="img"
                        image={src
                            ? src.includes('cloudinary')
                              ? src.replace('/upload/', '/upload/w_800,h_800,c_fill,q_auto,f_auto/')
                              : src
                            : `https://source.unsplash.com/featured/?dental,service`
                        }
                        alt={alt}
                        loading="eager"
                        onLoad={() => setImageLoading(false)}
                        sx={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                            opacity: imageLoading ? 0 : 1,
                            transition: 'opacity 0.3s ease-in-out',
                            width: '100%',
                            height: '100%'
                        }}
                    />
                </Box>

                {/* Overlay de imagen ampliada */}
                <Dialog
                    open={imageZoomed}
                    onClose={() => setImageZoomed(false)}
                    maxWidth="lg"
                    PaperProps={{
                        sx: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            overflow: 'hidden',
                            '&::-webkit-scrollbar': {
                                display: 'none'
                            }
                        }
                    }}
                    sx={{
                        '& .MuiDialog-paper': { 
                            m: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        '& .MuiBackdrop-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)'
                        }
                    }}
                >
                    <Box 
                        sx={{ 
                            position: 'relative', 
                            width: '100%', 
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <img 
                            src={src ? 
                                (src.includes('cloudinary') ? 
                                    src.replace('/upload/', '/upload/w_1200,h_1200,c_fill,q_auto,f_auto/') : 
                                    src) : 
                                `https://source.unsplash.com/featured/?dental,service`
                            } 
                            alt={alt}
                            style={{ 
                                maxWidth: '90%', 
                                maxHeight: '90%', 
                                objectFit: 'contain',
                                borderRadius: '4px'
                            }} 
                        />
                        
                        <IconButton 
                            aria-label="cerrar"
                            onClick={() => setImageZoomed(false)}
                            sx={{ 
                                position: 'absolute', 
                                top: 16, 
                                right: 16,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)'
                                }
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </Dialog>
            </Box>
        );
    };

    // Componente para opciones de compartir
    const ShareOptions = () => {
        const whatsappColor = '#25D366';
        const emailColor = '#DB4437';
        const linkColor = '#4285F4';
        
        return (
            <Grow in={showShareOptions}>
                <Box sx={{ 
                    position: isMobile ? 'fixed' : 'absolute', 
                    bottom: isMobile ? 0 : 'auto',
                    left: isMobile ? 0 : '80px', 
                    width: isMobile ? '100%' : 'auto',
                    zIndex: 100,
                    boxShadow: isDarkTheme ? '0 -2px 20px rgba(0,0,0,0.5)' : '0 -2px 20px rgba(0,0,0,0.1)',
                    borderRadius: isMobile ? '16px 16px 0 0' : '12px',
                    p: 2,
                    bgcolor: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`
                }}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                            Compartir servicio
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.secondary, mb: 2 }}>
                            Elige una opción para compartir la información
                        </Typography>
                    </Box>
                
                    <Grid container spacing={2}>
                        {/* WhatsApp */}
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={shareViaWhatsApp}
                                startIcon={<WhatsAppIcon />}
                                sx={{
                                    color: whatsappColor,
                                    borderColor: whatsappColor,
                                    '&:hover': {
                                        borderColor: whatsappColor,
                                        bgcolor: `${whatsappColor}10`
                                    },
                                    textTransform: 'none',
                                    py: 1
                                }}
                            >
                                WhatsApp
                            </Button>
                        </Grid>
                        
                        {/* Email */}
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={shareViaEmail}
                                startIcon={<EmailIcon />}
                                sx={{
                                    color: emailColor,
                                    borderColor: emailColor,
                                    '&:hover': {
                                        borderColor: emailColor,
                                        bgcolor: `${emailColor}10`
                                    },
                                    textTransform: 'none',
                                    py: 1
                                }}
                            >
                                Email
                            </Button>
                        </Grid>
                        
                        {/* Copiar */}
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={copyServiceInfo}
                                startIcon={<ContentCopy />}
                                sx={{
                                    color: linkColor,
                                    borderColor: linkColor,
                                    '&:hover': {
                                        borderColor: linkColor,
                                        bgcolor: `${linkColor}10`
                                    },
                                    textTransform: 'none',
                                    py: 1
                                }}
                            >
                                Copiar
                            </Button>
                        </Grid>
                    </Grid>
                    
                    {isMobile && (
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => setShowShareOptions(false)}
                            sx={{ 
                                mt: 2, 
                                color: colors.text,
                                '&:hover': {
                                    bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                    )}
                </Box>
            </Grow>
        );
    };

    // Contenido del diálogo
    const dialogContent = () => {
        if (loading) {
            return <SkeletonLoader />;
        }

        if (error || !service) {
            return <ErrorDisplay message={error} />;
        }

        // Verificamos si es un tratamiento y cuántas citas requiere
        const isTreatment = service.tratamiento === 1;
        const sessionCount = service.citasEstimadas || 1;

        return (
            <Box sx={{ pt: 1 }}>
                {/* Header Section con imagen a la izquierda y detalles a la derecha */}
                <Grid container spacing={3}>
                    {/* Columna de la imagen a la izquierda */}
                    <Grid item xs={12} md={5} lg={4}>
                        <Card
                            elevation={isDarkTheme ? 3 : 2}
                            sx={{
                                backgroundColor: colors.cardBg,
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative',
                                height: { md: '100%' },
                                display: 'flex',
                                flexDirection: 'column',
                                border: `1px solid ${isTreatment ? colors.treatment : colors.nonTreatment}`,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.02)'
                                }
                            }}
                        >
                            {/* Indicador de categoría */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    left: 10,
                                    zIndex: 5,
                                }}
                            >
                                <Chip
                                    label={service.category || "Servicio dental"}
                                    size="small"
                                    sx={{
                                        backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
                                        color: isDarkTheme ? '#fff' : colors.primary,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        border: isDarkTheme ? '1px solid rgba(255,255,255,0.2)' : 'none',
                                        boxShadow: isDarkTheme ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </Box>

                            <Box sx={{ position: 'relative', flexGrow: 1, minHeight: 250 }}>
                                <ZoomableImage 
                                    src={service.image_url || `https://source.unsplash.com/featured/?dental,${service.title.replace(' ', ',')}`} 
                                    alt={service.title}
                                />
                            </Box>

                            {/* Barra inferior con info rápida */}
                            <Box 
                                sx={{ 
                                    p: 1.5, 
                                    borderTop: `4px solid ${isTreatment ? colors.treatment : colors.nonTreatment}`,
                                    bgcolor: isDarkTheme 
                                        ? (isTreatment ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 82, 82, 0.15)')
                                        : (isTreatment ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)'),
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocalHospital sx={{ color: isTreatment ? colors.treatment : colors.nonTreatment, mr: 1 }} />
                                    <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
                                        {isTreatment ? 'Tratamiento' : 'Servicio'}
                                    </Typography>
                                </Box>
                                
                                {isTreatment && sessionCount > 1 && (
                                    <Chip
                                        icon={<CalendarMonth sx={{ fontSize: '0.9rem !important' }} />}
                                        label={`${sessionCount} citas`}
                                        size="small"
                                        sx={{
                                            bgcolor: isDarkTheme ? 'rgba(76, 175, 80, 0.25)' : 'rgba(76, 175, 80, 0.2)',
                                            color: colors.treatment,
                                            fontWeight: 600,
                                            border: isDarkTheme ? '1px solid rgba(76, 175, 80, 0.5)' : 'none',
                                            '& .MuiChip-icon': { 
                                                color: colors.treatment,
                                                mr: '-4px' 
                                            }
                                        }}
                                    />
                                )}
                            </Box>
                        </Card>
                    </Grid>

                    {/* Columna de detalles a la derecha */}
                    <Grid item xs={12} md={7} lg={8}>
                        <Card
                            elevation={isDarkTheme ? 3 : 0}
                            sx={{
                                backgroundColor: colors.cardBg,
                                borderRadius: 2,
                                p: 3,
                                height: '100%',
                                border: `1px solid ${colors.cardBorder}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Título del servicio */}
                            <Fade in={true} timeout={300}>
                                <Typography
                                    variant={isMobile ? "h5" : "h4"}
                                    sx={{
                                        color: colors.text,
                                        fontWeight: 700,
                                        mb: 1,
                                        lineHeight: 1.2
                                    }}
                                >
                                    {service.title}
                                </Typography>
                            </Fade>

                            {/* Indicador de tratamiento y número de citas */}
                            <TreatmentIndicator 
                                isTreatment={isTreatment} 
                                sessionCount={sessionCount} 
                            />

                            {/* Descripción */}
                            <Fade in={true} timeout={400}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: colors.secondary,
                                        mb: 3,
                                        lineHeight: 1.6,
                                        flexGrow: 1
                                    }}
                                >
                                    {service.description}
                                </Typography>
                            </Fade>

                            <Divider sx={{ mb: 2 }} />

                            {/* Chips de información */}
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                mb: 1
                            }}>
                                <Zoom in={true} timeout={500}>
                                    <Chip
                                        icon={<Timer />}
                                        label={`Duración: ${service.duration}`}
                                        sx={{
                                            bgcolor: isDarkTheme ? alpha(colors.primary, 0.2) : colors.primary,
                                            color: isDarkTheme ? colors.primary : '#fff',
                                            border: isDarkTheme ? `1px solid ${colors.primary}` : 'none',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { 
                                                color: isDarkTheme ? colors.primary : '#fff' 
                                            },
                                            pl: 0.5,
                                            height: 32
                                        }}
                                    />
                                </Zoom>
                                <Zoom in={true} timeout={600}>
                                    <Chip
                                        icon={<AttachMoney />}
                                        label={`Precio: $${service.price}`}
                                        sx={{
                                            bgcolor: isDarkTheme ? alpha(colors.accent, 0.2) : colors.accent,
                                            color: isDarkTheme ? colors.accent : '#fff',
                                            border: isDarkTheme ? `1px solid ${colors.accent}` : 'none',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { 
                                                color: isDarkTheme ? colors.accent : '#fff' 
                                            },
                                            pl: 0.5,
                                            height: 32
                                        }}
                                    />
                                </Zoom>
                                <Zoom in={true} timeout={700}>
                                    <Chip
                                        icon={<AccessTime />}
                                        label={isTreatment && sessionCount > 1 
                                            ? `${sessionCount} sesiones aprox.` 
                                            : "Sesión única"}
                                        sx={{
                                            bgcolor: isDarkTheme 
                                                ? (isTreatment ? alpha(colors.treatment, 0.2) : alpha(colors.nonTreatment, 0.2))
                                                : (isTreatment ? colors.treatment : colors.nonTreatment),
                                            color: isDarkTheme 
                                                ? (isTreatment ? colors.treatment : colors.nonTreatment) 
                                                : '#fff',
                                            border: isDarkTheme 
                                                ? `1px solid ${isTreatment ? colors.treatment : colors.nonTreatment}` 
                                                : 'none',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { 
                                                color: isDarkTheme 
                                                    ? (isTreatment ? colors.treatment : colors.nonTreatment) 
                                                    : '#fff' 
                                            },
                                            pl: 0.5,
                                            height: 32
                                        }}
                                    />
                                </Zoom>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Info Sections con colores */}
                    {[
                        {
                            title: 'Beneficios',
                            icon: Star,
                            description: 'Ventajas y resultados esperados',
                            data: service.benefits,
                            itemIcon: CheckCircle,
                            delay: 100,
                            color: '#4CAF50' // Verde
                        },
                        {
                            title: 'Qué incluye',
                            icon: Assignment,
                            description: 'Procedimientos y servicios incluidos',
                            data: service.includes,
                            itemIcon: Info,
                            delay: 200,
                            color: '#2196F3' // Azul
                        },
                        {
                            title: 'Preparación',
                            icon: Schedule,
                            description: 'Recomendaciones previas',
                            data: service.preparation,
                            itemIcon: Warning,
                            delay: 300,
                            color: '#FF9800' // Naranja
                        },
                        {
                            title: 'Cuidados posteriores',
                            icon: LocalHospital,
                            description: 'Instrucciones post-tratamiento',
                            data: service.aftercare,
                            itemIcon: CheckCircleOutline,
                            delay: 400,
                            color: '#9C27B0' // Púrpura
                        }
                    ].map((section, index) => (
                        <InfoSection key={section.title} section={section} index={index} />
                    ))}
                </Grid>
            </Box>
        );
    };
    
    // Botón para volver arriba
    const ScrollTopButton = () => (
        <Zoom in={showScrollTop}>
            <Fab
                size="small"
                color="primary"
                aria-label="volver arriba"
                onClick={scrollToTop}
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 9,
                    background: colors.primary,
                    '&:hover': {
                        background: isDarkTheme ? '#00D1EC' : '#033F74'
                    }
                }}
            >
                <KeyboardArrowUp />
            </Fab>
        </Zoom>
    );

    return (
        <>
            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick' || !loading) {
                        setShowShareOptions(false);
                        onClose();
                    }
                }}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="lg"
                scroll="paper"
                TransitionComponent={Slide}
                TransitionProps={{ direction: 'up' }}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.background,
                        borderRadius: { xs: 0, sm: 3 },
                        overflow: 'hidden',
                        backgroundImage: colors.gradient,
                        maxWidth: fullScreen ? '100%' : '95%'
                    }
                }}
                sx={{
                    backdropFilter: 'blur(3px)'
                }}
            >
                <DialogTitle
                    sx={{
                        m: 0,
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: service && service.tratamiento === 1 ? colors.treatment : colors.primary,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {service && service.tratamiento === 1 ? 
                            <MedicalServices sx={{ mr: 1, fontSize: 22 }} /> : 
                            <Description sx={{ mr: 1, fontSize: 22 }} />
                        }
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            {service && service.tratamiento === 1 ? 'Detalles del Tratamiento' : 'Detalles del Servicio'}
                        </Typography>
                    </Box>
                    <MuiIconButton
                        aria-label="close"
                        onClick={onClose}
                        disabled={loading}
                        sx={{
                            color: '#fff',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)'
                            }
                        }}
                    >
                        <Close />
                    </MuiIconButton>
                </DialogTitle>

                <DialogContent
                    dividers
                    ref={dialogContentRef}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        '&::-webkit-scrollbar': {
                            width: '0px',
                            background: 'transparent'
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        overflowY: 'auto'
                    }}
                >
                    <Suspense fallback={<SkeletonLoader />}>
                        {dialogContent()}
                    </Suspense>
                    
                    {/* Botón para volver arriba */}
                    <ScrollTopButton />
                </DialogContent>

                <DialogActions
                    sx={{
                        py: 2,
                        px: { xs: 2, sm: 3 },
                        backgroundColor: 'transparent',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {/* Botón para compartir servicio */}
                        <Tooltip title={showShareOptions ? "Cerrar" : "Compartir servicio"}>
                            <IconButton
                                color="primary"
                                aria-label="compartir servicio"
                                onClick={() => setShowShareOptions(!showShareOptions)}
                                sx={{
                                    mr: 1,
                                    bgcolor: showShareOptions
                                        ? (isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(3,66,124,0.15)')
                                        : 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
                                    }
                                }}
                            >
                                <Share />
                            </IconButton>
                        </Tooltip>

                        {/* Mostrar opciones de compartir - ahora como drawer en móvil */}
                        {!isMobile && showShareOptions && service && <ShareOptions />}

                        {/* Botón para cerrar */}
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            disabled={loading}
                            startIcon={<Close />}
                            size="small"
                            sx={{
                                borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : colors.primary,
                                color: isDarkTheme ? 'rgba(255,255,255,0.8)' : colors.primary,
                                px: 2,
                                ml: 1,
                                borderRadius: 6,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: isDarkTheme ? 'rgba(255,255,255,0.5)' : colors.primary,
                                    bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)'
                                }
                            }}
                        >
                            Cerrar
                        </Button>
                    </Box>

                    {/* Botón para agendar cita */}
                    <Button
                        variant="contained"
                        startIcon={<CalendarMonth />}
                        onClick={handleAgendarCita}
                        disabled={!service || loading}
                        sx={{
                            backgroundColor: service && service.tratamiento === 1 ? colors.treatment : colors.accent,
                            color: '#fff',
                            px: 3,
                            py: 1,
                            borderRadius: 6,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: isDarkTheme 
                                ? `0 4px 12px ${service && service.tratamiento === 1 ? 'rgba(76, 175, 80, 0.4)' : 'rgba(79, 209, 197, 0.4)'}`
                                : '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': {
                                backgroundColor: service && service.tratamiento === 1 
                                    ? (isDarkTheme ? '#6AE86A' : '#3d9140') // Verde más claro/oscuro
                                    : (isDarkTheme ? '#5CE8DC' : '#1E5A9A'), // Azul más claro/oscuro
                                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Agendar Cita
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Drawer de compartir para móviles */}
            {isMobile && (
                <SwipeableDrawer
                    anchor="bottom"
                    open={showShareOptions && !!service}
                    onClose={() => setShowShareOptions(false)}
                    onOpen={() => {}}
                    disableSwipeToOpen
                    PaperProps={{
                        sx: {
                            borderRadius: '16px 16px 0 0',
                            maxHeight: '50vh'
                        }
                    }}
                >
                    <ShareOptions />
                </SwipeableDrawer>
            )}
            
            {/* Notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ServicioDetalleDialog;