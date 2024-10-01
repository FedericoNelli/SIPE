import { useEffect, useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';
import ReportModalDetail from './ReportModalDetail'; // Asegúrate de importar tu modal

function ReportList({ notify, isDeleteMode, setIsDeleteMode }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportType, setReportType] = useState(""); // Agrega estado para el tipo de gráfico
    const [selectedReports, setSelectedReports] = useState([]); // Estado para informes seleccionados
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);

    // Obtiene la lista de informes
    const fetchReports = () => {
        axios.get('http://localhost:8081/reports')
            .then(response => {
                setReports(response.data);
            })
            .catch(error => {
                console.error('Error fetching reports:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        window.fetchReports = fetchReports; // Hace que fetchReports esté disponible globalmente
        fetchReports(); // Carga la lista inicialmente
        return () => {
            delete window.fetchReports; // Limpia la función al desmontar
        };
    }, []);

    const handleDeleteReports = () => {
        if (selectedReports.length === 0) {
            notify('error', 'No hay informes seleccionados para eliminar');
            return;
        }
        setIsConfirmingDeletion(true); // Activa la confirmación de eliminación
    };

    const confirmDelete = () => {
        axios.delete('http://localhost:8081/delete-reports', { data: { reportIds: selectedReports } })
            .then(() => {
                notify('success', 'Informes eliminados correctamente');
                setSelectedReports([]); // Limpiar la selección
                setIsDeleteMode(false); // Salir del modo de eliminación
                setIsConfirmingDeletion(false); // Salir del modo de confirmación

                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            })
            .catch(error => {
                console.error('Error eliminando informes:', error);
                notify('error', 'Error al eliminar informes');
            });
    };

    const cancelDelete = () => {
        setIsConfirmingDeletion(false); // Cancela la confirmación
    };

    // Función para alternar la selección de un informe
    const toggleReportSelection = (reportId) => {
        if (selectedReports.includes(reportId)) {
            setSelectedReports(selectedReports.filter(id => id !== reportId));
        } else {
            setSelectedReports([...selectedReports, reportId]);
        }
    };

    const handleRowClick = async (report) => {
        if (isDeleteMode) return;
        try {
            const response = await axios.get(`http://localhost:8081/reports/${report.id}`);

            if (!response.data) {
                console.error('No se obtuvieron datos del informe');
                return;
            }

            const datos = Array.isArray(response.data.datos) ? response.data.datos : [];
            const formattedStartDate = response.data.fechaInicio ? new Date(response.data.fechaInicio).toLocaleDateString() : 'N/A';
            const formattedEndDate = response.data.fechaFin ? new Date(response.data.fechaFin).toLocaleDateString() : 'N/A';

            const selectedReportData = {
                ...response.data,
                datos: datos,
                fechaInicio: formattedStartDate,
                fechaFin: formattedEndDate,
                idMaterial: response.data.idMaterial || null,
                material: response.data.material || null,
                tipoGrafico: response.data.tipoGrafico || null,
                deposito: response.data.deposito ? response.data.deposito.nombre : 'Todos los depósitos',
                estado: response.data.datos.length > 0 && response.data.datos[0].estadoDescripcion ? response.data.datos[0].estadoDescripcion : 'Todos los estados',
            };

            setSelectedReport(selectedReportData);
            setReportType(report.tipo);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching report details:', error);
        }
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

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
        setReportType(""); // Resetea el tipo de gráfico al cerrar el modal
    };

    if (loading) {
        return <p className="text-center text-white">Cargando informes...</p>;
    }

    return (
        <>
            {reports.length === 0 ? (
                <p className="text-center text-white">No hay informes generados.</p>
            ) : (
                <>
                    <Table className="w-full text-white">
                        <TableHeader>
                            <TableRow>
                                {isDeleteMode && (
                                    <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">
                                        <input
                                            type="checkbox"
                                            checked={selectedReports.length === reports.length && reports.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </TableHead>
                                )}
                                <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Tipo</TableHead>
                                <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Tipo de Gráfico</TableHead>
                                <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Fecha de Generación</TableHead>
                                <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Usuario que generó</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map(report => (
                                <TableRow
                                    key={report.id}
                                    onClick={() => !isDeleteMode && handleRowClick(report)}
                                    className="cursor-pointer hover:bg-sipe-blue-light"
                                >
                                    {isDeleteMode && (
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedReports.includes(report.id)}
                                                onChange={() => toggleReportSelection(report.id)}
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

                    {isDeleteMode && (
                        <div className="flex justify-center mt-4 gap-4">
                            {!isConfirmingDeletion ? (
                                <Button onClick={handleDeleteReports} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">Eliminar Seleccionados</Button>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-white font-semibold">Si confirma la eliminación no se podrán recuperar los datos.</p>
                                    <div className="flex gap-4">
                                        <Button onClick={cancelDelete} className="bg-gray-600 font-semibold px-4 py-2 rounded hover:bg-gray-700">Cancelar</Button>
                                        <Button onClick={confirmDelete} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">Aceptar</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal para mostrar detalles del informe */}
            {selectedReport && (
                <ReportModalDetail
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    reportData={selectedReport.datos}
                    reportType={reportType}
                    tipoGrafico={selectedReport.tipoGrafico}
                    selectedMaterial={selectedReport.idMaterial ? selectedReport.material.nombre : 'Todos los materiales'}
                    dateRange={`${selectedReport.fechaInicio} - ${selectedReport.fechaFin}`}
                    selectedOption={reportType === "Informe de material por estado" ? selectedReport.estadoMaterial : reportType}
                    selectedDeposito={selectedReport.deposito}
                    selectedEstado={selectedReport.estado}
                />
            )}
        </>
    );
}

export default ReportList;
