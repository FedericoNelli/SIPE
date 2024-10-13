import { useEffect, useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import axios from 'axios';
import LocationForm from '@/components/Location/LocationForm';
import LocationList from './LocationList';
import LocationEditModal from './LocationEditModal';

function Location({ notify }) {
    const [locations, setLocations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para el modo de eliminación
    const [selectedLocations, setSelectedLocations] = useState([]); // Estado para las ubicaciones seleccionadas
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadLocations = () => {
        axios.get('http://localhost:8081/deposit-locations')
            .then(response => {
                setLocations(response.data);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
            });
    };

    useEffect(() => {
        loadLocations();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLocations = locations.slice(indexOfFirstItem, indexOfLastItem);

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
        setSelectedLocations([]); // Limpiar la selección al salir del modo de eliminación
    };

    // Función para manejar la eliminación de ubicaciones
    const handleDeleteLocations = () => {
        if (selectedLocations.length === 0) {
            notify('error', 'No hay ubicaciones seleccionadas para eliminar');
            return;
        }

        axios.delete('http://localhost:8081/delete-locations', { data: { locationIds: selectedLocations } })
            .then(() => {
                notify('success', 'Ubicaciones eliminadas correctamente');
                setLocations(locations.filter(location => !selectedLocations.includes(location.id)));
                setSelectedLocations([]);
                setIsDeleteMode(false);
            })
            .catch(error => {
                console.error('Error eliminando ubicaciones:', error);
                notify('error', 'Error al eliminar ubicaciones');
            });
    };

    const openEditModal = () => {
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleLocationUpdated = () => {
        loadLocations();
        closeEditModal();
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Ubicaciones</h1>
                        <h3 className="text-md font-thin">Listado completo de ubicaciones</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} variant="sipemodal">NUEVA UBICACIÓN</Button>
                        <Button onClick={toggleDeleteMode} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                            {isDeleteMode ? 'Cancelar Eliminación' : 'Eliminar Ubicaciones'}
                        </Button>
                        <Button onClick={openEditModal} className="bg-blue-600 font-semibold px-4 py-2 rounded hover:bg-blue-700">EDITAR UBICACIÓN</Button>
                    </div>
                </div>
                <LocationList
                    locations={currentLocations}
                    isDeleteMode={isDeleteMode}
                    selectedLocations={selectedLocations}
                    setSelectedLocations={setSelectedLocations}
                    handleDeleteLocations={handleDeleteLocations}
                    notify={notify}
                />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(locations.length / itemsPerPage)).keys()].map(page => (
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
                        <LocationForm onClose={closeFormModal} notify={notify} />
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                    <LocationEditModal
                        onClose={closeEditModal}
                        onLocationUpdated={handleLocationUpdated}
                        notify={notify}/>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Location;
