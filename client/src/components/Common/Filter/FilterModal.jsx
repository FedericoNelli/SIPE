import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Common/Button/Button";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { X } from "lucide-react"; // Importamos el icono de cierre

const FilterModal = ({ isOpen, onClose, onApply, onReset, filters, onFilterChange, availableLocations, availableDeposits, availableCategories, availableStatuses }) => {
    const modalContentRef = useRef(null);
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const handleClickOutside = (event) => {
        if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
            handleClose();
        }
    };

    useEffect(() => {
        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }} 
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
                >
                    <motion.div
                        ref={modalContentRef}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg relative"
                    >
                        {/* Aquí utilizamos el componente Card */}
                        <Card className="bg-sipe-blue-dark text-sipe-white p-6 rounded-xl relative">
                            {/* Icono de cierre */}
                            <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                                <X size={14} strokeWidth={4} onClick={handleClose} /> {/* Icono de cierre */}
                            </div>
                            <CardHeader>
                                <CardTitle className="text-3xl text-center font-bold text-sipe-white mb-4">
                                    Filtrar materiales
                                </CardTitle>
                                <hr />
                            </CardHeader>
                            <CardContent>
                                <form>
                                    <div className="mb-4">
                                        <label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="ubicacion">
                                            Ubicación
                                        </label>
                                        <select
                                            name="ubicacion"
                                            value={filters.ubicacion}
                                            onChange={onFilterChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
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
                            </CardContent>
                            <CardFooter className="flex justify-end gap-4">
                                <Button variant="sipebuttonalt" size="sipebutton" onClick={onReset}>LIMPIAR</Button>
                                <Button variant="sipebutton" size="sipebutton" onClick={onApply}>APLICAR</Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FilterModal;
