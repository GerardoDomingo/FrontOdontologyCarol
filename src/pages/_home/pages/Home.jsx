import React, { useMemo, useState, useEffect } from 'react';
import { Box, useTheme, IconButton, Fade, CircularProgress } from '@mui/material';
import { Global } from '@emotion/react';
import { KeyboardArrowUp } from '@mui/icons-material';
import axios from 'axios';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Componentes de secciones
import HomeHero from './HomeHero';
import HomeServices from './HomeServices';
import HomeTestimonials from './HomeTestimonials';

// Utilidades
import { getThemeColors } from '../constants';

// Componente de scroll to top
const ScrollToTopButton = ({ colors }) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Fade in={isVisible}>
      <IconButton
        onClick={scrollToTop}
        aria-label="Volver arriba"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          backgroundColor: colors.primary,
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            backgroundColor: colors.primary,
            opacity: 0.9,
            transform: 'translateY(-3px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <KeyboardArrowUp />
      </IconButton>
    </Fade>
  );
};

// Componente divisor de secciones
export const SectionDivider = ({ colors }) => (
  <Box
    sx={{
      width: '100%',
      height: '1px',
      background: colors.sectionDivider,
      my: { xs: 6, md: 8 },
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '80px',
        height: '3px',
        background: colors.accentGradient,
        top: '-1px',
        left: '50%',
        transform: 'translateX(-50%)'
      }
    }}
  />
);

const Home = () => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const [isPaused, setIsPaused] = useState(false);
  const [infoData, setInfoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener datos de la API
  useEffect(() => {
    const fetchInfoData = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/perfilEmpresa/infoHeader');
        setInfoData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener información:', err);
        setError('No se pudo cargar la información');
      } finally {
        setLoading(false);
      }
    };

    fetchInfoData();

    // Opcional: refrescar cada cierto tiempo para mantener actualizado el horario
    const intervalId = setInterval(fetchInfoData, 60000); // Cada minuto

    return () => clearInterval(intervalId);
  }, []);

  // Calcular colores basados en el tema actual
  const colors = useMemo(() => getThemeColors(isDarkTheme), [isDarkTheme]);

  return (
    <Box
      sx={{
        background: colors.background,
        pt: { xs: 3, md: 4 },
        pb: { xs: 5, md: 6 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: { xs: '150px', md: '300px' },
          height: { xs: '150px', md: '300px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}10 0%, transparent 70%)`,
          zIndex: 0,
          animation: 'float 8s ease-in-out infinite'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: { xs: '100px', md: '200px' },
          height: { xs: '100px', md: '200px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}08 0%, transparent 70%)`,
          zIndex: 0,
          animation: 'float 12s ease-in-out infinite reverse'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: { xs: '80px', md: '150px' },
          height: { xs: '80px', md: '150px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.primary}05 0%, transparent 70%)`,
          zIndex: 0,
          animation: 'float 15s ease-in-out infinite'
        }}
      />

      {/* Estilos globales para animaciones */}
      <Global
        styles={`
          @keyframes float {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
            100% { transform: translateY(0px) scale(1); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0% { backgroundPosition: '0% 0%'; }
            100% { backgroundPosition: '200% 0%'; }
          }
          
          .animate-fade-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .animate-fade-left {
            animation: fadeInLeft 0.6s ease-out forwards;
          }
          
          .animate-fade-right {
            animation: fadeInRight 0.6s ease-out forwards;
          }
        `}
      />

      {/* Componentes de secciones */}
      <HomeHero colors={colors} isPaused={isPaused} setIsPaused={setIsPaused} />
      <HomeServices colors={colors} setIsPaused={setIsPaused} />
      <HomeTestimonials colors={colors} infoData={infoData} />
    </Box>
  );
};

export default Home;