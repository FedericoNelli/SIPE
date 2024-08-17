import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";

function ModalEditMaterial({ isOpen, onClose, notify, material }) {
    const [depositLocations, setDepositLocations] = useState([]);
    const [depositNames, setDepositNames] = useState([]);
    const [locationId, setLocationId] = useState(material?.idUbicacion || '');
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [selectedShelf, setSelectedShelf] = useState(material?.idEstanteria || '');
    const [selectedSpace, setSelectedSpace] = useState(material?.idEspacio || '');
    const [formData, setFormData] = useState({
        nombre: material?.nombre || '',
        cantidad: material?.cantidad || '',
        matricula: material?.matricula || '',
        estado: material?.idEstado || '',
        categoria: material?.idCategoria || '',
        deposito: material?.idDeposito || '',
        imagen: null,
        imagenPreview: material?.imagen ? `http://localhost:8081${material.imagen}` : ''
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
        if (selectedShelf) {
            fetch(`http://localhost:8081/spaces/${selectedShelf}`)
                .then(response => response.json())
                .then(data => setSpaces(data))
                .catch(error => console.error('Error fetching spaces:', error));
        }
    }, [selectedShelf]);

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

    const handleInputChange = (e) => {
        e.stopPropagation(); // Detener la propagación del evento
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));

        if (id === 'depositLocation') {
            setLocationId(value);
        }
    };

    const handleShelfChange = (value) => {
        setSelectedShelf(value);
        setSelectedSpace('');  // Resetear espacio cuando se cambia la estantería
    };

    const handleSpaceChange = (value) => {
        setSelectedSpace(value);
    };

    const handleFileChange = (e) => {
        e.stopPropagation(); // Detener la propagación del evento
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10 MB
                alert("El archivo es demasiado grande. El tamaño máximo es 10 MB.");
                return;
            }
            setFormData(prevData => ({
                ...prevData,
                imagen: file,
                imagenPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleDeleteImage = async (e) => {
        e.stopPropagation();
    
        try {
            // Realiza una solicitud al backend para eliminar la imagen
            await axios.delete(`http://localhost:8081/materiales/${material.id}/imagen`);
    
            // Actualiza el estado en el frontend
            setFormData(prevData => ({
                ...prevData,
                imagen: null,
                imagenPreview: null
            }));
    
            notify('success', "Imagen eliminada correctamente!");
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            notify('error', "Error al eliminar la imagen");
        }
    };
    

    const handleSave = async () => {
        const { nombre, cantidad, matricula, estado, categoria, deposito, imagen } = formData;
    
        // Evita el caso en que todos los campos, excepto imagen, sean nulos o undefined
        const formDataToSend = new FormData();
        if (nombre) formDataToSend.append('nombre', nombre);
        if (cantidad) formDataToSend.append('cantidad', cantidad);
        if (matricula) formDataToSend.append('matricula', matricula);
        if (estado) formDataToSend.append('idEstado', estado);
        if (categoria) formDataToSend.append('idCategoria', categoria);
        if (deposito) formDataToSend.append('idDeposito', deposito);
        if (selectedSpace) formDataToSend.append('idEspacio', selectedSpace);
        if (imagen) formDataToSend.append('imagen', imagen);
    
        try {
            const response = await axios.put(`http://localhost:8081/materiales/${material.id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al actualizar Material");
            }
    
            notify('success', "Material actualizado correctamente!");
            if (onClose) onClose();
            setTimeout(() => {
                window.location.reload();
            }, 2500);
    
        } catch (error) {
            console.error('Error al actualizar el material:', error);
            notify('error', error.message || "Error al actualizar el material");
        }
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4 rounded-xl" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold mb-2 text-center">Editar Material</CardTitle>
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
                            <Input className="border-b" id="cantidad" type="number" placeholder="Ingresa la cantidad" value={formData.cantidad} onChange={handleInputChange} min="0" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="shelf" className="text-sm font-medium">Estantería</Label>
                            <Select id="shelf" onValueChange={(value) => handleShelfChange(value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona la estantería" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shelves.map(shelf => (
                                        <SelectItem key={shelf.id} value={shelf.id}>Estantería {shelf.id}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="space" className="text-sm font-medium">Espacio</Label>
                            <Select id="space" onValueChange={(value) => handleSpaceChange(value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona el espacio" />
                                </SelectTrigger>
                                <SelectContent>
                                    {spaces.map(space => (
                                        <SelectItem key={space.id} value={space.id} disabled={space.ocupado}>
                                            {`Espacio ${space.numeroEspacio}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image" className="text-sm font-medium">Imagen</Label>
                        <div className="flex items-center gap-4">
                            {formData.imagenPreview ? (
                                <img
                                    src={formData.imagenPreview}
                                    width="64"
                                    height="64"
                                    alt="Imagen del material"
                                    className="rounded-md"
                                    style={{ aspectRatio: "64/64", objectFit: "cover" }}
                                />
                            ) : (
                                <img
                                    src="/placeholder.svg"
                                    width="64"
                                    height="64"
                                    alt="Sin imagen"
                                    className="rounded-md"
                                    style={{ aspectRatio: "64/64", objectFit: "cover" }}
                                />
                            )}
                            <div className="flex flex-col gap-2">
                                <Button variant="" onClick={handleDeleteImage}>Eliminar Imagen</Button>
                                <input type="file" id="photo" className="hidden" onChange={handleFileChange} />
                                <Label htmlFor="photo" className="cursor-pointer">
                                    Subir nueva imagen
                                </Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>CANCELAR</Button>
                    <Button variant="sipebutton" size="sipebutton" onClick={handleSave}>GUARDAR</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default ModalEditMaterial;
