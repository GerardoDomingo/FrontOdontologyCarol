import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  keyframes,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
  LinearProgress
} from '@mui/material';
import { 
  CheckCircleOutline,
  FiberManualRecord
} from '@mui/icons-material';
import { FaTooth } from 'react-icons/fa';

// Animaciones optimizadas para un diseño profesional
const smoothRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const gentlePulse = keyframes`
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(5px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const floatingAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const FullPageLoader = ({ 
  message = "Cargando...", 
  showProgress = true,
  loadingSteps = ["Iniciando aplicación", "Cargando datos", "Preparando interfaz", "Completado"],
  autoProgress = true,
  isDarkTheme = false,
  ...props
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Paleta de colores profesional y moderna
  const colors = {
    primary: isDarkTheme ? '#3B82F6' : '#1976D2',
    secondary: isDarkTheme ? '#60A5FA' : '#42A5F5',
    accent: isDarkTheme ? '#93C5FD' : '#2196F3',
    
    background: isDarkTheme ? '#0F172A' : '#FAFBFC',
    surface: isDarkTheme ? '#1E293B' : '#FFFFFF',
    
    text: isDarkTheme ? '#F1F5F9' : '#1E293B',
    textSecondary: isDarkTheme ? '#94A3B8' : '#64748B',
    textMuted: isDarkTheme ? '#64748B' : '#94A3B8',
    
    success: '#10B981',
    border: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(25, 118, 210, 0.08)',
    shadow: isDarkTheme 
      ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
      : '0 10px 25px rgba(0, 0, 0, 0.08)'
  };

  // Lógica de progreso automático mejorada con transiciones más fluidas
  useEffect(() => {
    if (!autoProgress) return;

    const totalDuration = 2000; // 2 segundos total
    const totalSteps = loadingSteps.length;
    let progressValue = 0;
    let stepIndex = 0;

    // Progreso continuo
    const progressTimer = setInterval(() => {
      progressValue += 2; // Incremento de 2% cada 40ms = 100% en 2 segundos
      setProgress(progressValue);

      // Cambiar paso basado en el progreso
      const newStepIndex = Math.floor((progressValue / 100) * totalSteps);
      if (newStepIndex !== stepIndex && newStepIndex < totalSteps) {
        stepIndex = newStepIndex;
        setCurrentStep(stepIndex);
      }

      // Completar al 100%
      if (progressValue >= 100) {
        setProgress(100);
        setCurrentStep(totalSteps - 1);
        setIsComplete(true);
        clearInterval(progressTimer);
      }
    }, 40); // 40ms = progreso muy fluido

    return () => {
      clearInterval(progressTimer);
    };
  }, [autoProgress, loadingSteps.length]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: colors.background,
        zIndex: 1500,
        overflow: 'hidden'
      }}
    >
      {/* Contenedor principal sin recuadro */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: isMobile ? '90%' : '400px',
          width: '100%',
          px: 2
        }}
      >
        {/* Icono principal mejorado */}
        <Box
          sx={{
            position: 'relative',
            width: isMobile ? '120px' : '140px',
            height: isMobile ? '120px' : '140px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 4,
            animation: `${floatingAnimation} 2s ease-in-out infinite`
          }}
        >
          {/* Anillo de progreso exterior */}
          <CircularProgress
            variant="determinate"
            value={progress}
            size={isMobile ? 120 : 140}
            thickness={3}
            sx={{
              position: 'absolute',
              color: colors.primary,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          
          {/* Anillo de fondo */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={isMobile ? 120 : 140}
            thickness={3}
            sx={{
              position: 'absolute',
              color: alpha(colors.primary, 0.08),
              transform: 'rotate(0deg) !important'
            }}
          />
          
          {/* Contenedor del icono */}
          <Box
            sx={{
              width: isMobile ? '70px' : '80px',
              height: isMobile ? '70px' : '80px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: '50%',
              boxShadow: colors.shadow,
              border: `3px solid ${alpha(colors.primary, 0.1)}`,
              zIndex: 2,
              animation: isComplete ? 'none' : `${gentlePulse} 1.8s infinite ease-in-out`
            }}
          >
            {isComplete ? (
              <CheckCircleOutline 
                sx={{ 
                  fontSize: isMobile ? 32 : 36, 
                  color: colors.success
                }} 
              />
            ) : (
              <FaTooth 
                size={isMobile ? 28 : 32} 
                style={{ color: colors.primary }}
              />
            )}
          </Box>
        </Box>
        
        {/* Mensaje principal */}
        <Typography
          variant="h5"
          sx={{
            color: colors.text,
            fontWeight: 600,
            textAlign: 'center',
            mb: 2,
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            letterSpacing: '-0.02em',
            transition: 'all 0.2s ease'
          }}
        >
          {loadingSteps[currentStep] || message}
        </Typography>

        {/* Porcentaje de progreso */}
        {showProgress && (
          <Typography
            variant="h6"
            sx={{
              color: colors.primary,
              fontWeight: 700,
              mb: 4,
              fontSize: isMobile ? '1rem' : '1.1rem'
            }}
          >
            {Math.round(progress)}%
          </Typography>
        )}
        
        {/* Barra de progreso moderna */}
        {showProgress && (
          <Box
            sx={{
              width: '100%',
              maxWidth: '280px',
              mb: 5
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: '6px',
                borderRadius: '3px',
                backgroundColor: alpha(colors.primary, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: colors.primary,
                  borderRadius: '3px',
                  transition: 'transform 0.1s ease'
                }
              }}
            />
          </Box>
        )}
        
        {/* Indicadores de pasos minimalistas */}
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            width: '100%',
            mb: 4
          }}
        >
          {loadingSteps.map((_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                animation: index <= currentStep ? `${fadeIn} 0.2s ease-out` : 'none'
              }}
            >
              <FiberManualRecord
                sx={{
                  fontSize: index === currentStep ? '12px' : '8px',
                  color: index <= currentStep 
                    ? (index === currentStep ? colors.primary : colors.success)
                    : alpha(colors.textMuted, 0.3),
                  transition: 'all 0.2s ease',
                  filter: index === currentStep ? 'drop-shadow(0 0 4px currentColor)' : 'none'
                }}
              />
              {index < loadingSteps.length - 1 && (
                <Box
                  sx={{
                    width: isMobile ? '20px' : '24px',
                    height: '2px',
                    backgroundColor: index < currentStep 
                      ? colors.success 
                      : alpha(colors.textMuted, 0.2),
                    ml: 1.5,
                    transition: 'all 0.2s ease',
                    borderRadius: '1px'
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Texto informativo minimalista */}
        <Typography
          variant="body2"
          sx={{
            color: colors.textMuted,
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 400,
            opacity: 0.7
          }}
        >
          Clínica Dental Carol
        </Typography>
      </Box>
    </Box>
  );
};

export default FullPageLoader;