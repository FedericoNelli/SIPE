import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";

function AisleForm({ onClose }) {
    const [aisles, setAisles] = useState([]);
    const [formData, setFormData] = useState({
        numero: '',
        idDeposito: '',
        idLado1: 1,
        idLado2: 2
    });

    useEffect(() => {
        // Fetch aisles data
        fetch('http://localhost:8081/aisle')
            .then(response => response.json())
            .then(data => setAisles(data))
            .catch(error => console.error('Error fetching aisles:', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };


    const handleSelectChange = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        fetch('http://localhost:8081/addAisle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    toast.error("Error al agregar pasillo")
                    console.error('Error:', data.error);
                } else {
                    toast.success("Pasillo creada con éxito!!")
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
                    <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nuevo pasillo</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="numero" className="text-sm font-medium">
                                Número
                            </Label>
                            <Input
                                className="border-b"
                                id="numero"
                                name="numero"
                                type="number"
                                placeholder="Ingresa la cantidad de estantes"
                                value={formData.numero}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Depósito</Label>
                        <div className="flex w-full gap-4">
                            <Select id="aisle" onValueChange={(value) => handleSelectChange('idDeposito', value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Seleccione el depósito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aisles.map((aisle) => (
                                        <SelectItem key={aisle.id} value={aisle.id}>{aisle.nombreDeposito}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

export default AisleForm;
