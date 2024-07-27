import { useState, useEffect } from 'react';
import { Button } from "@/components/Button/Button";
import axios from 'axios';

function FilterModal({ onClose, onApplyFilters }) {
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
        .catch(error => console.error('Error fetching ubicaciones:', error));

        axios.get('http://localhost:8081/depo-names')
            .then(response => setDepositos(response.data))
            .catch(error => console.error('Error fetching depositos:', error));

        axios.get('http://localhost:8081/categories')
            .then(response => setCategorias(response.data))
            .catch(error => console.error('Error fetching categorias:', error));
        
            axios.get('http://localhost:8081/statuses')
            .then(response => setEstados(response.data))
            .catch(error => console.error('Error fetching estados:', error));

    }, []);

    const handleFilterChange = (filterCategory, value) => {
        setSelectedFilters(prevFilters => {
            const newFilters = { ...prevFilters };
            if (newFilters[filterCategory].includes(value)) {
                newFilters[filterCategory] = newFilters[filterCategory].filter(item => item !== value);
            } else {
                newFilters[filterCategory].push(value);
            }
            return newFilters;
        });
    };

    const applyFilters = () => {
        onApplyFilters(selectedFilters);
        onClose();
    };

    return (
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
                                <input 
                                    type="checkbox" 
                                    checked={selectedFilters.ubicacion.includes(ubicacion.nombre)}
                                    onChange={() => handleFilterChange('ubicacion', ubicacion.nombre)}
                                />
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
                                <input 
                                    type="checkbox" 
                                    checked={selectedFilters.deposito.includes(deposito.nombre)}
                                    onChange={() => handleFilterChange('deposito', deposito.nombre)}
                                />
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
                                <input 
                                    type="checkbox" 
                                    checked={selectedFilters.categoria.includes(categoria.descripcion)}
                                    onChange={() => handleFilterChange('categoria', categoria.descripcion)}
                                />
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
                                <input 
                                    type="checkbox" 
                                    checked={selectedFilters.estado.includes(estado.descripcion)}
                                    onChange={() => handleFilterChange('estado', estado.descripcion)}
                                />
                                {estado.descripcion}
                            </label>
                        </div>
                    ))}
                </div>
                <Button onClick={applyFilters} className="mt-4 bg-sipe-orange-light font-semibold px-4 py-2 rounded hover:bg-sipe-orange-light-variant">
                    Aplicar Filtros
                </Button>
            </div>
        </div>
    );
}

export default FilterModal;