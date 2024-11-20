import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";
import axios from "axios";

function ReportList({ reports, setReports, isDeleteMode, notify, fetchReportDetails, onReportUpdated }) {
    const [selectedReports, setSelectedReports] = useState([]);
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false); 

    // Manejo de la selección de informes
    const handleRowClick = (report) => {
        if (!isDeleteMode) {
            fetchReportDetails(report.id);
        }
    };

    // Función para eliminar informes seleccionados
    const handleDeleteReports = () => {
        if (selectedReports.length === 0) {
            notify('error', 'No hay informes seleccionados para eliminar');
            return;
        }
        setIsConfirmingDeletion(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete('http://localhost:8081/delete-reports', {
                data: { reportIds: selectedReports }
            });
            notify('success', 'Informes eliminados correctamente');
            setReports(prevReports => prevReports.filter(report => !selectedReports.includes(report.id)));
            setSelectedReports([]); // Limpiar la selección
            setIsConfirmingDeletion(false);
            onReportUpdated();
        } catch (error) {
            console.error('Error eliminando informes:', error);
            notify('error', 'Error al eliminar informes');
        }
    };

    const cancelDelete = () => {
        setIsConfirmingDeletion(false); // Ocultar la confirmación
    };

    // Función para manejar la selección de todos los elementos
    const handleSelectAll = () => {
        if (selectedReports.length === reports.length) {
            setSelectedReports([]);
        } else {
            const allReportIds = reports.map(report => report.id);
            setSelectedReports(allReportIds);
        }
    };

    return (
        <>
            {reports.length === 0 ? (
                <p className="text-center text-white">No hay informes generados</p>
            ) : (
                <Table className="w-full text-sipe-white">
                    <TableHeader>
                        <TableRow>
                            {isDeleteMode && (
                                <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">
                                    <input
                                        type="checkbox"
                                        checked={selectedReports.length === reports.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableHead>
                            )}
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Tipo</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Tipo de Gráfico</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Fecha de Generación</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Usuario</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map(report => (
                            <TableRow
                                key={report.id}
                                onClick={() => handleRowClick(report)}
                                className="cursor-pointer hover:bg-sipe-blue-light"
                            >
                                {isDeleteMode && (
                                    <TableCell className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedReports.includes(report.id)}
                                            onChange={() => {
                                                if (selectedReports.includes(report.id)) {
                                                    setSelectedReports(selectedReports.filter(id => id !== report.id));
                                                } else {
                                                    setSelectedReports([...selectedReports, report.id]);
                                                }
                                            }}
                                        />
                                    </TableCell>
                                )}
                                <TableCell className="text-center font-light">{report.tipo}</TableCell>
                                <TableCell className="text-center font-light">{report.tipoGrafico}</TableCell>
                                <TableCell className="text-center font-light">{new Date(report.fechaGeneracion).toLocaleDateString()}</TableCell>
                                <TableCell className="text-center font-light">{report.Usuario}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Confirmación de eliminación */}
            {isDeleteMode && (
                <div className="flex justify-center mt-4 gap-4">
                    {!isConfirmingDeletion ? (
                        <Button onClick={handleDeleteReports} variant="sipemodal">
                            Eliminar Seleccionados
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-white font-semibold">Si confirma la eliminación, no se podrán recuperar los datos.</p>
                            <div className="flex gap-4">
                                <Button onClick={cancelDelete} className="bg-gray-600 font-semibold px-4 py-2 rounded hover:bg-gray-700">CANCELAR</Button>
                                <Button onClick={confirmDelete} variant="sipemodal">ACEPTAR</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default ReportList;
