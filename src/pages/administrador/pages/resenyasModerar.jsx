import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  Delete,
  CheckCircle,
  Cancel,
  ArrowBack,
  ArrowForward,
  Visibility,
  Search,
  FilterList,
  List as ListIcon,
  GridView,
  ViewList,
} from "@mui/icons-material";
import Notificaciones from '../../../components/Layout/Notificaciones';
import { useAuth } from '../../../components/Tools/AuthContext';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const ModeracionServicios = () => {
  const { user } = useAuth();
  const { isDarkTheme } = useThemeContext();
  
  // Estado para reseñas
  const [reviews, setReviews] = useState([]);
  const [selectedComment, setSelectedComment] = useState({ usuario: "", comentario: "" });
  
  // Estados para visualización y filtros
  const [viewMode, setViewMode] = useState('table'); // table, grid, detailed
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");

  // Estados para diálogos y notificaciones
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [dialogAction, setDialogAction] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  // Definición de colores
  const colors = {
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    paper: isDarkTheme ? '#243447' : '#ffffff',
    tableBackground: isDarkTheme ? '#1E2A3A' : '#e3f2fd',
    text: isDarkTheme ? '#FFFFFF' : '#333333',
    secondaryText: isDarkTheme ? '#E8F1FF' : '#666666',
    primary: isDarkTheme ? '#4B9FFF' : '#1976d2',
    hover: isDarkTheme ? 'rgba(75,159,255,0.15)' : 'rgba(25,118,210,0.1)',
    inputBorder: isDarkTheme ? '#4B9FFF' : '#1976d2',
    inputLabel: isDarkTheme ? '#E8F1FF' : '#666666',
    cardBackground: isDarkTheme ? '#1D2B3A' : '#F8FAFC',
    divider: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    titleColor: isDarkTheme ? '#4B9FFF' : '#0052A3'
  };

  // Cargar datos desde el backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          "https://back-end-4803.onrender.com/api/resenya/get"
        );
        if (!response.ok) {
          throw new Error("Error al obtener reseñas");
        }
        const data = await response.json();
  
        const mappedReviews = data.map((item) => ({
          id: item.reseñaId,
          usuario: `${item.nombre} ${item.aPaterno} ${item.aMaterno}`,
          comentario: item.comentario,
          estado: item.estado,
          calificacion: item.calificacion,
          fecha: item.fecha_creacion,
        }));
  
        setReviews(mappedReviews);
      }       catch (error) {
        console.error("Error al obtener reseñas:", error);
        showNotification("Error al obtener reseñas del servidor", "error");
      }
    };
  
    fetchReviews();
    const intervalId = setInterval(fetchReviews, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Función para mostrar notificaciones
  const showNotification = (message, type = "success") => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  // Manejadores para filtros
  const handleSearch = (event) => setSearch(event.target.value);
  const handleStatusFilter = (event) => setStatusFilter(event.target.value);
  const handleStarFilter = (event) => setStarFilter(event.target.value);
  
  // Manejador para cambio de vista
  const handleViewChange = (view) => {
    setViewMode(view);
  };

  // Abrir diálogo de comentario completo
  const handleOpenCommentDialog = (review) => {
    setSelectedComment({ 
      usuario: review.usuario, 
      comentario: review.comentario,
      calificacion: review.calificacion,
      estado: review.estado,
      fecha: review.fecha
    });
    setOpenCommentDialog(true);
  };

  // Abrir diálogo de confirmación
  const handleOpenDialog = (review, action) => {
    setSelectedReview(review);
    setDialogAction(
      action === "habilitar/deshabilitar"
        ? review.estado === "Habilitado"
          ? "deshabilitar"
          : "habilitar"
        : action
    );
    setOpenDialog(true);
  };

  // Realizar acción de habilitar/deshabilitar o eliminar
  const handleConfirmAction = async () => {
    if (dialogAction === "eliminar") {
      try {
        const response = await fetch(
          `https://back-end-4803.onrender.com/api/resenya/eliminar/${selectedReview.id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Error al eliminar la reseña");
        }
        
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== selectedReview.id)
        );
        showNotification(`Reseña de "${selectedReview.usuario}" eliminada.`, "success");
      } catch (error) {
        console.error(error);
        showNotification("Ocurrió un error al eliminar la reseña.", "error");
      }
    } else if (
      dialogAction === "habilitar" ||
      dialogAction === "deshabilitar"
    ) {
      const nuevoEstado =
        dialogAction === "habilitar" ? "Habilitado" : "Deshabilitado";
      try {
        const response = await fetch(
          `https://back-end-4803.onrender.com/api/resenya/estado/${selectedReview.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ estado: nuevoEstado }),
          }
        );
        if (!response.ok) {
          throw new Error("Error al actualizar estado de la reseña");
        }
        
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === selectedReview.id
              ? { ...review, estado: nuevoEstado }
              : review
          )
        );
        showNotification(
          `Reseña de "${selectedReview.usuario}" ${
            dialogAction === "habilitar" ? "habilitada" : "deshabilitada"
          }.`,
          "success"
        );
      } catch (error) {
        console.error(error);
        showNotification("Ocurrió un error al actualizar el estado.", "error");
      }
    }
    setOpenDialog(false);
  };

  // Filtrado de reseñas
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) =>
        review.usuario.toLowerCase().includes(search.toLowerCase())
      )
      .filter((review) =>
        statusFilter === "habilitados"
          ? review.estado === "Habilitado"
          : statusFilter === "deshabilitados"
          ? review.estado === "Deshabilitado"
          : true
      )
      .filter((review) =>
        starFilter === "all"
          ? true
          : review.calificacion === parseInt(starFilter)
      );
  }, [reviews, search, statusFilter, starFilter]);

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    const statusColors = {
      'Habilitado': {
        bg: '#E6F4EA',
        text: '#1B873F',
        border: '#A6E9B9'
      },
      'Deshabilitado': {
        bg: '#FEE2E2',
        text: '#DC2626',
        border: '#FECACA'
      },
      'Pendiente': {
        bg: '#FEF3C7',
        text: '#D97706',
        border: '#FDE68A'
      }
    };

    return statusColors[status] || {
      bg: '#F1F5F9',
      text: '#64748B',
      border: '#CBD5E1'
    };
  };

  // Renderizado de vista de tabla
  const renderTableView = () => {
    return (
      <TableContainer 
        component={Paper}
        sx={{
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          backgroundColor: colors.paper,
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: colors.tableBackground }}>
            <TableRow>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Comentario</TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Calificación</TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell align="center" sx={{ color: colors.text, fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.length > 0 ? (
              filteredReviews
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((review, index) => (
                  <TableRow 
                    key={review.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: colors.hover
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ color: colors.text }}>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell sx={{ color: colors.text }}>{review.usuario}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: "200px", display: "inline-block", color: colors.text }}>
                        {review.comentario.length > 25 ? `${review.comentario.slice(0, 25)}...` : review.comentario}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Rating value={review.calificacion} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={review.estado}
                        sx={{
                          backgroundColor: getStatusColor(review.estado).bg,
                          color: getStatusColor(review.estado).text,
                          border: `1px solid ${getStatusColor(review.estado).border}`,
                          fontWeight: '500',
                          fontSize: '0.75rem',
                          height: '24px',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Ver reseña">
                          <IconButton 
                            onClick={() => handleOpenCommentDialog(review)} 
                            sx={{
                              backgroundColor: colors.primary,
                              color: 'white',
                              padding: '6px',
                              borderRadius: '50%',
                              '&:hover': {
                                backgroundColor: colors.hover,
                                color: colors.primary
                              },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={review.estado === "Habilitado" ? "Deshabilitar reseña" : "Habilitar reseña"}>
                          <IconButton 
                            onClick={() => handleOpenDialog(review, "habilitar/deshabilitar")}
                            sx={{
                              backgroundColor: review.estado === "Habilitado" ? "#E6F4EA" : "#FEE2E2",
                              color: review.estado === "Habilitado" ? "#1B873F" : "#DC2626",
                              padding: '6px',
                              borderRadius: '50%',
                              '&:hover': {
                                backgroundColor: review.estado === "Habilitado" ? "rgba(27, 135, 63, 0.1)" : "rgba(220, 38, 38, 0.1)",
                              },
                            }}
                          >
                            {review.estado === "Habilitado" ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar reseña">
                          <IconButton 
                            onClick={() => handleOpenDialog(review, "eliminar")} 
                            sx={{
                              backgroundColor: "#FEE2E2",
                              color: "#DC2626",
                              padding: '6px',
                              borderRadius: '50%',
                              '&:hover': {
                                backgroundColor: "rgba(220, 38, 38, 0.1)",
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="h6" sx={{ color: "gray", py: 3 }}>
                    No hay reseñas disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Renderizado de vista de tarjetas
  const renderCardView = () => {
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {filteredReviews.length > 0 ? (
          filteredReviews
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((review) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={review.id}>
                <Card 
                  sx={{
                    height: '100%',
                    backgroundColor: colors.paper,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -10, 
                      right: 16,
                    }}
                  >
                    <Chip
                      label={review.estado}
                      sx={{
                        backgroundColor: getStatusColor(review.estado).bg,
                        color: getStatusColor(review.estado).text,
                        border: `1px solid ${getStatusColor(review.estado).border}`,
                        fontWeight: '500',
                        fontSize: '0.75rem',
                        height: '24px',
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ pt: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 70,
                          height: 70,
                          bgcolor: colors.primary,
                          fontSize: '1.5rem'
                        }}
                      >
                        {review.usuario.charAt(0)}
                      </Avatar>
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      align="center" 
                      sx={{ 
                        color: colors.text,
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {review.usuario}
                    </Typography>
                    
                    <Rating 
                      value={review.calificacion} 
                      readOnly 
                      sx={{ display: 'flex', justifyContent: 'center', my: 2 }}
                    />
                    
                    <Typography 
                      variant="body2" 
                      align="center" 
                      sx={{ 
                        color: colors.secondaryText,
                        height: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 2
                      }}
                    >
                      {review.comentario}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Tooltip title="Ver reseña">
                        <IconButton
                          onClick={() => handleOpenCommentDialog(review)}
                          sx={{
                            backgroundColor: colors.primary,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: colors.hover,
                              color: colors.primary
                            },
                            padding: '6px',
                            borderRadius: '50%',
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={review.estado === "Habilitado" ? "Deshabilitar reseña" : "Habilitar reseña"}>
                        <IconButton
                          onClick={() => handleOpenDialog(review, "habilitar/deshabilitar")}
                          sx={{
                            backgroundColor: review.estado === "Habilitado" ? "#E6F4EA" : "#FEE2E2",
                            color: review.estado === "Habilitado" ? "#1B873F" : "#DC2626",
                            padding: '6px',
                            borderRadius: '50%',
                            '&:hover': {
                              backgroundColor: review.estado === "Habilitado" ? "rgba(27, 135, 63, 0.1)" : "rgba(220, 38, 38, 0.1)",
                            },
                          }}
                        >
                          {review.estado === "Habilitado" ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar reseña">
                        <IconButton
                          onClick={() => handleOpenDialog(review, "eliminar")}
                          sx={{
                            backgroundColor: "#FEE2E2",
                            color: "#DC2626",
                            padding: '6px',
                            borderRadius: '50%',
                            '&:hover': {
                              backgroundColor: "rgba(220, 38, 38, 0.1)",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: "gray" }}>
                No hay reseñas disponibles
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };

  // Renderizado de vista detallada
  const renderDetailedView = () => {
    return (
      <Box sx={{ mt: 2 }}>
        {filteredReviews.length > 0 ? (
          filteredReviews
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((review) => (
              <Paper 
                key={review.id}
                sx={{ 
                  mb: 2, 
                  p: 3, 
                  backgroundColor: colors.paper,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: colors.primary,
                        mr: 2
                      }}
                    >
                      {review.usuario.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: colors.text, fontWeight: 'bold' }}>
                        {review.usuario}
                      </Typography>
                      <Chip
                        label={review.estado}
                        sx={{
                          backgroundColor: getStatusColor(review.estado).bg,
                          color: getStatusColor(review.estado).text,
                          border: `1px solid ${getStatusColor(review.estado).border}`,
                          fontWeight: '500',
                          fontSize: '0.75rem',
                          height: '24px',
                          mt: 1,
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                      {review.comentario.length > 150 
                        ? `${review.comentario.slice(0, 150)}...` 
                        : review.comentario}
                    </Typography>
                    <Rating value={review.calificacion} readOnly sx={{ mt: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver reseña">
                        <IconButton
                          onClick={() => handleOpenCommentDialog(review)}
                          sx={{
                            backgroundColor: colors.primary,
                            color: 'white',
                            padding: '8px',
                            borderRadius: '50%',
                            '&:hover': {
                              backgroundColor: colors.hover,
                              color: colors.primary
                            },
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={review.estado === "Habilitado" ? "Deshabilitar reseña" : "Habilitar reseña"}>
                        <IconButton
                          onClick={() => handleOpenDialog(review, "habilitar/deshabilitar")}
                          sx={{
                            backgroundColor: review.estado === "Habilitado" ? "#E6F4EA" : "#FEE2E2",
                            color: review.estado === "Habilitado" ? "#1B873F" : "#DC2626",
                            padding: '8px',
                            borderRadius: '50%',
                            '&:hover': {
                              backgroundColor: review.estado === "Habilitado" ? "rgba(27, 135, 63, 0.1)" : "rgba(220, 38, 38, 0.1)",
                            },
                          }}
                        >
                          {review.estado === "Habilitado" ? <CheckCircle /> : <Cancel />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar reseña">
                        <IconButton
                          onClick={() => handleOpenDialog(review, "eliminar")}
                          sx={{
                            backgroundColor: "#FEE2E2",
                            color: "#DC2626",
                            padding: '8px',
                            borderRadius: '50%',
                            '&:hover': {
                              backgroundColor: "rgba(220, 38, 38, 0.1)",
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: "gray" }}>
              No hay reseñas disponibles
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Card
      sx={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
        {/* Cabecera con título y selector de vista */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: colors.titleColor,
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            Gestión de Reseñas
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Vista de tabla">
              <IconButton 
                onClick={() => handleViewChange('table')}
                sx={{ 
                  color: viewMode === 'table' ? 'white' : colors.text,
                  backgroundColor: viewMode === 'table' ? colors.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: viewMode === 'table' ? colors.primary : colors.hover
                  }
                }}
              >
                <ListIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Vista de tarjetas">
              <IconButton 
                onClick={() => handleViewChange('grid')}
                sx={{ 
                  color: viewMode === 'grid' ? 'white' : colors.text,
                  backgroundColor: viewMode === 'grid' ? colors.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: viewMode === 'grid' ? colors.primary : colors.hover
                  }
                }}
              >
                <GridView />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Vista detallada">
              <IconButton 
                onClick={() => handleViewChange('detailed')}
                sx={{ 
                  color: viewMode === 'detailed' ? 'white' : colors.text,
                  backgroundColor: viewMode === 'detailed' ? colors.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: viewMode === 'detailed' ? colors.primary : colors.hover
                  }
                }}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filtros y Búsqueda */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Filtro de Búsqueda */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar por usuario"
              variant="outlined"
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: colors.paper,
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  color: colors.text,
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: colors.inputBorder,
                  },
                  '&:hover fieldset': {
                    borderColor: colors.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.inputLabel,
                },
              }}
            />
          </Grid>

          {/* Filtro por Estado */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por estado</InputLabel>
              <Select
                value={statusFilter}
                label="Filtrar por estado"
                onChange={handleStatusFilter}
                sx={{
                  backgroundColor: colors.paper,
                  color: colors.text,
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.inputBorder,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="habilitados">Habilitados</MenuItem>
                <MenuItem value="deshabilitados">Deshabilitados</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por Calificación */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.inputLabel }}>Filtrar por calificación</InputLabel>
              <Select
                value={starFilter}
                label="Filtrar por calificación"
                onChange={handleStarFilter}
                sx={{
                  backgroundColor: colors.paper,
                  color: colors.text,
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.inputBorder,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                }}
              >
                <MenuItem value="all">Todas</MenuItem>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <MenuItem key={stars} value={stars}>
                    {"★".repeat(stars) + "☆".repeat(5 - stars)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Información de resultados */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Typography sx={{ color: colors.secondaryText }}>
            {filteredReviews.length} {filteredReviews.length === 1 ? 'reseña' : 'reseñas'} encontradas
          </Typography>
        </Box>
        
        {/* Mostrar vista según la selección */}
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'grid' && renderCardView()}
        {viewMode === 'detailed' && renderDetailedView()}
        
        {/* Paginación */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: colors.primary, 
              color: "white", 
              mx: 1,
              '&:disabled': {
                backgroundColor: '#E0E0E0',
                color: '#A0A0A0'
              } 
            }}
            startIcon={<ArrowBack />}
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: colors.primary, 
              color: "white", 
              mx: 1,
              '&:disabled': {
                backgroundColor: '#E0E0E0',
                color: '#A0A0A0'
              } 
            }}
            endIcon={<ArrowForward />}
            disabled={(page + 1) * rowsPerPage >= filteredReviews.length}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </Box>

        {/* Diálogo para ver la reseña completa */}
        <Dialog 
          open={openCommentDialog} 
          onClose={() => setOpenCommentDialog(false)} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              borderRadius: '16px',
              boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{ 
            position: 'relative',
            backgroundColor: colors.tableBackground, 
            py: 3
          }}>
            <IconButton
              onClick={() => setOpenCommentDialog(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: colors.text
              }}
            >
              <Cancel />
            </IconButton>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: colors.primary,
                  mb: 1,
                  fontSize: '1.75rem'
                }}
              >
                {selectedComment.usuario ? selectedComment.usuario.charAt(0) : '?'}
              </Avatar>
              
              <Typography variant="h6" sx={{ 
                fontWeight: "bold",
                color: colors.titleColor,
              }}>
                {selectedComment.usuario}
              </Typography>
              
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Rating value={selectedComment.calificacion || 5} readOnly size="medium" />
              </Box>
            </Box>
          </Box>
          
          <DialogContent sx={{ px: 4, py: 3 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: "justify", 
                mb: 3,
                color: colors.text,
                lineHeight: 1.6,
                fontSize: '1rem'
              }}
            >
              {selectedComment.comentario}
            </Typography>
            
            <Divider sx={{ my: 2, backgroundColor: colors.divider }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: colors.secondaryText, fontSize: '0.875rem' }}>
                Fecha: {selectedComment.fecha ? new Date(selectedComment.fecha).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'No disponible'}
              </Typography>
              
              <Chip
                label={selectedComment.estado || "No disponible"}
                sx={{
                  backgroundColor: selectedComment.estado === "Habilitado" ? '#E6F4EA' : '#FEE2E2',
                  color: selectedComment.estado === "Habilitado" ? '#1B873F' : '#DC2626',
                  border: `1px solid ${selectedComment.estado === "Habilitado" ? '#A6E9B9' : '#FECACA'}`,
                  fontWeight: '500',
                  fontSize: '0.75rem',
                  height: '24px',
                }}
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
            <Button 
              onClick={() => setOpenCommentDialog(false)} 
              variant="contained"
              sx={{ 
                backgroundColor: colors.primary,
                borderRadius: '8px',
                px: 4,
                '&:hover': {
                  backgroundColor: isDarkTheme ? 'rgba(75,159,255,0.8)' : 'rgba(25,118,210,0.9)'
                }
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de confirmación para acciones */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: {
              backgroundColor: colors.paper,
              borderRadius: '16px',
              boxShadow: isDarkTheme ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              maxWidth: '450px',
              margin: 'auto'
            }
          }}
        >
          <Box sx={{ 
            backgroundColor: dialogAction === 'eliminar' 
              ? '#FEF2F2' 
              : dialogAction === 'habilitar'
                ? '#F0FDF4'
                : '#FEF3F2',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            py: 4,
            borderBottom: `1px solid ${colors.divider}`
          }}>
            <Avatar sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: dialogAction === 'eliminar' 
                ? '#DC2626' 
                : dialogAction === 'habilitar'
                  ? '#16A34A'
                  : '#DC2626',
              mb: 2
            }}>
              {dialogAction === 'eliminar' 
                ? <Delete /> 
                : dialogAction === 'habilitar'
                  ? <CheckCircle />
                  : <Cancel />
              }
            </Avatar>
            
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: dialogAction === 'eliminar' 
                ? '#991B1B' 
                : dialogAction === 'habilitar'
                  ? '#166534'
                  : '#991B1B',
              textAlign: 'center'
            }}>
              {dialogAction === 'eliminar' 
                ? 'Eliminar reseña' 
                : dialogAction === 'habilitar'
                  ? 'Habilitar reseña'
                  : 'Deshabilitar reseña'}
            </Typography>
          </Box>
          
          <DialogContent sx={{ p: 3 }}>
            <Typography sx={{ 
              color: colors.text, 
              fontSize: '1rem', 
              textAlign: 'center',
              mt: 1,
              mb: 2
            }}>
              {dialogAction === 'eliminar' 
                ? '¿Estás seguro que deseas eliminar permanentemente esta reseña?' 
                : dialogAction === 'habilitar'
                  ? '¿Deseas habilitar esta reseña para que sea visible?'
                  : '¿Deseas deshabilitar esta reseña para que no sea visible?'}
            </Typography>
            
            <Box sx={{ 
              backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', 
              p: 2, 
              borderRadius: '8px',
              mb: 2
            }}>
              <Typography sx={{ fontWeight: 'bold', color: colors.text, mb: 1 }}>
                Reseña de: {selectedReview?.usuario}
              </Typography>
              
              <Typography sx={{ 
                color: colors.secondaryText, 
                fontSize: '0.9rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                "{selectedReview?.comentario}"
              </Typography>
            </Box>
            
            {dialogAction === 'eliminar' && (
              <Typography sx={{ 
                color: '#DC2626', 
                fontSize: '0.875rem', 
                fontStyle: 'italic',
                textAlign: 'center',
                mt: 2
              }}>
                Esta acción no se puede deshacer
              </Typography>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              sx={{ 
                borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                color: colors.text,
                borderRadius: '8px',
                px: 3,
                '&:hover': {
                  borderColor: isDarkTheme ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmAction} 
              variant="contained"
              sx={{
                backgroundColor: dialogAction === 'eliminar' 
                  ? '#DC2626' 
                  : dialogAction === 'habilitar'
                    ? '#16A34A'
                    : '#DC2626',
                color: 'white',
                borderRadius: '8px',
                px: 3,
                '&:hover': {
                  backgroundColor: dialogAction === 'eliminar' 
                    ? '#B91C1C' 
                    : dialogAction === 'habilitar'
                      ? '#15803D'
                      : '#B91C1C'
                }
              }}
            >
              {dialogAction === 'eliminar' 
                ? 'Eliminar' 
                : dialogAction === 'habilitar'
                  ? 'Habilitar'
                  : 'Deshabilitar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Componente de notificaciones */}
        <Notificaciones
          open={notification.open}
          message={notification.message}
          type={notification.type}
          handleClose={() => setNotification({ ...notification, open: false })}
        />
      </Box>
    </Card>
  );
};

export default ModeracionServicios;