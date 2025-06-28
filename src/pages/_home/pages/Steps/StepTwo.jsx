import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    MedicalServices as MedicalServicesIcon,
    CheckCircle as CheckCircleIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import axios from 'axios';

import DEFAULT_IMAGE from '../../../../assets/iconos/Sin título.png';

const StepTwo = ({
    colors,
    isDarkTheme,
    onNext,
    onPrev,
    onStepCompletion,
    onFormDataChange
}) => {
    const [odontologo, setOdontologo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        axios.get('https://back-end-4803.onrender.com/api/empleados/odontologos/activos')
            .then((response) => {
                const odontologoActivo = response.data
                    .find(odontologo => odontologo.puesto === 'Odontólogo');

                if (odontologoActivo) {
                    const odontologoData = {
                        id: odontologoActivo.id,
                        name: `${odontologoActivo.nombre} ${odontologoActivo.aPaterno} ${odontologoActivo.aMaterno}`,
                        email: odontologoActivo.email,
                        image: odontologoActivo.imagen || DEFAULT_IMAGE
                    };
                    setOdontologo(odontologoData);
                    onFormDataChange({
                        especialista: odontologoData.name,
                        odontologo_id: odontologoData.id
                    });
                }
            })
            .catch((error) => {
                console.error('Error al obtener odontólogo:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []); // Se elimina el ciclo infinito al usar un arreglo vacío

    const handleNext = () => {
        onStepCompletion('step2', true);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                backgroundColor: colors.cardBg,
                borderRadius: 3,
                boxShadow: isDarkTheme
                    ? '0 4px 20px rgba(0,0,0,0.3)'
                    : '0 4px 20px rgba(0,0,0,0.1)'
            }}
        >
            <Typography
                variant="h5"
                sx={{ mb: 3, textAlign: 'center', color: colors.primary }}
            >
                Tu Odontólogo Asignado
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : odontologo ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card
                        elevation={4}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            maxWidth: 400,
                            width: '100%',
                            border: `2px solid ${colors.primary}`,
                            mb: 3
                        }}
                    >
                        <CardMedia
                            component="img"
                            height="250"
                            image={odontologo.image}
                            alt={odontologo.name}
                            sx={{ objectFit: 'cover' }}
                        />
                        <CardContent>
                            <Typography
                                variant="h6"
                                sx={{ color: colors.primary, fontWeight: 600, mb: 1 }}
                            >
                                {odontologo.name}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ color: colors.text, mb: 2 }}
                            >
                                Odontólogo
                            </Typography>
                            <Chip
                                icon={<MedicalServicesIcon />}
                                label="Especialista Activo"
                                variant="outlined"
                                color="primary"
                                size="medium"
                            />
                        </CardContent>
                    </Card>
                </Box>
            ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', color: colors.text }}>
                    No hay odontólogos disponibles en este momento.
                </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onPrev}

                    sx={{
                        textTransform: 'none',
                        borderRadius: 8,
                        px: 3,
                        py: 1.2
                    }}
                >
                    Atrás
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 8,
                        px: 3,
                        py: 1.2,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    Continuar
                </Button>
            </Box>
        </Paper>
    );
};

export default StepTwo;
