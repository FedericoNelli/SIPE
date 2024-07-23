import React, { useState } from 'react';
import axios from 'axios';

const AddUser = () => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [legajo, setLegajo] = useState('');
    const [nombre_usuario, setNombreUsuario] = useState('');
    const [contrasenia, setContrasenia] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState('Colaborador');

    const handleAddUser = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8081/addUser', 
            { nombre, apellido, legajo, nombre_usuario, contrasenia, email, rol },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setNombre('');
            setApellido('');
            setLegajo('');
            setNombreUsuario('');
            setContrasenia('');
            setEmail('');
            setRol('Colaborador');
            // Muestra un mensaje en la consola
            console.log('Usuario creado');
        } catch (error) {
            console.error('Error al agregar el usuario', error);
        }
    };

    return (
        <form onSubmit={handleAddUser}>
            <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                required
            />
            <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Apellido"
                required
            />
            <input
                type="text"
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                placeholder="Legajo"
                required
            />
            <input
                type="text"
                value={nombre_usuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Nombre de Usuario"
                required
            />
            <input
                type="password"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                placeholder="Contraseña"
                required
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="Colaborador">Colaborador</option>
                <option value="Administrador">Administrador</option>
            </select>
            <button type="submit">Agregar Usuario</button>
        </form>
    );
};

export default AddUser;