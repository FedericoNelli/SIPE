import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/Common/Dropdown/Dropdown-menu";
import { ChevronDown, Bell } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(() => {
        const formattedDate = new Date().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        // Capitalizar solo la primera letra del mes
        return formattedDate.replace(/(\d{1,2}\sde\s)([a-záéíóúñ]+)/, (match, dayPart, month) => {
            return dayPart + month.charAt(0).toUpperCase() + month.slice(1);
        });
    });
    const [userName, setUserName] = useState('Usuario');
    const [initial, setInitial] = useState('');
    const [notificaciones, setNotificaciones] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const usuarioId = localStorage.getItem('id');

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
            setInitial(storedUserName.charAt(0).toUpperCase());
        }

        const fetchNotificaciones = async () => {
            try {
                const responseNotifications = await axios.get(`http://localhost:8081/api/notifications/${usuarioId}`);

                // Limitar a las últimas 5 notificaciones
                const limitedNotifications = responseNotifications.data.slice(0, 5);

                setNotificaciones(limitedNotifications);
                setNotificationCount(limitedNotifications.filter(notif => !notif.visto).length);
            } catch (error) {
                console.error('Error al obtener notificaciones', error);
            }
        };

        fetchNotificaciones();
    }, [usuarioId]);

    const handleBellClick = async () => {
        setShowNotifications(!showNotifications);
        try {
            const unseenNotifications = notificaciones.filter(notif => !notif.visto).map(notif => notif.id);
            if (unseenNotifications.length > 0) {
                await axios.post(`http://localhost:8081/api/notifications/mark-as-viewed`, {
                    userId: usuarioId,
                    notificationIds: unseenNotifications
                });

                setNotificaciones(prevNotificaciones =>
                    prevNotificaciones.map(notif =>
                        unseenNotifications.includes(notif.id) ? { ...notif, visto: true } : notif
                    )
                );
                setNotificationCount(0);
            }
        } catch (error) {
            console.error('Error al marcar notificaciones como vistas', error);
        }
    };

    const handleChangePassword = () => {
        navigate('/rPsw');
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8081/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const rememberMe = localStorage.getItem('rememberedUser');
            localStorage.clear();
            if (rememberMe) {
                localStorage.setItem('rememberedUser', rememberMe);
            }
            window.location.href = '/';
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    function obtenerSaludo() {
        const hora = new Date().getHours();
        if (hora < 12) {
            return "Buen día";
        } else if (hora < 18) {
            return "Buenas tardes";
        } else {
            return "Buenas noches";
        }
    }


    return (
        <div className="flex justify-between items-center text-sipe-white font-light p-10 px-10">
            <h1 className="text-4xl font-bold">{obtenerSaludo()}, {userName}!</h1>

            <div>
                <ul className="flex flex-row justify-center items-center gap-6 text-lg">
                    <li>{currentDate}</li>
                    <li className="relative bg-sipe-blue-dark rounded-full">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="bg-sipe-blue-dark rounded-full flex justify-center p-2 notification-container" onClick={handleBellClick}>
                                <Bell />
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-sipe-white bg-sipe-orange-dark rounded-full">{notificationCount}</span>
                                )}
                            </DropdownMenuTrigger>
                            {showNotifications && (
                                <DropdownMenuContent>
                                    {notificaciones.length === 0 ? (
                                        <p className="p-4 text-sm text-sipe-white bg-sipe-blue-dark/90 rounded-lg backdrop-blur-sm">No tienes notificaciones</p>
                                    ) : (
                                        notificaciones.map((notif) => (
                                            <DropdownMenuItem key={notif.id} className="bg-sipe-blue-dark p-4 flex items-center gap-2">
                                                <p className="text-sm text-sipe-white">{notif.descripcion}</p>
                                                <p className="text-sm text-sipe-white">|</p>
                                                <p className="text-xs text-sipe-white/80">{new Date(notif.fecha).toLocaleString()}</p>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </li>
                    <div className="flex flex-row justify-center items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center bg-sipe-white rounded-full pe-1">
                                <div className="flex items-center justify-center w-8 h-8 bg-sipe-blue-dark text-sipe-white rounded-full">
                                    {initial}
                                </div>
                                <div className="flex items-center justify-center ml-1">
                                    <ChevronDown className="text-black" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mt-2 bg-sipe-white shadow-md rounded-lg bg-sipe-blue-dark/90 text-white">
                                <DropdownMenuItem className="p-2 hover:bg-gray-200 rounded-t-lg" onClick={handleChangePassword}>
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
        </div>
    );
}

export default Navbar;
