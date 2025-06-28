import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Modal, 
  Button, 
  Grid, 
  Container, 
  Divider,
  Paper,
  Fade,
  useMediaQuery,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaWhatsapp,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../Tools/ThemeContext';

/**
 * Formatea URLs de redes sociales según el tipo de red
 * @param {string} network - Nombre de la red social
 * @param {string} url - URL o identificador a formatear
 * @returns {string} - URL formateada para la red social
 */
const formatSocialUrl = (network, url) => {
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');

  switch (network) {
    case 'facebook':
      return `https://facebook.com/${cleanUrl}`;
    case 'twitter':
      return `https://twitter.com/${cleanUrl}`;
    case 'linkedin':
      return `https://linkedin.com/in/${cleanUrl}`;
    case 'instagram':
      return `https://instagram.com/${cleanUrl}`;
    case 'whatsapp':
      const phone = cleanUrl.replace(/\D/g, '');
      return `https://wa.me/${phone}`;
    default:
      return url;
  }
};

// Configuración de las redes sociales disponibles
const availableSocials = [
  {
    label: 'Facebook',
    name: 'facebook',
    icon: <FaFacebook />,
    baseUrl: 'https://facebook.com/'
  },
  {
    label: 'Twitter',
    name: 'twitter',
    icon: <FaTwitter />,
    baseUrl: 'https://twitter.com/'
  },
  {
    label: 'LinkedIn',
    name: 'linkedin',
    icon: <FaLinkedin />,
    baseUrl: 'https://linkedin.com/in/'
  },
  {
    label: 'Instagram',
    name: 'instagram',
    icon: <FaInstagram />,
    baseUrl: 'https://instagram.com/'
  },
  {
    label: 'WhatsApp',
    name: 'whatsapp',
    icon: <FaWhatsapp />,
    baseUrl: 'https://wa.me/'
  }
];

/**
 * Componente Footer mejorado con diseño profesional y responsivo
 * @returns {JSX.Element} Componente Footer
 */
const Footer = () => {
  // Estados para almacenar datos de la API
  const [socials, setSocials] = useState([]);
  const [privacyPolicy, setPrivacyPolicy] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);
  const [disclaimer, setDisclaimer] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  
  const navigate = useNavigate();
  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Efecto para cargar datos desde la API
  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/redesSociales/sociales');
        setSocials(response.data);
      } catch (error) {
        console.error('Error al obtener las redes sociales', error);
      }
    };

    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/politicas/politicas_privacidad');
        const activePolicy = response.data.filter(policy => policy.estado === 'activo');
        setPrivacyPolicy(activePolicy);
      } catch (error) {
        console.error('Error al obtener las políticas de privacidad', error);
      }
    };

    const fetchTermsConditions = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/termiCondicion/terminos_condiciones');
        const activeTerms = response.data.filter(term => term.estado === 'activo');
        setTermsConditions(activeTerms);
      } catch (error) {
        console.error('Error al obtener los términos y condiciones', error);
      }
    };

    const fetchDisclaimer = async () => {
      try {
        const response = await axios.get('https://back-end-4803.onrender.com/api/deslinde/deslinde');
        const activeDisclaimer = response.data.filter(disclaimer => disclaimer.estado === 'activo');
        setDisclaimer(activeDisclaimer);
      } catch (error) {
        console.error('Error al obtener el deslinde legal', error);
      }
    };

    // Llamada a todas las funciones de obtención de datos
    fetchSocials();
    fetchPrivacyPolicy();
    fetchTermsConditions();
    fetchDisclaimer();
  }, []);

  /**
   * Maneja la apertura del modal con contenido dinámico
   * @param {string} title - Título del modal
   * @param {string} content - Contenido del modal
   */
  const handleOpenModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  /**
   * Maneja el clic en un ícono de red social
   * @param {Object} social - Objeto con datos de la red social
   */
  const handleSocialClick = (social) => {
    const formattedUrl = formatSocialUrl(social.nombre_red, social.url);
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Cierra el modal
   */
  const handleCloseModal = () => setModalOpen(false);

  // Estilos del footer según el tema
  const footerStyle = {
    backgroundColor: isDarkTheme ? '#0D1B2A' : '#03427C',
    color: '#ffffff',
    paddingTop: isMobile ? '30px' : '60px',
    paddingBottom: '20px',
    width: '100%',
    boxShadow: '0 -10px 20px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    zIndex: 1,
  };

  // Estilo del botón de navegación
  const navButtonStyle = {
    color: '#ffffff',
    fontSize: '0.85rem',
    textAlign: 'left',
    opacity: 0.9,
    transition: 'all 0.3s ease',
    padding: '6px 8px',
    borderRadius: '4px',
    marginLeft: '-8px',
    '&:hover': {
      opacity: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-2px)',
    }
  };

  // Estilo para los íconos de redes sociales
  const socialIconStyle = {
    color: '#ffffff',
    fontSize: isMobile ? '1.2rem' : '1.5rem',
    transition: 'all 0.3s ease',
    margin: '0 4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '8px',
    borderRadius: '50%',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.05)',
      color: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
    }
  };

  return (
    <Box component="footer" sx={footerStyle}>
      {/* Onda decorativa en la parte superior del footer */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 100%)',
          zIndex: 2,
        }}
      />
      
      <Container maxWidth="lg">
        <Grid container spacing={isMobile ? 4 : 6} justifyContent="space-between">
          {/* Columna 1: Acerca de Carol */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '40px',
                  height: '2px',
                  bottom: '-8px',
                  left: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                }
              }}
            >
              Acerca de Carol
            </Typography>
            
            <Button
              sx={navButtonStyle}
              onClick={() => navigate('/about')}
              fullWidth
            >
              Información sobre nuestra empresa
            </Button>
            
            {isMobile && (
              <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
            )}
          </Grid>

          {/* Columna 2: Servicio al Cliente */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '40px',
                  height: '2px',
                  bottom: '-8px',
                  left: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                }
              }}
            >
              Servicio al Cliente
            </Typography>
            
            <Stack spacing={1}>
              <Button
                sx={navButtonStyle}
                onClick={() => navigate('/FAQ')}
                fullWidth
              >
                Preguntas frecuentes
              </Button>
              
              <Button
                sx={navButtonStyle}
                onClick={() => navigate('/Contact')}
                fullWidth
              >
                Contáctanos
              </Button>
            </Stack>
            
            {isMobile && (
              <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
            )}
          </Grid>

          {/* Columna 3: Normatividad */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '40px',
                  height: '2px',
                  bottom: '-8px',
                  left: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                }
              }}
            >
              Normatividad
            </Typography>
            
            <Stack spacing={1}>
              <Button
                onClick={() => handleOpenModal('Política de Privacidad', privacyPolicy[0]?.contenido || 'No disponible')}
                sx={navButtonStyle}
                fullWidth
              >
                Política de Privacidad
              </Button>
              
              <Button
                onClick={() => handleOpenModal('Términos y Condiciones', termsConditions[0]?.contenido || 'No disponible')}
                sx={navButtonStyle}
                fullWidth
              >
                Términos y Condiciones
              </Button>
              
              <Button
                onClick={() => handleOpenModal('Deslinde Legal', disclaimer[0]?.contenido || 'No disponible')}
                sx={navButtonStyle}
                fullWidth
              >
                Deslinde Legal
              </Button>
            </Stack>
            
            {isMobile && (
              <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
            )}
          </Grid>

          {/* Columna 4: Redes Sociales */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '40px',
                  height: '2px',
                  bottom: '-8px',
                  left: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                }
              }}
            >
              Síguenos
            </Typography>
            
            <Box 
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 2,
                justifyContent: isMobile ? 'flex-start' : 'flex-start'
              }}
            >
              {socials.map((social) => {
                const socialConfig = availableSocials.find(
                  (s) => s.name === social.nombre_red
                );

                return socialConfig && (
                  <IconButton
                    key={social.id}
                    onClick={() => handleSocialClick(social)}
                    aria-label={`Visitar ${socialConfig.label}`}
                    sx={socialIconStyle}
                  >
                    {socialConfig.icon}
                  </IconButton>
                );
              })}
            </Box>
          </Grid>
        </Grid>

        {/* Línea separadora con diseño mejorado */}
        <Box
          sx={{
            position: 'relative',
            mt: 5,
            mb: 3,
            height: '1px',
            width: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
          }}
        />

        {/* Copyright con diseño mejorado */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography 
            sx={{ 
              fontSize: '0.8rem',
              opacity: 0.7,
              textAlign: 'center',
              fontWeight: 300,
              letterSpacing: '0.5px'
            }}
          >
            © {new Date().getFullYear()} Odontología Carol. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>

      {/* Modal mejorado con animación y diseño profesional */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={modalOpen}>
          <Paper
            elevation={5}
            sx={{
              position: 'relative',
              borderRadius: '12px',
              p: { xs: 2, sm: 4 },
              mx: 2,
              maxWidth: '700px', 
              maxHeight: '85vh',
              width: '100%',
              overflowY: 'auto',
              '&:focus': {
                outline: 'none',
              },
              bgcolor: isDarkTheme ? '#132F4C' : '#ffffff',
              color: isDarkTheme ? '#ffffff' : 'text.primary',
              border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}
          >
            {/* Cabecera del modal */}
            <Box 
              sx={{
                borderBottom: isDarkTheme 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                pb: 2,
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: isDarkTheme ? '#90CAF9' : '#1565C0',
                }}
              >
                {modalTitle}
              </Typography>
              
              <IconButton
                onClick={handleCloseModal}
                aria-label="Cerrar modal"
                sx={{
                  color: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    color: isDarkTheme ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                <FaTimes />
              </IconButton>
            </Box>

            {/* Contenido del modal */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: isDarkTheme ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                  whiteSpace: 'pre-line',
                }}
              >
                {modalContent}
              </Typography>
            </Box>

            {/* Pie del modal */}
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: isDarkTheme 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                pt: 3
              }}
            >
              <Button
                onClick={handleCloseModal}
                variant="contained"
                sx={{
                  backgroundColor: isDarkTheme ? '#90CAF9' : '#0288D1',
                  color: isDarkTheme ? '#0A1929' : 'white',
                  px: 4,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: isDarkTheme ? '#64B5F6' : '#01579B',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: isDarkTheme 
                    ? '0 4px 12px rgba(144, 202, 249, 0.2)' 
                    : '0 4px 12px rgba(2, 136, 209, 0.3)',
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Footer;