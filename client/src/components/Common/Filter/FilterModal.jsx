import { useEffect, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalFooter, ModalBody } from "@/components/Common/Modals/Modal";
import { Button } from "@/components/Common/Button/Button";
import { motion } from "framer-motion";

const FilterModal = ({ isOpen, onClose, onApply, onReset, filters, onFilterChange, availableLocations, availableDeposits, availableCategories, availableStatuses }) => {
    const modalContentRef = useRef(null); 

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    
    const handleClickOutside = (event) => {
        if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
            onClose();
        }
    };

    
    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent ref={modalContentRef}>
                <ModalHeader>
                    <h2 className="text-xl font-semibold text-sipe-white mb-4">Filtrar materiales</h2>
                </ModalHeader>
                <ModalBody>
                    <form>
                        <div className="mb-4">
                            <label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="ubicacion">
                                Ubicación
                            </label>
                            <select
                                name="ubicacion"
                                value={filters.ubicacion}
                                onChange={onFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            >
                                <option value="">Seleccione una ubicación</option>
                                {availableLocations.map(location => (
                                    <option key={location.id} value={location.nombre}>
                                        {location.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="deposito">
                                Depósito
                            </label>
                            <select
                                name="deposito"
                                value={filters.deposito}
                                onChange={onFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            >
                                <option value="">Seleccione un depósito</option>
                                {availableDeposits.map(deposit => (
                                    <option key={deposit.id} value={deposit.nombre}>
                                        {deposit.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="categoria">
                                Categoría
                            </label>
                            <select
                                name="categoria"
                                value={filters.categoria}
                                onChange={onFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            >
                                <option value="">Seleccione una categoría</option>
                                {availableCategories.map(category => (
                                    <option key={category.id} value={category.descripcion}>
                                        {category.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="estado">
                                Estado
                            </label>
                            <select
                                name="estado"
                                value={filters.estado}
                                onChange={onFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            >
                                <option value="">Seleccione un estado</option>
                                {availableStatuses.map(status => (
                                    <option key={status.id} value={status.descripcion}>
                                        {status.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter className="gap-2">
                    <Button variant="sipemodalalt" size="sipebutton" onClick={onReset}>RESTABLECER</Button>
                    <Button variant="sipemodal" size="sipebutton" onClick={onApply}>APLICAR</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </motion.div>
    );
};

export default FilterModal;
