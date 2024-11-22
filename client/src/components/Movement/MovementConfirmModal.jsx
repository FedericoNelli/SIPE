import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";

function MovementConfirmModal({ movement, onClose, notify, onMovementConfirmed, onRemovePendingMovement, onMovementUpdated }) {
    const [cantidadRecibida, setCantidadRecibida] = useState(movement.cantidad);
    const [cantidadMovida, setCantidadMovida] = useState(movement.cantidadMovida);

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

    const handleInputChange = (e) => {
        const value = e.target.value;

        // Permitir solo números positivos o vacío
        if (value === '' || /^\d+$/.test(value)) {
            setCantidadRecibida(value);
        } else {
            notify('error', 'Por favor ingrese solo valores positivos');
        }
    };

    const handleConfirmMovement = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(
                'http://localhost:8081/addMovements',
                {
                    ...movement,
                    cantidadMovida: cantidadMovida,
                    cantidadRecibida: cantidadRecibida || 0,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json', 
                    },
                }
            );

            if (response.status !== 200) {
                throw new Error(response.data.error || 'Error al confirmar el movimiento');
            }

            notify('success', '¡Movimiento confirmado exitosamente!');
            if (onClose) onClose();
            if (onMovementConfirmed) onMovementConfirmed();
            onMovementUpdated();
        } catch (error) {
            console.error('Error al confirmar el movimiento:', error);
            if (error.response && error.response.data && error.response.data.error) {
                notify('error', error.response.data.error);
            } else {
                notify('error', error.message || 'Error al confirmar el movimiento');
            }
        }
    };


    const handleCancelMovement = () => {
        if (onRemovePendingMovement) {
            onRemovePendingMovement(movement);
        }
        if (onClose) onClose();
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-3xl text-center font-bold mb-2">Confirmar Movimiento</CardTitle>
                <hr className="text-sipe-gray" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
                <div className="flex flex-col gap-4">
                    {/* Mostrar nombre del material y cantidad original */}
                    <div className="text-center">
                        <p className="text-lg font-semibold">{movement.materialNombre}</p>
                        <p className="text-lg text-sipe-gray">Cantidad movida al inicio: {movement.cantidadMovida}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="cantidadRecibida" className="text-sm font-medium">Cantidad Recibida</Label>
                        <Input
                            className="border-b"
                            id="cantidadRecibida"
                            name="cantidadRecibida"
                            type="number"
                            value={cantidadRecibida}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancelMovement}>
                    NO CONFIRMAR
                </Button>
                <Button variant="sipebutton" size="sipebutton" onClick={handleConfirmMovement}>
                    CONFIRMAR
                </Button>
            </CardFooter>
        </Card>
    );
}

export default MovementConfirmModal;
