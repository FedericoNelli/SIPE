import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function ShelfList({ shelves, isDeleteMode, isEmptyMode, selectedShelves, setSelectedShelves, handleDeleteShelves, handleEmptyShelves, notify }) {
    const [isConfirmingAction, setIsConfirmingAction] = useState(false); // Estado para la confirmación de acción (eliminar o vaciar)

    // Función para alternar la selección de una estantería
    const toggleShelfSelection = (shelfId) => {
        if (selectedShelves.includes(shelfId)) {
            setSelectedShelves(selectedShelves.filter(id => id !== shelfId));
        } else {
            setSelectedShelves([...selectedShelves, shelfId]);
        }
    };

    // Función para manejar la selección de todas las estanterías
    const handleSelectAll = () => {
        if (selectedShelves.length === shelves.length) {
            setSelectedShelves([]);
        } else {
            const allShelfIds = shelves.map(shelf => shelf.id);
            setSelectedShelves(allShelfIds);
        }
    };

    // Función para manejar la confirmación de acción
    const confirmAction = () => {
        if (selectedShelves.length === 0) {
            notify('error', 'No hay estanterías seleccionadas');
            return;
        }
        setIsConfirmingAction(true);
    };

    // Función para CANCELAR la confirmación de acción
    const cancelAction = () => {
        setIsConfirmingAction(false);
    };

    return (
        <>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        {(isDeleteMode || isEmptyMode) && (
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">
                                <input
                                    type="checkbox"
                                    checked={selectedShelves.length === shelves.length && shelves.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                        )}
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Estantería número</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de estantes</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de divisiones</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Ubicación</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Pasillo</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Lado</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de materiales</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shelves.map(shelf => (
                        <TableRow key={shelf.id}>
                            {(isDeleteMode || isEmptyMode) && (
                                <TableCell className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedShelves.includes(shelf.id)}
                                        onChange={() => toggleShelfSelection(shelf.id)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="text-center font-light">Estantería {shelf.numero}</TableCell>
                            <TableCell className="text-center font-light">{shelf.cantidad_estante}</TableCell>
                            <TableCell className="text-center font-light">{shelf.cantidad_division}</TableCell>
                            <TableCell className="text-center font-light">{shelf.nombreUbicacion}</TableCell>
                            <TableCell className="text-center font-light">{shelf.nombreDeposito}</TableCell>
                            <TableCell className="text-center font-light">{shelf.numeroPasillo}</TableCell>
                            <TableCell className="text-center font-light">{shelf.direccionLado}</TableCell>
                            <TableCell className="text-center font-light">{shelf.totalMateriales}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {(isDeleteMode || isEmptyMode) && (
                <div className="flex flex-col items-center mt-4">
                    {isConfirmingAction ? (
                        <>
                            <p className="text-red-500 font-bold">
                                {isDeleteMode ? 'CONFIRMAR ELIMINACIÓN DE ESTANTERÍAS' : 'CONFIRMAR VACIADO DE ESTANTERÍAS'}
                            </p>
                            <div className="flex gap-4 mt-2">
                                <Button onClick={cancelAction} variant="sipemodalalt">
                                    CANCELAR
                                </Button>
                                <Button
                                    onClick={isDeleteMode ? handleDeleteShelves : handleEmptyShelves}
                                    variant="sipemodal"
                                >
                                    ACEPTAR
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button onClick={confirmAction} variant="sipemodalalt">
                            {isDeleteMode ? 'CONFIRMAR ELIMINACIÓN' : 'CONFIRMAR VACIADO DE ESTANTERÍAS'}
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

export default ShelfList;
