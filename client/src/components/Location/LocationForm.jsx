import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function LocationForm({ onClose, onSubmit, notify }) {
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


    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:8081/addLocation', formData);
    
            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al agregar ubicación");
            }
    
            notify('success', "¡Ubicación agregada correctamente!");
    
            if (onClose) onClose();
            
            // Ejecuta onSubmit con el delay
            setTimeout(() => {
                if (onSubmit) onSubmit(); // Ejecutar onSubmit después del delay
                
                // Verificar si no estamos en el tutorial y recargar la página
                const isInTutorial = localStorage.getItem('inTutorial');
                if (!isInTutorial || isInTutorial === 'false') {
                    window.location.reload(); // Recargar la página si no estamos en el tutorial
                }
            }, 2000);
        } catch (error) {
            console.error('Error al agregar el Ubicación:', error);
            notify('error', error.message || "Error al agregar Ubicación");
        }
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4">
            <CardHeader>
                <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nueva Ubicación</CardTitle>
                <hr className="text-sipe-gray" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="nombre" className="text-sm font-medium">Nombre de la Ubicación</Label>
                        <Input
                            className="border-b"
                            id="nombre"
                            name="nombre"
                            placeholder="Ingresa el nombre del Ubicación"
                            value={formData.nombre}
                            onChange={handleInputChange}
                        />
                    </div>
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

export default LocationForm;