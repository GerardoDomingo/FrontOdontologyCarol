import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  IconButton,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
  Fade,
  Paper,
  Skeleton,
  Alert,
  CircularProgress,
  Grow,
  Tooltip
} from '@mui/material';
import { ChevronLeft, ChevronRight, ArrowForward, Sync } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import { SectionDivider } from './Home';
// Implementación sin librerías externas

// Componente para error mejorado
const ErrorMessage = ({ message, onRetry, isDarkTheme }) => (
  <Alert
    severity="error"
    variant="outlined"
    sx={{
      my: 4,
      p: { xs: 2, md: 3 },
      borderRadius: '12px',
      backgroundColor: isDarkTheme ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 0.8)'
    }}
    action={
      <Button
        color="error"
        size="small"
        onClick={onRetry}
        variant="outlined"
        startIcon={<Sync />}
        sx={{ 
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          whiteSpace: 'nowrap' 
        }}
      >
        Reintentar
      </Button>
    }
  >
    <Typography variant="h6" component="div" sx={{ 
      mb: 1, 
      fontWeight: 600,
      fontSize: { xs: '1rem', md: '1.25rem' } 
    }}>
      No pudimos cargar los servicios
    </Typography>
    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
      {message || 'Ocurrió un error. Por favor intenta nuevamente.'}
    </Typography>
  </Alert>
);

// Componente para skeleton de servicios durante carga optimizado
const ServicesSkeleton = ({ isDarkTheme, count = 3 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card
            sx={{
              borderRadius: '16px',
              height: { xs: '220px', sm: '250px', md: '280px' },
              backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                height: '5px',
                width: '100%',
                background: 'linear-gradient(90deg, #e0e0e0, #f5f5f5, #e0e0e0)',
                backgroundSize: '200% 100%',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="circular" width={36} height={36} />
              </Box>

              <Skeleton variant="rounded" width="70%" height={24} sx={{ mb: 2.5 }} />
              <Skeleton variant="rounded" width="100%" height={isMobile ? 40 : 60} sx={{ mb: 4 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Skeleton variant="rounded" width={100} height={36} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Componente para tarjeta de servicio optimizada
const ServiceCard = ({
  service,
  offset,
  serviceNumber,
  navigate,
  colors,
  setIsPaused,
  isDarkTheme
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Grow
      in={true}
      timeout={800 + (offset * 150)}
      style={{ transformOrigin: '50% 100%' }}
    >
      <Card
        onClick={() => navigate(`/servicios/detalle/${service.id}`)}
        sx={{
          borderRadius: { xs: '12px', md: '16px' },
          overflow: 'hidden',
          backgroundColor: colors.cardBg,
          transition: 'all 0.4s ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          height: '100%',
          minHeight: { xs: '220px', sm: '250px', md: '280px' },
          transform: offset === 0 ? 'scale(1.02)' : 'scale(1)',
          opacity: offset === 0 ? 1 : 0.88,
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: colors.shadow,
            opacity: 1,
            borderColor: colors.primary
          },
          '&:active': {
            transform: 'translateY(-3px) scale(0.98)',
            transition: 'all 0.2s ease',
          }
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Barra superior decorativa */}
        <Box
          sx={{
            height: { xs: 4, md: 5 },
            width: '100%',
            background: colors.accentGradient
          }}
        />

        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Chip
              label="Destacado"
              size="small"
              sx={{
                backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                color: colors.primary,
                fontWeight: 600,
                fontSize: { xs: '0.65rem', md: '0.7rem' },
                py: 0.5,
                borderRadius: '6px'
              }}
            />

            <Box
              sx={{
                width: { xs: 30, md: 36 },
                height: { xs: 30, md: 36 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                color: colors.primary,
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600
              }}
            >
              {serviceNumber}
            </Box>
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: colors.text,
              mb: { xs: 1.5, md: 2.5 },
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              lineHeight: 1.3
            }}
          >
            {service.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: colors.subtext,
              mb: { xs: 3, md: 4 },
              lineHeight: 1.7,
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              height: { xs: '2.8em', md: '3.4em' },
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {service.description.split('.')[0] + '.'}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 'auto'
            }}
          >
            <Button
              endIcon={<ArrowForward />}
              sx={{
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                background: colors.accentGradient,
                px: { xs: 2, md: 2.5 },
                py: 1,
                borderRadius: '8px',
                fontSize: { xs: '0.85rem', md: '0.9rem' },
                '&:hover': {
                  background: colors.accentGradient,
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                },
                '&:active': {
                  transform: 'translateX(0px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Ver detalles
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

// Visualización de servicios para móvil (versión simplificada sin swipeable-views)
const MobileServiceSlider = ({
  services,
  currentServiceIndex,
  setCurrentServiceIndex,
  navigate,
  colors,
  setIsPaused,
  isDarkTheme
}) => {
  // Funciones para navegar entre servicios
  const nextSlide = () => {
    setCurrentServiceIndex((prev) => 
      prev === services.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentServiceIndex((prev) => 
      prev === 0 ? services.length - 1 : prev - 1
    );
  };

  return (
    <Box sx={{ width: '100%', position: 'relative', mb: 4 }}>
      {/* Contenedor principal */}
      <Box sx={{ 
        position: 'relative',
        width: '100%', 
        display: 'flex',
        justifyContent: 'center',
        px: 2
      }}>
        {/* Servicio actual */}
        <Box sx={{ width: '100%', maxWidth: '320px' }}>
          <ServiceCard
            service={services[currentServiceIndex]}
            offset={0}
            serviceNumber={currentServiceIndex + 1}
            navigate={navigate}
            colors={colors}
            setIsPaused={setIsPaused}
            isDarkTheme={isDarkTheme}
          />
        </Box>

        {/* Botones de navegación */}
        <Box sx={{ 
          position: 'absolute', 
          left: 0, 
          right: 0, 
          top: '50%', 
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'space-between',
          px: 1,
          zIndex: 10
        }}>
          <IconButton
            onClick={prevSlide}
            sx={{ 
              backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              color: colors.primary,
              width: 36, 
              height: 36
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={nextSlide}
            sx={{ 
              backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              color: colors.primary,
              width: 36, 
              height: 36
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Indicadores */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mt: 3
        }}
      >
        {services.map((_, idx) => (
          <Box
            key={`indicator-${idx}`}
            onClick={() => setCurrentServiceIndex(idx)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: idx === currentServiceIndex
                ? colors.primary
                : isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.3)',
                bgcolor: colors.primary
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

// Componente principal HomeServices optimizado
const HomeServices = ({ colors, setIsPaused }) => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef(null);

  // Estados
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Función para cargar servicios
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsRetrying(false);

    try {
      const response = await fetch('https://back-end-4803.onrender.com/api/servicios/all');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setServices(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setTimeout(() => {
      fetchServices();
    }, 500);
  }, [fetchServices]);

  // Efecto para cargar servicios
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Auto rotación de servicios (solo en desktop)
  useEffect(() => {
    if (isMobile || services.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentServiceIndex(prev => (prev + 1) % services.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, services.length]);

  // Navegación entre servicios
  const prevService = useCallback(() => {
    if (services.length > 1) {
      setCurrentServiceIndex(prev => {
        const newIndex = prev === 0 ? services.length - 1 : prev - 1;
        return newIndex;
      });
    }
  }, [services.length]);

  const nextService = useCallback(() => {
    if (services.length > 1) {
      setCurrentServiceIndex(prev => {
        const newIndex = (prev + 1) % services.length;
        return newIndex;
      });
    }
  }, [services.length]);

  // Navegar a la página de servicios
  const handleExploreServices = useCallback(() => {
    navigate('/servicios');
  }, [navigate]);

  return (
    <Container 
      maxWidth="lg" 
      ref={containerRef}
      sx={{ px: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* Sección de Servicios Destacados */}
      <Box sx={{ mb: { xs: 4, sm: 5, md: 8 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            mb: { xs: 3, md: 4 }
          }}
        >
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.text,
                mb: { xs: 1, md: 1.5 },
                fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' }
              }}
            >
              Nuestros Servicios
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: colors.subtext,
                maxWidth: '600px',
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
              }}
            >
              Ofrecemos una amplia gama de tratamientos odontológicos para toda la familia
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 1.5,
            mt: { xs: 1, md: 0 }
          }}>
            <Tooltip title="Ver todos los servicios">
              <Button
                onClick={handleExploreServices}
                variant="outlined"
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  fontWeight: 600,
                  px: { xs: 2, md: 3 },
                  py: 1,
                  borderRadius: '8px',
                  borderWidth: '2px',
                  textTransform: 'none',
                  mr: 2,
                  fontSize: { xs: '0.85rem', md: '0.9rem' }
                }}
              >
                Ver todos
              </Button>
            </Tooltip>

            {/* Botones de navegación - solo para tablet y desktop */}
            {!isMobile && (
              <>
                <IconButton
                  onClick={prevService}
                  disabled={loading || services.length <= 1}
                  size={isMobile ? "small" : "medium"}
                  aria-label="Servicio anterior"
                  sx={{
                    backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'
                    },
                    opacity: (loading || services.length <= 1) ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    '&:active': {
                      transform: 'scale(0.95)'
                    },
                    mx: 0.5,
                    width: { xs: 32, md: 40 },
                    height: { xs: 32, md: 40 },
                    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                >
                  <ChevronLeft sx={{
                    color: (loading || services.length <= 1) ? 'rgba(100, 116, 139, 0.5)' : colors.primary,
                    fontSize: { xs: '1.1rem', md: '1.4rem' }
                  }} />
                </IconButton>

                <IconButton
                  onClick={nextService}
                  disabled={loading || services.length <= 1}
                  size={isMobile ? "small" : "medium"}
                  aria-label="Siguiente servicio"
                  sx={{
                    backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'
                    },
                    opacity: (loading || services.length <= 1) ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    '&:active': {
                      transform: 'scale(0.95)'
                    },
                    mx: 0.5,
                    width: { xs: 32, md: 40 },
                    height: { xs: 32, md: 40 },
                    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                >
                  <ChevronRight sx={{
                    color: (loading || services.length <= 1) ? 'rgba(100, 116, 139, 0.5)' : colors.primary,
                    fontSize: { xs: '1.1rem', md: '1.4rem' }
                  }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Estado de carga con spinner */}
        {isRetrying && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '200px'
          }}>
            <CircularProgress size={40} color="primary" />
            <Typography variant="body2" sx={{ ml: 2, color: colors.text }}>
              Reintentando...
            </Typography>
          </Box>
        )}

        {/* Muestra error si existe */}
        {error && !isRetrying && (
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
            isDarkTheme={isDarkTheme}
          />
        )}

        {/* Muestra skeleton durante la carga */}
        {loading && !isRetrying && (
          <ServicesSkeleton
            isDarkTheme={isDarkTheme}
            count={isMobile ? 1 : isTablet ? 2 : 3}
          />
        )}

        {/* Mostrar servicios */}
        {!loading && !error && services.length > 0 && (
          <>
            {isMobile ? (
              // Versión móvil con swipeable views
              <MobileServiceSlider
                services={services}
                currentServiceIndex={currentServiceIndex}
                setCurrentServiceIndex={setCurrentServiceIndex}
                navigate={navigate}
                colors={colors}
                setIsPaused={setIsPaused}
                isDarkTheme={isDarkTheme}
              />
            ) : (
              // Versión para tablet/desktop
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {(() => {
                  // Determinar cuántos servicios mostrar basado en el tamaño de pantalla
                  const displayCount = isTablet ? 2 : 3;

                  // Crear array para los servicios visibles
                  const visibleServices = [];

                  // Llenar el array con los servicios que deben mostrarse
                  for (let i = 0; i < displayCount && i < services.length; i++) {
                    const index = (currentServiceIndex + i) % services.length;
                    visibleServices.push({
                      service: services[index],
                      index: index,
                      realIndex: index + 1 // Añadimos el índice real (para mostrar al usuario)
                    });
                  }

                  // Renderizar los servicios visibles
                  return visibleServices.map((item, offset) => (
                    <Grid item xs={12} sm={6} md={4} key={`service-${item.index}`}>
                      <ServiceCard
                        service={item.service}
                        offset={offset}
                        serviceNumber={item.realIndex}
                        navigate={navigate}
                        colors={colors}
                        setIsPaused={setIsPaused}
                        isDarkTheme={isDarkTheme}
                      />
                    </Grid>
                  ));
                })()}
              </Grid>
            )}

            {/* Indicador visual para tablet/desktop */}
            {!isMobile && services.length > 3 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  gap: 1
                }}
              >
                {services.map((_, idx) => (
                  <Box
                    key={`indicator-${idx}`}
                    onClick={() => setCurrentServiceIndex(idx)}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: currentServiceIndex <= idx && idx < currentServiceIndex + (isTablet ? 2 : 3)
                        ? colors.primary
                        : isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.3)',
                        bgcolor: colors.primary
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>

      <SectionDivider colors={colors} />
    </Container>
  );
};

export default HomeServices;