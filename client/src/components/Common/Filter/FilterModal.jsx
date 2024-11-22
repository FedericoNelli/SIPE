import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Common/Button/Button";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { X } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/Common/Select/Select";

const FilterModal = ({
    isOpen,
    onClose,
    onApply,
    onReset,
    filters,
    onFilterChange,
    mode,
    availableMaterials,
    availableLocations,
    availableDeposits,
    availableCategories,
    availableStatuses
}) => {
    const modalContentRef = useRef(null);
    const [isVisible, setIsVisible] = useState(isOpen);
    const today = new Date().toISOString().split('T')[0];

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
        const isClickInsideModal = modalContentRef.current && modalContentRef.current.contains(event.target);
        const isClickInsideSelect = event.target.closest(".select-content"); // Verifica si el clic está en el Select

        if (!isClickInsideModal && !isClickInsideSelect) {
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
                        <Card className="bg-sipe-blue-dark text-sipe-white p-6 rounded-xl relative">
                            <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                                <X size={14} strokeWidth={4} onClick={handleClose} />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-3xl text-center font-bold text-sipe-white mb-4">
                                    {mode === 'MaterialExit' ? 'Filtrar salidas de materiales' : mode === 'Movement' ? 'Filtrar movimientos de materiales' : 'Filtrar materiales'}
                                </CardTitle>
                                <hr />
                            </CardHeader>
                            <CardContent>
                                <form>
                                    {mode === 'Material' && (
                                        <>
                                            {/* Filtro por Ubicación */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Ubicación
                                                </label>
                                                <Select
                                                    value={filters.ubicacion || ""}
                                                    onValueChange={(value) => onFilterChange({ target: { name: "ubicacion", value } })}
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione una ubicación" />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        className="bg-sipe-blue-light select-content text-sipe-white"
                                                        onClick={(e) => e.stopPropagation()} // Evitar propagación
                                                    >
                                                        {availableLocations.map((location) => (
                                                            <SelectItem key={location.id} value={location.nombre}>
                                                                {location.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Filtro por Depósito */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Depósito
                                                </label>
                                                <Select
                                                    value={filters.deposito || ""}
                                                    onValueChange={(value) => onFilterChange({ target: { name: "deposito", value } })}
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione un depósito" />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        className="bg-sipe-blue-light select-content text-sipe-white"
                                                        onClick={(e) => e.stopPropagation()} // Evitar propagación
                                                    >
                                                        {availableDeposits.map((deposit) => (
                                                            <SelectItem key={deposit.id} value={deposit.nombre}>
                                                                {deposit.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Filtro por Categoría */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Categoría
                                                </label>
                                                <Select
                                                    value={filters.categoria || ""}
                                                    onValueChange={(value) => onFilterChange({ target: { name: "categoria", value } })}
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione una categoría" />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        className="bg-sipe-blue-light select-content text-sipe-white"
                                                        onClick={(e) => e.stopPropagation()} // Evitar propagación
                                                    >
                                                        {availableCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.descripcion}>
                                                                {category.descripcion}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Filtro por Estado */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Estado
                                                </label>
                                                <Select
                                                    value={filters.estado || ""}
                                                    onValueChange={(value) => onFilterChange({ target: { name: "estado", value } })}
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione un estado" />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        className="bg-sipe-blue-light select-content text-sipe-white"
                                                        onClick={(e) => e.stopPropagation()} // Evitar propagación
                                                    >
                                                        {availableStatuses.map((status) => (
                                                            <SelectItem key={status.id} value={status.descripcion}>
                                                                {status.descripcion}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}

                                    {(mode === 'MaterialExit' || mode === 'Movement') && (
                                        <>
                                            {/* Filtro por Material */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="material">
                                                    Material
                                                </label>
                                                <Select
                                                    value={filters.material || ""}
                                                    onValueChange={(value) => onFilterChange({ target: { name: "material", value } })}
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione un material" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-sipe-blue-light select-content text-sipe-white">
                                                        {availableMaterials.map(material => (
                                                            <SelectItem key={material.idMaterial} value={`${material.nombreMaterial} - ${material.depositoNombre} - ${material.ubicacionNombre}`}>
                                                                {material.nombreMaterial} - {material.depositoNombre} - {material.ubicacionNombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Filtro por Fecha de Inicio */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="startDate">
                                                    Fecha de Inicio
                                                </label>
                                                <Select
                                                    value={filters.startDate || ""}
                                                    onValueChange={(value) => onFilterChange({ target: { name: "startDate", value } })}
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione una fecha de inicio" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-sipe-blue-light select-content text-sipe-white">
                                                        {Array.from({ length: 31 }, (_, i) => {
                                                            const date = new Date(today);
                                                            date.setDate(i + 1);
                                                            return (
                                                                <SelectItem key={i} value={date.toISOString().split("T")[0]}>
                                                                    {date.toISOString().split("T")[0]}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Filtro por Fecha de Fin */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="endDate">
                                                    Fecha de Fin
                                                </label>
                                                <Select
                                                    value={filters.endDate || ""}
                                                    onValueChange={(value) => onFilterChange({ target: { name: "endDate", value } })}
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione una fecha de fin" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-sipe-blue-light select-content text-sipe-white">
                                                        {Array.from({ length: 31 }, (_, i) => {
                                                            const date = new Date(today);
                                                            date.setDate(i + 1);
                                                            return (
                                                                <SelectItem key={i} value={date.toISOString().split("T")[0]}>
                                                                    {date.toISOString().split("T")[0]}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}

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
