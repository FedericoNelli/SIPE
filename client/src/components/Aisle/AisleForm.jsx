import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function AisleForm({ onClose, onSubmit, notify, isTutorial = false, currentStep, handlePreviousStep, ubicacionId, depositoId, categoriaId, onAisleUpdated }) {

    const [locations, setLocations] = useState([]);
    const [depositNames, setDepositNames] = useState([]);

    const [sides, setSides] = useState([]);
    const [showSecondSide, setShowSecondSide] = useState(false);
    const [formData, setFormData] = useState({
        numero: '',
        idUbicacion: ubicacionId || '',
        idDeposito: depositoId || '',
        idCategoria: categoriaId || '',
        idLado1: 1,
        idLado2: null // Inicialmente null porque puede no haber segundo lado
    });

    const [ubicaciones, setUbicaciones] = useState([]);
    const [depositos, setDepositos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose(); // Cierra el modal cuando se presiona Escape
            }
            onAisleUpdated();
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    useEffect(() => {
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
        if (value === '' || /^[1-9]\d*$/.test(value)) {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        } else {
            if (parseInt(value, 10) < 0) {
                const errorMessage = {
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
            const dataToSend = {
                ...formData,
                idLado2: formData.idLado2 || null
            };
            const response = await axios.post('http://localhost:8081/addAisle', dataToSend);
            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al agregar pasillo");
            }
            if (!isTutorial) {
                notify('success', "¡Pasillo creado con éxito!");
                onAisleUpdated();
                onClose();
            }
            if (onClose) onClose();
            const idUbicacion = ubicacionId;
            const idDeposito = depositoId;
            const idCategoria = categoriaId;
            if (onSubmit) onSubmit(idUbicacion, idDeposito, idCategoria, response.data.id); // Ejecutar onSubmit después del delay
            // Verificar si no estamos en el tutorial y recargar la página
            const isInTutorial = localStorage.getItem('inTutorial');
            if (!isInTutorial || isInTutorial === 'false') {
                onAisleUpdated();
                onClose();
            }
        } catch (error) {
            console.error('Error al agregar el pasillo:', error);
            if (error.response && error.response.data && error.response.data.error) {
                notify('error', error.response.data.error);
            } else {
                notify('error', "Error al agregar pasillo");
            }
        }

    };

    const handleCancel = async () => {
        if (!isTutorial) {
            // Lógica normal de cancelación si no estamos en tutorial
            if (onClose) onClose();
        } else {
            // Lógica cuando estamos en el tutorial y debemos volver al paso anterior
            if (currentStep === 3 && categoriaId) {
                try {
                    // Eliminar la categoría creado cuando se vuelve al paso anterior
                    await axios.delete(`http://localhost:8081/category/delete/${categoriaId}`);
                    notify('info', "Categoría eliminada. Volviendo al paso anterior...");
                } catch (error) {
                    console.error('Error al eliminar la categoría', error);
                    notify('error', "No se pudo eliminar la categoría. Intenta nuevamente.");
                }
            }
            handlePreviousStep();
        }
    };

    return (
        <>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">
                        {isTutorial ? "Por favor, creá el primer pasillo" : "Agregar nuevo Pasillo"}
                    </CardTitle>
                    {isTutorial ? "" : <hr className="text-sipe-gray" />}
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                    {/* Input para el número de pasillo */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="numero" className="text-sm font-medium">
                                {isTutorial ? "" : "Número de Pasillo"}
                            </Label>
                            <Input
                                className="border-b text-center"
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
                    {isTutorial ? ("") :
                        (
                            <div className="flex items-center gap-4">
                                <Label className="text-sm font-medium">Ubicación</Label>
                                <div className="flex w-full gap-4">
                                    <Select id="location" onValueChange={(value) => handleSelectChange('idUbicacion', value)}>
                                        <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                            <SelectValue placeholder="Seleccione la ubicación" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((location) => (
                                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={location.id} value={location.id}>{location.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                    {/* Select de depósito (cambia según la ubicación seleccionada) */}
                    {isTutorial ? ("") :
                        (
                            <div className="flex items-center gap-4">
                                <Label className="text-sm font-medium">Depósito</Label>
                                <div className="flex w-full gap-4">
                                    {depositNames.length > 0 ? (
                                        <Select id="aisle" onValueChange={(value) => handleSelectChange('idDeposito', value)}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue placeholder="Seleccione el depósito" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {depositNames.map((deposit) => (
                                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={deposit.id} value={deposit.id}>
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

                        )}

                    {/* Select de lado 1 */}
                    <div className="flex items-center gap-4">
                        <div className="flex w-full gap-4">
                            {depositNames.length === 0 ? (
                                <div className="text-sipe-gray">No hay lados disponibles</div>
                            ) : (
                                <Select id="lado1" onValueChange={(value) => handleSelectChange('idLado1', value)}>
                                    <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Seleccione el lado" />
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
                            )}
                        </div>
                    </div>

                    {/* Si hay lados disponibles, mostramos el botón y la lógica para agregar otro lado */}
                    {depositNames.length > 0 && (
                        <>
                            {showSecondSide && (
                                <div className="flex items-center gap-4">
                                    <div className="flex w-full gap-4">
                                        <Select id="lado2" onValueChange={(value) => handleSelectChange('idLado2', value)}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue placeholder="Seleccione el segundo lado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sides
                                                    .filter((side) => side.id !== formData.idLado1)
                                                    .map((side) => (
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
                                    </div>
                                </div>
                            )}
                            {/* Botón para agregar otro lado */}
                            {!showSecondSide && (
                                <div className="flex justify-start">
                                    <Button variant="sipebuttonalt2" size="sipebutton" onClick={() => setShowSecondSide(true)}>
                                        AGREGAR LADO NUEVO
                                    </Button>
                                </div>
                            )}
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
                            </div>
                                : ("")
                            }
                        </>
                    )}
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

export default AisleForm;
