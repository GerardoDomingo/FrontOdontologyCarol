import React from 'react';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import { Facebook, WhatsApp, Email } from '@mui/icons-material'; // Importar íconos de Material-UI
import img4 from '../../assets/imagenes/img_7.jpg'; // Asegúrate de que la ruta es correcta

const HomeEmpleado = () => {
  return (
    <Box
  sx={{
    height: '100vh',
    backgroundImage: `url(${img4})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Opacidad del fondo
      zIndex: 1, // Asegura que el fondo opaco esté detrás de la tarjeta
    },
  }}
>
  {/* Tarjeta de información (sin opacidad) */}
  <Card
    sx={{
      width: '350px',
      minHeight: '200px',
      backgroundColor: '#003366', // Color sólido (sin opacidad)
      color: 'white',
      borderRadius: '10px',
      marginLeft: '26px',
      zIndex: 2, // Asegura que la tarjeta esté por encima del fondo opaco
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.5)',
      },
    }}
  >
    <CardContent>
      <Typography gutterBottom variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        Bienvenido a Odontología Carol
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
        En Odontología Carol nos preocupamos por tu salud bucal. Aquí encontrarás los mejores profesionales y tratamientos para cuidar de tu sonrisa.
      </Typography>
    </CardContent>
  </Card>

  {/* Redes sociales (fila horizontal en la parte inferior derecha) */}
  <Box
    sx={{
      position: 'absolute',
      bottom: '35px',
      right: '30px',
      display: 'flex',
      flexDirection: 'row',
      gap: '15px',
      zIndex: 2, // Asegura que los íconos estén por encima del fondo opaco
    }}
  >
    {/* Íconos de redes sociales */}
    <IconButton href="https://facebook.com" target="_blank" rel="noopener noreferrer" sx={{ backgroundColor: '#1877F2', color: 'white', '&:hover': { backgroundColor: '#166FE5', transform: 'scale(1.2)', transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out' } }}>
      <Facebook fontSize="large" />
    </IconButton>
    <IconButton href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" sx={{ backgroundColor: '#25D366', color: 'white', '&:hover': { backgroundColor: '#128C7E', transform: 'scale(1.2)', transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out' } }}>
      <WhatsApp fontSize="large" />
    </IconButton>
    <IconButton href="mailto:info@odontologiacarol.com" sx={{ backgroundColor: '#D44638', color: 'white', '&:hover': { backgroundColor: '#C5221F', transform: 'scale(1.2)', transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out' } }}>
      <Email fontSize="large" />
    </IconButton>
  </Box>
</Box>
  );
};

export default HomeEmpleado;