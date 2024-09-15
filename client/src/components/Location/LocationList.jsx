import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';

function LocationList() {
    const [locations, setlocations] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8081/deposit-locations')
            .then(response => {
                setlocations(response.data);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
            });
    }, []);

    return (
        <>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">Nombre</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {locations.map(location => (
                        <TableRow key={location.id}>
                            <TableCell className="text-center font-light">{location.nombre}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default LocationList
