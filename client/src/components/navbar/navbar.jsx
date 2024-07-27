import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Dropdown/Dropdown-menu";
import { ChevronDown } from "lucide-react";
<<<<<<< HEAD
import { Bell } from 'lucide-react';

=======
import axios from 'axios';
import { useNavigate } from "react-router-dom";
>>>>>>> developer

function Navbar() {

    function getDate() {
        const today = new Date();
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const month = monthNames[today.getMonth()];
        const year = today.getFullYear();
        const date = today.getDate();
        
        return `${date} de ${month} de ${year}`;
    }

    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(getDate());
    const [userName, setUserName] = useState('Usuario');
    const [initial, setInitial] = useState('');
    const [notificaciones, setNotificaciones] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
            setInitial(storedUserName.charAt(0).toUpperCase());
        }

        // Obtener notificaciones de materiales
        const fetchNotificaciones = async () => {
            try {
                const response = await axios.get('http://localhost:8081/notificaciones-material');
                const sortedNotifications = response.data.reverse().slice(0, 5);
                setNotificaciones(sortedNotifications);

                const storedNotificationIds = JSON.parse(localStorage.getItem('seenNotificationIds') || '[]');
                const unseenNotifications = sortedNotifications.filter(notif => !storedNotificationIds.includes(notif.id));
                setNotificationCount(unseenNotifications.length);
            } catch (error) {
                console.error('Error al obtener notificaciones', error);
            }
        };

        fetchNotificaciones();
    }, []);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        setNotificationCount(0); // Ocultar número de notificaciones después de hacer clic

        // Marcar todas las notificaciones como vistas
        const seenNotificationIds = notificaciones.map(notif => notif.id);
        localStorage.setItem('seenNotificationIds', JSON.stringify(seenNotificationIds));
    };

    const handleOutsideClick = (e) => {
        if (!e.target.closest('.notification-container')) {
            setShowNotifications(false);
        }
    };

    useEffect(() => {
        if (showNotifications) {
            document.addEventListener('click', handleOutsideClick);
        } else {
            document.removeEventListener('click', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [showNotifications]);

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8081/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            localStorage.removeItem('token');
            window.location.href = '/';
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    const handleChangePassword = () => {
        navigate('/rPsw');
        handleClose();
    };

    return (
<<<<<<< HEAD
        <>
            <div className="flex justify-between items-center text-sipe-white font-light p-10 px-10">
                <h1 className="text-4xl font-bold">Buen día, {userName}!</h1>
                <div>
                    <ul className="flex flex-row justify-center items-center gap-6 text-lg">
                        <li>{currentDate}</li>
                        <li className="bg-sipe-blue-dark rounded-full p-2"><Bell /></li>
                        <div className="flex flex-row justify-center items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center bg-sipe-white rounded-full p-0.5">
                                    <div className="flex items-center justify-center w-8 h-8 bg-sipe-blue-dark text-white rounded-full">
                                        {initial}
                                    </div>
                                    <div className="flex items-center justify-center ml-1 hover:scale-125 transition-transform duration-200">
                                        <ChevronDown className="text-black" />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="mt-2 bg-white shadow-md rounded-lg">
                                    <DropdownMenuItem className="p-2 hover:bg-gray-200 rounded-t-lg">
                                        Cambiar contraseña
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="p-2 hover:bg-gray-200 rounded-b-lg" onClick={handleLogout}>
                                        Cerrar sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </ul>
                </div>
=======
        <div className="flex justify-between items-center text-sipe-white font-light p-8 px-10">
            <h1 className="text-4xl font-bold">Buen día, {userName}!</h1>
            <div>
                <ul className="flex flex-row justify-center items-center gap-6 text-lg">
                    <li>{currentDate}</li>
                    <li className="relative bg-sipe-blue-dark rounded-full p-2 notification-container">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="bg-sipe-blue-dark rounded-full" onClick={handleBellClick}>
                                <img src="src/assets/images/icons/Notificaciones.png" alt="" />
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{notificationCount}</span>
                                )}
                            </DropdownMenuTrigger>
                            {showNotifications && (
                                <DropdownMenuContent>
                                    {notificaciones.map((notif, index) => (
                                        <DropdownMenuItem key={index}>
                                            {notif.cantidad === 0
                                                ? `El material ${notif.nombre} se ha quedado sin stock.`
                                                : `El material ${notif.nombre} ha llegado a su límite de bajo stock.`}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </li>
                    <div className="flex flex-row justify-center items-center">
                        <DropdownMenu>
                            <li className="p-2 rounded-lg">
                                <DropdownMenuTrigger className="bg-sipe-blue-dark rounded-xl">
                                    <Button variant="sipehover" className="rounded-lg gap-2 px-3">{initial}<ChevronDown /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                        <DropdownMenuItem onClick={handleChangePassword}>Cambiar Contraseña</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem> 
                                </DropdownMenuContent>
                            </li>
                        </DropdownMenu>
                    </div>
                </ul>
>>>>>>> developer
            </div>
        </div>
    );
}

export default Navbar;



