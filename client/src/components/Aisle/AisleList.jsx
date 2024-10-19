import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function AisleList({ aisles, isDeleteMode, selectedAisles, setSelectedAisles, handleDeleteAisles, notify }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false); // Estado para CONFIRMAR ELIMINACIÓN

    // Función para alternar la selección de un pasillo
    const toggleAisleSelection = (aisleId) => {
        if (selectedAisles.includes(aisleId)) {
            setSelectedAisles(selectedAisles.filter(id => id !== aisleId));
        } else {
            setSelectedAisles([...selectedAisles, aisleId]);
        }
    };

    // Función para manejar la selección de todos los pasillos
    const handleSelectAll = () => {
        if (selectedAisles.length === aisles.length) {
            setSelectedAisles([]);
        } else {
            const allAisleIds = aisles.map(aisle => aisle.id);
            setSelectedAisles(allAisleIds);
        }
    };

    // Función para manejar la confirmación de eliminación
    const confirmDelete = () => {
        if (selectedAisles.length === 0) {
            notify('error', 'No hay pasillos seleccionados para eliminar');
            return;
        }
        setIsConfirmingDeletion(true);
    };

    // Función para CANCELAR la confirmación de eliminación
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
                                    checked={selectedAisles.length === aisles.length && aisles.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                        )}
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Número</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Ubicación</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Lado</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Total de estanterías</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {aisles.map(aisle => (
                        <TableRow key={aisle.id}>
                            {isDeleteMode && (
                                <TableCell className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedAisles.includes(aisle.id)}
                                        onChange={() => toggleAisleSelection(aisle.id)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="text-center font-light">{aisle.numero}</TableCell>
                            <TableCell className="text-center font-light">{aisle.nombreDeposito}</TableCell>
                            <TableCell className="text-center font-light">{aisle.ubicacionDeposito}</TableCell>
                            <TableCell className="text-center font-light">{aisle.ladosDescripcion}</TableCell>
                            <TableCell className="text-center font-light">{aisle.totalEstanterias}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {isDeleteMode && (
                <div className="flex flex-col items-center mt-4">
                    {isConfirmingDeletion ? (
                        <>
                            <p className="text-red-500 font-bold">Si confirma la eliminación no se podrán recuperar los datos</p>
                            <div className="flex gap-4 mt-2">
                                <Button onClick={cancelDelete} variant="sipemodalalt">
                                    CANCELAR
                                </Button>
                                <Button onClick={handleDeleteAisles} variant="sipemodal">
                                    ACEPTAR
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button onClick={confirmDelete} variant="sipemodalalt" size="sipebutton">
                            CONFIRMAR ELIMINACIÓN
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

export default AisleList;
