import React, { useState } from 'react';
import { CardMedia, Box, CircularProgress } from '@mui/material';

const ServiceImage = ({ imageUrl, title }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Spinner de carga mientras la imagen no ha cargado */}
            {!imageLoaded && (
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <CircularProgress size={40} thickness={4} />
                </Box>
            )}

            {/* Imagen con efecto de desenfoque inicial */}
            <CardMedia
                component="img"
                height="200"
                image={imageUrl || `https://source.unsplash.com/400x300/?dental,${title.replace(' ', ',')}`}
                alt={title}
                loading="lazy"
                onLoad={() => setImageLoaded(true)} // Se activa cuando la imagen termina de cargar
                sx={{
                    objectFit: 'cover',
                    filter: imageLoaded ? 'blur(0)' : 'blur(10px)', // Se aclara cuando carga
                    transition: 'filter 0.5s ease-in-out',
                }}
            />
        </Box>
    );
};

export default ServiceImage;
