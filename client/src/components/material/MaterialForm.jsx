import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { X } from "lucide-react";

function MaterialForm({ onClose, notify }) {
    const [depositLocations, setDepositLocations] = useState([]);
    const [depositNames, setDepositNames] = useState([]);
    const [aisles, setAisles] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [locationId, setLocationId] = useState(null);
    const [selectedAisle, setSelectedAisle] = useState(null);
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        cantidad: '',
        matricula: '',
        bajoStock: '',
        espacio: '',
        categoria: '',
        deposito: '',
        imagen: null,
        ultimoUsuarioId: '',
        ocupado: 1
    });

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose(); // Cierra el modal cuando se presiona Escape
            }
        };

        document.addEventListener('keydown', handleEscape);

        // Limpia el evento cuando el componente se desmonta
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

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
        if (formData.deposito) {
            // Obtener pasillos según el depósito seleccionado
            axios.get(`http://localhost:8081/aisles/${formData.deposito}`)
                .then(response => setAisles(response.data))
                .catch(error => console.error('Error fetching aisles:', error));
        } else {
            setAisles([]);
        }
    }, [formData.deposito]);

    useEffect(() => {
        if (selectedAisle) {
            // Obtener estanterías según el pasillo seleccionado
            axios.get(`http://localhost:8081/shelves/${selectedAisle}`)
                .then(response => setShelves(response.data))
                .catch(error => console.error('Error fetching shelves:', error));
        } else {
            setShelves([]);
        }
    }, [selectedAisle]);

    useEffect(() => {
        if (formData.shelf) {
            // Obtener espacios según la estantería seleccionada
            axios.get(`http://localhost:8081/spaces/${formData.shelf}`)
                .then(response => setSpaces(response.data))
                .catch(error => console.error('Error fetching spaces:', error));
        } else {
            setSpaces([]);
        }
    }, [formData.shelf]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        if ((id === 'cantidad' || id === 'bajoStock') && value < 0) {
            setFormData((prevData) => ({
                ...prevData,
                [id]: 0,
            }));
            notify('error', 'El valor no puede ser negativo');
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [id]: value,
            }));
        }
    };


    const handleSelectChange = (id, value) => {
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));

        if (id === 'depositLocation') {
            setLocationId(value);
        } else if (id === 'deposito') {
            setAisles([]);
            setShelves([]);
            setSpaces([]);
        } else if (id === 'aisle') {
            setSelectedAisle(value);
            setShelves([]);
            setSpaces([]);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log(`Tamaño del archivo original: ${file.size} bytes`);
            if (file.size > 10 * 1024 * 1024) { // 10 MB
                alert("El archivo es demasiado grande. El tamaño máximo es 10 MB.");
                return;
            }
            setFormData(prevData => ({
                ...prevData,
                imagen: file
            }));
        }
    };

    const handleSave = async () => {
        const { nombre, cantidad, matricula, bajoStock, espacio, categoria, deposito, imagen, ocupado } = formData;

        if (!nombre || !cantidad || !matricula || !bajoStock || !espacio || !categoria || !deposito) {
            notify('error', 'Por favor completa todos los campos');
            return;
        }

        const fechaAlta = new Date();
        fechaAlta.setHours(fechaAlta.getHours() - 3);
        const fechaAltaFormatoISO = fechaAlta.toISOString().slice(0, 19).replace('T', ' ');

        const fechaUltimoEstado = new Date();
        fechaUltimoEstado.setHours(fechaUltimoEstado.getHours() - 3);
        const fechaFormatoISO = fechaUltimoEstado.toISOString().slice(0, 19).replace('T', ' ');

        const ultimoUsuarioId = localStorage.getItem('id');

        if (!ultimoUsuarioId) {
            notify('error', 'Usuario no encontrado en localStorage');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('nombre', nombre);
        formDataToSend.append('cantidad', cantidad);
        formDataToSend.append('matricula', matricula);
        formDataToSend.append('bajoStock', bajoStock);
        formDataToSend.append('idEspacio', espacio);
        formDataToSend.append('idCategoria', categoria);
        formDataToSend.append('idDeposito', deposito);
        formDataToSend.append('fechaAlta', fechaAltaFormatoISO);
        formDataToSend.append('fechaUltimoEstado', fechaFormatoISO);
        formDataToSend.append('ultimoUsuarioId', ultimoUsuarioId);
        formDataToSend.append('ocupado', ocupado);
        if (imagen) {
            formDataToSend.append('imagen', imagen);
        }

        try {
            const response = await axios.post('http://localhost:8081/addMaterial', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const data = response.data;

            if (response.status !== 200) {
                throw new Error(data.error || "Error al agregar Material");
            }

            notify('success', "Material agregado correctamente!");

            if (onClose) onClose();
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Error al agregar el material:', error);
            notify('error', error.message || "Error al agregar el material");
        }
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4 rounded-xl relative">
                <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                    <X size={14} strokeWidth={4} onClick={onClose} /> {/* Icono de cierre */}
                </div>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold mb-2 text-center">Agregar nuevo material</CardTitle>
                    <hr />
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre" className="text-sm font-medium">Nombre del material</Label>
                            <Input className="border-b text-sm" id="nombre" placeholder="Ingresa el nombre del material" value={formData.nombre} onChange={handleInputChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="depositLocation" className="text-sm font-medium">Ubicación del depósito</Label>
                            <Select id="depositLocation" onValueChange={(value) => handleSelectChange('depositLocation', value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" placeholder="Selecciona la ubicación" />
                                </SelectTrigger>
                                <SelectContent>
                                    {depositLocations.map(location => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={location.id} value={location.id}>{location.nombre}</SelectItem>
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
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={deposit.id} value={deposit.id}>{deposit.nombre}</SelectItem>
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
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={category.id} value={category.id}>{category.descripcion}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cantidad" className="text-sm font-medium">Cantidad</Label>
                            <Input className="border-b text-sm" id="cantidad" type="number" placeholder="Ingresa la cantidad" value={formData.cantidad} onChange={handleInputChange} min="0" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bajoStock" className="text-sm font-medium">Bajo stock</Label>
                            <Input className="border-b text-sm" id="bajoStock" type="number" placeholder="Ingresa el umbral de bajo stock" value={formData.bajoStock} onChange={handleInputChange} min="0" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="matricula" className="text-sm font-medium">Matrícula</Label>
                            <Input className="border-b text-sm" id="matricula" type="text" placeholder="Ingresa la matrícula" value={formData.matricula} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                            <Select id="aisle" onValueChange={(value) => {
                                handleSelectChange('aisle', value);
                            }} disabled={!formData.deposito}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Pasillo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aisles.map(aisle => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={aisle.id} value={aisle.id}>Pasillo {aisle.numero}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select id="shelf" onValueChange={(value) => {
                                handleSelectChange('shelf', value);
                            }} disabled={!formData.aisle}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Estantería" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shelves.map(shelf => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={shelf.id} value={shelf.id}>Estantería {shelf.numero}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                id="espacio"
                                onValueChange={(value) => handleSelectChange('espacio', value)}
                                disabled={!formData.shelf || spaces.length === 0}
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    {formData.shelf ? (
                                        spaces.length > 0 ? (
                                            <SelectValue placeholder="Espacio" />
                                        ) : (
                                            <p className="text-xs text-sipe-white">Sin espacios generados en la estantería</p>
                                        )
                                    ) : (
                                        <SelectValue placeholder="Espacio" />
                                    )}
                                </SelectTrigger>
                                {spaces.length > 0 && (
                                    <SelectContent>
                                        {spaces.map((space) => (
                                            <SelectItem
                                                className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg"
                                                key={space.id}
                                                value={space.id}
                                                disabled={space.ocupado}
                                            >
                                                {`Espacio ${space.numeroEspacio}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                )}
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image" className="text-sm font-medium">Imagen</Label>
                            <Input
                                className="text-white font-thin file:text-white pb-8 bg-sipe-blue-light border rounded-xl text-sm"
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button className="" variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>CANCELAR</Button>
                    <Button className="" variant="sipebutton" size="sipebutton" onClick={handleSave}>AGREGAR</Button>
                </CardFooter>
            </Card>
        </>
    );
}

export default MaterialForm;
