import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { X } from 'lucide-react';

const ShelfEditModal = ({ onClose, onShelfUpdated, notify }) => {
    const [shelves, setShelves] = useState([]); // Lista de estanterías para seleccionar
    const [selectedShelfId, setSelectedShelfId] = useState(''); // Estantería seleccionada
    const [shelfData, setShelfData] = useState(null);
    const [aisles, setAisles] = useState([]);
    const [sides, setSides] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state to prevent double messages
    const [shelfNumber, setShelfNumber] = useState('');
    const [shelfQuantity, setShelfQuantity] = useState('');
    const [divisionQuantity, setDivisionQuantity] = useState('');
    const [selectedAisle, setSelectedAisle] = useState('');
    const [selectedSide, setSelectedSide] = useState('');
    const filteredSides = sides.filter((side) => side.idPasillo === selectedAisle?.id);


    // Cerrar modal al presionar la tecla Escape
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);


    // Cargar la lista de estanterías
    useEffect(() => {
        const fetchShelves = async () => {
            try {
                const response = await axios.get('http://localhost:8081/shelves');
                setShelves(response.data);
            } catch (error) {
                notify('error', 'Error al cargar las estanterías');
            }
        };

        fetchShelves();
    }, []);

    // Cargar los datos de la estantería seleccionada
    useEffect(() => {
        if (selectedShelfId) {
            const fetchShelfData = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/shelf/${selectedShelfId}`);
                    const data = response.data;

                    // Establecer los datos de la estantería
                    setShelfData(data);
                    setShelfNumber(data.numero);
                    setShelfQuantity(data.cantidad_estante);
                    setDivisionQuantity(data.cantidad_division);

                    // Configurar el pasillo seleccionado
                    const aisle = aisles.find((a) => a.id === data.idPasillo);
                    setSelectedAisle(aisle || '');

                    // Configurar el lado seleccionado
                    const side = sides.find((s) => s.id === data.idLado);
                    setSelectedSide(side ? side.id : '');
                } catch (error) {
                    notify('error', 'Error al cargar los datos de la estantería');
                }
            };

            fetchShelfData();
        }
    }, [selectedShelfId, aisles, sides]);



    // Cargar pasillos
    useEffect(() => {
        const fetchAisles = async () => {
            try {
                const response = await axios.get('http://localhost:8081/aisles');
                setAisles(response.data);
            } catch (error) {
                notify('error', 'Error al cargar los pasillos');
            }
        };

        fetchAisles();
    }, []);

    useEffect(() => {
        const fetchSidesForAisle = async () => {
            try {
                const response = await axios.get('http://localhost:8081/aisles-shelves');

                const transformedSides = response.data.flatMap((aisle) => {
                    const sides = [];
                    if (aisle.idLado1 && aisle.lado1Descripcion !== 'Sin lado') {
                        sides.push({
                            id: aisle.idLado1, // ID del lado 1
                            descripcion: aisle.lado1Descripcion, // Descripción del lado 1
                            idPasillo: aisle.id, // ID del pasillo
                        });
                    }
                    if (aisle.idLado2 && aisle.lado2Descripcion !== 'Sin lado') {
                        sides.push({
                            id: aisle.idLado2, // ID del lado 2
                            descripcion: aisle.lado2Descripcion, // Descripción del lado 2
                            idPasillo: aisle.id, // ID del pasillo
                        });
                    }
                    return sides;
                });

                setSides(transformedSides);
            } catch (error) {
                console.error('Error al cargar los lados relacionados con los pasillos:', error);
                notify('error', 'Error al cargar los lados relacionados con los pasillos');
            }
        };
        fetchSidesForAisle();
    }, []);


    const handleUpdateShelf = async () => {
        setLoading(true);
        console.log({
            numero: shelfNumber,
            cantidad_estante: shelfQuantity,
            cantidad_division: divisionQuantity,
            idPasillo: selectedAisle?.id,
            idLado: selectedSide, // Verifica que este valor sea 1 o 2
        });

        try {
            const response = await axios.put(`http://localhost:8081/edit-shelf/${selectedShelfId}`, {
                numero: shelfNumber,
                cantidad_estante: shelfQuantity,
                cantidad_division: divisionQuantity,
                idPasillo: selectedAisle?.id,
                idLado: selectedSide
            });
            if (response.status === 200 || response.status === 201) {
                notify('success', 'Estantería actualizada correctamente');
                onShelfUpdated();
                onClose();
            } else {
                notify('error', 'Error al actualizar la estantería');
            }
        } catch (error) {
            console.error('Error actualizando la estantería:', error);
            if (error.response && error.response.data && error.response.data.error) {
                notify('error', error.response.data.error);
            } else {
                notify('error', 'Para modificar este campo debe vaciar la estantería');
            }
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e) => {
        const { id, value } = e.target;
        // Permite que el campo esté vacío o solo valores mayores a 0
        if (value === '' || /^[1-9]\d*$/.test(value)) {
            // Actualiza el estado correspondiente basado en el id del input
            if (id === 'shelfNumber') setShelfNumber(value);
            if (id === 'shelfQuantity') setShelfQuantity(value);
            if (id === 'divisionQuantity') setDivisionQuantity(value);
        } else {
            // Si el valor es 0 o negativo, muestra el mensaje de error
            const errorMessage = {
                shelfNumber: "El número de estantería debe ser mayor a 0",
                shelfQuantity: "La cantidad de estantes debe ser mayor que 0",
                divisionQuantity: "La cantidad de divisiones debe ser mayor que 0"
            };
            notify('error', errorMessage[id] || "El valor debe ser mayor a 0");
        }
    };



    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl w-full max-w-2xl">
                <Card className="bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar estantería</CardTitle>
                        <hr />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="shelf" className="text-sm font-medium">Seleccionar estantería</Label>
                            <Select value={selectedShelfId} onValueChange={setSelectedShelfId}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar estantería" />
                                </SelectTrigger>
                                <SelectContent className="bg-sipe-blue-light">
                                    {shelves.map((shelf) => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={shelf.id} value={shelf.id}>
                                            {shelf.numero}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shelfNumber" className="text-sm font-medium">Número de estantería</Label>
                            <Input
                                id="shelfNumber"
                                type="number"
                                value={shelfNumber}
                                onChange={handleChange}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white border-b-1"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shelfQuantity" className="text-sm font-medium">Cantidad de estantes</Label>
                            <Input
                                id="shelfQuantity"
                                type="number"
                                value={shelfQuantity}
                                onChange={handleChange}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white border-b-1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="divisionQuantity" className="text-sm font-medium">Cantidad de divisiones</Label>
                            <Input
                                id="divisionQuantity"
                                type="number"
                                value={divisionQuantity}
                                onChange={handleChange}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white border-b-1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="aisle" className="text-sm font-medium">Pasillo</Label>
                            <Select value={selectedAisle?.id} onValueChange={(aisleId) => {
                                const aisle = aisles.find((a) => a.id === aisleId);
                                setSelectedAisle(aisle || '');
                            }}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar pasillo" />
                                </SelectTrigger>
                                <SelectContent className="bg-sipe-blue-light">
                                    {aisles.map((aisle) => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={aisle.id} value={aisle.id}>
                                            {`Pasillo ${aisle.numero} - Ubicación: ${aisle.ubicacionDeposito} - Depósito: ${aisle.nombreDeposito}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="side" className="text-sm font-medium">Lado</Label>
                            <Select value={selectedSide || ''} onValueChange={(value) => setSelectedSide(parseInt(value, 10))}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar lado" />
                                </SelectTrigger>
                                <SelectContent className="bg-sipe-blue-light">
                                    {filteredSides.length > 0 ? (
                                        filteredSides.map((side) => (
                                            <SelectItem
                                                className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                                key={side.id}
                                                value={side.id}
                                            >
                                                {side.descripcion}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <p className="text-sipe-gray text-sm p-2">No hay lados disponibles para este pasillo</p>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>CANCELAR</Button>
                        <Button variant="sipebutton" size="sipebutton" onClick={handleUpdateShelf} disabled={loading}>
                            {loading ? 'ACTUALIZAR...' : 'ACTUALIZAR'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ShelfEditModal;
