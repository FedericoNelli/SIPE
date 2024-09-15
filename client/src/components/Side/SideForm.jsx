import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Button } from "@/components/Common/Button/Button";

function FormSide({ onClose }) {
    const [formData, setFormData] = useState({
        descripcion: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        fetch('http://localhost:8081/addSide', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    toast.error("Error al agregar Estantería")
                    console.error('Error:', data.error);
                } else {
                    toast.success("Estantería creada con éxito!!")
                    console.log('Success:', data.message);
                    onClose(); // Cierra el formulario después de agregar
                    setTimeout(() => {
                        window.location.reload();
                    }, 2500);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const handleCancel = () => {
        if (onClose) onClose(); // Llama a la función de cierre pasada como prop
    };

    return (
        <>
            <ToastContainer />
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nuevo lado</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="descripcion" className="text-sm font-medium">
                                Descripción
                            </Label>
                            <Input
                                className="border-b"
                                id="descripcion"
                                name="descripcion"
                                type="string"
                                placeholder="Ingresa la Descripción"
                                value={formData.descripcion}
                                onChange={handleChange}
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
        </>
    )
}

export default FormSide;
