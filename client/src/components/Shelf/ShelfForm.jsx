import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function ShelfForm({ onClose, onSubmit, notify, isTutorial = false, currentStep, handlePreviousStep, ubicacionId, depositoId, categoriaId, pasilloId }) {
    const [aisles, setAisles] = useState([]);
    const [sides, setSides] = useState([]);
    const [locations, setLocations] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedDeposit, setSelectedDeposit] = useState('');
    const [formData, setFormData] = useState({
        numero: '',
        cantidad_estante: '',
        cantidad_division: '',
        idPasillo: '',
        idLado: '',
        idUbicacion: ubicacionId || '',
        idDeposito: depositoId || '',
        idCategoria: categoriaId || '',
        idPasillo: pasilloId || ''
    });

    const [ubicaciones, setUbicaciones] = useState([]);
    const [depositos, setDepositos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [locations, setLocations] = useState([]);


    useEffect(() => {
        // Cargar ubicaciones
        axios.get('http://localhost:8081/deposit-locations')
            .then(response => {
                setLocations(response.data);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
                notify('error', 'Error al cargar ubicaciones');
            });

        axios.get('http://localhost:8081/deposit-locations')
            .then(response => {
                setLocations(response.data);
                setUbicaciones(response.data);
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

        axios.get('http://localhost:8081/deposits')
            .then(response => {
                setDepositos(response.data);
            })
            .catch(error => {
                console.error('Error al obtener depósitos:', error);
                notify('error', 'Error al cargar depósitos');
            });

        axios.get('http://localhost:8081/categories')
            .then(response => {
                setCategorias(response.data);
            })
            .catch(error => {
                console.error('Error al obtener depósitos:', error);
                notify('error', 'Error al cargar depósitos');
            });
    }, [notify]);

    const fetchDepositsByLocation = (locationId) => {
        // Obtener depósitos por ubicación
        axios.get(`http://localhost:8081/deposit-names?locationId=${locationId}`)
            .then(response => {
                setDeposits(response.data);
            })
            .catch(error => {
                console.error('Error fetching deposits:', error);
                notify('error', 'Error al cargar depósitos');
            });
    };

    const fetchAislesByDeposit = (depositoId) => {
        axios.get(`http://localhost:8081/aisles`, {
            params: { depositoId }
        })
            .then(response => setAisles(response.data))
            .catch(error => console.error('Error fetching aisles:', error));
    };

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

            if (formData.numero <= 0) {
                notify('error', "El número de estante debe ser mayor a 0");
                return;
            }

            const response = await axios.post('http://localhost:8081/addShelf', formData);

            if (response.status !== 200 || response.data.error) {
                throw new Error(response.data.error || "Error al agregar estantería");
            }

            if (!isTutorial) {
                notify('success', "¡Estantería creada con éxito!");
            }

            if (onClose) onClose();

            const idUbicacion = ubicacionId;
            const idDeposito = depositoId;
            const idCategoria = categoriaId;
            const idPasillo = pasilloId;

            if (onSubmit) onSubmit(idUbicacion, idDeposito, idCategoria, idPasillo, response.data.result.insertId); // Ejecutar onSubmit después del delay

            // Verificar si no estamos en el tutorial y recargar la página
            const isInTutorial = localStorage.getItem('inTutorial');
            if (!isInTutorial || isInTutorial === 'false') {
                window.location.reload(); // Recargar la página si no estamos en el tutorial
            }

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

    const handleCancel = async () => {
        if (!isTutorial) {
            // Lógica normal de cancelación si no estamos en tutorial
            if (onClose) onClose();
        } else {
            // Lógica cuando estamos en el tutorial y debemos volver al paso anterior
            if (currentStep === 5 && pasilloId) {
                try {
                    // Eliminar la categoría creado cuando se vuelve al paso anterior
                    await axios.delete(`http://localhost:8081/aisle/delete/${pasilloId}`);
                    notify('info', "Pasillo eliminado. Volviendo al paso anterior...");
                } catch (error) {
                    console.error('Error al eliminar el pasillo', error);
                    notify('error', "No se pudo eliminar el pasillo. Intenta nuevamente.");
                }
            }

            // Llamar a la función para volver al paso anterior en el tutorial
            handlePreviousStep();
        }
    };

    return (
        <>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">
                        {isTutorial ? "Por favor, creá la primer estantería" : "Agregar nuevo Estantería"}
                    </CardTitle>
                    {isTutorial ? "" : <hr className="text-sipe-gray" />}
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="cantidad_estante" className="text-sm font-medium">
                                {isTutorial ? "" : "Número de Estantería"}
                            </Label>
                            <Input
                                className="border-b text-center"
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
                                {isTutorial ? "" : "Cantidad de estantes"}
                            </Label>
                            <Input
                                className="border-b text-center"
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
                                {isTutorial ? "" : "Cantidad de divisiones"}
                            </Label>

                            <Input
                                className="border-b text-center"
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
                    {/* Sección combinada de Ubicación y Depósito */}
                    <div className="flex flex-col gap-4">
                        <div className="flex w-full gap-4 flex-wrap items-center">
                            {/* Select de Ubicación */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Ubicación</Label>
                                <Select onValueChange={(value) => {
                                    setSelectedLocation(value);
                                    fetchDepositsByLocation(value);
                                }}>
                                    <SelectTrigger className="w-36 bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Ubicación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((location) => (
                                            <SelectItem key={location.id} value={location.id}>{location.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Select de Depósito */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Depósito</Label>
                                <Select onValueChange={(value) => {
                                    setSelectedDeposit(value);
                                    fetchAislesByDeposit(value);
                                }}>
                                    <SelectTrigger className="w-36 bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Depósito" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deposits.map((deposit) => (
                                            <SelectItem key={deposit.id} value={deposit.id}>{deposit.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Pasillo y Lado */}
                    <div className="flex flex-col gap-4">
                        <div className="flex w-full gap-4 flex-wrap items-center">
                            {/* Select de Pasillo */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Pasillo</Label>
                                <Select
                                    onValueChange={(value) => {
                                        handleSelectChange('idPasillo', value);
                                        fetchSidesByAisle(value);
                                    }}
                                >
                                    <SelectTrigger className="w-36 bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Pasillo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {aisles.map((aisle) => (
                                            <SelectItem key={aisle.id} value={aisle.id}>{aisle.numero}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Select de Lado del Pasillo */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Lado</Label>
                                <Select
                                    onValueChange={(value) => handleSelectChange('idLado', value)}
                                >
                                    <SelectTrigger className="w-36 bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Lado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sides.map((side) => (
                                            <SelectItem key={side.id} value={side.id}>{side.descripcion}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </div>
                    {isTutorial ? <div className='flex flex-row justify-center gap-2'>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {ubicaciones.find(u => u.id === formData.idUbicacion)?.nombre || "Sin ubicación seleccionada"}
                        </span>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {depositos.find(u => u.id === formData.idDeposito)?.nombre || "Sin depósito seleccionado"}
                        </span>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {categorias.find(u => u.id === formData.idCategoria)?.descripcion || "Sin categoría seleccionado"}
                        </span>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {"Pasillo " + (aisles.find(u => u.id === formData.idPasillo)?.numero || "Sin pasillo seleccionado")}
                        </span>
                    </div>
                        : ("")
                    }
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
        </>
    );
}

export default ShelfForm;
