import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    IconButton,
    TextField,
    Typography,
    Tooltip,
    Paper,
    Avatar,
    Fade,
    Grow,
    Badge,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Settings as SettingsIcon,
    Lightbulb as LightbulbIcon,
    Chat as ChatIcon,
    PersonOutline as PersonIcon,
    SmartToy as BotIcon,
    SupportAgent as SupportIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { useThemeContext } from '../Tools/ThemeContext';
import { createPortal } from 'react-dom';

/**
 * Componente profesional de chat para asistencia dental
 * Proporciona una interfaz intuitiva para consultas y asistencia al paciente
 * Corregido para solucionar problemas de visualización y posicionamiento
 */
const DentalChat = () => {

    const pulse = keyframes`
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(3, 66, 124, 0.7);
      }
      70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(3, 66, 124, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(3, 66, 124, 0);
      }
    `;

    const typing = keyframes`
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    `;

    // Mensajes de bienvenida e instrucciones
    const WELCOME_MESSAGE = [
        "👋 ¡Hola! Soy el asistente virtual de Odontología Carol. Estoy aquí para ayudarte con tus consultas dentales.",
        "Puedo asistirte con:\n• Información sobre tratamientos\n• Consejos de salud dental\n• Agendar citas\n• Resolver dudas generales",
        "¿En qué puedo ayudarte hoy?"
    ];

    // Preguntas frecuentes sugeridas
    const FAQ_QUESTIONS = [
        "¿Cuánto cuesta una limpieza dental?",
        "¿Cada cuánto debo visitar al dentista?",
        "¿Qué hacer en caso de dolor dental?",
        "¿Cuánto dura un blanqueamiento?",
        "¿Aceptan todas las aseguradoras?"
    ];

    // Mensajes emergentes para el botón de chat
    const TOOLTIP_MESSAGES = [
        "¿Tienes una consulta dental? ¡Pregúntame!",
        "¡Hola! ¿Necesitas ayuda con tu salud dental?",
        "¿Dudas sobre tratamientos? Consulta conmigo",
        "Asistente dental a tu servicio 🦷",
        "¿En qué puedo ayudarte hoy? 😊"
    ];

    // Sistema simple de respuestas predefinidas
    const PREDEFINED_RESPONSES = {
        greeting: [
            "¡Hola! ¿En qué puedo ayudarte hoy?",
            "¡Hola! Soy el asistente virtual dental. ¿Cómo puedo asistirte?",
            "¡Saludos! Estoy aquí para resolver tus dudas dentales. ¿En qué te puedo ayudar?"
        ],
        thanks: [
            "¡De nada! Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte?",
            "Es un placer poder ayudarte. ¿Necesitas algo más?",
            "No hay de qué. Si tienes más preguntas, no dudes en consultarme."
        ],
        notUnderstood: [
            "Lo siento, no he comprendido tu consulta. ¿Podrías reformularla de otra manera?",
            "Disculpa, no he entendido lo que necesitas. ¿Podrías ser más específico?",
            "Parece que no puedo entender tu mensaje. ¿Podrías intentar expresarlo de otra forma?"
        ],
        pricing: [
            "Los precios varían según el tratamiento específico y las necesidades individuales. Una limpieza dental básica oscila entre $600-$1,200 MXN. Para un presupuesto personalizado, te recomendaría agendar una evaluación inicial sin costo."
        ],
        visitFrequency: [
            "Se recomienda visitar al dentista cada 6 meses para revisiones y limpiezas regulares. Sin embargo, si tienes tratamientos en curso o condiciones especiales, tu dentista podría recomendarte visitas más frecuentes."
        ],
        toothache: [
            "Para un dolor dental repentino:\n• Toma un analgésico como paracetamol o ibuprofeno siguiendo las indicaciones\n• Enjuaga con agua tibia con sal\n• Evita alimentos muy fríos, calientes o dulces\n• Contacta con nuestra clínica para una cita de emergencia al 55-1234-5678"
        ],
        whitening: [
            "Un tratamiento de blanqueamiento dental profesional en nuestra clínica dura aproximadamente una hora. Los resultados son inmediatos, y con buenos cuidados, pueden durar entre 1-3 años dependiendo de tus hábitos alimenticios y de higiene dental."
        ],
        insurance: [
            "Trabajamos con las principales aseguradoras como Axa, GNP, Metlife, Allianz y MAPFRE. También ofrecemos planes de financiamiento y descuentos para pacientes sin seguro. ¿Te gustaría más información sobre algún plan específico?"
        ],
        appointmentScheduling: [
            "Para agendar una cita, necesitaría algunos datos básicos. ¿Prefieres que te contacte un asistente para programarla, o deseas hacerlo por teléfono? Nuestro número es 55-1234-5678 y atendemos de lunes a viernes de 9am a 7pm."
        ],
    };

    // Estados principales
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState('right');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [showQuickQuestions, setShowQuickQuestions] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [portalContainer, setPortalContainer] = useState(null);

    // Referencias
    const messagesEndRef = useRef(null);
    const tooltipTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    const chatWindowRef = useRef(null);

    // Contexto y temas
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Crear contenedor del portal al montar el componente
    useEffect(() => {
        // Crear un div para el portal
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

        // Limpiar al desmontar
        return () => {
            document.body.removeChild(portalDiv);
        };
    }, []);

    // Inicializar mensajes de bienvenida
    useEffect(() => {
        if (messages.length === 0 && isOpen) {
            // Añadir los mensajes de bienvenida con un pequeño retraso entre ellos
            WELCOME_MESSAGE.forEach((msg, index) => {
                setTimeout(() => {
                    setIsTyping(true);

                    setTimeout(() => {
                        setIsTyping(false);
                        setMessages(prevMessages => [
                            ...prevMessages,
                            { text: msg, isUser: false }
                        ]);
                    }, 1000 + (index * 300)); // Tiempo de escritura simulado

                }, index * 1500); // Retraso entre mensajes
            });
        }
    }, [isOpen, messages.length]);

    // Cambiar mensaje de tooltip cada cierto tiempo
    useEffect(() => {
        if (showTooltip && !isOpen) {
            const intervalId = setInterval(() => {
                setCurrentTooltipIndex(prev =>
                    prev === TOOLTIP_MESSAGES.length - 1 ? 0 : prev + 1
                );
            }, 9000);

            return () => clearInterval(intervalId);
        }
    }, [showTooltip, isOpen]);

    // Auto-scroll al último mensaje
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Manejar notificaciones
    useEffect(() => {
        if (!isOpen && messages.some(msg => msg.isUser)) {
            setUnreadCount(1);
        } else {
            setUnreadCount(0);
        }
    }, [isOpen, messages]);

    // Evento al pasar el mouse sobre el botón de chat
    const handleMouseEnter = () => {
        tooltipTimeoutRef.current = setTimeout(() => {
            setShowTooltip(true);
        }, 1000);
    };

    // Evento al quitar el mouse del botón de chat
    const handleMouseLeave = () => {
        clearTimeout(tooltipTimeoutRef.current);
        setShowTooltip(false);
    };

    // Cambiar posición del chat (izquierda/derecha)
    const togglePosition = () => {
        setPosition(prev => prev === 'right' ? 'left' : 'right');
    };

    // Procesar patrones comunes en texto
    const identifyMessageIntent = (text) => {
        const lowerText = text.toLowerCase();

        // Saludos
        if (/^(hola|buenos días|buenas tardes|buenas noches|hey|saludos|qué tal|como estas)/i.test(lowerText)) {
            return 'greeting';
        }

        // Agradecimientos
        if (/^(gracias|muchas gracias|te lo agradezco|thanks)/i.test(lowerText)) {
            return 'thanks';
        }

        // Precios
        if (/precio|costo|cuánto cuesta|cuanto vale|tarifa|valor/i.test(lowerText) && /limpie[sz]a|blanqueamiento|consulta|tratamiento/i.test(lowerText)) {
            if (/limpie[sz]a/i.test(lowerText)) {
                return 'pricing';
            } else if (/blanqueamiento/i.test(lowerText)) {
                return 'whitening';
            }
        }

        // Frecuencia de visitas
        if (/(cada cuánto|con qué frecuencia|cada cuanto tiempo|regularmente|cada cuando) (debo|tengo que|hay que|se debe|debería) (ir|visitar|acudir|venir)/i.test(lowerText)) {
            return 'visitFrequency';
        }

        // Dolor dental
        if (/(dolor|duele|molestia|sensibilidad) (dental|de muelas|diente)/i.test(lowerText) || /que hago si me duele/i.test(lowerText)) {
            return 'toothache';
        }

        // Blanqueamiento
        if (/blanqueamiento|blanquear dientes|teeth whitening|aclarar dientes/i.test(lowerText) && /tiempo|dura|duración|cuánto tarda/i.test(lowerText)) {
            return 'whitening';
        }

        // Seguros
        if (/seguro|aseguradora|cobertura|insurance|plan dental/i.test(lowerText)) {
            return 'insurance';
        }

        // Citas
        if (/(agendar|programar|hacer|reservar|sacar) (una )?(cita|consulta|visita|appointment)/i.test(lowerText)) {
            return 'appointmentScheduling';
        }

        // No se reconoció la intención
        return null;
    };

    // Obtener respuesta basada en la intención detectada
    const getResponseForIntent = (intent) => {
        if (!intent || !PREDEFINED_RESPONSES[intent]) {
            return getRandomResponse('notUnderstood');
        }

        return getRandomResponse(intent);
    };

    // Obtener respuesta aleatoria de un conjunto
    const getRandomResponse = (type) => {
        const responses = PREDEFINED_RESPONSES[type];
        if (!responses || responses.length === 0) {
            return "Lo siento, no puedo responder a eso en este momento.";
        }

        return responses[Math.floor(Math.random() * responses.length)];
    };

    // Enviar mensaje
    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!message.trim()) return;

        // Añadir mensaje del usuario
        const userMessage = message.trim();
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setMessage('');

        // Enfocar el input nuevamente
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);

        setIsTyping(true);

        // Procesar la respuesta
        setTimeout(() => {
            setIsTyping(false);

            // Detectar la intención del mensaje
            const intent = identifyMessageIntent(userMessage);
            const response = getResponseForIntent(intent);

            // Añadir respuesta del bot
            setMessages(prev => [...prev, { text: response, isUser: false }]);
        }, 1500 + Math.random() * 1000); // Tiempo variable para que parezca más natural
    };

    // Cerrar el chat
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
            setShowQuickQuestions(false);
        }, 300);
    };

    // Seleccionar una pregunta frecuente
    const handleSelectQuestion = (question) => {
        setMessage(question);
        setShowQuickQuestions(false);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    // Definición de estilos según el tema y dispositivo
    const styles = {
        // Contenedor principal del chat
        container: {
            position: 'fixed',
            bottom: isMobile ? '16px' : '32px',
            [position]: isMobile ? '16px' : '32px',
            zIndex: 1500,
            maxWidth: '100vw',
            maxHeight: '100vh',
            pointerEvents: 'auto',
        },

        // Ventana de chat
        chatWindow: {
            width: isMobile ? '100vw' : isTablet ? '350px' : '380px',
            height: isMobile ? '92vh' : '520px',
            maxWidth: isMobile ? 'calc(100vw - 32px)' : '380px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobile ? '16px' : '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            background: isDarkTheme
                ? 'linear-gradient(135deg, #1C2A38 0%, #1C2A38 100%)'
                : 'linear-gradient(90deg, #ffffff 0%, #F9FDFF 100%)',
            border: `1px solid ${isDarkTheme ? '#2C5282' : '#BEE3F8'}`,
            margin: isMobile ? '0 auto' : '5px'
        },

        // Cabecera del chat
        header: {
            py: 1.5,
            px: 2,
            background: isDarkTheme
                ? 'linear-gradient(135deg, #1A365D 0%, #2C5282 100%)'
                : 'linear-gradient(90deg, #3182CE 0%, #4299E1 100%)',
            color: '#ffffff',
            borderTopLeftRadius: isMobile ? 16 : 20,
            borderTopRightRadius: isMobile ? 16 : 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },

        // Título del chat
        headerTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
        },

        // Área de mensajes
        messageArea: {
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: isDarkTheme ? '#1A202C' : '#F7FAFC',
            backgroundImage: isDarkTheme
                ? 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.03) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.02) 2%, transparent 0%)'
                : 'radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.01) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.01) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            '&::-webkit-scrollbar': {
                width: '6px',
            },
            '&::-webkit-scrollbar-track': {
                background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
                background: isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
                '&:hover': {
                    background: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
                }
            }
        },

        // Burbuja de mensaje
        message: (isUser) => ({
            maxWidth: '80%',
            p: '12px 16px',
            borderRadius: isUser ? '18px 18px 0 18px' : '18px 18px 18px 0',
            bgcolor: isUser
                ? isDarkTheme ? '#2B6CB0' : '#3182CE'
                : isDarkTheme ? '#2D3748' : '#EBF8FF',
            color: isUser
                ? '#ffffff'
                : isDarkTheme ? '#E2E8F0' : '#2D3748',
            boxShadow: isUser
                ? isDarkTheme ? '0 2px 5px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)'
                : isDarkTheme ? '0 2px 5px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
            '& .MuiTypography-root': {
                lineHeight: 1.6,
                fontSize: '0.95rem'
            }
        }),

        // Contenedor del mensaje con avatar
        messageContainer: (isUser) => ({
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end',
            mb: 2,
            gap: 1,
        }),

        // Avatar en mensajes
        avatar: (isUser) => ({
            width: 32,
            height: 32,
            bgcolor: isUser
                ? isDarkTheme ? '#4299E1' : '#2B6CB0'
                : isDarkTheme ? '#4A5568' : '#90CDF4',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }),

        // Indicador de "está escribiendo..."
        typingIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            p: '8px 16px',
            borderRadius: '18px 18px 18px 0',
            bgcolor: isDarkTheme ? '#2D3748' : '#EBF8FF',
            width: 'fit-content',
            mb: 2,
            maxWidth: '80%',
            boxShadow: isDarkTheme ? '0 2px 5px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
        },

        // Puntos animados del indicador de "está escribiendo..."
        typingDot: {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isDarkTheme ? '#CBD5E0' : '#4A5568',
            animationName: `${typing}`,
            animationDuration: '1.4s',
            animationIterationCount: 'infinite',
            '&:nth-of-type(2)': {
                animationDelay: '0.2s',
            },
            '&:nth-of-type(3)': {
                animationDelay: '0.4s',
            }
        },

        // Área de entrada de texto
        inputArea: {
            p: 2,
            bgcolor: isDarkTheme ? '#1A202C' : '#F7FAFC',
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            borderTop: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        },

        // Campo de texto
        textField: {
            '& .MuiOutlinedInput-root': {
                borderRadius: 20,
                bgcolor: isDarkTheme ? '#2D3748' : '#ffffff',
                color: isDarkTheme ? '#E2E8F0' : '#2D3748',
                boxShadow: isDarkTheme ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                '& fieldset': {
                    borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    borderWidth: '1px',
                },
                '&:hover fieldset': {
                    borderColor: isDarkTheme ? 'rgba(255,255,255,0.2)' : '#90CDF4',
                },
                '&.Mui-focused fieldset': {
                    borderColor: '#3182CE',
                }
            },
            '& input::placeholder': {
                color: isDarkTheme ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                opacity: 0.7,
            }
        },

        // Preguntas rápidas
        quickQuestions: {
            position: 'absolute',
            top: '100%',
            right: 0,
            bgcolor: isDarkTheme ? '#2D3748' : '#ffffff',
            borderRadius: '10px',
            p: 1.5,
            mt: 1,
            minWidth: '250px',
            maxWidth: isMobile ? '300px' : '320px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            zIndex: 100,
        },

        // Botón de chat flotante
        chatButton: {
            position: 'fixed',
            bottom: isMobile ? '16px' : '32px',
            [position]: isMobile ? '16px' : '32px',
            zIndex: 1500,
            width: '60px',
            height: '60px',
            background: isDarkTheme
                ? 'linear-gradient(135deg, #2B6CB0 0%, #4299E1 100%)'
                : 'linear-gradient(45deg, #2B6CB0 0%, #4299E1 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(49, 130, 206, 0.4)',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            pointerEvents: 'auto',
            '&:hover': {
                transform: 'scale(1.05) translateY(-2px)',
                boxShadow: '0 6px 20px rgba(49, 130, 206, 0.6)',
            },
        },

        // Texto emergente del botón
        tooltipBox: {
            position: 'absolute',
            [position === 'right' ? 'right' : 'left']: '70px',
            bottom: '8px',
            backgroundColor: isDarkTheme ? '#2D3748' : '#ffffff',
            color: isDarkTheme ? '#E2E8F0' : '#2D3748',
            padding: '10px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            whiteSpace: 'normal',
            zIndex: 1501,
            border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            maxWidth: isMobile ? '200px' : '250px',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            '&::after': {
                content: '""',
                position: 'absolute',
                [position === 'right' ? 'right' : 'left']: '-6px',
                bottom: '50%',
                transform: 'translateY(50%)',
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                [position === 'right' ? 'borderLeft' : 'borderRight']: `6px solid ${isDarkTheme ? '#2D3748' : '#ffffff'}`
            }
        },

        // Botón de envío
        sendButton: {
            backgroundColor: '#3182CE',
            color: 'white',
            '&:hover': {
                backgroundColor: '#2B6CB0',
            },
            '&.Mui-disabled': {
                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            },
            width: 40,
            height: 40,
            borderRadius: '50%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            marginRight: '10px',
        }
    };

    // Contenido a renderizar en el portal
    const chatPortal = portalContainer && createPortal(
        <>
            {/* Ventana de chat */}
            {isOpen && (
                <Fade in={!isClosing} timeout={300}>
                    <Box sx={styles.container}>
                        <Paper sx={styles.chatWindow} elevation={6} ref={chatWindowRef}>
                            {/* Cabecera */}
                            <Box sx={styles.header}>
                                <Box sx={styles.headerTitle}>
                                    <Avatar sx={{ bgcolor: '#3182CE', width: 38, height: 38 }}>
                                        <SupportIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                            Asistente Dental
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                                            En línea | Tiempo de respuesta: &lt;1 min
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title="Preguntas frecuentes" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => setShowQuickQuestions(prev => !prev)}
                                            sx={{ color: 'inherit', mr: 1 }}
                                        >
                                            <LightbulbIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Configuración" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={togglePosition}
                                            sx={{ color: 'inherit', mr: 1 }}
                                        >
                                            <SettingsIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Cerrar chat" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={handleClose}
                                            sx={{ color: 'inherit' }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                {/* Menú de preguntas frecuentes */}
                                {showQuickQuestions && (
                                    <Grow in={showQuickQuestions}>
                                        <Paper sx={styles.quickQuestions} elevation={3}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ mb: 1, fontWeight: 600, color: isDarkTheme ? '#E2E8F0' : '#2D3748' }}
                                            >
                                                Preguntas frecuentes
                                            </Typography>

                                            {FAQ_QUESTIONS.map((question, index) => (
                                                <Box
                                                    key={index}
                                                    onClick={() => handleSelectQuestion(question)}
                                                    sx={{
                                                        p: 1.5,
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        mb: 1,
                                                        color: isDarkTheme ? '#E2E8F0' : '#2D3748',
                                                        bgcolor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(235,248,255,0.7)',
                                                        transition: 'all 0.2s ease',
                                                        border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(144,205,244,0.3)'}`,
                                                        '&:hover': {
                                                            bgcolor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#EBF8FF',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                                        },
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        '&::before': {
                                                            content: '"Q:"',
                                                            color: '#3182CE',
                                                            fontWeight: 'bold',
                                                            marginRight: '8px',
                                                            fontSize: '0.9rem',
                                                        }
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                                                        {question}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Paper>
                                    </Grow>
                                )}
                            </Box>

                            {/* Área de mensajes */}
                            <Box sx={styles.messageArea}>
                                {messages.map((msg, index) => (
                                    <Box
                                        key={index}
                                        sx={styles.messageContainer(msg.isUser)}
                                    >
                                        {!msg.isUser && (
                                            <Avatar sx={styles.avatar(msg.isUser)}>
                                                <BotIcon fontSize="small" />
                                            </Avatar>
                                        )}

                                        <Box sx={styles.message(msg.isUser)}>
                                            <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                                                {msg.text}
                                            </Typography>
                                        </Box>

                                        {msg.isUser && (
                                            <Avatar sx={styles.avatar(msg.isUser)}>
                                                <PersonIcon fontSize="small" />
                                            </Avatar>
                                        )}
                                    </Box>
                                ))}

                                {/* Indicador de "está escribiendo..." */}
                                {isTyping && (
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2, gap: 1 }}>
                                        <Avatar sx={styles.avatar(false)}>
                                            <BotIcon fontSize="small" />
                                        </Avatar>

                                        <Box sx={styles.typingIndicator}>
                                            <Box sx={styles.typingDot} />
                                            <Box sx={styles.typingDot} />
                                            <Box sx={styles.typingDot} />
                                        </Box>
                                    </Box>
                                )}

                                {/* Referencia para auto-scroll */}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Área de entrada de mensaje */}
                            <Box
                                component="form"
                                onSubmit={handleSendMessage}
                                sx={styles.inputArea}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escribe tu consulta dental..."
                                    variant="outlined"
                                    sx={styles.textField}
                                    inputRef={inputRef}
                                />

                                {/* Botón de enviar */}
                                <IconButton
                                    type="submit"
                                    disabled={!message.trim()}
                                    sx={styles.sendButton}
                                >
                                    <SendIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Paper>
                    </Box>
                </Fade>
            )}

            {/* Botón flotante de chat */}
            {!isOpen && (
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    overlap="circular"
                    sx={{
                        '& .MuiBadge-badge': {
                            fontSize: '0.8rem',
                            height: 22,
                            minWidth: 22,
                            top: 8,
                            right: 8,
                        }
                    }}
                >
                    <Box
                        sx={{
                            ...styles.chatButton,
                            animation: unreadCount > 0 ? `${pulse} 2s infinite` : 'none'
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        data-chat-button="true"
                    >
                        {showTooltip && !isOpen && (
                            <Box
                                sx={styles.tooltipBox}
                                key={currentTooltipIndex}
                            >
                                {TOOLTIP_MESSAGES[currentTooltipIndex]}
                            </Box>
                        )}
                        <IconButton
                            onClick={() => setIsOpen(true)}
                            sx={{
                                width: '100%',
                                height: '100%',
                                color: '#ffffff',
                                '&:hover': {
                                    bgcolor: 'transparent'
                                }
                            }}
                            data-chat-button="true"
                        >
                            <ChatIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    </Box>
                </Badge>
            )}
        </>,
        portalContainer
    );

    return chatPortal || null;
};

export default DentalChat;