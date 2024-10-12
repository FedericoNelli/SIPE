import { useEffect, useState } from 'react';
import { Button } from "@/components/Common/Button/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/Common/Pagination/Pagination";
import UserForm from '@/components/User/UserForm';
import UserList from '@/components/User/UserList';
import axios from 'axios';

function User({ notify }) {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8081/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

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
                        <h1 className="text-3xl font-bold">Usuarios</h1>
                        <h3 className="text-md font-thin">Listado completo de usuarios</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} variant="sipemodal">NUEVO USUARIO</Button>
                    </div>
                </div>
                <UserList users={currentUsers} />
                <div className="flex justify-center p-4">
                    <Pagination>
                        <PaginationContent>
                            {[...Array(Math.ceil(users.length / itemsPerPage)).keys()].map(page => (
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
                        <UserForm onClose={closeFormModal} notify={notify} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default User;
