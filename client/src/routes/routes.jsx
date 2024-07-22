import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

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

    return isAuthenticated && isAdmin ? children : <Navigate to="/dshb" />;
};
