import React, { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Skeleton,
  ListItemIcon,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
  Collapse
} from '@mui/material';
import {
  FaSignInAlt,
  FaCalendarAlt,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaQuestionCircle,
  FaClipboardList
} from 'react-icons/fa';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { WbSunnyRounded, NightsStayRounded } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useThemeContext } from '../Tools/ThemeContext';
import InfoBar from './infoBar';

/**
 * Componente de barra de navegación responsiva con tema claro/oscuro
 * Incluye menú desplegable para secciones adicionales y diseño moderno
 * Optimizado con memo para prevenir renderizados innecesarios
 */
const BarraNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkTheme, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  
  // Estados para menús desplegables
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  
  // Manejadores para el menú desplegable
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const toggleMobileSubmenu = () => {
    setMobileSubmenuOpen(!mobileSubmenuOpen);
  };

  const fetchTitleAndLogo = async (retries = 3) => {
    try {
      const response = await axios.get(
        'https://back-end-4803.onrender.com/api/perfilEmpresa/getTitleAndLogo',
        { timeout: 10000 }
      );
      const { nombre_pagina, logo } = response.data;

      if (nombre_pagina) {
        document.title = nombre_pagina;
        setCompanyName(nombre_pagina);
      }

      if (logo) {
        const formattedLogo = logo.startsWith('data:image')
          ? logo
          : `data:image/jpeg;base64,${logo}`;
        setLogo(formattedLogo);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error.message);
      if (retries > 0) {
        setTimeout(() => fetchTitleAndLogo(retries - 1), 2000);
      } else {
        setError('No se pudo cargar la configuración de la empresa.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTitleAndLogo();
  }, []);

  // Función para abrir/cerrar el Drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  //  Drawer con el nuevo submenu móvil
  const drawerList = (
    <Box
      sx={{
        width: '80vw',
        maxWidth: '360px',
        backgroundColor: isDarkTheme ? '#1a2027' : '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') toggleDrawer(false)(e);
      }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        backgroundColor: isDarkTheme ? '#2A3A4A' : '#f8f9fa'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {logo && (
            <img
              src={logo}
              alt="Logo"
              style={{
                marginRight: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: `2px solid ${isDarkTheme ? '#3d5afe' : '#1976d2'}`
              }}
            />
          )}
          <Typography
            variant="h6"
            sx={{
              color: isDarkTheme ? '#fff' : '#1a2027',
              fontWeight: 600,
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '1.1rem'
            }}
          >
            {companyName || 'Odontología Carol'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            component={Link}
            to="/"
            onClick={toggleDrawer(false)}
            sx={{
              color: isDarkTheme ? '#82B1FF' : '#1976d2',
              backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.1)' : 'rgba(25, 118, 210, 0.05)',
              borderRadius: '50%',
              padding: '8px',
              width: '36px',
              height: '36px',
              '&:hover': {
                backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.2)' : 'rgba(25, 118, 210, 0.1)',
              }
            }}
          >
            <HomeIcon sx={{ fontSize: '20px' }} />
          </IconButton>
          
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            color="inherit"
            sx={{
              color: isDarkTheme ? '#FFC107' : '#5E35B1',
              backgroundColor: isDarkTheme ? 'rgba(255, 193, 7, 0.1)' : 'rgba(94, 53, 177, 0.05)',
              borderRadius: '50%',
              padding: '8px',
              width: '36px',
              height: '36px',
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
                <WbSunnyRounded sx={{ fontSize: '20px' }} />
              ) : (
                <NightsStayRounded sx={{ fontSize: '20px' }} />
              )}
            </motion.div>
          </IconButton>

          <IconButton
            onClick={toggleDrawer(false)}
            sx={{
              color: isDarkTheme ? '#fff' : '#1a2027',
              '&:hover': {
                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <List sx={{ flex: 1, pt: 2 }}>
        <ListItem
          button
          component={Link}
          to="/"
          onClick={toggleDrawer(false)}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaHome size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Inicio"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 500
              }
            }}
          />
        </ListItem>

        {/* Menú desplegable en móvil */}
        <ListItem
          button
          onClick={(e) => {
            e.stopPropagation();
            toggleMobileSubmenu();
          }}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaClipboardList size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Explorar"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 500
              }
            }}
          />
          {mobileSubmenuOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </ListItem>

        <Collapse in={mobileSubmenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/servicios"
              onClick={toggleDrawer(false)}
              sx={{
                py: 1.25,
                pl: 5,
                '&:hover': {
                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 36 }}>
                <FaClipboardList size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Servicios"
                primaryTypographyProps={{
                  sx: {
                    color: isDarkTheme ? '#fff' : '#1a2027',
                    fontFamily: '"Montserrat", sans-serif',
                    fontWeight: 400,
                    fontSize: '0.95rem'
                  }
                }}
              />
            </ListItem>
            
            <ListItem
              button
              component={Link}
              to="/FAQ"
              onClick={toggleDrawer(false)}
              sx={{
                py: 1.25,
                pl: 5,
                '&:hover': {
                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 36 }}>
                <FaQuestionCircle size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Preguntas Frecuentes"
                primaryTypographyProps={{
                  sx: {
                    color: isDarkTheme ? '#fff' : '#1a2027',
                    fontFamily: '"Montserrat", sans-serif',
                    fontWeight: 400,
                    fontSize: '0.95rem'
                  }
                }}
              />
            </ListItem>
            
            <ListItem
              button
              component={Link}
              to="/about"
              onClick={toggleDrawer(false)}
              sx={{
                py: 1.25,
                pl: 5,
                '&:hover': {
                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 36 }}>
                <FaInfoCircle size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Acerca de"
                primaryTypographyProps={{
                  sx: {
                    color: isDarkTheme ? '#fff' : '#1a2027',
                    fontFamily: '"Montserrat", sans-serif',
                    fontWeight: 400,
                    fontSize: '0.95rem'
                  }
                }}
              />
            </ListItem>
          </List>
        </Collapse>

        <ListItem
          button
          component={Link}
          to="/Contact"
          onClick={toggleDrawer(false)}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaPhoneAlt size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Contáctanos"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 500
              }
            }}
          />
        </ListItem>

        <Divider sx={{ my: 2, borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

        <ListItem
          button
          component={Link}
          to="/agendar-cita"
          onClick={toggleDrawer(false)}
          sx={{
            py: 1.5,
            backgroundColor: isDarkTheme ? 'rgba(61, 90, 254, 0.1)' : 'rgba(25, 118, 210, 0.08)',
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(61, 90, 254, 0.2)' : 'rgba(25, 118, 210, 0.12)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaCalendarAlt size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Agenda una Cita"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600
              }
            }}
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/login"
          onClick={toggleDrawer(false)}
          sx={{
            py: 1.5,
            mt: 1,
            backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            '&:hover': {
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
            }
          }}
        >
          <ListItemIcon sx={{ color: isDarkTheme ? '#90caf9' : '#1976d2', minWidth: 40 }}>
            <FaSignInAlt size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Iniciar sesión"
            primaryTypographyProps={{
              sx: {
                color: isDarkTheme ? '#fff' : '#1a2027',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 500
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <InfoBar />
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: isDarkTheme ? '#2A3A4A' : '#ffffff',
          boxShadow: isDarkTheme ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
          borderBottom: `1px solid ${isDarkTheme ? '#3A4A5A' : '#e8e8e8'}`,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            minHeight: '64px',
            py: 0.5,
          }}
        >
          {/* Logo and company name with enhanced styling */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: isDarkTheme ? 'white' : '#333',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              padding: '8px',
              borderRadius: '8px',
              '&:hover': {
                color: isDarkTheme ? '#82B1FF' : '#0066cc',
                transform: 'scale(1.03)',
                backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.08)' : 'rgba(0, 102, 204, 0.05)',
              },
            }}
          >
            {logo && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '14px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isDarkTheme ? '#82B1FF' : '#0066cc',
                  overflow: 'hidden',
                  padding: '2px',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, rgba(130, 177, 255, 0.5) 0%, transparent 50%)'
                      : 'linear-gradient(135deg, rgba(0, 102, 204, 0.3) 0%, transparent 50%)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                  },
                  '&:hover::after': {
                    opacity: 1,
                  },
                  boxShadow: isDarkTheme
                    ? '0 10px 20px rgba(130, 177, 255, 0.3), inset 0 0 10px rgba(130, 177, 255, 0.2)'
                    : '0 10px 20px rgba(0, 102, 204, 0.15), inset 0 0 10px rgba(0, 102, 204, 0.1)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: isDarkTheme
                        ? '0 0 0 0 rgba(130, 177, 255, 0.5)'
                        : '0 0 0 0 rgba(0, 102, 204, 0.5)'
                    },
                    '70%': {
                      boxShadow: isDarkTheme
                        ? '0 0 0 8px rgba(130, 177, 255, 0)'
                        : '0 0 0 8px rgba(0, 102, 204, 0)'
                    },
                    '100%': {
                      boxShadow: isDarkTheme
                        ? '0 0 0 0 rgba(130, 177, 255, 0)'
                        : '0 0 0 0 rgba(0, 102, 204, 0)'
                    }
                  }
                }}
              >
                <img
                  src={logo.startsWith('data:image') ? logo : `data:image/png;base64,${logo}`}
                  alt="Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onError={(e) => {
                    console.error("Error al cargar el logo:", e);
                    e.target.src = '';
                  }}
                />
              </Box>
            )}
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Montserrat", "Roboto", sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.25px',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { sm: '1.25rem', md: '1.5rem' },
                  background: isDarkTheme
                    ? 'linear-gradient(90deg, #FFFFFF 0%, #82B1FF 100%)'
                    : 'linear-gradient(90deg, #03427C 0%, #0066cc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginLeft: '4px',
                  position: 'relative',
                  paddingBottom: '2px',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: '2px',
                    background: isDarkTheme
                      ? 'linear-gradient(90deg, #FFFFFF 0%, #82B1FF 100%)'
                      : 'linear-gradient(90deg, #03427C 0%, #0066cc 100%)',
                    transition: 'width 0.4s ease',
                  },
                  '$:hover::after': {
                    width: '100%',
                  }
                }}
              >
                {companyName || 'Odontología'}
              </Typography>
            </Box>
          </Box>
          
          {/* Enlaces de navegación para pantallas grandes */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 3 // Espaciado entre elementos
            }}
          >

            {/* Menú desplegable para Explorar */}
            <Box>
              <Button
                aria-controls="explorar-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                endIcon={menuAnchorEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                sx={{
                  color: isDarkTheme ? 'white' : '#333',
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#0066cc',
                  }
                }}
              >
                Explorar
              </Button>
              <Menu
                id="explorar-menu"
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
                transitionDuration={250}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1,
                    borderRadius: '12px',
                    minWidth: '220px',
                    backgroundColor: isDarkTheme ? '#2A3A4A' : '#ffffff',
                    border: `1px solid ${isDarkTheme ? '#3A4A5A' : '#e8e8e8'}`,
                    paddingY: 1,
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: -5,
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: 10,
                      height: 10,
                      backgroundColor: isDarkTheme ? '#2A3A4A' : '#ffffff',
                      borderLeft: `1px solid ${isDarkTheme ? '#3A4A5A' : '#e8e8e8'}`,
                      borderTop: `1px solid ${isDarkTheme ? '#3A4A5A' : '#e8e8e8'}`,
                      zIndex: 0,
                    }
                  }
                }}
              >
                <MenuItem 
                  component={Link} 
                  to="/servicios" 
                  onClick={handleMenuClose}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.1)' : 'rgba(0, 102, 204, 0.05)',
                    }
                  }}
                >
                  <FaClipboardList size={18} style={{ color: isDarkTheme ? '#82B1FF' : '#0066cc' }} />
                  <Typography
                    sx={{
                      color: isDarkTheme ? 'white' : '#333',
                      fontFamily: '"Montserrat", sans-serif',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    }}
                  >
                    Servicios
                  </Typography>
                </MenuItem>
                
                <MenuItem 
                  component={Link} 
                  to="/FAQ" 
                  onClick={handleMenuClose}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.1)' : 'rgba(0, 102, 204, 0.05)',
                    }
                  }}
                >
                  <FaQuestionCircle size={18} style={{ color: isDarkTheme ? '#82B1FF' : '#0066cc' }} />
                  <Typography
                    sx={{
                      color: isDarkTheme ? 'white' : '#333',
                      fontFamily: '"Montserrat", sans-serif',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    }}
                  >
                    Preguntas Frecuentes
                  </Typography>
                </MenuItem>
                
                <MenuItem 
                  component={Link} 
                  to="/about" 
                  onClick={handleMenuClose}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.1)' : 'rgba(0, 102, 204, 0.05)',
                    }
                  }}
                >
                  <FaInfoCircle size={18} style={{ color: isDarkTheme ? '#82B1FF' : '#0066cc' }} />
                  <Typography
                    sx={{
                      color: isDarkTheme ? 'white' : '#333',
                      fontFamily: '"Montserrat", sans-serif',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    }}
                  >
                    Acerca de
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>

            <Link to="/Contact" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                sx={{
                  color: isDarkTheme ? 'white' : '#333',
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  position: 'relative',
                  padding: '4px 0',
                  '&:hover': {
                    color: '#0066cc',
                  },
                  '&:hover:after': {
                    width: '100%',
                    opacity: 1,
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: '2px',
                    backgroundColor: '#0066cc',
                    transition: 'width 0.3s ease, opacity 0.3s ease',
                    opacity: 0,
                  }
                }}
              >
                Contáctanos
              </Typography>
            </Link>

            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/agendar-cita"
              startIcon={<FaCalendarAlt />}
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: '#03427C',
                backgroundImage: 'linear-gradient(135deg, #03427C 0%, #0066cc 100%)',
                borderRadius: '24px',
                padding: '6px 16px',
                boxShadow: '0 4px 8px rgba(3, 66, 124, 0.25)',
                height: '38px',
                ml: 1,
                '&:hover': {
                  backgroundImage: 'linear-gradient(135deg, #0052a3 0%, #0074e8 100%)',
                  boxShadow: '0 6px 12px rgba(3, 66, 124, 0.35)',
                  transform: 'translateY(-2px)',
                },
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-image 0.3s ease',
                textTransform: 'none',
              }}
            >
              Agenda una Cita
            </Button>

            <Button
              variant="outlined"
              component={Link}
              to="/login"
              startIcon={<FaSignInAlt />}
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: isDarkTheme ? 'white' : '#03427C',
                borderColor: isDarkTheme ? 'rgba(255,255,255,0.5)' : '#03427C',
                borderWidth: '1px',
                borderRadius: '24px',
                padding: '6px 16px',
                height: '38px',
                ml: 1,
                '&:hover': {
                  backgroundColor: isDarkTheme
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(3,66,124,0.05)',
                  borderColor: isDarkTheme ? 'white' : '#0066cc',
                  transform: 'translateY(-2px)',
                },
                transition: 'transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease',
                textTransform: 'none',
              }}
            >
              Iniciar sesión
            </Button>

            {/* Botón de inicio */}
            <Tooltip title="Inicio" arrow placement="bottom">
              <IconButton
                component={Link}
                to="/"
                sx={{
                  color: isDarkTheme ? '#82B1FF' : '#0066cc',
                  backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.1)' : 'rgba(0, 102, 204, 0.05)',
                  borderRadius: '50%',
                  padding: '8px',
                  width: '38px',
                  height: '38px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: isDarkTheme ? 'rgba(130, 177, 255, 0.2)' : 'rgba(0, 102, 204, 0.1)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>

            {/* Botón de Cambio de Tema Mejorado */}
            <Tooltip title={isDarkTheme ? "Modo claro" : "Modo oscuro"} arrow placement="bottom">
              <IconButton
                onClick={toggleTheme}
                color="inherit"
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
          </Box>

          {/* Menú en pantallas pequeñas */}
          <IconButton
            edge="end"
            sx={{
              display: { xs: 'block', md: 'none' },
              color: isDarkTheme ? 'white' : '#03427C',
              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
              borderRadius: '12px',
              padding: '6px',
              '&:hover': {
                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
              },
            }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Drawer para el menú en pantallas pequeñas */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerList}
      </Drawer>
    </>
  );
};

export default memo(BarraNav);