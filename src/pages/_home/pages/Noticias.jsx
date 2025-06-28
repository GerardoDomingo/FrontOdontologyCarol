import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Container, Typography, CardContent, CardMedia,
  Button, Chip, CircularProgress, Alert, IconButton,
  Grid, Paper, useMediaQuery, useTheme, Collapse, Fade,
  Card
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ShareIcon from '@mui/icons-material/Share';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LaunchIcon from '@mui/icons-material/Launch';
import FeedIcon from '@mui/icons-material/Feed';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import axios from 'axios';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';

// Componente para los iconos flotantes decorativos
const FloatingIcons = ({ isDarkTheme }) => {
  const icons = [
    { Icon: BookmarkIcon, top: '15%', left: '5%', delay: 0, size: 60, rotation: 15 },
    { Icon: NewspaperIcon, top: '70%', left: '8%', delay: 0.3, size: 70, rotation: -10 },
    { Icon: TipsAndUpdatesIcon, top: '20%', right: '7%', delay: 0.6, size: 65, rotation: 5 },
    { Icon: LocalOfferIcon, top: '75%', right: '5%', delay: 0.9, size: 55, rotation: -8 },
    { Icon: MedicalInformationIcon, top: '40%', left: '3%', delay: 1.2, size: 50, rotation: 12 },
    { Icon: FeedIcon, top: '50%', right: '4%', delay: 1.5, size: 45, rotation: -5 }
  ];

  return (
    <>
      {icons.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 0.2, 
            y: 0,
            rotate: item.rotation 
          }}
          transition={{ 
            delay: item.delay,
            duration: 0.8,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            zIndex: 0,
            color: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
            top: item.top,
            left: item.left,
            right: item.right,
          }}
        >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [item.rotation, item.rotation + 5, item.rotation]
            }}
            transition={{ 
              duration: 4 + index, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <item.Icon sx={{ fontSize: { xs: item.size * 0.7, md: item.size } }} />
          </motion.div>
        </motion.div>
      ))}
    </>
  );
};

// Funciones para calcular el tiempo de lectura basado en la longitud del texto
const calculateReadingTime = (text) => {
  // Palabras promedio por minuto para lectura en español
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes > 0 ? minutes : 1; // Mínimo 1 minuto
};

// Función para obtener color según categoría
const getCategoryColor = (category) => {
  const colorMap = {
    'Consejos': '#00ACC1', // Cian
    'Noticias': '#7E57C2', // Púrpura
    'Tratamientos': '#26A69A', // Verde azulado
    'Salud bucal': '#5C6BC0', // Índigo
    'Prevención': '#66BB6A', // Verde
    'Tecnología': '#42A5F5', // Azul
    'Nutrición': '#EC407A', // Rosa
    'Para niños': '#FFA726', // Naranja
    'Para adultos mayores': '#FF7043', // Naranja rojizo
    'Estética dental': '#AB47BC', // Púrpura
    'Emergencias': '#EF5350', // Rojo
  };
  
  // Si la categoría no está en el mapa, asignar un color aleatorio pero consistente
  if (!colorMap[category]) {
    // Crear un valor hash simple para la categoría
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generar colores predefinidos para categorías desconocidas
    const fallbackColors = [
      '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', 
      '#03A9F4', '#F44336', '#009688', '#673AB7'
    ];
    
    const index = Math.abs(hash % fallbackColors.length);
    return fallbackColors[index];
  }
  
  return colorMap[category];
};

// Componente para las tarjetas de noticias
const NewsCard = ({ article, index, colors, isDarkTheme, setNotification, animate = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  const handleShare = (url) => {
    navigator.clipboard.writeText(url);
    setNotification({
      open: true,
      message: '¡Enlace de la noticia copiado al portapapeles!',
      type: 'success',
    });
  };
  
  // Calcular tiempo de lectura real basado en la longitud del contenido
  const readingTime = calculateReadingTime(article.descripcion);
  
  // Obtener color de categoría
  const categoryColor = getCategoryColor(article.categoria || "Sin categoría");
  
  const cardVariants = {
    hidden: { 
      opacity: 0,
      x: index % 2 === 0 ? -50 : 50,
      y: 20
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 50,
        damping: 10,
        delay: index * 0.1
      }
    },
    exit: {
      opacity: 0,
      x: index % 2 === 0 ? -50 : 50,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    hover: {
      y: -10,
      boxShadow: "0px 12px 30px rgba(0,0,0,0.2)",
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const imageHeight = isMobile ? 180 : 220;
  
  return (
    <Grid item xs={12} sm={6} md={4} sx={{ mb: isMobile ? 2 : 4 }}>
      <motion.div
        variants={animate ? cardVariants : {}}
        initial={animate ? "hidden" : false}
        animate={animate ? "visible" : false}
        exit={animate ? "exit" : false}
        whileHover="hover"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ height: '100%' }}
      >
        <Card 
          elevation={isHovered ? 8 : 2}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            height: '100%',
            backgroundColor: colors.cardBackground,
            position: 'relative',
            transition: 'all 0.3s ease',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.08)' : 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '40%',
              background: `linear-gradient(to bottom, ${categoryColor}, transparent)`,
              borderTopLeftRadius: '8px',
            }
          }}
        >
          {/* Overlay de color en la imagen */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height={imageHeight}
              image={article.enlace_img || `/api/placeholder/400/300?text=Noticia+${index+1}`}
              alt={article.titulo}
              sx={{
                transition: 'all 0.5s ease',
                filter: isHovered ? 'brightness(1.05) contrast(1.05)' : 'brightness(0.9)',
                objectFit: 'cover',
              }}
            />
            
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `linear-gradient(to bottom, rgba(0,0,0,0.2), ${colors.cardBackground}CC)`,
                transition: 'opacity 0.3s ease',
                opacity: isHovered ? 0.7 : 0.85,
              }}
            />

            {/* Categoría y tiempo de lectura */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                label={article.categoria || "Sin categoría"}
                size="small"
                icon={<LocalOfferIcon fontSize="small" />}
                sx={{
                  backgroundColor: categoryColor,
                  color: '#ffffff',
                  backdropFilter: 'blur(5px)',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: '24px',
                  '& .MuiChip-icon': {
                    fontSize: '0.8rem'
                  }
                }}
              />
              <Chip
                icon={<AccessTimeIcon fontSize="small" />}
                label={`${readingTime} min`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#ffffff',
                  backdropFilter: 'blur(5px)',
                  fontSize: '0.7rem',
                  height: '24px',
                  '& .MuiChip-icon': {
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Box>
          </Box>

          <CardContent
            sx={{
              p: 3,
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? '200px' : '220px',
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: colors.primaryText,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {article.titulo}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: colors.secondaryText,
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                height: '4.5rem',
                flex: 1
              }}
            >
              {article.descripcion}
            </Typography>

            <Box sx={{ 
              mt: 'auto', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  href={article.enlace_inf}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<LaunchIcon />}
                  sx={{
                    px: 2,
                    py: 0.8,
                    borderRadius: '8px',
                    backgroundColor: categoryColor,
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    '&:hover': {
                      backgroundColor: isDarkTheme 
                        ? `${categoryColor}CC` 
                        : `${categoryColor}DD`,
                      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                    },
                    textTransform: 'none',
                  }}
                >
                  Leer artículo
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton
                  onClick={() => handleShare(article.enlace_inf)}
                  size="small"
                  sx={{
                    color: categoryColor,
                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
                    '&:hover': {
                      backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
                    }
                  }}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
              </motion.div>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

// Componente principal de Noticias
const Noticias = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkTheme } = useThemeContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info',
  });
  
  // Número de artículos por slide (3 como solicitaste)
  const articlesPerSlide = isMobile ? 1 : 3;

  const colors = {
    cardBackground: isDarkTheme ? '#0D1B2A' : '#ffffff',
    primaryText: isDarkTheme ? '#ffffff' : '#0A1929',
    secondaryText: isDarkTheme ? '#A0AEC0' : '#546E7A',
    primaryColor: isDarkTheme ? '#4FC3F7' : '#03427C',
    accentColor: isDarkTheme ? '#FF4081' : '#E91E63',
    background: isDarkTheme
      ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
      : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
    cardShadow: isDarkTheme ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(3, 66, 124, 0.1)',
  };

  const fetchNews = async () => {
    try {
      const response = await axios.get("https://back-end-4803.onrender.com/api/servicios/noticias");
      
      // Aleatorizar el orden de los artículos
      const shuffledArticles = [...response.data].sort(() => Math.random() - 0.5);
      
      setArticles(shuffledArticles);
      setError(null);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("No pudimos cargar las noticias. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const updateInterval = setInterval(fetchNews, 30 * 60 * 1000); // Actualizar cada 30 minutos
    return () => clearInterval(updateInterval);
  }, []);

  const handleNextSlide = useCallback(() => {
    if (articles.length <= articlesPerSlide) return;
    setCurrentSlide((prev) => (prev === Math.floor(articles.length / articlesPerSlide) * articlesPerSlide 
      ? 0 
      : Math.min(prev + articlesPerSlide, Math.floor(articles.length / articlesPerSlide) * articlesPerSlide)));
  }, [articles.length, articlesPerSlide]);

  const handlePrevSlide = useCallback(() => {
    if (articles.length <= articlesPerSlide) return;
    setCurrentSlide((prev) => (prev === 0 
      ? Math.floor(articles.length / articlesPerSlide) * articlesPerSlide 
      : Math.max(prev - articlesPerSlide, 0)));
  }, [articles.length, articlesPerSlide]);

  // Autoplay cada 5 segundos
  useEffect(() => {
    if (autoplay && articles.length > articlesPerSlide) {
      autoplayRef.current = setInterval(() => {
        handleNextSlide();
      }, 5000); // 5 segundos
    }
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, handleNextSlide, articles.length, articlesPerSlide]);

  // Pausar el autoplay cuando el mouse está sobre el carrusel
  const handleMouseEnter = () => {
    setAutoplay(false);
  };

  const handleMouseLeave = () => {
    setAutoplay(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: colors.background,
        }}
      >
        <Box
          sx={{
            animation: 'pulse 2s infinite ease-in-out',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 0.8
              },
              '50%': {
                transform: 'scale(1.2)',
                opacity: 1
              }
            }
          }}
        >
          <CircularProgress
            size={80}
            thickness={4}
            sx={{
              color: colors.primaryColor,
              filter: "drop-shadow(0 0 10px rgba(3, 66, 124, 0.3))",
            }}
          />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: colors.background,
          p: 3,
        }}
      >
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon fontSize="large" />}
          sx={{
            maxWidth: 600,
            width: "100%",
            p: 3,
            fontSize: "1.1rem",
            animation: "fadeIn 0.5s ease-in-out",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Calcular artículos visibles en el carrusel actual
  const visibleArticles = articles.slice(currentSlide, currentSlide + articlesPerSlide);
  
  // Si no hay suficientes artículos para la siguiente página, mostrar desde el inicio
  if (visibleArticles.length < articlesPerSlide) {
    visibleArticles.push(...articles.slice(0, articlesPerSlide - visibleArticles.length));
  }

  // Calcular el número total de slides
  const totalSlides = Math.ceil(articles.length / articlesPerSlide);
  const currentSlideIndex = Math.floor(currentSlide / articlesPerSlide);

  return (
    <Box
      sx={{
        minHeight: "90vh",
        background: colors.background,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background 0.3s ease-in-out",
        py: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Iconos flotantes decorativos */}
      <FloatingIcons isDarkTheme={isDarkTheme} />

      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 8,
            textAlign: "center",
            animation: 'fadeInDown 0.8s ease-out forwards',
            '@keyframes fadeInDown': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-50px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: colors.primaryColor,
              letterSpacing: 4,
              fontWeight: 600,
              display: "block",
              mb: 1,
            }}
          >
            MANTENTE INFORMADO
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: colors.primaryText,
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "3rem" },
              position: "relative",
              display: "inline-block",
              mb: 2,
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80px",
                height: "4px",
                backgroundColor: colors.primaryColor,
                borderRadius: "2px",
              },
            }}
          >
            Noticias y Consejos
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: colors.secondaryText,
              maxWidth: "800px",
              mx: "auto",
              mt: 3,
            }}
          >
            Descubre las últimas actualizaciones y recomendaciones para mantenerte al día
          </Typography>
        </Box>

        {/* Controles del carrusel */}
        {articles.length > articlesPerSlide && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mb: 4,
            }}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton
                onClick={handlePrevSlide}
                sx={{
                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
                  color: colors.primaryText,
                  '&:hover': {
                    backgroundColor: colors.primaryColor,
                    color: '#fff',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton
                onClick={handleNextSlide}
                sx={{
                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)',
                  color: colors.primaryText,
                  '&:hover': {
                    backgroundColor: colors.primaryColor,
                    color: '#fff',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </motion.div>
          </Box>
        )}

        {/* Carrusel con AnimatePresence para transiciones de entrada/salida */}
        <Box
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ overflow: 'hidden', position: 'relative', minHeight: isMobile ? '500px' : '550px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Grid
                container
                spacing={3}
                sx={{
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {visibleArticles.map((article, index) => (
                  <NewsCard
                    key={`${currentSlide}-${index}`}
                    article={article}
                    index={index}
                    colors={colors}
                    isDarkTheme={isDarkTheme}
                    setNotification={setNotification}
                  />
                ))}
              </Grid>
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Indicadores de slide (círculos) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 4
          }}
        >
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <Box
              key={idx}
              component="button"
              onClick={() => setCurrentSlide(idx * articlesPerSlide)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: currentSlideIndex === idx
                  ? colors.primaryColor
                  : isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: colors.primaryColor,
                  transform: 'scale(1.2)'
                }
              }}
            />
          ))}
        </Box>
        
        <Notificaciones
          open={notification.open}
          message={notification.message}
          type={notification.type}
          handleClose={() => setNotification({ ...notification, open: false })}
          autoHideDuration={5000}
        />
      </Container>

    </Box>
  );
};

export default Noticias;