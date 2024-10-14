import { useEffect, useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import CategoryForm from '@/components/Category/CategoryForm';
import CategoryList from './CategoryList';
import axios from 'axios';
import CategoryEditModal from '@/components/Category/CategoryEditModal'; // Importar el modal de edición

function Category({ notify }) {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para el modo de eliminación
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Estado para abrir/cerrar el modal de edición
    const [selectedCategories, setSelectedCategories] = useState([]); // Estado para las categorías seleccionadas

    useEffect(() => {
        fetchCategories(); // Cargar categorías al montar el componente
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8081/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    // Función para activar el modo de eliminación
    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
    };

    // Función para abrir el modal de edición
    const openEditModal = () => {
        setIsEditModalOpen(true);  // Solo abrir el modal
    };

    // Función para cerrar el modal de edición
    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    // Función para manejar la eliminación de categorías
    const handleDeleteCategories = () => {
        if (selectedCategories.length === 0) {
            notify('error', 'No hay categorías seleccionadas para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-categories', { data: { categoryIds: selectedCategories } })
            .then(() => {
                notify('success', 'Categorías eliminadas correctamente');
                setCategories(categories.filter(category => !selectedCategories.includes(category.id)));
                setSelectedCategories([]);
                setIsDeleteMode(false);
            })
            .catch(error => {
                console.error('Error eliminando categorías:', error);
                notify('error', 'Error al eliminar categorías');
            });
    };

    // Función para manejar la actualización de categorías
    const handleCategoryUpdate = () => {
        fetchCategories(); // Volver a cargar las categorías después de una edición
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Categorías</h1>
                        <h3 className="text-md font-thin">Listado completo de categorías</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} variant="sipemodal">NUEVA CATEGORÍA</Button>
                        <Button onClick={openEditModal} className="bg-blue-600 font-semibold px-4 py-2 rounded hover:bg-blue-700">
                            EDITAR CATEGORÍAS
                        </Button>
                        <Button onClick={toggleDeleteMode} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                            {isDeleteMode ? 'CANCELAR ELIMINACIÓN' : 'ELIMINAR CATEGORÍAS'}
                        </Button>
                    </div>
                </div>
                <CategoryList
                    categories={currentCategories}
                    isDeleteMode={isDeleteMode}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    handleDeleteCategories={handleDeleteCategories}
                    notify={notify}
                />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(categories.length / itemsPerPage)).keys()].map(page => (
                                <PaginationItem key={page + 1}>
                                    <PaginationLink href="#" onClick={() => paginate(page + 1)} isActive={currentPage === page + 1}>
                                        {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                </div>
                {isFormModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <CategoryForm onClose={closeFormModal} notify={notify} />
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <CategoryEditModal onClose={closeEditModal} onCategoryUpdated={handleCategoryUpdate} notify={notify} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Category;
