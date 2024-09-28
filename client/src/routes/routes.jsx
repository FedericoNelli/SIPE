import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    const firstLogin = localStorage.getItem('firstLogin'); // Obtén el estado de firstLogin

    // Si el usuario no ha completado el tutorial, redirige a "/tuto"
    if (isAuthenticated && firstLogin === '1') {
        return <Navigate to="/tuto" replace />;
    }

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

