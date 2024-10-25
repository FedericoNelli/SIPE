import { useState, useEffect } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import ReportList from './ReportList';
import ReportForm from './ReportForm';
import ReportDetailModal from './ReportDetailModal';
import axios from 'axios';

function Report({ notify }) {
    const [reports, setReports] = useState([]); // Lista de informes
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null); // Reporte seleccionado
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Estado del modal de detalles
    const [loading, setLoading] = useState(true);

    // Cargar los informes al montar
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

    // Lógica para obtener los detalles de un informe
    const fetchReportDetails = async (reportId) => {
        try {
            const response = await axios.get(`http://localhost:8081/reports/${reportId}`);
            setSelectedReport(response.data);
            setIsDetailModalOpen(true); // Abrir el modal
        } catch (error) {
            console.error('Error fetching report details:', error);
            notify('error', 'Error al obtener detalles del informe');
        }
    };

    useEffect(() => {
        if (selectedReport) {
            console.log('selectedReport actualizado:', selectedReport);
        }
    }, [selectedReport]);


    // Cerrar el modal de detalles
    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedReport(null); // Limpiar el estado del reporte seleccionado
    };

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    // Lógica para manejar la paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Informes</h1>
                        <h3 className="text-md font-thin">Listado completo de informes</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} variant="sipemodal">GENERAR INFORME</Button>
                        <Button onClick={() => setIsDeleteMode(!isDeleteMode)} variant="sipemodalalt">{isDeleteMode ? "CANCELAR ELIMINACIÓN" : "ELIMINAR INFORMES"}</Button>
                    </div>
                </div>

                {/* Componente de listado */}
                <ReportList
                    isDeleteMode={isDeleteMode}
                    notify={notify}
                    fetchReportDetails={fetchReportDetails}
                    reports={currentReports} // Pasamos solo los informes de la página actual
                />

                {/* Paginación */}
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(reports.length / itemsPerPage)).keys()].map(page => (
                                <PaginationItem key={page + 1}>
                                    <PaginationLink href="#" onClick={() => paginate(page + 1)} isActive={currentPage === page + 1}>
                                        {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                </div>

                {/* Modal de formulario de generación de informes */}
                {isFormModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <ReportForm onClose={closeFormModal} notify={notify} />
                    </div>
                )}

                {/* Modal de detalles de informes */}
                {isDetailModalOpen && selectedReport && (
                    <ReportDetailModal
                        isOpen={isDetailModalOpen}
                        onClose={closeDetailModal}
                        reportData={selectedReport.datos}
                        reportType={selectedReport.tipo}
                        tipoGrafico={selectedReport.tipoGrafico}
                        selectedMaterial={selectedReport.nombreMaterial || 'Todos los materiales'}
                        dateRange={`${selectedReport.fechaInicio || 'N/A'} - ${selectedReport.fechaFin || 'N/A'}`}
                        selectedOption={selectedReport.deposito?.nombre}
                        selectedOption1={selectedReport.estadoDescripcion || 'Todos'}
                    />
                )}
            </div>
        </div>
    );
}

export default Report;
