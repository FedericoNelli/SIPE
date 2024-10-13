import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomCard from '@/components/Common/Cards/CustomCard';
import { Package, TriangleAlert, Rows3, CornerDownRight, AlignStartVertical, Tags } from 'lucide-react';

function MainDashboard() {
    const [totalMaterials, setTotalMaterials] = useState(0);
    const [lowStockMaterials, setLowStockMaterials] = useState(0);
    const [totalEstanterias, setTotalEstanterias] = useState(0);
    const [lastMaterial, setLastMaterial] = useState('');
    const [totalCategorias, setTotalCategorias] = useState(0); // Nuevo estado
    const [updateTrigger, setUpdateTrigger] = useState(false);
    const [totalInformes, setTotalInformes] = useState(0);
    
    const navigate = useNavigate(); 

    const triggerUpdate = () => { 
        setUpdateTrigger(prev => !prev);
    };

    useEffect(() => {
        const fetchTotalMaterials = async () => {
            try {
                const response = await axios.get('http://localhost:8081/total-materials');
                setTotalMaterials(response.data.total);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchTotalMaterials();
    }, [updateTrigger]);

    useEffect(() => {
        const fetchLowStockMaterials = async () => {
            try {
                const response = await axios.get('http://localhost:8081/low-stock-materials');
                setLowStockMaterials(response.data.total);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchLowStockMaterials();
    }, [updateTrigger]);

    useEffect(() => {
        const fetchTotalEstanterias = async () => {
            try {
                const response = await axios.get('http://localhost:8081/total-estanterias');
                setTotalEstanterias(response.data.total);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchTotalEstanterias();
    }, [updateTrigger]);

    useEffect(() => {
        const fetchLastMaterial = async () => {
            try {
                const response = await axios.get('http://localhost:8081/last-material');
                setLastMaterial(response.data.nombre);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchLastMaterial();
    }, [updateTrigger]);

    useEffect(() => {
        const fetchTotalCategorias = async () => { // Nueva llamada al endpoint
            try {
                const response = await axios.get('http://localhost:8081/total-categories');
                setTotalCategorias(response.data.total);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchTotalCategorias();
    }, [updateTrigger]);

    useEffect(() => {
        const fetchTotalInformes = async () => {
            try {
                const response = await axios.get('http://localhost:8081/total-reports');
                setTotalInformes(response.data.total);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchTotalInformes();
    }, [updateTrigger]);

    const rol = localStorage.getItem('rol');
    const buttonSection = [
        { 
            label: 'Ir a Estanterías',
            disabled: rol !== 'Administrador',
            path: '/shelf' 
        },
        { 
            label: 'Ir a Movimientos',
            disabled: rol !== 'Administrador',
            path: '/movement' 
        },
        { 
            label: 'Ir a Materiales',
            disabled: rol !== 'Administrador' && rol !== 'Colaborador',
            path: '/mtls' 
        },
        { 
            label: 'Ir a Informes',
            disabled: rol !== 'Administrador',
            path: '/inf' 
        },
        { 
            label: 'Ir a Categorias',
            disabled: rol !== 'Administrador',
            path: '/category'  
        }
    ];

    const handleButtonClick = (path) => {
        navigate(path);
        triggerUpdate(); 
    };

    return (
        <main className="max-h-screen p-3 py-0 flex flex-col">
            <div className="grid grid-cols-4 gap-4 flex-grow">
                <CustomCard
                    Icon={Rows3}
                    colSpan={1}
                    title="Total de estanterías"
                    totalElement={`${totalEstanterias} estanterías`} 
                    buttonText={buttonSection[0].label}
                    buttonDisabled={buttonSection[0].disabled}
                    onButtonClick={() => handleButtonClick(buttonSection[0].path)}
                />
                <CustomCard
                    Icon={CornerDownRight}
                    colSpan={1}
                    title="Último movimiento realizado"
                    totalElement={lastMaterial}
                    buttonText={buttonSection[1].label}
                    buttonDisabled={buttonSection[1].disabled}
                    onButtonClick={() => handleButtonClick(buttonSection[1].path)} 
                />
                <CustomCard
                    Icon={Package}
                    colSpan={2}
                    title="Total de stock"
                    totalElement={`${totalMaterials} materiales`} 
                    buttonText={buttonSection[2].label}
                    buttonDisabled={buttonSection[2].disabled}
                    additionalDescription="Ésta es la cantidad de materiales en los depósitos. Es importante estar al tanto de estos valores para mejorar la gestión de recursos."
                    onButtonClick={() => handleButtonClick(buttonSection[2].path)} 
                />
                <CustomCard
                    Icon={TriangleAlert}
                    colSpan={2}
                    title="Materiales críticos"
                    totalElement={lowStockMaterials}
                    buttonText={buttonSection[2].label}
                    buttonDisabled={buttonSection[2].disabled}
                    additionalDescription="Cantidad de materiales que están por debajo del nivel mínimo de stock. Es importante mantener estos materiales en un nivel óptimo para evitar retrasos en los trabajos."
                    onButtonClick={() => handleButtonClick(buttonSection[2].path)} 
                />
                <CustomCard
                    Icon={AlignStartVertical}
                    colSpan={1}
                    title="Cantidad de informes generados"
                    totalElement={`${totalInformes} informes`}
                    buttonText={buttonSection[3].label}
                    buttonDisabled={buttonSection[3].disabled}
                    onButtonClick={() => handleButtonClick(buttonSection[3].path)} 
                />
                <CustomCard
                    Icon={Tags}
                    colSpan={1}
                    title="Cantidad de categorías"
                    totalElement={`${totalCategorias} categorías`}
                    buttonText={buttonSection[4].label}
                    buttonDisabled={buttonSection[4].disabled}
                    onButtonClick={() => handleButtonClick(buttonSection[4].path)} 
                />
            </div>
        </main>
    );
}

export default MainDashboard;
