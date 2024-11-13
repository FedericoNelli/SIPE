import { useEffect, useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import MovementForm from '@/components/Movement/MovementForm';
import MovementList from '@/components/Movement/MovementList';
import MovementEditModal from '@/components/Movement/MovementEditModal';
import MovementConfirmModal from '@/components/Movement/MovementConfirmModal';
import axios from 'axios';

function Movement({ notify }) {
    const [movements, setMovements] = useState([]);
    const [pendingMovements, setPendingMovements] = useState(() => {
        const savedPendingMovements = localStorage.getItem('pendingMovements');
        if (savedPendingMovements) {
            const parsedMovements = JSON.parse(savedPendingMovements);
            const now = new Date().getTime();
            return parsedMovements.filter(movement => movement.expiry > now);
        }
        return [];
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedMovements, setSelectedMovements] = useState([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedMovement, setSelectedMovement] = useState(null);

    const loadMovements = () => {
        axios.get('http://localhost:8081/movements')
            .then(response => {
                setMovements(response.data);
            })
            .catch(error => {
                notify('error', 'Error al cargar movimientos', error);
            });
    };

    useEffect(() => {
        loadMovements();
    }, []);

    useEffect(() => {
        localStorage.setItem('pendingMovements', JSON.stringify(pendingMovements));
    }, [pendingMovements]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMovements = movements.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(movements.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleMovementUpdated = () => {
        loadMovements();
        closeEditModal();
    };

    // Modificar la función para abrir el modal de confirmación en lugar de ejecutar el endpoint
    const handleConfirmMovement = (movement) => {
        setSelectedMovement(movement);
        setIsConfirmModalOpen(true);
    };

    // Función para remover un movimiento pendiente
    const removePendingMovement = (movementToRemove) => {
        setPendingMovements(pendingMovements.filter(movement => movement !== movementToRemove));
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedMovement(null);
    };

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedMovements([]);
    };

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

    const addPendingMovement = (newMovement) => {
        const updatedPendingMovements = [...pendingMovements, newMovement];
        setPendingMovements(updatedPendingMovements);
        localStorage.setItem('pendingMovements', JSON.stringify(updatedPendingMovements));
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
                        <Button onClick={openFormModal} variant="sipemodal">NUEVO MOVIMIENTO</Button>
                        <Button onClick={openEditModal} variant="sipemodalalt">EDITAR MOVIMIENTO</Button>
                        <Button onClick={toggleDeleteMode} variant="sipemodalalt2">
                            {isDeleteMode ? 'CANCELAR ELIMINACIÓN' : 'ELIMINAR MOVIMIENTOS'}
                        </Button>
                    </div>
                </div>
                <MovementList
                    movements={movements}
                    pendingMovements={pendingMovements}
                    isDeleteMode={isDeleteMode}
                    selectedMovements={selectedMovements}
                    setSelectedMovements={setSelectedMovements}
                    handleDeleteMovements={handleDeleteMovements}
                    onConfirmMovement={handleConfirmMovement}
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
                        <MovementForm
                            onClose={closeFormModal}
                            addPendingMovement={addPendingMovement}
                            notify={notify}
                        />
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <MovementEditModal
                            onClose={closeEditModal}
                            onMovementUpdated={handleMovementUpdated}
                            notify={notify}
                        />
                    </div>
                )}
                {isConfirmModalOpen && selectedMovement && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                    <MovementConfirmModal
                        movement={selectedMovement}
                        onClose={closeConfirmModal}
                        notify={notify}
                        onMovementConfirmed={() => {
                            closeConfirmModal();
                            setPendingMovements(pendingMovements.filter(m => m !== selectedMovement));
                            loadMovements();
                        }}
                        onRemovePendingMovement={removePendingMovement}
                    />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Movement;
