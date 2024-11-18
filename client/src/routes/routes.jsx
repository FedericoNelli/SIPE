import { Navigate } from 'react-router-dom';
import axios from "axios";
import { useEffect, useState } from "react";

export const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    const userId = localStorage.getItem('id');
    const [firstLogin, setFirstLogin] = useState(localStorage.getItem('firstLogin'));
    const [redirectPath, setRedirectPath] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Indicador de carga para esperar la respuesta

    useEffect(() => {
        const checkTutorialStatus = async () => {
            try {
                console.log('Checking tutorial status for user:', userId);
                const response = await axios.get(`http://localhost:8081/check-tutorial-status/${userId}`);
                console.log('Tutorial status response:', response.data);
                if (response.data.redirectToChangePassword) {
                    setRedirectPath('/rPsw');
                } else if (response.data.showTutorial) {
                    setRedirectPath('/tuto');
                } else {
                    setRedirectPath('/dshb'); // Redirige al dashboard si no hay otra condición
                }
            } catch (error) {
                console.error('Error al verificar el estado del tutorial:', error);
            } finally {
                setIsLoading(false); // Finaliza la carga después de obtener la respuesta
            }
        };

        if (isAuthenticated && firstLogin === '1') {
            checkTutorialStatus();
        } else {
            setRedirectPath('/dshb');
            setIsLoading(false);
        }
    }, [isAuthenticated, firstLogin, userId]);

    // Muestra un indicador de carga mientras se espera la verificación
    if (isLoading) {
        return <div>Cargando...</div>;
    }

    // Si se determina un path de redirección, redirige al usuario
    if (redirectPath && redirectPath !== '/dshb') {
        return <Navigate to={redirectPath} replace />;
    }

    // Muestra el contenido solo si está autenticado y no hay redirección a otro lugar
    return isAuthenticated ? children : <Navigate to="/" />;
};


export const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    return isAuthenticated ? <Navigate to="/dshb" /> : children;
};

export const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const isAuthenticated = !!token;
    const isAdmin = rol === 'Administrador';
    const firstLogin = localStorage.getItem('firstLogin'); // Obtén el estado de firstLogin
    const currentPath = window.location.pathname; // Obtén la ruta actual

    // Si el usuario es un admin y no ha completado el tutorial
    if (isAuthenticated && isAdmin && firstLogin === '1' && currentPath !== '/tuto') {
        return <Navigate to="/tuto" replace />;
    }

    // Permitir acceso a /tuto cuando firstLogin es "1"
    if (isAuthenticated && isAdmin && firstLogin === '1' && currentPath === '/tuto') {
        return children; // Permite renderizar el componente Tutorials
    }

    // Permitir acceso normal si es administrador y completó el tutorial
    return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
};

