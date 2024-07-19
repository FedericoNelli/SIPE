import { Input } from "../input/input"
import { Label } from "../label/label"
import { Button } from "@/components/button/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/table/table"
import { Badge } from "@/components/badge/badge"


function Material() {
    return (
        <>
            <div className="flex justify-between w-full text-sipe-white font-bold">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold">Materiales</h1>
                    <h3 className="text-md font-light">Listado completo de materiales</h3>
                </div>
                <div className="flex flex-row gap-4 text-sipe-white">
                    <Button className="bg-sipe-orange-light font-semibold px-4 py-2 rounded">+ NUEVO</Button>
                    <Button className="bg-gray-700 text-sipe-white font-semibold px-2 py-2 flex items-center"> <img src="src/assets/images/icons/Filter.png" alt="" /> Filtrar </Button>
                    <Label>
                        <Input className="size-fit" id="search" placeholder="Buscar" required type="text" />
                    </Label>
                </div>
            </div>
            <Table className="w-full text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-left">Nombre</TableHead>
                        <TableHead className="text-left">ID</TableHead>
                        <TableHead className="text-left">Depósito</TableHead>
                        <TableHead className="text-left">Estado</TableHead>
                        <TableHead className="text-left">Cantidad</TableHead>
                        <TableHead className="text-left">Ubicación</TableHead>
                        <TableHead className="text-left">Matrícula</TableHead>
                        <TableHead className="text-left">Categoría</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Cable FTP</TableCell>
                        <TableCell>322</TableCell>
                        <TableCell>Depósito 1</TableCell>
                        <TableCell>
                            <Badge variant="default" className="bg-sipeBadges-disponible text-white">
                                Disponible
                            </Badge>
                        </TableCell>
                        <TableCell>3 unidades</TableCell>
                        <TableCell>P1D01E03E05</TableCell>
                        <TableCell>M00180</TableCell>
                        <TableCell>Cables</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Fuente Ubiquiti</TableCell>
                        <TableCell>125</TableCell>
                        <TableCell>Depósito 2</TableCell>
                        <TableCell>
                            <Badge variant="default" className="bg-sipeBadges-bajo-stock text-white">
                                Bajo stock
                            </Badge>
                        </TableCell>
                        <TableCell>5 unidades</TableCell>
                        <TableCell>P2D03E02E02</TableCell>
                        <TableCell>P12294</TableCell>
                        <TableCell>Enlace</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Batería 12v100ah</TableCell>
                        <TableCell>52</TableCell>
                        <TableCell>Depósito 1</TableCell>
                        <TableCell>
                            <Badge variant="default" className="bg-sipeBadges-en-uso text-white">
                                En uso
                            </Badge>
                        </TableCell>
                        <TableCell>4 unidades</TableCell>
                        <TableCell>P1D05E03E01</TableCell>
                        <TableCell>M12223</TableCell>
                        <TableCell>Baterías</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Switch Aruba</TableCell>
                        <TableCell>79</TableCell>
                        <TableCell>Depósito 1</TableCell>
                        <TableCell>
                            <Badge variant="default" className="bg-sipeBadges-sin-stock text-white">
                                Sin stock
                            </Badge>
                        </TableCell>
                        <TableCell>0 unidades</TableCell>
                        <TableCell>P4D04E01E01</TableCell>
                        <TableCell>F33215</TableCell>
                        <TableCell>Switch</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>RJ 45 metálico</TableCell>
                        <TableCell>166</TableCell>
                        <TableCell>Depósito 1</TableCell>
                        <TableCell>
                            <Badge variant="default" className="bg-sipeBadges-sin-stock text-white">
                                Sin stock
                            </Badge>
                        </TableCell>
                        <TableCell>0 unidades</TableCell>
                        <TableCell>P2D01E01E04</TableCell>
                        <TableCell>M10089</TableCell>
                        <TableCell>Fichas</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Cablecanal 100x50</TableCell>
                        <TableCell>43</TableCell>
                        <TableCell>Depósito 2</TableCell>
                        <TableCell>
                            <Badge variant="default" className="bg-sipeBadges-disponible text-white">
                                Disponible
                            </Badge>
                        </TableCell>
                        <TableCell>5 unidades</TableCell>
                        <TableCell>P1D01E02E02</TableCell>
                        <TableCell>N33302</TableCell>
                        <TableCell>Cableado</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Batería 12v45ah</TableCell>
                        <TableCell>53</TableCell>
                        <TableCell>Depósito 1</TableCell>
                        <TableCell>
                            <Badge variant="default" className="bg-sipeBadges-en-uso text-white">
                                En uso
                            </Badge>
                        </TableCell>
                        <TableCell>4 unidades</TableCell>
                        <TableCell>P3D02E02E04</TableCell>
                        <TableCell>K14553</TableCell>
                        <TableCell>Baterías</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>RX Plessey</TableCell>
                        <TableCell>32</TableCell>
                        <TableCell>Depósito 1</TableCell>
                        <TableCell>
                            <Badge variant="default" className="bg-sipeBadges-sin-stock text-white">
                                Sin stock
                            </Badge>
                        </TableCell>
                        <TableCell>0 unidades</TableCell>
                        <TableCell>P1D05E05E01</TableCell>
                        <TableCell>M10003</TableCell>
                        <TableCell>Enlace</TableCell>
                    </TableRow>
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
        </>
    )
}

export default Material