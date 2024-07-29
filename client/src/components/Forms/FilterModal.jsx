import { useState, useEffect } from 'react';
import { Button } from "@/components/Button/Button";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FilterModal({ onClose }) {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [depositos, setDepositos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [estados, setEstados] = useState([]);
    
    const [selectedFilters, setSelectedFilters] = useState({
        ubicacion: [],
        deposito: [],
        categoria: [],
        estado: []
    });

    useEffect(() => {
        axios.get('http://localhost:8081/deposit-locations')
            .then(response => setUbicaciones(response.data))
            .catch(error => {
                console.error('Error fetching ubicaciones:', error);
                toast.error('Error al obtener ubicaciones');
            });

        axios.get('http://localhost:8081/depo-names')
            .then(response => setDepositos(response.data))
            .catch(error => {
                console.error('Error fetching depositos:', error);
                toast.error('Error al obtener depósitos');
            });

        axios.get('http://localhost:8081/categories')
            .then(response => setCategorias(response.data))
            .catch(error => {
                console.error('Error fetching categorias:', error);
                toast.error('Error al obtener categorías');
            });
        
        axios.get('http://localhost:8081/statuses')
            .then(response => setEstados(response.data))
            .catch(error => {
                console.error('Error fetching estados:', error);
                toast.error('Error al obtener estados');
            });

    }, []);

    const handleApplyFilters = () => {
        // Aquí puedes agregar la lógica para aplicar los filtros, si es necesario

        // Mostrar un mensaje de éxito al aplicar los filtros
        toast.success('Filtros aplicados exitosamente');
        if (onClose) onClose();
    };

    return (
        <>
            <ToastContainer />
            <div className="fixed inset-0 bg-sipe-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-sipe-blue-dark rounded-lg p-6 w-full max-w-4xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-sipe-white">Filtrar materiales</h2>
                        <button onClick={onClose} className="text-gray-300">&times;</button>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sipe-white">Ubicación</h3>
                        {ubicaciones.map(ubicacion => (
                            <div key={ubicacion.id}>
                                <label className="text-sipe-white">
                                    <input type="checkbox"/>
                                    {ubicacion.nombre}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sipe-white">Depósito</h3>
                        {depositos.map(deposito => (
                            <div key={deposito.id}>
                                <label className="text-sipe-white">
                                    <input type="checkbox"/>
                                    {deposito.nombre}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sipe-white">Categoría</h3>
                        {categorias.map(categoria => (
                            <div key={categoria.id}>
                                <label className="text-sipe-white">
                                    <input type="checkbox"/>
                                    {categoria.descripcion}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sipe-white">Estado</h3>
                        {estados.map(estado => (
                            <div key={estado.id}>
                                <label className="text-sipe-white">
                                    <input type="checkbox"/>
                                    {estado.descripcion}
                                </label>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleApplyFilters} className="mt-4 bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">
                        Aplicar Filtros
                    </Button>
                </div>
            </div>
        </>
    );
}

export default FilterModal;
