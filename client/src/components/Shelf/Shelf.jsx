import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import { Plus, Trash2, PenLine, Eraser } from 'lucide-react';
import ShelfForm from '@/components/Shelf/ShelfForm';
import ShelfList from './ShelfList';
import ShelfEditModal from './ShelfEditModal';

function Shelf({ notify }) {
    const [shelves, setShelves] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para el modo de eliminación
    const [selectedShelves, setSelectedShelves] = useState([]); // Estado para las estanterías seleccionadas
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEmptyMode, setIsEmptyMode] = useState(false);

    // Nueva función para cargar estanterías
    const loadShelves = () => {
        axios.get('http://localhost:8081/shelves')
            .then(response => {
                setShelves(response.data);
            })
            .catch(error => {
                notify('error', 'Error al cargar estanterías');
            });
    };

    // Llamar a la función loadShelves al montar el componente
    useEffect(() => {
        loadShelves();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentShelves = shelves.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(shelves.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const openFormModal = () => {
        setIsFormModalOpen(true);
        setIsEmptyMode(false);
        setIsDeleteMode(false);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    // Función para activar el modo de eliminación
    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedShelves([]);
        setIsEmptyMode(false);
    };

    const toggleEmptyMode = () => { // Activar el modo vaciar estanterías
        setIsEmptyMode(!isEmptyMode);
        setSelectedShelves([]);
        setIsDeleteMode(false);
    };

    // Función para manejar la eliminación de estanterías
    const handleDeleteShelves = () => {
        if (selectedShelves.length === 0) {
            notify('error', 'No hay estanterías seleccionadas para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-shelves', { data: { shelfIds: selectedShelves } })
            .then(() => {
                notify('success', 'Estanterías eliminadas correctamente');
                setShelves(shelves.filter(shelf => !selectedShelves.includes(shelf.id)));
                setSelectedShelves([]);
                setIsDeleteMode(false);
                loadShelves();
            })
            .catch(error => {
                console.error('Error eliminando estanterías:', error);
                notify('error', 'Error: Debe vaciar la estantería antes de eliminarla');
            });
    };

    const handleEmptyShelves = () => { // Nueva función para vaciar las estanterías
        if (selectedShelves.length === 0) {
            notify('error', 'No hay estanterías seleccionadas para vaciar');
            return;
        }

        axios.post('http://localhost:8081/empty-shelves', { shelfIds: selectedShelves })
            .then(() => {
                notify('success', 'Estanterías vaciadas correctamente');
                setSelectedShelves([]);
                setIsEmptyMode(false);
                loadShelves();
            })
            .catch(error => {
                notify('error', 'Error al vaciar estanterías');
            });
    };

    const onShelfUpdated = () => {
        loadShelves(); // Recargar las estanterías
        setIsEditModalOpen(false); // Cerrar el modal después de actualizar
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
        setIsDeleteMode(false);
        setIsEmptyMode(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Estanterías</h1>
                        <h3 className="text-md font-thin">Listado completo de estanterías</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} variant="sipemodal"> <Plus /> AÑADIR</Button>
                        <Button onClick={openEditModal} variant="sipemodalalt"> <PenLine /> EDITAR</Button>
                        <Button onClick={toggleEmptyMode} variant="sipemodalalt3">
                            <Eraser /> {isEmptyMode ? 'CANCELAR VACIAR' : 'VACIAR'}
                        </Button>
                        <Button onClick={toggleDeleteMode} variant="sipemodalalt2">
                            <Trash2 /> {isDeleteMode ? 'CANCELAR ELIMINACIÓN' : 'ELIMINAR'}
                        </Button>
                    </div>
                </div>
                <ShelfList
                    shelves={currentShelves}
                    isDeleteMode={isDeleteMode}
                    isEmptyMode={isEmptyMode}
                    selectedShelves={selectedShelves}
                    setSelectedShelves={setSelectedShelves}
                    handleDeleteShelves={handleDeleteShelves}
                    handleEmptyShelves={handleEmptyShelves}
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
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <ShelfForm 
                        onClose={closeFormModal} 
                        notify={notify}
                        onShelfUpdated={loadShelves} />
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <ShelfEditModal onClose={closeEditModal} onShelfUpdated={onShelfUpdated} notify={notify} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Shelf;
