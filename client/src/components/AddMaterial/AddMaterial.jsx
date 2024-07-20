import AddImg from "../AddImg/AddImg"
import FormMaterial from "../FormMaterial/FormMaterial"

function AddMaterial() {
    return (
        <div className="flex justify-center items-center flex-col border p-10 rounded-xl w-3/6 h-4/6 text-sipe-white">
            <div className="flex justify-start items-start p-10">
                <h1 className="text-4xl">Ingrese los datos del nuevo material</h1>
                
            </div>
            <hr/>
            <div className="flex w-80 bg-sipe-blue-light bg-transparent justify-between min-w-full gap-10 ">
                <AddImg />
                <div className="">
                    <FormMaterial />
                </div>
            </div>
        </div>
    )
}

export default AddMaterial