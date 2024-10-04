import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { X } from 'lucide-react';

const LocationEditModal = ({ onClose, onLocationUpdated, notify }) => {
    const [locations, setLocations] = useState([]); // Lista de ubicaciones para seleccionar
    const [selectedLocationId, setSelectedLocationId] = useState(''); // Ubicación seleccionada
    const [locationName, setLocationName] = useState(''); // Nombre de la ubicación

    // Cargar las ubicaciones cuando se abre el modal
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get('http://localhost:8081/deposit-locations');
                setLocations(response.data);
            } catch (error) {
                notify('error', 'Error al cargar las ubicaciones');
            }
        };
        fetchLocations();
    }, []);

    // Cargar los datos de la ubicación seleccionada
    useEffect(() => {
        if (selectedLocationId) {
            const fetchLocationData = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/locations/${selectedLocationId}`);
                    const data = response.data;
                    setLocationName(data.nombre); // Cargar el nombre de la ubicación
                } catch (error) {
                    notify('error', 'Error al cargar los datos de la ubicación');
                }
            };
            fetchLocationData();
        }
    }, [selectedLocationId]);

    // Función para actualizar la ubicación
    const handleUpdateLocation = async () => {
        try {
            await axios.put(`http://localhost:8081/edit-location/${selectedLocationId}`, {
                nombre: locationName
            });
            notify('success', 'Ubicación actualizada correctamente');
            onLocationUpdated();
            onClose();
        } catch (error) {
            notify('error', 'Error al actualizar la ubicación');
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
                        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar Ubicación</CardTitle>
                        <hr />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="location" className="text-sm font-medium">Seleccionar Ubicación</Label>
                            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar ubicación" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((location) => (
                                        <SelectItem key={location.id} value={location.id}>
                                            {location.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="locationName" className="text-sm font-medium">Nombre de la Ubicación</Label>
                            <Input
                                id="locationName"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>Cancelar</Button>
                        <Button variant="sipebutton" size="sipebutton" onClick={handleUpdateLocation}>Actualizar Ubicación</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default LocationEditModal;
