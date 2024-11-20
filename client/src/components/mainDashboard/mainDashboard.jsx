import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomCard from '@/components/Common/Cards/CustomCard';
import { Package, TriangleAlert, CornerDownRight, AlignStartVertical, Tags, ArrowUpRight, ScrollText } from 'lucide-react';

function MainDashboard() {
    const [totalMaterials, setTotalMaterials] = useState(0);
    const [lowStockMaterials, setLowStockMaterials] = useState(0);
    const [totalEstanterias, setTotalEstanterias] = useState(0);
    const [lastMaterial, setLastMaterial] = useState('');
    const [totalAuditorias, setTotalAuditorias] = useState(0);
    const [updateTrigger, setUpdateTrigger] = useState(false);
    const [totalInformes, setTotalInformes] = useState(0);
    const [lastOutput, setLastOutput] = useState(null);
    const [lastMovedMaterial, setLastMovedMaterial] = useState(null);

    const navigate = useNavigate();

    const triggerUpdate = () => {
        setUpdateTrigger(prev => !prev);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {

                const totalMaterialsResponse = await axios.get('http://localhost:8081/total-materials');
                setTotalMaterials(totalMaterialsResponse.data.total);


                const lowStockMaterialsResponse = await axios.get('http://localhost:8081/low-stock-materials');
                setLowStockMaterials(lowStockMaterialsResponse.data.total);


                const totalEstanteriasResponse = await axios.get('http://localhost:8081/total-estanterias');
                setTotalEstanterias(totalEstanteriasResponse.data.total);


                const lastMaterialResponse = await axios.get('http://localhost:8081/last-material');
                setLastMaterial(lastMaterialResponse.data.nombre);


                const totalAuditoriasResponse = await axios.get('http://localhost:8081/total-audits');
                setTotalAuditorias(totalAuditoriasResponse.data.total);


                const totalInformesResponse = await axios.get('http://localhost:8081/total-reports');
                setTotalInformes(totalInformesResponse.data.total);


                const lastMaterialOutputResponse = await axios.get('http://localhost:8081/last-material-output');
                if (lastMaterialOutputResponse.data.data === null) {
                    setLastOutput(null);
                } else {
                    setLastOutput({
                        fecha: lastMaterialOutputResponse.data.data.fecha,
                    });
                }

                const lastMovedMaterialResponse = await axios.get('http://localhost:8081/last-moved-material');

                if (lastMovedMaterialResponse.data.data === null) {
                    setLastMovedMaterial(null);
                } else {
                    setLastMovedMaterial({
                        nombre: lastMovedMaterialResponse.data.data.materialNombre,
                    });
                }
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };
        fetchData();
    }, [updateTrigger]);


    const rol = localStorage.getItem('rol');
    const buttonSection = [
        {
            label: 'IR A MOVIMIENTOS',
            disabled: rol !== 'Administrador',
            path: '/movement'
        },
        {
            label: 'IR A SALIDAS',
            disabled: rol !== 'Administrador',
            path: '/exits'
        },
        {
            label: 'IR A MATERIALES',
            disabled: rol !== 'Administrador' && rol !== 'Colaborador',
            path: '/enters'
        },
        {
            label: 'IR A INFORMES',
            disabled: rol !== 'Administrador',
            path: '/inf'
        },
        {
            label: 'IR A AUDITORÍAS',
            disabled: rol !== 'Administrador',
            path: '/audits'
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
                    Icon={ArrowUpRight}
                    colSpan={1}
                    title={lastMovedMaterial === null ? "No existen movimientos de material" : "Último material movido"}
                    totalElement={lastMovedMaterial ? `${lastMovedMaterial.nombre}\n` : ''}
                    buttonText={buttonSection[0].label}
                    buttonDisabled={buttonSection[0].disabled}
                    onButtonClick={() => handleButtonClick(buttonSection[0].path)}
                />

                <CustomCard
                    Icon={CornerDownRight}
                    colSpan={1}
                    title={lastOutput ? "Última salida realizada" : "No existen salidas registradas"}
                    totalElement={lastOutput?.fecha ? `Fecha: ${new Date(lastOutput.fecha).toLocaleDateString()}` : ""}
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
                    additionalDescription="Materiales en depósitos: datos clave para optimizar la gestión de recursos"
                    onButtonClick={() => handleButtonClick(buttonSection[2].path)}
                />
                <CustomCard
                    Icon={TriangleAlert}
                    colSpan={2}
                    title="Materiales críticos"
                    totalElement={lowStockMaterials}
                    buttonText={buttonSection[2].label}
                    buttonDisabled={buttonSection[2].disabled}
                    additionalDescription="Cantidad de materiales que están por debajo del nivel mínimo de stock"
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
                    Icon={ScrollText}
                    colSpan={1}
                    title="Cantidad de auditorías"
                    totalElement={`${totalAuditorias} auditorías`}
                    buttonText={buttonSection[4].label}
                    buttonDisabled={buttonSection[4].disabled}
                    onButtonClick={() => handleButtonClick(buttonSection[4].path)}
                />
            </div>
        </main>
    );
}

export default MainDashboard;
