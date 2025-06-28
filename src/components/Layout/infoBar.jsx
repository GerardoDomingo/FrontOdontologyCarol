import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Tooltip
} from '@mui/material';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaPhoneAlt, 
  FaExclamationCircle 
} from 'react-icons/fa';
import axios from 'axios';
import { useThemeContext } from '../../components/Tools/ThemeContext';

// Componente para la barra de información
const InfoBar = () => {
  const { isDarkTheme } = useThemeContext();
  const [infoData, setInfoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfoData = async () => {
      try {
        setLoading(true);
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

  // Determinar si está abierto ahora (lógica simple)
  const isOpenNow = () => {
    if (!infoData || !infoData.horarioHoy.estaAbierto) return false;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Verificar si estamos en alguno de los rangos horarios
    return infoData.horarioHoy.horarios.some(horario => {
      const [horaInicio, horaFin] = horario.split(' - ');
      return currentTime >= horaInicio && currentTime <= horaFin;
    });
  };

  // Estado de apertura
  const openStatus = infoData ? isOpenNow() : false;

  return (
    <Box
      sx={{
        backgroundColor: isDarkTheme ? "#1E293B" : "#03427C", // Azul más oscuro para tema negro
        color: "#FFFFFF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "12px 16px",
        fontSize: "0.875rem",
        flexWrap: "wrap",
        gap: { xs: 2, sm: 3 },
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }}
    >
      {/* 📍 Dirección */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaMapMarkerAlt
          style={{
            color: isDarkTheme ? "#38BDF8" : "#4FD1C5" // Azul más brillante para tema oscuro
          }}
          size={16}
        />
        {loading ? (
          <Skeleton variant="text" width={150} sx={{ bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }} />
        ) : error ? (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: isDarkTheme ? "#FF9999" : "#FFCCCC"
            }}
          >
            Error al cargar dirección
          </Typography>
        ) : (
          <Tooltip title={infoData?.direccion || ""} arrow placement="bottom">
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                letterSpacing: "0.3px",
                fontWeight: 500,
                '&:hover': {
                  color: isDarkTheme ? "#38BDF8" : "#4FD1C5",
                  transition: "color 0.2s ease"
                }
              }}
            >
              {infoData?.direccionCorta || "Cargando..."}
            </Typography>
          </Tooltip>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          mx: 2,
          opacity: 0.4,
          color: isDarkTheme ? "#94A3B8" : "#FFFFFF"
        }}
      >
        |
      </Box>

      {/* ⏰ Horario */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaClock
          style={{
            color: isDarkTheme ? "#38BDF8" : "#4FD1C5"
          }}
          size={14}
        />
        {loading ? (
          <Skeleton variant="text" width={120} sx={{ bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }} />
        ) : error ? (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: isDarkTheme ? "#FF9999" : "#FFCCCC"
            }}
          >
            Error al cargar horario
          </Typography>
        ) : (
          <Tooltip
            title={
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Horario de {infoData?.horarioHoy.dia}:
                </Typography>
                {infoData?.horarioHoy.horarios.map((h, i) => (
                  <Typography key={i} variant="body2">
                    {h}
                  </Typography>
                ))}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      bgcolor: openStatus ? '#4CAF50' : '#F44336'
                    }} 
                  />
                  <Typography variant="caption">
                    {openStatus ? 'Abierto ahora' : 'Cerrado ahora'}
                  </Typography>
                </Box>
              </>
            }
            arrow
            placement="bottom"
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  letterSpacing: "0.2px",
                  fontWeight: 500
                }}
              >
                {infoData?.horarioGeneral || "Horario no disponible"}
              </Typography>
              
              {/* Indicador visual de abierto/cerrado */}
              <Box 
                sx={{ 
                  ml: 1,
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%',
                  bgcolor: openStatus ? '#4CAF50' : '#F44336'
                }} 
              />
            </Box>
          </Tooltip>
        )}
      </Box>

      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          mx: 2,
          opacity: 0.4,
          color: isDarkTheme ? "#94A3B8" : "#FFFFFF"
        }}
      >
        |
      </Box>

      {/* 📞 Teléfono */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FaPhoneAlt
          style={{
            color: isDarkTheme ? "#38BDF8" : "#4FD1C5"
          }}
          size={14}
        />
        {loading ? (
          <Skeleton variant="text" width={90} sx={{ bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }} />
        ) : error ? (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: isDarkTheme ? "#FF9999" : "#FFCCCC"
            }}
          >
            Error al cargar teléfono
          </Typography>
        ) : (
          <Typography
            component="a"
            href={`tel:${infoData?.telefono || ''}`}
            sx={{
              textDecoration: "none",
              color: isDarkTheme ? "#38BDF8" : "#4FD1C5",
              fontWeight: "600",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              transition: "all 0.3s ease",
              "&:hover": {
                color: isDarkTheme ? "#7DD3FC" : "#B2F5EA",
                transform: "scale(1.03)"
              }
            }}
          >
            {infoData?.telefono || "N/A"}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default InfoBar;