import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import { Plus, Trash2, PenLine } from 'lucide-react';
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


    const handleAisleUpdate = () => {
        axios.get('http://localhost:8081/aisles')
            .then(response => {
                setAisles(response.data);
            })
            .catch(error => {
                console.error('Error fetching aisles:', error);
            });
    };

    useEffect(() => {
        handleAisleUpdate();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAisles = aisles.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(aisles.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const openFormModal = () => {
        setIsFormModalOpen(true);
        setIsDeleteMode(false);
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
        setIsDeleteMode(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        handleAisleUpdate();
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
                handleAisleUpdate();
            })
            .catch(error => {
                console.error('Error eliminando pasillos:', error);
                notify('error', 'Error al eliminar pasillos');
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
                        <Button onClick={openFormModal} variant="sipemodal"> <Plus /> AÑADIR</Button>
                        <Button onClick={openEditModal} variant="sipemodalalt">
                            <PenLine /> EDITAR
                        </Button>
                        <Button onClick={toggleDeleteMode} variant="sipemodalalt2">
                            <Trash2 /> {isDeleteMode ? 'CANCELAR ELIMINACIÓN' : 'ELIMINAR'}
                        </Button>
                    </div>
                </div>
                <AisleList
                    aisles={currentAisles}
                    isDeleteMode={isDeleteMode}
                    selectedAisles={selectedAisles}
                    setSelectedAisles={setSelectedAisles}
                    handleDeleteAisles={handleDeleteAisles}
                    notify={notify}
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
                {isFormModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <AisleForm 
                         onClose={closeFormModal} 
                         notify={notify} 
                         onAisleUpdated={handleAisleUpdate}/>
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <AisleEditModal 
                         onClose={closeEditModal} 
                         onAisleUpdated={handleAisleUpdate} 
                         notify={notify} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Aisle;
