import React from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';

const VerificationModal = ({ open, onClose, onSubmit, setCode }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                    Verificación de Código
                </Typography>
                <TextField
                    fullWidth
                    label="Código de Verificación"
                    onChange={(e) => setCode(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button fullWidth variant="contained" onClick={onSubmit}>
                    Verificar
                </Button>
            </Box>
        </Modal>
    );
};

export default VerificationModal;
