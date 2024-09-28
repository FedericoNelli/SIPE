import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { X } from "lucide-react";

function MaterialExitForm({ onClose, notify }) {
    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [availableQuantity, setAvailableQuantity] = useState(0);
    const [location, setLocation] = useState('');
    const [deposit, setDeposit] = useState('');

    useEffect(() => {
        // Obtener la lista de materiales
        axios.get('http://localhost:8081/materials')
            .then(response => {
                setMaterials(response.data);
            })
            .catch(error => {
                console.error('Error fetching materials:', error);
            });
    }, []);

    const handleMaterialChange = (value) => {
        const selectedId = value;
        setSelectedMaterial(selectedId);

        // Obtener los detalles del material seleccionado
        const material = materials.find(mat => mat.id === parseInt(selectedId));
        if (material) {
            setAvailableQuantity(material.cantidad);
            setLocation(material.ubicacionNombre);
            setDeposit(material.depositoNombre);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        if (id === 'quantity' && value < 0) {
            setQuantity(0);
        } else {
            setQuantity(value);
        }
    };

    const handleSave = () => {
        if (!selectedMaterial || !quantity || !reason) {
            notify('error', 'Todos los campos son obligatorios');
            return;
        }

        if (parseInt(quantity) > availableQuantity) {
            notify('error', 'La cantidad de salida no puede ser mayor a la cantidad disponible' );
            return;
        }

        const exitData = {
            idMaterial: selectedMaterial,
            cantidad: quantity,
            motivo: reason,
            fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
        };

        axios.post('http://localhost:8081/materiales/salidas', exitData)
            .then(response => {
                notify('success', 'Salida de material registrada con éxito');
                if (onClose) onClose(); // Cerrar el formulario
                setTimeout(() => {
                    window.location.reload(); // Recargar la página después de 2 segundos
                }, 2000);
            })
            .catch(error => {
                console.error('Error registering material exit:', error);
                notify('error', 'Hubo un error al registrar la salida' );
            });
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4 rounded-xl relative">
            <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                <X size={14} strokeWidth={4} onClick={onClose} />
            </div>
            <CardHeader>
                <CardTitle className="text-3xl font-bold mb-2 text-center">Registrar Salida de Material</CardTitle>
                <hr />
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="material" className="text-sm font-medium">Material</Label>
                    <Select id="material" onValueChange={handleMaterialChange}>
                        <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                            <SelectValue placeholder="Selecciona el material" />
                        </SelectTrigger>
                        <SelectContent>
                            {materials.map(material => (
                                <SelectItem key={material.id} value={material.id}>
                                    {material.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedMaterial && (
                    <>
                        <div className="grid gap-2">
                            <p className="text-sipe-white">Ubicación: {location}</p>
                            <p className="text-sipe-white">Depósito: {deposit}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity" className="text-sm font-medium">Cantidad de salida</Label>
                            <Input
                                className="border-b"
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={handleInputChange}
                                min="1"
                                max={availableQuantity}
                                required
                                placeholder={`Máximo disponible: ${availableQuantity}`}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason" className="text-sm font-medium">Motivo de salida</Label>
                            <Input
                                className="border-b"
                                id="reason"
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                placeholder="Motivo de la salida"
                            />
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
                <Button className="" variant="sipebuttonalt" size="sipebutton" onClick={onClose}>CANCELAR</Button>
                <Button className="" variant="sipebutton" size="sipebutton" onClick={handleSave}>REGISTRAR</Button>
            </CardFooter>
        </Card>
    );
}

export default MaterialExitForm;
