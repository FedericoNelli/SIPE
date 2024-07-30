import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Table/Table";
import { Badge } from "@/components/Badge/Badge";

function MaterialList({ materials }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

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

            {/* Modal */} 
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
                        <h2 className="text-lg font-bold mb-4">Detalles del Material</h2>
                        {selectedMaterial && (
                            <div>
                                {selectedMaterial.imagen ? (
                                    <img
                                        src={`http://localhost:8081/${selectedMaterial.imagen}`} // Asegúrate de que el path sea correcto
                                        alt={selectedMaterial.nombre}
                                        className="w-full h-auto rounded-md mb-4"
                                    />
                                ) : (
                                    <p>No hay imagen disponible</p>
                                )}
                                <p><strong>Nombre:</strong> {selectedMaterial.nombre}</p>
                                <p><strong>ID:</strong> {selectedMaterial.id}</p>
                                <p><strong>Depósito:</strong> {selectedMaterial.depositoNombre}</p>
                                <p><strong>Estado:</strong> {selectedMaterial.estadoDescripcion}</p>
                                <p><strong>Cantidad:</strong> {selectedMaterial.cantidad} unidades</p>
                                <p><strong>Ubicación:</strong> {selectedMaterial.ubicacionNombre}</p>
                                <p><strong>Matrícula:</strong> {selectedMaterial.matricula}</p>
                                <p><strong>Categoría:</strong> {selectedMaterial.categoriaDescripcion}</p>
                            </div>
                        )}
                        <button
                            onClick={closeModal}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default MaterialList;