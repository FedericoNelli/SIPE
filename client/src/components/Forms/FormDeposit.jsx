import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Cards/Card";
import { Label } from "@/components/Label/Label";
import { Input } from "@/components/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select/Select";
import { Button } from "@/components/Button/Button";
import axios from 'axios'; // Asegúrate de tener axios instalado para las peticiones

function FormDeposit({ onClose }) {
    const [formData, setFormData] = useState({ nombre: '', idUbicacion: '' });
    const [ubicaciones, setUbicaciones] = useState([]);

    useEffect(() => {
        // Cargar ubicaciones cuando el componente se monte
        axios.get('http://localhost:8081/deposit-locations')
            .then(response => {
                setUbicaciones(response.data);
            })
            .catch(error => {
                console.error('Error al obtener ubicaciones:', error);
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSelectChange = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            idUbicacion: value
        }));
    };

    const notify = (type, message) => {
        console.log(`Notificando: tipo=${type}, mensaje=${message}`); // Agrega este log
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            default:
                break;
        }
    };

    const handleSubmit = () => {
        axios.post('http://localhost:8081/addDeposit', formData)
            .then(response => {
                notify('success', "¡Depósito Agregado Correctamente!", response.data);
                if (onClose) onClose();
            })
            .catch(error => {
                console.error('Error al agregar depósito:', error);
                notify('error', "Error al agregar depósito");
            });
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <>
        <ToastContainer />
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nuevo Depósito</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="nombre" className="text-sm font-medium">Nombre del depósito</Label>
                            <Input
                                className="border-b"
                                id="nombre"
                                name="nombre"
                                placeholder="Ingresa el nombre del depósito"
                                value={formData.nombre}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <Select
                            value={formData.idUbicacion}
                            onValueChange={handleSelectChange}
                            className="w-full"
                        >
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona una ubicación" />
                            </SelectTrigger>
                            <SelectContent>
                                {ubicaciones.map((ubicacion) => (
                                    <SelectItem key={ubicacion.id} value={ubicacion.id}>
                                        {ubicacion.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>
                        CANCELAR
                    </Button>
                    <Button variant="sipebutton" size="sipebutton" onClick={handleSubmit}>
                        AGREGAR
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}

export default FormDeposit;
