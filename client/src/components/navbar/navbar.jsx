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
                    <ul className="flex flex-row justify-center gap-6 text-lg">
                        <li>{currentDate}</li>
                        <li><img src="src\assets\images\icons\Notificaciones.png" alt="" /></li>
                        <li>User</li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Navbar