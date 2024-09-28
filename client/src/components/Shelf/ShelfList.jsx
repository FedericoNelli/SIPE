import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';

function ShelfList() {
    const [shelves, setShelves] = useState([]);

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
        <Table className="w-full text-white">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Estanteria número</TableHead>
                    <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de estantes</TableHead>
                    <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad de divisiones</TableHead>
                    <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Pasillo</TableHead>
                    <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Lado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {shelves.map(shelve => (
                    <TableRow key={shelve.id}>
                        <TableCell className="text-center font-light">Estanteria {shelve.numero}</TableCell>
                        <TableCell className="text-center font-light">{shelve.cantidad_estante}</TableCell>
                        <TableCell className="text-center font-light">{shelve.cantidad_division}</TableCell>
                        <TableCell className="text-center font-light">{shelve.numeroPasillo}</TableCell>
                        <TableCell className="text-center font-light">{shelve.direccionLado}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default ShelfList