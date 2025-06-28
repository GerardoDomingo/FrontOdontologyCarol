import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button, 
  IconButton, 
  useMediaQuery,
  Divider,
  Stack,
  Link,
  Modal,
  Paper,
  Fade
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  FaUserMd, 
  FaCalendarAlt, 
  FaFileMedical, 
  FaPhoneAlt, 
  FaQuestionCircle,
  FaTooth,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../components/Tools/ThemeContext'; // Ajusta la ruta según tu estructura

/**
 * Componente Footer para el área de pacientes con diseño mejorado,
 * responsivo y con integración de datos dinámicos desde la API
 * @returns {JSX.Element} Componente FooterPaciente
 */
const FooterPaciente = () => {
  // Estados para datos provenientes de la API
  const [privacyPolicy, setPrivacyPolicy] = useState([]);
  const [termsConditions, setTermsConditions] = useState([]);
  const [disclaimer, setDisclaimer] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkTheme } = useThemeContext();
  
  // Hora de atención de la clínica
  const horariosAtencion = [
    { dia: 'Lunes a Viernes', horario: '8:00 - 20:00' },
    { dia: 'Sábados', horario: '9:00 - 14:00' },
    { dia: 'Domingos', horario: 'Cerrado' }
  ];

  // Enlaces rápidos para pacientes
  const enlacesPacientes = [
    { texto: 'Mis Citas', icono: <FaCalendarAlt size={14} />, ruta: '/paciente/citas' },
    { texto: 'Mi Historial', icono: <FaFileMedical size={14} />, ruta: '/paciente/historial' },
    { texto: 'Mis Tratamientos', icono: <FaTooth size={14} />, ruta: '/paciente/tratamientos' },
    { texto: 'Preguntas Frecuentes', icono: <FaQuestionCircle size={14} />, ruta: '/paciente/faq' }
  ];

  // Métodos de contacto
  const contactos = [
    { texto: 'Emergencias: (01) 555-7890', icono: <FaPhoneAlt size={14} /> },
    { texto: 'Citas: (01) 555-1234', icono: <FaPhoneAlt size={14} /> }
  ];

  // Efecto para cargar datos desde la API
  useEffect(() => {
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
   * Cierra el modal
   */
  const handleCloseModal = () => setModalOpen(false);

  // Estilo para los botones de navegación
  const navButtonStyle = {
    color: '#2a3f54',
    fontSize: '0.85rem',
    textAlign: 'left',
    opacity: 0.85,
    transition: 'all 0.25s ease',
    padding: '6px 8px',
    borderRadius: '4px',
    '&:hover': {
      opacity: 1,
      backgroundColor: 'rgba(42, 63, 84, 0.08)',
      transform: 'translateX(3px)'
    },
    justifyContent: 'flex-start'
  };

  return (
    <Box 
      component="footer" 
      sx={{
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 -5px 15px rgba(0, 0, 0, 0.03)',
        position: 'relative',
        paddingTop: isMobile ? '30px' : '40px',
        paddingBottom: '20px',
        width: '100%',
        zIndex: 1
      }}
    >
      {/* Separador decorativo superior */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #d4e6f1 0%, #3498db 50%, #d4e6f1 100%)',
          zIndex: 2,
        }}
      />
      
      <Container maxWidth="lg">
        <Grid container spacing={isMobile ? 3 : 4} justifyContent="space-between">
          {/* Columna 1: Área de Pacientes */}
          <Grid item xs={12} sm={6} md={4}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 2 
              }}
            >
              <FaUserMd color="#3498db" size={20} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#2a3f54',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    width: '40px',
                    height: '2px',
                    bottom: '-8px',
                    left: 0,
                    backgroundColor: '#3498db',
                  }
                }}
              >
                Área de Pacientes
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                mb: 2, 
                lineHeight: 1.6,
                color: '#5d6778'
              }}
            >
              Acceda a su información clínica y gestione sus citas desde un solo lugar. Nuestro portal está diseñado pensando en su comodidad.
            </Typography>
            
            {isMobile && (
              <Divider sx={{ my: 2 }} />
            )}
          </Grid>

          {/* Columna 2: Enlaces rápidos */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                color: '#2a3f54',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '40px',
                  height: '2px',
                  bottom: '-8px',
                  left: 0,
                  backgroundColor: '#3498db',
                }
              }}
            >
              Enlaces Rápidos
            </Typography>
            
            <Stack spacing={1}>
              {enlacesPacientes.map((enlace, index) => (
                <Button
                  key={index}
                  startIcon={enlace.icono}
                  onClick={() => navigate(enlace.ruta)}
                  sx={navButtonStyle}
                  fullWidth
                >
                  {enlace.texto}
                </Button>
              ))}
            </Stack>
            
            {isMobile && (
              <Divider sx={{ my: 2 }} />
            )}
          </Grid>

          {/* Columna 3: Horarios y contacto */}
          <Grid item xs={12} sm={12} md={5}>
            <Grid container spacing={2}>
              {/* Horarios */}
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    color: '#2a3f54',
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      width: '40px',
                      height: '2px',
                      bottom: '-8px',
                      left: 0,
                      backgroundColor: '#3498db',
                    }
                  }}
                >
                  Horarios
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {horariosAtencion.map((horario, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: 1,
                        pb: 1,
                        borderBottom: index !== horariosAtencion.length - 1 ? '1px dashed rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                        {horario.dia}:
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {horario.horario}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              
              {/* Contacto */}
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    color: '#2a3f54',
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      width: '40px',
                      height: '2px',
                      bottom: '-8px',
                      left: 0,
                      backgroundColor: '#3498db',
                    }
                  }}
                >
                  Contacto
                </Typography>
                
                <Stack spacing={2} sx={{ mb: 2 }}>
                  {contactos.map((contacto, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box sx={{ 
                        color: '#3498db',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {contacto.icono}
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {contacto.texto}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontWeight: 500,
                    boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)',
                    '&:hover': {
                      backgroundColor: '#2980b9',
                      boxShadow: '0 6px 15px rgba(52, 152, 219, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate('/paciente/contacto')}
                >
                  Solicitar una cita
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Separador decorativo */}
        <Box
          sx={{
            position: 'relative',
            mt: 4,
            mb: 2,
            height: '1px',
            width: '100%',
            background: 'linear-gradient(90deg, rgba(52,152,219,0) 0%, rgba(52,152,219,0.5) 50%, rgba(52,152,219,0) 100%)',
          }}
        />

        {/* Copyright con diseño mejorado */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}
        >
          <Typography 
            variant="body2" 
            color="textSecondary"
            sx={{ 
              fontSize: '0.8rem',
              opacity: 0.8,
              fontWeight: 400
            }}
          >
            © {new Date().getFullYear()} Clínica Dental - Portal de Pacientes
          </Typography>
          
          <Box 
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center'
            }}
          >
            <Button
              onClick={() => handleOpenModal('Política de Privacidad', privacyPolicy[0]?.contenido || 'No disponible')}
              sx={{ 
                fontSize: '0.75rem',
                opacity: 0.8,
                transition: 'all 0.2s ease',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  opacity: 1,
                  color: '#3498db',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Privacidad
            </Button>
            <Button
              onClick={() => handleOpenModal('Términos y Condiciones', termsConditions[0]?.contenido || 'No disponible')}
              sx={{ 
                fontSize: '0.75rem',
                opacity: 0.8,
                transition: 'all 0.2s ease',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  opacity: 1,
                  color: '#3498db',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Términos
            </Button>
            <Button
              onClick={() => handleOpenModal('Deslinde Legal', disclaimer[0]?.contenido || 'No disponible')}
              sx={{ 
                fontSize: '0.75rem',
                opacity: 0.8,
                transition: 'all 0.2s ease',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  opacity: 1,
                  color: '#3498db',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Deslinde Legal
            </Button>
          </Box>
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
                  backgroundColor: '#3498db',
                  color: 'white',
                  px: 4,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#2980b9',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(52, 152, 219, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)',
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

export default FooterPaciente;