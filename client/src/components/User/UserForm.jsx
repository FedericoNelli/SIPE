import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from '@/components/Common/Label/Label';
import { Input } from '@/components/Common/Input/Input';
import { Button } from '@/components/Common/Button/Button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/Common/Select/Select';  // Importa los componentes necesarios

const UserForm = ({ onClose, notify }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        legajo: '',
        nombre_usuario: '',
        contrasenia: '',
        email: '',
        rol: 'Colaborador'
    });
    const [selectedFile, setSelectedFile] = useState(null);


    // Cerrar modal al presionar la tecla Escape
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);


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

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (!emailRegex.test(formData.email)) {
            notify('error', 'El correo electrónico debe ser válido');
            return;
        }
        const token = localStorage.getItem('token');
        const data = new FormData();
        // Añadir los campos del formulario a FormData
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        // Añadir la imagen si se seleccionó una
        if (selectedFile) {
            data.append('imagen', selectedFile);
        }
        try {
            const response = await axios.post('http://localhost:8081/addUser',
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            if (response.status === 200) {
                setFormData({
                    nombre: '',
                    apellido: '',
                    legajo: '',
                    nombre_usuario: '',
                    contrasenia: '',
                    email: '',
                    rol: 'Colaborador'
                });
                setSelectedFile(null); // Limpiar la selección de imagen
                notify('success', "¡Usuario creado correctamente!");

                if (onClose) onClose();
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error("Error al crear usuario:", error);
            // Si el error tiene respuesta del servidor
            if (error.response) {
                if (error.response.data && error.response.data.message) {
                    // Si el servidor devuelve un mensaje de error específico
                    notify('error', error.response.data.message);
                } else if (error.response.data && error.response.data.error) {
                    // Si el servidor devuelve un campo 'error' con el mensaje
                    notify('error', error.response.data.error);
                } else {
                    // Si no hay mensaje específico, pero el servidor respondió con error
                    notify('error', "Error desconocido al crear usuario");
                }
            } else {
                // Si el error no tiene respuesta (por ejemplo, problemas de red)
                notify('error', "Error de conexión al servidor");
            }
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
                                className="border-b text-sm"
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="Ingrese el nombre"
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
                                className="border-b text-sm"
                                id="apellido"
                                name="apellido"
                                type="text"
                                placeholder="Ingrese el apellido"
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
                                className="border-b text-sm"
                                id="legajo"
                                name="legajo"
                                type="text"
                                placeholder="Ingrese el legajo"
                                value={formData.legajo}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center">
                            <Label htmlFor="nombre_usuario" className="text-sm font-medium">
                                Nombre de usuario
                            </Label>
                            <Input
                                className="border-b text-sm"
                                id="nombre_usuario"
                                name="nombre_usuario"
                                type="text"
                                placeholder="Ingrese un nombre de usuario"
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
                                className="border-b text-sm"
                                id="contrasenia"
                                name="contrasenia"
                                type="password"
                                placeholder="Ingrese una contraseña"
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
                                className="border-b text-sm"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Ingrese un email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="imagen" className="text-sm font-medium">
                                Imagen
                            </Label>
                            <Input
                                className="text-white font-thin file:text-white pb-8 bg-sipe-blue-light border rounded-xl text-sm"
                                id="imagen"
                                name="imagen"
                                type="file"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="rol" className="text-sm font-medium">
                            Rol
                        </Label>
                        <Select id="rol" onValueChange={(value) => handleSelectChange('rol', value)}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-gray border-sipe-white rounded-lg">
                                <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" value="Colaborador">Colaborador</SelectItem>
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" value="Administrador">Administrador</SelectItem>
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

export default UserForm;
