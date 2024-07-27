
import { Toaster, resolveValue } from 'react-hot-toast';


function Testing() {
    const handleClick = () => {
        toast.success('🦄 Wow so easy!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            });
    };

    return (
        <div className='bg-sipe-blue-dark h-screen flex justify-center items-center'>
            <Toaster />
            <button className='text-sipe-white border h-16 p-4 rounded-xl bg-sipe-blue-light hover:bg-sipe-orange-light-variant duration-150' onClick={handleClick}>Mostrar Toast</button>
        </div>
    );
}

export default Testing