import { useEffect, useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import { Plus, Trash2, PenLine } from 'lucide-react';
import DepositForm from '@/components/Deposit/DepositForm';
import DepositList from '@/components/Deposit/DepositList';
import DepositEditModal from './DepositEditModal';
import axios from 'axios';

function Deposit({ notify }) {
    const [deposits, setDeposits] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para el modo de eliminación
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDeposits, setSelectedDeposits] = useState([]); // Estado para los depósitos seleccionados

    // Nueva función para cargar depósitos
    const loadDeposits = () => {
        axios.get('http://localhost:8081/deposits')
            .then(response => {
                setDeposits(response.data);
            })
            .catch(error => {
                notify('error', 'Error al cargar depósitos', error);
            });
    };

    useEffect(() => {
        loadDeposits();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDeposits = deposits.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(deposits.length / itemsPerPage);

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

    // Función para activar el modo de eliminación
    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedDeposits([]); // Limpiar la selección al salir del modo de eliminación
    };

    // Función para manejar la eliminación de depósitos
    const handleDeleteDeposits = () => {
        if (selectedDeposits.length === 0) {
            notify('error', 'No hay depósitos seleccionados para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-deposits', { data: { depositIds: selectedDeposits } })
            .then(() => {
                notify('success', 'Depósitos eliminados correctamente');
                setDeposits(deposits.filter(deposit => !selectedDeposits.includes(deposit.id)));
                setSelectedDeposits([]);
                setIsDeleteMode(false);
            })

            .catch(error => {
                console.error('Error eliminando depósitos:', error);
                notify('error', 'Error al eliminar depósitos');
            });
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
        setIsDeleteMode(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleDepositUpdated = () => {
        loadDeposits(); // Recargar depósitos
        closeEditModal(); // Cerrar modal de edición después de actualizar
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Depósitos</h1>
                        <h3 className="text-md font-thin">Listado completo de depósitos</h3>
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
                <DepositList
                    deposits={currentDeposits}
                    isDeleteMode={isDeleteMode}
                    selectedDeposits={selectedDeposits}
                    setSelectedDeposits={setSelectedDeposits}
                    handleDeleteDeposits={handleDeleteDeposits}
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
                        <DepositForm onClose={closeFormModal} notify={notify} />
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <DepositEditModal
                            onClose={closeEditModal}
                            onDepositUpdated={handleDepositUpdated}
                            notify={notify}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Deposit;
