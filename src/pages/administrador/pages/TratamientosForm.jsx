import {
    Avatar, Box, Button, Card, CardContent,
    Chip, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem,
    Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField, Typography, Tooltip, Tabs, Tab, Divider,
    LinearProgress, useTheme, Alert, AlertTitle
} from '@mui/material';
import {
    MedicalServices,
    Add,
    AssignmentTurnedIn,
    Cancel,
    CheckCircle,
    DateRange,
    EventAvailable,
    EventBusy,
    Task,
    ChangeCircle,
    NotificationImportant,
    PeopleAlt,
    Search,
    FilterList,
    Visibility,
    Person,
    ViewList,
    ViewModule,
    ViewStream,
    SortByAlpha
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { alpha } from '@mui/material/styles';

/**
 * Componente para gestionar tratamientos con diseño similar a PatientsReport
 */
const TratamientosGestion = () => {
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    
    // Estados para la gestión de tratamientos
    const [tratamientos, setTratamientos] = useState([]);
    const [filteredTratamientos, setFilteredTratamientos] = useState([]);
    const [selectedTratamiento, setSelectedTratamiento] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // Estados para los diálogos
    const [openDialog, setOpenDialog] = useState(false);
    const [openCitasDialog, setOpenCitasDialog] = useState(false);
    const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
    const [openAbandonDialog, setOpenAbandonDialog] = useState(false);
    const [openPendingDialog, setOpenPendingDialog] = useState(false);
    const [openActivateDialog, setOpenActivateDialog] = useState(false);
    
    // Estados para los valores de los formularios
    const [finalizeNote, setFinalizeNote] = useState('');
    const [abandonReason, setAbandonReason] = useState('');
    const [pendingMessage, setPendingMessage] = useState('');
    const [activateMessage, setActivateMessage] = useState('');
    
    // Estados para tratamientos seleccionados
    const [tratamientoToFinalize, setTratamientoToFinalize] = useState(null);
    const [tratamientoToAbandon, setTratamientoToAbandon] = useState(null);
    const [tratamientoToPending, setTratamientoToPending] = useState(null);
    const [tratamientoToActivate, setTratamientoToActivate] = useState(null);
    
    // Estados para procesos
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isAbandoning, setIsAbandoning] = useState(false);
    const [isChangingToPending, setIsChangingToPending] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [isLoadingCitas, setIsLoadingCitas] = useState(false);
    
    // Estados para visualización y filtros
    const [viewMode, setViewMode] = useState('table'); // table, grid, detailed
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [categoryFilter, setCategoryFilter] = useState('todos');
    const [citasTratamiento, setCitasTratamiento] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // Estado para notificaciones
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success'
    });
    
    // Definición de colores
    const colors = {
        background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
        paper: isDarkTheme ? '#243447' : '#ffffff',
        tableBackground: isDarkTheme ? '#1E2A3A' : '#e3f2fd',
        text: isDarkTheme ? '#FFFFFF' : '#333333',
        secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
        primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
        hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
        inputBorder: isDarkTheme ? '#4B9FFF' : '#1976d2',
        inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',
        cardBackground: isDarkTheme ? '#1D2B3A' : '#F8FAFC',
        divider: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
        titleColor: isDarkTheme ? '#4B9FFF' : '#0052A3',
        error: '#E53935',
        warning: '#FFA726',
        success: '#4CAF50',
        info: '#03A9F4',
        purple: '#9C27B0',
        tratamiento: isDarkTheme ? '#4CAF50' : '#4CAF50',
    };

    // Manejadores de vista
    const handleViewChange = (view) => {
        setViewMode(view);
    };

    // Función para obtener el color del estado
    const getStatusColor = (status) => {
        switch (status) {
            case "Pre-Registro": return colors.purple;
            case "Pendiente": return colors.warning;
            case "Activo": return colors.success;
            case "Finalizado": return colors.info;
            case "Abandonado": return colors.error;
            default: return colors.secondaryText;
        }
    };

    // Cargar tratamientos al iniciar
    useEffect(() => {
        fetchTratamientos(true);

        let estaMontado = true;
        const intervalo = setInterval(() => {
            if (estaMontado) {
                fetchTratamientos(false);
            }
        }, 120000); // 2 minutos

        return () => {
            estaMontado = false;
            clearInterval(intervalo);
        };
    }, []);

    // Función para obtener tratamientos
    const fetchTratamientos = useCallback(async (mostrarCarga = true) => {
        if (mostrarCarga) {
            setIsLoadingData(true);
        }

        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/all?t=${timestamp}`);

            if (!response.ok) throw new Error("Error al obtener los tratamientos");

            const data = await response.json();
            setTratamientos(data);
            setFilteredTratamientos(data);
        } catch (error) {
            console.error("Error cargando tratamientos:", error);
            if (mostrarCarga) {
                setNotification({
                    open: true,
                    message: 'Error al cargar los tratamientos.',
                    type: 'error',
                });
            }
        } finally {
            if (mostrarCarga) {
                setIsLoadingData(false);
            }
        }
    }, []);

    // Efecto para aplicar filtros
    useEffect(() => {
        applyFilters();
    }, [searchTerm, statusFilter, categoryFilter, tratamientos]);

    // Función para aplicar filtros
    const applyFilters = () => {
        let filtered = tratamientos.filter(tratamiento => {
            // Filtro por texto de búsqueda
            const searchInName = tratamiento.nombre_tratamiento && 
                tratamiento.nombre_tratamiento.toLowerCase().includes(searchTerm.toLowerCase());
            const searchInPatient = tratamiento.paciente_nombre && 
                `${tratamiento.paciente_nombre} ${tratamiento.paciente_apellido_paterno || ''} ${tratamiento.paciente_apellido_materno || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSearch = searchTerm === '' || searchInName || searchInPatient;
            
            // Filtro por estado
            const matchesStatus = statusFilter === 'todos' || tratamiento.estado === statusFilter;
            
            // Filtro por categoría
            const matchesCategory = categoryFilter === 'todos' || 
                (tratamiento.categoria_servicio && tratamiento.categoria_servicio === categoryFilter);
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
        
        setFilteredTratamientos(filtered);
    };

    // Función para actualizar un tratamiento en el estado local
    const updateTratamientoLocally = (id, updatedData) => {
        setTratamientos(currentTratamientos =>
            currentTratamientos.map(tratamiento =>
                tratamiento.id === id
                    ? { ...tratamiento, ...updatedData, actualizado_en: new Date().toISOString() }
                    : tratamiento
            )
        );
    };

    // Función para ver detalles del tratamiento
    const handleViewDetails = (tratamiento) => {
        setSelectedTratamiento(tratamiento);
        setOpenDialog(true);
    };

    // Función para ver citas del tratamiento
    const handleViewCitas = async (tratamientoId) => {
        setIsLoadingCitas(true);
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/${tratamientoId}/citas?t=${timestamp}`);
            if (!response.ok) throw new Error("Error al obtener citas");

            const responseText = await response.text();
            try {
                const data = JSON.parse(responseText);
                setCitasTratamiento(data);
                setOpenCitasDialog(true);
            } catch (e) {
                console.error("Error al parsear JSON:", e);
            }
        } catch (error) {
            console.error("Error completo:", error);
            setNotification({
                open: true,
                message: "Error al cargar las citas del tratamiento: " + error.message,
                type: 'error'
            });
        } finally {
            setIsLoadingCitas(false);
        }
    };

    // Función para calcular el progreso del tratamiento
    const calcularPorcentajeProgreso = (tratamiento) => {
        if (!tratamiento || !tratamiento.total_citas_programadas) return 0;
        return Math.round((tratamiento.citas_completadas / tratamiento.total_citas_programadas) * 100);
    };

    // Función para formatear la fecha
    const formatDate = (dateString) => {
        if (!dateString) return "No definida";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            console.error("Error formateando fecha:", error);
            return "Fecha inválida";
        }
    };

    // Verificar si un tratamiento puede cambiar a pendiente
    const canChangeToPending = (tratamiento) => {
        return tratamiento.estado === 'Pre-Registro';
    };

    // Verificar si un tratamiento puede activarse
    const canActivateTreatment = (tratamiento) => {
        return tratamiento.estado === 'Pre-Registro' || tratamiento.estado === 'Pendiente';
    };

    // Verificar si un tratamiento se puede finalizar
    const canFinalizeTreatment = (tratamiento) => {
        return tratamiento.estado === 'Activo' &&
            tratamiento.citas_completadas >= tratamiento.total_citas_programadas;
    };

    // Verificar si un tratamiento se puede abandonar
    const canAbandonTreatment = (tratamiento) => {
        return tratamiento.estado === 'Activo';
    };

    // Función para marcar tratamiento como pendiente
    const openPendingConfirmation = (tratamiento) => {
        if (!canChangeToPending(tratamiento)) {
            setNotification({
                open: true,
                message: `No se puede marcar como pendiente un tratamiento en estado "${tratamiento.estado}"`,
                type: 'warning'
            });
            return;
        }

        setTratamientoToPending(tratamiento);
        setPendingMessage('');
        setOpenPendingDialog(true);
    };

    // Función para procesar cambio a pendiente
    const handleChangeToPending = async () => {
        if (!tratamientoToPending) return;

        setIsChangingToPending(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/updateStatus/${tratamientoToPending.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'Pendiente',
                    notas: pendingMessage || 'Tratamiento marcado como pendiente para revisión adicional'
                }),
            });

            if (!response.ok) throw new Error("Error al actualizar el estado");

            // Actualizar localmente sin refrescar toda la tabla
            updateTratamientoLocally(tratamientoToPending.id, {
                estado: 'Pendiente',
                notas: pendingMessage
                    ? `${tratamientoToPending.notas ? tratamientoToPending.notas + '\n\n' : ''}${pendingMessage}`
                    : tratamientoToPending.notas
            });

            setNotification({
                open: true,
                message: 'Tratamiento marcado como Pendiente',
                type: 'info'
            });

            setOpenPendingDialog(false);
            setTratamientoToPending(null);

        } catch (error) {
            console.error("Error al marcar como pendiente:", error);
            setNotification({
                open: true,
                message: 'Error al cambiar el estado del tratamiento',
                type: 'error'
            });
        } finally {
            setIsChangingToPending(false);
        }
    };

    // Función para abrir activación de tratamiento
    const openActivateConfirmation = (tratamiento) => {
        if (!canActivateTreatment(tratamiento)) {
            setNotification({
                open: true,
                message: `No se puede activar un tratamiento en estado "${tratamiento.estado}"`,
                type: 'warning'
            });
            return;
        }

        setTratamientoToActivate(tratamiento);
        setActivateMessage('');
        setOpenActivateDialog(true);
    };

    // Función para activar tratamiento
    const handleActivateTreatment = async () => {
        if (!tratamientoToActivate) return;

        setIsActivating(true);
        try {
            const endpoint = tratamientoToActivate.estado === 'Pendiente'
                ? `https://back-end-4803.onrender.com/api/tratamientos/confirmar/${tratamientoToActivate.id}`
                : `https://back-end-4803.onrender.com/api/tratamientos/updateStatus/${tratamientoToActivate.id}`;

            const body = tratamientoToActivate.estado === 'Pendiente'
                ? { observaciones: activateMessage || 'Tratamiento activado' }
                : { estado: 'Activo', notas: activateMessage || 'Tratamiento activado' };

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Error al activar el tratamiento");

            const data = await response.json();

            updateTratamientoLocally(tratamientoToActivate.id, {
                estado: 'Activo',
                notas: activateMessage
                    ? `${tratamientoToActivate.notas ? tratamientoToActivate.notas + '\n\n' : ''}${activateMessage}`
                    : tratamientoToActivate.notas
            });

            setNotification({
                open: true,
                message: data.message || 'Tratamiento activado correctamente. La primera cita ha sido confirmada.',
                type: 'success'
            });

            setOpenActivateDialog(false);
            setTratamientoToActivate(null);

        } catch (error) {
            console.error("Error al activar tratamiento:", error);
            setNotification({
                open: true,
                message: 'Error al activar el tratamiento',
                type: 'error'
            });
        } finally {
            setIsActivating(false);
        }
    };

    // Función para abrir diálogo de finalización
    const openFinalizeConfirmation = (tratamiento) => {
        if (!canFinalizeTreatment(tratamiento)) {
            setNotification({
                open: true,
                message: 'No se puede finalizar este tratamiento aún. Faltan citas por completar.',
                type: 'warning'
            });
            return;
        }

        setTratamientoToFinalize(tratamiento);
        setFinalizeNote('');
        setOpenFinalizeDialog(true);
    };

    // Función para manejar la finalización del tratamiento
    const handleFinalizeTreatment = async () => {
        if (!tratamientoToFinalize) return;

        setIsFinalizing(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/updateStatus/${tratamientoToFinalize.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'Finalizado',
                    notas: finalizeNote ? `${tratamientoToFinalize.notas ? tratamientoToFinalize.notas + '\n\n' : ''}[FINALIZACIÓN]: ${finalizeNote}` : tratamientoToFinalize.notas
                }),
            });

            if (!response.ok) throw new Error("Error al finalizar el tratamiento");

            const nuevasNotas = finalizeNote
                ? `${tratamientoToFinalize.notas ? tratamientoToFinalize.notas + '\n\n' : ''}[FINALIZACIÓN]: ${finalizeNote}`
                : tratamientoToFinalize.notas;

            updateTratamientoLocally(tratamientoToFinalize.id, {
                estado: 'Finalizado',
                notas: nuevasNotas
            });

            setNotification({
                open: true,
                message: 'Tratamiento finalizado exitosamente',
                type: 'success'
            });

            setOpenFinalizeDialog(false);
            setTratamientoToFinalize(null);

        } catch (error) {
            console.error("Error al finalizar el tratamiento:", error);
            setNotification({
                open: true,
                message: 'Error al finalizar el tratamiento',
                type: 'error'
            });
        } finally {
            setIsFinalizing(false);
        }
    };

    // Función para abrir diálogo de abandono
    const openAbandonConfirmation = (tratamiento) => {
        if (!canAbandonTreatment(tratamiento)) {
            setNotification({
                open: true,
                message: 'No se puede abandonar este tratamiento porque ya fue finalizado o abandonado.',
                type: 'warning'
            });
            return;
        }

        setTratamientoToAbandon(tratamiento);
        setAbandonReason('');
        setOpenAbandonDialog(true);
    };

    // Función para manejar el abandono del tratamiento
    const handleAbandonTreatment = async () => {
        if (!tratamientoToAbandon || !abandonReason) return;

        setIsAbandoning(true);
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/tratamientos/updateStatus/${tratamientoToAbandon.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'Abandonado',
                    notas: `${tratamientoToAbandon.notas ? tratamientoToAbandon.notas + '\n\n' : ''}[ABANDONADO]: ${abandonReason}`
                }),
            });

            if (!response.ok) throw new Error("Error al abandonar el tratamiento");

            const nuevasNotas = `${tratamientoToAbandon.notas ? tratamientoToAbandon.notas + '\n\n' : ''}[ABANDONADO]: ${abandonReason}`;

            updateTratamientoLocally(tratamientoToAbandon.id, {
                estado: 'Abandonado',
                notas: nuevasNotas
            });

            setNotification({
                open: true,
                message: 'Tratamiento marcado como abandonado. Todas las citas pendientes han sido canceladas.',
                type: 'warning'
            });

            setOpenAbandonDialog(false);
            setTratamientoToAbandon(null);

        } catch (error) {
            console.error("Error al abandonar el tratamiento:", error);
            setNotification({
                open: true,
                message: 'Error al abandonar el tratamiento',
                type: 'error'
            });
        } finally {
            setIsAbandoning(false);
        }
    };

    // Función para verificar si un paciente está registrado
    const isPacienteRegistrado = (tratamiento) => {
        return tratamiento && tratamiento.paciente_id !== null;
    };

    // Función para renderizar la vista de tabla
    const renderTableView = () => (
        <TableContainer 
            component={Paper}
            sx={{
                boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                backgroundColor: colors.paper,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
            }}
        >
            <Table>
                <TableHead sx={{ backgroundColor: colors.tableBackground }}>
                    <TableRow>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Paciente</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Tratamiento</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Inicio</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Fin Estimado</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Progreso</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Estado</TableCell>
                        <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {isLoadingData ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                <LinearProgress sx={{ my: 2 }} />
                                <Typography>Cargando tratamientos...</Typography>
                            </TableCell>
                        </TableRow>
                    ) : filteredTratamientos.length > 0 ? (
                        filteredTratamientos.map((tratamiento) => {
                            const porcentajeProgreso = calcularPorcentajeProgreso(tratamiento);
                            const esRegistrado = isPacienteRegistrado(tratamiento);

                            return (
                                <TableRow
                                    key={tratamiento.id}
                                    sx={{
                                        '&:hover': { backgroundColor: colors.hover },
                                        transition: 'background-color 0.2s ease',
                                        borderLeft: `4px solid ${getStatusColor(tratamiento.estado)}`
                                    }}
                                >
                                    {/* Paciente */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: getStatusColor(tratamiento.estado),
                                                    width: { xs: 32, sm: 36 },
                                                    height: { xs: 32, sm: 36 },
                                                    mr: { xs: 1, sm: 2 },
                                                }}
                                            >
                                                {tratamiento.paciente_nombre ? tratamiento.paciente_nombre.charAt(0).toUpperCase() : '?'}
                                            </Avatar>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="medium"
                                                    color={colors.text}
                                                    sx={{
                                                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                        maxWidth: { xs: '110px', sm: '100%' },
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {tratamiento.paciente_nombre} {tratamiento.paciente_apellido_paterno || ''} {tratamiento.paciente_apellido_materno || ''}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color={colors.secondaryText}
                                                    sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                                                >
                                                    {esRegistrado ? 'Paciente Registrado' : 'Pre-Registro'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Tratamiento */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <MedicalServices
                                                sx={{
                                                    color: colors.primary,
                                                    fontSize: 18,
                                                    mr: 1
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium" color={colors.text}>
                                                    {tratamiento.nombre_tratamiento}
                                                </Typography>
                                                <Typography variant="caption" color={colors.secondaryText}>
                                                    {tratamiento.categoria_servicio || "General"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Fechas */}
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: colors.text }}>
                                        {formatDate(tratamiento.fecha_inicio)}
                                    </TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: colors.text }}>
                                        {formatDate(tratamiento.fecha_estimada_fin)}
                                    </TableCell>

                                    {/* Progreso */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Box sx={{ width: '70%', mr: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={porcentajeProgreso}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 5,
                                                        bgcolor: 'rgba(0,0,0,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: porcentajeProgreso === 100 ? colors.success : colors.primary
                                                        }
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="caption" color={colors.text}>
                                                {tratamiento.citas_completadas}/{tratamiento.total_citas_programadas}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Estado */}
                                    <TableCell>
                                        <Chip
                                            label={tratamiento.estado || "Pre-Registro"}
                                            sx={{
                                                backgroundColor: getStatusColor(tratamiento.estado),
                                                color: '#FFF',
                                                fontWeight: '500',
                                                fontSize: '0.75rem',
                                                height: '24px',
                                            }}
                                        />
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Ver detalles" arrow>
                                                <IconButton
                                                    onClick={() => handleViewDetails(tratamiento)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: colors.primary,
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: alpha(colors.primary, 0.8),
                                                        }
                                                    }}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            {canChangeToPending(tratamiento) && (
                                                <Tooltip title="Marcar pendiente" arrow>
                                                    <IconButton
                                                        onClick={() => openPendingConfirmation(tratamiento)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: colors.warning,
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: alpha(colors.warning, 0.8),
                                                            }
                                                        }}
                                                    >
                                                        <ChangeCircle />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            
                                            {canActivateTreatment(tratamiento) && (
                                                <Tooltip title="Activar" arrow>
                                                    <IconButton
                                                        onClick={() => openActivateConfirmation(tratamiento)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: colors.purple,
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: alpha(colors.purple, 0.8),
                                                            }
                                                        }}
                                                    >
                                                        <CheckCircle />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            
                                            {canFinalizeTreatment(tratamiento) && (
                                                <Tooltip title="Finalizar" arrow>
                                                    <IconButton
                                                        onClick={() => openFinalizeConfirmation(tratamiento)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: colors.success,
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: alpha(colors.success, 0.8),
                                                            }
                                                        }}
                                                    >
                                                        <AssignmentTurnedIn />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            
                                            {canAbandonTreatment(tratamiento) && (
                                                <Tooltip title="Abandonar" arrow>
                                                    <IconButton
                                                        onClick={() => openAbandonConfirmation(tratamiento)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: colors.error,
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: alpha(colors.error, 0.8),
                                                            }
                                                        }}
                                                    >
                                                        <EventBusy />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            
                                            <Tooltip title="Ver citas" arrow>
                                                <IconButton
                                                    onClick={() => handleViewCitas(tratamiento.id)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: colors.info,
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: alpha(colors.info, 0.8),
                                                        }
                                                    }}
                                                >
                                                    <EventAvailable />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                <Typography color={colors.secondaryText}>No hay tratamientos disponibles</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    // Función para renderizar la vista de tarjetas
    const renderCardView = () => (
        <Grid container spacing={2} sx={{ mt: 2 }}>
            {filteredTratamientos.map((tratamiento, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={tratamiento.id || index}>
                    <Card 
                        sx={{
                            height: '100%',
                            backgroundColor: colors.paper,
                            borderRadius: '12px',
                            boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: isDarkTheme ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)',
                            },
                            position: 'relative',
                            overflow: 'visible',
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: -10, 
                                right: 16,
                            }}
                        >
                            <Chip
                                label={tratamiento.estado || 'No definido'}
                                sx={{
                                    backgroundColor: getStatusColor(tratamiento.estado),
                                    color: 'white',
                                    fontWeight: '500',
                                    fontSize: '0.75rem',
                                    height: '24px',
                                }}
                            />
                        </Box>
                        
                        <CardContent sx={{ pt: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        bgcolor: getStatusColor(tratamiento.estado),
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    {tratamiento.paciente_nombre ? tratamiento.paciente_nombre.charAt(0) : '?'}
                                </Avatar>
                            </Box>
                            
                            <Typography 
                                variant="h6" 
                                align="center" 
                                sx={{ 
                                    color: colors.text,
                                    fontWeight: 600,
                                    mb: 1,
                                }}
                            >
                                {`${tratamiento.paciente_nombre || ''} ${tratamiento.paciente_apellido_paterno || ''}`}
                            </Typography>
                            
                            <Typography 
                                variant="body2" 
                                align="center" 
                                sx={{ 
                                    color: colors.secondaryText,
                                    mb: 2,
                                }}
                            >
                                {tratamiento.nombre_tratamiento}
                            </Typography>
                            
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <DateRange style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: colors.secondaryText }}
                                    >
                                        Inicio: {formatDate(tratamiento.fecha_inicio)}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: colors.secondaryText, mb: 0.5 }}>
                                        Progreso: {tratamiento.citas_completadas}/{tratamiento.total_citas_programadas}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={calcularPorcentajeProgreso(tratamiento)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 5,
                                            bgcolor: 'rgba(0,0,0,0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: calcularPorcentajeProgreso(tratamiento) === 100 ? colors.success : colors.primary
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                                <Tooltip title="Ver detalles">
                                    <IconButton
                                        onClick={() => handleViewDetails(tratamiento)}
                                        size="small"
                                        sx={{
                                            backgroundColor: colors.primary,
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: alpha(colors.primary, 0.8),
                                            }
                                        }}
                                    >
                                        <Visibility />
                                    </IconButton>
                                </Tooltip>
                                
                                {canFinalizeTreatment(tratamiento) && (
                                    <Tooltip title="Finalizar">
                                        <IconButton
                                            onClick={() => openFinalizeConfirmation(tratamiento)}
                                            size="small"
                                            sx={{
                                                backgroundColor: colors.success,
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: alpha(colors.success, 0.8),
                                                }
                                            }}
                                        >
                                            <AssignmentTurnedIn />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                
                                <Tooltip title="Ver citas">
                                    <IconButton
                                        onClick={() => handleViewCitas(tratamiento.id)}
                                        size="small"
                                        sx={{
                                            backgroundColor: colors.info,
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: alpha(colors.info, 0.8),
                                            }
                                        }}
                                    >
                                        <EventAvailable />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    // Función para renderizar la vista detallada
    const renderDetailedView = () => (
        <Box sx={{ mt: 2 }}>
            {filteredTratamientos.map((tratamiento, index) => (
                <Paper 
                    key={tratamiento.id || index}
                    sx={{ 
                        mb: 2, 
                        p: 3, 
                        backgroundColor: colors.paper,
                        borderRadius: '12px',
                        boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.1)',
                        borderLeft: `4px solid ${getStatusColor(tratamiento.estado)}`,
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 50,
                                    height: 50,
                                    bgcolor: getStatusColor(tratamiento.estado),
                                    mr: 2
                                }}
                            >
                                {tratamiento.paciente_nombre ? tratamiento.paciente_nombre.charAt(0).toUpperCase() : '?'}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 'bold' }}>
                                    {`${tratamiento.paciente_nombre || ''} ${tratamiento.paciente_apellido_paterno || ''}`}
                                </Typography>
                                <Chip
                                    label={tratamiento.estado || 'No definido'}
                                    sx={{
                                        backgroundColor: getStatusColor(tratamiento.estado),
                                        color: '#FFF',
                                        fontWeight: '500',
                                        fontSize: '0.75rem',
                                        height: '24px',
                                        mt: 1,
                                    }}
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <MedicalServices style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                                <Typography variant="body1" sx={{ color: colors.text, fontWeight: 'medium' }}>
                                    {tratamiento.nombre_tratamiento}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <Person style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                                <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                                    {isPacienteRegistrado(tratamiento) ? 'Paciente Registrado' : 'Pre-Registro'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Task style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                                <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                                    Categoría: {tratamiento.categoria_servicio || "General"}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <DateRange style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                                <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                                    Inicio: {formatDate(tratamiento.fecha_inicio)}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <DateRange style={{ marginRight: 8, color: colors.primary, fontSize: '0.875rem' }} />
                                <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                                    Fin est.: {formatDate(tratamiento.fecha_estimada_fin)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ color: colors.secondaryText, mr: 1 }}>
                                        Progreso: {tratamiento.citas_completadas}/{tratamiento.total_citas_programadas}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={calcularPorcentajeProgreso(tratamiento)}
                                    sx={{
                                        height: 8,
                                        borderRadius: 5,
                                        width: '100%',
                                        bgcolor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: calcularPorcentajeProgreso(tratamiento) === 100 ? colors.success : colors.primary
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Ver detalles" arrow>
                                    <IconButton
                                        onClick={() => handleViewDetails(tratamiento)}
                                        size="small"
                                        sx={{
                                            backgroundColor: colors.primary,
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: alpha(colors.primary, 0.8),
                                            }
                                        }}
                                    >
                                        <Visibility />
                                    </IconButton>
                                </Tooltip>
                                
                                {canActivateTreatment(tratamiento) && (
                                    <Tooltip title="Activar" arrow>
                                        <IconButton
                                            onClick={() => openActivateConfirmation(tratamiento)}
                                            size="small"
                                            sx={{
                                                backgroundColor: colors.purple,
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: alpha(colors.purple, 0.8),
                                                }
                                            }}
                                        >
                                            <CheckCircle />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                
                                {canFinalizeTreatment(tratamiento) && (
                                    <Tooltip title="Finalizar" arrow>
                                        <IconButton
                                            onClick={() => openFinalizeConfirmation(tratamiento)}
                                            size="small"
                                            sx={{
                                                backgroundColor: colors.success,
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: alpha(colors.success, 0.8),
                                                }
                                            }}
                                        >
                                            <AssignmentTurnedIn />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                
                                <Tooltip title="Ver citas" arrow>
                                    <IconButton
                                        onClick={() => handleViewCitas(tratamiento.id)}
                                        size="small"
                                        sx={{
                                            backgroundColor: colors.info,
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: alpha(colors.info, 0.8),
                                            }
                                        }}
                                    >
                                        <EventAvailable />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            ))}
        </Box>
    );

    // Diálogo para mostrar citas asociadas
    const renderCitasDialog = () => (
        <Dialog
            open={openCitasDialog}
            onClose={() => setOpenCitasDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: colors.paper,
                    color: colors.text,
                    boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
                    borderRadius: '12px'
                }
            }}
        >
            <DialogTitle sx={{
                backgroundColor: colors.info,
                color: 'white',
                display: 'flex',
                alignItems: 'center'
            }}>
                <EventAvailable sx={{ mr: 2 }} />
                Citas asociadas al Tratamiento
            </DialogTitle>

            <DialogContent>
                {isLoadingCitas ? (
                    <Box sx={{ width: '100%', mt: 3, textAlign: 'center' }}>
                        <LinearProgress sx={{ mb: 2 }} />
                        <Typography>Cargando citas asociadas...</Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ mt: 2, backgroundColor: colors.paper }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: colors.tableBackground }}>
                                <TableRow>
                                    <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>#</TableCell>
                                    <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Número de Cita</TableCell>
                                    <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Fecha</TableCell>
                                    <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Estado</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {citasTratamiento.length > 0 ? (
                                    citasTratamiento.map((cita) => (
                                        <TableRow key={cita.consulta_id} sx={{ '&:hover': { backgroundColor: colors.hover } }}>
                                            <TableCell sx={{ color: colors.text }}>{cita.consulta_id}</TableCell>
                                            <TableCell sx={{ color: colors.text }}>{cita.numero_cita_tratamiento}</TableCell>
                                            <TableCell sx={{ color: colors.text }}>{formatDate(cita.fecha_consulta)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={cita.estado}
                                                    sx={{
                                                        backgroundColor: getStatusColor(cita.estado === 'Confirmada' ? 'Activo' : cita.estado),
                                                        color: 'white',
                                                        fontWeight: '500',
                                                        fontSize: '0.75rem',
                                                        height: '24px',
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography color={colors.secondaryText}>No hay citas asociadas a este tratamiento</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setOpenCitasDialog(false)} variant="outlined" color="primary">
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );



    return (
        <Card
            sx={{
                minHeight: '100vh',
                backgroundColor: colors.background,
                borderRadius: '16px',
                boxShadow: isDarkTheme ?
                    '0 2px 12px rgba(0,0,0,0.3)' :
                    '0 2px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease'
            }}
        >
            <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
                {/* Cabecera con título y selector de vista */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexDirection: { xs: 'column', sm: 'row' },
                    mb: { xs: 2, sm: 3 },
                    gap: { xs: 2, sm: 0 }
                }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: colors.titleColor,
                            fontFamily: 'Roboto, sans-serif',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <MedicalServices sx={{ mr: 1.5 }} />
                        Gestión de Tratamientos
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Vista de tabla">
                            <IconButton 
                                onClick={() => handleViewChange('table')}
                                sx={{ 
                                    color: viewMode === 'table' ? 'white' : colors.text,
                                    backgroundColor: viewMode === 'table' ? colors.primary : 'transparent',
                                    '&:hover': {
                                        backgroundColor: viewMode === 'table' ? colors.primary : colors.hover
                                    }
                                }}
                            >
                                <ViewList />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Vista de tarjetas">
                            <IconButton 
                                onClick={() => handleViewChange('grid')}
                                sx={{ 
                                    color: viewMode === 'grid' ? 'white' : colors.text,
                                    backgroundColor: viewMode === 'grid' ? colors.primary : 'transparent',
                                    '&:hover': {
                                        backgroundColor: viewMode === 'grid' ? colors.primary : colors.hover
                                    }
                                }}
                            >
                                <ViewModule />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Vista detallada">
                            <IconButton 
                                onClick={() => handleViewChange('detailed')}
                                sx={{ 
                                    color: viewMode === 'detailed' ? 'white' : colors.text,
                                    backgroundColor: viewMode === 'detailed' ? colors.primary : 'transparent',
                                    '&:hover': {
                                        backgroundColor: viewMode === 'detailed' ? colors.primary : colors.hover
                                    }
                                }}
                            >
                                <ViewStream />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Filtros y Búsqueda */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Filtro de Búsqueda */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Buscar tratamiento o paciente"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color={colors.primary} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                backgroundColor: colors.paper,
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: colors.inputBorder,
                                    },
                                    '&:hover fieldset': {
                                        borderColor: colors.primary,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: colors.primary,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.inputLabel,
                                },
                            }}
                        />
                    </Grid>

                    {/* Filtro por Estado */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por estado</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Filtrar por estado"
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{
                                    backgroundColor: colors.paper,
                                    color: colors.text,
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.inputBorder,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.primary,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.primary,
                                    },
                                }}
                            >
                                <MenuItem value="todos">Todos</MenuItem>
                                <MenuItem value="Pre-Registro">Pre-Registro</MenuItem>
                                <MenuItem value="Pendiente">Pendiente</MenuItem>
                                <MenuItem value="Activo">Activo</MenuItem>
                                <MenuItem value="Finalizado">Finalizado</MenuItem>
                                <MenuItem value="Abandonado">Abandonado</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Filtro por Categoría */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por categoría</InputLabel>
                            <Select
                                value={categoryFilter}
                                label="Filtrar por categoría"
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                sx={{
                                    backgroundColor: colors.paper,
                                    color: colors.text,
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.inputBorder,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.primary,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.primary,
                                    },
                                }}
                            >
                                <MenuItem value="todos">Todos</MenuItem>
                                <MenuItem value="Ortodoncia">Ortodoncia</MenuItem>
                                <MenuItem value="Endodoncia">Endodoncia</MenuItem>
                                <MenuItem value="Periodoncia">Periodoncia</MenuItem>
                                <MenuItem value="Odontopediatría">Odontopediatría</MenuItem>
                                <MenuItem value="Prostodoncia">Prostodoncia</MenuItem>
                                <MenuItem value="Cirugía Oral">Cirugía Oral</MenuItem>
                                <MenuItem value="General">General</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                
                {/* Botones de acciones y filtros */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2 
                }}>
                    {/* Información de resultados */}
                    <Typography sx={{ color: colors.secondaryText }}>
                        {filteredTratamientos.length} {filteredTratamientos.length === 1 ? 'tratamiento' : 'tratamientos'} encontrados
                    </Typography>
                    
                    {/* Botones de acciones */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            component={Link}
                            to="/Administrador/citas/nueva"
                            state={{ from: "/Administrador/tratamientos" }}
                            sx={{
                                backgroundColor: colors.primary,
                                '&:hover': { backgroundColor: alpha(colors.primary, 0.8) },
                            }}
                        >
                            Nuevo Tratamiento
                        </Button>
                        
                    </Box>
                </Box>
                
                {/* Mostrar vista según la selección */}
                {viewMode === 'table' && renderTableView()}
                {viewMode === 'grid' && renderCardView()}
                {viewMode === 'detailed' && renderDetailedView()}
                
                {/* Diálogos */}
                {renderCitasDialog()}
                
                {/* Diálogo de detalles del tratamiento */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: colors.paper,
                            color: colors.text,
                            boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
                            borderRadius: '12px'
                        }
                    }}
                >
                    {selectedTratamiento && (
                        <>
                            <DialogTitle sx={{
                                backgroundColor: getStatusColor(selectedTratamiento.estado),
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <MedicalServices sx={{ mr: 2 }} />
                                    Detalles del Tratamiento #{selectedTratamiento.id}
                                </Box>
                                <Chip
                                    label={selectedTratamiento.estado}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'white',
                                        color: getStatusColor(selectedTratamiento.estado),
                                        fontWeight: 'bold',
                                        border: `1px solid ${getStatusColor(selectedTratamiento.estado)}`
                                    }}
                                />
                            </DialogTitle>

                            <DialogContent sx={{ mt: 2 }}>
                                <Grid container spacing={3}>
                                    {/* Información del Paciente */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" color={colors.primary}>
                                            <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Información del Paciente
                                        </Typography>
                                        <Box sx={{ ml: 4, mt: 1 }}>
                                            <Typography><strong>Nombre:</strong> {selectedTratamiento.paciente_nombre} {selectedTratamiento.paciente_apellido_paterno || ''} {selectedTratamiento.paciente_apellido_materno || ''}</Typography>
                                            <Typography>
                                                <strong>Estatus:</strong> {isPacienteRegistrado(selectedTratamiento) ? (
                                                    <Chip label="Registrado" size="small" sx={{
                                                        bgcolor: '#E8F5E9',
                                                        color: '#2E7D32',
                                                        fontWeight: 'medium',
                                                        fontSize: '0.7rem',
                                                        height: 20,
                                                        ml: 1
                                                    }} />
                                                ) : (
                                                    <Chip label="No Registrado (Pre-Registro)" size="small" sx={{
                                                        bgcolor: '#FFF3E0',
                                                        color: '#E65100',
                                                        fontWeight: 'medium',
                                                        fontSize: '0.7rem',
                                                        height: 20,
                                                        ml: 1
                                                    }} />
                                                )}
                                            </Typography>
                                            <Typography><strong>ID:</strong> {
                                                isPacienteRegistrado(selectedTratamiento) ?
                                                    `Paciente #${selectedTratamiento.paciente_id}` :
                                                    `Pre-Registro #${selectedTratamiento.pre_registro_id}`
                                            }</Typography>
                                        </Box>
                                    </Grid>

                                    {/* Información del Tratamiento */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" color={colors.primary}>
                                            <MedicalServices sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Información del Tratamiento
                                        </Typography>
                                        <Box sx={{ ml: 4, mt: 1 }}>
                                            <Typography><strong>Tipo:</strong> {selectedTratamiento.nombre_tratamiento}</Typography>
                                            <Typography><strong>Servicio ID:</strong> {selectedTratamiento.servicio_id}</Typography>
                                            <Typography><strong>Categoría:</strong> {selectedTratamiento.categoria_servicio || "No especificada"}</Typography>
                                            <Typography><strong>Odontólogo:</strong> {selectedTratamiento.odontologo_nombre || "No asignado"}</Typography>
                                            <Typography><strong>Costo Total:</strong> ${parseFloat(selectedTratamiento.costo_total || 0).toFixed(2)}</Typography>
                                        </Box>
                                    </Grid>

                                    {/* Fechas y progreso */}
                                    <Grid item xs={12}>
                                        <Box sx={{ my: 2, height: '1px', bgcolor: 'divider' }} />
                                        <Typography variant="h6" color={colors.primary}>
                                            <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Fechas y Progreso
                                        </Typography>

                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            <Grid item xs={12} md={4}>
                                                <Paper elevation={2} sx={{ 
                                                    p: 2, 
                                                    borderLeft: `4px solid ${colors.info}`,
                                                    backgroundColor: colors.paper,
                                                }}>
                                                    <Typography variant="body2" color={colors.secondaryText}>Fecha de Inicio</Typography>
                                                    <Typography variant="h6" color={colors.text}>{formatDate(selectedTratamiento.fecha_inicio)}</Typography>
                                                </Paper>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Paper elevation={2} sx={{ 
                                                    p: 2, 
                                                    borderLeft: `4px solid ${colors.warning}`,
                                                    backgroundColor: colors.paper,
                                                }}>
                                                    <Typography variant="body2" color={colors.secondaryText}>Fecha Estimada de Fin</Typography>
                                                    <Typography variant="h6" color={colors.text}>{formatDate(selectedTratamiento.fecha_estimada_fin)}</Typography>
                                                </Paper>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Paper elevation={2} sx={{ 
                                                    p: 2, 
                                                    borderLeft: `4px solid ${colors.success}`,
                                                    backgroundColor: colors.paper,
                                                }}>
                                                    <Typography variant="body2" color={colors.secondaryText}>Progreso de Citas</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                        <Typography variant="h6" color={colors.text} mr={1}>
                                                            {selectedTratamiento.citas_completadas}/{selectedTratamiento.total_citas_programadas}
                                                        </Typography>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={calcularPorcentajeProgreso(selectedTratamiento)}
                                                            sx={{
                                                                width: '40%',
                                                                height: 10,
                                                                borderRadius: 5,
                                                                ml: 1
                                                            }}
                                                        />
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Notas del tratamiento */}
                                    <Grid item xs={12}>
                                        <Box sx={{ my: 2, height: '1px', bgcolor: 'divider' }} />
                                        <Typography variant="h6" color={colors.primary} gutterBottom>
                                            <Task sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Notas del Tratamiento
                                        </Typography>
                                        <Paper
                                            elevation={1}
                                            sx={{
                                                p: 2,
                                                bgcolor: isDarkTheme ? alpha(colors.paper, 0.5) : '#f9f9f9',
                                                minHeight: '100px',
                                                whiteSpace: 'pre-line',
                                                color: colors.text
                                            }}
                                        >
                                            {selectedTratamiento.notas || "Sin notas adicionales para este tratamiento."}
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </DialogContent>

                            <DialogActions>
                                <Button
                                    onClick={() => setOpenDialog(false)}
                                    variant="outlined"
                                    color="primary"
                                >
                                    Cerrar
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<EventAvailable />}
                                    onClick={() => handleViewCitas(selectedTratamiento.id)}
                                >
                                    Ver Citas Asociadas
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
                
                {/* Diálogo para marcar como pendiente */}
                <Dialog
                    open={openPendingDialog}
                    onClose={() => !isChangingToPending && setOpenPendingDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: colors.paper,
                            color: colors.text,
                            boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            borderTop: `5px solid ${colors.warning}`,
                        }
                    }}
                >
                    <DialogTitle sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: colors.warning
                    }}>
                        <NotificationImportant sx={{ mr: 1 }} />
                        Marcar Tratamiento como Pendiente
                    </DialogTitle>

                    <DialogContent>
                        <Typography variant="h6" gutterBottom color={colors.text}>
                            ¿Deseas marcar este tratamiento como pendiente para revisión adicional?
                        </Typography>

                        {tratamientoToPending && (
                            <Box sx={{ mb: 3 }}>
                                <Typography color={colors.text}><strong>Tratamiento:</strong> {tratamientoToPending.nombre_tratamiento}</Typography>
                                <Typography color={colors.text}><strong>Paciente:</strong> {tratamientoToPending.paciente_nombre} {tratamientoToPending.paciente_apellido_paterno || ''} {tratamientoToPending.paciente_apellido_materno || ''}</Typography>
                                <Typography color={colors.text}><strong>Estado actual:</strong> {tratamientoToPending.estado}</Typography>
                            </Box>
                        )}

                        <TextField
                            label="Mensaje o indicaciones"
                            multiline
                            rows={4}
                            fullWidth
                            value={pendingMessage}
                            onChange={(e) => setPendingMessage(e.target.value)}
                            placeholder="Indique por qué se marca como pendiente o qué se necesita revisar..."
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                        borderColor: colors.inputBorder,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.inputLabel,
                                },
                            }}
                        />

                        <Alert severity="info" sx={{ mt: 2 }}>
                            <AlertTitle>Información</AlertTitle>
                            Al marcar como pendiente, el tratamiento queda en espera para confirmar posteriormente.
                            El odontólogo deberá revisar o solicitar más información antes de activarlo.
                        </Alert>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenPendingDialog(false)}
                            color="inherit"
                            disabled={isChangingToPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleChangeToPending}
                            variant="contained"
                            sx={{ bgcolor: colors.warning }}
                            disabled={isChangingToPending}
                        >
                            {isChangingToPending ? 'Procesando...' : 'Marcar como Pendiente'}
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Diálogo para activar tratamiento */}
                <Dialog
                    open={openActivateDialog}
                    onClose={() => !isActivating && setOpenActivateDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: colors.paper,
                            color: colors.text,
                            boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            borderTop: `5px solid ${colors.purple}`,
                        }
                    }}
                >
                    <DialogTitle sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: colors.purple
                    }}>
                        <CheckCircle sx={{ mr: 1 }} />
                        Activar Tratamiento
                    </DialogTitle>

                    <DialogContent>
                        <Typography variant="h6" gutterBottom color={colors.text}>
                            ¿Confirmar y activar este tratamiento?
                        </Typography>

                        {tratamientoToActivate && (
                            <Box sx={{ mb: 3 }}>
                                <Typography color={colors.text}><strong>Tratamiento:</strong> {tratamientoToActivate.nombre_tratamiento}</Typography>
                                <Typography color={colors.text}><strong>Paciente:</strong> {tratamientoToActivate.paciente_nombre} {tratamientoToActivate.paciente_apellido_paterno || ''} {tratamientoToActivate.paciente_apellido_materno || ''}</Typography>
                                <Typography color={colors.text}><strong>Estado actual:</strong> {tratamientoToActivate.estado}</Typography>
                                <Typography color={colors.text}><strong>Duración planeada:</strong> {tratamientoToActivate.total_citas_programadas} citas</Typography>
                            </Box>
                        )}

                        <TextField
                            label="Mensaje de activación"
                            multiline
                            rows={3}
                            fullWidth
                            value={activateMessage}
                            onChange={(e) => setActivateMessage(e.target.value)}
                            placeholder="Añada notas o indicaciones sobre la activación del tratamiento..."
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                        borderColor: colors.inputBorder,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.inputLabel,
                                },
                            }}
                        />

                        <Alert severity="success" sx={{ mt: 2 }}>
                            <AlertTitle>Importante</AlertTitle>
                            Al activar el tratamiento, se confirmará la primera cita y se podrán programar las citas restantes.
                            El sistema automáticamente actualizará el estado de la primera cita a "Confirmada".
                        </Alert>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenActivateDialog(false)}
                            color="inherit"
                            disabled={isActivating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleActivateTreatment}
                            variant="contained"
                            sx={{ bgcolor: colors.purple, '&:hover': { bgcolor: alpha(colors.purple, 0.8) } }}
                            disabled={isActivating}
                        >
                            {isActivating ? 'Procesando...' : 'Activar Tratamiento'}
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Diálogo para finalizar tratamiento */}
                <Dialog
                    open={openFinalizeDialog}
                    onClose={() => !isFinalizing && setOpenFinalizeDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: colors.paper,
                            color: colors.text,
                            boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            borderTop: `5px solid ${colors.success}`,
                        }
                    }}
                >
                    <DialogTitle sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: colors.success
                    }}>
                        <CheckCircle sx={{ mr: 1 }} />
                        Finalizar Tratamiento
                    </DialogTitle>

                    <DialogContent>
                        <Typography variant="h6" gutterBottom color={colors.text}>
                            ¿Estás seguro de finalizar el tratamiento #{tratamientoToFinalize?.id}?
                        </Typography>

                        {tratamientoToFinalize && (
                            <Box sx={{ mb: 3 }}>
                                <Typography color={colors.text}><strong>Tratamiento:</strong> {tratamientoToFinalize.nombre_tratamiento}</Typography>
                                <Typography color={colors.text}><strong>Paciente:</strong> {tratamientoToFinalize.paciente_nombre} {tratamientoToFinalize.paciente_apellido_paterno || ''} {tratamientoToFinalize.paciente_apellido_materno || ''}</Typography>
                                <Typography color={colors.text}><strong>Progreso:</strong> {tratamientoToFinalize.citas_completadas}/{tratamientoToFinalize.total_citas_programadas} citas</Typography>
                            </Box>
                        )}

                        <TextField
                            label="Notas de finalización"
                            multiline
                            rows={4}
                            fullWidth
                            value={finalizeNote}
                            onChange={(e) => setFinalizeNote(e.target.value)}
                            placeholder="Ingrese cualquier observación sobre la finalización del tratamiento..."
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                        borderColor: colors.inputBorder,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.inputLabel,
                                },
                            }}
                        />

                        <Alert severity="info" sx={{ mt: 2 }}>
                            <AlertTitle>Información</AlertTitle>
                            Al finalizar el tratamiento, este quedará registrado como completado y no se podrán agregar más citas.
                        </Alert>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenFinalizeDialog(false)}
                            color="inherit"
                            disabled={isFinalizing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleFinalizeTreatment}
                            variant="contained"
                            color="success"
                            disabled={isFinalizing}
                        >
                            {isFinalizing ? 'Procesando...' : 'Confirmar Finalización'}
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Diálogo para abandonar tratamiento */}
                <Dialog
                    open={openAbandonDialog}
                    onClose={() => !isAbandoning && setOpenAbandonDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: colors.paper,
                            color: colors.text,
                            boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            borderTop: `5px solid ${colors.error}`,
                        }
                    }}
                >
                    <DialogTitle sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: colors.error
                    }}>
                        <Cancel sx={{ mr: 1 }} />
                        Abandonar Tratamiento
                    </DialogTitle>

                    <DialogContent>
                        <Typography variant="h6" gutterBottom color={colors.text}>
                            ¿Estás seguro de marcar como abandonado el tratamiento #{tratamientoToAbandon?.id}?
                        </Typography>

                        {tratamientoToAbandon && (
                            <Box sx={{ mb: 3 }}>
                                <Typography color={colors.text}><strong>Tratamiento:</strong> {tratamientoToAbandon.nombre_tratamiento}</Typography>
                                <Typography color={colors.text}><strong>Paciente:</strong> {tratamientoToAbandon.paciente_nombre} {tratamientoToAbandon.paciente_apellido_paterno || ''} {tratamientoToAbandon.paciente_apellido_materno || ''}</Typography>
                                <Typography color={colors.text}><strong>Progreso actual:</strong> {tratamientoToAbandon.citas_completadas}/{tratamientoToAbandon.total_citas_programadas} citas</Typography>
                            </Box>
                        )}

                        <TextField
                            label="Motivo del abandono"
                            multiline
                            rows={4}
                            fullWidth
                            required
                            value={abandonReason}
                            onChange={(e) => setAbandonReason(e.target.value)}
                            placeholder="Especifique el motivo por el cual el paciente abandona el tratamiento..."
                            variant="outlined"
                            error={!abandonReason && openAbandonDialog}
                            helperText={!abandonReason && openAbandonDialog ? "Este campo es obligatorio" : ""}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: colors.text,
                                    '& fieldset': {
                                        borderColor: colors.inputBorder,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: colors.inputLabel,
                                },
                            }}
                        />

                        <Alert severity="warning" sx={{ mt: 2 }}>
                            <AlertTitle>Aviso Importante</AlertTitle>
                            Al marcar un tratamiento como abandonado, se cancelarán todas las citas futuras asociadas a este tratamiento.
                        </Alert>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenAbandonDialog(false)}
                            color="inherit"
                            disabled={isAbandoning}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAbandonTreatment}
                            variant="contained"
                            color="error"
                            disabled={isAbandoning || !abandonReason}
                        >
                            {isAbandoning ? 'Procesando...' : 'Confirmar Abandono'}
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
        </Card>
    );
};

export default TratamientosGestion;