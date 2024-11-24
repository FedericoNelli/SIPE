import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Common/Button/Button";
import { Filter } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import AuditList from './AuditList';
import FilterModal from '@/components/Common/Filter/FilterModal';

function Audit({ notify }) {
    const [audits, setAudits] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filteredAudits, setFilteredAudits] = useState([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        nombre_usuario: '',
        tipo_accion: '',
        startDate: '',
        endDate: '',
    });

    const loadAudits = () => {
        axios.get('http://localhost:8081/audits')
            .then(response => {
                setAudits(response.data);
                setFilteredAudits(response.data);
            })
            .catch(error => {
                console.error('Error fetching audit records:', error);
            });
    };

    useEffect(() => {
        loadAudits();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAudits = filteredAudits.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const applyFilters = () => {
        let filteredData = [...audits];

        // Filtrar por nombre_usuario
        if (filters.nombre_usuario) {
            filteredData = filteredData.filter(audit =>
                audit.nombre_usuario.toLowerCase() === filters.nombre_usuario.toLowerCase()
            );
        }

        // Filtrar por tipo_accion
        if (filters.tipo_accion) {
            filteredData = filteredData.filter(audit =>
                audit.tipo_accion.toLowerCase() === filters.tipo_accion.toLowerCase()
            );
        }

        if (filters.startDate && filters.startDate) {
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);

            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(23, 59, 59, 999);

            // Filtrar por rango de fechas
            filteredData = filteredData.filter(audit => {
                const fechaAudit = new Date(audit.fecha); // Asumiendo que la fecha en la base de datos está en formato UTC
                return fechaAudit >= startDate && fechaAudit <= endDate;
            });
        }

        setFilteredAudits(filteredData);
        setCurrentPage(1);
        closeFilterModal();
    };


    const resetFilters = () => {
        setFilters({
            nombre_usuario: '',
            tipo_accion: '',
            startDate: '',
            endDate: '',
        });

        setFilteredAudits(audits);
        setCurrentPage(1);
        closeFilterModal();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };


    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Auditorías</h1>
                        <h3 className="text-md font-thin">Listado completo de auditorías</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button
                            onClick={openFilterModal}
                            variant="sipebuttonalt3"
                            className="bg-sipe-gray bg-opacity-80 text-sipe-white border border-sipe-gray/20 font-semibold px-2 py-2 flex items-center gap-2 ">
                            <Filter /> FILTRAR
                        </Button>
                    </div>
                </div>
                <AuditList
                    audits={currentAudits}
                />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(totalPages).keys()].map(page => (
                                <PaginationItem key={page + 1}>
                                    <PaginationLink href="#" onClick={() => paginate(page + 1)} isActive={currentPage === page + 1}>
                                        {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                </div>
                {isFilterModalOpen && (
                    <FilterModal
                        isOpen={isFilterModalOpen}
                        onClose={closeFilterModal}
                        onApply={applyFilters}
                        onReset={resetFilters}
                        filters={filters}
                        mode="Audit"
                        onFilterChange={handleFilterChange}
                        availableAudits={audits}
                    />
                )}
            </div>
        </div>
    );
}

export default Audit;
