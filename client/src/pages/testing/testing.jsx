import React, { useState } from 'react';
import ModalEditMaterial from '@/components/Testing/CompTesting';

const MaterialPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const handleEditClick = (material) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMaterial(null);
    };

    return (
        <div>
            <button onClick={() => handleEditClick(material)}>Editar Material</button>
            <ModalEditMaterial
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                // notify={notify}
                material={selectedMaterial}
            />
        </div>
    );
};


export default MaterialPage;