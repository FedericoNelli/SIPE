import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import {  Trash2 } from 'lucide-react';
import AuditList from './AuditList';

function Audit({ notify }) {
    const [audits, setAudits] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Modo de eliminación
    const [selectedAudits, setSelectedAudits] = useState([]); // Auditorías seleccionadas para eliminar

    const loadAudits = () => {
        axios.get('http://localhost:8081/audits')
            .then(response => {
                setAudits(response.data);
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
    const currentAudits = audits.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedAudits([]); // Limpiar selección al salir del modo de eliminación
    };

    const handleDeleteAudits = () => {
        if (selectedAudits.length === 0) {
            notify('error', 'No hay auditorías seleccionadas para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-audits', { data: { auditIds: selectedAudits } })
            .then(() => {
                notify('success', 'Auditorías eliminadas correctamente');
                setAudits(audits.filter(audit => !selectedAudits.includes(audit.id)));
                setSelectedAudits([]);
                setIsDeleteMode(false);
            })
            .catch(error => {
                console.error('Error eliminando auditorías:', error);
                notify('error', 'Error al eliminar auditorías');
            });
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
                        <Button onClick={toggleDeleteMode} variant="sipemodalalt2">
                            <Trash2 /> {isDeleteMode ? 'CANCELAR ELIMINACIÓN' : 'ELIMINAR'}
                        </Button>
                    </div>
                </div>
                <AuditList
                    audits={currentAudits}
                    isDeleteMode={isDeleteMode}
                    selectedAudits={selectedAudits}
                    setSelectedAudits={setSelectedAudits}
                    handleDeleteAudits={handleDeleteAudits}
                    notify={notify}
                />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(audits.length / itemsPerPage)).keys()].map(page => (
                                <PaginationItem key={page + 1}>
                                    <PaginationLink href="#" onClick={() => paginate(page + 1)} isActive={currentPage === page + 1}>
                                        {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}

export default Audit;
