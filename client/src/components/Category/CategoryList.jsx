import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from 'axios';

function CategoryList() {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8081/categories')
            .then(response => {
                setCategories(response.data);
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
                        <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tr-lg">ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map(category => (
                        <TableRow key={category.id}>
                            <TableCell className="text-center font-light">{category.descripcion}</TableCell>
                            <TableCell className="text-center font-light">{category.id}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default CategoryList;
