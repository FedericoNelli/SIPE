import { useState } from 'react';
import { Button } from "@/components/Button/Button";
import FormDeposit from '../Forms/FormDeposit';
import DepositList from '../Lists/ListDeposit';

function Deposit({ notify }) {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const openFormModal = () => {
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
    };

    return (
        <div className="">
            <div className="flex justify-between w-full text-sipe-white font-bold">
                <div className="flex flex-col mb-5">
                    <h1 className="text-3xl font-bold">Depósitos</h1>
                    <h3 className="text-md font-light">Listado completo de depósitos</h3>
                </div>
                <div className="flex flex-row gap-4 text-sipe-white">
                    <Button onClick={openFormModal} className="bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">+ NUEVO</Button>
                </div>
            </div>
            <DepositList />
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
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                    <FormDeposit onClose={closeFormModal} notify={notify} />
                </div>
            )}
        </div>
    );
}

export default Deposit;
