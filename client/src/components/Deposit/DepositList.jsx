import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function DepositList({ deposits, isDeleteMode, selectedDeposits, setSelectedDeposits, handleDeleteDeposits, notify }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false); // Estado para la confirmación de eliminación

    // Función para alternar la selección de un depósito
    const toggleDepositSelection = (depositId) => {
        if (selectedDeposits.includes(depositId)) {
            setSelectedDeposits(selectedDeposits.filter(id => id !== depositId));
        } else {
            setSelectedDeposits([...selectedDeposits, depositId]);
        }
    };

    // Función para manejar la selección de todos los depósitos
    const handleSelectAll = () => {
        if (selectedDeposits.length === deposits.length) {
            setSelectedDeposits([]);
        } else {
            const allDepositIds = deposits.map(deposit => deposit.id);
            setSelectedDeposits(allDepositIds);
        }
    };

    // Función para manejar la confirmación de eliminación
    const confirmDelete = () => {
        if (selectedDeposits.length === 0) {
            notify('error', 'No hay depósitos seleccionados para eliminar');
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
        {deposits.length === 0 ? (
                <p className="text-center text-white">No hay depósitos generados</p>
            ) : (
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        {isDeleteMode && (
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">
                                <input
                                    type="checkbox"
                                    checked={selectedDeposits.length === deposits.length && deposits.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                        )}
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Nombre</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Ubicación</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de Pasillos</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de Estanterías</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de Materiales</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deposits.map(deposit => (
                        <TableRow key={deposit.id}>
                            {isDeleteMode && (
                                <TableCell className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedDeposits.includes(deposit.id)}
                                        onChange={() => toggleDepositSelection(deposit.id)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="text-center font-light">{deposit.nombreDeposito}</TableCell>
                            <TableCell className="text-center font-light">{deposit.nombreUbicacion}</TableCell>
                            <TableCell className="text-center font-light">{deposit.cantidadPasillos}</TableCell>
                            <TableCell className="text-center font-light">{deposit.cantidadEstanterias}</TableCell>
                            <TableCell className="text-center font-light">{deposit.totalMateriales}</TableCell>
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
                                <Button onClick={handleDeleteDeposits} variant="sipemodal">
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

export default DepositList;
