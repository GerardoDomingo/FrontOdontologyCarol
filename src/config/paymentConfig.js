// config/paymentConfig.js - Configuración del Frontend

// 🔑 CREDENCIALES PARA EL FRONTEND (solo las públicas)
export const PAYMENT_CONFIG = {
  // MercadoPago
  MERCADOPAGO: {
    PUBLIC_KEY: 'APP_USR-cb039339-b22d-4738-a21d-36bbcd0f1074',
    CURRENCY: 'MXN',
    LOCALE: 'es-MX'
  },
  
  // PayPal  
  PAYPAL: {
    CLIENT_ID: 'AYaRi5dbGmcaSuvEzcQFQVIDPJXZkBwm4jDBS1qtsj_z9cYzSU7lefnBIceXQyKE1NvJJOtOJdZh6_w7',
    CURRENCY: 'USD',
    LOCALE: 'es_MX',
    // Tipo de cambio aproximado MXN a USD
    EXCHANGE_RATE: 0.056
  },
  
  // URLs de tu backend
  API: {
    BASE_URL: 'http://localhost:5000/api', // Cambia por tu URL del backend
    MERCADOPAGO_CREATE: '/payments/mercadopago/create-preference',
    PAYPAL_CREATE: '/payments/paypal/create-order',
    PAYPAL_CAPTURE: '/payments/paypal/capture-order'
  },
  
  // URLs de redirección después del pago
  REDIRECT_URLS: {
    SUCCESS: window.location.origin + '/payment-success',
    FAILURE: window.location.origin + '/payment-failure', 
    PENDING: window.location.origin + '/payment-pending'
  }
};

// 🦷 Función para formatear datos de pago de servicios dentales
export const formatPaymentData = (serviceData, userData, platform) => {
  const baseData = {
    title: `Servicio Dental: ${serviceData.servicio_nombre}`,
    description: `Pago por ${serviceData.servicio_nombre} - Dr. ${serviceData.odontologo_nombre}`,
    amount: serviceData.precio_servicio,
    currency: platform === 'paypal' ? 'USD' : 'MXN',
    email: userData.email || userData.correo,
    reference: `DENTAL_${serviceData.id}_${Date.now()}`,
    service_id: serviceData.id,
    patient_id: userData.id,
    patient_name: `${userData.nombre} ${userData.aPaterno || userData.apellido_paterno}`.trim()
  };

  // Convertir MXN a USD para PayPal
  if (platform === 'paypal') {
    baseData.amount = (parseFloat(serviceData.precio_servicio) * PAYMENT_CONFIG.PAYPAL.EXCHANGE_RATE).toFixed(2);
    baseData.original_amount_mxn = serviceData.precio_servicio;
  }

  return baseData;
};

// 🌍 Configuración de idiomas
export const PAYMENT_TEXTS = {
  es: {
    processing: 'Procesando pago...',
    success: '¡Pago exitoso!',
    error: 'Error en el pago',
    mercadopago_redirect: 'Redirigiendo a MercadoPago...',
    paypal_processing: 'Procesando con PayPal...',
    currency_note: 'El pago se procesará en dólares americanos (USD)',
    amount_converted: 'Monto convertido:'
  }
};

export default PAYMENT_CONFIG;