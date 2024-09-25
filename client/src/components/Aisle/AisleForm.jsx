import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function AisleForm({ onClose, onSubmit, notify }) {
    const [locations, setLocations] = useState([]);
    const [depositNames, setDepositNames] = useState([]);
    const [sides, setSides] = useState([]);  
    const [showSecondSide, setShowSecondSide] = useState(false);
    const [formData, setFormData] = useState({
        numero: '',
        idUbicacion: '',
        idDeposito: '',
        idLado1: 1,
        idLado2: null // Inicialmente null porque puede no haber segundo lado
    });

    useEffect(() => {
        axios.get('http://localhost:8081/deposit-locations')
            .then(response => {
                setLocations(response.data);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
                notify('error', 'Error al cargar ubicaciones');
            });

        // Obtener los lados (lado derecho e izquierdo)
        axios.get('http://localhost:8081/sides')
            .then(response => {
                setSides(response.data);
            })
            .catch(error => {
                console.error('Error fetching sides:', error);
                notify('error', 'Error al cargar lados');
            });
    }, [notify]);

    // Obtener depósitos basados en la ubicación seleccionada
    useEffect(() => {
        if (formData.idUbicacion) {
            axios.get(`http://localhost:8081/deposit-names?locationId=${formData.idUbicacion}`)
                .then(response => {
                    setDepositNames(response.data);
                })
                .catch(error => {
                    console.error('Error fetching deposit names:', error);
                });
        } else {
            setDepositNames([]);
        }
    }, [formData.idUbicacion]);

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
            if (formData.numero <= 0) {
                notify('error', "El número de pasillo debe ser mayor que 0");
                return;
            }
            // Asegurar que `idLado2` sea `null` si no se selecciona
            const dataToSend = {
                ...formData,
                idLado2: formData.idLado2 || null
            };
            const response = await axios.post('http://localhost:8081/addAisle', dataToSend);
    
            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al agregar pasillo");
            }
            notify('success', "¡Pasillo creado con éxito!");

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
            console.error('Error al agregar el pasillo:', error);
            notify('error', error.message || "Error al agregar pasillo");
        }
    };
    
    

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nuevo pasillo</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                    {/* Input para el número de pasillo */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="numero" className="text-sm font-medium">
                                Número de Pasillo
                            </Label>
                            <Input
                                className="border-b"
                                id="numero"
                                name="numero"
                                type="number"
                                placeholder="Ingresa el número de pasillo"
                                value={formData.numero}
                                onChange={handleChange}
                                min="0" // Para que no permita números menores a 1
                            />
                        </div>
                    </div>

                    {/* Select de ubicación */}
                    <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <div className="flex w-full gap-4">
                            <Select id="location" onValueChange={(value) => handleSelectChange('idUbicacion', value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccione la ubicación" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((location) => (
                                        <SelectItem key={location.id} value={location.id}>{location.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Select de depósito (cambia según la ubicación seleccionada) */}
                    <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Depósito</Label>
                        <div className="flex w-full gap-4">
                            <Select id="aisle" onValueChange={(value) => handleSelectChange('idDeposito', value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccione el depósito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {depositNames.map((deposit) => (
                                        <SelectItem key={deposit.id} value={deposit.id}>{deposit.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Select de lado 1 */}
                    <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Lado 1</Label>
                        <div className="flex w-full gap-4">
                            <Select id="lado1" onValueChange={(value) => handleSelectChange('idLado1', value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccione el lado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sides.map((side) => (
                                        <SelectItem key={side.id} value={side.id}>{side.descripcion}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Si se selecciona "Agregar Otro Lado", mostramos el segundo select */}
                    {showSecondSide && (
                        <div className="flex items-center gap-4">
                            <Label className="text-sm font-medium">Lado 2</Label>
                            <div className="flex w-full gap-4">
                                <Select id="lado2" onValueChange={(value) => handleSelectChange('idLado2', value)}>
                                    <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Seleccione el segundo lado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sides.map((side) => (
                                            <SelectItem key={side.id} value={side.id}>{side.descripcion}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Botón para agregar otro lado */}
                    {!showSecondSide && (
                        <div className="flex justify-start">
                            <Button variant="sipebutton" size="sipebutton" onClick={() => setShowSecondSide(true)}>
                                Agregar Otro Lado
                            </Button>
                        </div>
                    )}
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

export default AisleForm;
