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
        nombre: '',
        depositLocation: '',
        depositName: '',
        categoria: '',
        estado: '',
        cantidad: '',
        matricula: '',
        bajoStock: '',
        estanteria: '',
        espacio: ''
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

    const handleSave = async () => {
        const { nombre, cantidad, matricula, bajoStock, estado, espacio, categoria, deposito } = formData;

        if (!nombre || !categoria || !estado || !cantidad || !matricula || !bajoStock || !espacio) {
            alert('Por favor completa todos los campos');
            return;
        }

        console.log('FormData:', formData);


        try {
            const response = await fetch('http://localhost:8081/addMaterial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    cantidad,
                    matricula,
                    bajoStock,
                    estado,
                    espacio,
                    categoria,
                    deposito,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'No se pudo agregar el material');
            }

            alert('Material agregado exitosamente');
            if (onClose) onClose();
        } catch (error) {
            console.error('Error adding material:', error);
            alert('Error al agregar el material');
        }
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
                        <Label htmlFor="nombre" className="text-sm font-medium">Nombre del material</Label>
                        <Input className="border-b" id="nombre" placeholder="Ingresa el nombre del material" value={formData.nombre} onChange={handleInputChange} />
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
                        <Label htmlFor="deposito" className="text-sm font-medium">Nombre del depósito</Label>
                        <Select id="deposito" onValueChange={(value) => handleSelectChange('deposito', value)}>
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
                        <Label htmlFor="categoria" className="text-sm font-medium">Categoría</Label>
                        <Select id="categoria" onValueChange={(value) => handleSelectChange('categoria', value)}>
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
                        <Label htmlFor="estado" className="text-sm font-medium">Estado</Label>
                        <Select id="estado" onValueChange={(value) => handleSelectChange('estado', value)}>
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
                        <Label htmlFor="cantidad" className="text-sm font-medium">Cantidad</Label>
                        <Input className="border-b" id="cantidad" type="number" placeholder="Ingresa la cantidad" value={formData.cantidad} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="matricula" className="text-sm font-medium">Matrícula</Label>
                        <Input className="border-b" id="matricula" placeholder="Ingresa la matrícula" value={formData.matricula} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bajoStock" className="text-sm font-medium">Bajo stock</Label>
                        <Input className="border-b" id="bajoStock" type="number" placeholder="Ingresa el umbral de bajo stock" value={formData.bajoStock} onChange={handleInputChange} />
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
                        <Select id="espacio" onValueChange={(value) => handleSelectChange('espacio', value)}>
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
                    <div className="">
                        <Label className="text-sm font-medium">Imagen</Label>
                        <div className="flex mt-4">
                            <Input id="image" type="file" className="bg-sipe-gray text-sipe-white w-full p-0 rounded-sm" placeholder="Seleccionar archivo" />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
                <Button className="" variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>CANCELAR</Button>
                <Button className="" variant="sipebutton" size="sipebutton" onClick={handleSave}>AGREGAR</Button>
            </CardFooter>
        </Card>
    );
}

export default FormMaterial;