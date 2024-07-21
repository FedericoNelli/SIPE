import { Label } from "@/components/Label/Label"
import { Input } from "@/components/Input/Input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/Select/Select"

function FormMaterial() {
    return (
        <>
            <form className="space-y-4">
                <div className="flex flex-col space-y-2 text-sipe-white">
                    <Label className="flex justify-center items-center gap-4" htmlFor="name">
                        <span className="text-xl">Nombre: </span> <Input className="border-b border-sipe-gray" id="name" required type="text" />
                    </Label>
                </div>
                <div className="pb-2">
                    <Label htmlFor="storage">
                        <Select>
                            <SelectTrigger className="w-[200px] bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="¿En qué depósito está?" />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                                <SelectGroup className="bg-sipe-blue-dark text-sipe-white">
                                    <SelectItem value="Santa-Fe">Santa Fe</SelectItem>
                                    <SelectItem value="Rosario">Rosario</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Label>
                </div>
                <div className="pb-2">
                    <Label htmlFor="storage">
                        <Select>
                            <SelectTrigger className="w-[200px] bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="¿Cuál es su estado?" />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                                <SelectGroup className="bg-sipe-blue-dark text-sipe-white">
                                    <SelectItem value="disponible">Disponible</SelectItem>
                                    <SelectItem value="en-uso">En uso</SelectItem>
                                    <SelectItem value="bajo-stock">Bajo stock</SelectItem>
                                    <SelectItem value="sin-stock">Sin stock</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Label>
                </div>
                <div className="pb-2">
                    <Label htmlFor="storage">
                        <Select>
                            <SelectTrigger className="w-[200px] bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="¿En qué categoría está?" />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                                <SelectGroup className="bg-sipe-blue-dark text-sipe-white">
                                    <SelectItem value="cables">Cables</SelectItem>
                                    <SelectItem value="baterias">Baterias</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Label>
                </div>
                <div className="flex flex-col space-y-2 text-sipe-white">
                    <Label className="flex justify-center items-center gap-4" htmlFor="amount">
                        <span className="text-xl">Cantidad: </span> <Input className="border-b border-sipe-gray" id="amount" required type="number" />
                    </Label>
                </div>

                <div className="flex flex-col space-y-2 text-sipe-white">
                    <Label className="flex justify-center items-center gap-4" htmlFor="enrollment">
                        <span className="text-xl">Matrícula: </span> <Input className="border-b border-sipe-gray" id="enrollment" required type="text" />
                    </Label>
                </div>

                <div className="flex flex-col space-y-2 text-sipe-white">
                    <Label className="flex justify-center items-center gap-4" htmlFor="low-stock">
                        <span className="text-xl whitespace-nowrap">Bajo stock: </span> <Input className="border-b border-sipe-gray" id="low-stock" required type="number" />
                    </Label>
                </div>

                <div className="flex flex-col space-y-2 text-sipe-white">
                    <Label className="flex justify-start items-center gap-4" htmlFor="low-stock">
                        <span className="text-xl whitespace-nowrap">Ubicacion: </span>
                    </Label>
                </div>

                <div className="flex justify-center items-center gap-2">

                    <div className="flex justify-center items-center gap-2">
                        <span className="text-sm">Pasillo: </span>
                        <Select>
                            <SelectTrigger className="w-[35px] h-[30px] bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg px-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                                <SelectGroup className="bg-sipe-blue-dark text-sipe-white">
                                    <SelectItem value="p1">1</SelectItem>
                                    <SelectItem value="p2">2</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-center items-center gap-2">
                        <span className="text-sm">División: </span>
                        <Select>
                            <SelectTrigger className="w-[35px] h-[30px] bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg px-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                                <SelectGroup className="bg-sipe-blue-dark text-sipe-white">
                                    <SelectItem value="p1">1</SelectItem>
                                    <SelectItem value="p2">2</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-center items-center gap-2">
                        <span className="text-sm">Estante: </span>
                        <Select>
                            <SelectTrigger className="w-[35px] h-[30px] bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg px-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                                <SelectGroup className="bg-sipe-blue-dark text-sipe-white">
                                    <SelectItem value="p1">1</SelectItem>
                                    <SelectItem value="p2">2</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-center items-center gap-2">
                        <span className="text-sm">Espacio: </span>
                        <Select>
                            <SelectTrigger className="w-[35px] h-[30px] bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg px-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-2">
                                <SelectGroup className="bg-sipe-blue-dark text-sipe-white">
                                    <SelectItem value="p1">1</SelectItem>
                                    <SelectItem value="p2">2</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                </div>


            </form>
        </>
    )
}

export default FormMaterial

