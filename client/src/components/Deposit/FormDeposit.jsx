import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function FormDeposit({ onClose, notify }) {
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
                notify('error', 'Error al cargar ubicaciones');
            });
    }, [notify]);

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

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:8081/addDeposit', formData);
    
            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al agregar depósito");
            }
    
            notify('success', "¡Depósito agregado correctamente!");
    
            if (onClose) onClose();
    
            setTimeout(() => {
                window.location.reload();
            }, 2500);
        } catch (error) {
            console.error('Error al agregar el depósito:', error);
            notify('error', error.message || "Error al agregar depósito");
        }
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
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
    );
}

export default FormDeposit;