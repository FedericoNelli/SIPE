import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Common/Button/Button";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { X } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/Common/Select/Select";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";


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
    availableStatuses,
    availableAudits
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
                                    {mode === 'Audit' ? 'Filtrar Auditorías' : mode === 'MaterialExit' ? 'Filtrar salidas de materiales' : mode === 'Movement' ? 'Filtrar movimientos de materiales' : 'Filtrar materiales'}
                                </CardTitle>
                                <hr />
                            </CardHeader>
                            <CardContent>
                                <form>
                                    {mode === 'Material' && (
                                        <>
                                            {/* Filtro por Ubicación */}
                                            <div className="mb-4">
                                                <Label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Ubicación
                                                </Label>
                                                <Select
                                                    value={filters.ubicacion || ""}
                                                    onValueChange={(value) => onFilterChange({ target: { name: "ubicacion", value } })}
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione una ubicación" />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        className="bg-sipe-blue-light select-content text-sipe-white"
                                                        onClick={(e) => e.stopPropagation()}
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
                                                <Label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Depósito
                                                </Label>
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
                                                <Label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Categoría
                                                </Label>
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
                                                <Label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Estado
                                                </Label>
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

                                    {/* Filtros específicos para cada modo */}
                                    {(mode === 'MaterialExit' || mode === 'Movement') && (
                                        <>
                                            {/* Filtro por Material */}
                                            <div className="mb-4">
                                                <Label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="material">
                                                    Material
                                                </Label>
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
                                        </>
                                    )}

                                    {mode === 'Audit' && (
                                        <>
                                            {/* Filtro por Usuario */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Usuario
                                                </label>
                                                <Select
                                                    value={filters.nombre_usuario || ""}
                                                    onValueChange={(value) =>
                                                        onFilterChange({ target: { name: "nombre_usuario", value } })
                                                    }
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione un usuario" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-sipe-blue-light select-content text-sipe-white">
                                                        {[...new Set(availableAudits.map(audit => audit.nombre_usuario))].map(usuario => (
                                                            <SelectItem key={usuario} value={usuario}>
                                                                {usuario}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {/* Filtro por Tipo de Acción */}
                                            <div className="mb-4">
                                                <label className="block text-sipe-white text-sm font-bold mb-2">
                                                    Tipo de acción
                                                </label>
                                                <Select
                                                    value={filters.tipo_accion || ""}
                                                    onValueChange={(value) =>
                                                        onFilterChange({ target: { name: "tipo_accion", value } })
                                                    }
                                                >
                                                    <SelectTrigger className="w-full bg-sipe-blue-dark text-sipe-white">
                                                        <SelectValue placeholder="Seleccione un tipo" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-sipe-blue-light select-content text-sipe-white">
                                                        {[...new Set(availableAudits.map(audit => audit.tipo_accion))]
                                                            .sort((a, b) => a.localeCompare(b)) // Ordenar alfabéticamente
                                                            .map(tipo => (
                                                                <SelectItem key={tipo} value={tipo}>
                                                                    {tipo}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                    {/* Inputs comunes a los tres modos */}
                                    {(mode === 'MaterialExit' || mode === 'Movement' || mode === 'Audit') && (
                                        <>
                                            {/* Filtro por Fecha de Inicio */}
                                            <div className="mb-4">
                                                <Label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="startDate">
                                                    Fecha de Inicio
                                                </Label>
                                                <Input
                                                    type="date"
                                                    name="startDate"
                                                    value={filters.startDate}
                                                    onChange={onFilterChange}
                                                    max={today}
                                                    className="w-full bg-sipe-blue-dark text-sipe-white"
                                                />
                                            </div>
                                            {/* Filtro por Fecha de Fin */}
                                            <div className="mb-4">
                                                <Label className="block text-sipe-white text-sm font-bold mb-2" htmlFor="endDate">
                                                    Fecha de Fin
                                                </Label>
                                                <Input
                                                    type="date"
                                                    name="endDate"
                                                    value={filters.endDate}
                                                    onChange={onFilterChange}
                                                    max={today}
                                                    className="w-full bg-sipe-blue-dark text-sipe-white"
                                                />
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
