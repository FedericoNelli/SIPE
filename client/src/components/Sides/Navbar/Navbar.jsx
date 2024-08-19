import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/Common/Dropdown/Dropdown-menu";
import { ChevronDown, Bell } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }));
    const [userName, setUserName] = useState('Usuario');
    const [initial, setInitial] = useState('');
    const [notificaciones, setNotificaciones] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const usuarioId = localStorage.getItem('id'); // Obtener el ID del usuario logueado

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
            setInitial(storedUserName.charAt(0).toUpperCase());
        }

        const fetchNotificaciones = async () => {
            try {
                const responseNotifications = await axios.get(`http://localhost:8081/api/notifications/${usuarioId}`);
                const userNotifications = responseNotifications.data;
    
                const responseMaterials = await axios.get('http://localhost:8081/notificaciones-material');
                const materialNotifications = responseMaterials.data.map(material => ({
                    id: `material-${material.id}`,
                    descripcion: material.cantidad === 0
                        ? `El material ${material.nombre} se ha quedado sin stock.`
                        : `El material ${material.nombre} ha llegado a su límite de bajo stock.`,
                    fecha: new Date().toISOString(),
                    visto: false
                }));
    
                const combinedNotifications = [
                    ...userNotifications,
                    ...materialNotifications.filter((matNotif) => 
                        !userNotifications.some((userNotif) => userNotif.descripcion === matNotif.descripcion)
                    )
                ];
    
                setNotificaciones(combinedNotifications);
                setNotificationCount(combinedNotifications.filter(notif => !notif.visto).length);
    
            } catch (error) {
                console.error('Error al obtener notificaciones', error);
            }
        };
    
        fetchNotificaciones();
    }, [usuarioId]);

    const handleBellClick = async () => {
        setShowNotifications(!showNotifications);
        try {
            const notificationIds = notificaciones.filter(notif => !notif.visto).map(notif => parseInt(notif.id, 10));
    
            if (notificationIds.length > 0) {
                await axios.post(`http://localhost:8081/api/user-notifications`, {
                    userId: usuarioId,
                    notificationIds
                });
    
                // Actualiza el estado local
                setNotificaciones(prevNotificaciones =>
                    prevNotificaciones.map(notif =>
                        notificationIds.includes(notif.id) ? { ...notif, visto: true } : notif
                    )
                );
    
                // Actualiza el contador de notificaciones
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

    return (
        <div className="flex justify-between items-center text-sipe-white font-light p-10 px-10">
            <h1 className="text-4xl font-bold">Buen día, {userName}!</h1>
            <div>
                <ul className="flex flex-row justify-center items-center gap-6 text-lg">
                    <li>{currentDate}</li>
                    <li className="relative bg-sipe-blue-dark rounded-full">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="bg-sipe-blue-dark rounded-full flex justify-center p-2 notification-container" onClick={handleBellClick}>
                                <Bell />
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-sipe-white bg-red-600 rounded-full">{notificationCount}</span>
                                )}
                            </DropdownMenuTrigger>
                            {showNotifications && (
                                <DropdownMenuContent>
                                    {notificaciones.map((notif) => (
                                        <DropdownMenuItem key={notif.id}>
                                            {notif.descripcion}
                                        </DropdownMenuItem>
                                    ))}
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
                            <DropdownMenuContent className="mt-2 bg-sipe-white shadow-md rounded-lg">
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

