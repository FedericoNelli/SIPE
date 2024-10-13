import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Button } from "@/components/Common/Button/Button";

function LocationList({ locations, isDeleteMode, selectedLocations, setSelectedLocations, handleDeleteLocations, notify }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false); // Estado para la confirmación de eliminación

    // Función para alternar la selección de una ubicación
    const toggleLocationSelection = (locationId) => {
        if (selectedLocations.includes(locationId)) {
            setSelectedLocations(selectedLocations.filter(id => id !== locationId));
        } else {
            setSelectedLocations([...selectedLocations, locationId]);
        }
    };

    // Función para manejar la selección de todas las ubicaciones
    const handleSelectAll = () => {
        if (selectedLocations.length === locations.length) {
            setSelectedLocations([]);
        } else {
            const allLocationIds = locations.map(location => location.id);
            setSelectedLocations(allLocationIds);
        }
    };

    // Función para manejar la confirmación de eliminación
    const confirmDelete = () => {
        if (selectedLocations.length === 0) {
            notify('error', 'No hay ubicaciones seleccionadas para eliminar');
            return;
        }
        setIsConfirmingDeletion(true);
    };

    // Función para cancelar la confirmación de eliminación
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
                                    checked={selectedLocations.length === locations.length && locations.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                        )}
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Nombre</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Total de depósitos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {locations.map(location => (
                        <TableRow key={location.id}>
                            {isDeleteMode && (
                                <TableCell className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedLocations.includes(location.id)}
                                        onChange={() => toggleLocationSelection(location.id)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="text-center font-light">{location.nombre}</TableCell>
                            <TableCell className="text-center font-light">{location.totalDepositos}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {isDeleteMode && (
                <div className="flex flex-col items-center mt-4">
                    {isConfirmingDeletion ? (
                        <>
                            <p className="text-red-500 font-bold">Si confirma la eliminación no se podrán recuperar los datos.</p>
                            <div className="flex gap-4 mt-2">
                                <Button onClick={cancelDelete} className="bg-gray-400 font-semibold px-4 py-2 rounded hover:bg-gray-500">
                                    Cancelar
                                </Button>
                                <Button onClick={handleDeleteLocations} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                                    Aceptar
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button onClick={confirmDelete} className="bg-red-600 font-semibold px-4 py-2 rounded hover:bg-red-700">
                            Confirmar Eliminación
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

export default LocationList;
