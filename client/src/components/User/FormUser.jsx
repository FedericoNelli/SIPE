import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from '@/components/Common/Label/Label';
import { Input } from '@/components/Common/Input/Input';
import { Button } from '@/components/Common/Button/Button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/Common/Select/Select';  // Importa los componentes necesarios

const FormUser = ({ onClose, notify }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        legajo: '',
        nombre_usuario: '',
        contrasenia: '',
        email: '',
        rol: 'Colaborador'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        const data = { ...formData };

        try {
            await axios.post('http://localhost:8081/addUser',
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            setFormData({
                nombre: '',
                apellido: '',
                legajo: '',
                nombre_usuario: '',
                contrasenia: '',
                email: '',
                rol: ''
            });
            notify('success', "¡Usuario creado correctamente!");
            
            if (onClose) onClose();
            setTimeout(() => {
                window.location.reload();
            }, 2500);

        } catch (error) {
            notify('error', "Error al crear usuario");
        }
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <>
            <ToastContainer />
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nuevo usuario</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="nombre" className="text-sm font-medium">
                                Nombre
                            </Label>
                            <Input
                                className="border-b"
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="Nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="apellido" className="text-sm font-medium">
                                Apellido
                            </Label>
                            <Input
                                className="border-b"
                                id="apellido"
                                name="apellido"
                                type="text"
                                placeholder="Apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="legajo" className="text-sm font-medium">
                                Legajo
                            </Label>
                            <Input
                                className="border-b"
                                id="legajo"
                                name="legajo"
                                type="text"
                                placeholder="Legajo"
                                value={formData.legajo}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="nombre_usuario" className="text-sm font-medium">
                                Nombre Usuario
                            </Label>
                            <Input
                                className="border-b"
                                id="nombre_usuario"
                                name="nombre_usuario"
                                type="text"
                                placeholder="Nombre de Usuario"
                                value={formData.nombre_usuario}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="contrasenia" className="text-sm font-medium">
                                Contraseña
                            </Label>
                            <Input
                                className="border-b"
                                id="contrasenia"
                                name="contrasenia"
                                type="password"
                                placeholder="Contraseña"
                                value={formData.contrasenia}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <Input
                                className="border-b"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="rol" className="text-sm font-medium">
                            Rol
                        </Label>
                        <Select id="rol" onValueChange={(value) => handleSelectChange('rol', value)}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Colaborador">Colaborador</SelectItem>
                                <SelectItem value="Administrador">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>
                        CANCELAR
                    </Button>
                    <Button variant="sipebutton" size="sipebutton" type="submit" onClick={handleAddUser}>
                        AGREGAR
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
};

export default FormUser;
