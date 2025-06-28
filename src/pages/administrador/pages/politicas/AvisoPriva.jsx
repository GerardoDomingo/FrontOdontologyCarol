import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Typography, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Grid, useTheme, useMediaQuery,
    Card, CardContent, Divider, Tooltip, Chip, LinearProgress, Fade, Container, Stack, Avatar
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
    History as HistoryIcon,
    CheckCircle as CheckCircleIcon,
    HistoryToggleOff as HistoryToggleOffIcon,
    Update as UpdateIcon,
    Cancel as CancelIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const PoliticasPrivacidad = () => {
    // Estados para el formulario y datos
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState('');
    const [errors, setErrors] = useState({});
    const [politicas, setPoliticas] = useState([]);
    const [politicaActiva, setPoliticaActiva] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [isAddingNewPolicy, setIsAddingNewPolicy] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Theme
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        fetchPoliticas();
        fetchPoliticaActiva();
    }, []);
    
    // Definición de colores según el tema
    const colors = {
        background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
        paper: isDarkTheme ? '#243447' : '#ffffff',
        paperLight: isDarkTheme ? '#2C3E50' : '#F0F7FF',
        text: isDarkTheme ? '#E8F1FF' : '#333333',
        secondaryText: isDarkTheme ? '#B8C7D9' : '#666666',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        primaryDark: isDarkTheme ? '#3D7ECC' : '#0A4B94',
        primaryLight: isDarkTheme ? '#5BABFF' : '#5090D3',
        hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.08)',
        border: isDarkTheme ? '#364B63' : '#e0e0e0',
        activePolicyBg: isDarkTheme ? '#2C3E50' : '#E3F2FD',
        tableHeader: isDarkTheme ? '#2C3E50' : '#f5f5f5',
        tableRowHover: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        error: isDarkTheme ? '#ff6b6b' : '#f44336',
        success: isDarkTheme ? '#5CDB5C' : '#4CAF50',
        cardShadow: isDarkTheme ? '0 6px 16px rgba(0, 0, 0, 0.4)' : '0 6px 16px rgba(0, 0, 0, 0.1)',
        divider: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    };

    // Estilos comunes para inputs
    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: colors.paper,
            '& fieldset': {
                borderColor: colors.border,
            },
            '&:hover fieldset': {
                borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
                borderColor: colors.primary,
            },
        },
        '& .MuiInputLabel-root': {
            color: colors.secondaryText,
        },
        '& .MuiOutlinedInput-input': {
            color: colors.text,
        },
    };

    const cardStyle = {
        backgroundColor: colors.paper,
        borderRadius: '12px',
        boxShadow: colors.cardShadow,
        border: isDarkTheme ? `1px solid ${colors.border}` : 'none',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
    };

    const buttonStyle = {
        primary: {
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            '&:hover': {
                backgroundColor: colors.primaryDark,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
            transition: 'all 0.2s ease',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
        },
        secondary: {
            color: colors.text,
            borderColor: colors.border,
            '&:hover': {
                borderColor: colors.primary,
                backgroundColor: colors.hover,
            },
            transition: 'all 0.2s ease',
            borderRadius: '8px',
            textTransform: 'none',
        }
    };

    const fetchPoliticas = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/politicas/getAllPoliticas');
            const data = response.data;

            const politicasInactivas = data.filter(politica => politica.estado === 'inactivo');
            politicasInactivas.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));

            setPoliticas(politicasInactivas);
        } catch (error) {
            console.error('Error al cargar políticas:', error);
            setNotification({ open: true, message: 'Error al cargar políticas', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPoliticaActiva = async () => {
        try {
            const response = await axios.get('https://back-end-4803.onrender.com/api/politicas/getpolitica');
            if (response.data) {
                setPoliticaActiva(response.data);
            } else {
                setPoliticaActiva(null);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setPoliticaActiva(null);
                console.error('No hay políticas activas.');
            } else {
                console.error('Error al cargar política activa:', error);
                setPoliticaActiva(null);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!titulo) newErrors.titulo = "El título es obligatorio.";
        if (!contenido) newErrors.contenido = "El contenido es obligatorio.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Agregar política con número predeterminado y estado inactivo
        const politicaData = { numero_politica: 0, titulo, contenido, estado: 'inactivo' };

        try {
            if (editingId !== null) {
                await axios.put(`https://back-end-4803.onrender.com/api/politicas/update/${editingId}`, politicaData);
                setNotification({ open: true, message: `Política actualizada correctamente`, type: 'success' });
            } else {
                await axios.post('https://back-end-4803.onrender.com/api/politicas/insert', politicaData);
                setNotification({ open: true, message: 'Política insertada con éxito', type: 'success' });
            }

            await fetchPoliticas();
            await fetchPoliticaActiva();
            resetForm();
        } catch (error) {
            setNotification({ open: true, message: 'Error al enviar política', type: 'error' });
        }
    };

    const resetForm = () => {
        setTitulo('');
        setContenido('');
        setEditingId(null);
        setErrors({});
        setIsAddingNewPolicy(false);
    };

    const handleEdit = async (id) => {
        try {
            const response = await axios.get(`https://back-end-4803.onrender.com/api/politicas/get/${id}`);
            const politica = response.data;

            if (politica) {
                setTitulo(politica.titulo);
                setContenido(politica.contenido);
                setEditingId(id);
                setIsAddingNewPolicy(true);
            }
        } catch (error) {
            console.error("Error al cargar la política para editar:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.put(`https://back-end-4803.onrender.com/api/politicas/deactivate/${id}`, { estado: 'inactivo' });
            setNotification({ open: true, message: 'Política eliminada con éxito', type: 'success' });
            await fetchPoliticas();
            await fetchPoliticaActiva();
        } catch (error) {
            setNotification({ open: true, message: 'Error al eliminar política', type: 'error' });
        }
    };

    const handleDialogOpen = (politica) => {
        setDialogContent(politica);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const truncateContent = (content) => {
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    };

    const formatDate = (date) => {
        if (!date) return 'No disponible';
        try {
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    return (
        <Box sx={{ 
            background: colors.background, 
            minHeight: '100vh',
            transition: 'all 0.3s ease',
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3 },
        }}>
            <Container maxWidth="lg">
                <Card sx={{ ...cardStyle, mb: 4, overflow: 'visible' }}>
                    <Box sx={{ 
                        p: { xs: 2, sm: 3 },
                        background: `linear-gradient(45deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                        color: 'white',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Avatar sx={{ bgcolor: 'white', color: colors.primary }}>
                            <EditIcon />
                        </Avatar>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            Política de Privacidad
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        {/* Política Activa */}
                        <Box sx={{ mb: 4 }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 2, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: colors.text,
                                    '&::before': {
                                        content: '""',
                                        display: 'inline-block',
                                        width: '4px',
                                        height: '18px',
                                        background: colors.primary,
                                        borderRadius: '4px',
                                        marginRight: '8px'
                                    }
                                }}
                            >
                                <CheckCircleIcon sx={{ mr: 1, color: colors.success }} /> Política Activa
                            </Typography>

                            {politicaActiva ? (
                                <Card sx={{ 
                                    p: 0, 
                                    borderRadius: '10px',
                                    backgroundColor: colors.activePolicyBg,
                                    border: `1px solid ${colors.border}`,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor: colors.primary,
                                        color: 'white',
                                        py: 0.5,
                                        px: 2,
                                        borderBottomLeftRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}>
                                        Versión {politicaActiva.version}
                                    </Box>
                                    
                                    <CardContent sx={{ pt: 3 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={8}>
                                                <Typography 
                                                    variant="h5" 
                                                    sx={{ 
                                                        color: colors.text,
                                                        fontWeight: 600,
                                                        mb: 1
                                                    }}
                                                >
                                                    {politicaActiva.titulo}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: colors.secondaryText,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 2
                                                    }}
                                                >
                                                    <UpdateIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                                                    Última actualización: {formatDate(politicaActiva.fecha_actualizacion)}
                                                </Typography>
                                            </Grid>
                                            
                                            <Grid item xs={12} sm={4} sx={{ 
                                                display: 'flex', 
                                                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                                                gap: 1 
                                            }}>
                                                <Tooltip title="Editar política" arrow>
                                                    <IconButton 
                                                        onClick={() => handleEdit(politicaActiva.id)}
                                                        sx={{ 
                                                            color: 'white',
                                                            bgcolor: colors.primary,
                                                            '&:hover': { 
                                                                bgcolor: colors.primaryDark,
                                                                transform: 'translateY(-2px)'
                                                            },
                                                            transition: 'all 0.2s',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: '50%'
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                
                                                <Tooltip title="Eliminar política" arrow>
                                                    <IconButton 
                                                        onClick={() => handleDelete(politicaActiva.id)}
                                                        sx={{ 
                                                            color: 'white',
                                                            bgcolor: colors.error,
                                                            '&:hover': { 
                                                                bgcolor: '#d32f2f',
                                                                transform: 'translateY(-2px)'
                                                            },
                                                            transition: 'all 0.2s',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: '50%'
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <Divider sx={{ mb: 2, backgroundColor: colors.divider }} />
                                                <Typography 
                                                    variant="body1" 
                                                    sx={{ color: colors.text }}
                                                >
                                                    {truncateContent(politicaActiva.contenido)}
                                                    {politicaActiva.contenido.length > 100 && (
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small"
                                                            startIcon={<VisibilityIcon />}
                                                            onClick={() => handleDialogOpen(politicaActiva)}
                                                            sx={{
                                                                ml: 1,
                                                                color: colors.primary,
                                                                borderColor: colors.primary,
                                                                '&:hover': {
                                                                    borderColor: colors.primary,
                                                                    backgroundColor: colors.hover
                                                                },
                                                                borderRadius: '20px',
                                                                textTransform: 'none'
                                                            }}
                                                        >
                                                            Ver completo
                                                        </Button>
                                                    )}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card sx={{ 
                                    p: 3, 
                                    borderRadius: '10px',
                                    border: `1px dashed ${colors.border}`,
                                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Typography sx={{ color: colors.secondaryText, textAlign: 'center', mb: 2 }}>
                                        No hay políticas activas actualmente.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => setIsAddingNewPolicy(true)}
                                        sx={{
                                            color: colors.primary,
                                            borderColor: colors.primary,
                                            '&:hover': {
                                                borderColor: colors.primary,
                                                backgroundColor: colors.hover
                                            }
                                        }}
                                    >
                                        Crear Nueva Política
                                    </Button>
                                </Card>
                            )}
                        </Box>

                        {/* Botón para agregar nueva política */}
                        {!isAddingNewPolicy && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{ 
                                    ...buttonStyle.primary,
                                    mb: 3
                                }}
                                onClick={() => {
                                    resetForm();
                                    setIsAddingNewPolicy(true);
                                }}
                            >
                                Nueva Política
                            </Button>
                        )}

                        {/* Formulario para agregar/editar políticas */}
                        {isAddingNewPolicy && (
                            <Fade in={isAddingNewPolicy}>
                                <Card sx={{ 
                                    p: 0, 
                                    mb: 4,
                                    borderRadius: '10px',
                                    border: `1px solid ${colors.border}`,
                                    backgroundColor: colors.paper,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}>
                                    <CardContent sx={{ p: 0 }}>
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: colors.paperLight,
                                            borderTopLeftRadius: '10px',
                                            borderTopRightRadius: '10px',
                                            borderBottom: `1px solid ${colors.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    color: colors.text,
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {editingId !== null ? (
                                                    <>
                                                        <EditIcon sx={{ mr: 1 }} /> Editar Política
                                                    </>
                                                ) : (
                                                    <>
                                                        <AddIcon sx={{ mr: 1 }} /> Nueva Política
                                                    </>
                                                )}
                                            </Typography>
                                            
                                            <IconButton 
                                                onClick={resetForm}
                                                size="small"
                                                sx={{ color: colors.secondaryText }}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </Box>
                                        
                                        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                                            <TextField
                                                label="Título"
                                                value={titulo}
                                                onChange={(e) => setTitulo(e.target.value)}
                                                fullWidth
                                                sx={{ 
                                                    mb: 3,
                                                    ...inputStyles
                                                }}
                                                error={!!errors.titulo}
                                                helperText={errors.titulo}
                                                variant="outlined"
                                                placeholder="Ingrese el título de la política"
                                            />
                                            
                                            <TextField
                                                label="Contenido"
                                                value={contenido}
                                                onChange={(e) => setContenido(e.target.value)}
                                                fullWidth
                                                multiline
                                                rows={6}
                                                sx={{ 
                                                    mb: 3,
                                                    ...inputStyles
                                                }}
                                                error={!!errors.contenido}
                                                helperText={errors.contenido}
                                                variant="outlined"
                                                placeholder="Ingrese el contenido detallado de la política"
                                            />
                                            
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                                <Button 
                                                    type="submit" 
                                                    variant="contained" 
                                                    fullWidth
                                                    startIcon={editingId !== null ? <SaveIcon /> : <AddIcon />}
                                                    sx={buttonStyle.primary}
                                                >
                                                    {editingId !== null ? 'Guardar Cambios' : 'Agregar Política'}
                                                </Button>
                                                
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    onClick={resetForm}
                                                    startIcon={<CancelIcon />}
                                                    sx={buttonStyle.secondary}
                                                >
                                                    Cancelar
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Fade>
                        )}

                        {/* Tabla de historial de políticas */}
                        <Box sx={{ mt: 5 }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 3, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: colors.text,
                                    '&::before': {
                                        content: '""',
                                        display: 'inline-block',
                                        width: '4px',
                                        height: '18px',
                                        background: colors.primary,
                                        borderRadius: '4px',
                                        marginRight: '8px'
                                    }
                                }}
                            >
                                <HistoryIcon sx={{ mr: 1 }} /> Historial de Políticas por Versión
                            </Typography>

                            {isLoading ? (
                                <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
                                    <LinearProgress sx={{ borderRadius: 1 }} />
                                </Box>
                            ) : (
                                <TableContainer 
                                    component={Paper} 
                                    sx={{ 
                                        ...cardStyle,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: colors.tableHeader }}>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 600, color: colors.text }}>
                                                        Título
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography sx={{ fontWeight: 600, color: colors.text }}>
                                                        Versión
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography sx={{ fontWeight: 600, color: colors.text }}>
                                                        Estado
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 600, color: colors.text }}>
                                                        Fecha de Creación
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 600, color: colors.text }}>
                                                        Fecha de Actualización
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography sx={{ fontWeight: 600, color: colors.text }}>
                                                        Acciones
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {politicas.length > 0 ? (
                                                politicas.map((politica, index) => (
                                                    <TableRow 
                                                        key={index}
                                                        sx={{
                                                            '&:nth-of-type(odd)': {
                                                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                                                            },
                                                            '&:hover': {
                                                                backgroundColor: colors.tableRowHover,
                                                                transition: 'background-color 0.2s'
                                                            }
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: colors.text }}>
                                                            <Typography sx={{ fontWeight: 500 }}>
                                                                {politica.titulo}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ color: colors.text }}>
                                                            <Chip 
                                                                label={`v${politica.version}`}
                                                                size="small"
                                                                sx={{ 
                                                                    bgcolor: colors.primaryLight,
                                                                    color: 'white',
                                                                    fontWeight: 500
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ color: colors.text }}>
                                                            <Chip 
                                                                label={politica.estado}
                                                                size="small"
                                                                color={politica.estado === 'activo' ? 'success' : 'default'}
                                                                sx={{ fontWeight: 500 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ color: colors.text }}>
                                                            {formatDate(politica.fecha_creacion)}
                                                        </TableCell>
                                                        <TableCell sx={{ color: colors.text }}>
                                                            {formatDate(politica.fecha_actualizacion)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                                <Tooltip title="Ver detalles" arrow>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleDialogOpen(politica)}
                                                                        sx={{ 
                                                                            color: 'white',
                                                                            bgcolor: colors.primary,
                                                                            '&:hover': { 
                                                                                bgcolor: colors.primaryDark,
                                                                            },
                                                                            width: 32,
                                                                            height: 32,
                                                                            borderRadius: '50%'
                                                                        }}
                                                                    >
                                                                        <VisibilityIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                
                                                                <Tooltip title="Editar" arrow>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleEdit(politica.id)}
                                                                        sx={{ 
                                                                            color: colors.text,
                                                                            bgcolor: colors.hover,
                                                                            '&:hover': { 
                                                                                bgcolor: colors.primary,
                                                                                color: 'white'
                                                                            },
                                                                            width: 32,
                                                                            height: 32,
                                                                            borderRadius: '50%'
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell 
                                                        colSpan={6} 
                                                        align="center"
                                                        sx={{ color: colors.secondaryText, py: 3 }}
                                                    >
                                                        <HistoryToggleOffIcon sx={{ fontSize: '2rem', opacity: 0.5, mb: 1 }} />
                                                        <Typography variant="body1">
                                                            No hay políticas inactivas en el historial.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Container>

            {/* Diálogo para ver política completa */}
            <Dialog 
                open={openDialog} 
                onClose={handleDialogClose} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: colors.paper,
                        backgroundImage: 'none',
                        boxShadow: colors.cardShadow,
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        p: 0,
                        backgroundColor: colors.primary,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 2
                    }}
                >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <VisibilityIcon sx={{ mr: 1 }} /> 
                        Detalles de la Política de Privacidad
                    </Typography>
                    <IconButton 
                        onClick={handleDialogClose}
                        sx={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3, mt: 1 }}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: colors.text
                        }}
                    >
                        {dialogContent?.titulo}
                    </Typography>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2, 
                        mb: 3,
                        alignItems: 'center'
                    }}>
                        <Chip 
                            label={`Versión ${dialogContent?.version}`}
                            size="small"
                            sx={{ 
                                bgcolor: colors.primary,
                                color: 'white',
                                fontWeight: 500
                            }}
                        />
                        
                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                            <span style={{ fontWeight: 500 }}>Creado:</span> {dialogContent?.fecha_creacion ? formatDate(dialogContent.fecha_creacion) : ''}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                            <span style={{ fontWeight: 500 }}>Actualizado:</span> {dialogContent?.fecha_actualizacion ? formatDate(dialogContent.fecha_actualizacion) : ''}
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3, backgroundColor: colors.divider }} />
                    
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            overflowWrap: 'break-word', 
                            whiteSpace: 'pre-line', 
                            color: colors.text,
                            lineHeight: 1.6
                        }}
                    >
                        {dialogContent?.contenido}
                    </Typography>
                </DialogContent>
                
                <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
                    <Button 
                        onClick={handleDialogClose} 
                        variant="contained"
                        startIcon={<CloseIcon />}
                        sx={buttonStyle.primary}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Componente de notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </Box>
    );
};

export default PoliticasPrivacidad;