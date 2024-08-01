import { Button } from "@/components/Button/Button";



function Testing() {
    
    return (
        <div className='bg-sipe-blue-dark h-screen flex justify-center items-center text-sipe-white'>
            <div className="bg-sipe-blue-light flex flex-col justify-center w-350 rounded-xl gap-6 p-4">
                <p className="font-bold text-2xl text-center">¿Estás seguro que querés 
                borrar este material?</p>
                <div className="flex justify-around">
                    <Button variant="sipemodalalt" size="sipebuttonmodal" className="px-4">CANCELAR</Button>
                    <Button variant="sipemodal" size="sipebuttonmodal" className="px-4">ELIMINAR</Button>
                </div>
            </div>
        </div>
    );
}

export default Testing