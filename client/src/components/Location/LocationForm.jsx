import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function LocationForm({ onClose, onSubmit, notify, isTutorial = false }) {
    const [formData, setFormData] = useState({ 
        nombre: '', 
        idUbicacion: '' 
    });
    const [ubicaciones, setUbicaciones] = useState([]);

    useEffect(() => {
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
        
        if (isTutorial && formData.nombre.trim() === '') {
            notify('error', 'Debes ingresar un nombre'); 
            return; 
        }

        try {
            const response = await axios.post('http://localhost:8081/addLocation', formData);

            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al agregar ubicación");
            }

            if (!isTutorial) {
                notify('success', "¡Ubicación agregada correctamente!");
            }

            if (onClose) onClose();

            const UbicacionId = response.data.id;

            if (onSubmit) onSubmit(UbicacionId);  
            
            const isInTutorial = localStorage.getItem('inTutorial');
            if (!isInTutorial || isInTutorial === 'false') {
                window.location.reload(); 
            }
        } catch (error) {
            console.error('Error al agregar la Ubicación:', error);
            notify('error', error.message || "Error al agregar Ubicación");
        }
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-3xl text-center font-bold mb-2">
                    {isTutorial ? "Por favor, indicá la primer ubicación" : "Agregar nueva ubicación"}
                </CardTitle>
                {isTutorial ? "" : <hr className="text-sipe-gray" />}
            </CardHeader>
            <CardContent className="flex flex-col space-y-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        {isTutorial ? "" : <Label htmlFor="nombre" className="text-sm font-medium">Nombre de la ubicación</Label>}
                        <Input
                            className="border-b text-center"
                            id="nombre"
                            name="nombre"
                            placeholder="Ingresa el nombre del ubicación"
                            value={formData.nombre}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {isTutorial ?
                    "" :
                    <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>
                        CANCELAR
                    </Button>
                }
                <Button variant="sipebutton" size="sipebutton" onClick={handleSubmit}>
                    AGREGAR
                </Button>
            </CardFooter>
        </Card>
    );
}

export default LocationForm;