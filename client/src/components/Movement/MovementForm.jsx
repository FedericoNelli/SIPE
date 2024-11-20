import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function MovementForm({ onClose, addPendingMovement, notify, onMovementUpdated }) {
    const [formData, setFormData] = useState({
        fechaMovimiento: '',
        idMaterial: '',
        idUsuario: '',
        idDepositoOrigen: '',
        idDepositoDestino: '',
        cantidadMovida: '',
        numero: ''
    });
    const [materiales, setMateriales] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [depositos, setDepositos] = useState([]);
    const [cantidadDisponible, setCantidadDisponible] = useState('');
    const [maxDatetime, setMaxDatetime] = useState('');

    // Cerrar modal al presionar la tecla Escape
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            } onMovementUpdated();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    useEffect(() => {
        axios.get('http://localhost:8081/materials')
            .then(response => setMateriales(response.data))
            .catch(error => {
                console.error('Error al obtener materiales:', error);
                notify('error', 'Error al cargar materiales');
            });

        axios.get('http://localhost:8081/users')
            .then(response => setUsuarios(response.data))
            .catch(error => {
                console.error('Error al obtener usuarios:', error);
                notify('error', 'Error al cargar usuarios');
            });

        axios.get('http://localhost:8081/deposit-locations-movements')
            .then(response => setDepositos(response.data))
            .catch(error => {
                console.error('Error al obtener depósitos:', error);
                notify('error', 'Error al cargar depósitos');
            });
    }, [notify]);

    useEffect(() => {
        if (formData.idMaterial) {
            const materialSeleccionado = materiales.find(material => material.id === formData.idMaterial);
            if (materialSeleccionado) {
                setFormData((prevData) => ({
                    ...prevData,
                    idDepositoOrigen: materialSeleccionado.idDeposito
                }));
                setCantidadDisponible(materialSeleccionado.cantidad);
            }
        }
    }, [formData.idMaterial, materiales]);

    useEffect(() => {
        const now = new Date();
        setMaxDatetime(now.toISOString().split("T")[0]);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "fechaMovimiento") {
            const now = new Date();
            const selectedDate = new Date(value);
            if (selectedDate > now) {
                notify('error', 'La hora seleccionada no puede ser futura');
                return;
            }
        }
        if (name === "cantidadMovida" && value > cantidadDisponible) {
            notify('error', 'La cantidad a mover no puede ser mayor a la disponible');
            return;
        }
        // Validación solo para el campo "numero"
        if (name === "numero") {
            if (value === "" || value === "-") {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: value
                }));
                return;
            }
            const numero = Number(value);
            if (numero <= 0) {
                notify('error', 'El número de movimiento no puede ser 0 ni negativo');
                return;
            }
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSelectChange = (name) => (value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAddPendingMovement = () => {
        const material = materiales.find(mat => mat.id === formData.idMaterial);
        const usuario = usuarios.find(user => user.id === formData.idUsuario);
        const depositoOrigen = depositos.find(dep => dep.id === formData.idDepositoOrigen);
        const depositoDestino = depositos.find(dep => dep.id === formData.idDepositoDestino);

        const movementWithDetails = {
            ...formData,
            fechaMovimiento: new Date(formData.fechaMovimiento).toISOString().split('T')[0],
            materialNombre: material ? material.nombre : '',
            usuarioNombre: usuario ? usuario.nombre : '',
            depositoOrigenNombre: depositoOrigen ? depositoOrigen.nombre : '',
            depositoDestinoNombre: depositoDestino ? depositoDestino.nombre : '',
            expiry: new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        };

        addPendingMovement(movementWithDetails);
        onMovementUpdated();
        onClose();
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4">
            <CardHeader>
                <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nuevo movimiento</CardTitle>
                <hr className="text-sipe-gray" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="numero" className="text-sm font-medium">Número de movimiento</Label>
                        <Input
                            className="border-b"
                            id="numero"
                            name="numero"
                            type="number"
                            value={formData.numero}
                            onChange={handleInputChange}
                            max={1}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="fechaMovimiento" className="text-sm font-medium">Fecha de movimiento</Label>
                        <Input
                            className="border-b"
                            id="fechaMovimiento"
                            name="fechaMovimiento"
                            type="date"
                            value={formData.fechaMovimiento}
                            onChange={handleInputChange}
                            max={maxDatetime}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="idMaterial" className="text-sm font-medium">Material</Label>
                        {materiales.length === 0 ? (
                            <p className="text-sipe-gray">No hay materiales disponibles</p>
                        ) : (
                            <Select
                                value={formData.idMaterial}
                                onValueChange={handleSelectChange('idMaterial')}
                                className="w-full"
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona un material" />
                                </SelectTrigger>
                                <SelectContent className="bg-sipe-blue-light">
                                    {materiales.map((material) => (
                                        <SelectItem
                                            className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                            key={material.id}
                                            value={material.id}
                                        >
                                            {material.nombre} - {material.depositoNombre} - {material.ubicacionNombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="cantidadDisponible" className="text-sm font-medium">Cantidad Disponible</Label>
                        <Input
                            className="border-b"
                            id="cantidadDisponible"
                            name="cantidadDisponible"
                            type="number"
                            value={cantidadDisponible}
                            readOnly
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="cantidadMovida" className="text-sm font-medium">Cantidad a Mover</Label>
                        <Input
                            className="border-b"
                            id="cantidadMovida"
                            name="cantidadMovida"
                            type="number"
                            value={formData.cantidadMovida}
                            onChange={handleInputChange}
                            max={cantidadDisponible}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="idUsuario" className="text-sm font-medium">Usuario que mueve el material</Label>
                        <Select
                            value={formData.idUsuario}
                            onValueChange={handleSelectChange('idUsuario')}
                            className="w-full"
                        >
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona un usuario" />
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
                    <div className="flex items-center gap-2">
                        <Label htmlFor="idDepositoOrigen" className="text-sm font-medium">Depósito Origen</Label>
                        <Select
                            value={formData.idDepositoOrigen}
                            onValueChange={handleSelectChange('idDepositoOrigen')}
                            className="w-full"
                            disabled
                        >
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona un depósito origen" />
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
                    <div className="flex items-center gap-2">
                        <Label htmlFor="idDepositoDestino" className="text-sm font-medium">Depósito Destino</Label>
                        {depositos.length === 0 ? (
                            <p className="text-sipe-gray text-sm">No hay depósitos disponibles</p>
                        ) : (
                            <Select
                                value={formData.idDepositoDestino}
                                onValueChange={handleSelectChange('idDepositoDestino')}
                                className="w-full"
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona un depósito destino" />
                                </SelectTrigger>
                                <SelectContent className="bg-sipe-blue-light">
                                    {depositos
                                        .filter(deposito => deposito.id !== formData.idDepositoOrigen)
                                        .map((deposito) => (
                                            <SelectItem
                                                className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                                key={deposito.id}
                                                value={deposito.id}
                                            >
                                                {deposito.nombre} - {deposito.ubicacion}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>
                    CANCELAR
                </Button>
                <Button variant="sipebutton" size="sipebutton" onClick={handleAddPendingMovement}>
                    AGREGAR
                </Button>
            </CardFooter>
        </Card>
    );
}

export default MovementForm;
