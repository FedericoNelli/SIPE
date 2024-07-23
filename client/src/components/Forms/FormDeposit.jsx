import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Cards/Card"
import { Label } from "@/components/Label/Label"
import { Input } from "@/components/Input/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select/Select"
import { Button } from "@/components/Button/Button"

function FormDeposit( {onClose }) {

    const handleCancel = () => {
        if (onClose) onClose(); // Llama a la función de cierre pasada como prop
    };

    return (
        <>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nueva estantería</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                        <Label htmlFor="quantity" className="text-sm font-medium">
                                Numero de Estanteria
                            </Label>
                            <Input className="border-b" id="quantity" type="number" placeholder="Ingresa el numero de estanteria" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                        <Label htmlFor="quantity" className="text-sm font-medium">
                                Cantidad de estantes
                            </Label>
                            <Input className="border-b" id="quantity" type="number" placeholder="Ingresa la cantidad de estantes" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                        <Label htmlFor="quantity" className="text-sm font-medium">
                                Cantidad de divisiones
                            </Label>
                            <Input className="border-b" id="quantity" type="number" placeholder="Ingresa la cantidad de divisiones" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <div className="flex w-full gap-4">
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

export default FormDeposit

