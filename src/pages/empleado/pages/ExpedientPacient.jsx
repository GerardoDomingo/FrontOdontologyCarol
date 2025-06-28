import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { Visibility } from '@mui/icons-material';  // Ícono de ojo
import axios from 'axios';

const ExpedienteClinico = () => {
  // Obtener información del paciente desde la ubicación actual
  const location = useLocation();
  const { id, nombre, telefono, correo } = location.state || {};

  const [hoveredRow, setHoveredRow] = useState(null);  // Estado para el efecto hover en las filas de la tabla
  const [historial, setHistorial] = useState([]);  // Estado para almacenar el historial clínico
  const [loading, setLoading] = useState(true);  // Estado de carga mientras se obtienen los datos
  const [error, setError] = useState(null);  // Estado para manejar posibles errores

  // Obtener historial clínico desde la API al cargar el componente
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        // Llamada a la API para obtener el historial clínico
        const response = await axios.get(`https://back-end-4803.onrender.com/api/expediente/${id}`);
        console.log('Datos del historial clínico:', response.data);  // Verifica los datos en la consola
        setHistorial(response.data);  // Actualizar el estado con los datos obtenidos
        setLoading(false);  // Cambiar el estado de carga
      } catch (err) {
        setError('Error al cargar los datos');  // Manejar errores
        setLoading(false);
      }
    };

    if (id) {
      fetchHistorial();  // Solo hacer la solicitud si tenemos el ID del paciente
    }
  }, [id]);

  return (
    <div style={{ marginTop: '80px' }}>
      <h2 style={{ color: '#003366', textAlign: 'center' }}>Expediente Clínico</h2>

      {/* Información del paciente */}
      <form style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <TextField label="Nombre Completo" value={nombre || 'No disponible'} disabled style={{ marginRight: '10px', width: '300px' }} />
        <TextField label="Correo" value={correo || 'No disponible'} disabled style={{ marginRight: '10px', width: '300px' }} />
        <TextField label="Teléfono" value={telefono || 'No disponible'} disabled style={{ width: '300px' }} />
      </form>

      <h3 style={{ textAlign: 'center' }}>Historial de Expediente Clínico</h3>

      {/* Mostrar mensaje de carga o error */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando datos...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
      ) : (
        <TableContainer style={{ maxWidth: '80%', margin: 'auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <Table>
            <TableHead style={{ backgroundColor: '#e0f7fa' }}>
              <TableRow>
                <TableCell><strong>Fecha de Registro</strong></TableCell>
                <TableCell><strong>Servicio</strong></TableCell>
                <TableCell><strong>Descripción</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historial.map((item) => {
                // Verifica que los valores existen antes de renderizar
                if (!item.fecha_registro || !item.servicio_title || !item.estado) return null;

                return (
                  <TableRow key={item.id} onMouseEnter={() => setHoveredRow(item.id)} onMouseLeave={() => setHoveredRow(null)} style={{ backgroundColor: hoveredRow === item.id ? '#b3e5fc' : 'transparent' }}>
                    <TableCell>{new Date(item.fecha_registro).toLocaleString()}</TableCell> {/* Fecha de registro */}
                    <TableCell>{item.servicio_title}</TableCell> {/* Servicio */}
                    <TableCell>{item.servicio_description || 'No disponible'}</TableCell> {/* Descripción del servicio */}
                    <TableCell>{item.estado}</TableCell> {/* Estado */}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ExpedienteClinico;
