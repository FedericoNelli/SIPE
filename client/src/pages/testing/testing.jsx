
import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Testing() {
    const handleClick = () => {
        toast.success("¡Depósito Agregado Correctamente!");
    };

    return (
        <div>
            <button onClick={handleClick}>Mostrar Toast</button>
            <ToastContainer />
        </div>
    );
}

export default Testing