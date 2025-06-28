import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  Avatar,
  Badge,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Tooltip,
  Zoom,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Chat as ChatIcon,
  PersonOutline as PersonIcon,
  SmartToy as BotIcon,
  Info as InfoIcon,
  SwapHoriz as SwapPositionIcon,
  ArrowDownward as ArrowIcon,
  MedicalServices as TreatmentIcon,
  EventAvailable as AppointmentIcon,
  Lightbulb as TipIcon,
  Help as HelpIcon,
  RestartAlt as RestartIcon,
  KeyboardDoubleArrowDown as DoubleArrowIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { createPortal } from 'react-dom';

// URL base para API
const API_BASE_URL = 'https://back-end-4803.onrender.com/api';

// Componente de mensaje optimizado
const ChatMessage = memo(({ message, avatar, messageStyles }) => {
  const { id, text, isUser, tipo } = message;
  
  return (
    <Box
      key={id}
      sx={messageStyles.container(isUser)}
    >
      {!isUser && avatar.bot}
      <Box sx={messageStyles.bubble(isUser, tipo)}>
        <Typography variant="body1" sx={{
          whiteSpace: 'pre-line',
          fontSize: '0.95rem',
          fontFamily: '"Inter", "Roboto", "Arial", sans-serif'
        }}>
          {text}
        </Typography>
      </Box>
      {isUser && avatar.user}
    </Box>
  );
});

// Panel de información
const InfoPanel = memo(({ onClose, styles, colors }) => (
  <Fade in={true}>
    <Box sx={styles.infoPanel}>
      <Box sx={styles.infoTitle}>
        Acerca del Asistente Dental
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: colors.primary.main }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={styles.infoContent}>
        <Typography component="p" variant="body1" gutterBottom>
          Bienvenido al asistente virtual de <strong>Odontología Carol</strong>. Este chatbot está diseñado para ayudarte con información y consultas sobre nuestros servicios dentales.
        </Typography>

        <Typography component="p" variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Funcionalidades principales:
        </Typography>

        <List dense sx={{ pl: 1 }}>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <TreatmentIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Información sobre nuestros servicios dentales" />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <TipIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Consejos para una mejor salud bucal" />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AppointmentIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Orientación para agendar citas" />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <HelpIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Respuestas a dudas frecuentes" />
          </ListItem>
        </List>

        <Typography component="p" variant="body1" gutterBottom sx={{ mt: 1 }}>
          Este asistente funciona 24/7 y está optimizado para brindarte la mejor atención. Para consultas específicas sobre tu historial dental o diagnósticos, te recomendamos contactar directamente con nuestra clínica.
        </Typography>

        <Typography component="p" variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Consejos de uso:
        </Typography>

        <List dense sx={{ pl: 1 }}>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ArrowIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Sé claro y específico en tus preguntas" />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ArrowIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Puedes cambiar la posición del chat con el botón de intercambio" />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ArrowIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="El chat mantendrá un historial de tu conversación actual" />
          </ListItem>
        </List>

        <Typography component="p" variant="body1" sx={{ mt: 2, fontWeight: 500, color: colors.primary.main }}>
          ¡Estamos aquí para ayudarte a mantener una sonrisa saludable!
        </Typography>
      </Box>
    </Box>
  </Fade>
));

// Componente principal de chat dental
const DentalChat = () => {
  // Referencias
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageAreaRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const intersectionObserverRef = useRef(null);
  const lastUserInteractionRef = useRef(Date.now());
  const typingTimeoutRef = useRef(null);

  // Estado de UI
  const [uiState, setUiState] = useState({
    isOpen: false,
    showInfo: false,
    position: 'right',
    unreadCount: 0
  });

  // Estado de chat
  const [chatState, setChatState] = useState({
    messages: [],
    isTyping: false,
    message: '',
    connectionError: false,
    conversationContext: {},
    isInitialized: false
  });

  // Estado de scroll
  const [scrollState, setScrollState] = useState({
    isAtBottom: true,
    needsScrollToBottom: false,
    userScrolledUp: false
  });

  // Estado para portal
  const [portalContainer, setPortalContainer] = useState(null);

  // Tema y responsive
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Actualizadores de estado
  const updateUIState = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateChatState = useCallback((updates) => {
    setChatState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateScrollState = useCallback((updates) => {
    setScrollState(prev => ({ ...prev, ...updates }));
  }, []);

  // Animaciones
  const animations = useMemo(() => ({
    fadeIn: keyframes`
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
    pulse: keyframes`
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
      }
      70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
      }
    `,
    typing: keyframes`
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    `
  }), []);

  // Paleta de colores moderna
  const colors = useMemo(() => ({
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#0D47A1',
      lighter: '#E3F2FD',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#651FFF',
      light: '#834BFF',
      dark: '#4615B2',
      contrastText: '#ffffff'
    },
    error: {
      light: '#FFEBEE',
      main: '#F44336',
      dark: '#C62828'
    },
    success: {
      light: '#E8F5E9',
      main: '#4CAF50',
      dark: '#2E7D32'
    },
    background: {
      light: '#ffffff',
      dark: '#121212',
      lightGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      darkGradient: 'linear-gradient(145deg, #1e1e1e 0%, #121212 100%)'
    },
    text: {
      light: '#37474F',
      dark: '#ECEFF1',
      lightSecondary: '#546E7A',
      darkSecondary: '#B0BEC5'
    },
    border: {
      light: 'rgba(207, 216, 220, 0.5)',
      dark: 'rgba(66, 66, 66, 0.5)'
    },
    accent: {
      blue: '#2196F3',
      teal: '#00BCD4',
      purple: '#7C4DFF',
      coral: '#FF5252'
    }
  }), []);

  // Estilos principales
  const styles = useMemo(() => ({
    container: {
      position: 'fixed',
      bottom: isMobile ? '16px' : '32px',
      left: uiState.position === 'left' ? (isMobile ? '16px' : '32px') : 'auto',
      right: uiState.position === 'right' ? (isMobile ? '16px' : '32px') : 'auto',
      zIndex: 1500,
      maxWidth: '100vw',
      maxHeight: '100vh',
      pointerEvents: 'auto',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform, opacity',
    },
    
    chatWindow: {
      width: isMobile ? '100vw' : isTablet ? '460px' : '420px',
      height: isMobile ? '85vh' : '600px',
      maxWidth: isMobile ? 'calc(100vw - 32px)' : isTablet ? '460px' : '420px',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: isMobile ? '16px' : '24px',
      overflow: 'hidden',
      boxShadow: isDarkTheme ? 
        '0 10px 30px rgba(0, 0, 0, 0.3)' : 
        '0 10px 40px rgba(0, 0, 0, 0.15)',
      background: isDarkTheme
        ? colors.background.darkGradient
        : colors.background.lightGradient,
      border: `1px solid ${isDarkTheme ? colors.border.dark : colors.border.light}`,
      margin: isMobile ? '0 auto' : '5px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform, opacity',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },

    header: {
      py: 2,
      px: 2.5,
      background: isDarkTheme
        ? `linear-gradient(to right, ${colors.primary.dark}, ${colors.primary.main})`
        : `linear-gradient(to right, ${colors.primary.main}, ${colors.primary.light})`,
      color: '#ffffff',
      borderTopLeftRadius: isMobile ? 16 : 24,
      borderTopRightRadius: isMobile ? 16 : 24,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
    },

    messageArea: {
      flexGrow: 1,
      overflowY: 'auto',
      p: 2.5,
      bgcolor: isDarkTheme ? colors.background.dark : colors.background.light,
      overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'thin',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        width: '6px',
        borderRadius: '3px'
      },
      '&::-webkit-scrollbar-track': {
        background: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        borderRadius: '3px',
        '&:hover': {
          background: isDarkTheme ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
        }
      },
      backgroundImage: isDarkTheme
        ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232196F3' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232196F3' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundAttachment: 'fixed',
    },

    // Estilos para mensajes
    messageStyles: {
      container: (isUser) => ({
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        mb: 2.5,
        gap: 1.5,
        animation: `${animations.fadeIn} 0.25s ease-out`,
        position: 'relative',
        px: 0.5,
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
      }),
      
      bubble: (isUser, tipo) => ({
        maxWidth: '85%',
        p: '14px 18px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        bgcolor: isUser
          ? isDarkTheme ? colors.primary.main : colors.primary.main
          : tipo === 'error'
            ? isDarkTheme ? colors.error.dark : colors.error.light
            : isDarkTheme ? '#363636' : '#F5F5F5',
        color: isUser
          ? '#ffffff'
          : tipo === 'error'
            ? isDarkTheme ? '#ffb4ab' : colors.error.dark
            : isDarkTheme ? colors.text.dark : colors.text.light,
        boxShadow: isUser
          ? '0 2px 10px rgba(33, 150, 243, 0.2)'
          : '0 2px 8px rgba(0, 0, 0, 0.05)',
        '& .MuiTypography-root': {
          lineHeight: 1.5,
          fontSize: '0.95rem',
          fontWeight: tipo === 'error' ? 500 : 400,
          letterSpacing: '0.015em'
        },
        border: isUser ? 'none' : `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: isUser
            ? '0 4px 12px rgba(33, 150, 243, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
      }),
    },

    avatar: (isUser) => ({
      width: 36,
      height: 36,
      bgcolor: isUser
        ? isDarkTheme ? colors.primary.light : colors.primary.dark
        : isDarkTheme ? '#424242' : '#E0E0E0',
      color: isUser 
        ? '#fff' 
        : isDarkTheme ? '#fff' : colors.primary.dark,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'scale(1.05)'
      },
      border: `2px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`,
    }),

    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.7,
      p: '14px 20px',
      borderRadius: '18px 18px 18px 4px',
      bgcolor: isDarkTheme ? '#363636' : '#F5F5F5',
      width: 'fit-content',
      mb: 2,
      maxWidth: '80%',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
    },

    typingDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: isDarkTheme ? '#B0BEC5' : colors.primary.main,
      animationName: `${animations.typing}`,
      animationDuration: '1.4s',
      animationIterationCount: 'infinite',
      '&:nth-of-type(2)': {
        animationDelay: '0.2s',
      },
      '&:nth-of-type(3)': {
        animationDelay: '0.4s',
      }
    },

    inputArea: {
      p: 2.5,
      pt: 1.5,
      pb: 2,
      bgcolor: isDarkTheme ? colors.background.dark : colors.background.light,
      display: 'flex',
      gap: 1.5,
      alignItems: 'center',
      borderTop: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`,
      position: 'relative',
    },

    textField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 30,
        bgcolor: isDarkTheme ? '#1e1e1e' : '#ffffff',
        color: isDarkTheme ? colors.text.dark : colors.text.light,
        boxShadow: isDarkTheme ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.05)',
        '& fieldset': {
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : colors.primary.light,
        },
        '&.Mui-focused fieldset': {
          borderColor: colors.primary.main,
          borderWidth: '1px'
        }
      },
      '& input': {
        fontSize: '0.95rem',
        padding: '16px 18px',
      },
      '& input::placeholder': {
        color: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
        opacity: 0.8,
        fontSize: '0.92rem',
      }
    },

    chatButtonContainer: {
      position: 'fixed',
      bottom: isMobile ? '16px' : '32px',
      left: uiState.position === 'left' ? (isMobile ? '16px' : '32px') : 'auto',
      right: uiState.position === 'right' ? (isMobile ? '16px' : '32px') : 'auto',
      zIndex: 1500,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform',
    },

    chatButton: {
      width: '60px',
      height: '60px',
      background: isDarkTheme
        ? `linear-gradient(135deg, ${colors.primary.dark} 10%, ${colors.primary.main} 90%)`
        : `linear-gradient(135deg, ${colors.primary.main} 10%, ${colors.primary.light} 90%)`,
      color: '#ffffff',
      boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
      borderRadius: '50%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      '&:hover': {
        transform: 'scale(1.05) translateY(-2px)',
        boxShadow: '0 6px 30px rgba(33, 150, 243, 0.5)',
      },
      border: `2px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`,
    },

    sendButton: {
      backgroundColor: colors.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: colors.primary.dark,
        transform: 'scale(1.05)',
      },
      '&.Mui-disabled': {
        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        color: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
      },
      width: 44,
      height: 44,
      borderRadius: '50%',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },

    headerButton: {
      color: 'white',
      background: 'rgba(255, 255, 255, 0.1)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.2)',
        transform: 'scale(1.05)',
      },
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      marginLeft: 1
    },

    infoPanel: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDarkTheme ? 'rgba(18, 18, 18, 0.97)' : 'rgba(255, 255, 255, 0.97)',
      zIndex: 10,
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      color: isDarkTheme ? colors.text.dark : colors.text.light,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderRadius: isMobile ? '16px' : '24px',
      animation: `${animations.fadeIn} 0.3s ease-out`,
      boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.05)'
    },

    infoTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      mb: 2,
      color: colors.primary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    infoContent: {
      mb: 2,
      fontSize: '0.95rem',
      lineHeight: 1.6,
      overflow: 'auto',
      flexGrow: 1,
      '& p': {
        mb: 1.5
      }
    },

    customTooltip: {
      backgroundColor: colors.primary.dark,
      color: '#fff',
      fontSize: '0.85rem',
      padding: '8px 12px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      maxWidth: '200px',
      opacity: '1 !important',
      zIndex: 9999
    },

    chatTooltip: {
      position: 'absolute',
      pointerEvents: 'none',
      backgroundColor: colors.primary.dark,
      color: '#fff',
      fontSize: '0.75rem',
      fontWeight: 500,
      padding: '8px 12px',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
      whiteSpace: 'nowrap',
      top: '50%',
      transform: 'translateY(-50%)',
      [uiState.position === 'right' ? 'left' : 'right']: 'calc(100% + 12px)',
      opacity: 0,
      transition: 'opacity 0.2s ease',
      zIndex: 1490,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [uiState.position === 'right' ? 'right' : 'left']: '-6px',
        borderWidth: '6px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        [`border${uiState.position === 'right' ? 'Left' : 'Right'}Color`]: colors.primary.dark,
      }
    },
    
    scrollIndicator: {
      position: 'absolute',
      bottom: '75px',
      right: '15px',
      backgroundColor: isDarkTheme ? 'rgba(18, 18, 18, 0.7)' : 'rgba(255, 255, 255, 0.8)',
      color: isDarkTheme ? colors.text.dark : colors.primary.main,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      opacity: scrollState.isAtBottom ? 0 : 1,
      transition: 'all 0.2s ease',
      transform: scrollState.isAtBottom ? 'scale(0.8)' : 'scale(1)',
      pointerEvents: scrollState.isAtBottom ? 'none' : 'auto',
      zIndex: 5,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      '&:hover': {
        transform: 'scale(1.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      }
    }
  }), [animations, colors, isDarkTheme, isMobile, isTablet, uiState.position, scrollState.isAtBottom]);

  // Avatares memoizados
  const avatars = useMemo(() => ({
    user: <Avatar sx={styles.avatar(true)}><PersonIcon fontSize="small" /></Avatar>,
    bot: <Avatar sx={styles.avatar(false)}><BotIcon fontSize="small" /></Avatar>
  }), [styles]);

  // Crear contenedor del portal
  useEffect(() => {
    const portalDiv = document.createElement('div');
    portalDiv.id = 'dental-chat-portal';
    portalDiv.style.position = 'fixed';
    portalDiv.style.zIndex = '9999';
    portalDiv.style.top = '0';
    portalDiv.style.left = '0';
    portalDiv.style.width = '100%';
    portalDiv.style.height = '0';
    portalDiv.style.overflow = 'visible';
    document.body.appendChild(portalDiv);

    setPortalContainer(portalDiv);

    return () => {
      document.body.removeChild(portalDiv);
    };
  }, []);

  // Manejo de scroll con Intersection Observer
  useEffect(() => {
    if (!uiState.isOpen || !messageAreaRef.current || !messagesEndRef.current) return;
    
    const options = {
      root: messageAreaRef.current,
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateScrollState({ isAtBottom: true });
        } else {
          const timeSinceLastInteraction = Date.now() - lastUserInteractionRef.current;
          if (timeSinceLastInteraction > 100) {
            updateScrollState({ isAtBottom: false });
          }
        }
      });
    }, options);
    
    observer.observe(messagesEndRef.current);
    intersectionObserverRef.current = observer;
    
    const handleUserScroll = () => {
      lastUserInteractionRef.current = Date.now();
    };
    
    messageAreaRef.current.addEventListener('scroll', handleUserScroll, { passive: true });
    
    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
      if (messageAreaRef.current) {
        messageAreaRef.current.removeEventListener('scroll', handleUserScroll);
      }
    };
  }, [uiState.isOpen, updateScrollState]);

  // Limpieza de timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Efecto de auto-scroll
  useEffect(() => {
    if (!messageAreaRef.current || !messagesEndRef.current) return;
    
    const shouldScroll = 
      chatState.isTyping || 
      scrollState.needsScrollToBottom || 
      (chatState.messages.length > 0 && 
       chatState.messages[chatState.messages.length - 1].isUser) ||
      scrollState.isAtBottom;
    
    if (shouldScroll) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        try {
          messagesEndRef.current.scrollIntoView({
            behavior: 'auto',
            block: 'end'
          });
          
          if (scrollState.needsScrollToBottom) {
            updateScrollState({ needsScrollToBottom: false });
          }
        } catch (err) {
          console.error("Error en scroll automático:", err);
        }
        
        scrollTimeoutRef.current = null;
      }, 50);
    }
  }, [
    chatState.messages, 
    chatState.isTyping, 
    scrollState.isAtBottom, 
    scrollState.needsScrollToBottom, 
    updateScrollState
  ]);

  // Inicialización del chat
  const initializeChat = useCallback(() => {
    updateChatState({
      messages: [],
      isTyping: true,
    });
    
    updateScrollState({
      needsScrollToBottom: true,
      isAtBottom: true
    });
    
    const showFirstMessage = () => {
      updateChatState({
        isTyping: false,
        messages: [{
          text: "¡Hola! Soy el asistente virtual de Odontología Carol. Estoy aquí para ayudarte con tus consultas dentales.",
          isUser: false,
          id: Date.now(),
          tipo: 'General',
          subtipo: 'bienvenida'
        }]
      });
      
      setTimeout(() => {
        updateChatState({ isTyping: true });
        setTimeout(showSecondMessage, 800);
      }, 600);
    };
    
    const showSecondMessage = () => {
      updateChatState(prevState => ({
        isTyping: false,
        messages: [...prevState.messages, {
          text: "Puedo asistirte con:\n• Información sobre tratamientos\n• Consejos de salud dental\n• Agendar citas\n• Resolver dudas generales",
          isUser: false,
          id: Date.now() + 1,
          tipo: 'General',
          subtipo: 'servicios'
        }]
      }));
      
      setTimeout(() => {
        updateChatState({ isTyping: true });
        setTimeout(showThirdMessage, 800);
      }, 600);
    };
    
    const showThirdMessage = () => {
      updateChatState(prevState => ({
        isTyping: false,
        messages: [...prevState.messages, {
          text: "¿En qué puedo ayudarte hoy?",
          isUser: false,
          id: Date.now() + 2,
          tipo: 'General',
          subtipo: 'pregunta'
        }]
      }));
    };
    
    setTimeout(showFirstMessage, 800);
  }, [updateChatState, updateScrollState]);

  // Inicializar chat al abrirse
  useEffect(() => {
    if (uiState.isOpen) {
      if (chatState.messages.length === 0 && !chatState.isInitialized) {
        updateChatState({ isInitialized: true });
        initializeChat();
      }
      
      if (!chatState.isTyping && !chatState.connectionError && inputRef.current) {
        const focusTimeout = setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 300);
        
        return () => clearTimeout(focusTimeout);
      }
    }
  }, [
    uiState.isOpen, 
    chatState.messages.length, 
    chatState.isInitialized,
    chatState.isTyping,
    chatState.connectionError,
    initializeChat,
    updateChatState
  ]);

  // Gestión de notificaciones
  useEffect(() => {
    if (!uiState.isOpen && chatState.messages.some(msg => msg.isUser)) {
      updateUIState({ unreadCount: 1 });
    } else {
      updateUIState({ unreadCount: 0 });
    }
  }, [uiState.isOpen, chatState.messages, updateUIState]);

  // Reiniciar conversación
  const resetConversation = useCallback(() => {
    updateChatState({
      isTyping: true,
      messages: [],
      conversationContext: {},
      isInitialized: false
    });
    
    updateScrollState({
      isAtBottom: true,
      needsScrollToBottom: true
    });

    setTimeout(() => {
      initializeChat();
    }, 300);
  }, [initializeChat, updateChatState, updateScrollState]);

  // Cambiar posición del chat
  const togglePosition = useCallback(() => {
    updateUIState({ position: uiState.position === 'right' ? 'left' : 'right' });
  }, [uiState.position, updateUIState]);

  // Reintentar conexión
  const retryConnection = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    updateChatState({
      messages: [{
        text: "Intentando reconectar con el servidor...",
        isUser: false,
        id: Date.now(),
        tipo: 'sistema'
      }],
      isTyping: true,
      connectionError: false,
      isInitialized: false
    });
    
    updateScrollState({
      isAtBottom: true,
      needsScrollToBottom: true
    });
    
    typingTimeoutRef.current = setTimeout(() => {
      updateChatState(prevState => {
        if (!prevState.isTyping) return prevState;
        
        return {
          ...prevState,
          isTyping: false,
          connectionError: true,
          messages: [
            ...prevState.messages,
            {
              text: "No se pudo reconectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.",
              isUser: false,
              id: Date.now() + 1,
              tipo: 'error',
              subtipo: 'reconnection_timeout'
            }
          ]
        };
      });
      
      typingTimeoutRef.current = null;
    }, 10000);
    
    initializeChat();
  }, [initializeChat, updateChatState, updateScrollState]);

  // Actualizar mensaje
  const handleMessageChange = useCallback((e) => {
    updateChatState({ message: e.target.value });
  }, [updateChatState]);

  // Enviar mensaje
  const handleSendMessage = useCallback(async (e) => {
    e?.preventDefault();
    
    const trimmedMessage = chatState.message.trim();
    if (!trimmedMessage) return;

    const userMessage = {
      text: trimmedMessage,
      isUser: true,
      id: Date.now()
    };
    
    updateChatState(prevState => ({
      messages: [...prevState.messages, userMessage],
      message: '',
      isTyping: true
    }));
    
    updateScrollState({
      isAtBottom: true,
      needsScrollToBottom: true
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      updateChatState(prevState => {
        if (!prevState.isTyping) return prevState;
        
        return {
          ...prevState,
          isTyping: false,
          connectionError: true,
          messages: [
            ...prevState.messages,
            {
              text: "Lo siento, no recibí respuesta del servidor. Por favor, intenta nuevamente o verifica tu conexión.",
              isUser: false,
              id: Date.now() + 1,
              tipo: 'error',
              subtipo: 'timeout_error'
            }
          ]
        };
      });
      
      updateScrollState({ needsScrollToBottom: true });
      typingTimeoutRef.current = null;
    }, 15000);

    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot/mensaje`, {
        mensaje: trimmedMessage,
        contexto: chatState.conversationContext
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      setTimeout(() => {
        updateChatState(prevState => {
          if (!prevState.isTyping) {
            return prevState;
          }
          
          const newState = { isTyping: false };
          
          if (response.data?.contexto) {
            newState.conversationContext = response.data.contexto;
          }
          
          if (response.data?.respuesta) {
            newState.messages = [
              ...prevState.messages,
              {
                text: response.data.respuesta,
                isUser: false,
                id: Date.now() + 1,
                tipo: response.data.tipo || 'General',
                subtipo: response.data.subtipo || null
              }
            ];
          } else {
            newState.messages = [
              ...prevState.messages,
              {
                text: "Lo siento, no pude procesar tu consulta. ¿Podrías intentar con otra pregunta?",
                isUser: false,
                id: Date.now() + 1,
                tipo: 'error'
              }
            ];
          }
          
          return newState;
        });
        
        updateScrollState({ needsScrollToBottom: true });
        
        if (inputRef.current) {
          setTimeout(() => {
            inputRef.current.focus();
          }, 100);
        }
      }, 800);

    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      setTimeout(() => {
        let errorMessage = "Lo siento, ha ocurrido un error al procesar tu consulta.";

        if (error.response?.data?.error) {
          errorMessage = `Error: ${error.response.data.error}`;
        } else if (error.message.includes("Network Error")) {
          errorMessage = "No puedo conectarme al servidor. Por favor, verifica tu conexión a internet.";
          updateChatState({ connectionError: true });
        }

        updateChatState(prevState => {
          if (!prevState.isTyping) {
            return prevState;
          }
          
          return {
            ...prevState,
            isTyping: false,
            messages: [
              ...prevState.messages,
              {
                text: errorMessage,
                isUser: false,
                id: Date.now() + 1,
                tipo: 'error'
              }
            ]
          };
        });

        updateScrollState({ needsScrollToBottom: true });
        
        if (inputRef.current && !chatState.connectionError) {
          setTimeout(() => {
            inputRef.current.focus();
          }, 100);
        }
      }, 800);
    }
  }, [chatState.message, chatState.conversationContext, chatState.connectionError, updateChatState, updateScrollState]);

  // Renderizar mensajes
  const renderMessages = useMemo(() => (
    chatState.messages.map((msg) => (
      <ChatMessage 
        key={msg.id || Math.random()} 
        message={msg} 
        avatar={avatars} 
        messageStyles={styles.messageStyles} 
      />
    ))
  ), [chatState.messages, avatars, styles.messageStyles]);

  // Indicador de typing
  const renderTypingIndicator = useMemo(() => (
    chatState.isTyping && (
      <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2.5, gap: 1.5, animation: `${animations.fadeIn} 0.3s ease-out` }}>
        {avatars.bot}
        <Box sx={styles.typingIndicator}>
          <Box sx={styles.typingDot} />
          <Box sx={styles.typingDot} />
          <Box sx={styles.typingDot} />
        </Box>
      </Box>
    )
  ), [chatState.isTyping, avatars.bot, styles.typingIndicator, styles.typingDot, animations.fadeIn]);

  // Renderizado del portal
  const chatPortal = portalContainer && createPortal(
    <>
      {/* Ventana de chat */}
      {uiState.isOpen && (
        <Box sx={styles.container}>
          <Paper sx={styles.chatWindow} elevation={3}>
            {/* Cabecera */}
            <Box sx={styles.header}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{
                  bgcolor: chatState.connectionError ? colors.error.main : colors.primary.main,
                  width: 38,
                  height: 38,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}>
                  <BotIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{
                    fontWeight: 600,
                    lineHeight: 1.2,
                    fontSize: '1rem',
                    letterSpacing: '0.01em'
                  }}>
                    Asistente Dental
                  </Typography>
                  <Typography variant="caption" sx={{
                    opacity: 0.9,
                    fontSize: '0.75rem',
                    fontWeight: 400
                  }}>
                    {chatState.connectionError ? 'Problema de conexión' : 'En línea | Odontología Carol'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Botón para reiniciar conversación */}
                <Tooltip
                  title="Reiniciar conversación"
                  arrow
                  placement="bottom"
                  TransitionComponent={Zoom}
                  classes={{ tooltip: styles.customTooltip }}
                >
                  <IconButton
                    size="small"
                    onClick={resetConversation}
                    sx={styles.headerButton}
                  >
                    <RestartIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {/* Cancelar estado de typing */}
                {chatState.isTyping && (
                  <Tooltip
                    title="Cancelar espera"
                    arrow
                    placement="bottom"
                    TransitionComponent={Zoom}
                    classes={{ tooltip: styles.customTooltip }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current);
                          typingTimeoutRef.current = null;
                        }
                        
                        updateChatState(prevState => ({
                          ...prevState,
                          isTyping: false,
                          messages: [
                            ...prevState.messages,
                            {
                              text: "Espera cancelada. Por favor, intenta enviar tu mensaje nuevamente.",
                              isUser: false,
                              id: Date.now(),
                              tipo: 'sistema',
                              subtipo: 'cancel_typing'
                            }
                          ]
                        }));
                      }}
                      sx={{
                        ...styles.headerButton,
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.3)',
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Cambiar posición */}
                <Tooltip
                  title="Cambiar posición del chat"
                  arrow
                  placement="bottom"
                  TransitionComponent={Zoom}
                  classes={{ tooltip: styles.customTooltip }}
                >
                  <IconButton
                    size="small"
                    onClick={togglePosition}
                    sx={styles.headerButton}
                  >
                    <SwapPositionIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Botón de información */}
                <Tooltip
                  title="Información sobre el chat"
                  arrow
                  placement="bottom"
                  TransitionComponent={Zoom}
                  classes={{ tooltip: styles.customTooltip }}
                >
                  <IconButton
                    size="small"
                    onClick={() => updateUIState({ showInfo: true })}
                    sx={styles.headerButton}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Cerrar chat */}
                <Tooltip
                  title="Cerrar chat"
                  arrow
                  placement="bottom"
                  TransitionComponent={Zoom}
                  classes={{ tooltip: styles.customTooltip }}
                >
                  <IconButton
                    size="small"
                    onClick={() => updateUIState({ isOpen: false })}
                    sx={styles.headerButton}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Panel de información */}
            {uiState.showInfo && (
              <InfoPanel 
                onClose={() => updateUIState({ showInfo: false })} 
                styles={styles}
                colors={colors}
              />
            )}

            {/* Área de mensajes */}
            <Box 
              sx={styles.messageArea} 
              ref={messageAreaRef}
            >
              {renderMessages}
              {renderTypingIndicator}

              {/* Referencia para auto-scroll */}
              <div ref={messagesEndRef} />
              
              {/* Indicador de scroll */}
              {chatState.messages.length > 0 && !scrollState.isAtBottom && (
                <Tooltip
                  title="Ir al final de la conversación"
                  arrow
                  placement="left"
                  TransitionComponent={Zoom}
                >
                  <Box 
                    sx={styles.scrollIndicator}
                    onClick={() => {
                      updateScrollState({ 
                        isAtBottom: true,
                        needsScrollToBottom: true 
                      });
                    }}
                  >
                    <DoubleArrowIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Tooltip>
              )}
            </Box>

            {/* Área de entrada */}
            <Box
              component="form"
              onSubmit={handleSendMessage}
              sx={styles.inputArea}
            >
              <TextField
                fullWidth
                size="small"
                value={chatState.message}
                onChange={handleMessageChange}
                placeholder={chatState.connectionError ? "Reconectar primero..." : "Escribe tu mensaje..."}
                variant="outlined"
                sx={styles.textField}
                inputRef={inputRef}
                disabled={chatState.isTyping || chatState.connectionError}
                autoFocus
                inputProps={{
                  'aria-label': 'Mensaje',
                  maxLength: 500,
                }}
              />

              {/* Botón de enviar */}
              <Tooltip
                title="Enviar mensaje"
                arrow
                placement="top"
                TransitionComponent={Zoom}
                classes={{ tooltip: styles.customTooltip }}
              >
                <span>
                  <IconButton
                    type="submit"
                    disabled={!chatState.message.trim() || chatState.isTyping || chatState.connectionError}
                    sx={styles.sendButton}
                    aria-label="Enviar mensaje"
                  >
                    {chatState.isTyping ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <SendIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Botón flotante */}
      {!uiState.isOpen && (
        <Box sx={styles.chatButtonContainer} className="chat-button-container">
          <Badge
            badgeContent={uiState.unreadCount}
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: 22,
                minWidth: 22,
                top: 6,
                right: 6,
                padding: '0 6px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            <Box
              sx={styles.chatButton}
              onClick={() => {
                updateUIState({ isOpen: true });
                if (chatState.connectionError) {
                  retryConnection();
                }
              }}
              onMouseEnter={(e) => {
                const tooltip = e.currentTarget.parentNode.querySelector('.chat-tooltip');
                if (tooltip) {
                  tooltip.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                const tooltip = e.currentTarget.parentNode.querySelector('.chat-tooltip');
                if (tooltip) {
                  tooltip.style.opacity = '0';
                }
              }}
              style={{
                animation: uiState.unreadCount > 0 ? `${animations.pulse} 2s infinite` : 'none',
                backgroundColor: chatState.connectionError ? colors.error.main : undefined
              }}
              aria-label="Abrir chat de asistencia"
              role="button"
              tabIndex={0}
            >
              <ChatIcon sx={{ fontSize: 30, color: '#ffffff' }} />
            </Box>

            {/* Tooltip */}
            <Box
              className="chat-tooltip"
              sx={{
                ...styles.chatTooltip,
                left: uiState.position === 'right' ? 'auto' : 'calc(100% + 12px)',
                right: uiState.position === 'left' ? 'auto' : 'calc(100% + 12px)',
              }}
            >
              Abrir chat de asistencia
            </Box>
          </Badge>
        </Box>
      )}
    </>,
    portalContainer
  );

  return chatPortal || null;
};

export default DentalChat;