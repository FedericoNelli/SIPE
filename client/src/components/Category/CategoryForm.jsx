import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";
import axios from 'axios';

function CategoryForm({ onClose, notify }) {
    const [formData, setFormData] = useState({ descripcion: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:8081/addCategory', formData);
    
            if (response.status !== 200) {
                throw new Error(response.data.error || "Error al agregar categoría");
            }
    
            notify('success', "¡Categoría agregada correctamente!");
    
            if (onClose) onClose();
    
            setTimeout(() => {
                window.location.reload();
            }, 2500);
        } catch (error) {
            console.error('Error al agregar la categoría:', error);
            notify('error', error.message || "Error al agregar categoría");
        }
    };

    const handleCancel = () => {
        if (onClose) onClose();
    };

    return (
        <Card className="bg-sipe-blue-dark text-sipe-white p-4">
            <CardHeader>
                <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nueva Categoría</CardTitle>
                <hr className="text-sipe-gray" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="descripcion" className="text-sm font-medium">Descripción de la categoría</Label>
                        <Input
                            className="border-b"
                            id="descripcion"
                            name="descripcion"
                            placeholder="Ingresa la descripción de la categoría"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>
                    CANCELAR
                </Button>
                <Button variant="sipebutton" size="sipebutton" onClick={handleSubmit}>
                    AGREGAR
                </Button>
            </CardFooter>
        </Card>
    );
}

export default CategoryForm;
