import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress, Chip } from '@mui/material';
import format from 'date-fns/format';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const LogsReport = ({ isDarkTheme, colors }) => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/reportes/logs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los logs');
        }

        const data = await response.json();
        const sortedLogs = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(sortedLogs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Función para determinar el color del nivel de log
  const getLevelColor = (level) => {
    const levelColors = {
      ERROR: '#ef5350',
      WARNING: '#ffa726',
      INFO: '#66bb6a',
      DEBUG: '#42a5f5'
    };
    return isDarkTheme ? levelColors[level] : levelColors[level];
  };

  return (
    <Box sx={{ 
      padding: 3,
      backgroundColor: colors.background,
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    }}>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Typography 
            variant="h5" 
            sx={{ 
              marginBottom: 2,
              color: colors.primary,
              fontWeight: 'bold',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            Historial del Sistema
          </Typography>
          
          <TableContainer 
            component={Paper}
            sx={{
              backgroundColor: colors.paper,
              boxShadow: isDarkTheme ? '0px 4px 20px rgba(0, 0, 0, 0.3)' : '0px 4px 20px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: colors.tableBackground }}>
                <TableRow>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Nivel</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Mensaje</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: 'bold' }}>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow 
                    key={log.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: colors.hover
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ color: colors.text }}>
                      {log.id}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.level}
                        sx={{
                          backgroundColor: getLevelColor(log.level),
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          minWidth: '80px'
                        }}
                      />
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: colors.text,
                        maxWidth: '400px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {log.message}
                    </TableCell>
                    <TableCell sx={{ color: colors.text }}>
                      {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default LogsReport;