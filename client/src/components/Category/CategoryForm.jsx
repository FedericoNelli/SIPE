import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function CategoryForm({ onClose, onSubmit, notify, isTutorial = false, currentStep, handlePreviousStep, ubicacionId, depositoId}) {

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        idUbicacion: ubicacionId || '', // Usamos el idUbicacion pasado desde DepositForm
        idDeposito: depositoId || '', // Usamos el idDeposito pasado desde DepositForm
        idCategoria: ''
    });

    const [ubicaciones, setUbicaciones] = useState([]);
    const [depositos, setDepositos] = useState([]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose(); // Cierra el modal cuando se presiona Escape
            }
        };

        document.addEventListener('keydown', handleEscape);

        // Limpia el evento cuando el componente se desmonta
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

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

        axios.get('http://localhost:8081/deposits')
            .then(response => {
                setDepositos(response.data);
            })
            .catch(error => {
                console.error('Error al obtener depósitos:', error);
                notify('error', 'Error al cargar depósitos');
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

        if (isTutorial && formData.descripcion.trim() === '') {
            notify('error', 'Debes ingresar un nombre');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/addCategory', formData);

            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al agregar categoría");
            }

            if (!isTutorial) {
                notify('success', "¡Categoría agregada correctamente!");
            }

            if (onClose) onClose();

            const idUbicacion = ubicacionId;
            const idDeposito = depositoId;
            const idCategoria = response.data.id;

            if (onSubmit) onSubmit(idUbicacion, idDeposito, idCategoria);

            // Verificar si no estamos en el tutorial y recargar la página
            const isInTutorial = localStorage.getItem('inTutorial');
            if (!isInTutorial || isInTutorial === 'false') {
                window.location.reload(); // Recargar la página si no estamos en el tutorial
            }

        } catch (error) {
            console.error('Error al agregar la categoría:', error);
            notify('error', error.message || "Error al agregar categoría");
        }
    };

    const handleCancel = async () => {
        if (!isTutorial) {
            // Lógica normal de cancelación si no estamos en tutorial
            if (onClose) onClose();
        } else {
            // Lógica cuando estamos en el tutorial y debemos volver al paso anterior
            if (currentStep === 2 && depositoId) {
                try {
                    // Eliminar el depósito creado cuando se vuelve al paso anterior
                    await axios.delete(`http://localhost:8081/deposits/delete/${depositoId}`);
                    notify('info', "Depósito eliminado. Volviendo al paso anterior...");
                } catch (error) {
                    console.error('Error al eliminar el depósito:', error);
                    notify('error', "No se pudo eliminar el depósito. Intenta nuevamente.");
                }
            }

            // Llamar a la función para volver al paso anterior en el tutorial
            handlePreviousStep();
        }
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-3xl text-center font-bold mb-2">
                    {isTutorial ? "Por favor, creá la primer categoría" : "Agregar nueva Categoría"}
                </CardTitle>
                {isTutorial ? "" : <hr className="text-sipe-gray" />}
            </CardHeader>
            <CardContent className="flex flex-col space-y-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        {isTutorial ? "" : <Label htmlFor="descripcion" className="text-sm font-medium">Descripción de la categoría</Label>}
                        <Input
                            className="border-b text-center"
                            id="descripcion"
                            name="descripcion"
                            placeholder="Ingresa la descripción de la categoría"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                        />
                    </div>
                    {isTutorial ? <div className='flex flex-row justify-center gap-2'>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {ubicaciones.find(u => u.id === formData.idUbicacion)?.nombre || "Sin ubicación seleccionada"}
                        </span>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {depositos.find(u => u.id === formData.idDeposito)?.nombreDeposito || "Sin depósito seleccionado"}
                        </span>
                    </div>
                    : ("")
                    }
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
        </Card >
    );
}

export default CategoryForm;
