import React, { useState, useCallback, useEffect } from 'react';
import { useThemeContext } from '../../../components/Tools/ThemeContext';
import Notificaciones from '../../../components/Layout/Notificaciones';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
// Material UI imports
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    CircularProgress,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Divider,
    LinearProgress,
    Collapse,
    Alert,
    Menu,
    MenuItem,
    InputAdornment,
    FormControl,
    FormControlLabel,
    Badge,
    Drawer,
    ListItemIcon,
    ListItemText,
    List,
    ListItem,
    Slider,
    AppBar,
    Toolbar,
    Radio,
    RadioGroup,
    ButtonGroup,
    Checkbox,
    alpha,
    useTheme,
    useMediaQuery
} from '@mui/material';

// Material UI Icons
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Image as ImageIcon,
    Search as SearchIcon,
    PhotoCamera as PhotoCameraIcon,
    FolderOpen as FolderOpenIcon,
    Upload as UploadIcon,
    GridView as GridViewIcon,
    ViewList as ViewListIcon,
    Close as CloseIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    SettingsBackupRestore as ResetIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Fullscreen as FullscreenIcon,
    ContentCopy as ContentCopyIcon,
    FilterAlt as FilterAltIcon
} from '@mui/icons-material';

// Constantes
const API_URL = 'https://back-end-4803.onrender.com';
const FTP_FOLDER = '/Imagenes';
const IMAGE_URL_BASE = 'https://odontologiacarol.com/Imagenes/';
const IMAGE_ERROR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlLW9mZiI+PGxpbmUgeDE9IjIiIHkxPSIyIiB4Mj0iMjIiIHkyPSIyMiIvPjxwYXRoIGQ9Ik0xMC41IDEwLjVsLTIgMkw1IDEwbC0yIDJWNWEyIDIgMCAwIDEgMi0yaDEwIi8+PHBhdGggZD0iTTE3LjIgNUgxOWEyIDIgMCAwIDEgMiAydjExLjRtLTEuNzIgMi42Yy0uMjcuMDgtLjU0LjItLjgzLjJINWEyIDIgMCAwIDEtMi0ydi0xMSIvPjxwYXRoIGQ9Ik0xOCAxMmExIDEgMCAxIDEtMi0xIi8+PC9zdmc+';

// Constantes para modos de visualización
const VIEW_MODES = {
    GRID: 'grid',
    LIST: 'list'
};

// Constantes para opciones de ordenamiento
const SORT_OPTIONS = {
    NAME_ASC: 'name_asc',
    NAME_DESC: 'name_desc',
    DATE_ASC: 'date_asc',
    DATE_DESC: 'date_desc',
    WITH_IMAGES_FIRST: 'with_images_first',
    WITHOUT_IMAGES_FIRST: 'without_images_first'
};

/**
 * Componente para gestión de imágenes
 */
const ImagenesGestion = () => {
    // Contexto de tema y responsive
    const { isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Estados para notificaciones
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: ''
    });

    // Estados para gestión de imágenes y servicios
    const [tabValue, setTabValue] = useState(2); // Empieza en "Subir Imágenes"
    const [uploading, setUploading] = useState(false);
    const [loadingServices, setLoadingServices] = useState(true);
    const [loadingImages, setLoadingImages] = useState(true);
    const [files, setFiles] = useState([]);
    const [services, setServices] = useState([]);
    const [servicesWithImages, setServicesWithImages] = useState(0);
    const [servicesWithoutImages, setServicesWithoutImages] = useState(0);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [resumen, setResumen] = useState({
        total: 0,
        con_imagen: 0,
        sin_imagen: 0
    });
    const [showTips, setShowTips] = useState(true);
    const [errorDetails, setErrorDetails] = useState(null);

    // Estados para mejoras de UX
    const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
    const [sortOption, setSortOption] = useState(SORT_OPTIONS.NAME_ASC);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [filterHasImages, setFilterHasImages] = useState('all'); // 'all', 'with', 'without'
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageSizeSlider, setImageSizeSlider] = useState(3); // 1-5 para tamaño de imagen en grid
    const [anchorElSortMenu, setAnchorElSortMenu] = useState(null);

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
        titleColor: isDarkTheme ? '#4B9FFF' : '#0052A3',
        error: '#E53935',
        warning: '#FFA726',
        success: '#4CAF50',
        info: '#03A9F4',
        purple: '#9C27B0'
    };

    // Función para mostrar notificaciones
    const showNotification = (message, type) => {
        setNotification({
            open: true,
            message,
            type
        });
    };

    // Función para manejar errores con detalles
    const handleError = (error, customMessage) => {
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        const errorDetails = {
            message: errorMessage,
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            time: new Date().toLocaleTimeString()
        };

        setErrorDetails(errorDetails);
        showNotification(`${customMessage}: ${errorMessage}`, 'error');
    };

    /**
     * Carga los datos del resumen desde la API
     */
    const fetchResumen = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/imagenes/resumen`);

            const data = {
                total: response.data.total || 0,
                con_imagen: response.data.con_imagen || 0,
                sin_imagen: response.data.sin_imagen || 0
            };

            setResumen(data);
            setServicesWithImages(data.con_imagen || 0);
            setServicesWithoutImages(data.sin_imagen || 0);
        } catch (error) {
            handleError(error, 'Error al cargar las estadísticas');
        }
    };

    /**
     * Carga los servicios (con y sin imágenes)
     */
    const fetchServices = async () => {
        setLoadingServices(true);

        try {
            // Obtener servicios con imágenes
            const servicesWithImagesResponse = await axios.get(`${API_URL}/api/imagenes/all`);

            // Obtener servicios sin imágenes
            const servicesWithoutImagesResponse = await axios.get(`${API_URL}/api/imagenes/pendientes`);

            // Extraer los datos del response de manera segura
            const servicesWithImages = servicesWithImagesResponse.data?.data || [];
            const servicesWithoutImages = servicesWithoutImagesResponse.data?.data || [];

            // Combinar resultados
            const allServices = [
                ...servicesWithImages,
                ...servicesWithoutImages
            ];

            // Extraer categorías únicas para los filtros
            const categories = [...new Set(allServices.map(service => service.category).filter(Boolean))];
            setAvailableCategories(categories);

            setServices(allServices);

            // Actualizar contadores
            setServicesWithImages(servicesWithImages.length || 0);
            setServicesWithoutImages(servicesWithoutImages.length || 0);

        } catch (error) {
            handleError(error, 'Error al cargar los servicios');
        } finally {
            setLoadingServices(false);
        }
    };

    /**
     * Carga las imágenes disponibles
     */
    const fetchImages = async () => {
        setLoadingImages(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/imagenes/ftp-list`);
            if (data.success && Array.isArray(data.files)) {
                // Transformar la respuesta a formato interno
                const fetchedImages = data.files.map(file => {
                    const fileName = file.name;
                    const rawSize = file.size || 0;
                    const rawDate = file.rawModifiedAt || null;
          
                    return {
                        id: fileName,
                        name: fileName,
                        url: `${IMAGE_URL_BASE}${fileName}`,
                        created_at: rawDate
                            ? new Date(rawDate).toISOString().split('T')[0]
                            : 'Desconocido',
                        size: rawSize
                            ? formatFileSize(rawSize) 
                            : 'Desconocido',
                        format: fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
                    };
                });
          
                setImages(fetchedImages);
            } else {
                setImages([]);
            }
        } catch (error) {
            console.error('Error al listar imágenes:', error);
            setImages([]);
        } finally {
            setLoadingImages(false);
        }
    };

    /**
     * Inicialización del componente
     */
    useEffect(() => {
        fetchResumen();
        fetchServices();
        fetchImages();

        return () => {
            // Cleanup
        };
    }, []);

    /**
     * Maneja el cambio de pestaña
     */
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    /**
     * Configura el dropzone para la carga de archivos
     */
    const onDrop = useCallback(acceptedFiles => {
        // Filtrar solo archivos de imagen
        const imageFiles = acceptedFiles.filter(file =>
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            showNotification('Solo se permiten archivos de imagen', 'error');
            return;
        }

        // Validar tamaño máximo (5MB para evitar problemas con FTP)
        const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            showNotification('Algunas imágenes exceden el tamaño máximo de 5MB', 'error');
            return;
        }

        // Crear previsualizaciones
        const newFiles = imageFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));

        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }, []);

    // Configuración del dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        },
        maxSize: 5 * 1024 * 1024 // 5MB
    });

    /**
     * Sube las imágenes al servidor FTP
     */
    const uploadImages = async () => {
        if (files.length === 0) {
            showNotification('No hay imágenes para subir', 'warning');
            return;
        }

        setUploading(true);

        try {
            const uploadedImages = [];
            const errores = [];

            for (const file of files) {
                try {
                    // Crear FormData para la subida
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('filename', file.name);

                    // Enviar la imagen al servidor
                    const response = await axios.post(`${API_URL}/api/imagenes/upload-ftp`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        timeout: 60000 // 1 minuto
                    });

                    if (response.data.success) {
                        const cleanFileName = file.name.replace(/\s+/g, '_').replace(/[^\w\d.-]/g, '');

                        uploadedImages.push({
                            id: file.name,
                            name: file.name,
                            url: `${IMAGE_URL_BASE}${cleanFileName}`,
                            created_at: new Date().toISOString().split('T')[0],
                            size: formatFileSize(file.size),
                            format: getFileExtension(file.name)
                        });
                    } else {
                        throw new Error(response.data.message || 'Error al subir la imagen');
                    }
                } catch (fileError) {
                    errores.push(`${file.name}: ${fileError.response?.data?.message || fileError.message}`);
                }
            }

            if (uploadedImages.length > 0) {
                // Actualizamos la lista de imágenes
                setImages(prev => [...uploadedImages, ...prev]);

                // Limpiamos los archivos subidos
                setFiles([]);

                const successMessage = `${uploadedImages.length} de ${files.length} imagen(es) subida(s) correctamente${errores.length > 0 ? ' (con algunos errores)' : ''}`;

                showNotification(
                    successMessage,
                    errores.length > 0 ? 'warning' : 'success'
                );

                // Refrescar los datos
                fetchResumen();
                fetchImages();
            } else {
                const errorMessage = `No se pudieron subir las imágenes: ${errores.join('; ')}`;
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            handleError(error, 'Error al subir imágenes');
        } finally {
            setUploading(false);
        }
    };

    /**
     * Elimina un archivo de la lista de archivos a subir
     */
    const removeFile = (index) => {
        const newFiles = [...files];
        URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    /**
     * Abre el diálogo para asignar una imagen a un servicio
     */
    const openAssignDialog = (service) => {
        setSelectedService(service);
        setIsAssignDialogOpen(true);
    };

    /**
     * Abre el diálogo para confirmar la eliminación de una imagen
     */
    const openDeleteDialog = (image) => {
        setSelectedImage(image);
        setIsDeleteDialogOpen(true);
    };

    /**
     * Abre el visor de imagen
     */
    const openImagePreview = (image) => {
        setPreviewImage(image);
        setImagePreviewOpen(true);
    };

    /**
     * Asigna una imagen a un servicio
     */
    const assignImageToService = async (image) => {
        if (!selectedService || !image) return;

        try {
            const response = await axios.post(`${API_URL}/api/imagenes/asignar/${selectedService.id}`, {
                imageUrl: image.url,
                name: image.name
            });

            if (response.data) {
                // Actualizar el estado local
                const updatedServices = services.map(service =>
                    service.id === selectedService.id
                        ? {
                            ...service,
                            image_url: image.url,
                            image_name: image.name
                        }
                        : service
                );

                setServices(updatedServices);

                // Actualizar contadores
                fetchResumen();

                showNotification(`Imagen asignada a ${selectedService.title}`, 'success');
            }
        } catch (error) {
            handleError(error, 'Error al asignar la imagen');
        } finally {
            setIsAssignDialogOpen(false);
            setSelectedService(null);
        }
    };

    /**
     * Elimina una imagen del servidor FTP
     */
    const deleteImage = async () => {
        if (!selectedImage) return;

        try {
            const response = await axios.delete(`${API_URL}/api/imagenes/eliminar-ftp`, {
                data: { filename: selectedImage.name }
            });

            if (response.data.success) {
                // Eliminar de la lista local
                setImages(prev => prev.filter(img => img.name !== selectedImage.name));

                // Actualizar servicios que usaban esta imagen
                const updatedServices = services.map(service =>
                    service.image_url === selectedImage.url
                        ? { ...service, image_url: null, image_name: null }
                        : service
                );

                setServices(updatedServices);

                // Actualizar contadores
                fetchResumen();

                showNotification('Imagen eliminada correctamente', 'success');
            } else {
                throw new Error(response.data.message || 'Error al eliminar imagen');
            }
        } catch (error) {
            handleError(error, 'Error al eliminar la imagen');
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedImage(null);
        }
    };

    /**
     * Remueve la imagen asignada a un servicio
     */
    const removeImageFromService = async (service) => {
        try {
            const response = await axios.delete(`${API_URL}/api/imagenes/remover/${service.id}`);

            if (response.data) {
                // Actualizar el estado local
                const updatedServices = services.map(s =>
                    s.id === service.id ? { ...s, image_url: null, image_name: null } : s
                );

                setServices(updatedServices);

                // Actualizar contadores
                fetchResumen();

                showNotification(`Imagen removida de ${service.title}`, 'success');
            }
        } catch (error) {
            handleError(error, 'Error al remover la imagen');
        }
    };

    // Utilidades para formateo de archivos
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileExtension = (filename) => {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    };

    // Funciones de filtrado y ordenación
    const getSortedAndFilteredServices = () => {
        let filteredServices = [...services];

        // Filtrar por búsqueda
        if (searchQuery) {
            filteredServices = filteredServices.filter(service => 
                service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.image_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrar por categorías seleccionadas
        if (selectedCategories.length > 0) {
            filteredServices = filteredServices.filter(service => 
                service.category && selectedCategories.includes(service.category)
            );
        }

        // Filtrar por estado de imagen
        if (filterHasImages === 'with') {
            filteredServices = filteredServices.filter(service => service.image_url);
        } else if (filterHasImages === 'without') {
            filteredServices = filteredServices.filter(service => !service.image_url);
        }

        // Ordenar según la opción seleccionada
        switch(sortOption) {
            case SORT_OPTIONS.NAME_ASC:
                filteredServices.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case SORT_OPTIONS.NAME_DESC:
                filteredServices.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
                break;
            case SORT_OPTIONS.WITH_IMAGES_FIRST:
                filteredServices.sort((a, b) => {
                    if (!!a.image_url === !!b.image_url) {
                        return (a.title || '').localeCompare(b.title || '');
                    }
                    return a.image_url ? -1 : 1;
                });
                break;
            case SORT_OPTIONS.WITHOUT_IMAGES_FIRST:
                filteredServices.sort((a, b) => {
                    if (!!a.image_url === !!b.image_url) {
                        return (a.title || '').localeCompare(b.title || '');
                    }
                    return a.image_url ? 1 : -1;
                });
                break;
            default:
                filteredServices.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        return filteredServices;
    };

    const getSortedAndFilteredImages = () => {
        let filteredImages = [...images];

        // Filtrar por búsqueda
        if (searchQuery) {
            filteredImages = filteredImages.filter(image => 
                image.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Ordenar según la opción seleccionada
        switch(sortOption) {
            case SORT_OPTIONS.NAME_ASC:
                filteredImages.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case SORT_OPTIONS.NAME_DESC:
                filteredImages.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            case SORT_OPTIONS.DATE_ASC:
                filteredImages.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
                break;
            case SORT_OPTIONS.DATE_DESC:
                filteredImages.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
                break;
            default:
                filteredImages.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        return filteredImages;
    };

    // Gestión de categorías seleccionadas
    const handleCategoryChange = (category) => {
        const currentIndex = selectedCategories.indexOf(category);
        const newSelectedCategories = [...selectedCategories];

        if (currentIndex === -1) {
            newSelectedCategories.push(category);
        } else {
            newSelectedCategories.splice(currentIndex, 1);
        }

        setSelectedCategories(newSelectedCategories);
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSelectedCategories([]);
        setFilterHasImages('all');
        setSearchQuery('');
    };

    // Limpiar las URLs de previsualización al desmontar el componente
    useEffect(() => {
        return () => {
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);

    // Estilos para el dropzone
    const dropzoneStyle = {
        border: `2px dashed ${isDarkTheme ? '#555' : '#ccc'}`,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive
            ? (isDarkTheme ? 'rgba(30, 144, 255, 0.2)' : 'rgba(30, 144, 255, 0.1)')
            : isDarkTheme ? 'rgba(30, 144, 255, 0.05)' : 'rgba(200, 200, 200, 0.1)',
        transition: 'all 0.3s ease',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    };

    // Función para refrescar todos los datos
    const refreshAllData = () => {
        fetchResumen();
        fetchServices();
        fetchImages();
        showNotification('Datos actualizados correctamente', 'success');
    };

    // Calcular porcentaje de servicios con imágenes
    const porcentajeCompletado = resumen.total > 0
        ? Math.round((resumen.con_imagen / resumen.total) * 100)
        : 0;

    // Determinar el tamaño de imagen para la vista de grid
    const getImageGridSize = () => {
        const baseSize = 12; // Tamaño base en divisiones de grid
        
        // Tamaños para escritorio (de menor a mayor)
        if (!isMediumScreen) {
            switch(imageSizeSlider) {
                case 1: return 3; // 4 por fila
                case 2: return 4; // 3 por fila
                case 3: return 6; // 2 por fila (default)
                case 4: return 8; // 1.5 por fila
                case 5: return 12; // 1 por fila
                default: return 6;
            }
        }
        
        // Tamaños para tablets
        if (!isMobile) {
            switch(imageSizeSlider) {
                case 1: return 4; // 3 por fila
                case 2: return 6; // 2 por fila
                case 3: return 8; // 1.5 por fila
                case 4: return 12; // 1 por fila
                case 5: return 12; // 1 por fila
                default: return 8;
            }
        }
        
        // Tamaños para móviles
        switch(imageSizeSlider) {
            case 1: return 6; // 2 por fila
            case 2: return 12; // 1 por fila
            case 3: return 12; // 1 por fila
            case 4: return 12; // 1 por fila
            case 5: return 12; // 1 por fila
            default: return 12;
        }
    };

    // Obtener servicios e imágenes filtrados
    const filteredServices = getSortedAndFilteredServices();
    const filteredImages = getSortedAndFilteredImages();

    return (
        <Card
            sx={{
                minHeight: '100vh',
                backgroundColor: colors.background,
                borderRadius: '16px',
                boxShadow: isDarkTheme ?
                    '0 2px 12px rgba(0,0,0,0.3)' :
                    '0 2px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease'
            }}
        >
            <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
                {/* Cabecera */}
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
                            fontFamily: 'Roboto, sans-serif',
                            display: 'flex', 
                            alignItems: 'center'
                        }}
                    >
                        <ImageIcon sx={{ mr: 1.5 }} />
                        Gestión de Imágenes
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Vista de tabla">
                            <IconButton 
                                onClick={() => setViewMode(VIEW_MODES.LIST)}
                                sx={{ 
                                    color: viewMode === VIEW_MODES.LIST ? 'white' : colors.text,
                                    backgroundColor: viewMode === VIEW_MODES.LIST ? colors.primary : 'transparent',
                                    '&:hover': {
                                        backgroundColor: viewMode === VIEW_MODES.LIST ? colors.primary : colors.hover
                                    }
                                }}
                            >
                                <ViewListIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Vista de cuadrícula">
                            <IconButton 
                                onClick={() => setViewMode(VIEW_MODES.GRID)}
                                sx={{ 
                                    color: viewMode === VIEW_MODES.GRID ? 'white' : colors.text,
                                    backgroundColor: viewMode === VIEW_MODES.GRID ? colors.primary : 'transparent',
                                    '&:hover': {
                                        backgroundColor: viewMode === VIEW_MODES.GRID ? colors.primary : colors.hover
                                    }
                                }}
                            >
                                <GridViewIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Refrescar datos">
                            <IconButton 
                                onClick={refreshAllData}
                                sx={{ 
                                    color: colors.text,
                                    '&:hover': {
                                        backgroundColor: colors.hover
                                    }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Tips para nuevos usuarios */}
                <Collapse in={showTips}>
                    <Alert
                        severity="info"
                        sx={{ mb: 3 }}
                        action={
                            <IconButton size="small" onClick={() => setShowTips(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                    >
                        <Typography variant="subtitle2">Consejos:</Typography>
                        <Typography variant="body2">• Tamaño máximo recomendado: 5MB por imagen</Typography>
                        <Typography variant="body2">• Formatos soportados: JPG, PNG, GIF y WebP</Typography>
                    </Alert>
                </Collapse>

                {/* Progreso de asignación */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">
                            Progreso de asignación de imágenes
                        </Typography>
                        <Typography variant="subtitle2" color="primary">
                            {porcentajeCompletado}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={porcentajeCompletado}
                        sx={{ height: 10, borderRadius: 5 }}
                    />

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <Card
                                variant="outlined"
                                sx={{
                                    backgroundColor: colors.paper,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 1 }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ImageIcon sx={{ color: colors.secondaryText, fontSize: 36, mr: 1.5 }} />
                                        <Box>
                                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: colors.text }}>
                                                {resumen.total}
                                            </Typography>
                                            <Typography color={colors.secondaryText} variant="body2">
                                                Servicios Totales
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card
                                variant="outlined"
                                sx={{
                                    backgroundColor: colors.paper,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 1 }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleIcon color="success" sx={{ fontSize: 36, mr: 1.5 }} />
                                        <Box>
                                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: colors.success }}>
                                                {resumen.con_imagen}
                                            </Typography>
                                            <Typography color={colors.secondaryText} variant="body2">
                                                Con Imágenes
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card
                                variant="outlined"
                                sx={{
                                    backgroundColor: colors.paper,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 1 }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CancelIcon color="error" sx={{ fontSize: 36, mr: 1.5 }} />
                                        <Box>
                                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: colors.error }}>
                                                {resumen.sin_imagen}
                                            </Typography>
                                            <Typography color={colors.secondaryText} variant="body2">
                                                Sin Imágenes
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Barra de búsqueda y filtros */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Búsqueda */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Buscar imagen o servicio"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
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

                    {/* Filtros */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterAltIcon />}
                                onClick={() => setIsFilterDrawerOpen(true)}
                                sx={{ 
                                    color: colors.primary, 
                                    borderColor: colors.primary,
                                    '&:hover': {
                                        borderColor: colors.primary,
                                        backgroundColor: colors.hover
                                    }
                                }}
                            >
                                {selectedCategories.length > 0 || filterHasImages !== 'all' ? (
                                    <Badge color="error" variant="dot" sx={{ mr: 0.5 }}>
                                        Filtros
                                    </Badge>
                                ) : (
                                    "Filtros"
                                )}
                            </Button>
                            
                            <Button
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => setTabValue(2)}
                                sx={{ 
                                    backgroundColor: colors.primary,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.primary, 0.8)
                                    }
                                }}
                            >
                                Subir Imágenes
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Pestañas */}
                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 3,
                    backgroundColor: colors.paper,
                    borderRadius: '8px 8px 0 0',
                    overflow: 'hidden'
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="image management tabs"
                        variant={isMobile ? "fullWidth" : "standard"}
                        sx={{
                            '& .MuiTab-root': {
                                color: colors.secondaryText,
                                '&.Mui-selected': {
                                    color: colors.primary
                                }
                            }
                        }}
                    >
                        <Tab
                            label="Subir Imágenes"
                            icon={<UploadIcon />}
                            iconPosition="start"
                            sx={{ minHeight: 48, py: 1 }}
                        />
                        <Tab
                            label="Imágenes"
                            icon={<ImageIcon />}
                            iconPosition="start"
                            sx={{ minHeight: 48, py: 1 }}
                        />
                        <Tab
                            label="Servicios"
                            icon={<FolderOpenIcon />}
                            iconPosition="start"
                            sx={{ minHeight: 48, py: 1 }}
                        />
                    </Tabs>
                </Box>

                {/* Panel de Subir Imágenes */}
                {tabValue === 0 && (
                    <Box sx={{ backgroundColor: colors.paper, p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, color: colors.text }}>
                            <CloudUploadIcon sx={{ mr: 1 }} /> Subir nuevas imágenes al servidor
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        {/* Dropzone */}
                        <Box
                            {...getRootProps()}
                            style={dropzoneStyle}
                            sx={{
                                mb: 3,
                                '&:hover': {
                                    borderColor: colors.primary,
                                }
                            }}
                        >
                            <input {...getInputProps()} />
                            <CloudUploadIcon sx={{ fontSize: 48, color: colors.primary, mb: 1.5, opacity: 0.8 }} />
                            {isDragActive ? (
                                <Typography variant="body1" color="primary" sx={{ fontWeight: 500 }}>
                                    ¡Suelta tus imágenes aquí!
                                </Typography>
                            ) : (
                                <>
                                    <Typography variant="body1" sx={{ mb: 1, color: colors.text }}>
                                        Arrastra y suelta imágenes aquí, o haz clic para seleccionarlas
                                    </Typography>
                                    <Typography variant="caption" color={colors.secondaryText}>
                                        Máximo 5MB por imagen • JPG, PNG, GIF, WebP
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {/* Previsualización de archivos */}
                        {files.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        mb: 3,
                                        backgroundColor: colors.paper,
                                        borderRadius: 2
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', color: colors.text }}>
                                            <ImageIcon fontSize="small" sx={{ mr: 1 }} />
                                            Imágenes seleccionadas ({files.length})
                                        </Typography>
                                        
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => {
                                                files.forEach(file => {
                                                    if (file.preview) URL.revokeObjectURL(file.preview);
                                                });
                                                setFiles([]);
                                            }}
                                            color="error"
                                        >
                                            Limpiar todo
                                        </Button>
                                    </Box>
                                    
                                    <Grid container spacing={1.5}>
                                        {files.map((file, index) => (
                                            <Grid item xs={6} sm={3} md={2} key={index}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Box
                                                        sx={{
                                                            height: '120px',
                                                            width: '100%',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            boxShadow: 1
                                                        }}
                                                    >
                                                        <img
                                                            src={file.preview}
                                                            alt={`preview-${index}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: -8,
                                                            backgroundColor: colors.paper,
                                                            boxShadow: 2,
                                                            '&:hover': { bgcolor: colors.error, color: 'white' }
                                                        }}
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            mt: 0.5,
                                                            textAlign: 'center',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            color: colors.text
                                                        }}
                                                    >
                                                        {file.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color={colors.secondaryText}
                                                        sx={{
                                                            display: 'block',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {formatFileSize(file.size)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>

                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                        onClick={uploadImages}
                                        disabled={files.length === 0 || uploading}
                                        size="large"
                                        sx={{ px: 4 }}
                                    >
                                        {uploading ? 'Subiendo...' : 'Subir imágenes'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Panel de Imágenes */}
                {tabValue === 1 && (
                    <Box>
                        {loadingImages ? (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress sx={{ mb: 3 }} />
                                <Grid container spacing={2}>
                                    {[...Array(8)].map((_, i) => (
                                        <Grid item xs={6} sm={4} md={3} key={i}>
                                            <Paper 
                                                sx={{ 
                                                    p: 1, 
                                                    borderRadius: 2,
                                                    backgroundColor: colors.paper 
                                                }}
                                            >
                                                <Box 
                                                    sx={{ 
                                                        height: 140, 
                                                        width: '100%', 
                                                        bgcolor: alpha(colors.secondaryText, 0.1),
                                                        borderRadius: 1,
                                                        mb: 1
                                                    }} 
                                                />
                                                <Box 
                                                    sx={{ 
                                                        height: 20, 
                                                        width: '80%', 
                                                        bgcolor: alpha(colors.secondaryText, 0.1),
                                                        borderRadius: 0.5,
                                                        mb: 1
                                                    }} 
                                                />
                                                <Box 
                                                    sx={{ 
                                                        height: 16, 
                                                        width: '60%', 
                                                        bgcolor: alpha(colors.secondaryText, 0.1),
                                                        borderRadius: 0.5
                                                    }} 
                                                />
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ) : filteredImages.length === 0 ? (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: colors.paper,
                                    borderRadius: 2
                                }}
                            >
                                <SearchIcon sx={{ fontSize: 60, mb: 2, color: alpha(colors.secondaryText, 0.7) }} />
                                <Typography variant="h6" color={colors.text} gutterBottom>
                                    No se encontraron imágenes
                                </Typography>
                                <Typography variant="body2" color={colors.secondaryText} paragraph>
                                    Intenta con otros términos de búsqueda o sube nuevas imágenes
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    startIcon={<CloudUploadIcon />} 
                                    onClick={() => setTabValue(0)}
                                    color="primary"
                                >
                                    Subir Imágenes
                                </Button>
                            </Box>
                        ) : viewMode === VIEW_MODES.GRID ? (
                            // Vista de Grid para imágenes
                            <Box sx={{ backgroundColor: colors.paper, p: 3, borderRadius: 2 }}>
                                {/* Slider para tamaño de imagen */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <ZoomOutIcon fontSize="small" sx={{ mr: 1, color: colors.secondaryText }} />
                                    <Slider
                                        value={imageSizeSlider}
                                        onChange={(e, value) => setImageSizeSlider(value)}
                                        min={1}
                                        max={5}
                                        step={1}
                                        size="small"
                                        sx={{ maxWidth: '160px', mr: 1, color: colors.primary }}
                                    />
                                    <ZoomInIcon fontSize="small" sx={{ color: colors.secondaryText }} />
                                </Box>
                                
                                <Grid container spacing={2}>
                                    {filteredImages.map((image) => {
                                        const gridSize = getImageGridSize();
                                        
                                        return (
                                            <Grid item xs={12} sm={gridSize} md={gridSize} key={image.id}>
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        backgroundColor: colors.paper,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-5px)',
                                                            boxShadow: 3
                                                        }
                                                    }}
                                                >
                                                    <CardMedia
                                                        component="img"
                                                        height="180"
                                                        image={image.url}
                                                        alt={image.name}
                                                        sx={{
                                                            objectFit: 'cover',
                                                            bgcolor: alpha(colors.secondaryText, 0.1),
                                                            cursor: 'pointer'
                                                        }}
                                                        loading="lazy"
                                                        onClick={() => openImagePreview(image)}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                                        }}
                                                    />
                                                    <CardContent sx={{ p: 1.5, pb: 0 }}>
                                                        <Tooltip title={image.name}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                noWrap
                                                                sx={{ fontWeight: 500, color: colors.text }}
                                                            >
                                                                {image.name}
                                                            </Typography>
                                                        </Tooltip>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                            <Typography variant="caption" color={colors.secondaryText}>
                                                                {image.size || 'Desconocido'}
                                                            </Typography>
                                                            <Typography variant="caption" color={colors.secondaryText}>
                                                                {image.created_at}
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                    <CardActions sx={{ p: 1 }}>
                                                        <Tooltip title="Ver imagen">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => openImagePreview(image)}
                                                                color="primary"
                                                            >
                                                                <ZoomInIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Copiar URL">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(image.url);
                                                                    showNotification('URL copiada al portapapeles', 'success');
                                                                }}
                                                            >
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Box sx={{ flexGrow: 1 }} />
                                                        <Button
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => {
                                                                if (selectedService) {
                                                                    assignImageToService(image);
                                                                } else {
                                                                    setSelectedImage(image);
                                                                    setTabValue(2);
                                                                    setSearchQuery('');
                                                                    showNotification('Seleccione un servicio para asignar esta imagen', 'info');
                                                                }
                                                            }}
                                                        >
                                                            Asignar
                                                        </Button>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => openDeleteDialog(image)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        ) : (
                            // Vista de Lista para imágenes
                            <TableContainer 
                                component={Paper} 
                                variant="outlined" 
                                sx={{ 
                                    borderRadius: 2,
                                    backgroundColor: colors.paper,
                                    boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <Table>
                                    <TableHead sx={{ backgroundColor: colors.tableBackground }}>
                                        <TableRow>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Vista previa</TableCell>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Nombre</TableCell>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Tamaño</TableCell>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Fecha</TableCell>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredImages.map((image) => (
                                            <TableRow 
                                                key={image.id} 
                                                hover 
                                                sx={{ 
                                                    '&:hover': { 
                                                        backgroundColor: colors.hover 
                                                    } 
                                                }}
                                            >
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            width: '60px',
                                                            height: '40px',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => openImagePreview(image)}
                                                    >
                                                        <img
                                                            src={image.url}
                                                            alt={image.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                                            }}
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color={colors.text}>{image.name}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color={colors.text}>{image.size || 'Desconocido'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color={colors.text}>{image.created_at}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Ver imagen">
                                                            <IconButton 
                                                                size="small" 
                                                                color="primary" 
                                                                onClick={() => openImagePreview(image)}
                                                            >
                                                                <ZoomInIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Asignar">
                                                            <IconButton 
                                                                size="small" 
                                                                color="primary"
                                                                onClick={() => {
                                                                    if (selectedService) {
                                                                        assignImageToService(image);
                                                                    } else {
                                                                        setSelectedImage(image);
                                                                        setTabValue(2);
                                                                        setSearchQuery('');
                                                                        showNotification('Seleccione un servicio para asignar esta imagen', 'info');
                                                                    }
                                                                }}
                                                            >
                                                                <PhotoCameraIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar">
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => openDeleteDialog(image)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}

                {/* Panel de Servicios */}
                {tabValue === 2 && (
                    <Box>
                        {loadingServices ? (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {[...Array(3)].map((_, i) => (
                                        <Grid item xs={12} key={i}>
                                            <Box 
                                                sx={{ 
                                                    height: 60, 
                                                    width: '100%', 
                                                    bgcolor: alpha(colors.secondaryText, 0.1),
                                                    borderRadius: 1
                                                }} 
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ) : filteredServices.length === 0 ? (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: colors.paper,
                                    borderRadius: 2
                                }}
                            >
                                <SearchIcon sx={{ fontSize: 60, mb: 2, color: alpha(colors.secondaryText, 0.7) }} />
                                <Typography variant="h6" color={colors.text} gutterBottom>
                                    No se encontraron servicios
                                </Typography>
                                <Typography variant="body2" color={colors.secondaryText} paragraph>
                                    Intenta con otros términos de búsqueda o limpia los filtros
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<ResetIcon />} 
                                    onClick={clearFilters}
                                    sx={{ 
                                        color: colors.primary, 
                                        borderColor: colors.primary
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                            </Box>
                        ) : viewMode === VIEW_MODES.GRID ? (
                            // Vista de Grid para servicios
                            <Grid container spacing={2}>
                                {filteredServices.map((service) => (
                                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                backgroundColor: colors.paper,
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 3
                                                }
                                            }}
                                        >
                                            <Box sx={{ p: 2, flex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color={colors.text}>
                                                        {service.title}
                                                    </Typography>
                                                    {service.category && (
                                                        <Chip
                                                            label={service.category}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                                
                                                {service.description && (
                                                    <Typography variant="body2" color={colors.secondaryText} gutterBottom noWrap>
                                                        {service.description}
                                                    </Typography>
                                                )}
                                                
                                                <Box 
                                                    sx={{ 
                                                        mt: 2, 
                                                        height: 140, 
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative',
                                                        bgcolor: alpha(colors.secondaryText, 0.1),
                                                        borderRadius: 1,
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {service.image_url ? (
                                                        <>
                                                            <Box
                                                                component="img"
                                                                src={service.image_url}
                                                                alt={service.title}
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => openImagePreview({
                                                                    name: service.image_name,
                                                                    url: service.image_url
                                                                })}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                                                }}
                                                            />
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 8,
                                                                    right: 8,
                                                                    bgcolor: 'rgba(255,255,255,0.8)',
                                                                    '&:hover': {
                                                                        bgcolor: 'white'
                                                                    }
                                                                }}
                                                                onClick={() => openImagePreview({
                                                                    name: service.image_name,
                                                                    url: service.image_url
                                                                })}
                                                            >
                                                                <ZoomInIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            color: colors.secondaryText
                                                        }}>
                                                            <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
                                                            <Typography variant="caption" color={colors.secondaryText}>
                                                                Sin imagen
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                            
                                            <Divider />
                                            
                                            <CardActions sx={{ justifyContent: 'flex-end', p: 1.5 }}>
                                                {service.image_url ? (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => removeImageFromService(service)}
                                                    >
                                                        Remover
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        startIcon={<PhotoCameraIcon />}
                                                        onClick={() => openAssignDialog(service)}
                                                    >
                                                        Asignar
                                                    </Button>
                                                )}
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            // Vista de Lista para servicios
                            <TableContainer
                                component={Paper}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: colors.paper,
                                    boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <Table>
                                    <TableHead sx={{ backgroundColor: colors.tableBackground }}>
                                        <TableRow>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Servicio</TableCell>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Categoría</TableCell>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Imagen</TableCell>
                                            <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredServices.map((service) => (
                                            <TableRow 
                                                key={service.id} 
                                                hover
                                                sx={{ 
                                                    '&:hover': { 
                                                        backgroundColor: colors.hover 
                                                    } 
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="subtitle2" color={colors.text}>
                                                        {service.title}
                                                    </Typography>
                                                    {service.description && (
                                                        <Typography variant="caption" color={colors.secondaryText}>
                                                            {service.description.length > 60
                                                                ? `${service.description.substring(0, 60)}...`
                                                                : service.description}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {service.category && (
                                                        <Chip
                                                            label={service.category}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {service.image_url ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Box
                                                                sx={{
                                                                    width: '60px',
                                                                    height: '40px',
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid',
                                                                    borderColor: 'divider',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => openImagePreview({
                                                                    name: service.image_name,
                                                                    url: service.image_url
                                                                })}
                                                            >
                                                                <img
                                                                    src={service.image_url}
                                                                    alt={service.title}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                    loading="lazy"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Tooltip title="Imagen asignada">
                                                                <CheckCircleIcon
                                                                    color="success"
                                                                    fontSize="small"
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Box
                                                                sx={{
                                                                    width: '60px',
                                                                    height: '40px',
                                                                    bgcolor: alpha(colors.secondaryText, 0.1),
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    border: '1px dashed',
                                                                    borderColor: 'divider'
                                                                }}
                                                            >
                                                                <ImageIcon color="disabled" />
                                                            </Box>
                                                            <Tooltip title="Sin imagen">
                                                                <CancelIcon
                                                                    color="error"
                                                                    fontSize="small"
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {service.image_url ? (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => removeImageFromService(service)}
                                                        >
                                                            Remover
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<PhotoCameraIcon />}
                                                            onClick={() => openAssignDialog(service)}
                                                        >
                                                            Asignar
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}
            </Box>

            {/* Drawer de Filtros */}
            <Drawer
                anchor="right"
                open={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                PaperProps={{
                    sx: { 
                        width: { xs: '80%', sm: '350px' },
                        backgroundColor: colors.paper 
                    }
                }}
            >
                <AppBar position="static" color="default" elevation={0}>
                    <Toolbar>
                        <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 'bold', color: colors.text }}>
                            Filtros
                        </Typography>
                        <IconButton edge="end" onClick={() => setIsFilterDrawerOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                
                <Box sx={{ p: 2, overflowY: 'auto' }}>
                    <Typography variant="subtitle2" gutterBottom color={colors.text}>
                        Estado de imagen
                    </Typography>
                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                        <RadioGroup 
                            value={filterHasImages}
                            onChange={(e) => setFilterHasImages(e.target.value)}
                        >
                            <FormControlLabel
                                value="all"
                                control={<Radio />}
                                label="Todos los servicios"
                                sx={{ color: colors.text }}
                            />
                            <FormControlLabel
                                value="with"
                                control={<Radio />}
                                label="Con imágenes"
                                sx={{ color: colors.text }}
                            />
                            <FormControlLabel
                                value="without"
                                control={<Radio />}
                                label="Sin imágenes"
                                sx={{ color: colors.text }}
                            />
                        </RadioGroup>
                    </FormControl>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom color={colors.text}>
                            Categorías
                        </Typography>
                        
                        {availableCategories.length === 0 ? (
                            <Typography variant="body2" color={colors.secondaryText}>
                                No hay categorías disponibles
                            </Typography>
                        ) : (
                            <List dense>
                                {availableCategories.map((category) => (
                                    <ListItem key={category} disablePadding>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => handleCategoryChange(category)}
                                                    size="small"
                                                />
                                            }
                                            label={category}
                                            sx={{ width: '100%', color: colors.text }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>
                
                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ResetIcon />}
                        onClick={clearFilters}
                        sx={{ 
                            color: colors.primary, 
                            borderColor: colors.primary
                        }}
                    >
                        Limpiar filtros
                    </Button>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsFilterDrawerOpen(false)}
                    >
                        Aplicar
                    </Button>
                </Box>
            </Drawer>

            {/* Diálogo para asignar imagen */}
            <Dialog
                open={isAssignDialogOpen}
                onClose={() => setIsAssignDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        backgroundColor: colors.paper
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: colors.text }}>
                        <PhotoCameraIcon sx={{ mr: 1 }} />
                        Seleccionar imagen para: {selectedService?.title}
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar imagen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: colors.secondaryText }} />
                        }}
                        size="small"
                        sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                color: colors.text,
                                '& fieldset': {
                                    borderColor: colors.inputBorder,
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: colors.inputLabel,
                            },
                        }}
                    />

                    <Grid container spacing={2}>
                        {loadingImages ? (
                            <>
                                {[...Array(8)].map((_, i) => (
                                    <Grid item xs={6} sm={4} md={3} key={i}>
                                        <Box 
                                            sx={{ 
                                                height: 120, 
                                                width: '100%', 
                                                bgcolor: alpha(colors.secondaryText, 0.1),
                                                borderRadius: 1,
                                                mb: 1
                                            }} 
                                        />
                                        <Box 
                                            sx={{ 
                                                height: 20, 
                                                width: '80%', 
                                                bgcolor: alpha(colors.secondaryText, 0.1),
                                                borderRadius: 0.5
                                            }} 
                                        />
                                    </Grid>
                                ))}
                            </>
                        ) : filteredImages.length === 0 ? (
                            <Grid item xs={12}>
                                <Box sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 1
                                }}>
                                    <SearchIcon sx={{ fontSize: 40, mb: 1, color: alpha(colors.secondaryText, 0.7) }} />
                                    <Typography color={colors.text}>No se encontraron imágenes</Typography>
                                </Box>
                            </Grid>
                        ) : (
                            filteredImages.map((image) => (
                                <Grid item xs={6} sm={4} md={3} key={image.id}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: 2
                                            },
                                            backgroundColor: colors.paper
                                        }}
                                        onClick={() => assignImageToService(image)}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={image.url}
                                            alt={image.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                            }}
                                            sx={{
                                                objectFit: 'cover',
                                                transition: 'transform 0.2s'
                                            }}
                                        />
                                        <CardContent sx={{ p: 1 }}>
                                            <Typography variant="caption" noWrap color={colors.text}>
                                                {image.name}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setIsAssignDialogOpen(false)}
                        sx={{ color: colors.text }}
                    >
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para confirmar eliminación */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        backgroundColor: colors.paper
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: colors.error }}>
                        <DeleteIcon color="error" sx={{ mr: 1 }} />
                        Confirmar eliminación
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph color={colors.text}>
                        ¿Está seguro que desea eliminar esta imagen? Esta acción no se puede deshacer.
                    </Typography>
                    <Typography variant="body2" color="error" paragraph>
                        Nota: Si esta imagen está asignada a algún servicio, el servicio perderá su imagen.
                    </Typography>
                    {selectedImage && (
                        <Box sx={{ 
                            mt: 2, 
                            textAlign: 'center',
                            overflow: 'hidden',
                            borderRadius: 1,
                            boxShadow: 1
                        }}>
                            <img
                                src={selectedImage.url}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    display: 'block',
                                    margin: '0 auto'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = IMAGE_ERROR_PLACEHOLDER;
                                }}
                            />
                            <Typography variant="caption" color={colors.secondaryText} sx={{ mt: 1, display: 'block' }}>
                                {selectedImage.name}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setIsDeleteDialogOpen(false)}
                        startIcon={<CloseIcon />}
                        sx={{ color: colors.text }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={deleteImage} 
                        color="error" 
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Visor de imágenes en pantalla completa */}
            <Dialog
                open={imagePreviewOpen}
                onClose={() => setImagePreviewOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        backgroundColor: colors.paper,
                        overflow: 'hidden'
                    }
                }}
            >
                <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexGrow: 1, color: colors.text }}>
                            {previewImage?.name}
                        </Typography>
                        <Box>
                            <IconButton 
                                onClick={() => {
                                    if (previewImage?.url) {
                                        navigator.clipboard.writeText(previewImage.url);
                                        showNotification('URL copiada al portapapeles', 'success');
                                    }
                                }}
                                title="Copiar URL"
                                sx={{ color: colors.text }}
                            >
                                <ContentCopyIcon />
                            </IconButton>
                            <IconButton 
                                onClick={() => window.open(previewImage?.url, '_blank')}
                                title="Abrir en nueva pestaña"
                                sx={{ color: colors.text }}
                            >
                                <FullscreenIcon />
                            </IconButton>
                            <IconButton 
                                onClick={() => setImagePreviewOpen(false)}
                                edge="end"
                                title="Cerrar"
                                sx={{ color: colors.text }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'black',
                        height: '70vh',
                        overflow: 'hidden'
                    }}
                >
                    {previewImage && (
                        <img
                            src={previewImage.url}
                            alt={previewImage.name || 'Vista previa'}
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%',
                                objectFit: 'contain'
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = IMAGE_ERROR_PLACEHOLDER;
                            }}
                        />
                    )}
                </Box>
                <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Typography variant="caption" color={colors.secondaryText}>
                        {previewImage?.size || ''} {previewImage?.format ? `• ${previewImage.format.toUpperCase()}` : ''}
                    </Typography>
                    <Box>
                        {selectedService && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PhotoCameraIcon />}
                                onClick={() => {
                                    assignImageToService(previewImage);
                                    setImagePreviewOpen(false);
                                }}
                                sx={{ mr: 1 }}
                            >
                                Asignar a {selectedService.title}
                            </Button>
                        )}
                        <Button 
                            onClick={() => setImagePreviewOpen(false)}
                            variant="outlined"
                            sx={{ 
                                color: colors.primary, 
                                borderColor: colors.primary
                            }}
                        >
                            Cerrar
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Notificaciones */}
            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                handleClose={() => setNotification({ ...notification, open: false })}
            />
        </Card>
    );
};

export default ImagenesGestion;