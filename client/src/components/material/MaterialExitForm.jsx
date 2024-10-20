import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';  // Importamos date-fns para formatear y parsear fechas
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import { X } from "lucide-react";

function MaterialExitForm({ onClose, notify, onExitCreated }) {  // Agregamos la prop onExitCreated
    const [ubicaciones, setUbicaciones] = useState([]);
    const [depositos, setDepositos] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [users, setUsers] = useState([]);

    const [selectedUbicacion, setSelectedUbicacion] = useState(null);
    const [selectedDeposito, setSelectedDeposito] = useState(null);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [reason, setReason] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd')); // Fecha actual como valor inicial
    const [maxDate] = useState(format(new Date(), 'yyyy-MM-dd')); // Establecemos la fecha máxima como hoy

    useEffect(() => {
        axios.get('http://localhost:8081/deposit-locations')
            .then(response => setUbicaciones(response.data))
            .catch(error => console.error('Error fetching locations:', error));

        axios.get('http://localhost:8081/users')
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    const handleUbicacionChange = (value) => {
        setSelectedUbicacion(value);
        setSelectedDeposito(null);
        setSelectedMaterials([]);

        axios.get(`http://localhost:8081/deposit-names?locationId=${value}`)
            .then(response => setDepositos(response.data))
            .catch(error => console.error('Error fetching deposits:', error));
    };

    const handleDepositoChange = (value) => {
        setSelectedDeposito(value);
        setSelectedMaterials([]);

        axios.get(`http://localhost:8081/materials/deposit/${value}`)
            .then(response => {
                setMaterials(response.data);
            })
            .catch(error => console.error('Error al obtener materiales:', error));
    };

    const handleMaterialChange = (value) => {
        const selectedId = value;
        const material = materials.find(mat => mat.id === parseInt(selectedId));

        if (material && !selectedMaterials.find(m => m.id === material.id)) {
            setSelectedMaterials([...selectedMaterials, { ...material, cantidadSalida: '' }]);
        }
    };

    const handleQuantityChange = (id, value) => {
        setSelectedMaterials(
            selectedMaterials.map(material =>
                material.id === id
                    ? { ...material, cantidadSalida: value > 0 ? value : 0 }
                    : material
            )
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedDateForMySQL = format(new Date(selectedDate), 'yyyy-MM-dd');
        const salidas = selectedMaterials.map(material => ({
            idMaterial: material.id,
            cantidad: material.cantidadSalida,
            motivo: reason,
            fecha: formattedDateForMySQL,
            idUsuario: selectedUser,
        }));

        axios.post('http://localhost:8081/materials/exits', salidas)
            .then(response => {
                notify('success', 'Salida registrada con éxito');
                if (onExitCreated) {
                    onExitCreated();  // Llamamos a la función para refrescar la lista de salidas
                }
                onClose();  // Cerrar el modal
            })
            .catch(error => {
                console.error('Error registrando salida:', error);
                notify('error', 'Error al registrar la salida');
            });
    };

    const handleRemoveMaterial = (id) => {
        setSelectedMaterials(selectedMaterials.filter(material => material.id !== id));
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="ubicacion" className="text-sm font-medium">Ubicación</Label>
                        <Select onValueChange={handleUbicacionChange}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona una ubicación" />
                            </SelectTrigger>
                            <SelectContent>
                                {ubicaciones.map(ubicacion => (
                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={ubicacion.id} value={ubicacion.id}>{ubicacion.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="deposito" className="text-sm font-medium">Depósito</Label>
                        <Select onValueChange={handleDepositoChange}>
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona un depósito" />
                            </SelectTrigger>
                            <SelectContent>
                                {depositos.map(deposito => (
                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={deposito.id} value={deposito.id}>{deposito.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="material" className="text-sm font-medium">Material</Label>
                    <Select onValueChange={handleMaterialChange}>
                        <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                            <SelectValue placeholder="Selecciona un material" />
                        </SelectTrigger>
                        <SelectContent>
                            {materials.map(material => (
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={material.id} value={material.id} disabled={selectedMaterials.find(m => m.id === material.id)}>
                                    {material.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedMaterials.length > 0 && (
                    <div className="grid gap-2 mt-4">
                        {selectedMaterials.map(material => (
                            <div key={material.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                                <div className="truncate">
                                    <Label className="text-sm">{material.nombre} (Disponible: {material.cantidad})</Label>
                                </div>
                                <Input
                                    type="number"
                                    value={material.cantidadSalida}
                                    onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                                    placeholder="Cant. a retirar"
                                    className="border-b bg-sipe-blue-dark text-white text-sm"
                                />
                                <button
                                    className="text-red-500 hover:text-red-700 text-sm"
                                    onClick={() => handleRemoveMaterial(material.id)}
                                >
                                    <X size={12} strokeWidth={2} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid gap-2 mt-4">
                    <Label htmlFor="fecha" className="text-sm font-medium">Fecha de Salida</Label>
                    <Input
                        type="date"
                        value={selectedDate}
                        max={maxDate}  // Limitar la fecha máxima a hoy
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-b bg-sipe-blue-dark text-white"
                    />
                </div>

                <div className="grid gap-2 mt-4">
                    <Label htmlFor="reason" className="text-sm font-medium">Motivo</Label>
                    <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo de la salida" className="border-b bg-sipe-blue-dark text-white" />
                </div>

                <div className="grid gap-2 mt-4">
                    <Label htmlFor="usuario" className="text-sm font-medium">Usuario</Label>
                    <Select onValueChange={setSelectedUser}>
                        <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                            <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map(user => (
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={user.id} value={user.id}>{user.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
                <Button className="" variant="sipebuttonalt" size="sipebutton" onClick={onClose}>CANCELAR</Button>
                <Button className="" variant="sipebutton" size="sipebutton" onClick={handleSubmit}>Registrar Salida</Button>
            </CardFooter>
        </Card>
    );
}

export default MaterialExitForm;
