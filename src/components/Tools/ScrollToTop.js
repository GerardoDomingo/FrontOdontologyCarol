import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que desplaza automáticamente la página al inicio
 * cuando cambia la ruta en React Router
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Desplaza al inicio de la página cuando cambia la ruta
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Hace el scroll suave, cambia a 'auto' para scroll instantáneo
    });
  }, [pathname]);

  return null; // Este componente no renderiza nada
};

export default ScrollToTop;