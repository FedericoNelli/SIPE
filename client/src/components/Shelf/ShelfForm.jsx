import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function ShelfForm({ onClose, onSubmit, notify, isTutorial = false, currentStep, handlePreviousStep, ubicacionId, depositoId, categoriaId, pasilloId, onShelfUpdated }) {
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
    const [pasillos, setPasillos] = useState([]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose(); // Cierra el modal cuando se presiona Escape
            } onShelfUpdated();
        };
        document.addEventListener('keydown', handleEscape);

        // Limpia el evento cuando el componente se desmonta
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

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
                console.error('Error al obtener lados:', error);
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
                console.error('Error al obtener categorias:', error);
                notify('error', 'Error al cargar categorias');
            });

        axios.get('http://localhost:8081/aisles-shelves')
            .then(response => {
                setPasillos(response.data);
            })
            .catch(error => {
                console.error('Error al obtener pasillos:', error);
                notify('error', 'Error al cargar pasillos');
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
        if (value === '' || /^[1-9]\d*$/.test(value)) {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        } else {
            if (parseInt(value, 10) < 0) {
                const errorMessage = {
                    cantidad_estante: "La cantidad de estantes debe ser mayor que 0",
                    cantidad_division: "La cantidad de divisiones debe ser mayor que 0",
                    numero: "El número de estante debe ser mayor a 0"
                };
                notify('error', errorMessage[name] || "El valor debe ser mayor a 0");
            }
        }
    };


    const handleSelectChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {

            const response = await axios.post('http://localhost:8081/addShelf', formData);

            if (response.status !== 200 || response.data.error) {
                throw new Error(response.data.error || "Error al agregar estantería");
            }
            if (!isTutorial) {
                notify('success', "¡Estantería creada con éxito!");
                onShelfUpdated();
                onClose();
            }
            if (onClose) onClose();

            const idUbicacion = ubicacionId;
            const idDeposito = depositoId;
            const idCategoria = categoriaId;
            const idPasillo = pasilloId;

            if (onSubmit) onSubmit(idUbicacion, idDeposito, idCategoria, idPasillo, response.data.result.id); // Ejecutar onSubmit después del delay

            // Verificar si no estamos en el tutorial y recargar la página
            const isInTutorial = localStorage.getItem('inTutorial');
            if (!isInTutorial || isInTutorial === 'false') {
                onShelfUpdated();
                onClose();
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
            if (currentStep === 4 && pasilloId) {
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
                        {isTutorial ? "Por favor, creá la primer estantería" : "Agregar nueva Estantería"}
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
                    {isTutorial ? "" :
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
                                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={location.id} value={location.id}>{location.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Select de Depósito */}
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium">Depósito</Label>
                                    {deposits.length > 0 ? (
                                        <Select onValueChange={(value) => {
                                            setSelectedDeposit(value);
                                            fetchAislesByDeposit(value);
                                        }}>
                                            <SelectTrigger className="w-36 bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue placeholder="Depósito" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {deposits.map((deposit) => (
                                                    <SelectItem
                                                        className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg"
                                                        key={deposit.id}
                                                        value={deposit.id}
                                                    >
                                                        {deposit.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-sipe-gray">No existen depósitos</p>
                                    )}
                                </div>

                            </div>
                        </div>}

                    {/* Sección de Pasillo y Lado */}
                    <div className="flex flex-col gap-4">
                        <div className="flex w-full gap-4 flex-wrap items-center">
                            {/* Select de Pasillo */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Pasillo</Label>
                                {(isTutorial ? pasillos.length : aisles.length) > 0 && deposits.length > 0 ? (
                                    <Select
                                        onValueChange={(value) => {
                                            handleSelectChange('idPasillo', value);
                                            fetchSidesByAisle(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-36 bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                            <SelectValue placeholder="Pasillo" />
                                        </SelectTrigger>
                                        {isTutorial ? (
                                            <SelectContent>
                                                {pasillos.map((aisle) => (
                                                    <SelectItem
                                                        className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg"
                                                        key={aisle.id}
                                                        value={aisle.id}
                                                    >
                                                        {aisle.numero}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        ) : (
                                            <SelectContent>
                                                {aisles.map((aisle) => (
                                                    <SelectItem
                                                        className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg"
                                                        key={aisle.id}
                                                        value={aisle.id}
                                                    >
                                                        {aisle.numero}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        )}
                                    </Select>
                                ) : (
                                    <p className="text-sipe-gray">No existen pasillos</p>
                                )}
                            </div>

                            {/* Select de Lado del Pasillo */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Lado</Label>
                                {aisles.length && deposits.length > 0 ? (
                                    <Select
                                        onValueChange={(value) => handleSelectChange('idLado', value)}
                                    >
                                        <SelectTrigger className="w-36 bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                            <SelectValue placeholder="Lado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sides.map((side) => (
                                                <SelectItem
                                                    className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg"
                                                    key={side.id}
                                                    value={side.id}
                                                >
                                                    {side.descripcion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="text-sipe-gray">No existen lados disponibles</div>
                                )}
                            </div>
                        </div>

                    </div>
                    {isTutorial ? <div className='flex flex-row justify-center gap-2'>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {ubicaciones.find(u => u.id === formData.idUbicacion)?.nombre || "Sin ubicación seleccionada"}
                        </span>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {depositos.find(u => u.id === formData.idDeposito)?.nombreDeposito || "Sin depósito seleccionado"}
                        </span>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {categorias.find(u => u.id === formData.idCategoria)?.descripcion || "Sin categoría seleccionado"}
                        </span>
                        <span className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg px-4 py-2">
                            {"Pasillo " + (pasillos.find(u => u.id === formData.idPasillo)?.numero || "Sin pasillo seleccionado")}
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
