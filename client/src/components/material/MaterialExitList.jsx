import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function MaterialExitList({ isDeleteMode, selectedExits, setSelectedExits, handleDeleteExits, materialExits }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);

    const toggleExitSelection = (exitId) => {
        if (selectedExits.includes(exitId)) {
            setSelectedExits(selectedExits.filter(id => id !== exitId));
        } else {
            setSelectedExits([...selectedExits, exitId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedExits.length === materialExits.length) {
            setSelectedExits([]);
        } else {
            const allExitIds = materialExits.map(salida => salida.salidaId);
            setSelectedExits(allExitIds);
        }
    };

    const confirmDelete = () => {
        if (selectedExits.length === 0) {
            notify('error', 'No hay salidas seleccionadas para eliminar');
            return;
        }
        setIsConfirmingDeletion(true);
    };

    const cancelDelete = () => {
        setIsConfirmingDeletion(false);
    };

    return (
        <>
            {materialExits.length === 0 ? (
                <p className="text-center text-white">No hay salidas registradas.</p>
            ) : (
                <Table className="w-full text-sipe-white">
                    <TableHeader>
                        <TableRow>
                            {isDeleteMode && (
                                <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">
                                    <input
                                        type="checkbox"
                                        checked={selectedExits.length === materialExits.length && materialExits.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </TableHead>
                            )}
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">ID</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Fecha</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Material</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Ubicación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materialExits.map(salida => {
                            return (
                                <TableRow key={salida.salidaId}>
                                    {isDeleteMode && (
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedExits.includes(salida.salidaId)}
                                                onChange={() => toggleExitSelection(salida.salidaId)}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className="text-center font-light">{salida.salidaId}</TableCell>
                                    <TableCell className="text-center font-light">{salida.fechaSalida}</TableCell>
                                    <TableCell className="text-center font-light">
                                        <div className="flex flex-col items-center">
                                            {salida.nombresMateriales.split(', ').map((material, index, array) => (
                                                <span key={index}>
                                                    {material}{index < array.length - 1 && ','}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-light">
                                        <div className="flex flex-col items-center">
                                            {salida.cantidadesMateriales.split(' , ').map((cantidad, index, array) => (
                                                <span key={index}>
                                                    {cantidad}{index < array.length - 1 && ','}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-light">
                                        <div className="flex flex-col items-center">
                                            {salida.depositoNombre.split(', ').map((deposito, index, array) => (
                                                <span key={index}>
                                                    {deposito}{index < array.length - 1 && ','}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-light">
                                        <div className="flex flex-col items-center">
                                            {salida.ubicacionNombre.split(', ').map((ubicacion, index, array) => (
                                                <span key={index}>
                                                    {ubicacion}{index < array.length - 1 && ','}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
            {isDeleteMode && (
                <div className="flex flex-col items-center mt-4">
                    {isConfirmingDeletion ? (
                        <>
                            <p className="text-red-500 font-bold">Si confirma la eliminación no se podrán recuperar los datos.</p>
                            <div className="flex gap-4 mt-2">
                                <Button onClick={cancelDelete} className="bg-gray-400 font-semibold px-4 py-2 rounded hover:bg-gray-500">
                                    Cancelar
                                </Button>
                                <Button onClick={handleDeleteExits} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
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

export default MaterialExitList;
