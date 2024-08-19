import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";

function FormShelve({ onClose }) {
    const [aisles, setAisles] = useState([]);
    const [sides, setSides] = useState([]);
    const [formData, setFormData] = useState({
        cantidad_estante: '',
        cantidad_division: '',
        idPasillo: '',
        idLado: ''
    });

    useEffect(() => {
        // Fetch aisles data
        fetch('http://localhost:8081/aisles')
            .then(response => response.json())
            .then(data => setAisles(data))
            .catch(error => console.error('Error fetching aisles:', error));

        // Fetch sides data
        fetch('http://localhost:8081/sides')
            .then(response => response.json())
            .then(data => setSides(data))
            .catch(error => console.error('Error fetching sides:', error));
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
        fetch('http://localhost:8081/addShelf', {
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
                    if (onClose) onClose(); // Cierra el formulario después de agregar
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
                    <CardTitle className="text-3xl text-center font-bold mb-2">Agregar nueva estantería</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="cantidad_estante" className="text-sm font-medium">
                                Cantidad de estantes
                            </Label>
                            <Input
                                className="border-b"
                                id="cantidad_estante"
                                name="cantidad_estante"
                                type="number"
                                placeholder="Ingresa la cantidad de estantes"
                                value={formData.cantidad_estante}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="cantidad_division" className="text-sm font-medium">
                                Cantidad de divisiones
                            </Label>
                            <Input
                                className="border-b"
                                id="cantidad_division"
                                name="cantidad_division"
                                type="number"
                                placeholder="Ingresa la cantidad de divisiones"
                                value={formData.cantidad_division}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <div className="flex w-full gap-4">
                            <Select id="aisle" onValueChange={(value) => handleSelectChange('idPasillo', value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Pasillo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aisles.map((aisle) => (
                                        <SelectItem key={aisle.id} value={aisle.id}>{aisle.numero}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select id="aisle-side" onValueChange={(value) => handleSelectChange('idLado', value)}>
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Lado de pasillo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sides.map((side) => (
                                        <SelectItem key={side.id} value={side.id}>{side.descripcion}</SelectItem>
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

export default FormShelve;
