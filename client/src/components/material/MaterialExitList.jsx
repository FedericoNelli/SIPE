import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/Common/Table/Table";
import axios from "axios";

function MaterialExitList() {
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:8081/exits') // Ajusta la ruta si es necesario
            .then(response => {
                // Verificar si response.data es un array o un objeto con un array en `data`
                if (Array.isArray(response.data)) {
                    setSalidas(response.data);
                } else if (response.data.data) {
                    setSalidas(response.data.data);
                }
            })
            .catch(error => {
                console.error('Error fetching salidas:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p className="text-center text-white">Cargando salidas...</p>;
    }

    return (
        <>
            {salidas.length === 0 ? (
                <p className="text-center text-white">No hay salidas registradas.</p>
            ) : (
                <Table className="w-full text-sipe-white">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10 rounded-tl-lg">ID</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Fecha</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Material</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Cantidad</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Depósito</TableHead>
                            <TableHead className="text-center text-sipe-white font-bold text-sm bg-sipe-white/10">Ubicación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salidas.map((salida, index) => (
                            <TableRow key={index}>
                                <TableCell className="text-center font-light">{salida.salidaId}</TableCell>
                                <TableCell className="text-center font-light">{salida.fechaSalida}</TableCell>
                                <TableCell className="text-center font-light">{salida.materialNombre}</TableCell>
                                <TableCell className="text-center font-light">{salida.cantidad} {salida.cantidad === 1 ? "unidad" : "unidades"}</TableCell>
                                <TableCell className="text-center font-light">{salida.depositoNombre}</TableCell>
                                <TableCell className="text-center font-light">{salida.ubicacionNombre}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>


                </Table>
            )}
        </>
    );
}

export default MaterialExitList;
