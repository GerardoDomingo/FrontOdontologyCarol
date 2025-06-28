import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Icono "X"
import EditIcon from "@mui/icons-material/Edit"; // Icono "Editar"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Icono para expandir
import ThemeProviderComponent from "../../../components/Tools/ThemeContext";
import moment from "moment";

const DetalleCitaPaciente = ({ open, onClose, cita }) => {
  const [expanded, setExpanded] = useState(false);

  if (!cita) return null;

  // Formatear fecha y hora
  const formatDateTime = (date) => {
    return moment(date, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD, h:mm A");
  };

  return (
    <ThemeProviderComponent>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>
          Detalles de la Cita
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Información del Paciente en Acordeón */}
          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="primary">
                Información del Paciente
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Nombre:</strong> {cita.nombre} {cita.apellido_paterno} {cita.apellido_materno}
              </Typography>
              <Typography><strong>Género:</strong> {cita.genero}</Typography>
              <Typography><strong>Fecha de Nacimiento:</strong> {moment(cita.fecha_nacimiento).format("YYYY-MM-DD")}</Typography>
              <Typography><strong>Teléfono:</strong> {cita.telefono}</Typography>
              <Typography><strong>Email:</strong> {cita.email}</Typography>
            </AccordionDetails>
          </Accordion>

          {/* Información de la Cita */}
          <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
            Información de la Cita
          </Typography>
          <Typography><strong>Servicio:</strong> {cita.servicio_nombre}</Typography>
          <Typography><strong>Categoría:</strong> {cita.categoria_servicio}</Typography>
          <Typography><strong>Precio:</strong> ${cita.precio_servicio}</Typography>
          <Typography><strong>Duración:</strong> {cita.duracion_servicio} minutos</Typography>
          <Typography>
            <strong>Fecha de Consulta:</strong> {formatDateTime(cita.fecha_consulta)}
          </Typography>
          <Typography><strong>Estado:</strong> {cita.estado}</Typography>

          {/* Botón Editar */}
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            color="primary"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "20px auto",
              gap: 1,
            }}
          >
            Editar
          </Button>
        </DialogContent>
      </Dialog>
    </ThemeProviderComponent>
  );
};

export default DetalleCitaPaciente;
