import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Estado null para manejar el renderizado condicional

    useEffect(() => {
        // Función para verificar la autenticación mediante el backend
        const checkAuth = async () => {
            try {
                // Realizamos una solicitud al backend para verificar si la cookie está activa
                const response = await fetch('https://back-end-4803.onrender.com/api/users/check-auth', {
                    method: 'GET',
                    credentials: 'include', // Esto incluye las cookies en la solicitud
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });

                // Si la respuesta del servidor es exitosa (autenticado)
                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated) {
                        // Si está autenticado, muestra los hijos
                        setIsAuthenticated(true);
                    } else {
                        // Si no está autenticado, redirige a la página de error
                        setIsAuthenticated(false);
                        navigate('/error', { state: { errorCode: 403, errorMessage: 'No tienes permisos para acceder a esta página.' } });
                    }
                } else {
                    // Si el backend responde con un error (ej. 401), redirige a la página de error
                    setIsAuthenticated(false);
                    navigate('/error', { state: { errorCode: 401, errorMessage: 'No autorizado, verifique su autenticidad.' } });
                }
            } catch (error) {
                // Si ocurre un error al realizar la solicitud al backend
                console.error('Error al verificar la autenticación:', error);
                setIsAuthenticated(false);
                navigate('/error', { state: { errorCode: 500, errorMessage: 'Error al verificar la autenticación' } });
            }
        };

        checkAuth();

    }, [navigate]);

    // Renderizar nada mientras se verifica la autenticación (cuando isAuthenticated es null)
    if (isAuthenticated === null) {
        return null; // Puedes mostrar un loader aquí si lo prefieres
    }

    // Si está autenticado, muestra los hijos, si no, redirige a la página de error
    return isAuthenticated ? children : null;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired, 
};

export default PrivateRoute;
