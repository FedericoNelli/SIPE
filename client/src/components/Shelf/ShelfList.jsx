import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function ShelfList({ shelves, isDeleteMode, selectedShelves, setSelectedShelves, handleDeleteShelves, notify }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false); // Estado para la confirmación de eliminación

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

    // Función para manejar la confirmación de eliminación
    const confirmDelete = () => {
        if (selectedShelves.length === 0) {
            notify('error', 'No hay estanterías seleccionadas para eliminar');
            return;
        }
        setIsConfirmingDeletion(true);
    };

    // Función para cancelar la confirmación de eliminación
    const cancelDelete = () => {
        setIsConfirmingDeletion(false);
    };

    return (
        <>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        {isDeleteMode && (
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">
                                <input
                                    type="checkbox"
                                    checked={selectedShelves.length === shelves.length && shelves.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                        )}
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Estanteria número</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de estantes</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de divisiones</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Ubicación</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Pasillo</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Lado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shelves.map(shelf => (
                        <TableRow key={shelf.id}>
                            {isDeleteMode && (
                                <TableCell className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedShelves.includes(shelf.id)}
                                        onChange={() => toggleShelfSelection(shelf.id)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="text-center font-light">Estanteria {shelf.numero}</TableCell>
                            <TableCell className="text-center font-light">{shelf.cantidad_estante}</TableCell>
                            <TableCell className="text-center font-light">{shelf.cantidad_division}</TableCell>
                            <TableCell className="text-center font-light">{shelf.nombreUbicacion}</TableCell>
                            <TableCell className="text-center font-light">{shelf.nombreDeposito}</TableCell>
                            <TableCell className="text-center font-light">{shelf.numeroPasillo}</TableCell>
                            <TableCell className="text-center font-light">{shelf.direccionLado}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {isDeleteMode && (
                <div className="flex flex-col items-center mt-4">
                    {isConfirmingDeletion ? (
                        <>
                            <p className="text-red-500 font-bold">Si confirma la eliminación no se podrán recuperar los datos.</p>
                            <div className="flex gap-4 mt-2">
                                <Button onClick={cancelDelete} className="bg-gray-400 font-semibold px-4 py-2 rounded hover:bg-gray-500">
                                    Cancelar
                                </Button>
                                <Button onClick={handleDeleteShelves} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                                    Aceptar
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button onClick={confirmDelete} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                            Confirmar Eliminación
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

export default ShelfList;
