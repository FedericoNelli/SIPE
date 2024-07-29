import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalFooter, ModalBody } from "@/components/Modal/Modal";
import { Button } from "@/components/Button/Button";

const FilterModal = ({ isOpen, onClose, onApply, onReset, filters, onFilterChange, availableLocations, availableDeposits, availableCategories, availableStatuses }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>
                    <h2 className="text-xl font-semibold text-sipe-white">Filtrar Materiales</h2>
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
                <ModalFooter>
                    <Button onClick={onApply} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">Aplicar</Button>
                    <Button onClick={onReset} className="ml-2 bg-sipe-gray-light font-semibold px-4 py-2 rounded hover:bg-sipe-gray-dark">Restablecer</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default FilterModal;
