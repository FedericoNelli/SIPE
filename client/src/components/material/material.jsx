import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from "../Input/Input";
import { Button } from "@/components/Button/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Table/Table";
import { Badge } from "@/components/Badge/Badge";
import { Search, Filter } from 'lucide-react';
import FormMaterial from '@/components/FormMaterial/FormMaterial'; // Importa FormMaterial

function Material() {
    const [materials, setMaterials] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Agrega estado para el modal del formulario

    useEffect(() => {
        axios.get('http://localhost:8081/materials')
            .then(response => {
                setMaterials(response.data);
            })
            .catch(error => {
                console.error('Error fetching materials:', error);
            });
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

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const openFormModal = () => {
        setIsFormModalOpen(true); 
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false); 
    };

    return (
        <div className="">
            <div className="flex justify-between w-full text-sipe-white font-bold">
                <div className="flex flex-col mb-5">
                    <h1 className="text-3xl font-bold">Materiales</h1>
                    <h3 className="text-md font-light">Listado completo de materiales</h3>
                </div>
                <div className="flex flex-row gap-4 text-sipe-white">
                    <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">+ NUEVO</Button> {/* Cambia la función del botón */}
                    <Button variant="secondary" className="bg-transparent text-sipe-white font-semibold px-2 py-2 flex items-center gap-2 "> <Filter /> <span className="font-light"> Filtrar </span> </Button>
                    <Button onClick={openModal} variant="secondary" className="bg-transparent border-sipe-white border text-sipe-white font-semibold px-2 py-2 flex items-center gap-2"> <Search /> <span className='font-light'>Buscar</span> </Button>
                </div>
            </div>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center text-sipe-white/45">Nombre</TableHead>
                        <TableHead className="text-center text-sipe-white/45">ID</TableHead>
                        <TableHead className="text-center text-sipe-white/45">Depósito</TableHead>
                        <TableHead className="text-center text-sipe-white/45">Estado</TableHead>
                        <TableHead className="text-center text-sipe-white/45">Cantidad</TableHead>
                        <TableHead className="text-center text-sipe-white/45">Ubicación</TableHead>
                        <TableHead className="text-center text-sipe-white/45">Matrícula</TableHead>
                        <TableHead className="text-center text-sipe-white/45">Categoría</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {materials.map(material => (
                        <TableRow key={material.id}>
                            <TableCell className="text-center font-light">{material.nombre}</TableCell>
                            <TableCell className="text-center font-light">{material.id}</TableCell>
                            <TableCell className="text-center font-light">{material.depositoNombre}</TableCell>
                            <TableCell className="text-center font-light">
                                <Badge variant="default" className={`bg-sipeBadges-${material.estadoDescripcion.toLowerCase().replace(' ', '-')} p-2 rounded-md font-light w-20 justify-center`} >
                                    {material.estadoDescripcion}
                                </Badge>
                            </TableCell >
                            <TableCell className="text-center font-light">{material.cantidad} unidades</TableCell>
                            <TableCell className="text-center font-light">{material.ubicacionNombre}</TableCell>
                            <TableCell className="text-center font-light">{material.matricula}</TableCell>
                            <TableCell className="text-center font-light">{material.categoriaDescripcion}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-center p-4">
                <Button variant="outline" className="mx-1">
                    1
                </Button>
                <Button variant="outline" className="mx-1">
                    2
                </Button>
                <Button variant="outline" className="mx-1">
                    3
                </Button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-sipe-blue-dark rounded-lg p-6 w-full max-w-4xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-sipe-white">Buscar material</h2>
                            <button onClick={closeModal} className="text-gray-300">&times;</button>
                        </div>
                        <Input 
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Buscar..."
                            className="w-full p-2 mt-4 border-b"
                        />
                        <ul className="mt-4">
                            {searchResults.map((result, index) => (
                                <li key={index} className="p-2 border-b border-gray-500 text-sipe-white">
                                    {result.nombre}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {isFormModalOpen && (
                <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                    <FormMaterial onClose={closeFormModal} /> 
                </div>
            )}
        </div>
    );
}

export default Material;