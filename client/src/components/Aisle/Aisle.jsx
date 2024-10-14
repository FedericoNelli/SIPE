import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import AisleForm from '@/components/Aisle/AisleForm';
import AisleList from './AisleList';
import AisleEditModal from '@/components/Aisle/AisleEditModal'; // Importar el modal de edición

function Aisle({ notify }) {
    const [aisles, setAisles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para el modo de eliminación
    const [selectedAisles, setSelectedAisles] = useState([]); // Estado para pasillos seleccionados
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Estado para abrir/cerrar el modal de edición

    useEffect(() => {
        axios.get('http://localhost:8081/aisles')
            .then(response => {
                setAisles(response.data);
            })
            .catch(error => {
                console.error('Error fetching aisles:', error);
            });
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentaisles = aisles.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedAisles([]); // Limpiar la selección al salir del modo de eliminación
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleDeleteAisles = () => {
        if (selectedAisles.length === 0) {
            notify('error', 'No hay pasillos seleccionados para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-aisles', { data: { aisleIds: selectedAisles } })
            .then(() => {
                notify('success', 'Pasillos eliminados correctamente');
                setAisles(aisles.filter(aisle => !selectedAisles.includes(aisle.id)));
                setSelectedAisles([]);
                setIsDeleteMode(false);
            })
            .catch(error => {
                console.error('Error eliminando pasillos:', error);
                notify('error', 'Error al eliminar pasillos');
            });
    };

    const handleAisleUpdate = () => {
        axios.get('http://localhost:8081/aisles')
            .then(response => {
                setAisles(response.data);
            })
            .catch(error => {
                console.error('Error fetching aisles:', error);
            });
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Pasillos</h1>
                        <h3 className="text-md font-thin">Listado completo de pasillos</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} variant="sipemodal">NUEVO PASILLO</Button>
                        <Button onClick={openEditModal} className="bg-blue-600 font-semibold px-4 py-2 rounded hover:bg-blue-700">
                            EDITAR PASILLOS
                        </Button>
                        <Button onClick={toggleDeleteMode} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                            {isDeleteMode ? 'CANCELAR ELIMINACIÓN' : 'ELIMINAR PASILLOS'}
                        </Button>
                    </div>
                </div>
                <AisleList
                    aisles={currentaisles}
                    isDeleteMode={isDeleteMode}
                    selectedAisles={selectedAisles}
                    setSelectedAisles={setSelectedAisles}
                    handleDeleteAisles={handleDeleteAisles}
                    notify={notify}
                />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(aisles.length / itemsPerPage)).keys()].map(page => (
                                <PaginationItem key={page + 1}>
                                    <PaginationLink href="#" onClick={() => paginate(page + 1)} isActive={currentPage === page + 1}>
                                        {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                </div>
                {isFormModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <AisleForm onClose={closeFormModal} notify={notify} />
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <AisleEditModal onClose={closeEditModal} onAisleUpdated={handleAisleUpdate} notify={notify} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Aisle;
