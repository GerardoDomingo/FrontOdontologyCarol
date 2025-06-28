import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://back-end-4803.onrender.com/api/users/checkAuth', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

        if (response.ok && data.user) {
          setIsAuthenticated(true);
          setUserRole(data.user.tipo); // 'paciente' o 'administrador'
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error en la autenticación:', error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || userRole !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
