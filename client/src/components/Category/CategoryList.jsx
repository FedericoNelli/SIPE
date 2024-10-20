import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function CategoryList({ categories, isDeleteMode, selectedCategories, setSelectedCategories, handleDeleteCategories, notify }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false); // Estado para la confirmación de eliminación

    // Función para alternar la selección de una categoría
    const toggleCategorySelection = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    // Función para manejar la selección de todas las categorías
    const handleSelectAll = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            const allCategoryIds = categories.map(category => category.id);
            setSelectedCategories(allCategoryIds);
        }
    };

    // Función para manejar la confirmación de eliminación
    const confirmDelete = () => {
        if (selectedCategories.length === 0) {
            notify('error', 'No hay categorías seleccionadas para eliminar');
            return;
        }
        setIsConfirmingDeletion(true);
    };

    // Función para CANCELAR la confirmación de eliminación
    const cancelDelete = () => {
        setIsConfirmingDeletion(false);
    };

    return (
        <>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        {isDeleteMode && (
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.length === categories.length && categories.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                        )}
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Nombre</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Cantidad de Materiales</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map(category => (
                        <TableRow key={category.id}>
                            {isDeleteMode && (
                                <TableCell className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => toggleCategorySelection(category.id)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="text-center font-light">{category.descripcion}</TableCell>
                            <TableCell className="text-center font-light">{category.material_count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {isDeleteMode && (
                <div className="flex flex-col items-center mt-4">
                    {isConfirmingDeletion ? (
                        <>
                            <p className="text-red-500 font-bold">Si confirma la eliminación no se podrán recuperar los datos</p>
                            <div className="flex gap-4 mt-2">
                                <Button onClick={cancelDelete} variant="sipemodalalt">
                                    CANCELAR
                                </Button>
                                <Button onClick={handleDeleteCategories} variant="sipemodal">
                                    ACEPTAR
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-row">
                        
                        <Button onClick={confirmDelete} variant="sipemodalalt" size="sipebutton">
                            CONFIRMAR ELIMINACIÓN
                        </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default CategoryList;
