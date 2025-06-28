import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
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
  SwipeableDrawer,
  Tooltip
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Importa los iconos de FontAwesome
import {
  FaHome,
  FaCalendarAlt,
  FaBell,
  FaSignOutAlt,
  FaTooth,
  FaUserCircle,
  FaAngleDown,
  FaBars,
  FaQuestionCircle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

// Iconos de Material Design
import {
  MdPeople,
  MdMedicalServices,
  MdEvent,
  MdLocalHospital,
  MdAttachMoney,
  MdSchedule,
  MdCloudUpload,
  MdShowChart,
  MdDescription,
  MdHistory,
  MdNotifications,
  MdRateReview,
  MdSettings,
} from 'react-icons/md';

import { WbSunnyRounded, NightsStayRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import { useAuth } from '../../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const BarraAdmin = ({ onDrawerChange }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [openNotification, setOpenNotification] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState(3);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme, toggleTheme } = useThemeContext();
  const { setUser, user } = useAuth();

  // Estructura de menú organizada por grupos
  const menuGroups = [
    {
      id: 'gestion',
      title: 'Gestión',
      items: [
        { icon: MdPeople, text: 'Gestión de Pacientes', path: '/Administrador/pacientes' },
        { icon: MdPeople, text: 'Gestión de Empleados', path: '/Administrador/empleados' },
        { icon: MdMedicalServices, text: 'Gestión de Servicios', path: '/Administrador/servicios' },
        { icon: MdEvent, text: 'Gestión de Citas', path: '/Administrador/citas' },
        { icon: MdLocalHospital, text: 'Gestión de Tratamientos', path: '/Administrador/tratamientos' },
        { icon: MdAttachMoney, text: 'Finanzas', path: '/Administrador/finanzas' },
        { icon: MdSchedule, text: 'Gestión de Horarios', path: '/Administrador/horarios' },
        { icon: MdCloudUpload, text: 'Subida de Imágenes', path: '/Administrador/imagenes' }
      ]
    },
    {
      id: 'reportes',
      title: 'Informes y Análisis',
      items: [
        { icon: MdShowChart, text: 'Estadísticas', path: '/Administrador/Estadisticas' },
        { icon: MdDescription, text: 'Reportes', path: '/Administrador/reportes' },
        { icon: MdRateReview, text: 'Reseñas', path: '/Administrador/Resenyas' },
        { icon: MdHistory, text: 'Historial', path: '/Administrador/historial' }
      ]
    },
    {
      id: 'sistema',
      title: 'Sistema',
      items: [
        { icon: MdNotifications, text: 'Notificaciones', path: '/Administrador/notificaciones' },
        { icon: MdSettings, text: 'Configuración', path: '/Administrador/configuracion' }
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

  // Estados para los submenús tipo acordeón - inicializado basado en la ruta actual
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const currentGroupId = getGroupIdFromPath(location.pathname);
    return {
      gestion: currentGroupId === 'gestion',
      reportes: currentGroupId === 'reportes',
      sistema: currentGroupId === 'sistema'
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
      updateDrawerState(true); // En escritorio, drawer abierto por defecto
      setMobileOpen(false);    // Asegurar que el drawer móvil esté cerrado
    } else {
      updateDrawerState(false); // En móvil, drawer cerrado por defecto
    }
  }, [isMobile, updateDrawerState]);

  // Verificar autenticación
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error("Usuario no autenticado");

        const data = await response.json();

        // NUEVO: Usar allAuthenticatedUsers para obtener el admin
        if (data.authenticated && data.allAuthenticatedUsers && data.allAuthenticatedUsers.administrador) {
          setUser(data.allAuthenticatedUsers.administrador);
          console.log('✅ Administrador autenticado correctamente');
        } else {
          console.log('❌ No hay sesión de administrador activa');
          setUser(null);
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setUser(null);
      }
    };
    checkAuthStatus();
  }, [setUser]);

  // Paleta de colores basada en el tema
  const colors = {
    background: isDarkTheme ? '#1A1F2C' : '#FFFFFF',
    primary: isDarkTheme ? '#3B82F6' : '#2563EB',
    secondary: isDarkTheme ? '#4ADE80' : '#10B981',
    text: isDarkTheme ? '#F3F4F6' : '#1F2937',
    secondaryText: isDarkTheme ? '#94A3B8' : '#64748B',
    hover: isDarkTheme ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.08)',
    menuBg: isDarkTheme ? '#111827' : '#F9FAFB',
    sidebarHeader: isDarkTheme ? '#0F172A' : '#EFF6FF',
    iconColor: isDarkTheme ? '#E5E7EB' : '#4B5563',
    activeItem: isDarkTheme ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.1)',
    divider: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    error: isDarkTheme ? '#F87171' : '#EF4444',
    boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)'
  };

  // Maneja la expansión y colapso de grupos de menú
  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Maneja la navegación al hacer clic en elementos del menú
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

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      setNotificationMessage('Cerrando sesión... Redirigiendo...');
      setOpenNotification(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await fetch('https://back-end-4803.onrender.com/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Error en logout: ${response.status}`);
      setNotificationMessage('Sesión cerrada exitosamente');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUser(null);
      setOpenNotification(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error en logout:', error.message);
      setNotificationMessage('Error al cerrar sesión. Intente nuevamente.');
      setOpenNotification(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOpenNotification(false);
    } finally {
      setIsLoggingOut(false);
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

  // Ancho del drawer según estado y dispositivo
  const drawerWidth = drawerOpen ? 280 : 0; // Ancho en desktop
  const mobileDrawerWidth = '85%'; // Ancho en móvil

  // Contenido común del drawer (utilizado tanto en móvil como en escritorio)
  const drawerContent = (
    <>
      {/* Cabecera del Drawer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.sidebarHeader,
          p: 2,
          height: 64,
          borderBottom: `1px solid ${colors.divider}`
        }}
      >
        <Box
          component={Link}
          to="/Administrador/principal"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: colors.text,
            overflow: 'hidden'
          }}
        >
          <FaTooth
            style={{
              fontSize: 26,
              color: colors.primary,
              flexShrink: 0,
              marginRight: 12
            }}
          />
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Botón de cambio de tema en drawer móvil */}
          {isMobile && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              sx={{
                color: isDarkTheme ? '#FFC107' : '#5E35B1',
                backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.1)' : 'rgba(94, 53, 177, 0.05)',
                borderRadius: '50%',
                padding: '6px',
                width: '32px',
                height: '32px',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.2)' : 'rgba(94, 53, 177, 0.1)',
                }
              }}
            >
              <motion.div
                animate={{ rotate: isDarkTheme ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {isDarkTheme ? (
                  <WbSunnyRounded sx={{ fontSize: '18px' }} />
                ) : (
                  <NightsStayRounded sx={{ fontSize: '18px' }} />
                )}
              </motion.div>
            </IconButton>
          )}

          {/* Botón cerrar */}
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
      </Box>

      {/* Área de usuario */}
      <Box
        sx={{
          py: 2,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.divider}`
        }}
      >
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
          {user?.nombre || 'Admin'}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: colors.secondaryText, fontWeight: 'medium', mb: 0.5 }}
        >
          Administrador
        </Typography>
        <Typography variant="body2" color={colors.secondaryText}>
          {user?.email || 'admin@odontologiacarol.com'}
        </Typography>
      </Box>

      {/* Contenido del menú */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 200px)',
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        <List
          sx={{
            px: 1.5,
            py: 2,
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            '::-webkit-scrollbar': { width: '6px' },
            '::-webkit-scrollbar-thumb': { backgroundColor: colors.divider, borderRadius: '6px' }
          }}
        >
          {/* Panel Principal */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor:
                location.pathname === '/Administrador/principal'
                  ? colors.activeItem
                  : 'transparent',
              borderRadius: 1.5,
              overflow: 'hidden',
              transition: 'background-color 0.2s ease',
              mb: 1.5,
              '&:hover': {
                backgroundColor:
                  location.pathname === '/Administrador/principal'
                    ? colors.activeItem
                    : colors.hover
              }
            }}
          >
            <ListItem
              button
              onClick={() => handleItemClick({ path: '/Administrador/principal' })}
              disableRipple
              sx={{
                py: 1.5,
                px: 1.5
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === '/Administrador/principal'
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
                    location.pathname === '/Administrador/principal' ? 600 : 500,
                  color:
                    location.pathname === '/Administrador/principal'
                      ? colors.primary
                      : colors.text
                }}
              />
            </ListItem>
          </Paper>
          <Divider sx={{ my: 1.5, borderColor: colors.divider }} />
          {menuGroups.map((group) => (
            <React.Fragment key={group.id}>
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
                <Box
                  sx={{
                    color: colors.secondaryText,
                    transition: 'transform 0.2s',
                    transform: expandedGroups[group.id]
                      ? 'rotate(0deg)'
                      : 'rotate(-90deg)'
                  }}
                >
                  <FaAngleDown size={14} />
                </Box>
              </ListItem>
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
                            backgroundColor: isActive ? colors.activeItem : colors.hover
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
                            pr: 1
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: isActive ? colors.primary : colors.iconColor,
                              minWidth: 36
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
          <Paper
            elevation={0}
            sx={{
              backgroundColor:
                location.pathname === '/Administrador/ayuda'
                  ? colors.activeItem
                  : 'transparent',
              borderRadius: 1.5,
              overflow: 'hidden',
              transition: 'background-color 0.2s ease',
              mb: 0.5,
              mt: 1,
              '&:hover': {
                backgroundColor:
                  location.pathname === '/Administrador/ayuda'
                    ? colors.activeItem
                    : colors.hover
              }
            }}
          >
            <ListItem
              button
              onClick={() => handleItemClick({ path: '/Administrador/ayuda' })}
              disableRipple
              sx={{
                py: 1.2,
                px: 1.5
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === '/Administrador/ayuda'
                      ? colors.primary
                      : colors.iconColor,
                  minWidth: 36
                }}
              >
                <FaQuestionCircle size={16} />
              </ListItemIcon>
              <ListItemText
                primary="Ayuda"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === '/Administrador/ayuda' ? 600 : 400,
                  color:
                    location.pathname === '/Administrador/ayuda'
                      ? colors.primary
                      : colors.text
                }}
              />
            </ListItem>
          </Paper>
        </List>
      </Box>
      {/* Cerrar sesión */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${colors.divider}`,
          backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
          mt: 'auto'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'transparent',
            borderRadius: 1.5,
            overflow: 'hidden',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: isDarkTheme
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(239,68,68,0.05)'
            }
          }}
        >
          <ListItem
            button
            onClick={handleLogout}
            disableRipple
            sx={{ py: 1.2, px: 1.5 }}
          >
            <ListItemIcon
              sx={{
                color: colors.error,
                minWidth: 36
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FaTooth
                style={{
                  fontSize: 22,
                  color: colors.primary,
                  marginRight: 10
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: colors.text,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Panel Administrativo
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              size="medium"
              sx={{
                color: colors.iconColor,
                borderRadius: 1.5,
                padding: 1,
                '&:hover': { color: colors.primary, backgroundColor: colors.hover }
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
            <IconButton
              component={Link}
              to="/Administrador/CalendarioCita"
              sx={{
                color:
                  location.pathname === '/Administrador/CalendarioCita'
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

            <IconButton
              component={Link}
              to="/Administrador/principal"
              sx={{
                color:
                  location.pathname === '/Administrador/principal'
                    ? colors.primary
                    : colors.iconColor,
                '&:hover': { color: colors.primary, backgroundColor: colors.hover }
              }}
            >
              <FaHome size={18} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Render diferente para móvil y escritorio */}
      {renderMobileDrawer()}
      {renderDesktopDrawer()}
      {renderExpandButton()}

      <Notificaciones
        open={openNotification}
        message={notificationMessage}
        type="info"
        handleClose={() => setOpenNotification(false)}
      />
    </>
  );
};

export default BarraAdmin;