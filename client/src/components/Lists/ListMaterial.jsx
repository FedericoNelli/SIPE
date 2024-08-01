import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Table/Table";
import { Badge } from "@/components/Badge/Badge";
import { Button } from "../Button/Button";
import axios from "axios";
import { toast } from "react-hot-toast";

function ListMaterial({ materials }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [shelves, setShelves] = useState([]);

    const sipeBadges = {
        "disponible": "#88B04B",
        "en-uso": "#5D8AA8",
        "sin-stock": "#D9534F",
        "bajo-stock": "#FF8C42"
    };

    const handleCellClick = (material) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMaterial(null);
    };

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleClickOutside = (event) => {
        if (event.target.id === 'modal-background') {
            closeModal();
        }
    };

    const handleDelete = async () => {
        if (!selectedMaterial) return;
        try {
            console.log(selectedMaterial.id);
            await axios.delete(`http://localhost:8081/materials/${selectedMaterial.id}`);
            closeModal();
            toast.success("Material eliminado con éxito!");
            window.location.reload();
        } catch (error) {
            toast.error("Error al eliminar el material");
        }
    };

    const handleEdit = () => {
        console.log("Editar material");
    };

    useEffect(() => {
        axios.get('http://localhost:8081/shelves')
            .then(response => {
                setShelves(response.data);
            })
            .catch(error => {
                console.error('Error fetching shelves:', error);
            });
    }, []);

    return (
        <>
            <Table className="w-full text-sipe-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Nombre</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">ID</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Estado</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Ubicación</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Matrícula</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Categoría</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {materials.map(material => (
                        <TableRow key={material.id} onClick={() => handleCellClick(material)}>
                            <TableCell className="text-center font-light">
                                {material.nombre}
                            </TableCell>
                            <TableCell className="text-center font-light">
                                {material.id}
                            </TableCell>
                            <TableCell className="text-center font-light">
                                {material.depositoNombre}
                            </TableCell>
                            <TableCell className="text-center font-light">
                                <Badge
                                    variant="default"
                                    color={sipeBadges[material.estadoDescripcion.toLowerCase().replace(' ', '-')]}
                                    className="p-2 rounded-md font-light w-20 justify-center"
                                >
                                    {material.estadoDescripcion}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center font-light">
                                {material.cantidad} unidades
                            </TableCell>
                            <TableCell className="text-center font-light">
                                {material.ubicacionNombre}
                            </TableCell>
                            <TableCell className="text-center font-light">
                                {material.matricula}
                            </TableCell>
                            <TableCell className="text-center font-light">
                                {material.categoriaDescripcion}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modal detalle material */}
            {isModalOpen && (
                <div
                    id="modal-background"
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                    onClick={handleClickOutside}
                >
                    <div className="bg-sipe-blue-dark rounded-3xl shadow-lg p-6 w-3/6 h-4/6 text-sipe-white grid grid-cols-2" onClick={(e) => e.stopPropagation()}>
                        {selectedMaterial && (
                            <>
                                <div className="flex justify-center items-center">
                                    <div className="grid grid-rows-2 gap-4 items-center">
                                        <div className="flex justify-center">
                                            {selectedMaterial.imagen ? (
                                                <img
                                                    src={`http://localhost:8081${selectedMaterial.imagen}`}
                                                    alt={selectedMaterial.nombre}
                                                    className="w-3/4 h-auto rounded-md mb-4"
                                                />
                                            ) : (
                                                <p>No hay imagen disponible</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-4">
                                            <h1 className="text-center">Mapa</h1>
                                            {selectedMaterial.imagen ? (
                                                <img
                                                    src={`http://localhost:8081${selectedMaterial.imagen}`}
                                                    alt={selectedMaterial.nombre}
                                                    className="w-3/4 h-auto rounded-md mb-4"
                                                />
                                            ) : (
                                                <p>No hay imagen disponible</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1">
                                    <p><strong>Nombre:</strong> {selectedMaterial.nombre}</p>
                                    <p><strong>ID:</strong> {selectedMaterial.id}</p>
                                    <p><strong>Depósito:</strong> {selectedMaterial.depositoNombre}</p>
                                    <p><strong>Estado:</strong> {selectedMaterial.estadoDescripcion}</p>
                                    <p><strong>Cantidad:</strong> {selectedMaterial.cantidad} unidades</p>
                                    <p><strong>Ubicación:</strong> {selectedMaterial.ubicacionNombre}</p>
                                    <p><strong>Matrícula:</strong> {selectedMaterial.matricula}</p>
                                    <p><strong>Categoría:</strong> {selectedMaterial.categoriaDescripcion}</p>
                                    <p><strong>Ubicación:</strong></p>
                                    <div className="flex gap-1">
                                        <p className="text-xs"><strong>Estantería:</strong> {shelves.find(shelf => shelf.id === selectedMaterial.idEstanteria)?.nombre}</p>
                                        <p className="text-xs"><strong>Estante:</strong> {selectedMaterial.idEstante}</p>
                                        <p className="text-xs"><strong>División:</strong> {selectedMaterial.idDivision}</p>
                                        <p className="text-xs"><strong>Espacio:</strong> {selectedMaterial.idEspacio}</p>
                                    </div>

                                    <hr />
                                    <div className="flex justify-center gap-10">
                                        <Button variant="sipemodal" size="sipebuttonmodal" className="px-4" onClick={handleEdit}>EDITAR</Button>
                                        <Button variant="sipemodal" size="sipebuttonmodal" className="px-4" onClick={() => setConfirmDeleteOpen(true)}>ELIMINAR</Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {isConfirmDeleteOpen && (
                            <div
                                id="modal-background"
                                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                                onClick={() => setConfirmDeleteOpen(false)} // Cerrar al hacer clic fuera
                            >
                                <div className="bg-sipe-blue-light flex flex-col justify-center w-350 rounded-xl gap-6 p-4" onClick={(e) => e.stopPropagation()}>
                                    <p className="font-bold text-2xl text-center text-sipe-white">¿Estás seguro que querés borrar este material?</p>
                                    <div className="flex justify-around">
                                        <Button variant="sipemodalalt" size="sipebuttonmodal" className="px-4" onClick={() => setConfirmDeleteOpen(false)}>CANCELAR</Button>
                                        <Button variant="sipemodal" size="sipebuttonmodal" className="px-4" onClick={handleDelete}>ELIMINAR</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default ListMaterial;