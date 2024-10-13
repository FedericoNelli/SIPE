import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

function UserEditModal({ isOpen, onClose, user }) {
    const [isVisible, setIsVisible] = useState(isOpen);
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        legajo: user?.legajo || '',
        nombre_usuario: user?.nombre_usuario || '',
        email: user?.email || '',
        rol: user?.rol || 'Colaborador',
        contrasenia: '',
        imagen: null,
        imagenPreview: user?.imagen ? `http://localhost:8081${user.imagen}` : ''
    });
    const [isImageToDelete, setIsImageToDelete] = useState(false);

    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const resetFileInput = () => {
        const fileInput = document.getElementById('photo');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('El archivo es demasiado grande. El tamaño máximo es 10 MB.', {
                    duration: 2500,
                    style: {
                        background: '#2C3B4D',
                        color: '#EEE9DF',
                    },
                });
                return;
            }
            setFormData(prevData => ({
                ...prevData,
                imagen: file,
                imagenPreview: URL.createObjectURL(file)
            }));
            setIsImageToDelete(false); 
            toast.success('Imagen lista para guardarse', {
                duration: 2500,
                style: {
                    background: '#2C3B4D',
                    color: '#EEE9DF',
                },
            });
        } else {
            toast.error('Error al cargar imagen', {
                duration: 2500,
                style: {
                    background: '#2C3B4D',
                    color: '#EEE9DF',
                },
            });
        }
    };

    const handleDeleteImage = (e) => {
        e.stopPropagation();

        if (formData.imagen) {
            setFormData(prevData => ({
                ...prevData,
                imagen: null,
                imagenPreview: ''
            }));
            setIsImageToDelete(false);
            resetFileInput();
            toast.success('Imagen del preview eliminada', {
                duration: 2500,
                style: {
                    background: '#2C3B4D',
                    color: '#EEE9DF',
                },
            });
        } else if (formData.imagenPreview) {
            setIsImageToDelete(true);
            setFormData(prevData => ({
                ...prevData,
                imagenPreview: ''
            }));
            resetFileInput();
            toast.success('Imagen del servidor marcada para eliminarse', {
                duration: 2500,
                style: {
                    background: '#2C3B4D',
                    color: '#EEE9DF',
                },
            });
        }
    };

    const handleSave = async () => {
        const { nombre, apellido, legajo, nombre_usuario, email, rol, imagen } = formData;

        const formDataToSend = new FormData();
        formDataToSend.append('nombre', nombre);
        formDataToSend.append('apellido', apellido);
        formDataToSend.append('legajo', legajo);
        formDataToSend.append('nombre_usuario', nombre_usuario);
        formDataToSend.append('email', email);
        formDataToSend.append('rol', rol);
        if (imagen) formDataToSend.append('imagen', imagen);
        if (isImageToDelete) formDataToSend.append('eliminarImagen', true);

        try {
            const response = await axios.put(`http://localhost:8081/editUser/${user.id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al actualizar el usuario");
            }
            toast.success("Usuario actualizado correctamente", {
                duration: 2500,
                style: {
                    background: '#2C3B4D',
                    color: '#EEE9DF',
                },
            });

            setIsVisible(false);

            setTimeout(() => {
                window.location.reload();
            }, 2500);

        } catch (error) {
            toast.error(error.message || "Error al actualizar el usuario", {
                duration: 2500,
                style: {
                    background: '#2C3B4D',
                    color: '#EEE9DF',
                },
            });
        }
    };

    const handleCancel = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        if (!isVisible && onClose) {
            const timer = setTimeout(onClose, 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isOpen && !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={handleCancel}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative bg-sipe-blue-dark text-sipe-white p-4 rounded-xl w-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                            <X size={14} strokeWidth={4} onClick={handleCancel} />
                        </div>

                        <Card className="bg-sipe-blue-dark text-sipe-white p-4 rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-3xl font-bold mb-2 text-center">Editar Usuario</CardTitle>
                                <hr />
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre" className="text-sm font-medium">Nombre</Label>
                                        <Input id="nombre" placeholder="Ingresa el nombre" value={formData.nombre} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="apellido" className="text-sm font-medium">Apellido</Label>
                                        <Input id="apellido" placeholder="Ingresa el apellido" value={formData.apellido} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="legajo" className="text-sm font-medium">Legajo</Label>
                                        <Input id="legajo" placeholder="Ingresa el legajo" value={formData.legajo} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre_usuario" className="text-sm font-medium">Nombre de usuario</Label>
                                        <Input id="nombre_usuario" placeholder="Ingresa el nombre de usuario" value={formData.nombre_usuario} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                        <Input id="email" placeholder="Ingresa el email" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="rol" className="text-sm font-medium">Rol</Label>
                                        <Select id="rol" value={formData.rol} onValueChange={(value) => handleInputChange({ target: { id: 'rol', value } })}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue placeholder="Selecciona el rol" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Administrador">Administrador</SelectItem>
                                                <SelectItem value="Colaborador">Colaborador</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="imagen" className="text-sm font-medium">Imagen</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.imagenPreview ? (
                                            <img src={formData.imagenPreview} alt="Imagen del usuario" className="rounded-md w-16 h-16 object-cover" />
                                        ) : (
                                            <div className="w-16 h-16 border rounded-2xl flex justify-center items-center">
                                                <p className="text-sm text-center font-thin">No hay imagen disponible</p>
                                            </div>
                                        )}
                                        <div className="flex flex-row gap-2">
                                            <Button variant="sipemodalalt" onClick={handleDeleteImage}>Eliminar Imagen</Button>
                                            <input type="file" id="photo" className="hidden" onChange={handleFileChange} />
                                            <Button variant="sipemodal" onClick={() => document.getElementById('photo').click()}>Subir Nueva Imagen</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-4">
                                <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>Cancelar</Button>
                                <Button variant="sipebutton" size="sipebutton" onClick={handleSave}>Guardar</Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default UserEditModal;
