import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { X } from 'lucide-react';

const DepositEditModal = ({ onClose, onDepositUpdated, notify }) => {
    const [deposits, setDeposits] = useState([]); // Lista de depósitos para seleccionar
    const [selectedDepositId, setSelectedDepositId] = useState(''); // Depósito seleccionado
    const [depositData, setDepositData] = useState(null);
    const [locations, setLocations] = useState([]); // Lista de ubicaciones
    const [depositName, setDepositName] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

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

    // Cargar la lista de depósitos
    useEffect(() => {
        const fetchDeposits = async () => {
            try {
                const response = await axios.get('http://localhost:8081/deposits');
                setDeposits(response.data);
            } catch (error) {
                notify('error', 'Error al cargar los depósitos');
            }
        };

        fetchDeposits();
    }, []);

    // Cargar los datos del depósito seleccionado
    useEffect(() => {
        if (selectedDepositId) {
            const fetchDepositData = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/deposits/${selectedDepositId}`);
                    const data = response.data;
                    setDepositData(data);
                    setDepositName(data.nombre);
                    setSelectedLocation(data.idUbicacion);
                } catch (error) {
                    notify('error', 'Error al cargar los datos del depósito');
                }
            };

            fetchDepositData();
        }
    }, [selectedDepositId]);

    // Cargar las ubicaciones
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

    const handleUpdateDeposit = async () => {
        try {
            await axios.put(`http://localhost:8081/edit-deposit/${selectedDepositId}`, {
                nombre: depositName,
                idUbicacion: selectedLocation
            });
            notify('success', 'Depósito actualizado correctamente');
            onDepositUpdated(); // Recargar lista de depósitos en el componente padre
            onClose();
        } catch (error) {
            notify('error', 'Error al actualizar el depósito');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl w-full max-w-2xl">
                <Card className="bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar depósito</CardTitle>
                        <hr />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="deposit" className="text-sm font-medium">Seleccionar Depósito</Label>
                            <Select value={selectedDepositId} onValueChange={setSelectedDepositId}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar depósito" />
                                </SelectTrigger>
                                <SelectContent className="bg-sipe-blue-light">
                                    {deposits.map((deposit) => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={deposit.id} value={deposit.id}>
                                            {deposit.nombreDeposito}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="depositName" className="text-sm font-medium">Nombre del depósito</Label>
                            <Input
                                id="depositName"
                                value={depositName}
                                onChange={(e) => setDepositName(e.target.value)}
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
                    </CardContent>

                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>CANCELAR</Button>
                        <Button variant="sipebutton" size="sipebutton" onClick={handleUpdateDeposit}>ACTUALIZAR</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default DepositEditModal;
