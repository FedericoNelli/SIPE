import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Cards/Card";
import { Label } from "@/components/Label/Label";
import { Input } from "@/components/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select/Select";
import { Button } from "@/components/Button/Button";

function FormMaterial({ onClose }) {
    const [depositLocations, setDepositLocations] = useState([]);
    const [depositNames, setDepositNames] = useState([]);
    const [locationId, setLocationId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [selectedShelf, setSelectedShelf] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        depositLocation: '',
        depositName: '',
        category: '',
        status: '',
        quantity: '',
        enrollment: '',
        lowStock: '',
        shelf: '',
        space: ''
    });

    useEffect(() => {
        fetch('http://localhost:8081/deposit-locations')
            .then(response => response.json())
            .then(data => setDepositLocations(data))
            .catch(error => console.error('Error fetching deposit locations:', error));

        fetch('http://localhost:8081/categories')
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error('Error fetching categories:', error));

        fetch('http://localhost:8081/statuses')
            .then(response => response.json())
            .then(data => setStatuses(data))
            .catch(error => console.error('Error fetching statuses:', error));

        fetch('http://localhost:8081/shelves')
            .then(response => response.json())
            .then(data => setShelves(data))
            .catch(error => console.error('Error fetching shelves:', error));
    }, []);

    useEffect(() => {
        if (locationId) {
            axios.get(`http://localhost:8081/deposit-names?locationId=${locationId}`)
                .then(response => {
                    setDepositNames(response.data);
                })
                .catch(error => {
                    console.error('Error fetching deposit names:', error);
                });
        } else {
            setDepositNames([]);
        }
    }, [locationId]);

    useEffect(() => {
        if (selectedShelf) {
            fetch(`http://localhost:8081/spaces/${selectedShelf}`)
                .then(response => response.json())
                .then(data => setSpaces(data))
                .catch(error => console.error('Error fetching spaces:', error));
        }
    }, [selectedShelf]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));

        // Actualizar locationId cuando cambie el select de ubicación
        if (id === 'depositLocation') {
            setLocationId(value);
        }
    };

    const handleSave = () => {
        const { name, depositLocation, depositName, category, status, quantity, enrollment, lowStock, shelf, space } = formData;

        if (!name || !depositLocation || !depositName || !category || !status || !quantity || !enrollment || !lowStock || !shelf || !space) {
            alert('Por favor completa todos los campos');
            return;
        }

        fetch('http://localhost:8081/addMaterial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                depositLocation,
                depositName,
                category,
                status,
                quantity,
                enrollment,
                lowStock,
                shelf,
                space
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert('Material agregado exitosamente');
                    if (onClose) onClose();
                } else {
                    alert('No se pudo agregar el material');
                }
            })
            .catch(error => console.error('Error adding material:', error));
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4 rounded-xl">
            <CardHeader>
                <CardTitle className="text-3xl font-bold mb-2 text-center">Agregar nuevo material</CardTitle>
                <hr />
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">Nombre del material</Label>
                        <Input className="border-b" id="name" placeholder="Ingresa el nombre del material" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="depositLocation" className="text-sm font-medium">Ubicación del depósito</Label>
                        <Select id="depositLocation" onValueChange={(value) => handleSelectChange('depositLocation', value)}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona la ubicación" />
                            </SelectTrigger>
                            <SelectContent>
                                {depositLocations.map(location => (
                                    <SelectItem key={location.id} value={location.id}>{location.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="depositName" className="text-sm font-medium">Nombre del depósito</Label>
                        <Select id="depositName" onValueChange={(value) => handleSelectChange('depositName', value)}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona el depósito" />
                            </SelectTrigger>
                            <SelectContent>
                                {depositNames.map(deposit => (
                                    <SelectItem key={deposit.id} value={deposit.id}>{deposit.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
                        <Select id="category" onValueChange={(value) => handleSelectChange('category', value)}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona la categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(category => (
                                    <SelectItem key={category.id} value={category.id}>{category.descripcion}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
                        <Select id="status" onValueChange={(value) => handleSelectChange('status', value)}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona el estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map(status => (
                                    <SelectItem key={status.id} value={status.id}>{status.descripcion}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="quantity" className="text-sm font-medium">Cantidad</Label>
                        <Input className="border-b" id="quantity" type="number" placeholder="Ingresa la cantidad" value={formData.quantity} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="enrollment" className="text-sm font-medium">Matrícula</Label>
                        <Input className="border-b" id="enrollment" placeholder="Ingresa la matrícula" value={formData.enrollment} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lowStock" className="text-sm font-medium">Bajo stock</Label>
                        <Input className="border-b" id="lowStock" type="number" placeholder="Ingresa el umbral de bajo stock" value={formData.lowStock} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="grid gap-4">
                    <Label className="text-sm font-medium">Ubicación</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                        <Select id="shelf" onValueChange={(value) => {
                            handleSelectChange('shelf', value);
                            setSelectedShelf(value);
                        }}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Estantería" />
                            </SelectTrigger>
                            <SelectContent>
                                {shelves.map(shelf => (
                                    <SelectItem key={shelf.id} value={shelf.id}>Estantería {shelf.id}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select id="space" onValueChange={(value) => handleSelectChange('space', value)}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Espacio" />
                            </SelectTrigger>
                            <SelectContent>
                                {spaces.map(space => (
                                    <SelectItem key={space.id} value={space.id} disabled={space.ocupado}>
                                        {`Fila ${space.fila}, Columna ${space.columna}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
                <Button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleCancel}>Cancelar</Button>
                <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleSave}>Guardar</Button>
            </CardFooter>
        </Card>
    );
}

export default FormMaterial;