import { useEffect, useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import MovementForm from '@/components/Movement/MovementForm';
import MovementList from '@/components/Movement/MovementList';
import axios from 'axios';

function Movement({ notify }) {
    const [movements, setMovements] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para el modo de eliminación
    const [selectedMovements, setSelectedMovements] = useState([]); // Estado para los movimientos seleccionados

    useEffect(() => {
        axios.get('http://localhost:8081/movements')
            .then(response => {
                setMovements(response.data);
            })
            .catch(error => {
                console.error('Error fetching movements:', error);
            });
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMovements = movements.slice(indexOfFirstItem, indexOfLastItem);

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
        setSelectedMovements([]); // Limpiar la selección al salir del modo de eliminación
    };

    // Función para manejar la eliminación de movimientos
    const handleDeleteMovements = () => {
        if (selectedMovements.length === 0) {
            notify('error', 'No hay movimientos seleccionados para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-movements', { data: { movementIds: selectedMovements } })
            .then(() => {
                notify('success', 'Movimientos eliminados correctamente');
                setMovements(movements.filter(movement => !selectedMovements.includes(movement.id)));
                setSelectedMovements([]);
                setIsDeleteMode(false);
            })
            .catch(error => {
                console.error('Error eliminando movimientos:', error);
                notify('error', 'Error al eliminar movimientos');
            });
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Movimientos</h1>
                        <h3 className="text-md font-thin">Listado completo de movimientos</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">NUEVO MOVIMIENTO</Button>
                        <Button onClick={toggleDeleteMode} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                            {isDeleteMode ? 'Cancelar Eliminación' : 'Eliminar Movimientos'}
                        </Button>
                    </div>
                </div>
                <MovementList
                    movements={currentMovements}
                    isDeleteMode={isDeleteMode}
                    selectedMovements={selectedMovements}
                    setSelectedMovements={setSelectedMovements}
                    handleDeleteMovements={handleDeleteMovements}
                    notify={notify}
                />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(movements.length / itemsPerPage)).keys()].map(page => (
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
                        <MovementForm onClose={closeFormModal} notify={notify} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Movement;
