import React, { useEffect, useCallback, useState } from "react";
import Map from "@/components/Common/Map/Map";
import MaterialEditModal from "@/components/Material/MaterialEditModal";
import axios from "axios";
import { Button } from "@/components/Common/Button/Button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function MaterialDetailModal({ isOpen, onClose, selectedMaterial, notify, loadMaterials }) {
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditModalClosing, setIsEditModalClosing] = useState(false);

    const rol = localStorage.getItem('rol');

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                if (!isEditModalOpen) {
                    onClose();
                }
                loadMaterials();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, isEditModalOpen, loadMaterials]);


    const openConfirmDeleteModal = useCallback(() => {
        setIsConfirmDeleteOpen(true);
    }, []);

    const closeConfirmDeleteModal = useCallback(() => {
        setIsConfirmDeleteOpen(false);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedMaterial) {
            return;
        }
        try {
            // Obtener el token del usuario almacenado en localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                notify('error', 'No se encontró un token de autenticación');
                return;
            }
            // Realizar la solicitud DELETE con el token en los headers
            const response = await axios.delete(
                `http://localhost:8081/materials/delete/${selectedMaterial.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            onClose();
            notify('success', 'Material eliminado con éxito!');
            loadMaterials();
        } catch (error) {
            console.error('Error al eliminar el material:', error);
            if (error.response && error.response.data && error.response.data.error) {
                notify('error', error.response.data.error)
            } else {
                notify('error', 'Error al eliminar el material');
            }
        }
    }, [selectedMaterial, onClose]);


    const confirmDelete = useCallback(() => {
        handleDelete();
        closeConfirmDeleteModal();
    }, [handleDelete, closeConfirmDeleteModal]);

    const openEditModal = () => {
        setIsEditModalOpen(true);
        setIsEditModalClosing(false);
    };

    const handleEditModalClosed = () => {
        setIsEditModalOpen(false);
        loadMaterials();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
                >
                    <motion.div
                        key="modal-content"
                        className="flex w-full max-w-5xl h-auto shadow-xl relative"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Parte izquierda */}
                        <div className="bg-sipe-blue-dark rounded-l-3xl shadow-lg p-10 flex-1 text-sipe-white flex flex-col justify-center items-center">
                            <div className="flex flex-col justify-center items-center gap-4">
                                <p className="text-4xl font-bold">{selectedMaterial.nombre}</p>
                                {selectedMaterial.imagen ? (
                                    <div className="w-[20vw] h-[40vh] overflow-hidden rounded-md mb-4">
                                        <img
                                            src={`http://localhost:8081${selectedMaterial.imagen}`}
                                            alt={selectedMaterial.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-[25vw] h-[40vh] border rounded-2xl flex justify-center items-center">
                                        <p>No hay imagen disponible</p>
                                    </div>
                                )}
                                <div className="flex flex-row gap-8">
                                    <div className="flex flex-col gap-2">
                                        <p><strong>ID:</strong> {selectedMaterial.id}</p>
                                        <p><strong>Depósito:</strong> {selectedMaterial.depositoNombre}</p>
                                        <p><strong>Estado:</strong> {selectedMaterial.estadoDescripcion}</p>
                                        <p><strong>Cantidad:</strong> {selectedMaterial.cantidad} {selectedMaterial.cantidad === 1 ? 'unidad' : 'unidades'}</p>
                                    </div>
                                    <div className="flex flex-col justify-start gap-1">
                                        <p><strong>Matrícula:</strong> {selectedMaterial.matricula}</p>
                                        <p><strong>Última interacción:</strong> {selectedMaterial.ultimoUsuarioNombre}</p>
                                        <p><strong>Último estado:</strong> {selectedMaterial.fechaUltimoEstado}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parte derecha */}
                        <div className="bg-sipe-orange-dark px-8 py-4 flex flex-col gap-8 rounded-r-3xl justify-center relative">
                            <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                                <X size={14} strokeWidth={4} onClick={onClose} />
                            </div>

                            <h1 className="text-center text-4xl font-bold text-sipe-white">Mapa</h1>

                            {selectedMaterial.idEspacio ? (
                                <div className="bg-sipe-blue-dark rounded-xl flex flex-col justify-center items-center w-auto p-4">
                                    <p className="text-sipe-white font-light py-2">Pasillo {selectedMaterial.pasilloNumero} | Estantería {selectedMaterial.estanteriaNumero}</p>
                                    <div className="flex justify-center items-center">
                                        <Map
                                            pasillo={selectedMaterial.pasilloNumero}
                                            estanteria={selectedMaterial.estanteriaNumero}
                                            estantes={selectedMaterial.cantidadEstante}
                                            divisiones={selectedMaterial.cantidadDivision}
                                            objetoEstante={selectedMaterial.estanteEstanteria}
                                            objetoDivision={selectedMaterial.divisionEstanteria}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-sipe-blue-dark rounded-xl flex flex-col justify-center items-center w-auto p-4">
                                    <p className="text-sipe-white font-light py-2">No existe ubicación del material en ninguna estantería.</p>
                                </div>
                            )}

                            <hr />
                            <div className="flex flex-col justify-center items-center gap-4 max-w-sm mx-auto">
                                <p className="text-sipe-white text-center">El mapa ayuda a tener una mejor noción de donde se encuentra el material. El círculo denota su posición dentro de la estantería.</p>
                            </div>
                            <div className="flex justify-center gap-10">
                                <Button
                                    variant="sipebutton"
                                    size="sipebutton"
                                    onClick={openEditModal}
                                    disabled={rol !== 'Administrador'}
                                    className={`px-4 ${rol !== 'Administrador' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    EDITAR
                                </Button>
                                <Button
                                    variant="sipebutton"
                                    size="sipebutton"
                                    onClick={openConfirmDeleteModal}
                                    disabled={rol !== 'Administrador'}
                                    className={`px-4 ${rol !== 'Administrador' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    ELIMINAR
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {isConfirmDeleteOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
                            >
                                <div className="bg-sipe-blue-light flex flex-col justify-center w-350 rounded-xl gap-6 p-4" onClick={(e) => e.stopPropagation()}>
                                    <p className="font-bold text-2xl text-center text-sipe-white">¿Estás seguro que querés borrar este material?</p>
                                    <div className="flex justify-around">
                                        <Button variant="sipemodalalt" size="sipebuttonmodal" className="px-4" onClick={closeConfirmDeleteModal}>CANCELAR</Button>
                                        <Button variant="sipemodal" size="sipebuttonmodal" className="px-4" onClick={confirmDelete}>ELIMINAR</Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isEditModalOpen && (
                            <MaterialEditModal
                                isOpen={!isEditModalClosing}
                                onClose={handleEditModalClosed}
                                loadMaterials={loadMaterials}
                                notify={notify}
                                material={selectedMaterial}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default MaterialDetailModal;
