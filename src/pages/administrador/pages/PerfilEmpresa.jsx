import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Grid,
    Container,
    Typography,
    Box,
    Avatar,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Modal,
    Tooltip,
    Fade,
    useTheme,
    useMediaQuery,
    Skeleton,
    Divider,
    Paper,
    Card,
    CardContent
} from '@mui/material';
import {
    Save as SaveIcon,
    Edit as EditIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as LanguageIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'axios';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { Link } from 'react-router-dom';
import RedesSociales from './politicas/RedesSociales';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const PerfilEmpresa = () => {
    // Estado actualizado con la nueva estructura de la BDD
    const [formData, setFormData] = useState({
        id_empresa: '',
        nombre_pagina: '',  // Cambiado de nombre_empresa
        calle_numero: '',   // Nueva estructura de dirección
        localidad: '',      // Nueva estructura de dirección
        municipio: 'Huejutla', // Valor predeterminado
        estado: 'Hidalgo',  // Valor predeterminado
        codigo_postal: '',  // Nueva estructura de dirección
        pais: 'México',     // Valor predeterminado
        telefono_principal: '', // Cambiado de telefono
        correo_electronico: '',
        sitio_web: '',      // Nuevo campo
        descripcion: '',
        logo: null,
        slogan: ''
    });
    
    const [logoPreview, setLogoPreview] = useState('');
    const [originalLogo, setOriginalLogo] = useState('');
    const [isEditingDatos, setIsEditingDatos] = useState(false);
    const [isEditingLogo, setIsEditingLogo] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [logoChanged, setLogoChanged] = useState(false);
    const [errorMessages, setErrorMessages] = useState({});
    const [dataFetched, setDataFetched] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success',
    });
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openImageModal, setOpenImageModal] = useState(false);
    const { isDarkTheme } = useThemeContext();

    const [isLoading, setIsLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Definición mejorada de colores para mejor contraste
    const colors = {
        background: isDarkTheme ? '#263749' : 'rgba(173, 216, 230, 0.2)',
        paper: isDarkTheme ? '#243447' : '#ffffff',
        text: isDarkTheme ? '#FFFFFF' : '#333333',
        secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
        inputText: isDarkTheme ? '#FFFFFF' : '#333333',
        inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',
        inputBorder: isDarkTheme ? '#4B9FFF' : '#e0e0e0',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        inputBackground: isDarkTheme ? '#1B2A3A' : '#ffffff',
        disabledBackground: isDarkTheme ? '#243447' : '#f5f5f5',
        disabledText: isDarkTheme ? '#B8C7D9' : '#9e9e9e',
        hover: isDarkTheme ? 'rgba(75, 159, 255, 0.08)' : 'rgba(25, 118, 210, 0.04)',
        border: isDarkTheme ? '#445566' : '#e0e0e0',
        success: isDarkTheme ? '#4CAF50' : '#4CAF50',
        divider: isDarkTheme ? '#445566' : '#e0e0e0',
        cardBackground: isDarkTheme ? '#1E2A3A' : '#f8f9fa'
    };
    
    // Estilos mejorados para los inputs
    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: colors.inputBackground,
            color: colors.inputText,
            '& fieldset': {
                borderColor: colors.inputBorder,
                borderWidth: isDarkTheme ? '2px' : '1px',
            },
            '&:hover fieldset': {
                borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
                borderColor: colors.primary,
            },
            '& input': {
                color: colors.inputText,
                '&::placeholder': {
                    color: colors.secondaryText,
                    opacity: 1
                }
            },
            '& textarea': {
                color: colors.inputText,
            }
        },
        '& .MuiInputLabel-root': {
            color: colors.inputLabel,
            '&.Mui-focused': {
                color: colors.primary
            }
        },
        '& .MuiFormHelperText-root': {
            color: isDarkTheme ? '#FF9999' : '#f44336',
            opacity: 1
        },
        '&.Mui-disabled': {
            '& .MuiInputBase-input': {
                color: colors.disabledText,
                '-webkit-text-fill-color': colors.disabledText,
            },
            '& .MuiInputLabel-root': {
                color: colors.disabledText,
            },
            backgroundColor: 'transparent'
        }
    };

    useEffect(() => {
        const fetchPerfilEmpresa = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('https://back-end-4803.onrender.com/api/perfilEmpresa/get');
                
                // Adaptando para los nuevos campos
                const { 
                    id_empresa, 
                    nombre_pagina,       // Cambiado de nombre_empresa 
                    calle_numero,        // Nuevo campo (antes parte de dirección)
                    localidad,           // Nuevo campo (antes parte de dirección)
                    municipio,           // Nuevo campo (antes parte de dirección)
                    estado,              // Nuevo campo (antes parte de dirección)
                    codigo_postal,       // Nuevo campo
                    pais,                // Nuevo campo
                    telefono_principal,  // Cambiado de telefono
                    correo_electronico, 
                    sitio_web,           // Nuevo campo
                    descripcion, 
                    logo, 
                    slogan 
                } = response.data;

                if (id_empresa) {
                    setFormData({
                        id_empresa,
                        nombre_pagina: nombre_pagina || '',
                        calle_numero: calle_numero || '',
                        localidad: localidad || '',
                        municipio: municipio || 'Huejutla',
                        estado: estado || 'Hidalgo',
                        codigo_postal: codigo_postal || '',
                        pais: pais || 'México',
                        telefono_principal: telefono_principal || '',
                        correo_electronico: correo_electronico || '',
                        sitio_web: sitio_web || '',
                        descripcion: descripcion || '',
                        slogan: slogan || ''
                    });
                    setDataFetched(true);
                } else {
                    setDataFetched(false);
                    mostrarNotificacion('No hay información para actualizar, suba su información', 'error');
                }

                if (logo) {
                    // Verificar si el logo ya incluye el prefijo data:image
                    const logoBase64 = logo.startsWith('data:image')
                        ? logo
                        : `data:image/png;base64,${logo}`;

                    setLogoPreview(logoBase64);
                    setOriginalLogo(logoBase64);
                }
            } catch (error) {
                console.error('Error al cargar el perfil:', error);
                mostrarNotificacion('Error al obtener el perfil de la empresa', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPerfilEmpresa();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setHasChanges(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (allowedTypes.includes(file.type)) {
                setFormData({
                    ...formData,
                    logo: file,
                });
                const objectUrl = URL.createObjectURL(file);
                setLogoPreview(objectUrl);
                setLogoChanged(true);
            } else {
                mostrarNotificacion('Por favor, sube una imagen válida (PNG o JPEG)', 'error');
            }
        }
    };

    const handleCancelLogo = () => {
        setOpenConfirmDialog(true);
    };

    const handleCancelDatos = () => {
        // Restaura los datos originales
        fetchPerfilEmpresa();
        setHasChanges(false);
        setIsEditingDatos(false);
    };

    const handleConfirmCancelLogo = () => {
        setLogoPreview(originalLogo);
        setFormData({ ...formData, logo: null });
        setLogoChanged(false);
        setOpenConfirmDialog(false);
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,15}$/;

        if (!formData.nombre_pagina) errors.nombre_pagina = "El nombre de la página es obligatorio.";
        if (!formData.calle_numero) errors.calle_numero = "La calle y número son obligatorios.";
        if (!formData.localidad) errors.localidad = "La localidad es obligatoria.";
        if (!formData.telefono_principal || !phoneRegex.test(formData.telefono_principal)) 
            errors.telefono_principal = "El teléfono es inválido.";
        if (!formData.correo_electronico || !emailRegex.test(formData.correo_electronico)) 
            errors.correo_electronico = "El correo electrónico es inválido.";
        if (!formData.descripcion) errors.descripcion = "La descripción es obligatoria.";
        if (!formData.slogan) errors.slogan = "El slogan es obligatorio.";

        setErrorMessages(errors);
        return Object.keys(errors).length === 0;
    };

    const mostrarNotificacion = (mensaje, tipo) => {
        setNotification({
            open: true,
            message: mensaje,
            type: tipo,
        });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const handleSaveLogo = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append('id_empresa', formData.id_empresa);
        formDataToSend.append('logo', formData.logo);

        try {
            const response = await axios.put('https://back-end-4803.onrender.com/api/perfilEmpresa/updateLogo', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                mostrarNotificacion('Logo actualizado con éxito', 'success');
                setLogoChanged(false);
                setIsEditingLogo(false);
                setOriginalLogo(logoPreview);
            } else {
                mostrarNotificacion('Error al actualizar el logo', 'error');
            }
        } catch (error) {
            mostrarNotificacion('Error al actualizar el logo', 'error');
        }
    };

    const handleSaveDatos = async (e) => {
        e.preventDefault();
        if (!dataFetched) {
            mostrarNotificacion('No hay información para actualizar', 'error');
            return;
        }

        if (!validateForm()) return;

        // Actualizando para enviar los nuevos campos
        const formDataToSend = {
            id_empresa: formData.id_empresa,
            nombre_pagina: formData.nombre_pagina,
            calle_numero: formData.calle_numero,
            localidad: formData.localidad,
            municipio: formData.municipio,
            estado: formData.estado,
            codigo_postal: formData.codigo_postal,
            pais: formData.pais,
            telefono_principal: formData.telefono_principal,
            correo_electronico: formData.correo_electronico,
            sitio_web: formData.sitio_web,
            descripcion: formData.descripcion,
            slogan: formData.slogan,
        };

        try {
            const response = await axios.put('https://back-end-4803.onrender.com/api/perfilEmpresa/updateDatos', formDataToSend);

            if (response.status === 200) {
                mostrarNotificacion('Datos actualizados con éxito', 'success');
                setHasChanges(false);
                setIsEditingDatos(false);
            } else {
                mostrarNotificacion('Error al actualizar los datos', 'error');
            }
        } catch (error) {
            mostrarNotificacion('Error al actualizar los datos', 'error');
        }
    };

    const handleOpenImageModal = () => {
        setOpenImageModal(true);
    };

    const handleCloseImageModal = () => {
        setOpenImageModal(false);
    };

    // Función para obtener los datos originales (agregada como referencia)
    const fetchPerfilEmpresa = async () => {
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/perfilEmpresa/get');
            
            const { 
                id_empresa, 
                nombre_pagina,
                calle_numero,
                localidad,
                municipio,
                estado,
                codigo_postal,
                pais,
                telefono_principal, 
                correo_electronico, 
                sitio_web,
                descripcion, 
                slogan 
            } = response.data;

            if (id_empresa) {
                setFormData({
                    id_empresa,
                    nombre_pagina: nombre_pagina || '',
                    calle_numero: calle_numero || '',
                    localidad: localidad || '',
                    municipio: municipio || 'Huejutla',
                    estado: estado || 'Hidalgo',
                    codigo_postal: codigo_postal || '',
                    pais: pais || 'México',
                    telefono_principal: telefono_principal || '',
                    correo_electronico: correo_electronico || '',
                    sitio_web: sitio_web || '',
                    descripcion: descripcion || '',
                    slogan: slogan || ''
                });
            }
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
        }
    };

    return (
        <Box sx={{
            p: { xs: 2, sm: 4 },
            minHeight: '100vh',
            backgroundColor: colors.background,
            position: 'relative',
            transition: 'all 0.3s ease'
        }}>
            <Container maxWidth="lg">
                <Box sx={{
                    mt: 4,
                    backgroundColor: colors.paper,
                    padding: { xs: 2, sm: 4 },
                    borderRadius: '16px',
                    boxShadow: isDarkTheme ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                }}>
                    <Grid container spacing={4}>
                        {/* Columna de información general */}
                        <Grid item xs={12} md={4}>
                            <Card elevation={3} sx={{ 
                                backgroundColor: colors.cardBackground,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                p: 3,
                                borderRadius: '12px'
                            }}>
                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    sx={{
                                        color: colors.text,
                                        fontWeight: 600,
                                        mb: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    Identidad
                                </Typography>

                                {isLoading ? (
                                    <Skeleton
                                        variant="circular"
                                        width={150}
                                        height={150}
                                        sx={{ margin: '0 auto' }}
                                    />
                                ) : logoPreview ? (
                                    <Tooltip title="Click para ampliar" arrow>
                                        <Avatar
                                            src={logoPreview}
                                            alt="Logo de la empresa"
                                            onClick={handleOpenImageModal}
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                margin: '0 auto',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
                                                boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.2)',
                                                cursor: 'pointer',
                                                border: `3px solid ${colors.primary}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: isDarkTheme ? '0 6px 16px rgba(0,0,0,0.4)' : '0 6px 16px rgba(0,0,0,0.2)',
                                                }
                                            }}
                                        />
                                    </Tooltip>
                                ) : (
                                    <Avatar
                                        sx={{
                                            width: 150,
                                            height: 150,
                                            margin: '0 auto',
                                            backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
                                            border: `3px solid ${colors.primary}`,
                                        }}
                                    >
                                        <PhotoCameraIcon sx={{ fontSize: 60 }} />
                                    </Avatar>
                                )}
                                
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <IconButton
                                        color="primary"
                                        component="label"
                                        sx={{
                                            backgroundColor: colors.hover,
                                            '&:hover': {
                                                backgroundColor: colors.hover,
                                                transform: 'scale(1.1)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => setIsEditingLogo(true)}
                                    >
                                        <PhotoCameraIcon />
                                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                                    </IconButton>
                                </Box>

                                {logoChanged && (
                                    <Fade in={true}>
                                        <Box sx={{
                                            textAlign: 'center',
                                            mt: 2,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: 2
                                        }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CloseIcon />}
                                                onClick={handleCancelLogo}
                                                sx={{
                                                    color: colors.text,
                                                    borderColor: colors.border,
                                                    '&:hover': {
                                                        borderColor: colors.primary,
                                                        backgroundColor: colors.hover
                                                    }
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                onClick={handleSaveLogo}
                                                sx={{
                                                    backgroundColor: colors.primary,
                                                    '&:hover': {
                                                        backgroundColor: isDarkTheme ? '#5BABFF' : '#1565c0'
                                                    }
                                                }}
                                            >
                                                Guardar
                                            </Button>
                                        </Box>
                                    </Fade>
                                )}
                                
                                <Divider sx={{ width: '100%', my: 3, borderColor: colors.divider }} />
                                
                                <Box sx={{ width: '100%', mt: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="Nombre de la Página"
                                        name="nombre_pagina"
                                        value={formData.nombre_pagina}
                                        onChange={handleInputChange}
                                        disabled={!isEditingDatos}
                                        error={!!errorMessages.nombre_pagina}
                                        helperText={errorMessages.nombre_pagina}
                                        sx={{
                                            ...inputStyles,
                                            mb: 2
                                        }}
                                    />
                                    
                                    <TextField
                                        fullWidth
                                        label="Slogan"
                                        name="slogan"
                                        value={formData.slogan}
                                        onChange={handleInputChange}
                                        disabled={!isEditingDatos}
                                        error={!!errorMessages.slogan}
                                        helperText={errorMessages.slogan}
                                        sx={{
                                            ...inputStyles,
                                            mb: 2
                                        }}
                                    />
                                </Box>
                            </Card>
                        </Grid>
                            
                        {/* Columna de contacto y ubicación */}
                        <Grid item xs={12} md={8}>
                            <form onSubmit={handleSaveDatos}>
                                <Card elevation={3} sx={{ 
                                    backgroundColor: colors.cardBackground,
                                    p: 3,
                                    mb: 4,
                                    borderRadius: '12px'
                                }}>
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        sx={{
                                            color: colors.text,
                                            fontWeight: 600,
                                            mb: 3,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <LocationIcon sx={{ mr: 1 }} /> Dirección
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={8}>
                                            <TextField
                                                fullWidth
                                                label="Calle y Número"
                                                name="calle_numero"
                                                value={formData.calle_numero}
                                                onChange={handleInputChange}
                                                disabled={!isEditingDatos}
                                                error={!!errorMessages.calle_numero}
                                                helperText={errorMessages.calle_numero}
                                                placeholder="Ej. Calle José Maria Pino Suárez #390"
                                                sx={inputStyles}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Código Postal"
                                                name="codigo_postal"
                                                value={formData.codigo_postal}
                                                onChange={handleInputChange}
                                                disabled={!isEditingDatos}
                                                error={!!errorMessages.codigo_postal}
                                                helperText={errorMessages.codigo_postal}
                                                placeholder="Ej. 43000"
                                                sx={inputStyles}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Localidad/Colonia"
                                                name="localidad"
                                                value={formData.localidad}
                                                onChange={handleInputChange}
                                                disabled={!isEditingDatos}
                                                error={!!errorMessages.localidad}
                                                helperText={errorMessages.localidad}
                                                placeholder="Ej. Ixcatlan"
                                                sx={inputStyles}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Municipio"
                                                name="municipio"
                                                value={formData.municipio}
                                                onChange={handleInputChange}
                                                disabled={!isEditingDatos}
                                                sx={inputStyles}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Estado"
                                                name="estado"
                                                value={formData.estado}
                                                onChange={handleInputChange}
                                                disabled={!isEditingDatos}
                                                sx={inputStyles}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="País"
                                                name="pais"
                                                value={formData.pais}
                                                onChange={handleInputChange}
                                                disabled={!isEditingDatos}
                                                sx={inputStyles}
                                            />
                                        </Grid>
                                    </Grid>
                                </Card>

                                <Card elevation={3} sx={{ 
                                    backgroundColor: colors.cardBackground,
                                    p: 3,
                                    mb: 4,
                                    borderRadius: '12px'
                                }}>
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        sx={{
                                            color: colors.text,
                                            fontWeight: 600,
                                            mb: 3,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <BusinessIcon sx={{ mr: 1 }} /> Contacto
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Teléfono Principal"
                                                name="telefono_principal"
                                                value={formData.telefono_principal}
                                                onChange={handleInputChange}
                                                disabled={!isEditingDatos}
                                                error={!!errorMessages.telefono_principal}
                                                helperText={errorMessages.telefono_principal}
                                                InputProps={{
                                                    startAdornment: <PhoneIcon sx={{ mr: 1, color: colors.secondaryText }} />,
                                                }}
                                                sx={inputStyles}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Correo Electrónico"
                                                type="email"
                                                name="correo_electronico"
                                                value={formData.correo_electronico}
                                                onChange={handleInputChange}
                                                required
                                                disabled={!isEditingDatos}
                                                error={!!errorMessages.correo_electronico}
                                                helperText={errorMessages.correo_electronico}
                                                InputProps={{
                                                    startAdornment: <EmailIcon sx={{ mr: 1, color: colors.secondaryText }} />,
                                                }}
                                                sx={inputStyles}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Sitio Web"
                                                name="sitio_web"
                                                value={formData.sitio_web}
                                                onChange={handleInputChange}
                                                disabled={!isEditingDatos}
                                                placeholder="Ej. www.odontologiacarol.com.mx"
                                                InputProps={{
                                                    startAdornment: <LanguageIcon sx={{ mr: 1, color: colors.secondaryText }} />,
                                                }}
                                                sx={inputStyles}
                                            />
                                        </Grid>
                                    </Grid>
                                </Card>

                                <Card elevation={3} sx={{ 
                                    backgroundColor: colors.cardBackground,
                                    p: 3,
                                    mb: 4,
                                    borderRadius: '12px'
                                }}>
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        sx={{
                                            color: colors.text,
                                            fontWeight: 600,
                                            mb: 3
                                        }}
                                    >
                                        Descripción
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Información detallada sobre la empresa"
                                        name="descripcion"
                                        multiline
                                        rows={4}
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        disabled={!isEditingDatos}
                                        error={!!errorMessages.descripcion}
                                        helperText={errorMessages.descripcion}
                                        placeholder="Describe los servicios, especialidades y características principales de tu negocio..."
                                        sx={inputStyles}
                                    />
                                </Card>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 2,
                                    mt: 3
                                }}>
                                    {!isEditingDatos ? (
                                        <Button
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            onClick={() => setIsEditingDatos(true)}
                                            sx={{
                                                backgroundColor: colors.primary,
                                                color: '#FFFFFF',
                                                px: 4,
                                                py: 1.2,
                                                borderRadius: '8px',
                                                '&:hover': {
                                                    backgroundColor: isDarkTheme ? '#5BABFF' : '#1565c0',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: isDarkTheme ? '0 6px 12px rgba(0,0,0,0.3)' : '0 6px 12px rgba(0,0,0,0.1)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Editar Información
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CloseIcon />}
                                                onClick={handleCancelDatos}
                                                sx={{
                                                    color: colors.text,
                                                    borderColor: colors.border,
                                                    borderRadius: '8px',
                                                    px: 3,
                                                    '&:hover': {
                                                        borderColor: colors.primary,
                                                        backgroundColor: colors.hover
                                                    }
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                onClick={handleSaveDatos}
                                                disabled={!hasChanges}
                                                sx={{
                                                    backgroundColor: colors.primary,
                                                    borderRadius: '8px',
                                                    px: 4,
                                                    '&:hover': {
                                                        backgroundColor: isDarkTheme ? '#5BABFF' : '#1565c0'
                                                    },
                                                    '&.Mui-disabled': {
                                                        backgroundColor: isDarkTheme ? '#2C3E50' : '#e0e0e0'
                                                    }
                                                }}
                                            >
                                                Guardar Cambios
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </form>
                        </Grid>
                    </Grid>
                </Box>

                <RedesSociales />
            </Container>

            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={handleCloseNotification}
            />

            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        color: colors.text,
                        borderRadius: '12px'
                    }
                }}
            >
                <DialogTitle sx={{ color: colors.text }}>
                    {"Confirmar cancelación"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: colors.secondaryText }}>
                        ¿Deseas deshacer los cambios realizados en el logo?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        sx={{ color: colors.primary }}
                    >
                        No
                    </Button>
                    <Button
                        onClick={handleConfirmCancelLogo}
                        autoFocus
                        sx={{ color: colors.primary }}
                    >
                        Sí
                    </Button>
                </DialogActions>
            </Dialog>

            <Modal
                open={openImageModal}
                onClose={handleCloseImageModal}
                closeAfterTransition
                BackdropProps={{
                    timeout: 500,
                    style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
                }}
            >
                <Fade in={openImageModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '600px',
                        bgcolor: colors.paper,
                        boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
                        p: 4,
                        borderRadius: '16px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <IconButton
                            onClick={handleCloseImageModal}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: colors.text,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(0,0,0,0.2)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box
                            component="img"
                            src={logoPreview}
                            alt="Logo ampliado"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                mt: 2,
                                backgroundColor: isDarkTheme ? '#1B2A3A' : '#ffffff',
                                border: `1px solid ${colors.border}`
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                mt: 2,
                                color: colors.secondaryText
                            }}
                        >
                            Click fuera de la imagen para cerrar
                        </Typography>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};

export default PerfilEmpresa;