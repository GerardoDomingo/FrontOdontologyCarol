import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Paper,
  Fade,
  useMediaQuery,
  useTheme,
  Avatar,
  Rating,
  IconButton,
  Skeleton,
  Alert
} from '@mui/material';
import { Star, ChevronLeft, ChevronRight } from '@mui/icons-material';

// Hooks y utilidades
import { useIntersectionObserver } from '../constants';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import ContactButtons from './Steps/ContactButtons';

// Componente para skeleton loading
const TestimonialSkeleton = ({ colors }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 3, md: 4 },
      height: '280px',
      borderRadius: { xs: '12px', md: '16px' },
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
    }}
  >
    <Skeleton variant="rectangular" width="60%" height={24} sx={{ mb: 2 }} />
    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
      <Skeleton variant="circular" width={42} height={42} sx={{ mr: 2 }} />
      <Skeleton variant="text" width="40%" height={20} />
    </Box>
  </Paper>
);

// Componente para testimonios optimizado
const TestimonialCard = ({ testimonial, index, isVisible, colors }) => {
  const theme = useTheme();
  
  // Generar iniciales para el avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Fade
      in={isVisible}
      timeout={800}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          height: '100%',
          borderRadius: { xs: '12px', md: '16px' },
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            backgroundColor: colors.cardHover,
            transform: 'translateY(-5px)',
            boxShadow: colors.shadow
          },
          opacity: 0,
          animation: isVisible ?
            index % 2 === 0 ? 'fadeInLeft 0.6s forwards' : 'fadeInRight 0.6s forwards'
            : 'none',
          animationDelay: `${index * 0.2}s`,
          '&:focus-within': {
            outline: `2px solid ${colors.primary}`,
            outlineOffset: '2px'
          }
        }}
        tabIndex={0}
      >
        <Rating
          value={testimonial.rating}
          readOnly
          icon={<Star sx={{ color: '#FFD700', fontSize: { xs: '1rem', md: '1.2rem' } }} />}
          emptyIcon={<Star sx={{ 
            color: colors.border, 
            fontSize: { xs: '1rem', md: '1.2rem' } 
          }} />}
          precision={0.5}
          sx={{ mb: 2 }}
        />

        <Typography
          variant="body1"
          sx={{
            color: colors.text,
            mb: 3,
            lineHeight: 1.7,
            fontStyle: 'italic',
            fontSize: { xs: '0.9rem', md: '1rem' },
            flex: 1,
            position: 'relative',
            '&::before': {
              content: '"""',
              fontSize: '3rem',
              color: colors.border,
              position: 'absolute',
              top: -20,
              left: -10,
              opacity: 0.3,
              zIndex: 0
            }
          }}
        >
          "{testimonial.testimonial}"
        </Typography>

        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 'auto'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: `${colors.primary}30`,
                color: colors.primary,
                width: { xs: 36, md: 42 },
                height: { xs: 36, md: 42 },
                mr: 2,
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600
              }}
            >
              {getInitials(testimonial.name)}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: colors.primary,
                  fontSize: { xs: '0.85rem', md: '0.95rem' }
                }}
              >
                {testimonial.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.subtext,
                  fontSize: { xs: '0.7rem', md: '0.75rem' }
                }}
              >
                {formatDate(testimonial.date)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

// Componente para móvil simplificado
const MobileTestimonialSlider = ({ testimonials, testimonialVisible, colors, isDarkTheme }) => {
  const [index, setIndex] = React.useState(0);

  const nextTestimonial = () => {
    setIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1));
  };

  const prevTestimonial = () => {
    setIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  };

  if (testimonials.length === 0) return null;

  return (
    <Box sx={{ width: '100%', mb: 3, position: 'relative' }}>
      <Box sx={{ padding: '8px', minHeight: '280px' }}>
        <TestimonialCard
          testimonial={testimonials[index]}
          index={index}
          isVisible={testimonialVisible}
          colors={colors}
        />
      </Box>

      {testimonials.length > 1 && (
        <>
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
              onClick={prevTestimonial}
              sx={{ 
                backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                color: colors.primary,
                width: 36, 
                height: 36
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
            <IconButton
              onClick={nextTestimonial}
              sx={{ 
                backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                color: colors.primary,
                width: 36, 
                height: 36
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
              gap: 1
            }}
          >
            {testimonials.map((_, idx) => (
              <Box
                key={`indicator-${idx}`}
                onClick={() => setIndex(idx)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: idx === index
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
        </>
      )}
    </Box>
  );
};

// Componente principal HomeTestimonials
const HomeTestimonials = ({ colors }) => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [testimonialRef, testimonialVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();
  
  // Estados para manejar datos del backend
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar testimonios desde el backend
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://back-end-4803.onrender.com/api/resenya/get');
      
      if (!response.ok) {
        throw new Error('Error al cargar testimoniales');
      }
      
      const data = await response.json();
      
      // Filtrar solo reseñas habilitadas y mapear a formato requerido
      const activeTestimonials = data
        .filter(item => item.estado === 'Habilitado')
        .map(item => ({
          id: item.reseñaId,
          name: `${item.nombre} ${item.aPaterno || ''} ${item.aMaterno || ''}`.trim(),
          rating: item.calificacion,
          testimonial: item.comentario,
          date: item.fecha_creacion
        }))
        .slice(0, 6); // Mostrar máximo 6 testimonios
      
      setTestimonials(activeTestimonials);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los testimonios');
      console.error('Error al cargar testimoniales:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar testimonios al montar el componente
  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    <Container 
      maxWidth="lg"
      sx={{ px: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* Sección de Testimonios */}
      <Box
        ref={testimonialRef}
        sx={{ mb: { xs: 4, sm: 5, md: 8 } }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            mb: { xs: 1.5, md: 2 },
            color: colors.text,
            fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' }
          }}
        >
          Lo que dicen nuestros pacientes
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            color: colors.subtext,
            maxWidth: '800px',
            mx: 'auto',
            mb: { xs: 3, sm: 4, md: 5 },
            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
            lineHeight: 1.7,
            px: { xs: 1, sm: 2, md: 0 }
          }}
        >
          La satisfacción de nuestros pacientes es nuestra mejor carta de presentación
        </Typography>

        {/* Contenido de testimonios */}
        {loading ? (
          // Estado de carga
          isMobile ? (
            <TestimonialSkeleton colors={colors} />
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {[1, 2, 3].map((index) => (
                <Grid item xs={12} md={4} key={index}>
                  <TestimonialSkeleton colors={colors} />
                </Grid>
              ))}
            </Grid>
          )
        ) : error ? (
          // Estado de error
          <Alert 
            severity="info" 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              backgroundColor: colors.cardBg,
              color: colors.text
            }}
          >
            {error}
          </Alert>
        ) : testimonials.length === 0 ? (
          // Sin testimonios
          <Alert 
            severity="info" 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              backgroundColor: colors.cardBg,
              color: colors.text
            }}
          >
            Aún no hay testimonios disponibles.
          </Alert>
        ) : (
          // Mostrar testimonios
          isMobile ? (
            <MobileTestimonialSlider
              testimonials={testimonials}
              testimonialVisible={testimonialVisible}
              colors={colors}
              isDarkTheme={isDarkTheme}
            />
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={testimonial.id}>
                  <TestimonialCard
                    testimonial={testimonial}
                    index={index}
                    isVisible={testimonialVisible}
                    colors={colors}
                  />
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Box>

      {/* CTA Final */}
      <Box
        ref={ctaRef}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: { xs: '16px', md: '20px' },
          background: colors.accentGradient,
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.2)',
          opacity: 0,
          transform: 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
          ...(ctaVisible && {
            opacity: 1,
            transform: 'translateY(0)'
          })
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: { xs: 2, md: 3 },
            fontSize: { xs: '1.5rem', sm: '1.7rem', md: '2.2rem' }
          }}
        >
          ¿Necesitas atención dental?
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: { xs: 3, md: 4 },
            maxWidth: '800px',
            mx: 'auto',
            opacity: 0.9,
            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
            lineHeight: 1.7,
            px: { xs: 1, sm: 2, md: 0 }
          }}
        >
          Estamos comprometidos con la salud bucal de nuestra comunidad. Ofrecemos tratamientos dentales de calidad con un trato cercano y precios accesibles. ¡Tu sonrisa es nuestra prioridad!
        </Typography>

        <ContactButtons
          colors={colors}
          isDarkTheme={isDarkTheme}
          isCTA={true}
          showLabels={true}
        />
      </Box>
    </Container>
  );
};

export default HomeTestimonials;