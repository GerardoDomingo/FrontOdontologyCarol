import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Tooltip } from '@mui/material';
import { Phone, WhatsApp } from '@mui/icons-material';

const ContactButtons = ({ colors, isDarkTheme, isCTA = false, showLabels = false }) => {
  const [contactInfo, setContactInfo] = useState({
    telefono: '',
    whatsapp: '',
    loading: true,
    error: false
  });


  useEffect(() => {
    // Función para cargar los datos de contacto
    const fetchContactInfo = async () => {
      try {
        // Obtener teléfono principal de la empresa usando el endpoint existente
        const empresaRes = await fetch(`https://back-end-4803.onrender.com/api/perfilEmpresa/empresa`);
        const empresaData = await empresaRes.json();
        
        // Obtener datos de redes sociales 
        // Usamos el endpoint existente de redes sociales o infoHeader si existe
        let whatsappNumber = '';
        try {
          const redesRes = await fetch(`https://back-end-4803.onrender.com/api/redesSociales/all`);
          const redesData = await redesRes.json();
          
          // Buscar WhatsApp en el arreglo de redes sociales
          const whatsappInfo = redesData.find(red => red.nombre_red?.toLowerCase() === 'whatsapp');
          if (whatsappInfo) {
            whatsappNumber = whatsappInfo.url;
          }
        } catch (error) {
          console.log('No se pudo cargar información de redes sociales, se usará teléfono principal');
          // Si no hay endpoint para redes sociales, usamos el teléfono principal como número de WhatsApp
          whatsappNumber = empresaData.telefono_principal;
        }
        
        setContactInfo({
          telefono: empresaData.telefono_principal || '',
          whatsapp: whatsappNumber || empresaData.telefono_principal || '',
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('Error al cargar datos de contacto:', error);
        setContactInfo({
          ...contactInfo,
          loading: false,
          error: true
        });
      }
    };

    fetchContactInfo();
  }, []);


  // Función para formatear el enlace del teléfono
  const formatPhoneLink = (phone) => {
    if (!phone) return '#';
    return `tel:${phone.replace(/\D/g, '')}`;
  };

  // Función para formatear el enlace de WhatsApp
  const formatWhatsAppLink = (whatsapp) => {
    if (!whatsapp) return '#';
    // Si ya tiene el formato completo con +, usarlo directamente
    const numero = whatsapp.startsWith('+') ? 
      whatsapp : 
      `+52${whatsapp.replace(/\D/g, '')}`;
    return `https://wa.me/${numero.replace('+', '')}`;
  };

  // Si está cargando, mostrar indicador
  if (contactInfo.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={30} color={isCTA ? "inherit" : "primary"} sx={{ color: isCTA ? 'white' : undefined }} />
      </Box>
    );
  }

  // Estilos específicos según si es para CTA o no
  const phoneButtonStyles = isCTA ? {
    backgroundColor: 'white',
    color: colors.primary,
    fontWeight: 600,
    px: 4,
    py: 1.5,
    borderRadius: '10px',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.9)'
    },
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontSize: '1rem'
  } : {
    background: colors.accentGradient,
    boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
    borderRadius: '8px',
    py: 1.2,
    px: 3,
    fontSize: '0.95rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
      transform: 'translateY(-3px)'
    }
  };

  const whatsappButtonStyles = isCTA ? {
    borderColor: 'white',
    color: 'white',
    fontWeight: 600,
    px: 4,
    py: 1.5,
    borderRadius: '10px',
    textTransform: 'none',
    borderWidth: '2px',
    '&:hover': {
      borderColor: 'white',
      backgroundColor: 'rgba(255,255,255,0.1)'
    },
    fontSize: '1rem'
  } : {
    borderColor: colors.success,
    borderWidth: '2px',
    color: colors.success,
    borderRadius: '8px',
    py: 1.1,
    px: 3,
    fontSize: '0.95rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: colors.success,
      backgroundColor: isDarkTheme ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)',
      transform: 'translateY(-3px)'
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: isCTA ? 3 : 2.5, 
        flexWrap: 'wrap', 
        mb: 4,
        justifyContent: isCTA ? 'center' : 'flex-start' 
      }}
    >
      {contactInfo.telefono && (
        <Tooltip title={contactInfo.telefono}>
          <Button
            variant={isCTA ? "contained" : "contained"}
            startIcon={<Phone />}
            href={formatPhoneLink(contactInfo.telefono)}
            sx={phoneButtonStyles}
          >
            {showLabels || isCTA ? `Llámanos al ${contactInfo.telefono}` : "Llamar ahora"}
          </Button>
        </Tooltip>
      )}

      {contactInfo.whatsapp && (
        <Tooltip title={contactInfo.whatsapp}>
          <Button
            variant={isCTA ? "outlined" : "outlined"}
            startIcon={<WhatsApp sx={{ color: isCTA ? undefined : colors.success }} />}
            href={formatWhatsAppLink(contactInfo.whatsapp)}
            target="_blank"
            rel="noopener"
            sx={whatsappButtonStyles}
          >
            {showLabels || isCTA ? `Contáctanos por WhatsApp` : "WhatsApp"}
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default ContactButtons;