import AddImg from "../AddImg/AddImg"
import FormMaterial from "../FormMaterial/FormMaterial"
import { Button } from "@/components/Button/Button";

function AddMaterial() {
    return (
        <div className="flex justify-center items-center flex-col border p-10 rounded-3xl w-[1000px] h-[760] text-sipe-white">
            <div className="w-full mb-8 text-sipe-gray">
                <h1 className="text-4xl mb-2">Ingrese los datos del nuevo material</h1>
                <hr/>
            </div>
            
            <div className="flex w-80 bg-sipe-blue-light bg-transparent min-w-full gap-16 ">
                <AddImg />
                <div>
                    <FormMaterial />
                </div>
            </div>

            <div className="flex gap-4 mt-10">
                <Button variant="sipebuttonalt" size="sipebutton" type="submit">
                    CANCELAR
                </Button>
                <Button variant="sipebutton" size="sipebutton" type="submit">
                    AGREGAR
                </Button>
            </div>
        </div>
    )
}

export default AddMaterial