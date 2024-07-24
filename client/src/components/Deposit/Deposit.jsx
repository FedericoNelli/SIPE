import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/Button/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Table/Table";
import FormDeposit from '../Forms/FormDeposit';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Deposit() {
    const [deposits, setDeposits] = useState([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8081/deposits')
            .then(response => {
                setDeposits(response.data);
            })
            .catch(error => {
                console.error('Error fetching deposits:', error);
            });
    }, []);


    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    return (
        <>
            <ToastContainer />
            <div className="">
                <div className="flex justify-between w-full text-sipe-white font-bold">
                    <div className="flex flex-col mb-5">
                        <h1 className="text-3xl font-bold">Depósitos</h1>
                        <h3 className="text-md font-light">Listado completo de depósitos</h3>
                    </div>
                    <div className="flex flex-row gap-4 text-sipe-white">
                        <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">+ NUEVO</Button> {/* Cambia la función del botón */}
                    </div>
                </div>
                <Table className="w-full text-white">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-sipe-gray">Nombre</TableHead>
                            <TableHead className="text-center text-sipe-gray">Ubicación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deposits.map(deposit => (
                            <TableRow key={deposit.id}>
                                <TableCell className="text-center font-light">{deposit.nombre}</TableCell>
                                <TableCell className="text-center font-light">{deposit.nombreUbicacion}</TableCell>
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


                {isFormModalOpen && (
                    <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                        <FormDeposit onClose={closeFormModal} />
                    </div>
                )}
            </div>
            );
        </>
    )
}

export default Deposit;
