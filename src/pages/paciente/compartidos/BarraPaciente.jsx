import React, { useState, useEffect, useCallback } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Drawer,
    SwipeableDrawer,
    Badge,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
    Divider,
    useTheme,
    useMediaQuery,
    Paper,
    Tooltip
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaHome, FaUserCircle, FaCalendarAlt, FaFileMedical, FaPills,
    FaFileAlt, FaWallet, FaChartLine, FaComments, FaBell,
    FaQuestionCircle, FaCog, FaSignOutAlt, FaTooth,
    FaAngleDown, FaAngleRight, FaBars, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { WbSunnyRounded, NightsStayRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const BarraPaciente = ({ onDrawerChange }) => {
    const [notificationMessage, setNotificationMessage] = useState('');
    const [openNotification, setOpenNotification] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState(2);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isDarkTheme, toggleTheme } = useThemeContext();
    const { setUser, user } = useAuth();

    // Organizamos los menús en grupos lógicos
    const menuGroups = [
        {
            id: 'personal',
            title: 'Personal',
            items: [
                { icon: FaUserCircle, text: 'Mi Perfil', path: '/Paciente/perfil' },
                { icon: FaCalendarAlt, text: 'Mis Citas', path: '/Paciente/citas' }
            ]
        },
        {
            id: 'clinico',
            title: 'Información Clínica',
            items: [
                { icon: FaFileMedical, text: 'Historial Clínico', path: '/Paciente/historial' },
                { icon: FaPills, text: 'Tratamientos', path: '/Paciente/tratamientos' },
                { icon: FaFileAlt, text: 'Recetas', path: '/Paciente/recetas' },
                { icon: FaWallet, text: 'Pagos', path: '/Paciente/pagos' },
                { icon: FaChartLine, text: 'Progreso', path: '/Paciente/progreso' }
            ]
        },
        {
            id: 'comunicacion',
            title: 'Comunicación',
            items: [
                { icon: FaComments, text: 'Mensajes', path: '/Paciente/mensajes' },
                { icon: FaBell, text: 'Notificaciones', path: '/Paciente/notificaciones' }
            ]
        }
    ];

    // Función para determinar a qué grupo pertenece la ruta actual
    const getGroupIdFromPath = (path) => {
        for (const group of menuGroups) {
            if (group.items.some(item => item.path === path)) {
                return group.id;
            }
        }
        return null;
    };

    // Estado para manejar los grupos expandidos/colapsados - inicializado basado en la ruta actual
    const [expandedGroups, setExpandedGroups] = useState(() => {
        const currentGroupId = getGroupIdFromPath(location.pathname);
        return {
            personal: currentGroupId === 'personal',
            clinico: currentGroupId === 'clinico',
            comunicacion: currentGroupId === 'comunicacion'
        };
    });

    // Actualizar menús expandidos cuando cambia la ruta
    useEffect(() => {
        const currentGroupId = getGroupIdFromPath(location.pathname);
        if (currentGroupId) {
            setExpandedGroups(prev => ({
                ...prev,
                [currentGroupId]: true
            }));
        }
    }, [location.pathname]);

    // Configuración de colores basados en el tema (adoptando los de BarraAdmin)
    const colors = {
        background: isDarkTheme ? '#1A1F2C' : '#FFFFFF',
        primary: isDarkTheme ? '#3B82F6' : '#2563EB', // Azul más vibrante como BarraAdmin
        secondary: isDarkTheme ? '#4ADE80' : '#10B981',
        text: isDarkTheme ? '#F3F4F6' : '#1F2937',
        secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
        hover: isDarkTheme ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.08)', // Hover mejorado
        menuBg: isDarkTheme ? '#111827' : '#F9FAFB',
        sidebarHeader: isDarkTheme ? '#0F172A' : '#EFF6FF',
        iconColor: isDarkTheme ? '#E5E7EB' : '#4B5563',
        activeItem: isDarkTheme ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.1)', // Activo mejorado
        divider: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        error: isDarkTheme ? '#F87171' : '#EF4444',
        boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)'
    };

    // Función para comunicar el cambio de estado del drawer al componente padre
    const updateDrawerState = useCallback((isOpen) => {
        setDrawerOpen(isOpen);
        if (onDrawerChange) {
            onDrawerChange(isOpen);
        }
    }, [onDrawerChange]);

    // Ajustar el estado inicial según el dispositivo
    useEffect(() => {
        if (!isMobile) {
            updateDrawerState(true);
            setMobileOpen(false);
        } else {
            updateDrawerState(false);
        }
    }, [isMobile, updateDrawerState]);

    // Verificar autenticación al cargar
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error("Usuario no autenticado");
                }

                const data = await response.json();

                // NUEVO: Usar allAuthenticatedUsers para obtener el paciente
                if (data.authenticated && data.allAuthenticatedUsers && data.allAuthenticatedUsers.paciente) {
                    setUser(data.allAuthenticatedUsers.paciente);
                    console.log('✅ Paciente autenticado correctamente');
                } else {
                    console.log('❌ No hay sesión de paciente activa');
                    setUser(null);
                }
            } catch (error) {
                console.error("Error al verificar autenticación:", error);
                setUser(null);
            }
        };

        checkAuthStatus();
    }, [setUser]);

    // Manejar expansión/colapso de grupos
    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Manejar clic en elementos del menú
    const handleItemClick = (item) => {
        if (item.text === 'Cerrar Sesión') {
            handleLogout();
        } else if (item.path) {
            navigate(item.path);
            // En móvil, cerrar el drawer después de seleccionar una opción
            if (isMobile) {
                setMobileOpen(false);
                updateDrawerState(false);
            }
        }
    };

    // Función para alternar el estado del drawer
    const toggleDrawer = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            updateDrawerState(!drawerOpen);
        }
    };

    // Manejar cierre de sesión
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            setNotificationMessage('Cerrando sesión... Redirigiendo...');
            setOpenNotification(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await fetch('https://back-end-4803.onrender.com/api/users/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error en logout: ${response.status}`);
            }

            setNotificationMessage('Sesión cerrada exitosamente');
            await new Promise(resolve => setTimeout(resolve, 1500));

            setUser(null);
            setOpenNotification(false);
            navigate('/', { replace: true });

        } catch (error) {
            console.error('❌ Error en logout:', error.message);
            setNotificationMessage('Error al cerrar sesión. Intente nuevamente.');
            setOpenNotification(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            setOpenNotification(false);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Ancho del drawer según estado y dispositivo
    const drawerWidth = drawerOpen ? 280 : 0; // Cambiado para consistencia con BarraAdmin
    const mobileDrawerWidth = '85%';

    // Contenido común del drawer (utilizado tanto en móvil como en escritorio)
    const drawerContent = (
        <>
            {/* Cabecera del Drawer - Logo y Nombre */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.sidebarHeader,
                p: 2,
                height: 64,
                borderBottom: `1px solid ${colors.divider}`
            }}>
                <Box
                    component={Link}
                    to="/Paciente/principal"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: colors.text,
                        overflow: 'hidden'
                    }}
                >
                    <FaTooth style={{
                        fontSize: 26,
                        color: colors.primary,
                        flexShrink: 0,
                        marginRight: 12
                    }} />

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            color: colors.primary,
                            fontSize: '1rem',
                            letterSpacing: 0.5,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Odontología Carol
                    </Typography>
                </Box>

                {/* Botón cerrar en móvil o escritorio */}
                <IconButton
                    onClick={isMobile ? () => setMobileOpen(false) : () => updateDrawerState(false)}
                    sx={{
                        color: colors.iconColor,
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                    }}
                >
                    <FaChevronLeft />
                </IconButton>
            </Box>

            {/* Área de usuario */}
            <Box sx={{
                py: 2,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderBottom: `1px solid ${colors.divider}`
            }}>
                <Avatar
                    sx={{
                        bgcolor: colors.primary,
                        width: 64,
                        height: 64,
                        mb: 1.5
                    }}
                >
                    <FaUserCircle size={32} />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                    {user?.nombre || 'Paciente'}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: colors.secondaryText, fontWeight: 'medium', mb: 0.5 }}
                >
                    Paciente
                </Typography>
                <Typography variant="body2" color={colors.secondaryText}>
                    {user?.email || 'paciente@odontologiacarol.com'}
                </Typography>
            </Box>

            {/* Contenido del Drawer */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100% - 200px)',
                flexGrow: 1,
                overflow: 'hidden'
            }}>
                {/* Menú de navegación */}
                <List sx={{
                    px: 1.5,
                    py: 2,
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '::-webkit-scrollbar': {
                        width: '6px'
                    },
                    '::-webkit-scrollbar-thumb': {
                        backgroundColor: colors.divider,
                        borderRadius: '6px'
                    }
                }}>
                    {/* Panel Principal - Nuevo elemento agregado */}
                    <Paper
                        elevation={0}
                        sx={{
                            backgroundColor:
                                location.pathname === '/Paciente/principal'
                                    ? colors.activeItem
                                    : 'transparent',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            transition: 'background-color 0.2s ease',
                            mb: 1.5,
                            '&:hover': {
                                backgroundColor:
                                    location.pathname === '/Paciente/principal'
                                        ? colors.activeItem
                                        : colors.hover
                            }
                        }}
                    >
                        <ListItem
                            button
                            onClick={() => handleItemClick({ path: '/Paciente/principal' })}
                            disableRipple
                            sx={{
                                py: 1.5,
                                px: 1.5
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color:
                                        location.pathname === '/Paciente/principal'
                                            ? colors.primary
                                            : colors.iconColor,
                                    minWidth: 36
                                }}
                            >
                                <FaHome size={18} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Panel Principal"
                                primaryTypographyProps={{
                                    fontSize: '0.9rem',
                                    fontWeight:
                                        location.pathname === '/Paciente/principal' ? 600 : 500,
                                    color:
                                        location.pathname === '/Paciente/principal'
                                            ? colors.primary
                                            : colors.text
                                }}
                            />
                        </ListItem>
                    </Paper>

                    <Divider sx={{ my: 1.5, borderColor: colors.divider }} />

                    {/* Grupos de menú */}
                    {menuGroups.map((group) => (
                        <React.Fragment key={group.id}>
                            {/* Encabezado de Grupo */}
                            <ListItem
                                button
                                onClick={() => toggleGroup(group.id)}
                                disableRipple
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    py: 1,
                                    '&:hover': { backgroundColor: 'transparent' }
                                }}
                            >
                                <ListItemText
                                    primary={group.title}
                                    primaryTypographyProps={{
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem',
                                        letterSpacing: 0.5,
                                        textTransform: 'uppercase',
                                        color: colors.secondaryText
                                    }}
                                />
                                <Box sx={{
                                    color: colors.secondaryText,
                                    transition: 'transform 0.2s',
                                    transform: expandedGroups[group.id] ? 'rotate(0deg)' : 'rotate(-90deg)'
                                }}>
                                    <FaAngleDown size={14} />
                                </Box>
                            </ListItem>

                            {/* Items del grupo */}
                            <Collapse in={expandedGroups[group.id]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {group.items.map((item, index) => {
                                        const isActive = location.pathname === item.path;

                                        return (
                                            <Paper
                                                key={index}
                                                elevation={0}
                                                sx={{
                                                    backgroundColor: isActive ? colors.activeItem : 'transparent',
                                                    borderRadius: 1.5,
                                                    overflow: 'hidden',
                                                    transition: 'background-color 0.2s ease',
                                                    mb: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: isActive ? colors.activeItem : colors.hover,
                                                    }
                                                }}
                                            >
                                                <ListItem
                                                    button
                                                    onClick={() => handleItemClick(item)}
                                                    disableRipple
                                                    sx={{
                                                        py: 1.2,
                                                        pl: 2,
                                                        pr: 1,
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            color: isActive ? colors.primary : colors.iconColor,
                                                            minWidth: 36,
                                                        }}
                                                    >
                                                        <item.icon size={16} />
                                                    </ListItemIcon>

                                                    <ListItemText
                                                        primary={item.text}
                                                        primaryTypographyProps={{
                                                            fontSize: '0.875rem',
                                                            fontWeight: isActive ? 600 : 400,
                                                            color: isActive ? colors.primary : colors.text
                                                        }}
                                                    />
                                                </ListItem>
                                            </Paper>
                                        );
                                    })}
                                </List>
                            </Collapse>

                            <Divider sx={{ my: 1.5, borderColor: colors.divider }} />
                        </React.Fragment>
                    ))}

                    {/* Ayuda y Configuración (fuera de grupos) */}
                    <Paper
                        elevation={0}
                        sx={{
                            backgroundColor: location.pathname === '/Paciente/ayuda'
                                ? colors.activeItem
                                : 'transparent',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            transition: 'background-color 0.2s ease',
                            mb: 0.5,
                            mt: 1,
                            '&:hover': {
                                backgroundColor: location.pathname === '/Paciente/ayuda'
                                    ? colors.activeItem
                                    : colors.hover,
                            }
                        }}
                    >
                        <ListItem
                            button
                            onClick={() => handleItemClick({ path: '/Paciente/ayuda' })}
                            disableRipple
                            sx={{
                                py: 1.2,
                                px: 1.5,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: location.pathname === '/Paciente/ayuda'
                                        ? colors.primary
                                        : colors.iconColor,
                                    minWidth: 36,
                                }}
                            >
                                <FaQuestionCircle size={16} />
                            </ListItemIcon>

                            <ListItemText
                                primary="Ayuda"
                                primaryTypographyProps={{
                                    fontSize: '0.875rem',
                                    fontWeight: location.pathname === '/Paciente/ayuda' ? 600 : 400,
                                    color: location.pathname === '/Paciente/ayuda'
                                        ? colors.primary
                                        : colors.text
                                }}
                            />
                        </ListItem>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            backgroundColor: location.pathname === '/Paciente/configuracion'
                                ? colors.activeItem
                                : 'transparent',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            transition: 'background-color 0.2s ease',
                            mb: 0.5,
                            '&:hover': {
                                backgroundColor: location.pathname === '/Paciente/configuracion'
                                    ? colors.activeItem
                                    : colors.hover,
                            }
                        }}
                    >
                        <ListItem
                            button
                            onClick={() => handleItemClick({ path: '/Paciente/configuracion' })}
                            disableRipple
                            sx={{
                                py: 1.2,
                                px: 1.5,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: location.pathname === '/Paciente/configuracion'
                                        ? colors.primary
                                        : colors.iconColor,
                                    minWidth: 36,
                                }}
                            >
                                <FaCog size={16} />
                            </ListItemIcon>

                            <ListItemText
                                primary="Configuración"
                                primaryTypographyProps={{
                                    fontSize: '0.875rem',
                                    fontWeight: location.pathname === '/Paciente/configuracion' ? 600 : 400,
                                    color: location.pathname === '/Paciente/configuracion'
                                        ? colors.primary
                                        : colors.text
                                }}
                            />
                        </ListItem>
                    </Paper>
                </List>

                {/* Cerrar Sesión (separado al final) */}
                <Box sx={{
                    p: 1.5,
                    mt: 'auto',
                    borderTop: `1px solid ${colors.divider}`,
                    backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                }}>
                    <Paper
                        elevation={0}
                        sx={{
                            backgroundColor: 'transparent',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            transition: 'background-color 0.2s ease',
                            '&:hover': {
                                backgroundColor: isDarkTheme ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
                            }
                        }}
                    >
                        <ListItem
                            button
                            onClick={handleLogout}
                            disableRipple
                            sx={{
                                py: 1.2,
                                px: 1.5
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: colors.error,
                                    minWidth: 36,
                                }}
                            >
                                <FaSignOutAlt size={16} />
                            </ListItemIcon>

                            <ListItemText
                                primary="Cerrar Sesión"
                                primaryTypographyProps={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: colors.error
                                }}
                            />
                        </ListItem>
                    </Paper>
                </Box>
            </Box>
        </>
    );

    // Renderizado específico para móvil con SwipeableDrawer
    const renderMobileDrawer = () => (
        <SwipeableDrawer
            disableBackdropTransition={false}
            disableDiscovery={false}
            open={mobileOpen}
            onOpen={() => setMobileOpen(true)}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
                keepMounted: true, // Mejor rendimiento en móvil
            }}
            sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: mobileDrawerWidth,
                    backgroundColor: colors.menuBg,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                },
            }}
        >
            {drawerContent}
        </SwipeableDrawer>
    );

    // Renderizado para escritorio
    const renderDesktopDrawer = () => (
        <Drawer
            variant="persistent"
            open={drawerOpen}
            onClose={() => updateDrawerState(false)}
            sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': {
                    position: 'fixed',
                    width: drawerWidth,
                    transition: 'width 0.3s ease',
                    boxSizing: 'border-box',
                    top: 0,
                    height: '100%',
                    backgroundColor: colors.menuBg,
                    borderRight: `1px solid ${colors.divider}`,
                    boxShadow: colors.boxShadow,
                    zIndex: theme.zIndex.drawer
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );

    // Botón flotante para expandir el menú en escritorio cuando está contraído
    const renderExpandButton = () => {
        if (drawerOpen || isMobile) return null;
        return (
            <Box
                sx={{
                    position: 'fixed',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: theme.zIndex.drawer - 1,
                    backgroundColor: colors.primary,
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                    opacity: 0.9,
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s'
                }}
            >
                <IconButton onClick={toggleDrawer} sx={{ color: '#fff', p: 0.8 }}>
                    <FaChevronRight size={18} />
                </IconButton>
            </Box>
        );
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    boxShadow: colors.boxShadow,
                    zIndex: theme.zIndex.drawer + 1,
                    width: '100%',
                    borderBottom: `1px solid ${colors.divider}`
                }}
                elevation={0}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Ícono hamburguesa en móvil o cuando el drawer está cerrado en desktop */}
                        {(isMobile || !drawerOpen) && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={toggleDrawer}
                                edge="start"
                                sx={{
                                    color: colors.iconColor,
                                    mr: 2,
                                    '&:hover': { backgroundColor: colors.hover }
                                }}
                            >
                                <FaBars />
                            </IconButton>
                        )}

                        {/* Título de Página con icono de diente */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FaTooth style={{
                                fontSize: 22,
                                color: colors.primary,
                                marginRight: 10
                            }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 500,
                                    color: colors.text,
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}
                            >
                                Portal del Paciente
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Botón de notificaciones */}
                        <IconButton
                            size="medium"
                            sx={{
                                color: colors.iconColor,
                                borderRadius: 1.5,
                                padding: 1,
                                '&:hover': {
                                    color: colors.primary,
                                    backgroundColor: colors.hover
                                }
                            }}
                        >
                            <Badge
                                badgeContent={pendingNotifications}
                                color="error"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: colors.error,
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        minWidth: 18,
                                        height: 18
                                    }
                                }}
                            >
                                <FaBell size={18} />
                            </Badge>
                        </IconButton>

                        {/* Botón de calendario - Nueva funcionalidad agregada */}
                        <IconButton
                            component={Link}
                            to="/Paciente/citas"
                            sx={{
                                color:
                                    location.pathname === '/Paciente/citas'
                                        ? colors.primary
                                        : colors.iconColor,
                                '&:hover': { color: colors.primary, backgroundColor: colors.hover }
                            }}
                        >
                            <FaCalendarAlt size={18} />
                        </IconButton>

                        {/* Botón de Cambio de Tema - Nueva funcionalidad agregada */}
                        <Tooltip title={isDarkTheme ? "Modo claro" : "Modo oscuro"} arrow placement="bottom">
                            <IconButton
                                onClick={toggleTheme}
                                sx={{
                                    color: isDarkTheme ? '#FFC107' : '#5E35B1',
                                    backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.1)' : 'rgba(94, 53, 177, 0.05)',
                                    borderRadius: '50%',
                                    padding: '8px',
                                    width: '38px',
                                    height: '38px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.2)' : 'rgba(94, 53, 177, 0.1)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: isDarkTheme ? 180 : 0 }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                >
                                    {isDarkTheme ? (
                                        <WbSunnyRounded sx={{ fontSize: '20px' }} />
                                    ) : (
                                        <NightsStayRounded sx={{ fontSize: '20px' }} />
                                    )}
                                </motion.div>
                            </IconButton>
                        </Tooltip>

                        {/* Botón de inicio/casa */}
                        <IconButton
                            component={Link}
                            to="/Paciente/principal"
                            sx={{
                                color: location.pathname === '/Paciente/principal'
                                    ? colors.primary
                                    : colors.iconColor,
                                '&:hover': {
                                    color: colors.primary,
                                    backgroundColor: colors.hover
                                }
                            }}
                        >
                            <FaHome size={18} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Renderizado diferenciado para móvil y escritorio */}
            {renderMobileDrawer()}
            {renderDesktopDrawer()}
            {renderExpandButton()}

            {/* Componente de notificaciones */}
            <Notificaciones
                open={openNotification}
                message={notificationMessage}
                type="info"
                handleClose={() => setOpenNotification(false)}
            />
        </>
    );
};

export default BarraPaciente;