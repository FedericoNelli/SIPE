import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { X } from 'lucide-react';

const AisleEditModal = ({ onClose, onAisleUpdated, notify }) => {
    const [aisles, setAisles] = useState([]); // Lista de pasillos para seleccionar
    const [selectedAisleId, setSelectedAisleId] = useState(''); // Pasillo seleccionado
    const [aisleData, setAisleData] = useState(null);
    const [locations, setLocations] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [sides, setSides] = useState([]);
    const [aisleNumber, setAisleNumber] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedDeposit, setSelectedDeposit] = useState('');
    const [selectedSide1, setSelectedSide1] = useState('');
    const [selectedSide2, setSelectedSide2] = useState('');

    // Cerrar modal al presionar la tecla Escape
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose(); // Llamar a la función onClose cuando se presiona Escape
            }
        };

        // Agregar el event listener
        window.addEventListener('keydown', handleKeyDown);

        // Eliminar el event listener al desmontar el componente
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);


    // Cargar la lista de pasillos
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

    // Cargar los datos del pasillo seleccionado
    useEffect(() => {
        if (selectedAisleId) {
            const fetchAisleData = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/aisle/${selectedAisleId}`);
                    const data = response.data;
                    // Asignar valores con valores predeterminados si están en null o undefined
                    setAisleData(data);
                    setAisleNumber(data.numero || 'Sin número'); // Si 'numero' es undefined o null, establece 'Sin número'
                    setSelectedLocation(data.idUbicacion !== undefined && data.idUbicacion !== null ? data.idUbicacion : 'Sin ubicación'); // Si no existe idUbicacion, usa 'Sin ubicación'
                    setSelectedDeposit(data.idDeposito !== undefined && data.idDeposito !== null ? data.idDeposito : 'Sin depósito'); // Si no existe idDeposito, usa 'Sin depósito'
                    setSelectedSide1(data.idLado1 !== undefined && data.idLado1 !== null ? data.idLado1 : 'Sin lado 1'); // Si no existe idLado1, usa 'Sin lado 1'
                    setSelectedSide2(data.idLado2 !== undefined && data.idLado2 !== null ? data.idLado2 : null);
                } catch (error) {
                    notify('error', 'Error al cargar los datos del pasillo');
                }
            };
            fetchAisleData();
        }
    }, [selectedAisleId]);


    const handleChange = (e) => {
        const { id, value } = e.target;
        // Permite que el campo esté vacío o solo acepte valores mayores a 0
        if (value === '' || /^[1-9]\d*$/.test(value)) {
            if (id === 'aisleNumber') {
                setAisleNumber(value);
            }
        } else {
            // Si el valor es 0 o negativo, muestra el mensaje de error
            if (parseInt(value, 10) <= 0) {
                const errorMessage = {
                    aisleNumber: "El número de pasillo debe ser mayor a 0"
                };
                notify('error', errorMessage[id] || "El valor debe ser mayor a 0");
            }
        }
    };


    // Cargar ubicaciones
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get('http://localhost:8081/deposit-locations');
                setLocations(response.data);
            } catch (error) {
                notify('error', 'Error al cargar ubicaciones');
            }
        };

        fetchLocations();
    }, []);

    // Cargar depósitos según la ubicación seleccionada
    useEffect(() => {
        if (selectedLocation) {
            const fetchDeposits = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/deposit-names?locationId=${selectedLocation}`);
                    setDeposits(response.data);
                } catch (error) {
                    notify('error', 'Error al cargar depósitos');
                }
            };

            fetchDeposits();
        }
    }, [selectedLocation]);

    // Cargar lados
    useEffect(() => {
        const fetchSides = async () => {
            try {
                const response = await axios.get('http://localhost:8081/sides');
                setSides(response.data);
            } catch (error) {
                notify('error', 'Error al cargar lados');
            }
        };

        fetchSides();
    }, []);

    useEffect(() => {
        if (selectedSide2 === selectedSide1) {
            setSelectedSide2(''); // Reinicia lado 2 si es igual a lado 1
        }
    }, [selectedSide1]);

    const handleUpdateAisle = async () => {
        try {
            await axios.put(`http://localhost:8081/edit-aisle/${selectedAisleId}`, {
                numero: aisleNumber,
                idDeposito: selectedDeposit,
                idLado1: selectedSide1,
                idLado2: selectedSide2 || null
            });
            notify('success', 'Pasillo actualizado correctamente');
            onAisleUpdated();
            onClose();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                notify('error', error.response.data.error)
            } else {
                notify('error', 'Error al actualizar el pasillo');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl w-full max-w-2xl">
                <Card className="bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar pasillo</CardTitle>
                        <hr />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="aisle" className="text-sm font-medium">Seleccionar Pasillo</Label>
                            <Select value={selectedAisleId} onValueChange={setSelectedAisleId}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar pasillo" />
                                </SelectTrigger>
                                <SelectContent className="bg-sipe-blue-light">
                                    {aisles.map((aisle) => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={aisle.id} value={aisle.id}>
                                            {aisle.numero}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="aisleNumber" className="text-sm font-medium">Número de Pasillo</Label>
                            <Input
                                id="aisleNumber"
                                type="number"
                                value={aisleNumber}
                                onChange={handleChange}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white border-b-1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location" className="text-sm font-medium">Ubicación</Label>
                            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar ubicación" />
                                </SelectTrigger>
                                <SelectContent className="bg-sipe-blue-light">
                                    {locations.map((location) => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={location.id} value={location.id}>
                                            {location.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deposit" className="text-sm font-medium">Depósito</Label>
                            {deposits.length > 0 ? (
                                <Select value={selectedDeposit} onValueChange={setSelectedDeposit}>
                                    <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Seleccionar depósito" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-sipe-blue-light">
                                        {deposits.map((deposit) => (
                                            <SelectItem
                                                className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                                key={deposit.id}
                                                value={deposit.id}
                                            >
                                                {deposit.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="text-sipe-gray">No hay depósitos disponibles</div>
                            )}
                        </div>

                        {deposits.length === 0 ? (
                            <div className="text-sipe-gray">No hay lados disponibles</div>
                        ) : (
                            <>
                                {/* Select de Lado 1 */}
                                <div className="grid gap-2">
                                    <Label htmlFor="side1" className="text-sm font-medium">Lado 1</Label>
                                    <Select value={selectedSide1} onValueChange={setSelectedSide1}>
                                        <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                            <SelectValue placeholder="Seleccionar lado 1" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-sipe-blue-light">
                                            {sides.map((side) => (
                                                <SelectItem
                                                    className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                                    key={side.id}
                                                    value={side.id}
                                                >
                                                    {side.descripcion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Select de Lado 2 */}
                                <div className="grid gap-2">
                                    <Label htmlFor="side2" className="text-sm font-medium">Lado 2 (Opcional)</Label>
                                    <Select
                                        value={selectedSide2 || null} // Aquí establecemos "null" si el valor es null
                                        onValueChange={(value) => setSelectedSide2(value === "null" ? null : value)}
                                    >
                                        <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                            <SelectValue>
                                                {selectedSide2 === null
                                                    ? "Sin Lado" // Muestra "Sin Lado" si el valor es null
                                                    : sides.find((side) => side.id === selectedSide2)?.descripcion || "Seleccionar lado 2"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="bg-sipe-blue-light">
                                            <SelectItem
                                                className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                                key="null"
                                                value="null"
                                            >
                                                Sin Lado
                                            </SelectItem>
                                            {sides
                                                .filter((side) => side.id !== selectedSide1) // Evitar duplicados con lado 1
                                                .map((side) => (
                                                    <SelectItem
                                                        className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                                        key={side.id}
                                                        value={side.id}
                                                    >
                                                        {side.descripcion}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>CANCELAR</Button>
                        <Button variant="sipebutton" size="sipebutton" onClick={handleUpdateAisle}>ACTUALIZAR</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default AisleEditModal;
