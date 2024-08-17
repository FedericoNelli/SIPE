import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';

function MovementList() {
    const [movements, setMovements] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8081/movements')
            .then(response => {
                console.log(response.data);  // Verifica qué datos estás recibiendo
                setMovements(response.data);
            })
            .catch(error => {
                console.error('Error fetching movements:', error);
            });
    }, []);

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).replace(',', '');
    };

    return (
        <>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Fecha</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Usuario</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Material</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad Movida</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito Origen</TableHead>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">Depósito Destino</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {movements.map(movement => (
                        <TableRow key={movement.id}>
                            <TableCell className="text-center font-light">{formatDate(movement.fechaMovimiento)}</TableCell>
                            <TableCell className="text-center font-light">{movement.Usuario}</TableCell>
                            <TableCell className="text-center font-light">{movement.nombreMaterial}</TableCell>
                            <TableCell className="text-center font-light">{movement.cantidad}</TableCell>
                            <TableCell className="text-center font-light">{movement.depositoOrigen}</TableCell>
                            <TableCell className="text-center font-light">{movement.depositoDestino}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default MovementList;
