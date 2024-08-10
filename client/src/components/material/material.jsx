import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import FormMaterial from '@/components/Material/FormMaterial';
import ListMaterial from '@/components/Material/ListMaterial';
import { Search, Filter } from 'lucide-react';
import FilterModal from '@/components/Common/Filter/FilterModal';

function Material({ notify }) {
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
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
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query) {
            axios.get(`http://localhost:8081/materials/search?query=${query}`)
                .then(response => {
                    setSearchResults(response.data);
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
            filtered = filtered.filter(material => material.categoriaDescripcion === filters.categoria);
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
                            <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">+ NUEVO</Button>
                        )}
                        <Button onClick={openFilterModal} variant="secondary" className="bg-transparent text-sipe-white font-semibold px-2 py-2 flex items-center gap-2 "> <Filter /> Filtrar </Button>
                        <Button onClick={openModalSearch} variant="secondary" className="bg-transparent border-sipe-white border text-sipe-white font-semibold px-2 py-2 flex items-center gap-2"> <Search /> Buscar </Button>
                    </div>
                </div>
                <ListMaterial materials={currentMaterials} />
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
                                        <li key={result.id} className="p-2 border-b border-gray-500 text-sipe-white">
                                            {result.nombre}
                                        </li>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isFilterModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
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

                {isFormModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <FormMaterial onClose={closeFormModal} notify={notify} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Material;
