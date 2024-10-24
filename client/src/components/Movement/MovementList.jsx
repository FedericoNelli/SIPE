import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function MovementList({ movements, pendingMovements, isDeleteMode, selectedMovements, setSelectedMovements, handleDeleteMovements, onConfirmMovement, notify }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false); // Estado para la confirmación de eliminación


    // Función para alternar la selección de un movimiento
    const toggleMovementSelection = (movementId) => {
        if (selectedMovements.includes(movementId)) {
            setSelectedMovements(selectedMovements.filter(id => id !== movementId));
        } else {
            setSelectedMovements([...selectedMovements, movementId]);
        }
    };

    // Función para manejar la selección de todos los movimientos
    const handleSelectAll = () => {
        const allMovementIds = movements.map(movement => movement.id);
        if (selectedMovements.length === allMovementIds.length) {
            setSelectedMovements([]);
        } else {
            setSelectedMovements(allMovementIds);
        }
    };

    // Función para manejar la confirmación de eliminación
    const confirmDelete = () => {
        if (selectedMovements.length === 0) {
            notify('error', 'No hay movimientos seleccionados para eliminar');
            return;
        }
        setIsConfirmingDeletion(true);
    };

    // Función para CANCELAR la confirmación de eliminación
    const cancelDelete = () => {
        setIsConfirmingDeletion(false);
    };

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).replace(',', '');
    };

    return (
        <>
            {(movements.length === 0 && pendingMovements.length === 0) ? (
                <p className="text-center text-white">No hay movimientos generados</p>
            ) : (
                <Table className="w-full text-white">
                    <TableHeader>
                        <TableRow>
                            {isDeleteMode && (
                                <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">
                                    <input
                                        type="checkbox"
                                        checked={selectedMovements.length === movements.length && movements.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </TableHead>
                            )}
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Fecha</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Usuario</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Material</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad Movida</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito Origen</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito Destino</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.map(movement => (
                            <TableRow key={movement.id}>
                                {isDeleteMode && (
                                    <TableCell className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedMovements.includes(movement.id)}
                                            onChange={() => toggleMovementSelection(movement.id)}
                                        />
                                    </TableCell>
                                )}
                                <TableCell className="text-center font-light">{formatDate(movement.fechaMovimiento)}</TableCell>
                                <TableCell className="text-center font-light">{movement.Usuario}</TableCell>
                                <TableCell className="text-center font-light">{movement.nombreMaterial}</TableCell>
                                <TableCell className="text-center font-light">{movement.cantidad}</TableCell>
                                <TableCell className="text-center font-light">{movement.depositoOrigen}</TableCell>
                                <TableCell className="text-center font-light">{movement.depositoDestino}</TableCell>
                                <TableCell className="text-center" />
                            </TableRow>
                        ))}
                        {pendingMovements.map((movement, index) => (
                            <TableRow key={`pending-${index}`} className="bg-gray-600">
                                <TableCell className="text-center font-light">{formatDate(movement.fechaMovimiento)}</TableCell>
                                <TableCell className="text-center font-light">{movement.idUsuario}</TableCell>
                                <TableCell className="text-center font-light">{movement.idMaterial}</TableCell>
                                <TableCell className="text-center font-light">{movement.cantidadMovida}</TableCell>
                                <TableCell className="text-center font-light">{movement.idDepositoOrigen}</TableCell>
                                <TableCell className="text-center font-light">{movement.idDepositoDestino}</TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        onClick={() => onConfirmMovement(movement)}
                                        variant="sipemodal"
                                    >
                                        Confirmar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {isDeleteMode && (
                <div className="flex flex-col items-center mt-4">
                    {isConfirmingDeletion ? (
                        <>
                            <p className="text-red-500 font-bold">Si confirma la eliminación no se podrán recuperar los datos</p>
                            <div className="flex gap-4 mt-2">
                                <Button onClick={cancelDelete} variant="sipemodalalt">
                                    CANCELAR
                                </Button>
                                <Button onClick={handleDeleteMovements} variant="sipemodal">
                                    ACEPTAR
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button onClick={confirmDelete} variant="sipemodalalt">
                            CONFIRMAR ELIMINACIÓN
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

export default MovementList;
