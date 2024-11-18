import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function AuditList({ audits, isDeleteMode, selectedAudits, setSelectedAudits, handleDeleteAudits, notify }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);

    // Alternar la selección de una auditoría
    const toggleAuditSelection = (auditId) => {
        if (selectedAudits.includes(auditId)) {
            setSelectedAudits(selectedAudits.filter(id => id !== auditId));
        } else {
            setSelectedAudits([...selectedAudits, auditId]);
        }
    };

    // Seleccionar todas las auditorías
    const handleSelectAll = () => {
        if (selectedAudits.length === audits.length) {
            setSelectedAudits([]);
        } else {
            const allAuditIds = audits.map(audit => audit.id);
            setSelectedAudits(allAuditIds);
        }
    };

    // Confirmar la eliminación de auditorías seleccionadas
    const confirmDelete = () => {
        if (selectedAudits.length === 0) {
            notify('error', 'No hay auditorías seleccionadas para eliminar');
            return;
        }
        setIsConfirmingDeletion(true);
    };

    const cancelDelete = () => {
        setIsConfirmingDeletion(false);
    };

    return (
        <>
            {audits.length === 0 ? (
                <p className="text-center text-white">No hay registros de auditorías</p>
            ) : (
                <Table className="w-full text-white">
                    <TableHeader>
                        <TableRow>
                            {isDeleteMode && (
                                <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">
                                    <input
                                        type="checkbox"
                                        checked={selectedAudits.length === audits.length && audits.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </TableHead>
                            )}
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Fecha</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Usuario</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Tipo de Acción</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Comentario</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {audits.map(audit => (
                            <TableRow key={audit.id}>
                                {isDeleteMode && (
                                    <TableCell className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedAudits.includes(audit.id)}
                                            onChange={() => toggleAuditSelection(audit.id)}
                                        />
                                    </TableCell>
                                )}
                                <TableCell className="text-center font-light">
                                    {new Date(audit.fecha).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center font-light">{audit.nombre_usuario}</TableCell>
                                <TableCell className="text-center font-light">{audit.tipo_accion}</TableCell>
                                <TableCell className="text-center font-light">{audit.comentario}</TableCell>
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
                                <Button onClick={handleDeleteAudits} variant="sipemodal">
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

export default AuditList;
