import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Divider,
  alpha,
  Tooltip,
  List,
  ListItem
} from '@mui/material';
import { 
  AccessTime, 
  WbSunny, 
  NightsStay, 
  Info, 
  CalendarToday, 
  EventAvailable,
  CheckCircleOutline
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

// Función para procesar horarios
const procesarHorarios = (horariosData) => {
  return horariosData.map((item) => {
    // Si hay múltiples horarios, separarlos
    if (item.horas && item.horas !== 'Cerrado') {
      const turnos = item.horas.split(', ').map(turno => {
        const [inicio, fin] = turno.split('-');
        const horaInicio = parseInt(inicio.trim().split(':')[0]);
        return {
          horario: turno.trim(),
          esMañana: horaInicio < 12,
          esTarde: horaInicio >= 12 && horaInicio < 18,
          esNoche: horaInicio >= 18
        };
      });
      
      return { ...item, turnos };
    }
    
    return { ...item, turnos: [] };
  });
};

/**
 * Componente para mostrar los horarios de atención con visualización mejorada
 */
const HorariosAtencion = ({ colors, titleAnimationVariants, staggerItemVariants }) => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandido, setExpandido] = useState(false);
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const response = await fetch(`https://back-end-4803.onrender.com/api/perfilEmpresa/horarios-atencion`);
        
        if (!response.ok) {
          throw new Error(`Error al obtener horarios: ${response.status}`);
        }
        
        const data = await response.json();
        const horariosFormateados = procesarHorarios(data.horarios || []);
        setHorarios(horariosFormateados);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} thickness={3} sx={{ color: colors.primaryColor }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="warning" 
        sx={{ 
          mb: 1.5, 
          fontSize: '0.85rem',
          borderRadius: '8px',
          backgroundColor: isDarkTheme ? alpha('#ff9800', 0.15) : alpha('#ff9800', 0.08),
          color: isDarkTheme ? '#ffb74d' : '#e65100',
          border: `1px solid ${alpha('#ff9800', 0.2)}`,
        }}
      >
        No se pudieron cargar los horarios.
      </Alert>
    );
  }

  // Obtener el día actual
  const hoyIndex = horarios.findIndex(h => h.esHoy);
  
  // Filtrar días para mostrar según el diseño y estado de expansión
  const displayedHorarios = isMobile && !expandido
    ? horarios.filter((h, idx) => h.estado === 'abierto' || h.esHoy).slice(0, 4)
    : horarios;

  // Renderizado de un día en formato de lista para móvil
  const renderDiaMovil = (item) => {
    return (
      <motion.div
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 1.5,
            borderRadius: '8px',
            border: `1px solid ${item.estado === 'abierto' 
              ? alpha(colors.divider, 0.6)
              : alpha(colors.error, 0.3)}`,
            background: item.estado === 'abierto'
              ? (isDarkTheme ? alpha('#10B981', 0.04) : alpha('#10B981', 0.02))
              : (isDarkTheme ? alpha('#F43F5E', 0.04) : alpha('#FEE2E2', 0.3)),
            boxShadow: isDarkTheme ? '0 2px 6px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.03)',
            // Resaltar el día actual
            ...(item.esHoy && {
              border: `1px solid ${
                item.estado === 'abierto' 
                  ? alpha(colors.success, 0.3) 
                  : alpha(colors.error, 0.3)
              }`,
              boxShadow: isDarkTheme 
                ? `0 3px 8px rgba(0,0,0,0.15)` 
                : `0 3px 8px rgba(37,99,235,0.1)`,
            })
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: colors.primaryText,
                  fontSize: '0.9rem'
                }}
              >
                {item.dia}
              </Typography>
              
              {item.esHoy && (
                <Chip 
                  label="Hoy" 
                  size="small" 
                  sx={{ 
                    ml: 0.8, 
                    height: 16, 
                    fontSize: '0.6rem', 
                    fontWeight: 600,
                    px: 0.4,
                    backgroundColor: colors.primaryColor,
                    color: 'white',
                    borderRadius: '3px' 
                  }} 
                />
              )}
            </Box>
            
            <Chip
              label={
                item.estado === 'abierto' 
                  ? 'Abierto' 
                  : 'No disponible'
              }
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: item.estado === 'abierto'
                  ? alpha(colors.success, 0.15)
                  : alpha(colors.error, 0.15),
                color: item.estado === 'abierto' 
                  ? colors.success 
                  : colors.error,
                fontSize: '0.65rem',
                height: 20,
                px: 0.5
              }}
            />
          </Box>
          
          {/* Contenido de horarios */}
          {item.estado === 'abierto' ? (
            <Box
              sx={{
                borderRadius: '6px',
                background: isDarkTheme ? alpha('#ffffff', 0.03) : alpha('#10B981', 0.03),
                padding: 1.2
              }}
            >
              {item.turnos && item.turnos.map((turno, i) => (
                <Box 
                  key={i}
                  sx={{ 
                    mb: i < item.turnos.length - 1 ? 0.8 : 0,
                    pb: i < item.turnos.length - 1 ? 0.8 : 0,
                    borderBottom: i < item.turnos.length - 1 ? `1px dashed ${alpha(colors.divider, 0.6)}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8
                  }}
                >
                  {turno.esMañana ? (
                    <WbSunny sx={{ color: '#f59e0b', fontSize: '0.85rem' }} />
                  ) : turno.esTarde ? (
                    <WbSunny sx={{ color: '#d97706', fontSize: '0.85rem' }} />
                  ) : (
                    <NightsStay sx={{ color: '#4f46e5', fontSize: '0.85rem' }} />
                  )}
                  
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: colors.primaryText,
                      fontSize: '0.75rem'
                    }}
                  >
                    {turno.horario}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                borderRadius: '6px',
                background: isDarkTheme ? alpha('#F43F5E', 0.03) : alpha('#EF4444', 0.02),
                padding: 1.2,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Chip
                label="Previa cita"
                size="small"
                icon={<EventAvailable style={{ fontSize: '0.8rem', color: colors.primaryColor }} />}
                sx={{
                  fontWeight: 600,
                  backgroundColor: isDarkTheme ? alpha('#3B82F6', 0.15) : alpha('#3B82F6', 0.1),
                  color: colors.primaryColor,
                  fontSize: '0.7rem',
                  height: 22,
                  px: 0.8,
                }}
              />
            </Box>
          )}
        </Paper>
      </motion.div>
    );
  };

  // Renderizado de un día en formato de grid para pantallas grandes
  const renderDiaGrid = (item, index, columns) => {
    return (
      <Grid item xs={6/columns} sm={12/columns} key={index}>
        <motion.div
          whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.08)" }}
          transition={{ duration: 0.2 }}
        >
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              p: { xs: 1.5, sm: 1.8 },
              borderRadius: '8px',
              border: `1px solid ${item.estado === 'abierto' 
                ? alpha(colors.divider, 0.6)
                : alpha(colors.error, 0.3)}`,
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: isDarkTheme ? '0 3px 8px rgba(0,0,0,0.15)' : '0 3px 8px rgba(37,99,235,0.05)',
              background: item.estado === 'abierto'
                ? (isDarkTheme ? alpha('#10B981', 0.04) : alpha('#10B981', 0.02))
                : (isDarkTheme ? alpha('#F43F5E', 0.04) : alpha('#FEE2E2', 0.3)),
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background: item.estado === 'abierto'
                  ? (isDarkTheme ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #059669, #10B981)')
                  : (isDarkTheme ? 'linear-gradient(90deg, #F43F5E, #EF4444)' : 'linear-gradient(90deg, #EF4444, #F43F5E)')
              },
              // Resaltar el día actual
              ...(item.esHoy && {
                border: `1px solid ${
                  item.estado === 'abierto' 
                    ? alpha(colors.success, 0.3) 
                    : alpha(colors.error, 0.3)
                }`,
                boxShadow: isDarkTheme 
                  ? `0 4px 10px rgba(0,0,0,0.2)` 
                  : `0 4px 10px rgba(37,99,235,0.08)`,
              })
            }}
          >
            {/* Indicador pulsante para día actual */}
            {item.esHoy && (
              <motion.div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: item.estado === 'abierto' 
                    ? colors.success
                    : colors.error
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            {/* Día de la semana y estado */}
            <Box sx={{ mb: 1, textAlign: 'center', width: '100%' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: colors.primaryText,
                  mb: 0.5,
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5
                }}
              >
                {isTablet ? item.dia.substring(0, 3) : item.dia}
                {item.esHoy && (
                  <Chip 
                    label="Hoy" 
                    size="small" 
                    sx={{ 
                      ml: 0.5, 
                      height: 14, 
                      fontSize: '0.55rem', 
                      fontWeight: 600,
                      px: 0.3,
                      backgroundColor: colors.primaryColor,
                      color: 'white',
                      borderRadius: '3px' 
                    }} 
                  />
                )}
              </Typography>

              <Tooltip 
                title={
                  item.estado === 'abierto' 
                    ? 'Abierto para consultas' 
                    : 'No disponible este día'
                } 
                arrow
              >
                <Chip
                  label={
                    item.estado === 'abierto' 
                      ? 'Abierto' 
                      : 'No disponible'
                  }
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: item.estado === 'abierto'
                      ? alpha(colors.success, 0.15)
                      : alpha(colors.error, 0.15),
                    color: item.estado === 'abierto' 
                      ? colors.success 
                      : colors.error,
                    fontSize: '0.6rem',
                    height: 18,
                    px: 0.5
                  }}
                />
              </Tooltip>
            </Box>

            {/* Visualización mejorada de horarios */}
            {item.estado === 'abierto' ? (
              <Box
                sx={{
                  width: '100%',
                  borderRadius: '6px',
                  background: isDarkTheme ? alpha('#ffffff', 0.03) : alpha('#10B981', 0.03),
                  padding: 1.2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Mostrar cada turno separado claramente */}
                {item.turnos && item.turnos.map((turno, i) => (
                  <Box 
                    key={i}
                    sx={{ 
                      mb: i < item.turnos.length - 1 ? 0.8 : 0,
                      pb: i < item.turnos.length - 1 ? 0.8 : 0,
                      borderBottom: i < item.turnos.length - 1 ? `1px dashed ${alpha(colors.divider, 0.6)}` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8
                    }}
                  >
                    {/* Icono según turno (mañana/tarde/noche) */}
                    {turno.esMañana ? (
                      <WbSunny sx={{ color: '#f59e0b', fontSize: '0.85rem' }} />
                    ) : turno.esTarde ? (
                      <WbSunny sx={{ color: '#d97706', fontSize: '0.85rem' }} />
                    ) : (
                      <NightsStay sx={{ color: '#4f46e5', fontSize: '0.85rem' }} />
                    )}
                    
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.primaryText,
                        fontSize: '0.75rem'
                      }}
                    >
                      {turno.horario}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              // Para días no disponibles (Sábado, Domingo u otros cerrados)
              <Box
                sx={{
                  width: '100%',
                  borderRadius: '6px',
                  background: isDarkTheme ? alpha('#F43F5E', 0.03) : alpha('#EF4444', 0.02),
                  padding: 1.2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.8
                }}
              >
                {/* Etiqueta: "Con previa cita" */}
                <Chip
                  label="Previa cita"
                  size="small"
                  icon={<EventAvailable style={{ fontSize: '0.8rem', color: colors.primaryColor }} />}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: isDarkTheme ? alpha('#3B82F6', 0.15) : alpha('#3B82F6', 0.1),
                    color: colors.primaryColor,
                    fontSize: '0.65rem',
                    height: 20,
                    px: 0.5,
                  }}
                />
              </Box>
            )}
          </Paper>
        </motion.div>
      </Grid>
    );
  };

  // Determinar el diseño basado en el dispositivo
  const getGridColumns = () => {
    if (isTablet) return 4; // En tablets: 4 columnas
    return 7; // En desktop: 7 columnas (un día por columna)
  };

  const columns = getGridColumns();

  return (
    <>
      <motion.div variants={titleAnimationVariants}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: colors.primaryText,
            mb: 2,
            textAlign: 'center',
            position: 'relative',
            fontSize: isMobile ? '1.1rem' : '1.25rem',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '2px',
              background: colors.accentGradient,
              borderRadius: '2px',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <AccessTime sx={{ color: colors.primaryColor, fontSize: isMobile ? '1.1rem' : '1.25rem' }} />
            Horarios de Atención
          </Box>
        </Typography>
      </motion.div>

      {/* Destacar el horario de hoy para mayor visibilidad */}
      {hoyIndex >= 0 && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ 
              scale: 1,
              transition: {
                duration: 0.4,
                ease: "easeOut"
              }
            }}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
          >
            <Chip 
              label={horarios[hoyIndex].estado === 'abierto' 
                ? `${horarios[hoyIndex].dia}: ${horarios[hoyIndex].horas}` 
                : `${horarios[hoyIndex].dia}: No disponible`}
              sx={{
                fontSize: '0.85rem',
                py: 0.8,
                px: 1.5,
                height: 'auto',
                backgroundColor: horarios[hoyIndex].estado === 'abierto' 
                  ? (isDarkTheme ? alpha('#10B981', 0.15) : alpha('#10B981', 0.08))
                  : (isDarkTheme ? alpha('#F43F5E', 0.15) : alpha('#F43F5E', 0.08)),
                color: horarios[hoyIndex].estado === 'abierto' 
                  ? colors.success 
                  : colors.error,
                fontWeight: 600,
                border: `1px solid ${
                  horarios[hoyIndex].estado === 'abierto' 
                    ? alpha(colors.success, 0.3) 
                    : alpha(colors.error, 0.3)
                }`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderRadius: '6px'
              }}
              icon={
                horarios[hoyIndex].estado === 'abierto' 
                  ? <CheckCircleOutline fontSize="small" />
                  : <AccessTime fontSize="small" />
              }
            />
          </motion.div>
        </Box>
      )}

      {/* Leyenda de estados */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          mb: 2.5,
          flexWrap: 'wrap',
          fontSize: '0.75rem'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: colors.success 
            }} 
          />
          <Typography variant="caption" color={colors.secondaryText}>
            Abierto
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: colors.error 
            }} 
          />
          <Typography variant="caption" color={colors.secondaryText}>
            No disponible
          </Typography>
        </Box>
      </Box>

      {/* Vista de horarios mejorada */}
      <motion.div variants={staggerItemVariants}>
        <Box sx={{ maxWidth: '100%', mx: 'auto', mb: 2 }}>
          {isMobile ? (
            // Vista de lista para móvil 
            <Box sx={{ px: 0.5 }}>
              {displayedHorarios.map((item, index) => renderDiaMovil(item))}
            </Box>
          ) : (
            // Vista de grid para tablets y desktop
            <Grid container spacing={1.5} justifyContent="center">
              {displayedHorarios.map((item, index) => renderDiaGrid(item, index, columns))}
            </Grid>
          )}
        </Box>
      </motion.div>

      {/* Ver todos los horarios en móvil, si hay días ocultos */}
      {isMobile && horarios.length > 4 && !expandido && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Typography 
              variant="body2" 
              color="primary"
              onClick={() => setExpandido(true)}
              sx={{ 
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline',
                display: 'inline-block',
                px: 2,
                py: 0.5,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: alpha(colors.primaryColor, 0.05)
                }
              }}
            >
              Ver todos los horarios
            </Typography>
          </motion.div>
        </Box>
      )}

      {/* Ocultar todos los horarios en móvil cuando está expandido */}
      {isMobile && expandido && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Typography 
              variant="body2" 
              color="primary"
              onClick={() => setExpandido(false)}
              sx={{ 
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline',
                display: 'inline-block',
                px: 2,
                py: 0.5,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: alpha(colors.primaryColor, 0.05)
                }
              }}
            >
              Mostrar menos
            </Typography>
          </motion.div>
        </Box>
      )}

      {/* Información para pacientes - versión compacta */}
      <motion.div variants={staggerItemVariants}>
        <Box
          sx={{
            p: 1.8,
            borderRadius: '8px',
            background: `linear-gradient(to right, ${isDarkTheme ? alpha('#3B82F6', 0.06) : alpha('#2563EB', 0.02)} 0%, ${isDarkTheme ? alpha('#3B82F6', 0.02) : alpha('#2563EB', 0.01)} 100%)`,
            border: `1px solid ${isDarkTheme ? alpha('#3B82F6', 0.08) : alpha('#2563EB', 0.05)}`,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.2,
            maxWidth: '100%',
            mx: 'auto'
          }}
        >
          <Info color="primary" sx={{ fontSize: isMobile ? 16 : 18, mt: 0.2 }} />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: colors.primaryText,
                mb: 0.4,
                fontSize: isMobile ? '0.8rem' : '0.85rem'
              }}
            >
              Información para pacientes
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.secondaryText,
                lineHeight: 1.4,
                fontSize: isMobile ? '0.7rem' : '0.75rem'
              }}
            >
              Para una mejor atención, recomendamos agendar cita con anticipación. En caso de urgencias, llame directamente al consultorio.
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </>
  );
};

export default HorariosAtencion;