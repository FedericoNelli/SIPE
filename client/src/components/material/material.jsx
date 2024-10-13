import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import { Search, Filter } from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import MaterialForm from '@/components/Material/MaterialForm';
import MaterialList from '@/components/Material/MaterialList';
import MaterialDetailModal from '@/components/Material/MaterialDetailModal';
import FilterModal from '@/components/Common/Filter/FilterModal';
import MaterialExitList from '@/components/Material/MaterialExitList';
import MaterialExitForm from '@/components/Material/MaterialExitForm';

function Material({ notify }) {
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [materialDetail, setMaterialDetail] = useState(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para el modo de eliminación
    const [selectedExits, setSelectedExits] = useState([]); // Estado para las salidas seleccionadas
    const [materialExits, setMaterialExits] = useState([]);
    const [filters, setFilters] = useState({
        estado: '',
        categoria: '',
        ubicacion: '',
        deposito: '',
    });

    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableDeposits, setAvailableDeposits] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableStatuses, setAvailableStatuses] = useState([]);

    const userRole = localStorage.getItem('rol');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Estado para controlar si se está visualizando la lista de salidas de materiales
    const [viewingMaterialExits, setViewingMaterialExits] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8081/materials')
            .then(response => {
                setMaterials(response.data);
                setFilteredMaterials(response.data);
            })
            .catch(error => {
                console.error('Error fetching materials:', error);
            });

        axios.get('http://localhost:8081/deposit-locations')
            .then(response => setAvailableLocations(response.data))
            .catch(error => console.error('Error fetching locations:', error));

        axios.get('http://localhost:8081/depo-names')
            .then(response => setAvailableDeposits(response.data))
            .catch(error => console.error('Error fetching deposits:', error));

        axios.get('http://localhost:8081/categories')
            .then(response => setAvailableCategories(response.data))
            .catch(error => console.error('Error fetching categories:', error));

        axios.get('http://localhost:8081/statuses')
            .then(response => setAvailableStatuses(response.data))
            .catch(error => console.error('Error fetching statuses:', error));

        // Cargar salidas de materiales
        loadMaterialExits();
    }, []);

    // Función para cargar las salidas de materiales
    const loadMaterialExits = () => {
        axios.get('http://localhost:8081/exits')
            .then(response => {
                setMaterialExits(response.data);
            })
            .catch(error => {
                console.error('Error fetching material exits:', error);
            });
    };

    // Función para refrescar la lista de salidas
    const refreshMaterialExits = () => {
        loadMaterialExits();
    };

    // Manejar la búsqueda
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query) {
            axios.get(`http://localhost:8081/materials/search?query=${encodeURIComponent(query)}`)
                .then(response => {
                    if (response.data.message === 'Material no encontrado') {
                        setSearchResults([]);
                    } else {
                        setSearchResults(response.data);
                    }
                })
                .catch(error => {
                    console.error('Error searching materials:', error);
                });
        } else {
            setSearchResults([]);
        }
    };

    const openModalSearch = () => {
        setIsModalOpen(true);
    };

    const closeModalSearch = () => {
        setIsModalOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    // Abrir el modal de detalles al hacer clic en un material
    const openMaterialDetailModal = (materialId) => {
        axios.get(`http://localhost:8081/materials/details/${materialId}`)
            .then(response => {
                setMaterialDetail(response.data);
                setIsDetailModalOpen(true);
                closeModalSearch();
            })
            .catch(error => console.error('Error fetching material details:', error));
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setMaterialDetail(null);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = materials;

        if (filters.estado) {
            filtered = filtered.filter(material => material.estadoDescripcion === filters.estado);
        }
        if (filters.categoria) {
            filtered = filtered.filter(material => material.categoriaNombre === filters.categoria);
        }
        if (filters.ubicacion) {
            filtered = filtered.filter(material => material.ubicacionNombre === filters.ubicacion);
        }
        if (filters.deposito) {
            filtered = filtered.filter(material => material.depositoNombre === filters.deposito);
        }

        setFilteredMaterials(filtered);
        closeFilterModal();
    };

    const resetFilters = () => {
        setFilteredMaterials(materials);
        setFilters({
            estado: '',
            categoria: '',
            ubicacion: '',
            deposito: '',
        });
        setIsFilterModalOpen(false);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMaterials = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Manejar la visualización de salidas de materiales
    const viewMaterialExits = () => {
        setViewingMaterialExits(true);
    };

    const backToMaterialList = () => {
        setViewingMaterialExits(false);
    };

    const handleDeleteExits = () => {
        if (selectedExits.length === 0) {
            notify('error', 'No hay salidas seleccionadas para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-exits', { data: { exitIds: selectedExits } })
            .then(() => {
                notify('success', 'Salidas eliminadas correctamente');
                // Elimina las salidas eliminadas del estado actual
                setSelectedExits([]);
                setIsDeleteMode(false);
            })

            .catch(error => {
                console.error('Error eliminando salidas:', error);
                notify('error', 'Error al eliminar salidas');
            });
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedExits([]); // Limpiar la selección al salir del modo de eliminación
    };


    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Materiales</h1>
                        <h3 className="text-md font-thin">{viewingMaterialExits ? "Salidas de Materiales" : "Listado completo de materiales"}</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        {userRole === 'Administrador' && (
                            <Button onClick={viewingMaterialExits ? openFormModal : openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">
                                {viewingMaterialExits ? "REGISTRAR NUEVA SALIDA" : "NUEVO MATERIAL"}
                            </Button>
                        )}
                        {viewingMaterialExits ? (
                            <>
                                <Button onClick={toggleDeleteMode} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                                    {isDeleteMode ? 'Cancelar Eliminación' : 'Eliminar Salidas'}
                                </Button>
                                <Button onClick={backToMaterialList} variant="secondary" className="bg-transparent text-sipe-white font-semibold px-2 py-2 flex items-center gap-2">SALIR</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={viewMaterialExits} variant="secondary" className="bg-transparent text-sipe-white font-semibold px-2 py-2 flex items-center gap-2">VER SALIDAS DE MATERIALES</Button>
                                <Button onClick={openFilterModal} variant="secondary" className="bg-transparent text-sipe-white font-semibold px-2 py-2 flex items-center gap-2 ">
                                    <Filter /> FILTRAR
                                </Button>
                                <Button onClick={openModalSearch} variant="secondary" className="bg-transparent border-sipe-white border text-sipe-white font-semibold px-2 py-2 flex items-center gap-2">
                                    <Search /> BUSCAR
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                {viewingMaterialExits ? (
                    <MaterialExitList
                        materialExits={materialExits}
                        isDeleteMode={isDeleteMode}
                        selectedExits={selectedExits}
                        setSelectedExits={setSelectedExits}
                        handleDeleteExits={handleDeleteExits} />
                ) : (
                    <MaterialList materials={currentMaterials} />
                )}
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(filteredMaterials.length / itemsPerPage)).keys()].map(page => (
                                <PaginationItem key={page + 1}>
                                    <PaginationLink href="#" onClick={() => paginate(page + 1)} isActive={currentPage === page + 1}>
                                        {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                </div>

                {/* Modal de búsqueda */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-sipe-blue-dark rounded-lg p-6 w-full max-w-4xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-sipe-white">Buscar material</h2>
                                <button onClick={closeModalSearch} className="text-gray-300">Cerrar</button>
                            </div>
                            <Input
                                type="text"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full p-2 mt-4 border-b"
                            />
                            {searchQuery && searchResults.length > 0 && (
                                <div className="mt-4">
                                    {searchResults.map(result => (
                                        <li key={result.id} className="p-2 border-b border-gray-500 text-sipe-white cursor-pointer" onClick={() => openMaterialDetailModal(result.id)}>
                                            {result.nombre}
                                        </li>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isFilterModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <FilterModal
                            isOpen={isFilterModalOpen}
                            onClose={closeFilterModal}
                            onApply={applyFilters}
                            onReset={resetFilters}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            availableLocations={availableLocations}
                            availableDeposits={availableDeposits}
                            availableCategories={availableCategories}
                            availableStatuses={availableStatuses}
                        />
                    </div>
                )}

                <AnimatePresence>
                    {isFormModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <motion.div
                                className="w-[600px] max-w-full h-auto shadow-xl bg-sipe-blue-dark rounded-2xl p-6 relative"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {viewingMaterialExits ? (
                                    <MaterialExitForm onClose={closeFormModal}
                                        notify={notify}
                                        onExitCreated={refreshMaterialExits} />
                                ) : (
                                    <MaterialForm onClose={closeFormModal} notify={notify} />
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isDetailModalOpen && materialDetail && (
                        <MaterialDetailModal
                            isOpen={isDetailModalOpen}
                            onClose={closeDetailModal}
                            selectedMaterial={materialDetail}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Material;
