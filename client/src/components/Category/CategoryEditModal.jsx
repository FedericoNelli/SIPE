import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Input } from "@/components/Common/Input/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Common/Select/Select";
import { Button } from "@/components/Common/Button/Button";

const CategoryEditModal = ({ onClose, onCategoryUpdated, notify }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newDescription, setNewDescription] = useState('');

    // Cerrar modal al presionar la tecla Escape
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8081/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                notify('error', 'Error al cargar las categorías');
            }
        };
        fetchCategories();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚ\s]*$/;
        if (!regex.test(newDescription)) {
            notify('error', 'La descripción solo puede contener letras y espacios.');
            return;
        }

        if (!selectedCategory || !newDescription) {
            notify('error', 'Debes seleccionar una categoría y proporcionar una nueva descripción.');
            return;
        }
        try {
            const response = await axios.put(`http://localhost:8081/categories/${selectedCategory}`, {
                descripcion: newDescription,
            });
            notify('success', 'Categoría actualizada correctamente');
            onCategoryUpdated(); // Actualizar la lista de categorías si es necesario
            if (onClose) onClose();
        } catch (error) {
            console.error('Error al actualizar la categoría:', error);
            if (error.response && error.response.data && error.response.data.message) {
                notify('error', error.response.data.message)
            } else {
                notify('error', 'Error al actualizar la categoría');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl w-full max-w-2xl">
                <Card className="bg-sipe-blue-dark text-sipe-white 2xl:p-4 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold mb-2 text-center">Editar categoría</CardTitle>
                        <hr />
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-sm font-medium">Selecciona una categoría</Label>
                                <Select id="category" value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="bg-sipe-blue-dark text-sipe-white/60 border-sipe-white rounded-lg font-light">
                                        <SelectValue placeholder="Categorías disponibles" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-sipe-blue-light">
                                        {categories.map((category) => (
                                            <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={category.id} value={category.id}>
                                                {category.descripcion}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="newDescription" className="text-sm font-medium">Nueva descripción</Label>
                                <Input
                                    id="newDescription"
                                    className="border-b-1"
                                    placeholder="Ingresa la nueva descripción"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="sipebuttonalt" size="sipebutton" onClick={onClose}>CANCELAR</Button>
                        <Button variant="sipebutton" size="sipebutton" onClick={handleSubmit}>GUARDAR</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default CategoryEditModal;
