import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Dropdown/Dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Bell } from 'lucide-react';


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
            </div>
        </>
    )
}

export default Navbar