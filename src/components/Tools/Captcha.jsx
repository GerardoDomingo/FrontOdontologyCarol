import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';

const RECAPTCHA_SITE_KEY = '6Lc74mAqAAAAAL5MmFjf4x0PWP9MtBNEy9ypux_h';
const POLLING_INTERVAL_MS = 100;
const MAX_POLLING_ATTEMPTS = 50;
const AUTO_RESET_MS = 120000;

// Función para cargar el script de reCAPTCHA
const loadRecaptchaScript = () => {
  if (window.grecaptcha) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;
    script.id = 'recaptcha-script';

    script.onload = () => {
      // Esperamos un poco más después de que el script se carga
      setTimeout(resolve, 500);
    };
    script.onerror = reject;

    document.head.appendChild(script);
  });
};

function CustomRecaptcha({ onCaptchaChange, isDarkMode }) {
  const recaptchaRef = useRef(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [captchaKey, setCaptchaKey] = useState(Date.now());

  // Efecto para cargar el script
  useEffect(() => {
    let mounted = true;

    const initializeRecaptcha = async () => {
      try {
        await loadRecaptchaScript();
        
        if (!mounted) return;

        let attempts = 0;
        const interval = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.render) {
            setStatus('ready');
            clearInterval(interval);
          } else {
            attempts++;
            if (attempts >= MAX_POLLING_ATTEMPTS) {
              console.error('❌ reCAPTCHA no cargó a tiempo.');
              setStatus('error');
              clearInterval(interval);
            }
          }
        }, POLLING_INTERVAL_MS);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error loading reCAPTCHA script:', error);
        if (mounted) {
          setStatus('error');
        }
      }
    };

    initializeRecaptcha();

    return () => {
      mounted = false;
    };
  }, [captchaKey]);

  useEffect(() => {
    if (status === 'ready') {
      const timer = setTimeout(() => {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          console.log('♻️ reCAPTCHA reseteado después de 2 minutos.');
        }
      }, AUTO_RESET_MS);

      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = useCallback((value) => {
    try {
      onCaptchaChange(value);
    } catch (error) {
      console.error('Error en onCaptchaChange:', error);
      onCaptchaChange(null);
    }
  }, [onCaptchaChange]);

  const handleErrored = useCallback(() => {
    console.error('❌ Error interno de reCAPTCHA.');
    setStatus('error');
    onCaptchaChange(null);
  }, [onCaptchaChange]);

  const handleExpired = useCallback(() => {
    console.log('⏰ reCAPTCHA expiró.');
    onCaptchaChange(null);
  }, [onCaptchaChange]);

  const resetCaptcha = useCallback(() => {
    // Remover el script anterior si existe
    const oldScript = document.getElementById('recaptcha-script');
    if (oldScript) {
      oldScript.remove();
    }
    
    // Limpiar la variable global de grecaptcha
    if (window.grecaptcha) {
      delete window.grecaptcha;
    }

    console.log('♻️ Reseteando reCAPTCHA manualmente...');
    setCaptchaKey(Date.now());
    setStatus('loading');
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '78px'
          }}>
            <CircularProgress size={24} />
          </Box>
        );
      
      case 'error':
        return (
          <Box sx={{ textAlign: 'center', minHeight: '78px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              Error al cargar reCAPTCHA. Intenta recargar.
            </Typography>
            <IconButton onClick={resetCaptcha} color="primary" size="small">
              <Refresh fontSize="small" />
            </IconButton>
          </Box>
        );
      
      case 'ready':
        return (
          <ReCAPTCHA
            key={captchaKey}
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={handleChange}
            onErrored={handleErrored}
            onExpired={handleExpired}
            theme={isDarkMode ? 'dark' : 'light'}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '78px' }}>
      {renderContent()}
    </Box>
  );
}

export default React.memo(CustomRecaptcha);