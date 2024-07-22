import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Cards/Card"
import { Label } from "@/components/Label/Label"
import { Input } from "@/components/Input/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select/Select"
import { Button } from "@/components/Button/Button"

function FormMaterial( {onClose }) {

    const handleCancel = () => {
        if (onClose) onClose(); // Llama a la función de cierre pasada como prop
    };

    return (
        <>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Agregar nuevo material</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Nombre del material
                            </Label>
                            <Input className="border-b" id="name" placeholder="Ingresa el nombre del material" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deposit-location" className="text-sm font-medium">
                                Ubicación del depósito
                            </Label>
                            <Select id="deposit-location" >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona la ubicación" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bodega-a">Bodega A</SelectItem>
                                    <SelectItem value="bodega-b">Bodega B</SelectItem>
                                    <SelectItem value="deposito-central">Depósito Central</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="deposit-name" className="text-sm font-medium">
                                Nombre del depósito
                            </Label>
                            <Select id="deposit-name">
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona el depósito" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="deposito-1">Depósito 1</SelectItem>
                                    <SelectItem value="deposito-2">Depósito 2</SelectItem>
                                    <SelectItem value="deposito-3">Depósito 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category" className="text-sm font-medium">
                                Categoría
                            </Label>
                            <Select id="category">
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona la categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="materia-prima">Materia Prima</SelectItem>
                                    <SelectItem value="producto-terminado">Producto Terminado</SelectItem>
                                    <SelectItem value="herramienta">Herramienta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status" className="text-sm font-medium">
                                Estado
                            </Label>
                            <Select id="status">
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona el estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="disponible">Disponible</SelectItem>
                                    <SelectItem value="agotado">Agotado</SelectItem>
                                    <SelectItem value="en-pedido">En Pedido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity" className="text-sm font-medium">
                                Cantidad
                            </Label>
                            <Input className="border-b" id="quantity" type="number" placeholder="Ingresa la cantidad" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="serial" className="text-sm font-medium">
                                Matrícula
                            </Label>
                            <Input className="border-b" id="enrollment" placeholder="Ingresa la matrícula" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity" className="text-sm font-medium">
                                Bajo stock
                            </Label>
                            <Input className="border-b" id="quantity" type="number" placeholder="Ingresa límite de bajo stock" />
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Select id="aisle">
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Pasillo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pasillo-a">Pasillo A</SelectItem>
                                    <SelectItem value="pasillo-b">Pasillo B</SelectItem>
                                    <SelectItem value="pasillo-c">Pasillo C</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select id="aisle-side">
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Lado de pasillo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="izquierda">Izquierda</SelectItem>
                                    <SelectItem value="derecha">Derecha</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select id="space">
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Espacio" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="espacio-1">Espacio 1</SelectItem>
                                    <SelectItem value="espacio-2">Espacio 2</SelectItem>
                                    <SelectItem value="espacio-3">Espacio 3</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select id="division">
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="División" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="division-a">División A</SelectItem>
                                    <SelectItem value="division-b">División B</SelectItem>
                                    <SelectItem value="division-c">División C</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Select id="shelf">
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Estante" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="estante-1">Estante 1</SelectItem>
                                <SelectItem value="estante-2">Estante 2</SelectItem>
                                <SelectItem value="estante-3">Estante 3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-4">
                        <Label className="text-sm font-medium">Imagen</Label>
                        <div className="grid gap-2">
                            <Input id="image" type="file" className="bg-sipe-gray text-sipe-white rounded-lg p-0 px-2" placeholder="Seleccionar archivo" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>
                        CANCELAR
                    </Button>
                    <Button variant="sipebutton" size="sipebutton">
                        AGREGAR
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}

export default FormMaterial

