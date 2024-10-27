import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function MovementConfirmModal({ movement, onClose, notify, onMovementConfirmed, onRemovePendingMovement }) {
    const [cantidadRecibida, setCantidadRecibida] = useState(movement.cantidad);

    const handleInputChange = (e) => {
        setCantidadRecibida(e.target.value);
    };

    const handleConfirmMovement = async () => {
        try {
            const response = await axios.post('http://localhost:8081/addMovements', {
                ...movement,
                cantidadMovida: cantidadRecibida,
            });

            if (response.status !== 200) {
                throw new Error(response.data.error || 'Error al confirmar el movimiento');
            }

            notify('success', '¡Movimiento confirmado exitosamente!');
            if (onClose) onClose();
            if (onMovementConfirmed) onMovementConfirmed();

        } catch (error) {
            console.error('Error al confirmar el movimiento:', error);
            notify('error', error.message || 'Error al confirmar el movimiento');
        }
    };

    const handleCancelMovement = () => {
        if (onRemovePendingMovement) {
            onRemovePendingMovement(movement);
        }
        if (onClose) onClose();
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4">
            <CardHeader>
                <CardTitle className="text-3xl text-center font-bold mb-2">Confirmar Movimiento</CardTitle>
                <hr className="text-sipe-gray" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="cantidadRecibida" className="text-sm font-medium">Cantidad Recibida</Label>
                        <Input
                            className="border-b"
                            id="cantidadRecibida"
                            name="cantidadRecibida"
                            type="number"
                            value={cantidadRecibida}
                            onChange={handleInputChange}
                            min="0"
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
