import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Alert,
    Tooltip,
    Divider,
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    AccessTime as TimeIcon,
    Event as EventIcon,
    EditCalendar as EditCalendarIcon,
    CalendarMonth as CalendarMonthIcon,
    Schedule as ScheduleIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
    Close as CloseIcon,
    Info as InfoIcon,
    EventBusy as EventBusyIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import axios from 'axios';

const StepThree = ({
    colors,
    isDarkTheme,
    selectedDate,
    selectedTime,
    onDateTimeChange,
    onNext,
    onPrev,
    onStepCompletion,
    setNotification,
    onFormDataChange,
    formData,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availableTimes, setAvailableTimes] = useState([]);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [workDays, setWorkDays] = useState([]);
    const [showTimeDialog, setShowTimeDialog] = useState(false);
    const [selectedDateForTimes, setSelectedDateForTimes] = useState(null);
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

    // Normalizar fechas para comparaciones
    const normalizeDateForCompare = (date) => {
        if (!date) return null;
        const normalizedDate = typeof date === 'string' ? new Date(date) : new Date(date);
        normalizedDate.setHours(12, 0, 0, 0);
        return normalizedDate;
    };

    // Comparar si dos fechas son el mismo día
    const isSameDay = (date1, date2) => {
        const d1 = normalizeDateForCompare(date1);
        const d2 = normalizeDateForCompare(date2);
        return (
            d1 &&
            d2 &&
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    // Obtener días laborales
    useEffect(() => {
        if (!formData.odontologo_id) return;
        setIsLoading(true);
        axios
            .get(
                `https://back-end-4803.onrender.com/api/horarios/dias_laborales?odontologo_id=${formData.odontologo_id}`
            )
            .then((response) => {
                const daysMap = {
                    Domingo: 0,
                    Lunes: 1,
                    Martes: 2,
                    Miércoles: 3,
                    Jueves: 4,
                    Viernes: 5,
                    Sábado: 6,
                };
                const availableDays = response.data.map((day) => daysMap[day]);
                setWorkDays(availableDays);
            })
            .catch((error) => {
                console.error('Error al obtener días laborales:', error);
                setNotification({
                    open: true,
                    message: 'Error al obtener los días laborales del odontólogo.',
                    type: 'error',
                });
                setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
            })
            .finally(() => setIsLoading(false));
    }, [formData.odontologo_id]);

    // Obtener horarios disponibles
    const fetchAvailableTimes = (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        setIsLoading(true);
        axios
            .get(
                `https://back-end-4803.onrender.com/api/horarios/disponibilidad?odontologo_id=${formData.odontologo_id}&fecha=${formattedDate}`
            )
            .then((response) => {
                const available = [];
                const booked = [];
                response.data.forEach((franja) => {
                    const horarioId = franja.horario_id;
                    if (franja.slots_disponibles) {
                        Object.entries(franja.slots_disponibles).forEach(([timeSlot, isAvailable]) => {
                            if (isAvailable)
                                available.push({ time: timeSlot, horarioId, duracion: franja.duracion });
                            else booked.push({ time: timeSlot, reason: 'Horario ya reservado' });
                        });
                    }
                });
                setAvailableTimes(available);
                setBookedTimes(booked);
            })
            .catch((error) => {
                console.error('Error al obtener horarios disponibles:', error);
                setNotification({
                    open: true,
                    message: 'Error al obtener los horarios disponibles.',
                    type: 'error',
                });
                setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
            })
            .finally(() => setIsLoading(false));
    };

    const handleDateClick = (date) => {
        if (date instanceof Date && !isNaN(date) && !isDateDisabled(date)) {
            setSelectedDateForTimes(date);
            const normalizedDate = new Date(date);
            normalizedDate.setHours(12, 0, 0, 0);
            onDateTimeChange(normalizedDate, null);
            const formattedDate = normalizedDate.toISOString().split('T')[0];
            onFormDataChange({ fechaCita: formattedDate, horaCita: null, horario_id: null });
            fetchAvailableTimes(date);
            setShowTimeDialog(true);
        }
    };

    const handleTimeSelection = (timeData) => {
        const normalizedDate = new Date(selectedDateForTimes);
        normalizedDate.setHours(12, 0, 0, 0);
        const time = typeof timeData === 'string' ? timeData : timeData.time;
        const horarioId = typeof timeData === 'string' ? horarioSeleccionado : timeData.horarioId;
        onDateTimeChange(normalizedDate, time);
        const formattedDate = normalizedDate.toISOString().split('T')[0];
        onFormDataChange({ fechaCita: formattedDate, horaCita: time, horario_id: horarioId });
        setHorarioSeleccionado(horarioId);
        setShowTimeDialog(false);
    };

    const handleContinue = () => {
        if (!selectedDate || !selectedTime || !formData.horario_id) {
            setNotification({
                open: true,
                message: 'Por favor selecciona una fecha y un horario válido antes de continuar.',
                type: 'warning',
            });
            setTimeout(() => setNotification({ open: false, message: '', type: '' }), 3000);
            return;
        }
        onStepCompletion('step3', true);
    };

    const isDateDisabled = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today || !workDays.includes(date.getDay());
    };

    const formatDate = (dateInput) => {
        const date = new Date(dateInput);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];
        let week = [];
        for (let i = 0; i < firstDay; i++) week.push(null);
        for (let day = 1; day <= daysInMonth; day++) {
            week.push(new Date(year, month, day));
            if (week.length === 7) {
                days.push(week);
                week = [];
            }
        }
        if (week.length > 0) {
            while (week.length < 7) week.push(null);
            days.push(week);
        }
        return days;
    };

    const handlePreviousMonth = () =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const handleNextMonth = () =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
    ];

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: colors.cardBg,
                boxShadow: isDarkTheme
                    ? '0 8px 32px rgba(0,0,0,0.4)'
                    : '0 8px 32px rgba(0,0,0,0.15)',
                border: `1px solid ${colors.primary}20`,
                width: '100%',
          //      maxWidth: '1200px',
                margin: '0 auto',
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    textAlign: 'center',
                    mb: 4,
                    color: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                }}
            >
                <CalendarMonthIcon sx={{ mr: 1, fontSize: 28 }} />
                Agenda tu Cita
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={60} thickness={4} />
                </Box>
            ) : (
                <>
                    {/* Calendario */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            mb: 4,
                            backgroundColor: colors.cardBg,
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            width: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 3,
                            }}
                        >
                            <IconButton
                                onClick={handlePreviousMonth}
                                sx={{
                                    backgroundColor: `${colors.primary}20`,
                                    '&:hover': { backgroundColor: `${colors.primary}40` },
                                }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: colors.primary,
                                    fontWeight: 'bold',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    backgroundColor: `${colors.primary}15`,
                                }}
                            >
                                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </Typography>
                            <IconButton
                                onClick={handleNextMonth}
                                sx={{
                                    backgroundColor: `${colors.primary}20`,
                                    '&:hover': { backgroundColor: `${colors.primary}40` },
                                }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>

                        <TableContainer
                            sx={{
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: colors.primary }}>
                                        {weekDays.map((day) => (
                                            <TableCell
                                                key={day}
                                                align="center"
                                                sx={{
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    py: 2,
                                                }}
                                            >
                                                {day}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getDaysInMonth(currentDate).map((week, weekIndex) => (
                                        <TableRow key={weekIndex}>
                                            {week.map((date, dayIndex) => (
                                                <TableCell
                                                    key={dayIndex}
                                                    align="center"
                                                    sx={{
                                                        height: '70px',
                                                        border: '1px solid rgba(224, 224, 224, 0.3)',
                                                        backgroundColor: date && isDateDisabled(date)
                                                            ? `${colors.primary}05`
                                                            : 'transparent',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    {date && (
                                                        <>
                                                            <Button
                                                                onClick={() => handleDateClick(date)}
                                                                disabled={isDateDisabled(date)}
                                                                sx={{
                                                                    minWidth: '45px',
                                                                    height: '45px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: isSameDay(selectedDate, date)
                                                                        ? colors.primary
                                                                        : isDateDisabled(date)
                                                                            ? 'transparent'
                                                                            : `${colors.secondary}20`,
                                                                    color: isSameDay(selectedDate, date)
                                                                        ? 'white'
                                                                        : isDateDisabled(date)
                                                                            ? 'grey.500'
                                                                            : colors.text,
                                                                    fontWeight: 'bold',
                                                                    border: isDateDisabled(date)
                                                                        ? 'none'
                                                                        : isSameDay(selectedDate, date)
                                                                            ? 'none'
                                                                            : `2px solid ${colors.secondary}40`,
                                                                    '&:hover': {
                                                                        backgroundColor: isSameDay(selectedDate, date)
                                                                            ? colors.primary
                                                                            : isDateDisabled(date)
                                                                                ? 'transparent'
                                                                                : `${colors.secondary}40`,
                                                                    },
                                                                }}
                                                            >
                                                                {date.getDate()}
                                                            </Button>
                                                            {isDateDisabled(date) && (
                                                                <Box
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: '50%',
                                                                        left: '50%',
                                                                        transform: 'translate(-50%, -50%)',
                                                                        pointerEvents: 'none',
                                                                        zIndex: 1,
                                                                    }}
                                                                >
                                                                    <CloseIcon
                                                                        sx={{
                                                                            color: 'grey.400',
                                                                            opacity: 0.8,
                                                                            fontSize: 20,
                                                                        }}
                                                                    />
                                                                </Box>
                                                            )}
                                                        </>
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Leyenda */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 3,
                            mb: 4,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: colors.primary,
                                }}
                            />
                            <Typography variant="body2">Seleccionado</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: `${colors.secondary}30`,
                                }}
                            />
                            <Typography variant="body2">Disponible</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CloseIcon sx={{ color: 'grey.400', fontSize: 14 }} />
                            <Typography variant="body2">No disponible</Typography>
                        </Box>
                    </Box>

                    {/* Detalles de tu Cita */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            mb: 4,
                            backgroundColor: colors.cardBg,
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            width: '100%',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: colors.primary,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: 'bold',
                            }}
                        >
                            <EditCalendarIcon sx={{ mr: 1 }} />
                            Detalles de tu Cita
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: `${colors.primary}10`,
                                }}
                            >
                                <EventIcon sx={{ mr: 1, color: colors.secondary }} />
                                <Typography>
                                    <strong>Fecha:</strong>{' '}
                                    {selectedDate ? formatDate(selectedDate) : 'No seleccionada'}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: `${colors.primary}10`,
                                }}
                            >
                                <ScheduleIcon sx={{ mr: 1, color: colors.secondary }} />
                                <Typography>
                                    <strong>Hora:</strong> {selectedTime || 'No seleccionada'}
                                </Typography>
                            </Box>
                            {selectedDate && selectedTime && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setSelectedDateForTimes(normalizeDateForCompare(selectedDate));
                                        fetchAvailableTimes(normalizeDateForCompare(selectedDate));
                                        setShowTimeDialog(true);
                                    }}
                                    startIcon={<EditCalendarIcon />}
                                    sx={{
                                        alignSelf: 'flex-start',
                                        mt: 1,
                                        borderRadius: 6,
                                        textTransform: 'none',
                                        px: 2,
                                    }}
                                >
                                    Cambiar Horario
                                </Button>
                            )}
                        </Box>
                    </Paper>

                    {/* Diálogo de horarios */}
                    <Dialog
                        open={showTimeDialog}
                        onClose={() => setShowTimeDialog(false)}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: { borderRadius: 3, backgroundColor: colors.cardBg },
                        }}
                    >
                        <DialogTitle
                            sx={{
                                color: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                borderBottom: `1px solid ${colors.primary}20`,
                                pb: 2,
                            }}
                        >
                            <TimeIcon />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Horarios Disponibles
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{ ml: 'auto', color: colors.secondary, fontWeight: 'medium' }}
                            >
                                {selectedDateForTimes && formatDate(selectedDateForTimes)}
                            </Typography>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            {availableTimes.length > 0 || bookedTimes.length > 0 ? (
                                <Box>
                                    {availableTimes.map((slot) => (
                                        <Button
                                            key={slot.time}
                                            variant={
                                                selectedTime === slot.time &&
                                                horarioSeleccionado === slot.horarioId
                                                    ? 'contained'
                                                    : 'outlined'
                                            }
                                            color="primary"
                                            fullWidth
                                            onClick={() => handleTimeSelection(slot)}
                                            sx={{
                                                mb: 1,
                                                py: 1.5,
                                                borderRadius: 8,
                                                fontWeight: 'bold',
                                            }}
                                            startIcon={<ScheduleIcon />}
                                        >
                                            {slot.time}
                                        </Button>
                                    ))}
                                    {bookedTimes.map((slot) => (
                                        <Button
                                            key={slot.time}
                                            variant="outlined"
                                            disabled
                                            fullWidth
                                            sx={{
                                                mb: 1,
                                                py: 1.5,
                                                borderRadius: 8,
                                                color: 'grey.500',
                                                borderColor: 'grey.300',
                                            }}
                                            startIcon={<EventBusyIcon />}
                                        >
                                            {slot.time} (No disponible)
                                        </Button>
                                    ))}
                                </Box>
                            ) : (
                                <Alert severity="info" sx={{ borderRadius: 2, py: 2 }}>
                                    No hay horarios disponibles para esta fecha
                                </Alert>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button
                                onClick={() => setShowTimeDialog(false)}
                                variant="outlined"
                                sx={{ borderRadius: 6, px: 3, textTransform: 'none' }}
                            >
                                Cerrar
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Botones de navegación */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={onPrev}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 8,
                                px: 3,
                                py: 1.2,
                            }}
                        >
                            Atrás
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleContinue}
                            disabled={!selectedDate || !selectedTime || !formData.horario_id}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 8,
                                px: 3,
                                py: 1.2,
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            }}
                        >
                            Continuar
                        </Button>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default StepThree;