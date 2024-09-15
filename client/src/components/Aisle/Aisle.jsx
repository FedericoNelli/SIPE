import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Common/Button/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import ShelfForm from '@/components/Aisle/AisleForm';

function Aisle() {
    const [aisles, setAisles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8081/aisle')
            .then(response => {
                setAisles(response.data);
            })
            .catch(error => {
                console.error('Error fetching aisles:', error);
            });
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentaisles = aisles.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-sipe-white opacity-5 z-10 rounded-2xl" />
            <div className="relative z-20">
                <div className="flex justify-between w-full text-sipe-white font-bold pt-7 px-10">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Pasillos</h1>
                        <h3 className="text-md font-thin">Listado completo de pasillos</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">+ NUEVO</Button>
                    </div>
                </div>
                <Table className="w-full text-white">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Pasillo</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Número</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Depósito</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentaisles.map(aisle => (
                            <TableRow key={aisle.id}>
                                <TableCell className="text-center font-light">Pasillo {aisle.id}</TableCell>
                                <TableCell className="text-center font-light">{aisle.numero}</TableCell>
                                <TableCell className="text-center font-light">{aisle.nombreDeposito}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(aisles.length / itemsPerPage)).keys()].map(page => (
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
                        <ShelfForm onClose={closeFormModal} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Aisle;
