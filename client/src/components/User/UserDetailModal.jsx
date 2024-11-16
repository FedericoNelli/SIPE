import React, { useState, useEffect, useCallback } from 'react';
import UserEditModal from "@/components/User/UserEditModal"; // Asegúrate de tener el UserEditModal.jsx
import { Button } from "@/components/Common/Button/Button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";

function UserDetailModal({ isOpen, onClose, selectedUser, notify }) {
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditModalClosing, setIsEditModalClosing] = useState(false);

    const rol = localStorage.getItem('rol'); // Obtenemos el rol del usuario
    const imageUrl = selectedUser.imagen ? `http://localhost:8081${selectedUser.imagen}` : null;

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && !isEditModalOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, isEditModalOpen]);

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
            window.location.reload();
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

    const closeEditModal = () => {
        setIsEditModalClosing(true);
    };

    const handleEditModalClosed = () => {
        setIsEditModalOpen(false);
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
                        className="bg-sipe-blue-dark rounded-xl p-6 w-[600px] max-w-full shadow-xl relative"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                            <X size={20} strokeWidth={3} onClick={onClose} />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-sipe-white mb-4">
                            {selectedUser.nombre} {selectedUser.apellido}
                        </h2>
                        <div className="flex justify-center items-center h-64 mb-4 bg-sipe-blue-dark rounded-lg border border-sipe-white">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={`${selectedUser.nombre} ${selectedUser.apellido}`}
                                    className="h-full w-auto object-contain rounded-md"
                                    onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                                />
                            ) : (
                                <p className="text-sipe-white">No hay imagen disponible</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sipe-white text-sm">
                            <div>
                                <p><strong>ID:</strong> {selectedUser.id}</p>
                                <p><strong>Legajo:</strong> {selectedUser.legajo}</p>
                                <p><strong>Rol:</strong> {selectedUser.rol}</p>
                            </div>
                            <div>
                                <p><strong>Nombre de usuario:</strong> {selectedUser.nombre_usuario}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-10 mt-6">
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
                    </motion.div>

                    <AnimatePresence>
                        {isConfirmDeleteOpen && (
                            <motion.div
                                className="fixed inset-0 flex items-center justify-center z-50"
                                onClick={closeConfirmDeleteModal}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.15 }}
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
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default UserDetailModal;
