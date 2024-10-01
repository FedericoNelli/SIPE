import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import ShelfForm from '@/components/Shelf/ShelfForm';
import ShelfList from './ShelfList';

function Shelf({ notify }) {
    const [shelves, setShelves] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para el modo de eliminación
    const [selectedShelves, setSelectedShelves] = useState([]); // Estado para las estanterías seleccionadas

    useEffect(() => {
        axios.get('http://localhost:8081/shelves')
            .then(response => {
                setShelves(response.data);
            })
            .catch(error => {
                console.error('Error fetching shelves:', error);
            });
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentShelves = shelves.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    // Función para activar el modo de eliminación
    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedShelves([]); // Limpiar selección al salir del modo de eliminación
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
            })
            .catch(error => {
                console.error('Error eliminando estanterías:', error);
                notify('error', 'Error al eliminar estanterías');
            });
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
                        <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">NUEVA ESTANTERIA</Button>
                        <Button onClick={toggleDeleteMode} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                            {isDeleteMode ? 'Cancelar Eliminación' : 'Eliminar Estanterías'}
                        </Button>
                    </div>
                </div>
                <ShelfList
                    shelves={currentShelves}
                    isDeleteMode={isDeleteMode}
                    selectedShelves={selectedShelves}
                    setSelectedShelves={setSelectedShelves}
                    handleDeleteShelves={handleDeleteShelves}
                    notify={notify}
                />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(shelves.length / itemsPerPage)).keys()].map(page => (
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
                        <ShelfForm onClose={closeFormModal} notify={notify} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Shelf;
