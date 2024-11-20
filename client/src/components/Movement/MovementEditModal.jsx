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
    const [movementNumber, setMovementNumber] = useState('');
    const [movementData, setMovementData] = useState(null);
    const [cantidad, setCantidad] = useState('');
    const [cantidadDisponible, setCantidadDisponible] = useState('');
    const [idMaterial, setIdMaterial] = useState('');
    const [fechaMovimiento, setFechaMovimiento] = useState('');
    const [depositos, setDepositos] = useState([]);
    const [selectedDepositoOrigen, setSelectedDepositoOrigen] = useState('');
    const [selectedDepositoDestino, setSelectedDepositoDestino] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState('');
    const [materials, setMaterials] = useState([]);
    const [maxDatetime, setMaxDatetime] = useState('');

    useEffect(() => {
        const now = new Date();
        setMaxDatetime(now.toISOString().split("T")[0]);
    }, []);

    // Cerrar modal al presionar la tecla Escape
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
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
                    setMovementNumber(data.numero) || '';
                    setIdMaterial(data.idMaterial || '');
                    setFechaMovimiento(data.fechaMovimiento ? data.fechaMovimiento.slice(0, 10) : '');
                    setSelectedDepositoOrigen(data.idDepositoOrigen || '');
                    setSelectedDepositoDestino(data.idDepositoDestino || '');
                    setSelectedUsuario(data.idUsuario || '');

                    // Encontrar y mostrar la cantidad disponible del material seleccionado
                    const materialSeleccionado = materials.find(material => material.id === data.idMaterial);
                    setCantidadDisponible(materialSeleccionado ? materialSeleccionado.cantidad : 0);

                } catch (error) {
                    notify('error', 'Error al cargar los datos del movimiento');
                }
            };
            fetchMovementData();
        }
    }, [selectedMovementId, materials]);

    const handleUpdateMovement = async () => {
        const now = new Date();
        const selectedDate = new Date(fechaMovimiento);

        if (selectedDate > now) {
            notify('error', 'La fecha seleccionada no puede ser futura');
            return;
        }

        if (cantidad > cantidadDisponible) {
            notify('error', 'La cantidad a mover no puede ser mayor a la cantidad disponible');
            return;
        }
        try {
            await axios.put(`http://localhost:8081/edit-movements/${selectedMovementId}`, {
                numero: movementNumber,
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
            if (error.response && error.response.data && error.response.data.error) {
                notify('error', error.response.data.error)
            } else {
                notify('error', 'Error al actualizar el movimiento');
            }
        }
    };

    const handleMovementNumberChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[1-9]\d*$/.test(value)) { // Solo permitir valores positivos o vacío
            setMovementNumber(value);
        } else if (value === '0' || value.startsWith('-')) {
            setMovementNumber(''); // Restablecer si es 0 o negativo
            notify('error', 'El número de movimiento no puede ser 0 ni negativo');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl w-full max-w-2xl">
                <Card className="bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar movimiento</CardTitle>
                        <hr />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {movements.length > 0 ? (
                            // Renderiza el contenido completo si hay movimientos
                            <div className='flex flex-row items-center justify-center gap-20'>
                                <div className='flex flex-col justify-center gap-3'>
                                    <div className="grid gap-2">
                                        <Label htmlFor="movement" className="text-sm font-medium">Seleccionar Movimiento</Label>
                                        <Select value={selectedMovementId} onValueChange={setSelectedMovementId}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue placeholder="Seleccionar movimiento" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-sipe-blue-light">
                                                {movements.map((movement) => (
                                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={movement.id} value={movement.id}>
                                                        Movimiento {movement.numero}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="numero" className="text-sm font-medium">Nuevo número de movimiento</Label>
                                        <Input
                                            id="numero"
                                            value={movementNumber}
                                            onChange={handleMovementNumberChange}
                                            required
                                            className="bg-sipe-blue-dark text-sipe-white border-sipe-white border-b-1"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="fechaMovimiento" className="text-sm font-medium">Fecha del movimiento</Label>
                                        <Input
                                            id="fechaMovimiento"
                                            type="date"
                                            value={fechaMovimiento}
                                            onChange={(e) => setFechaMovimiento(e.target.value)}
                                            required
                                            className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg"
                                            max={maxDatetime}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cantidadDisponible" className="text-sm font-medium">Cantidad disponible</Label>
                                        <Input
                                            id="cantidadDisponible"
                                            value={cantidadDisponible}
                                            readOnly
                                            className="bg-sipe-blue-dark text-sipe-white border-sipe-white border-b-1"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cantidad" className="text-sm font-medium">Cantidad</Label>
                                        <Input
                                            id="cantidad"
                                            value={cantidad}
                                            onChange={(e) => setCantidad(e.target.value)}
                                            required
                                            className="bg-sipe-blue-dark text-sipe-white border-sipe-white border-b-1"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="idMaterial" className="text-sm font-medium">Material</Label>
                                        <Select value={idMaterial} onValueChange={setIdMaterial}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue placeholder="Seleccionar material" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-sipe-blue-light">
                                                {materials.map((material) => (
                                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={material.id} value={material.id}>
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
                                            <SelectContent className="bg-sipe-blue-light">
                                                {usuarios.map((usuario) => (
                                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={usuario.id} value={usuario.id}>
                                                        {usuario.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="depositoOrigen" className="text-sm font-medium">Depósito de origen</Label>
                                        <Select value={selectedDepositoOrigen} onValueChange={setSelectedDepositoOrigen}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue placeholder="Seleccionar depósito origen" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-sipe-blue-light">
                                                {depositos.map((deposito) => (
                                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={deposito.id} value={deposito.id}>
                                                        {deposito.nombre} - {deposito.ubicacion}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="depositoDestino" className="text-sm font-medium">Depósito de destino</Label>
                                        <Select value={selectedDepositoDestino} onValueChange={setSelectedDepositoDestino}>
                                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                                <SelectValue placeholder="Seleccionar depósito destino" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-sipe-blue-light">
                                                {depositos.map((deposito) => (
                                                    <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={deposito.id} value={deposito.id}>
                                                        {deposito.nombre} - {deposito.ubicacion}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fechaMovimiento" className="text-sm font-medium">Fecha del movimiento</Label>
                                    <Input
                                        id="fechaMovimiento"
                                        type="date"
                                        value={fechaMovimiento}
                                        onChange={(e) => setFechaMovimiento(e.target.value)}
                                        required
                                        className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg"
                                        max={maxDatetime}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cantidadDisponible" className="text-sm font-medium">Cantidad Disponible</Label>
                                    <Input
                                        id="cantidadDisponible"
                                        value={cantidadDisponible}
                                        readOnly
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
                                        className="bg-sipe-blue-dark text-sipe-white border-sipe-white border-b-1"
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
                                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={material.id} value={material.id}>
                                                    {`${material.nombre} - ${material.depositoNombre} - ${material.ubicacionNombre}`}
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
                                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={usuario.id} value={usuario.id}>
                                                    {usuario.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="depositoOrigen" className="text-sm font-medium">Depósito de origen</Label>
                                    <Select value={selectedDepositoOrigen} onValueChange={setSelectedDepositoOrigen}>
                                        <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                            <SelectValue placeholder="Seleccionar depósito origen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {depositos.map((deposito) => (
                                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={deposito.id} value={deposito.id}>
                                                    {deposito.nombre} - {deposito.ubicacion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="depositoDestino" className="text-sm font-medium">Depósito de destino</Label>
                                    <Select value={selectedDepositoDestino} onValueChange={setSelectedDepositoDestino}>
                                        <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                            <SelectValue placeholder="Seleccionar depósito destino" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {depositos.map((deposito) => (
                                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-lg" key={deposito.id} value={deposito.id}>
                                                    {deposito.nombre} - {deposito.ubicacion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            // Muestra el mensaje si no hay movimientos
                            <p className="text-gray-500 text-center">No hay movimientos generados.</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>CANCELAR</Button>
                        <Button variant="sipebutton" size="sipebutton" onClick={handleUpdateMovement}>ACTUALIZAR</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default MovementEditModal;
