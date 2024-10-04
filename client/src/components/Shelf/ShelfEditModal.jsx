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
                    setShelfData(data);
                    setShelfNumber(data.numero);
                    setShelfQuantity(data.cantidad_estante);
                    setDivisionQuantity(data.cantidad_division);
                    setSelectedAisle(data.idPasillo);
                    setSelectedSide(data.idLado);
                } catch (error) {
                    notify('error', 'Error al cargar los datos de la estantería');
                }
            };

            fetchShelfData();
        }
    }, [selectedShelfId]);

    // Cargar pasillos
    useEffect(() => {
        const fetchAisles = async () => {
            try {
                const response = await axios.get('http://localhost:8081/aisle');
                setAisles(response.data);
            } catch (error) {
                notify('error', 'Error al cargar los pasillos');
            }
        };

        fetchAisles();
    }, []);

    // Cargar lados
    useEffect(() => {
        const fetchSides = async () => {
            try {
                const response = await axios.get('http://localhost:8081/sides');
                setSides(response.data);
            } catch (error) {
                notify('error', 'Error al cargar los lados');
            }
        };

        fetchSides();
    }, []);

    const handleUpdateShelf = async () => {
        setLoading(true); // Mostrar estado de carga
        try {
            const response = await axios.put(`http://localhost:8081/edit-shelf/${selectedShelfId}`, {
                numero: shelfNumber,
                cantidad_estante: shelfQuantity,
                cantidad_division: divisionQuantity,
                idPasillo: selectedAisle,
                idLado: selectedSide
            });
            console.log('Response status:', response.status); // Agregar log para verificar el status
            if (response.status === 200 || response.status === 201) {
                notify('success', 'Estantería actualizada correctamente');
                onShelfUpdated();
                onClose();
            } else {
                notify('error', 'Error al actualizar la estantería');
            }
        } catch (error) {
            console.error('Error actualizando la estantería:', error);
            notify('error', 'Error al actualizar la estantería');
        } finally {
            setLoading(false); // Detener estado de carga
        }
    };
    

    return (
        <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-sipe-blue-dark text-sipe-white p-4 rounded-xl w-full max-w-2xl">
                <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                    <X size={14} strokeWidth={4} onClick={onClose} />
                </div>

                <Card className="bg-sipe-blue-dark text-sipe-white p-4 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar Estantería</CardTitle>
                        <hr />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="shelf" className="text-sm font-medium">Seleccionar Estantería</Label>
                            <Select value={selectedShelfId} onValueChange={setSelectedShelfId}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar estantería" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shelves.map((shelf) => (
                                        <SelectItem key={shelf.id} value={shelf.id}>
                                            {shelf.numero}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shelfNumber" className="text-sm font-medium">Número de Estantería</Label>
                            <Input
                                id="shelfNumber"
                                value={shelfNumber}
                                onChange={(e) => setShelfNumber(e.target.value)}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shelfQuantity" className="text-sm font-medium">Cantidad de Estantes</Label>
                            <Input
                                id="shelfQuantity"
                                value={shelfQuantity}
                                onChange={(e) => setShelfQuantity(e.target.value)}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="divisionQuantity" className="text-sm font-medium">Cantidad de Divisiones</Label>
                            <Input
                                id="divisionQuantity"
                                value={divisionQuantity}
                                onChange={(e) => setDivisionQuantity(e.target.value)}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="aisle" className="text-sm font-medium">Pasillo</Label>
                            <Select value={selectedAisle} onValueChange={setSelectedAisle}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar pasillo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aisles.map((aisle) => (
                                        <SelectItem key={aisle.id} value={aisle.id}>
                                            {aisle.numero}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="side" className="text-sm font-medium">Lado</Label>
                            <Select value={selectedSide} onValueChange={setSelectedSide}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar lado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sides.map((side) => (
                                        <SelectItem key={side.id} value={side.id}>
                                            {side.descripcion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>Cancelar</Button>
                        <Button variant="sipebutton" size="sipebutton" onClick={handleUpdateShelf} disabled={loading}>
                            {loading ? 'Actualizando...' : 'Actualizar Estantería'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ShelfEditModal;
