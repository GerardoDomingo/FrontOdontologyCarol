import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Divider,
    Badge, Avatar, ListItemIcon, ListItemText, useTheme, useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaUserCircle, FaCalendarAlt, FaSignOutAlt, FaHome, FaCog, FaBell,
    FaTooth, FaFileAlt, FaUsers, FaClipboardList, FaFileMedical, FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../../components/Tools/AuthContext';

const BarraEmpleados = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [notificationCount, setNotificationCount] = useState(2);
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);
        matchDarkTheme.addEventListener('change', e => setIsDarkTheme(e.matches));

        return () => matchDarkTheme.removeEventListener('change', e => setIsDarkTheme(e.matches));
    }, []);

    const menuItems = [
        { icon: FaHome, text: 'Inicio', path: '/Empleado/principal' },
        { icon: FaUserCircle, text: 'Mi Perfil', path: '/Empleado/perfil' },
        { icon: FaCalendarAlt, text: 'Citas', path: '/Empleado/citas' },
        { icon: FaUsers, text: 'Pacientes', path: '/Empleado/gestionPacient' },
        { icon: FaClipboardList, text: 'Historial', path: '/Empleado/historial' },
        { icon: FaFileMedical, text: 'Reportes', path: '/Empleado/reportes' },
        { icon: FaChartLine, text: 'Estadísticas', path: '/Empleado/estadisticas' },
        { icon: FaBell, text: 'Notificaciones', path: '/Empleado/notificaciones' },
        { icon: FaCog, text: 'Configuración', path: '/Empleado/configuracion' },
        { icon: FaSignOutAlt, text: 'Cerrar Sesión', path: null }
    ];

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleItemClick = (item) => {
        if (item.text === 'Cerrar Sesión') {
            handleLogout();
        } else if (item.path) {
            navigate(item.path);
        }
        handleMenuClose();
    };

    const handleLogout = async () => {
        try {
            await fetch('https://back-end-4803.onrender.com/api/users/logout', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            setUser(null);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                backgroundColor: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
                color: isDarkTheme ? '#fff' : '#03427c',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FaTooth size={32} color="#03427c" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: isDarkTheme ? '#fff' : '#03427c' }}>
                        Odontología Carol
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton size="large" color="inherit">
                        <Badge badgeContent={notificationCount} color="error">
                            <FaBell />
                        </Badge>
                    </IconButton>

                    <IconButton edge="end" onClick={handleMenuOpen}>
                        <Avatar sx={{ bgcolor: '#03427c', width: 40, height: 40 }}>
                            <FaUserCircle />
                        </Avatar>
                    </IconButton>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            backgroundColor: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
                            color: isDarkTheme ? '#fff' : '#03427c',
                            width: isMobile ? '100%' : '220px',
                            borderRadius: 2,
                            mt: 1
                        }
                    }}
                >
                    {menuItems.map((item, index) => (
                        <MenuItem key={index} onClick={() => handleItemClick(item)}>
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                                <item.icon size={20} />
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </MenuItem>
                    ))}
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default BarraEmpleados;
