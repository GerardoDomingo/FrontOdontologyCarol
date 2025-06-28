// imageLoader.js - Implementación mejorada y más robusta

// Importación manual de imágenes (más confiable)
import img1 from '../assets/imagenes/img_1.jpg';
import img2 from '../assets/imagenes/img_2.jpg';
import img3 from '../assets/imagenes/img_3.jpg';
import img4 from '../assets/imagenes/img_4.jpg';
// Agregar más imágenes según necesites

// Array de imágenes con orden garantizado
const imageArray = [
  img1,
  img2, 
  img3,
  img4
  // Agregar más imágenes aquí
].filter(Boolean); // Filtra valores undefined/null

// Función de precarga optimizada
const preloadImages = () => {
  if (typeof window === 'undefined') return;
  
  const preload = () => {
    imageArray.forEach((src, index) => {
      if (src) {
        const img = new Image();
        img.src = src;
        img.loading = 'eager';
        // Solo log en desarrollo
        if (process.env.NODE_ENV === 'development') {
          img.onload = () => console.log(`✅ Imagen ${index + 1} cargada`);
          img.onerror = () => console.error(`❌ Error en imagen ${index + 1}`);
        }
      }
    });
  };
  
  // Usar requestIdleCallback si está disponible
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 100);
  }
};

// Función para obtener imagen por índice de forma segura
const getImageByIndex = (index) => {
  if (!imageArray.length) return '';
  const safeIndex = ((index % imageArray.length) + imageArray.length) % imageArray.length;
  return imageArray[safeIndex];
};

// Función para obtener imagen aleatoria
const getRandomImage = () => {
  if (!imageArray.length) return '';
  const randomIndex = Math.floor(Math.random() * imageArray.length);
  return imageArray[randomIndex];
};

// Hook personalizado para manejo de imágenes
export const useImages = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    preloadImages();
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return {
    images: imageArray,
    isLoaded,
    getImageByIndex,
    getRandomImage,
    totalImages: imageArray.length
  };
};

// Solo precargar en cliente
if (typeof window !== 'undefined') {
  preloadImages();
}

export { getImageByIndex, getRandomImage };
export default imageArray;