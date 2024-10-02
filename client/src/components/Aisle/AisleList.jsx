import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';

function AisleList() {
    const [aisles, setAisles] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8081/aisle')
            .then(response => {
                setAisles(response.data);
            })
            .catch(error => {
                console.error('Error fetching aisles:', error);
            });
    }, []);
    return (
        <>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Número</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Ubicación</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Lado 1</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Lado 2</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {aisles.map(aisle => (
                        <TableRow key={aisle.id}>
                            <TableCell className="text-center font-light">{aisle.numero}</TableCell>
                            <TableCell className="text-center font-light">{aisle.nombreDeposito}</TableCell>
                            <TableCell className="text-center font-light">{aisle.ubicacionDeposito}</TableCell>
                            <TableCell className="text-center font-light">{aisle.lado1Descripcion}</TableCell>
                            <TableCell className="text-center font-light">{aisle.lado2Descripcion}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default AisleList