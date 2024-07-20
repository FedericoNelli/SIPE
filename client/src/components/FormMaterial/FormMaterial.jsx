import { Label } from "@/components/label/label"
import { Input } from "@/components/input/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/Select/Select"

function FormMaterial() {
    return (
        <form className="space-y-4 ">
            <div className="flex flex-col space-y-2 text-sipe-white">
                <Label className="flex justify-center items-center gap-4" htmlFor="name">
                    <span className="text-xl">Nombre: </span> <Input className="border-none border-b-2" id="name" required type="text" />
                </Label>
            </div>
            <div>
                <Label htmlFor="storage">
                    <Select >
                        <SelectTrigger className="w-[180px] bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                            <SelectValue placeholder="Depósitos" />
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
        </form>
    )
}

export default FormMaterial

