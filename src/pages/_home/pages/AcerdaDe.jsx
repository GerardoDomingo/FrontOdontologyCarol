import {
  ArrowForward,
  Email,
  LocationOn,
  OpenInNew,
  Phone,
  History,
  Flag,
  Visibility
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link as MuiLink,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
  Fade,
  Zoom
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const AboutPage = () => {
  const { isDarkTheme } = useThemeContext();
  const [info, setInfo] = useState({
    historia: "",
    mision: "",
    vision: ""
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "info"
  });
  
  // Referencias para animaciones de desplazamiento
  const historiaSectionRef = useRef(null);
  const contactoSectionRef = useRef(null);
  const misionSectionRef = useRef(null);
  const visionSectionRef = useRef(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await fetch("https://back-end-4803.onrender.com/api/preguntas/acerca-de");
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        const historia = data.find(item => item.tipo === "Historia")?.descripcion || "No disponible";
        const mision = data.find(item => item.tipo === "Misión")?.descripcion || "No disponible";
        const vision = data.find(item => item.tipo === "Visión")?.descripcion || "No disponible";

        setInfo({ historia, mision, vision });
      } catch (error) {
        showNotification("Error al obtener la información", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const showNotification = (message, type = "info", duration = 3000) => {
    setNotification({ open: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, duration);
  };

  // Gradientes y estilos mejorados
  const backgroundStyle = {
    background: isDarkTheme
      ? 'linear-gradient(135deg, #001F3F 0%, #003366 50%, #001F3F 100%)'
      : 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #E3F2FD 100%)',
    minHeight: '100vh',
    color: isDarkTheme ? '#ffffff' : '#333333',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: '2rem'
  };

  // Efecto de partículas flotantes (optimizado para no afectar el rendimiento)
  const decorationStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    opacity: 0.05,
    backgroundImage: `url(${process.env.PUBLIC_URL}/assets/svg/pattern.svg)`,
    backgroundSize: '300px',
    pointerEvents: 'none'
  };

  // Tarjetas con nuevo diseño
  const cardStyle = {
    background: isDarkTheme ? 'rgba(30, 40, 60, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    boxShadow: isDarkTheme 
      ? '0 10px 20px rgba(0,0,0,0.3), 0 6px 6px rgba(0,0,0,0.25)' 
      : '0 10px 20px rgba(0,0,0,0.12), 0 6px 6px rgba(0,0,0,0.09)',
    backdropFilter: 'blur(8px)',
    border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: isDarkTheme 
        ? '0 15px 30px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3)' 
        : '0 15px 30px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.1)'
    }
  };

  // Cabeceras de tarjetas con gradientes modernos
  const cardHeaderStyle = {
    background: isDarkTheme
      ? 'linear-gradient(90deg, #0052A3 0%, #007FFF 100%)'
      : 'linear-gradient(90deg, #0052A3 0%, #2196F3 100%)',
    color: 'white',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  padding: '16px',
    position: 'relative',
    overflow: 'hidden'
  };

  // Estilo para íconos flotantes en las tarjetas
  const iconBgStyle = {
    position: 'absolute',
    right: '-20px',
    top: '-20px',
    opacity: 0.1,
                          fontSize: '120px',
    transform: 'rotate(15deg)',
    color: '#fff',
    zIndex: 0
  };

  // Contenido de las tarjetas con mejor espaciado
  const cardContentStyle = {
    padding: '24px',
    position: 'relative',
    zIndex: 1
  };

  // Animaciones con variantes de Framer Motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const streetViewLink = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=21.081734,-98.536002`;

  return (
    <Box sx={backgroundStyle}>
      {/* Fondo decorativo */}
      <Box sx={decorationStyle} />
      
      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        {/* Encabezado con animación mejorada */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2
          }}
        >
          <Typography
            variant={isSmallScreen ? 'h5' : 'h4'}
            align="center"
            gutterBottom
            sx={{
              fontWeight: 800,
              mb: 4,
              background: `linear-gradient(45deg, #0052A3, #2196F3)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.02em',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #0052A3, #2196F3)',
                borderRadius: '2px'
              }
            }}
          >
            Acerca de Nosotros
          </Typography>
        </motion.div>

        {/* Sección de Historia mejorada */}
        <Box ref={historiaSectionRef} sx={{ mb: 4 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <Card sx={{ ...cardStyle }}>
              <Box sx={cardHeaderStyle}>
                <History sx={iconBgStyle} />
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar sx={{ 
                      bgcolor: 'white', 
                      color: '#0052A3',
                      width: 56,
                      height: 56,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                      <History />
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" fontWeight="600">
                      Nuestra Historia
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <CardContent sx={cardContentStyle}>
                <Typography 
                  variant="body1" 
                  sx={{
                    lineHeight: 1.8,
                    fontSize: '1.05rem',
                    textAlign: 'justify',
                    color: isDarkTheme ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)'
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 1.5
                        }}
                      >
                        <Typography>Cargando historia...</Typography>
                      </motion.div>
                    </Box>
                  ) : info.historia}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Sección de Contacto y Servicios mejoradas */}
        <Box ref={contactoSectionRef} sx={{ mb: 4 }}>
          <Grid container spacing={4}>
            {/* Tarjeta de Contacto */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInLeft}
              >
                <Card sx={{ ...cardStyle, height: '100%' }}>
                  <Box sx={cardHeaderStyle}>
                    <Phone sx={iconBgStyle} />
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item>
                        <Avatar sx={{ 
                          bgcolor: 'white', 
                          color: '#0052A3',
                          width: 56,
                          height: 56,
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          <Phone />
                        </Avatar>
                      </Grid>
                      <Grid item>
                        <Typography variant="h5" fontWeight="700">
                          Contacto
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  <CardContent sx={cardContentStyle}>
                    <motion.div variants={staggerChildren}>
                                                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Dr. Hugo Gómez Ramírez
                      </Typography>
                      
                      <motion.div variants={fadeInUp}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 1.5,
                          borderRadius: '8px',
                          background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'translateX(5px)'
                          }
                        }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: 'rgba(244, 67, 54, 0.1)', 
                            color: '#FF5252'
                          }}>
                            <Phone />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Teléfono
                            </Typography>
                            <MuiLink 
                              href="tel:7713339456" 
                              sx={{ 
                                color: isDarkTheme ? '#90CAF9' : '#0052A3',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              771 333 9456
                            </MuiLink>
                          </Box>
                        </Box>
                      </motion.div>
                    
                      <motion.div variants={fadeInUp}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 3,
                          p: 2,
                          borderRadius: '8px',
                          background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'translateX(5px)'
                          }
                        }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: 'rgba(76, 175, 80, 0.1)', 
                            color: '#4CAF50' 
                          }}>
                            <Email />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Correo electrónico
                            </Typography>
                            <MuiLink 
                              href="mailto:e_gr@hotmail.com" 
                              sx={{ 
                                color: isDarkTheme ? '#90CAF9' : '#0052A3',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              e_gr@hotmail.com
                            </MuiLink>
                          </Box>
                        </Box>
                      </motion.div>
                      
                      <motion.div variants={fadeInUp}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          mb: 3,
                          p: 2,
                          borderRadius: '8px',
                          background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'translateX(5px)'
                          }
                        }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: 'rgba(255, 193, 7, 0.1)', 
                            color: '#FFC107' 
                          }}>
                            <LocationOn />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Dirección
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Ixcatlán, Huejutla de Reyes, Hidalgo, México
                              <br />CP: 43002
                            </Typography>
                          
                            <Button
                              variant="contained"
                              href={streetViewLink}
                              target="_blank"
                              startIcon={<OpenInNew />}
                              size="small"
                              sx={{
                                mt: 1,
                                background: 'linear-gradient(45deg, #0052A3, #2196F3)',
                                color: 'white',
                                borderRadius: '20px',
                                boxShadow: '0 4px 6px rgba(0,82,163,0.25)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #003d7a, #0d8aed)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 10px rgba(0,82,163,0.35)'
                                }
                              }}
                            >
                              Ver en Google Maps
                            </Button>
                          </Box>
                        </Box>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Explorar Servicios */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInRight}
              >
                <Card 
                  sx={{ 
                    ...cardStyle, 
                    height: '100%',
                    background: isDarkTheme 
                      ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))' 
                      : 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3
                  }}
                >
                  <CardContent sx={{ width: '100%' }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          color: isDarkTheme ? '#fff' : '#0052A3',
                          mb: 4,
                          fontWeight: 'bold',
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.2rem' },
                          textShadow: isDarkTheme ? '0 2px 10px rgba(33,150,243,0.3)' : 'none',
                        }}
                      >
                        ¿Quieres conocer nuestros servicios?
                      </Typography>
                    </motion.div>

                    {/* SVG animado */}
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 2, 0, -2, 0],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 5,
                        ease: "easeInOut" 
                      }}
                      style={{ marginBottom: 40 }}
                    >
                      <img
                        src={`${process.env.PUBLIC_URL}/assets/svg/acerca.svg`}
                        alt="Decoración"
                        style={{
                          width: isMediumScreen ? '120px' : '140px',
                          filter: isDarkTheme ? 'drop-shadow(0 0 10px rgba(33, 150, 243, 0.5))' : 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1))'
                        }}
                      />
                    </motion.div>

                    {/* Botón animado */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        component={Link}
                        to="/servicios"
                        variant="contained"
                        size="large"
                        endIcon={
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <ArrowForward />
                          </motion.div>
                        }
                        sx={{
                          background: 'linear-gradient(45deg, #0052A3, #2196F3)',
                          color: 'white',
                          padding: '12px 30px',
                          borderRadius: '30px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)',
                          border: '2px solid transparent',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            transition: 'left 0.7s ease',
                          },
                          '&:hover': {
                            background: 'linear-gradient(45deg, #003d7a, #0d8aed)',
                            boxShadow: '0 10px 25px rgba(33, 150, 243, 0.4)',
                            transform: 'translateY(-3px)',
                            '&::before': {
                              left: '100%'
                            }
                          }
                        }}
                      >
                        Explorar Servicios
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>

        {/* Sección de Misión y Visión */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              ref={misionSectionRef}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInLeft}
            >
              <Card sx={{ ...cardStyle, height: '100%' }}>
                <Box sx={cardHeaderStyle}>
                  <Flag sx={iconBgStyle} />
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Avatar sx={{ 
                        bgcolor: 'white', 
                        color: '#0052A3',
                        width: 48,
                        height: 48,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }}>
                        <Flag />
                      </Avatar>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" fontWeight="600">
                        Misión
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                <CardContent sx={cardContentStyle}>
                  <Typography 
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      fontSize: '0.95rem',
                      textAlign: 'justify',
                      color: isDarkTheme ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)'
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 1.5
                          }}
                        >
                          <Typography>Cargando misión...</Typography>
                        </motion.div>
                      </Box>
                    ) : info.mision}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              ref={visionSectionRef}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInRight}
            >
              <Card sx={{ ...cardStyle, height: '100%' }}>
                <Box sx={cardHeaderStyle}>
                  <Visibility sx={iconBgStyle} />
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Avatar sx={{ 
                        bgcolor: 'white', 
                        color: '#0052A3',
                        width: 48,
                        height: 48,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }}>
                        <Visibility />
                      </Avatar>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" fontWeight="600">
                        Visión
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                <CardContent sx={cardContentStyle}>
                  <Typography 
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      fontSize: '0.95rem',
                      textAlign: 'justify',
                      color: isDarkTheme ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)'
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 1.5
                          }}
                        >
                          <Typography>Cargando visión...</Typography>
                        </motion.div>
                      </Box>
                    ) : info.vision}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
      
      <Notificaciones
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default AboutPage;