import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/Common/Select/Select";
import { X } from 'lucide-react';

const MovementEditModal = ({ onClose, onMovementUpdated, notify }) => {
    const [movements, setMovements] = useState([]);
    const [selectedMovementId, setSelectedMovementId] = useState('');
    const [movementData, setMovementData] = useState(null);
    const [cantidad, setCantidad] = useState('');
    const [idMaterial, setIdMaterial] = useState('');
    const [fechaMovimiento, setFechaMovimiento] = useState('');
    const [depositos, setDepositos] = useState([]);
    const [selectedDepositoOrigen, setSelectedDepositoOrigen] = useState('');
    const [selectedDepositoDestino, setSelectedDepositoDestino] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState('');
    const [materials, setMaterials] = useState([]);


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


    useEffect(() => {
        const fetchMovements = async () => {
            try {
                const response = await axios.get('http://localhost:8081/movements');
                setMovements(response.data);
            } catch (error) {
                notify('error', 'Error al cargar los movimientos');
            }
        };
        fetchMovements();

        // Cargar los depósitos con ubicación
        const fetchDeposits = async () => {
            try {
                const response = await axios.get('http://localhost:8081/deposit-locations-movements');
                setDepositos(response.data);
            } catch (error) {
                notify('error', 'Error al cargar los depósitos');
            }
        };
        fetchDeposits();

        // Cargar los usuarios
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8081/users');
                setUsuarios(response.data);
            } catch (error) {
                notify('error', 'Error al cargar los usuarios');
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const response = await axios.get('http://localhost:8081/materials'); 
                setMaterials(response.data);
            } catch (error) {
                notify('error', 'Error al cargar los materiales');
            }
        };
        fetchMaterials();
    }, []);
    

    useEffect(() => {
        if (selectedMovementId) {
            const fetchMovementData = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/movements/${selectedMovementId}`);
                    const data = response.data;
                    setMovementData(data);
                    setCantidad(data.cantidad || '');
                    setIdMaterial(data.idMaterial || '');
                    setFechaMovimiento(data.fechaMovimiento ? data.fechaMovimiento.slice(0, 10) : '');
                    setSelectedDepositoOrigen(data.idDepositoOrigen || '');
                    setSelectedDepositoDestino(data.idDepositoDestino || '');
                    setSelectedUsuario(data.idUsuario || ''); // Cargar el ID del usuario
                } catch (error) {
                    notify('error', 'Error al cargar los datos del movimiento');
                }
            };
            fetchMovementData();
        }
    }, [selectedMovementId]);

    const handleUpdateMovement = async () => {
        try {
            await axios.put(`http://localhost:8081/edit-movements/${selectedMovementId}`, {
                cantidad,
                fechaMovimiento,
                idMaterial,
                idDepositoOrigen: selectedDepositoOrigen,
                idDepositoDestino: selectedDepositoDestino,
                idUsuario: selectedUsuario // Mandar el usuario seleccionado
            });
            notify('success', 'Movimiento actualizado correctamente');
            onMovementUpdated(); // Recargar lista de movimientos
            onClose(); // Cerrar modal
        } catch (error) {
            notify('error', 'Error al actualizar el movimiento');
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
                        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar Movimiento</CardTitle>
                        <hr />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="movement" className="text-sm font-medium">Seleccionar Movimiento</Label>
                            <Select value={selectedMovementId} onValueChange={setSelectedMovementId}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar movimiento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {movements.map((movement) => (
                                        <SelectItem key={movement.id} value={movement.id}>
                                            Movimiento {movement.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="fechaMovimiento" className="text-sm font-medium">Fecha Movimiento</Label>
                            <Input
                                id="fechaMovimiento"
                                type="date"
                                value={fechaMovimiento}
                                onChange={(e) => setFechaMovimiento(e.target.value)}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cantidad" className="text-sm font-medium">Cantidad</Label>
                            <Input
                                id="cantidad"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                required
                                className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="idMaterial" className="text-sm font-medium">Material</Label>
                            <Select value={idMaterial} onValueChange={setIdMaterial}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar material" />
                                </SelectTrigger>
                                <SelectContent>
                                    {materials.map((material) => (
                                        <SelectItem key={material.id} value={material.id}>
                                            {material.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="usuario" className="text-sm font-medium">Usuario</Label>
                            <Select value={selectedUsuario} onValueChange={setSelectedUsuario}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar usuario" />
                                </SelectTrigger>
                                <SelectContent>
                                    {usuarios.map((usuario) => (
                                        <SelectItem key={usuario.id} value={usuario.id}>
                                            {usuario.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="depositoOrigen" className="text-sm font-medium">Depósito Origen</Label>
                            <Select value={selectedDepositoOrigen} onValueChange={setSelectedDepositoOrigen}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar depósito origen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {depositos.map((deposito) => (
                                        <SelectItem key={deposito.id} value={deposito.id}>
                                            {deposito.nombre} - {deposito.ubicacion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="depositoDestino" className="text-sm font-medium">Depósito Destino</Label>
                            <Select value={selectedDepositoDestino} onValueChange={setSelectedDepositoDestino}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccionar depósito destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {depositos.map((deposito) => (
                                        <SelectItem key={deposito.id} value={deposito.id}>
                                            {deposito.nombre} - {deposito.ubicacion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>Cancelar</Button>
                        <Button variant="sipebutton" size="sipebutton" onClick={handleUpdateMovement}>Actualizar Movimiento</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default MovementEditModal;
