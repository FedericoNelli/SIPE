import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Filter, Plus, Trash2, PenLine } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import MovementForm from '@/components/Movement/MovementForm';
import MovementList from '@/components/Movement/MovementList';
import MovementEditModal from '@/components/Movement/MovementEditModal';
import MovementConfirmModal from '@/components/Movement/MovementConfirmModal';
import FilterModal from '../Common/Filter/FilterModal';

function Movement({ notify }) {
    const [movements, setMovements] = useState([]);
    const [filteredMovements, setFilteredMovements] = useState([]);
    const [materials, setMaterials] = useState([]);
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
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        material: '',
        startDate: '',
        endDate: '',
    });

    const loadMovements = () => {
        axios.get('http://localhost:8081/movements')
            .then(response => {
                setMovements(response.data);
                setFilteredMovements(response.data);
            })
            .catch(error => {
                notify('error', 'Error al cargar movimientos', error);
            });
    };

    const loadMaterialsWithMovements = () => {
        axios.get('http://localhost:8081/materials-with-movements')
            .then(response => {
                setMaterials(response.data.materiales);
            })
            .catch(error => {
                console.error('Error al obtener materiales con movimientos:', error);
            });
    };

    useEffect(() => {
        loadMovements();
        loadMaterialsWithMovements();
    }, []);

    useEffect(() => {
        localStorage.setItem('pendingMovements', JSON.stringify(pendingMovements));
    }, [pendingMovements]);

    const applyFilters = () => {
        let filtered = movements;

        if (filters.material) {
            // Descomponemos el valor de filters.material en nombreMaterial, depositoOrigen, y ubicacionNombre
            const [materialNombre, depositoNombre, ubicacionNombre] = filters.material.split(' - ');

            filtered = filtered.filter(movement =>
                movement.nombreMaterial === materialNombre.trim() &&
                movement.depositoDestino === depositoNombre.trim() &&
                movement.ubicacionNombre === ubicacionNombre.trim()
            );
        }

        // Filtrado por rango de fechas
        filtered = filtered.filter(movement => {
            const movementDate = new Date(movement.fechaMovimiento).toISOString().split('T')[0];
            const startDate = filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : null;
            const endDate = filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : null;

            const afterStartDate = startDate ? movementDate >= startDate : true;
            const beforeEndDate = endDate ? movementDate <= endDate : true;
            return afterStartDate && beforeEndDate;
        });

        setFilteredMovements(filtered);
        closeFilterModal();
    };

    const resetFilters = () => {
        setFilteredMovements(movements);
        setFilters({
            material: '',
            startDate: '',
            endDate: '',
        });
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMovements = filteredMovements.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const openFormModal = () => {
        setIsFormModalOpen(true);
        setIsDeleteMode(false);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
        setIsDeleteMode(false);
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
                loadMovements();
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
                        <Button onClick={openFormModal} variant="sipemodal"> <Plus /> AÑADIR </Button>
                        <Button onClick={openEditModal} variant="sipemodalalt"> <PenLine /> EDITAR</Button>
                        <Button onClick={openFilterModal} variant="sipebuttonalt3" className="bg-sipe-gray bg-opacity-50 text-sipe-white border border-sipe-white/20 font-semibold px-2 py-2 flex items-center gap-2 ">
                            <Filter /> FILTRAR
                        </Button>
                        <Button onClick={toggleDeleteMode} variant="sipemodalalt2">
                            <Trash2 /> {isDeleteMode ? 'CANCELAR ELIMINACIÓN' : 'ELIMINAR'}
                        </Button>
                    </div>
                </div>
                <MovementList
                    movements={currentMovements}
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
                    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <MovementForm
                            onClose={closeFormModal}
                            addPendingMovement={addPendingMovement}
                            onMovementUpdated={loadMovements}
                            notify={notify}
                        />
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <MovementEditModal
                            onClose={closeEditModal}
                            onMovementUpdated={handleMovementUpdated}
                            notify={notify}
                        />
                    </div>
                )}
                {isConfirmModalOpen && selectedMovement && (
                    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
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
                {isFilterModalOpen && (
                    <FilterModal
                        isOpen={isFilterModalOpen}
                        onClose={closeFilterModal}
                        onApply={applyFilters}
                        onReset={resetFilters}
                        filters={filters}
                        mode="Movement"
                        onFilterChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })}
                        availableMaterials={materials}
                    />
                )}
            </div>
        </div>
    );
}

export default Movement;
