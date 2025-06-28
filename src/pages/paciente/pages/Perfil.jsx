import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Grid, Box, Alert,
    CircularProgress, IconButton, useTheme, InputAdornment, Avatar, Card,
    CardContent, Divider, Chip, Tabs, Tab, Fade, Tooltip, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions,
    ListItem, ListItemIcon
} from '@mui/material';
import {
    Person as PersonIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
    LocalHospital as LocalHospitalIcon, Phone as PhoneIcon, Email as EmailIcon,
    LocationOn as LocationOnIcon, MedicalInformation as MedicalInformationIcon, Badge as BadgeIcon,
    ContactPhone as ContactPhoneIcon, Warning as WarningIcon,
    SupervisorAccount as SupervisorAccountIcon, PhotoCamera as PhotoCameraIcon,
    Info as InfoIcon, Cake as CakeIcon, Wc as WcIcon, CalendarMonth as CalendarMonthIcon,
    ArrowForward as ArrowForwardIcon, CameraAlt as CameraAltIcon, Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

/**
 * Componente Profile - Perfil del paciente
 * Muestra y permite editar la información del paciente
 */
const Profile = () => {
    const { isDarkTheme } = useThemeContext();
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [photoMenuAnchor, setPhotoMenuAnchor] = useState(null);
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [openNotification, setOpenNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('info');

    // Estado para los datos del perfil
    const [profileData, setProfileData] = useState({
        nombre: '',
        aPaterno: '',
        aMaterno: '',
        fechaNacimiento: null,
        tipoTutor: '',
        nombreTutor: '',
        genero: '',
        lugar: '',
        telefono: '',
        email: '',
        alergias: 'Ninguna',
        photoUrl: null
    });

    // Colores según tema con mayor contraste y legibilidad
    const colors = {
        // Colores primarios con mejor contraste
        primary: isDarkTheme ? '#5B98EE' : '#03427c',
        primaryLight: isDarkTheme ? '#7AADFF' : '#3B82F6',
        secondary: isDarkTheme ? '#4ADE80' : '#10B981',

        // Fondos y contenedores
        background: isDarkTheme ? '#121F2F' : '#F9FDFF',
        cardBg: isDarkTheme ? '#1A2A3A' : '#FFFFFF',

        // Textos con alto contraste
        text: isDarkTheme ? '#FFFFFF' : '#1F2937',
        subtext: isDarkTheme ? '#E0E7FF' : '#4B5563',
        inputText: isDarkTheme ? '#FFFFFF' : '#000000',

        // Elementos de interfaz
        border: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
        inputBg: isDarkTheme ? 'rgba(15,23,42,0.6)' : '#FFFFFF',
        hoverBg: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',

        // Colores semánticos
        success: isDarkTheme ? '#4ADE80' : '#10B981',
        error: isDarkTheme ? '#FF5252' : '#DC2626',
        warning: isDarkTheme ? '#FBBF24' : '#F59E0B',
        info: isDarkTheme ? '#60A5FA' : '#3B82F6',

        // Otros elementos
        divider: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
        buttonHover: isDarkTheme ? '#4B88CD' : '#025aa5',
        shadow: isDarkTheme ? '0 8px 16px rgba(0,0,0,0.6)' : '0 8px 16px rgba(0,0,0,0.1)',
        gradient: isDarkTheme
            ? 'linear-gradient(135deg, #1A2A3A 0%, #2F5496 100%)'
            : 'linear-gradient(135deg,rgb(171, 203, 246) 0%,rgb(0, 101, 233) 100%)'
    };

    useEffect(() => {
        console.log("Datos del usuario obtenidos:", user);
    }, [user]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`https://back-end-4803.onrender.com/api/profile/${user.id}?email=${user.email}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error("Error al obtener los datos del perfil");
                }

                const data = await response.json();
                console.log("Perfil completo obtenido:", data);

                setProfileData({
                    nombre: data.nombre || '',
                    aPaterno: data.aPaterno || '',
                    aMaterno: data.aMaterno || '',
                    fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : '',
                    tipoTutor: data.tipoTutor || '',
                    nombreTutor: data.nombreTutor || '',
                    genero: data.genero || '',
                    lugar: data.lugar || '',
                    telefono: data.telefono || '',
                    email: data.email || '',
                    alergias: data.alergias || 'Ninguna',
                    estado: data.estado ? data.estado.trim() : 'Pendiente',
                    photoUrl: data.photoUrl || null
                });

                setLoading(false);
            } catch (error) {
                console.error("Error al cargar perfil:", error);
                setError("No se pudo cargar la información del perfil. Por favor intente más tarde.");
                setLoading(false);
            }
        };

        if (user && user.id && user.email) {
            fetchProfileData();
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateFields()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/profile/updateProfile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
                credentials: 'include'
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error("Error en la respuesta del servidor. No se pudo leer JSON.");
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Error al actualizar el perfil');
            }

            if (!data?.updatedProfile) {
                throw new Error("Respuesta inesperada: faltan datos del perfil.");
            }

            setNotificationMessage('Datos actualizados correctamente');
            setNotificationType('success');
            setOpenNotification(true);
            setIsEditing(false);
            setProfileData(data.updatedProfile);
        } catch (err) {
            setNotificationMessage(err.message || 'Error al actualizar los datos');
            setNotificationType('error');
            setOpenNotification(true);
            console.error('❌ Error al actualizar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const validateFields = () => {
        const errors = {};

        if (!profileData.nombre) errors.nombre = 'El nombre es obligatorio';
        if (!profileData.aPaterno) errors.aPaterno = 'El apellido paterno es obligatorio';
        if (!profileData.aMaterno) errors.aMaterno = 'El apellido materno es obligatorio';
        if (!profileData.email) errors.email = 'El email es obligatorio';

        if (profileData.telefono && !/^[0-9]{10}$/.test(profileData.telefono)) {
            errors.telefono = 'Ingresa un número de teléfono válido (10 dígitos)';
        }

        if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Ingresa un correo electrónico válido';
        }

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
            console.warn("Errores de validación:", errors);
        }
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setProfileData({
                nombre: user.nombre || '',
                aPaterno: user.aPaterno || '',
                aMaterno: user.aMaterno || '',
                fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento).toISOString().split('T')[0] : '',
                tipoTutor: user.tipoTutor || '',
                nombreTutor: user.nombreTutor || '',
                genero: user.genero || '',
                lugar: user.lugar || '',
                telefono: user.telefono || '',
                email: user.email || '',
                alergias: user.alergias || 'Ninguna',
                estado: user.estado ? user.estado.trim() : 'Pendiente',
                photoUrl: user.photoUrl || null
            });
        }
        setValidationErrors({});
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Manejadores para la foto de perfil
    const handlePhotoClick = (event) => {
        setPhotoMenuAnchor(event.currentTarget);
    };

    const handleClosePhotoMenu = () => {
        setPhotoMenuAnchor(null);
    };

    const handleOpenPhotoDialog = () => {
        setIsPhotoDialogOpen(true);
        handleClosePhotoMenu();
    };

    const handleClosePhotoDialog = () => {
        setIsPhotoDialogOpen(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedPhoto(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadPhoto = async () => {
        if (!selectedPhoto) return;

        setUploadingPhoto(true);

        // Aquí se simula la carga, en un escenario real se enviaría al servidor
        // Ejemplo de cómo se implementaría:
        /*
        const formData = new FormData();
        formData.append('profilePhoto', selectedPhoto);
        formData.append('userId', user.id);
        
        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/profile/uploadPhoto', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Error al subir la foto');
            }
            
            const data = await response.json();
            setProfileData(prev => ({
                ...prev,
                photoUrl: data.photoUrl
            }));
            
        } catch (error) {
            console.error('Error al subir la foto:', error);
            setError('No se pudo subir la foto. Intente nuevamente.');
        }
        */

        // Simulación para demostración
        setTimeout(() => {
            setProfileData(prev => ({
                ...prev,
                photoUrl: photoPreview
            }));
            setUploadingPhoto(false);
            setIsPhotoDialogOpen(false);
            setNotificationMessage('Foto de perfil actualizada correctamente');
            setNotificationType('success');
            setOpenNotification(true);
        }, 1500);
    };

    const getInitials = () => {
        const nombre = profileData.nombre || '';
        const apellido = profileData.aPaterno || '';
        return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    };

    // Secciones de información del paciente
    const personalInfoSection = (
        <Card
            elevation={0}
            sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                mb: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
            }}
        >
            <Box
                sx={{
                    p: 2,
                    bgcolor: colors.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <PersonIcon sx={{ mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                    Información Personal
                </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="nombre"
                            value={profileData.nombre}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            error={!!validationErrors.nombre}
                            helperText={validationErrors.nombre}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon sx={{ color: colors.primary }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.primary,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.primary
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Apellido Paterno"
                            name="aPaterno"
                            value={profileData.aPaterno}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            error={!!validationErrors.aPaterno}
                            helperText={validationErrors.aPaterno}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.primary,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.primary
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Apellido Materno"
                            name="aMaterno"
                            value={profileData.aMaterno}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            error={!!validationErrors.aMaterno}
                            helperText={validationErrors.aMaterno}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.primary,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.primary
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Género"
                            name="genero"
                            value={profileData.genero}
                            onChange={handleChange}
                            disabled={!isEditing}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <WcIcon sx={{ color: colors.primary }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.primary,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.primary
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Fecha de Nacimiento"
                            type="date"
                            name="fechaNacimiento"
                            value={profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : null;
                                setProfileData(prev => ({ ...prev, fechaNacimiento: date }));
                            }}
                            disabled={!isEditing}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CakeIcon sx={{ color: colors.primary }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.primary,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.primary
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 2,
                                borderRadius: 1,
                                bgcolor: colors.hoverBg,
                                border: `1px dashed ${colors.border}`
                            }}
                        >
                            <BadgeIcon sx={{ color: colors.info, mr: 2 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" color={colors.subtext} gutterBottom>
                                    Estado de la cuenta
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Chip
                                        label={profileData.estado || 'Pendiente'}
                                        color={profileData.estado === 'Activo' ? 'success' : 'warning'}
                                        size="small"
                                        sx={{ mr: 2, fontWeight: 'bold' }}
                                    />
                                    <Typography variant="body2" color={colors.subtext} fontSize="0.875rem">
                                        {profileData.estado === 'Activo'
                                            ? 'Su cuenta está verificada y activa'
                                            : 'Su cuenta está en proceso de verificación'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const contactInfoSection = (
        <Card
            elevation={0}
            sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                mb: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
            }}
        >
            <Box
                sx={{
                    p: 2,
                    bgcolor: colors.info,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <ContactPhoneIcon sx={{ mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                    Información de Contacto
                </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Teléfono"
                            name="telefono"
                            value={profileData.telefono}
                            onChange={handleChange}
                            disabled={!isEditing}
                            error={!!validationErrors.telefono}
                            helperText={validationErrors.telefono}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon sx={{ color: colors.info }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.info,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.info
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            error={!!validationErrors.email}
                            helperText={validationErrors.email}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon sx={{ color: colors.info }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.info,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.info
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Dirección"
                            name="lugar"
                            value={profileData.lugar}
                            onChange={handleChange}
                            disabled={!isEditing}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocationOnIcon sx={{ color: colors.info }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.info,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.info
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const medicalInfoSection = (
        <Card
            elevation={0}
            sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                mb: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
            }}
        >
            <Box
                sx={{
                    p: 2,
                    bgcolor: colors.success, // Verde para sección médica
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <LocalHospitalIcon sx={{ mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                    Información Médica
                </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Alergias"
                            name="alergias"
                            value={profileData.alergias}
                            onChange={handleChange}
                            disabled={!isEditing}
                            multiline
                            rows={3}
                            placeholder="Indique sus alergias o escriba 'Ninguna' si no tiene"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                        <WarningIcon sx={{ color: colors.warning }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.success,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.success
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const tutorInfoSection = profileData.tipoTutor && (
        <Card
            elevation={0}
            sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                mb: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
            }}
        >
            <Box
                sx={{
                    p: 2,
                    bgcolor: colors.warning, // Naranja para sección de tutor
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <SupervisorAccountIcon sx={{ mr: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                    Información del Tutor
                </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Tipo de Tutor"
                            name="tipoTutor"
                            value={profileData.tipoTutor}
                            onChange={handleChange}
                            disabled={!isEditing}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SupervisorAccountIcon sx={{ color: colors.warning }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.warning,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.warning
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nombre del Tutor"
                            name="nombreTutor"
                            value={profileData.nombreTutor}
                            onChange={handleChange}
                            disabled={!isEditing}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon sx={{ color: colors.warning }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: colors.inputBg,
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.warning,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: colors.warning
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    // Diálogo para subir foto
    const photoUploadDialog = (
        <Dialog
            open={isPhotoDialogOpen}
            onClose={handleClosePhotoDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: colors.cardBg,
                    backgroundImage: 'none',
                    borderRadius: 2
                }
            }}
        >
            <DialogTitle sx={{
                bgcolor: colors.primary,
                color: 'white',
                px: 3,
                py: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CameraAltIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Actualizar foto de perfil</Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, mt: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    {photoPreview ? (
                        <Avatar
                            src={photoPreview}
                            sx={{
                                width: 150,
                                height: 150,
                                mx: 'auto',
                                border: `4px solid ${colors.primary}`
                            }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: 150,
                                height: 150,
                                mx: 'auto',
                                bgcolor: colors.hoverBg,
                                color: colors.primary,
                                fontSize: '3rem',
                                border: `3px solid ${colors.primary}`
                            }}
                        >
                            {getInitials()}
                        </Avatar>
                    )}
                </Box>

                <Box
                    sx={{
                        p: 3,
                        border: `2px dashed ${colors.border}`,
                        borderRadius: 2,
                        textAlign: 'center',
                        bgcolor: colors.hoverBg
                    }}
                >
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="contained-button-file"
                        type="file"
                        onChange={handlePhotoChange}
                    />
                    <label htmlFor="contained-button-file">
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            sx={{
                                bgcolor: colors.primary,
                                '&:hover': {
                                    bgcolor: colors.buttonHover
                                }
                            }}
                        >
                            Seleccionar foto
                        </Button>
                    </label>

                    <Typography variant="body2" sx={{ mt: 2, color: colors.subtext }}>
                        Formatos aceptados: JPG, PNG. Tamaño máximo: 5MB
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={handleClosePhotoDialog} sx={{ color: colors.text }}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleUploadPhoto}
                    variant="contained"
                    disabled={!selectedPhoto || uploadingPhoto}
                    startIcon={uploadingPhoto ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{
                        bgcolor: colors.primary,
                        '&:hover': {
                            bgcolor: colors.buttonHover
                        }
                    }}
                >
                    {uploadingPhoto ? 'Subiendo...' : 'Guardar foto'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Diálogo para subir foto */}
            {photoUploadDialog}

            {/* Componente de notificaciones */}
            <Notificaciones
                open={openNotification}
                message={notificationMessage}
                type={notificationType}
                handleClose={() => setOpenNotification(false)}
            />

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress sx={{ color: colors.primary }} />
                </Box>
            ) : (
                <Box>
                    {/* Header con foto de perfil */}
                    <Paper
                        elevation={0}
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            overflow: 'hidden',
                            background: colors.gradient,
                            boxShadow: colors.shadow,
                            transition: 'all 0.3s'
                        }}
                    >
                        <Box
                            sx={{
                                p: { xs: 3, md: 4 },
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                alignItems: { xs: 'center', md: 'flex-start' },
                                gap: 3
                            }}
                        >
                            {/* Foto de perfil */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    borderRadius: '50%',
                                    mb: { xs: 2, md: 0 }
                                }}
                            >
                                <Tooltip title="Cambiar foto de perfil">
                                    <Box
                                        onClick={handlePhotoClick}
                                        sx={{
                                            cursor: 'pointer',
                                            position: 'relative',
                                            '&:hover': {
                                                '& .photo-overlay': {
                                                    opacity: 1
                                                }
                                            }
                                        }}
                                    >
                                        <Avatar
                                            src={profileData.photoUrl}
                                            sx={{
                                                width: { xs: 120, md: 150 },
                                                height: { xs: 120, md: 150 },
                                                fontSize: { xs: '3rem', md: '4rem' },
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                border: '4px solid rgba(255,255,255,0.3)',
                                                color: 'white'
                                            }}
                                        >
                                            {getInitials()}
                                        </Avatar>
                                        <Box
                                            className="photo-overlay"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'rgba(0,0,0,0.5)',
                                                opacity: 0,
                                                transition: 'opacity 0.3s'
                                            }}
                                        >
                                            <PhotoCameraIcon sx={{ color: 'white', fontSize: '2.5rem' }} />
                                        </Box>
                                    </Box>
                                </Tooltip>

                                <Menu
                                    anchorEl={photoMenuAnchor}
                                    open={Boolean(photoMenuAnchor)}
                                    onClose={handleClosePhotoMenu}
                                    sx={{
                                        '& .MuiPaper-root': {
                                            bgcolor: colors.cardBg,
                                            borderRadius: 1,
                                            boxShadow: colors.shadow
                                        }
                                    }}
                                >
                                    <MenuItem onClick={handleOpenPhotoDialog}>
                                        <ListItemIcon>
                                            <CameraAltIcon fontSize="small" />
                                        </ListItemIcon>
                                        <Typography variant="body2">Cambiar foto</Typography>
                                    </MenuItem>
                                    {profileData.photoUrl && (
                                        <MenuItem onClick={() => {
                                            setProfileData(prev => ({ ...prev, photoUrl: null }));
                                            handleClosePhotoMenu();
                                        }}>
                                            <ListItemIcon>
                                                <DeleteIcon fontSize="small" sx={{ color: colors.error }} />
                                            </ListItemIcon>
                                            <Typography variant="body2" color={colors.error}>Eliminar foto</Typography>
                                        </MenuItem>
                                    )}
                                </Menu>
                            </Box>

                            {/* Información de perfil */}
                            <Box sx={{ flex: 1 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: { xs: 'center', md: 'flex-start' },
                                        flexDirection: { xs: 'column', md: 'row' },
                                        mb: 2
                                    }}
                                >
                                    <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 2, md: 0 } }}>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            {`${profileData.nombre} ${profileData.aPaterno} ${profileData.aMaterno}`}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                            <Chip
                                                label={profileData.estado || 'Pendiente'}
                                                color={profileData.estado === 'Activo' ? 'success' : 'warning'}
                                                size="small"
                                                sx={{ fontWeight: 'bold', fontSize: '0.75rem', mr: 1 }}
                                            />

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                <EmailIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                                                {profileData.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        variant={isEditing ? "contained" : "outlined"}
                                        color={isEditing ? "error" : "primary"}
                                        onClick={() => isEditing ? handleCancel() : handleEdit()}
                                        startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                                        sx={{
                                            borderColor: 'white',
                                            color: isEditing ? 'white' : 'white',
                                            bgcolor: isEditing ? 'rgba(220,0,0,0.8)' : 'transparent',
                                            borderRadius: 2,
                                            '&:hover': {
                                                bgcolor: isEditing ? 'rgba(220,0,0,0.9)' : 'rgba(255,255,255,0.1)',
                                                borderColor: 'white'
                                            },
                                            px: 3,
                                            py: 1
                                        }}
                                    >
                                        {isEditing ? 'Cancelar' : 'Editar Perfil'}
                                    </Button>
                                </Box>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    {profileData.fechaNacimiento && (
                                        <Grid item xs={12} sm={6} md={4}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    bgcolor: 'rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                <CalendarMonthIcon sx={{ color: 'white', mr: 1, fontSize: '1.2rem' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                                        Fecha de nacimiento
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                        {new Date(profileData.fechaNacimiento).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}

                                    {profileData.telefono && (
                                        <Grid item xs={12} sm={6} md={4}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    bgcolor: 'rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                <PhoneIcon sx={{ color: 'white', mr: 1, fontSize: '1.2rem' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                                        Teléfono
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                        {profileData.telefono}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Las alertas han sido reemplazadas por el componente Notificaciones */}

                    {/* Pestañas y contenido */}
                    <Box sx={{ mb: 4 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                mb: 2,
                                '& .MuiTabs-indicator': {
                                    backgroundColor: colors.primary,
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                },
                                '& .MuiTab-root': {
                                    color: colors.text,
                                    opacity: 0.7,
                                    '&.Mui-selected': {
                                        color: colors.primary,
                                        fontWeight: 'bold',
                                        opacity: 1
                                    },
                                    '&:hover': {
                                        backgroundColor: colors.hoverBg
                                    },
                                    borderRadius: '8px 8px 0 0',
                                    py: 1.5
                                }
                            }}
                        >
                            <Tab
                                label="Información Personal"
                                icon={<PersonIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Contacto"
                                icon={<ContactPhoneIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Información Médica"
                                icon={<LocalHospitalIcon />}
                                iconPosition="start"
                            />
                            {profileData.tipoTutor && (
                                <Tab
                                    label="Tutor"
                                    icon={<SupervisorAccountIcon />}
                                    iconPosition="start"
                                />
                            )}
                        </Tabs>

                        <Box sx={{ mt: 3 }}>
                            <Fade in={tabValue === 0}>
                                <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
                                    <form onSubmit={handleSubmit} id="profileForm">
                                        {personalInfoSection}
                                    </form>
                                </Box>
                            </Fade>

                            <Fade in={tabValue === 1}>
                                <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
                                    <form>
                                        {contactInfoSection}
                                    </form>
                                </Box>
                            </Fade>

                            <Fade in={tabValue === 2}>
                                <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
                                    <form>
                                        {medicalInfoSection}
                                    </form>
                                </Box>
                            </Fade>

                            {profileData.tipoTutor && (
                                <Fade in={tabValue === 3}>
                                    <Box sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
                                        <form>
                                            {tutorInfoSection}
                                        </form>
                                    </Box>
                                </Fade>
                            )}
                        </Box>
                    </Box>

                    {/* Botón de Guardar */}
                    {isEditing && (
                        <Box
                            sx={{
                                position: 'sticky',
                                bottom: 16,
                                textAlign: 'right',
                                zIndex: 10,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: isDarkTheme ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                boxShadow: colors.shadow,
                                border: `1px solid ${colors.border}`
                            }}
                        >
                            <Button
                                variant="contained"
                                form="profileForm"
                                type="submit"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    bgcolor: colors.primary,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    '&:hover': {
                                        bgcolor: colors.buttonHover,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.3s'
                                    }
                                }}
                            >
                                Guardar Cambios
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default Profile;