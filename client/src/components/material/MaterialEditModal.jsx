import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

function MaterialEditModal({ isOpen, onClose, notify, material }) {
    const [isVisible, setIsVisible] = useState(isOpen);
    const [depositLocations, setDepositLocations] = useState([]);
    const [depositNames, setDepositNames] = useState([]);
    const [locationId, setLocationId] = useState(material?.idUbicacion || '');
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [aisles, setAisles] = useState([]); // Estado para los pasillos
    const [shelves, setShelves] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [selectedAisle, setSelectedAisle] = useState(material?.idPasillo || '');
    const [selectedShelf, setSelectedShelf] = useState(material?.idEstanteria || '');
    const [selectedSpace, setSelectedSpace] = useState(material?.idEspacio || '');
    const [isImageToDelete, setIsImageToDelete] = useState(false);
    const [selectedShelfNumber, setSelectedShelfNumber] = useState(material?.estanteriaNumero || '');
    const [formData, setFormData] = useState({
        nombre: material?.nombre || '',
        cantidad: material?.cantidad || '',
        matricula: material?.matricula || '',
        bajoStock: material?.bajoStock || '',
        estado: material?.idEstado || '',
        categoria: material?.idCategoria || '',
        deposito: material?.idDeposito || '',
        imagen: null,
        imagenPreview: material?.imagen ? `http://localhost:8081${material.imagen}` : ''
    });

    // Manejo del evento 'Escape' pero solo si el MaterialEditModal NO está abierto
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    useEffect(() => {
        if (material?.id) {
            // Cargar los detalles del material
            axios.get(`http://localhost:8081/materials/${material.id}`)
                .then(response => {
                    const data = response.data;

                    setFormData({
                        nombre: data.nombre,
                        cantidad: data.cantidad,
                        matricula: data.matricula,
                        bajoStock: data.bajoStock,
                        estado: data.idEstado,
                        categoria: data.idCategoria,
                        deposito: data.idDeposito,
                        ubicacion: data.ubicacionId,
                        espacio: data.idEspacio,
                        pasillo: data.idPasillo,
                        estanteria: data.estanteriaId,
                        imagen: null,
                        imagenPreview: data.imagen ? `http://localhost:8081${data.imagen}` : ''
                    });
                    setSelectedAisle(data.idPasillo);
                    setSelectedShelf(data.estanteriaId);
                    setLocationId(data.ubicacionId);
                    setSelectedShelfNumber(data.estanteriaNumero);
                    setSelectedSpace(data.idEspacio);
                })
                .catch(error => {
                    console.error('Error al obtener los detalles del material:', error);
                    notify('error', 'Error al cargar los detalles del material');
                });
        }
    }, [material]);


    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

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
            axios.get(`http://localhost:8081/aisles/${formData.deposito}`)
                .then(response => {
                    setAisles(response.data);
                    if (material?.idPasillo) {
                        setSelectedAisle(material.idPasillo);
                    }
                })
                .catch(error => console.error('Error fetching aisles:', error));
        }
    }, [formData.deposito]);


    // Cargar las estanterías cuando se selecciona o ya se tiene un pasillo
    useEffect(() => {
        if (selectedAisle) {
            axios.get(`http://localhost:8081/shelves/${selectedAisle}`)
                .then(response => {
                    setShelves(response.data);
                    // Pre-carga la estantería solo si ya está definida en el material
                    if (material?.estanteria) {
                        console.log(`Pre-cargando estantería: ${material.estanteria}`);
                        setSelectedShelf(material.estanteria);
                    }
                })
                .catch(error => console.error('Error fetching shelves:', error));
        }
    }, [selectedAisle]);

    // Cargar los espacios cuando se selecciona o ya se tiene una estantería
    useEffect(() => {
        if (selectedShelf) {
            axios.get(`http://localhost:8081/spaces/${selectedShelf}`)
                .then(response => {
                    setSpaces(response.data);
                    // Pre-carga el espacio solo si ya está definido en el material
                    if (material?.idEspacio) {
                        setSelectedSpace(material.idEspacio);
                    }
                })
                .catch(error => console.error('Error fetching spaces:', error));
        }
    }, [selectedShelf]);


    // Peticiones para obtener las ubicaciones de depósitos, categorías, estados y ubicaciones iniciales
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

    const handleInputChange = (e) => {
        e.stopPropagation();
        const { id, value } = e.target;

        // Verificar si el valor ingresado es un número y si es negativo
        if ((id === 'cantidad' || id === 'bajoStock') && Number(value) < 0) {
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
            setLocationId(value);  // Asegúrate de actualizar locationId
            setFormData(prevState => ({
                ...prevState,
                ubicacion: value // Actualiza también el formData para reflejar la nueva ubicación
            }));
        }

        if (id === 'deposito') {
            setLocationId(value);
            setSelectedAisle('');
            setSelectedShelf('');
        }
    };

    const handleAisleChange = (value) => {
        setSelectedAisle(value);
        setFormData(prevData => ({
            ...prevData,
            estanteria: value
        }));
    };

    const handleShelfChange = (value) => {
        setSelectedShelf(value);
        setFormData(prevData => ({
            ...prevData,
            estanteria: value
        }));
        setSelectedSpace(''); // Resetear el espacio seleccionado cuando se cambia la estantería
    };

    const handleSpaceChange = (value) => {
        setSelectedSpace(value);
    };

    const resetFileInput = () => {
        const fileInput = document.getElementById('photo');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleFileChange = (e) => {
        e.stopPropagation();
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                notify('error', 'El archivo es demasiado grande. El tamaño máximo es 10 MB.');
                return;
            }
            setFormData(prevData => ({
                ...prevData,
                imagen: file,
                imagenPreview: URL.createObjectURL(file) // Muestra la imagen en el preview
            }));
            setIsImageToDelete(false); // Resetea el flag para indicar que no se debe eliminar la imagen
            notify('success', 'Imagen lista para guardarse');
        } else {
            notify('error', 'Error al cargar imagen');
        }
    };

    const handleDeleteImage = (e) => {
        e.stopPropagation();

        if (formData.imagen) {
            setFormData(prevData => ({
                ...prevData,
                imagen: null,
                imagenPreview: ''
            }));
            setIsImageToDelete(false); // Marca que no se debe eliminar en el backend
            resetFileInput();
            notify('success', 'Imagen del preview eliminada')
        } else if (formData.imagenPreview) {
            setIsImageToDelete(true); // Marca que debe eliminarse en el backend
            setFormData(prevData => ({
                ...prevData,
                imagenPreview: ''
            }));
            resetFileInput();
            notify('success', 'Imagen del servidor marcada para eliminarse')
        }
    };

    const handleSave = async () => {
        const { nombre, cantidad, matricula, bajoStock, estado, categoria, deposito, imagen } = formData;
        const formDataToSend = new FormData();
        if (nombre) formDataToSend.append('nombre', nombre);
        if (cantidad) formDataToSend.append('cantidad', cantidad);
        if (matricula) formDataToSend.append('matricula', matricula);
        if (bajoStock) formDataToSend.append('bajoStock', bajoStock); // Aquí se añade bajoStock
        if (estado) formDataToSend.append('idEstado', estado);
        if (categoria) formDataToSend.append('idCategoria', categoria);
        if (deposito) formDataToSend.append('idDeposito', deposito);
        if (selectedSpace) formDataToSend.append('idEspacio', selectedSpace);
        if (imagen) formDataToSend.append('imagen', imagen);
        if (isImageToDelete) formDataToSend.append('eliminarImagen', true); // Agrega esta línea

        try {
            const token = localStorage.getItem('token'); // Asegúrate de que el token esté almacenado en localStorage o de otra manera accesible

            const response = await axios.put(`http://localhost:8081/materiales/${material.id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // Incluye el token aquí
                }
            });

            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al actualizar Material");
            }

            notify('success', 'Material actualizado correctamente');
            setIsVisible(false);

            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            notify('error', "Error al actualizar el material");
        }
    };

    const handleCancel = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        if (!isVisible && onClose) {
            const timer = setTimeout(onClose, 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isOpen && !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={handleCancel}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative bg-sipe-blue-dark text-sipe-white p-4 rounded-xl w-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                            <X size={14} strokeWidth={4} onClick={handleCancel} />
                        </div>

                        <Card className="bg-sipe-blue-dark text-sipe-white p-4 rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-3xl font-bold mb-2 text-center">Editar material</CardTitle>
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
                                        <Select
                                            id="depositLocation"
                                            value={locationId}
                                            onValueChange={(value) => handleSelectChange('depositLocation', value)}
                                        >
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue>{locationId ? depositLocations.find(location => location.id === locationId)?.nombre : "Selecciona la ubicación"}</SelectValue>
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
                                        <Select id="deposito" value={formData.deposito} onValueChange={(value) => handleSelectChange('deposito', value)}>
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
                                        <Select id="categoria" value={formData.categoria} onValueChange={(value) => handleSelectChange('categoria', value)}>
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
                                        <Input className="border-b" id="cantidad" type="number" placeholder="Ingresa la cantidad" value={formData.cantidad} onChange={handleInputChange} min="0" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bajoStock" className="text-sm font-medium">Bajo Stock</Label>
                                        <Input className="border-b" id="bajoStock" type="number" placeholder="Ingresa el valor de bajo stock" value={formData.bajoStock} onChange={handleInputChange} min="0" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="aisle" className="text-sm font-medium">Pasillo</Label>
                                        <Select
                                            id="aisle"
                                            value={selectedAisle}
                                            onValueChange={(value) => handleAisleChange(value)}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue>
                                                    {selectedAisle && aisles.find(aisle => aisle.id === selectedAisle) ? `Pasillo ${aisles.find(aisle => aisle.id === selectedAisle)?.numero}` : "Pasillo no seleccionado"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {aisles.map(aisle => (
                                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={aisle.id} value={aisle.id}>{`Pasillo ${aisle.numero}`}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="shelf" className="text-sm font-medium">Estantería</Label>
                                        <Select
                                            id="shelf"
                                            value={selectedShelf}
                                            onValueChange={(value) => handleShelfChange(value)}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue>
                                                    {selectedShelf && shelves.find(shelf => shelf.id === selectedShelf) ? `Estantería ${shelves.find(shelf => shelf.id === selectedShelf)?.numero}` : "Estantería no seleccionada"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {shelves.map(shelf => (
                                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={shelf.id} value={shelf.id}>{`Estantería ${shelf.numero}`}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="space" className="text-sm font-medium">Espacio</Label>
                                            {spaces.length > 0 ? (
                                                <Select
                                                    id="space"
                                                    value={selectedSpace}
                                                    onValueChange={(value) => handleSpaceChange(value)}
                                                >
                                                    <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                        <SelectValue>{selectedSpace ? spaces.find(space => space.id === selectedSpace)?.numeroEspacio : "Selecciona el espacio"}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {spaces.map(space => (
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
                                                </Select>
                                            ) : (
                                                <p className="text-sm text-gray-500">Estantería sin espacios, por favor vuelva a generar los espacios</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-medium">Estado actual: {statuses.find(status => status.id === formData.estado)?.descripcion || "Estado no disponible"}</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image" className="text-sm font-medium">Imagen</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.imagenPreview ? (
                                            <img
                                                src={formData.imagenPreview}
                                                width="80vw"
                                                height="100vh"
                                                alt="Imagen del material"
                                                className="rounded-md"
                                                style={{ aspectRatio: "64/64", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div className="w-[4vw] h-[8vh] border rounded-2xl flex justify-center items-center">
                                                <p className="text-sm text-center font-thin">No hay imagen disponible</p>
                                            </div>
                                        )}
                                        <div className="flex flex-row gap-2">
                                            <Button variant="sipemodalalt" onClick={handleDeleteImage}>ELIMINAR IMAGEN</Button>
                                            <input type="file" id="photo" className="hidden" onChange={handleFileChange} />
                                            <Button variant="sipemodal" onClick={() => document.getElementById('photo').click()}>
                                                SUBIR NUEVA IMAGEN
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-4">
                                <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>CANCELAR</Button>
                                <Button variant="sipebutton" size="sipebutton" onClick={handleSave}>GUARDAR</Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default MaterialEditModal;
