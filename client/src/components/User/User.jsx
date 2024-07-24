import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Button/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Table/Table";
import FormUser  from '@/components/Forms/FormUser'; 

function User() {
    const [users, setUsers] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8081/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, []);


    const openFormModal = () => {
        setIsFormModalOpen(true); 
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false); 
    };

    return (
        <div className="">
            <div className="flex justify-between w-full text-sipe-white font-bold">
                <div className="flex flex-col mb-5">
                    <h1 className="text-3xl font-bold">Usuarios</h1>
                    <h3 className="text-md font-light">Listado completo de usuarios</h3>
                </div>
                <div className="flex flex-row gap-4 text-sipe-white">
                    <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">+ NUEVO</Button> {/* Cambia la función del botón */}
                </div>
            </div>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center text-sipe-gray">Nombre</TableHead>
                        <TableHead className="text-center text-sipe-gray">Apellido</TableHead>
                        <TableHead className="text-center text-sipe-gray">Legajo</TableHead>
                        <TableHead className="text-center text-sipe-gray">Email</TableHead>
                        <TableHead className="text-center text-sipe-gray">Rol</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="text-center font-light">{user.nombre}</TableCell>
                            <TableCell className="text-center font-light">{user.apellido}</TableCell>
                            <TableCell className="text-center font-light">{user.legajo}</TableCell>
                            <TableCell className="text-center font-light">{user.email}</TableCell>
                            <TableCell className="text-center font-light">{user.rol}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-center p-4">
                <Button variant="outline" className="mx-1">
                    1
                </Button>
                <Button variant="outline" className="mx-1">
                    2
                </Button>
                <Button variant="outline" className="mx-1">
                    3
                </Button>
            </div>


            {isFormModalOpen && (
                <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                    <FormUser onClose={closeFormModal} /> 
                </div>
            )}
        </div>
    );
}

export default User;
