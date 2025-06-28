import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, List, ListItem, ListItemText, CircularProgress,
    Typography, Box, IconButton, TextField, Tooltip,
    Paper, DialogContentText, Grid
} from '@mui/material';
import {
    Category as CategoryIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Save as SaveIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import Notificaciones from '../../../../components/Layout/Notificaciones';
import { useThemeContext } from '../../../../components/Tools/ThemeContext';

const CategoryService = ({ open, handleClose }) => {
    const { isDarkTheme } = useThemeContext();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [editedValue, setEditedValue] = useState('');
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', type: '' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });

    const colors = {
        primary: '#03427C',
        background: isDarkTheme ? '#1a1a1a' : '#ffffff',
        paperBg: isDarkTheme ? '#2d2d2d' : '#E5F3FD',
        text: isDarkTheme ? '#ffffff' : '#000000',
        error: '#ff3d00'
    };

    useEffect(() => {
        if (open) {
            fetchCategories();
        }
    }, [open]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://back-end-4803.onrender.com/api/servicios/categorias');
            if (!response.ok) throw new Error('Error al obtener categorías.');

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No se encontraron categorías.');
            }

            setCategories(data);
        } catch (error) {
            console.error('❌ Error al obtener categorías:', error);
            showNotification(error.message || 'Error al cargar las categorías', 'error');
        } finally {
            setLoading(false);
        }
    };



    const showNotification = (message, type) => {
        setNotification({ open: true, message, type });
        setTimeout(() => setNotification({ ...notification, open: false }), 3000);
    };

    const handleEditStart = (category) => {
        setEditingCategory(category);
        setEditedValue(category);
        setError('');
    };

    const validateCategory = (value) => {
        if (!value.trim()) return 'La categoría no puede estar vacía';
        if (value.length < 3) return 'La categoría debe tener al menos 3 caracteres';
        if (value.length > 50) return 'La categoría no puede exceder 50 caracteres';
        if (categories.includes(value)) return 'Esta categoría ya existe';
        return '';
    };

    const handleEditSave = async () => {
        const validationError = validateCategory(editedValue);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Convertir todas las categorías a minúsculas para evitar problemas
        const categoryExists = categories.some(cat => cat.toLowerCase() === editedValue.toLowerCase());
        if (categoryExists) {
            setError('La nueva categoría ya existe.');
            return;
        }

        try {
            console.log(`📌 Editando categoría: ${editingCategory} -> ${editedValue}`);

            const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/categorias/${editingCategory}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName: editedValue })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Error al actualizar la categoría');
            }

            showNotification('Categoría actualizada exitosamente', 'success');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('❌ Error al actualizar la categoría:', error);
            showNotification(error.message || 'Error al actualizar la categoría', 'error');
        }
    };

    const handleAdd = async () => {
        const validationError = validateCategory(newCategory);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Normalizar comparación de categorías
        const categoryExists = categories.some(cat => cat.toLowerCase() === newCategory.toLowerCase());
        if (categoryExists) {
            setError('Esta categoría ya existe.');
            return;
        }

        try {
            console.log("📌 Agregando categoría:", newCategory);

            const response = await fetch('https://back-end-4803.onrender.com/api/servicios/categorias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Error al crear la categoría');
            }

            showNotification('Categoría creada exitosamente', 'success');
            setNewCategory('');
            setError('');
            fetchCategories(); // Recargar categorías solo si la creación fue exitosa
        } catch (error) {
            console.error('❌ Error al crear la categoría:', error);
            showNotification(error.message || 'Error al crear la categoría', 'error');
        }
    };

    const confirmDelete = async (category) => {
        try {
            // Verificar si la categoría está en uso antes de eliminarla
            const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/categorias/verify/${category}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                if (result.services) {
                    // Si la categoría está en uso, mostrar los servicios en el diálogo
                    setDeleteDialog({ open: true, category, servicesInUse: result.services });
                } else {
                    showNotification(result.message || 'Error al verificar la categoría', 'error');
                }
                return;
            }
    
            // Si la categoría no está en uso, abrir diálogo de confirmación
            setDeleteDialog({ open: true, category, servicesInUse: null });
    
        } catch (error) {
            console.error('❌ Error al verificar la categoría:', error);
            showNotification('Error al verificar la categoría', 'error');
        }
    };
    
    const handleDelete = async (category) => {
        try {
            const response = await fetch(`https://back-end-4803.onrender.com/api/servicios/categorias/${category}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                showNotification(result.message || 'Error al eliminar la categoría', 'error');
                return;
            }
    
            showNotification('Categoría eliminada exitosamente', 'success');
            setDeleteDialog({ open: false, category: null, servicesInUse: null });
            fetchCategories(); // Recargar la lista de categorías después de la eliminación
    
        } catch (error) {
            console.error('❌ Error al eliminar la categoría:', error);
            showNotification('Error al eliminar la categoría', 'error');
        }
    };
    

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: {
                        backgroundColor: colors.background
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon />
                        <span>Gestión de Categorías</span>
                    </Box>
                    <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.paperBg }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs>
                                <TextField
                                    fullWidth
                                    label="Nueva Categoría"
                                    value={newCategory}
                                    onChange={(e) => {
                                        setNewCategory(e.target.value);
                                        setError('');
                                    }}
                                    error={!!error && !editingCategory}
                                    helperText={!editingCategory ? error : ''}
                                    InputProps={{
                                        startAdornment: <CategoryIcon sx={{ color: 'action.active', mr: 1 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <Tooltip title="Agregar Categoría">
                                    <IconButton
                                        onClick={handleAdd}
                                        sx={{
                                            backgroundColor: colors.primary,
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: colors.primary,
                                                opacity: 0.9
                                            }
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : categories.length > 0 ? (
                        <List>
                            {categories.map((category, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        backgroundColor: colors.paperBg2,
                                        mb: 1,
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: isDarkTheme ? '#404040' : '#eef6fb'
                                        }
                                    }}
                                >
                                    {editingCategory === category ? (
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs>
                                                <TextField
                                                    fullWidth
                                                    value={editedValue}
                                                    onChange={(e) => {
                                                        setEditedValue(e.target.value);
                                                        setError('');
                                                    }}
                                                    error={!!error}
                                                    helperText={error}
                                                    autoFocus
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Tooltip title="Guardar">
                                                    <IconButton
                                                        onClick={handleEditSave}
                                                        sx={{ color: 'success.main' }}
                                                    >
                                                        <SaveIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Cancelar">
                                                    <IconButton
                                                        onClick={() => {
                                                            setEditingCategory(null);
                                                            setError('');
                                                        }}
                                                        sx={{ color: colors.error }}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <>
                                            <ListItemText primary={category} />
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    onClick={() => handleEditStart(category)}
                                                    sx={{ color: colors.primary }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    onClick={() => confirmDelete(category)} // 🔹 Corrección aquí
                                                    sx={{ color: colors.error }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>

                                        </>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography
                            align="center"
                            sx={{
                                p: 4,
                                color: 'text.secondary',
                                backgroundColor: colors.paperBg,
                                borderRadius: 1
                            }}
                        >
                            No hay categorías registradas.
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleClose}
                        sx={{
                            color: colors.primary,
                            '&:hover': {
                                backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(3,66,124,0.05)'
                            }
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de confirmación de eliminación */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, category: null })}>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="error" />
                        Confirmar eliminación
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {deleteDialog.servicesInUse && deleteDialog.servicesInUse.length > 0 ? (
                        <>
                            <Typography>
                                ❌ No puedes eliminar la categoría "{deleteDialog.category}" porque está en uso en los siguientes servicios:
                            </Typography>
                            <ul>
                                {deleteDialog.servicesInUse.map(service => (
                                    <li key={service.id}>{service.title}</li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <DialogContentText>
                            ¿Estás seguro de que deseas eliminar la categoría "{deleteDialog.category}"? Esta acción no se puede deshacer.
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, category: null })} sx={{ color: colors.primary }}>
                        Cancelar
                    </Button>
                    {!deleteDialog.servicesInUse || deleteDialog.servicesInUse.length === 0 ? (
                        <Button
                            onClick={() => handleDelete(deleteDialog.category)}
                            sx={{
                                backgroundColor: colors.error,
                                color: 'white',
                                '&:hover': { backgroundColor: colors.error, opacity: 0.9 }
                            }}
                        >
                            Eliminar
                        </Button>
                    ) : null}
                </DialogActions>
            </Dialog>


            <Notificaciones
                open={notification.open}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, open: false })}
            />
        </>
    );
};

export default CategoryService;