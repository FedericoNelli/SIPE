import { useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import ReportList from './ReportList';
import ReportForm from './ReportForm';
import axios from 'axios';

function Report({ notify }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false); // Estado para activar el modo de eliminación
    

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
                        <h1 className="text-3xl font-bold">Informes</h1>
                        <h3 className="text-md font-thin">Listado completo de informes</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">Generar Informe</Button>
                        <Button onClick={() => setIsDeleteMode(!isDeleteMode)} className="bg-red-500 font-semibold px-4 py-2 rounded hover:bg-red-600">{isDeleteMode ? "Cancelar" : "Eliminar Informe"}</Button>
                    </div>
                </div>
                <ReportList
                    isDeleteMode={isDeleteMode}
                    notify={notify}
                    setIsDeleteMode={setIsDeleteMode}
                />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(10 / itemsPerPage)).keys()].map(page => ( // Ajustar este valor según el total real
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
                        <ReportForm onClose={closeFormModal}  notify={notify} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Report;
