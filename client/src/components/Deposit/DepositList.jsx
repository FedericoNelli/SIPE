import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';

function DepositList() {
    const [deposits, setDeposits] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8081/deposits')
            .then(response => {
                setDeposits(response.data);
            })
            .catch(error => {
                console.error('Error fetching deposits:', error);
            });
    }, []);

    return (
        <>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Nombre</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Ubicación</TableHead>
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
        </>
    )
}

export default DepositList
