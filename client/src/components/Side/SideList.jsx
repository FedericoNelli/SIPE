import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';

function SideList() {
    const [sides, setSides] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8081/sides')
            .then(response => {
                setSides(response.data);
            })
            .catch(error => {
                console.error('Error fetching sides:', error);
            });
    }, []);
    return (
        <Table className="w-full text-white">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Lado</TableHead>
                    <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Descripción</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sides.map(side => (
                    <TableRow key={side.id}>
                        <TableCell className="text-center font-light">Lado {side.id}</TableCell>
                        <TableCell className="text-center font-light">{side.descripcion}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default SideList