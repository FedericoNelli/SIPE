import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../dropdown/dropdown-menu";
import { Button } from "../button/button";
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

    return (
        <>
            <div className="flex justify-between items-center text-sipe-white font-light p-8 px-10">
                <h1 className="text-4xl font-bold">Buen día, Usuario!</h1>
                <div>
                    <ul className="flex flex-row justify-center items-center gap-6 text-lg">
                        <li>{currentDate}</li>
                        <li className="bg-sipe-blue-dark rounded-full p-2"><img src="src\assets\images\icons\Notificaciones.png" alt="" /></li>
                        <div className="flex flex-row justify-center items-center">
                            <DropdownMenu>
                            <li className=" p-2 rounded-lg"> 
                                <DropdownMenuTrigger className="bg-sipe-blue-dark rounded-lg">
                                    <Button variant="sipehover" className="rounded-lg">F <ChevronDown /></Button>
                                    </DropdownMenuTrigger> 
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Cambiar Contraseña</DropdownMenuItem> 
                                    <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem> 
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