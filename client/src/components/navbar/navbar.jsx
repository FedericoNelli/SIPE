import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Dropdown/Dropdown-menu";
import { Button } from "../Button/Button";
import { ChevronDown } from "lucide-react";


function Navbar() {

    function getDate() {
        const today = new Date();
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const month = monthNames[today.getMonth()];
        const year = today.getFullYear();
        const date = today.getDate();
        return `${date} de ${month} de ${year}`;
    }

    const [currentDate, setCurrentDate] = useState(getDate());
    const [userName, setUserName] = useState('Usuario');
    const [initial, setInitial] = useState('');

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
            setInitial(storedUserName.charAt(0).toUpperCase());
        }
    }, []);

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

    return (
        <>
            <div className="flex justify-between items-center text-sipe-white font-light p-8 px-10">
                <h1 className="text-4xl font-bold">Buen día, {userName}!</h1>
                <div>
                    <ul className="flex flex-row justify-center items-center gap-6 text-lg">
                        <li>{currentDate}</li>
                        <li className="bg-sipe-blue-dark rounded-full p-2"><img src="src\assets\images\icons\Notificaciones.png" alt="" /></li>
                        <div className="flex flex-row justify-center items-center">
                            <DropdownMenu>
                            <li className=" p-2 rounded-lg"> 
                                <DropdownMenuTrigger className="bg-sipe-blue-dark rounded-xl">
                                    <Button variant="sipehover" className="rounded-lg gap-2 px-3">{initial}<ChevronDown /></Button>
                                    </DropdownMenuTrigger> 
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Cambiar Contraseña</DropdownMenuItem> 
                                    <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem> 
                                </DropdownMenuContent>
                            </li>
                            </DropdownMenu>
                        </div>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Navbar