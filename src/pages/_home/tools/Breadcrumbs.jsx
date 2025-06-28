import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Breadcrumbs as MuiBreadcrumbs, 
  Typography, 
  Box, 
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Home, 
  ChevronRight, 
  Dashboard, 
  MedicalServices, 
  Person 
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

// Animación sutil
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Breadcrumbs = ({ paths }) => {
  const theme = useTheme();
  const { isDarkTheme } = useThemeContext();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determinar la sección actual basada en la URL
  const [section, setSection] = useState('public');
  const [homeUrl, setHomeUrl] = useState('/');
  const [homeIcon, setHomeIcon] = useState(<Home fontSize="small" />);
  
  useEffect(() => {
    // Extraer la primera parte de la ruta para determinar la sección
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const mainSection = pathSegments[0]?.toLowerCase() || '';
    
    if (mainSection === 'administrador') {
      setSection('admin');
      setHomeUrl('/Administrador/principal');
      setHomeIcon(<Dashboard fontSize="small" />);
    } else if (mainSection === 'empleado') {
      setSection('empleado');
      setHomeUrl('/Empleado/principal');
      setHomeIcon(<MedicalServices fontSize="small" />);
    } else if (mainSection === 'paciente') {
      setSection('paciente');
      setHomeUrl('/Paciente/principal');
      setHomeIcon(<Person fontSize="small" />);
    } else {
      setSection('public');
      setHomeUrl('/');
      setHomeIcon(<Home fontSize="small" />);
    }
  }, [location]);
  
  // Colores más sutiles
  const colors = {
    text: isDarkTheme ? '#E0E0E0' : '#333333',
    textSecondary: isDarkTheme ? '#90CAF9' : '#1565C0',
    textActive: isDarkTheme ? '#FFFFFF' : '#FFFFFF',
    background: isDarkTheme ? 'rgba(40, 40, 40, 0.4)' : 'rgba(240, 240, 240, 0.6)',
    hover: isDarkTheme ? 'rgba(60, 60, 60, 0.6)' : 'rgba(220, 220, 220, 0.8)',
    active: isDarkTheme ? '#1976d2' : '#0277BD',
    separator: isDarkTheme ? 'rgba(200, 200, 200, 0.5)' : 'rgba(100, 100, 100, 0.4)',
    containerBg: isDarkTheme ? 'rgba(30, 30, 30, 0.3)' : 'rgba(250, 250, 250, 0.5)',
    border: isDarkTheme ? '1px solid rgba(70, 70, 70, 0.1)' : '1px solid rgba(220, 220, 220, 0.5)',
    shadow: isDarkTheme ? '0 1px 2px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
  };

  // Estilos más compactos y sutiles
  const linkItemStyle = {
    display: 'flex',
    alignItems: 'center',
    color: colors.text,
    p: '2px 6px',
    mx: 0.3,
    borderRadius: '4px',
    backgroundColor: 'transparent',
    transition: 'all 0.15s ease',
    fontSize: '0.75rem',
    fontWeight: 400,
    '&:hover': {
      backgroundColor: colors.hover,
    }
  };

  const activeItemStyle = {
    color: colors.textActive,
    fontWeight: 500,
    p: '2px 6px',
    mx: 0.3,
    borderRadius: '4px',
    background: colors.active,
    fontSize: '0.75rem'
  };

  return (
    <Box
      sx={{
        padding: { xs: '4px 8px', sm: '6px 10px' },
        borderRadius: '6px',
        background: colors.containerBg,
        boxShadow: colors.shadow,
        animation: `${fadeIn} 0.3s ease-out`,
        m: 1,
        border: colors.border,
        maxWidth: 'fit-content'
      }}
    >
      <MuiBreadcrumbs
        separator={
          <ChevronRight
            sx={{
              color: colors.separator,
              fontSize: '0.8rem',
              mx: 0.1
            }}
          />
        }
        aria-label="navegación de migas de pan"
        sx={{
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center',
          },
        }}
      >
        {/* Link de inicio contextual */}
        <Link to={homeUrl} style={{ textDecoration: 'none' }}>
          <Box sx={linkItemStyle}>
            {React.cloneElement(homeIcon, { style: { fontSize: '0.9rem' } })}
            {!isMobile && (
              <Typography 
                sx={{ 
                  ml: 0.5, 
                  fontSize: '0.75rem', 
                  fontWeight: 500
                }}
              >
                Inicio
              </Typography>
            )}
          </Box>
        </Link>

        {/* Renderizar resto de paths */}
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          
          // Omitir si el path es "Inicio" o si el path.path es idéntico a homeUrl
          if (path.name === "Inicio" || path.path === homeUrl) return null;

          return (
            <Box key={path.path || `path-${index}`}>
              {isLast ? (
                <Box sx={activeItemStyle}>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  >
                    {path.name}
                  </Typography>
                </Box>
              ) : (
                <Link to={path.path} style={{ textDecoration: 'none' }}>
                  <Box sx={linkItemStyle}>
                    <Typography 
                      sx={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 400
                      }}
                    >
                      {path.name}
                    </Typography>
                  </Box>
                </Link>
              )}
            </Box>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;