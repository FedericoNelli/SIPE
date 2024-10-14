import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function DepositForm({ onClose, onSubmit, notify, isTutorial = false, currentStep, handlePreviousStep, ubicacionId }) {

    const [formData, setFormData] = useState(() => JSON.parse(localStorage.getItem('depositFormData')) || {
        nombre: '',
        idUbicacion: ubicacionId || '', 
        idDeposito: ''
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

    const handleSelectChange = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            idUbicacion: value
        }));
    };

    const handleSubmit = async () => {
        
        if (isTutorial && formData.nombre.trim() === '') {
            notify('error', 'Debes ingresar un nombre'); 
            return; 
        }
    
        try {
            const response = await axios.post('http://localhost:8081/addDeposit', formData);
    
            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al agregar depósito");
            }
    
            if (!isTutorial) {
                notify('success', "¡Depósito agregado correctamente!");
            }
            
            if (onClose) onClose();
            
            const idUbicacion = ubicacionId;
            
            if (onSubmit) onSubmit(idUbicacion, response.data.id);
    
            const isInTutorial = localStorage.getItem('inTutorial');
            if (!isInTutorial || isInTutorial === 'false') {
                window.location.reload(); 
            }
    
        } catch (error) {
            console.error('Error al agregar el depósito:', error);
            notify('error', error.message || "Error al agregar depósito");
        }
    };


    const handleCancel = async () => {
        if (!isTutorial) {
            
            if (onClose) onClose();
        } else {
            
            if (currentStep === 2 && ubicacionId) { 
                try {
                    
                    await axios.delete(`http://localhost:8081/locations/delete/${ubicacionId}`);
                    notify('info', "Ubicación eliminada. Volviendo al paso anterior...");
                } catch (error) {
                    console.error('Error al eliminar la ubicación:', error);
                    notify('error', "No se pudo eliminar la ubicación. Intenta nuevamente.");
                }
            }

            handlePreviousStep();
        }
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-3xl text-center font-bold mb-2">
                    {isTutorial ? "Por favor, creá el primer depósito" : "Agregar nuevo Depósito"}
                </CardTitle>
                {isTutorial ? "" : <hr className="text-sipe-gray" />}
            </CardHeader>
            <CardContent className="flex flex-col space-y-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Input
                            className="border-b text-center"
                            id="nombre"
                            name="nombre"
                            placeholder="Ingresá el nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <Label className="text-sm font-medium">
                        {isTutorial ? "" : "Ubicación"}
                    </Label>
                    {isTutorial ? (
                        // Si es tutorial, mostramos directamente el nombre de la ubicación en lugar del id
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {ubicaciones.find(u => u.id === formData.idUbicacion)?.nombre || "Sin ubicación seleccionada"}
                        </span>
                    ) : (
                        // Si no es tutorial, mostramos el Select como siempre
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
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>
                    {isTutorial ? "VOLVER" : "CANCELAR"}
                </Button>
                <Button variant="sipebutton" size="sipebutton" onClick={handleSubmit}>
                    AGREGAR
                </Button>
            </CardFooter>
        </Card>
    );
}

export default DepositForm;