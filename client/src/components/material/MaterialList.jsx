import { useState, useEffect, useCallback } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Badge } from "@/components/Common/Badge/Badge";
import axios from "axios";
import ModalDetailMaterial from "@/components/Material/ModalDetailMaterial";

function MaterialList({ materials }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [shelves, setShelves] = useState([]);

    const sipeBadges = {
        "disponible": "#88B04B",
        "en-uso": "#5D8AA8",
        "sin-stock": "#D9534F",
        "bajo-stock": "#FF8C42"
    };

    const handleCellClick = useCallback((material) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedMaterial(null);
    }, []);

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
                {/* Encabezado de la tabla */}
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
                                {material.categoriaNombre}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ModalDetailMaterial 
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedMaterial={selectedMaterial}
            />
        </>
    );
}

export default MaterialList;
