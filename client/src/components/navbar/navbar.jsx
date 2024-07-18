import { useState } from "react";

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
                            <li className="bg-sipe-blue-dark p-2 rounded-s-lg">User</li>
                            <li className="bg-sipe-orange-light p-2 rounded-e-lg">-</li>
                        </div>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Navbar