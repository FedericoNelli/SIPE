import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';

function UserList({ onUserClick }) {
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        axios.get('http://localhost:8081/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, []);

    return (
        <>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Nombre</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Apellido</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Legajo</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Nombre de Usuario</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Email</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Rol</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => (
                        <TableRow 
                            key={user.id} 
                            onClick={() => onUserClick(user)}
                            className="cursor-pointer hover:bg-gray-700" 
                        >
                            <TableCell className="text-center font-light">{user.nombre}</TableCell>
                            <TableCell className="text-center font-light">{user.apellido}</TableCell>
                            <TableCell className="text-center font-light">{user.legajo}</TableCell>
                            <TableCell className="text-center font-light">{user.nombre_usuario}</TableCell>
                            <TableCell className="text-center font-light">{user.email}</TableCell>
                            <TableCell className="text-center font-light">{user.rol}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default UserList;
