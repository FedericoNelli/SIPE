import React, { useState, useEffect, useCallback } from 'react';
import UserEditModal from "@/components/User/UserEditModal"; // Asegúrate de tener el UserEditModal.jsx
import { Button } from "@/components/Common/Button/Button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

function UserDetailModal({ isOpen, onClose, selectedUser, notify, onUserUpdated }) {
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditModalClosing, setIsEditModalClosing] = useState(false);

    const rol = localStorage.getItem('rol'); // Obtenemos el rol del usuario
    const imageUrl = selectedUser.imagen ? `http://localhost:8081${selectedUser.imagen}` : null;

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                if (!isEditModalOpen) {
                    onUserUpdated(); // Actualiza la lista de usuarios
                    onClose(); // Cierra el modal
                }
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, isEditModalOpen, onUserUpdated]);


    const openConfirmDeleteModal = useCallback(() => {
        setIsConfirmDeleteOpen(true);
    }, []);

    const closeConfirmDeleteModal = useCallback(() => {
        setIsConfirmDeleteOpen(false);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!selectedUser) {
            return;
        }
        try {
            const response = await axios.delete(`http://localhost:8081/users/delete/${selectedUser.id}`);
            onClose();
            notify('success', "Usuario eliminado con éxito!");
            onUserUpdated();
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            notify('error', "Error al eliminar el usuario");
        }
    }, [selectedUser, onClose]);

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
        onUserUpdated();
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
                        className="bg-sipe-blue-dark rounded-xl p-6 w-[550px] max-w-full shadow-xl relative flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                            <X size={20} strokeWidth={3} onClick={onClose} />
                        </div>
                        <div className="flex items-center justify-center gap-8">
                            <div className="flex justify-center items-center h-48 w-48 bg-sipe-blue-dark rounded-lg border border-sipe-white">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={`${selectedUser.nombre} ${selectedUser.apellido}`}
                                        className="h-full w-auto object-cover rounded-md"
                                        onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                                    />
                                ) : (
                                    <p className="text-sipe-white">No hay imagen disponible</p>
                                )}
                            </div>
                            <div className="text-sipe-white text-md">
                                <div className="space-y-4">
                                    <p><strong>Nombre: </strong> {selectedUser.nombre} {selectedUser.apellido}</p>
                                    <p><strong>Usuario:</strong> {selectedUser.nombre_usuario}</p>
                                    <p><strong>Legajo:</strong> {selectedUser.legajo}</p>
                                    <p><strong>Rol:</strong> {selectedUser.rol}</p>
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-10 mt-6">
                            <Button
                                variant="sipebuttonalt"
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
                                    <p className="font-bold text-2xl text-center text-sipe-white">¿Estás seguro que querés borrar este usuario?</p>
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
                            <UserEditModal
                                isOpen={!isEditModalClosing}
                                onClose={handleEditModalClosed}
                                user={selectedUser}
                                notify={notify}
                                onUserUpdated={onUserUpdated}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default UserDetailModal;
