import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function ShelfForm({ onClose, onSubmit, notify }) {
    const [aisles, setAisles] = useState([]);
    const [sides, setSides] = useState([]);
    const [formData, setFormData] = useState({
        numero: '',
        cantidad_estante: '',
        cantidad_division: '',
        idPasillo: '',
        idLado: ''
    });

    useEffect(() => {
        axios.get('http://localhost:8081/aisle')
            .then(response => {
                setAisles(response.data);
            })
            .catch(error => {
                console.error('Error fetching aisles:', error);
                notify('error', 'Error al cargar pasillos');
            });
    }, [notify]);
    

    const fetchSidesByAisle = (aisleId) => {
        axios.get(`http://localhost:8081/sides/${aisleId}`)
            .then(response => setSides(response.data))
            .catch(error => console.error('Error fetching sides:', error));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            // Validación para asegurarse de que las cantidades sean mayores que 0
            if (formData.cantidad_estante <= 0) {
                notify('error', "La cantidad de estantes debe ser mayor que 0");
                return;
            }
    
            if (formData.cantidad_division <= 0) {
                notify('error', "La cantidad de divisiones debe ser mayor que 0");
                return;
            }

            if(formData.numero <= 0) {
                notify('error', "El número de estante debe ser mayor a 0");
                return;
            }
    
            const response = await axios.post('http://localhost:8081/addShelf', formData);
    
            if (response.status !== 200 || response.data.error) {
                throw new Error(response.data.error || "Error al agregar estantería");
            }
    
            notify('success', "¡Estantería creada con éxito!");
    
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
            console.error('Error al agregar la estantería:', error);
        
            // Verificar si el error tiene una respuesta del backend y mostrar su mensaje
            if (error.response && error.response.data && error.response.data.error) {
                notify('error', error.response.data.error);
            } else {
                notify('error', error.message || "Error al agregar estantería");
            }
        }
    };
    
    

    const handleCancel = () => {
        if (onClose) onClose(); // Llama a la función de cierre pasada como prop
    };

    return (
        <>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nueva estantería</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="cantidad_estante" className="text-sm font-medium">
                                Número de estantería
                            </Label>
                            <Input
                                className="border-b"
                                id="numero"
                                name="numero"
                                type="number"
                                placeholder="Ingresa el número de la estantería"
                                value={formData.numero}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="cantidad_estante" className="text-sm font-medium">
                                Cantidad de estantes
                            </Label>
                            <Input
                                className="border-b"
                                id="cantidad_estante"
                                name="cantidad_estante"
                                type="number"
                                placeholder="Ingresa la cantidad de estantes"
                                value={formData.cantidad_estante}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="cantidad_division" className="text-sm font-medium">
                                Cantidad de divisiones
                            </Label>
                            <Input
                                className="border-b"
                                id="cantidad_division"
                                name="cantidad_division"
                                type="number"
                                placeholder="Ingresa la cantidad de divisiones"
                                value={formData.cantidad_division}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <div className="flex w-full gap-4">
                            <Select
                                id="aisle"
                                onValueChange={(value) => {
                                    handleSelectChange('idPasillo', value);
                                    fetchSidesByAisle(value); // Fetch sides based on aisle selection
                                }}
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Pasillo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aisles.map((aisle) => (
                                        <SelectItem key={aisle.id} value={aisle.id}>{aisle.numero}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                id="aisle-side"
                                onValueChange={(value) => handleSelectChange('idLado', value)}
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Lado de pasillo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sides.map((side) => (
                                        <SelectItem key={side.id} value={side.id}>{side.descripcion}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
        </>
    )
}

export default ShelfForm;
