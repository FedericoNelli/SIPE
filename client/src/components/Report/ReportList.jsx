import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";
import axios from "axios";

function ReportList({ isDeleteMode, notify, fetchReportDetails }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReports, setSelectedReports] = useState([]); // Para la eliminación múltiple
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false); // Estado de confirmación

    // Cargar los informes
    useEffect(() => {
        const loadReports = async () => {
            try {
                const response = await axios.get('http://localhost:8081/reports');
                setReports(response.data);
            } catch (error) {
                console.error('Error fetching reports:', error);
                notify('error', 'Error al cargar los informes');
            } finally {
                setLoading(false);
            }
        };
        loadReports();
    }, [notify]);

    // Manejo de la selección de informes
    const handleRowClick = (report) => {
        if (!isDeleteMode) {
            fetchReportDetails(report.id); // Llama a la función pasada desde el padre
        }
    };

    // Función para eliminar informes seleccionados
    const handleDeleteReports = () => {
        if (selectedReports.length === 0) {
            notify('error', 'No hay informes seleccionados para eliminar');
            return;
        }
        setIsConfirmingDeletion(true); // Mostrar la confirmación
    };

    const confirmDelete = async () => {
        try {
            await axios.delete('http://localhost:8081/delete-reports', {
                data: { reportIds: selectedReports }
            });
            notify('success', 'Informes eliminados correctamente');
            // Filtrar los informes eliminados
            setReports(reports.filter(report => !selectedReports.includes(report.id)));
            setSelectedReports([]); // Limpiar la selección
        } catch (error) {
            console.error('Error eliminando informes:', error);
            notify('error', 'Error al eliminar informes');
        } finally {
            setIsConfirmingDeletion(false);
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

    if (loading) {
        return <p className="text-center text-white">Cargando informes...</p>;
    }

    return (
        <>
            {reports.length === 0 ? (
                <p className="text-center text-white">No hay informes generados.</p>
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
                        <Button onClick={handleDeleteReports} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                            Eliminar Seleccionados
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-white font-semibold">Si confirma la eliminación, no se podrán recuperar los datos.</p>
                            <div className="flex gap-4">
                                <Button onClick={cancelDelete} className="bg-gray-600 font-semibold px-4 py-2 rounded hover:bg-gray-700">Cancelar</Button>
                                <Button onClick={confirmDelete} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">Aceptar</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default ReportList;
