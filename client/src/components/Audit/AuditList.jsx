import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";


function AuditList({ audits}) {

    return (
        <>
            {audits.length === 0 ? (
                <p className="text-center text-white">No hay registros de auditorías</p>
            ) : (
                <Table className="w-full text-white">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Fecha</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Usuario que realizó la acción</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Tipo de Acción</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Comentario</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {audits.map(audit => (
                            <TableRow key={audit.id}>
                                <TableCell className="text-center font-light">
                                    {new Date(audit.fecha).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center font-light">{audit.nombre_usuario}</TableCell>
                                <TableCell className="text-center font-light">{audit.tipo_accion}</TableCell>
                                <TableCell className="text-center font-bold">{audit.comentario}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}

export default AuditList;
