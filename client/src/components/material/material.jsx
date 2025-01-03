import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import { Search, Filter, ArrowBigRight, Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import MaterialForm from '@/components/Material/MaterialForm';
import MaterialList from '@/components/Material/MaterialList';
import MaterialDetailModal from '@/components/Material/MaterialDetailModal';
import FilterModal from '@/components/Common/Filter/FilterModal';

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

    const loadMaterials = () => {
        axios.get('http://localhost:8081/materials')
            .then(response => {
                setMaterials(response.data);
                setFilteredMaterials(response.data);
            })
            .catch(error => {
                console.error('Error fetching materials:', error);
            });
    }


    useEffect(() => {

        loadMaterials();

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
    }, []);

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
        loadMaterials();
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

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Materiales</h1>
                        <h3 className="text-md font-thin">Listado completo de materiales</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        {userRole === 'Administrador' && (
                            <Button onClick={openFormModal} variant="sipemodal">
                                <Plus /> AÑADIR
                            </Button>
                        )}
                            <>
                                <Button onClick={openFilterModal} variant="sipebuttonalt3" className="bg-sipe-gray bg-opacity-80 text-sipe-white border border-sipe-gray/20 font-semibold px-2 py-2 flex items-center gap-2 ">
                                    <Filter /> FILTRAR
                                </Button>
                                <Button onClick={openModalSearch} variant="sipebuttonalt3" className="bg-sipe-gray bg-opacity-30 text-sipe-white border border-sipe-gray/20 font-semibold px-2 py-2 flex items-center gap-2">
                                    <Search /> BUSCAR
                                </Button>
                            </>
                    </div>
                </div>
                <MaterialList
                    materials={currentMaterials}
                    loadMaterials={loadMaterials}
                    notify={notify}
                />

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
                    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-sipe-blue-dark rounded-lg p-6 w-full max-w-4xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-sipe-white">Buscar material</h2>
                                <button onClick={closeModalSearch} className="text-gray-300"><X /></button>
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
                            mode="Material"
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
                                className="w-[600px] max-w-full h-auto shadow-xl bg-sipe-blue-dark rounded-2xl 2xl:p-2 relative"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MaterialForm onClose={closeFormModal} notify={notify} loadMaterials={loadMaterials} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isDetailModalOpen && materialDetail && (
                        <MaterialDetailModal
                            isOpen={isDetailModalOpen}
                            loadMaterials={loadMaterials}
                            onClose={closeDetailModal}
                            selectedMaterial={materialDetail}
                            notify={notify}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Material;
