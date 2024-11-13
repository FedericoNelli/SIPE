import { useEffect, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import MaterialExitList from '@/components/Exit/MaterialExitList';
import MaterialExitForm from '@/components/Exit/MaterialExitForm';
import MaterialExitEditModal from './MaterialExitEditModal';

function MaterialExit({ notify }) {
    const [materialExits, setMaterialExits] = useState([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedExits, setSelectedExits] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Cargar salidas de materiales al montar el componente
    useEffect(() => {
        loadMaterialExits();
    }, []);

    const loadMaterialExits = () => {
        axios.get('http://localhost:8081/exits')
            .then(response => {
                setMaterialExits(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error('Error fetching material exits:', error);
                setMaterialExits([]); // Asegura que materialExits sea un array vacío en caso de error
                notify('error', 'Error al obtener las salidas de materiales');
            });
    };


    const refreshMaterialExits = () => {
        loadMaterialExits();
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
    }

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    }

    const handleExitUpdated = () => {
        loadMaterialExits();
        closeEditModal();
    }

    const handleDeleteExits = () => {
        if (selectedExits.length === 0) {
            notify('error', 'No hay salidas seleccionadas para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-exits', { data: { exitIds: selectedExits } })
            .then(() => {
                notify('success', 'Salidas eliminadas correctamente');
                setSelectedExits([]);
                setIsDeleteMode(false);
                refreshMaterialExits();
            })
            .catch(error => {
                console.error('Error eliminando salidas:', error);
                notify('error', 'Error al eliminar salidas');
            });
    };

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedExits([]);
    };

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    // Configuración de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExits = (Array.isArray(materialExits) ? materialExits : [])
        .filter(exit => exit.nombresMateriales && exit.nombresMateriales !== 'Sin Material')
        .slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(materialExits.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Salidas de Materiales</h1>
                        <h3 className="text-md font-thin">Listado completo de salidas</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} variant="sipemodal">
                            REGISTRAR NUEVA SALIDA
                        </Button>
                        <Button onClick={openEditModal} variant="sipemodalalt">EDITAR SALIDA</Button>
                        <Button onClick={toggleDeleteMode} variant="sipemodalalt2">
                            {isDeleteMode ? 'CANCELAR ELIMINACIÓN' : 'ELIMINAR SALIDAS'}
                        </Button>
                    </div>
                </div>

                <MaterialExitList
                    materialExits={materialExits}
                    isDeleteMode={isDeleteMode}
                    selectedExits={selectedExits}
                    setSelectedExits={setSelectedExits}
                    handleDeleteExits={handleDeleteExits}
                />

                {/* Paginación */}
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

                {/* Modal para registrar nueva salida */}
                <AnimatePresence>
                    {isFormModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <motion.div
                                className="w-[600px] max-w-full h-auto shadow-xl bg-sipe-blue-dark rounded-2xl p-6 relative"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MaterialExitForm
                                    onClose={closeFormModal}
                                    notify={notify}
                                    onExitCreated={refreshMaterialExits}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isEditModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <motion.div
                                className="w-[600px] max-w-full h-auto shadow-xl bg-sipe-blue-dark rounded-2xl p-6 relative"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MaterialExitEditModal
                                    onClose={closeEditModal}
                                    notify={notify}
                                    onExitUpdated={handleExitUpdated}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
}

export default MaterialExit;
