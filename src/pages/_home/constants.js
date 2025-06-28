import { useState, useEffect, useRef } from 'react';
import {
  HealthAndSafety,
  Healing,
  PersonOutline,
  MonetizationOn,
  Star,
  CheckCircleOutline,
  AccessTime,
  LocationOn
} from '@mui/icons-material';

// Hook para intersección (animaciones al hacer scroll)
export const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

// Datos para beneficios dentales
export const DENTAL_BENEFITS = [
  {
    title: "Prevención de problemas graves",
    description: "Detectar y tratar problemas dentales a tiempo evita complicaciones costosas",
    icon: HealthAndSafety
  },
  {
    title: "Mejora de salud general",
    description: "La salud bucal está directamente relacionada con tu bienestar general",
    icon: Healing
  },
  {
    title: "Sonrisa más atractiva",
    description: "Mejora tu confianza y apariencia con una sonrisa cuidada y saludable",
    icon: PersonOutline
  },
  {
    title: "Ahorro a largo plazo",
    description: "La prevención regular es más económica que los tratamientos de emergencia",
    icon: MonetizationOn
  }
];

// Datos para características
export const FEATURES_DATA = [
  {
    title: "Atención personalizada",
    description: "Cada paciente recibe un tratamiento adaptado a sus necesidades específicas",
    icon: Star
  },
  {
    title: "Precios accesibles",
    description: "Servicios odontológicos de alta calidad a precios justos para nuestra comunidad",
    icon: CheckCircleOutline
  },
  {
    title: "Consultas sin espera",
    description: "Respetamos tu tiempo con citas puntuales y atención eficiente",
    icon: AccessTime
  },
  {
    title: "Ubicación privilegiada",
    description: "En el centro de nuestra comunidad, fácil acceso para todos los vecinos",
    icon: LocationOn
  }
];

// Datos para testimonios
export const TESTIMONIALS = [
  {
    name: "María Fernández",
    testimonial: "La atención fue excelente. El doctor me explicó todo el procedimiento y no sentí ninguna molestia. Estoy muy satisfecha con el resultado.",
    rating: 5
  },
  {
    name: "Carlos Gutiérrez",
    testimonial: "Mi hija tenía miedo de ir al dentista, pero el personal fue muy amable y paciente con ella. Ahora hasta quiere regresar para su próxima revisión.",
    rating: 5
  },
  {
    name: "Laura Mendoza",
    testimonial: "Precios muy accesibles y un trabajo profesional. El ambiente del consultorio es muy acogedor y limpio. Definitivamente lo recomiendo.",
    rating: 4
  }
];

// Función para calcular colores basados en el tema
export const getThemeColors = (isDarkTheme) => ({
  background: isDarkTheme
    ? "linear-gradient(90deg, #1C2A38 0%, #2C3E50 100%)"
    : "linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)",
  primary: isDarkTheme ? "#3B82F6" : "#2563EB",
  secondary: isDarkTheme ? "#10B981" : "#059669",
  text: isDarkTheme ? "#F1F5F9" : "#334155",
  subtext: isDarkTheme ? "#94A3B8" : "#64748B",
  cardBg: isDarkTheme ? "#1E293B" : "#FFFFFF",
  cardHover: isDarkTheme ? "#273449" : "#F8FAFC",
  border: isDarkTheme ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  shadow: isDarkTheme
    ? "0 4px 12px rgba(0,0,0,0.25)"
    : "0 4px 12px rgba(0,0,0,0.05)",
  accentGradient: isDarkTheme
    ? "linear-gradient(90deg, #3B82F6, #60A5FA)"
    : "linear-gradient(90deg, #2563EB, #3B82F6)",
  success: isDarkTheme ? "#10B981" : "#059669",
  lightBg: isDarkTheme ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.05)",
  sectionDivider: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
});