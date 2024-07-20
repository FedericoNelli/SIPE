import React, { useState } from 'react';

const AddImg = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState('');
    const handleImageChange = (event) => {
        setError('');
        if (event.target.files && event.target.files[0]) {
            const image = event.target.files[0];
            const maxSizeInBytes = 1 * 1024 * 1024;

            if (image.size > maxSizeInBytes){
                setError("El tamaño de la imagen no debe exceder 1MB");
                return;
            }
            setSelectedImage(URL.createObjectURL(image));
        }
    };

    return (
        <div className="border-2 border-sipe-white rounded-xl flex justify-center text-sipe-white w-4/6 h-96">
            <label className="flex justify-center" htmlFor="file-input">
                {selectedImage ? (
                    <img src={selectedImage} alt="Selected" className="" />
                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <span>+</span>
                        <span>Agregar imagen</span>
                        </div>
                )}
            </label>
            <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
            />
            {error && <p>{error}</p>}
        </div>
    );
};

export default AddImg;