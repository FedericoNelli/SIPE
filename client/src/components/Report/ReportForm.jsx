import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Button } from "@/components/Common/Button/Button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/Common/Select/Select";
import { Input } from "@/components/Common/Input/Input";
import ReportDetailModal from './ReportDetailModal';

const ReportForm = ({ onClose, notify }) => {
    const [formData, setFormData] = useState({
        tipo: '',
        fechaInicio: '',
        fechaFin: '',
        deposito: '',
        estadoMaterial: '',
        idMaterial: '', // Añadir material al formulario
        tipoGrafico: '', // Añadir tipo de gráfico
    });

    const [depositos, setDepositos] = useState([]);
    const [estadosMaterial, setEstadosMaterial] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [loading, setLoading] = useState(false);

    const [reportData, setReportData] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState("");

    useEffect(() => {
        axios.get('http://localhost:8081/depo-names')
            .then(response => setDepositos(response.data))
            .catch(error => console.error('Error fetching deposits:', error));

        axios.get('http://localhost:8081/statuses')
            .then(response => setEstadosMaterial(response.data))
            .catch(error => console.error('Error fetching states:', error));

        axios.get('http://localhost:8081/materials')
            .then(response => setMateriales(response.data))
            .catch(error => console.error('Error fetching materials:', error));
    }, []);

    const handleInputChange = (e) => {
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

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Formatear las fechas a 'yyyy-MM-dd' si están presentes
            const formattedStartDate = formData.fechaInicio ? format(new Date(formData.fechaInicio), 'yyyy-MM-dd') : null;
            const formattedEndDate = formData.fechaFin ? format(new Date(formData.fechaFin), 'yyyy-MM-dd') : null;

            const reportDataToSend = {
                ...formData,
                fechaInicio: formattedStartDate,
                fechaFin: formattedEndDate,
            };

            const response = await axios.post('http://localhost:8081/addReport', reportDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                notify('success', "¡Informe generado con éxito!");
                setReportData(response.data.datos);
                setReportType(formData.tipo);
                setShowReportModal(true);

                if (window.fetchReports) {
                    window.fetchReports();
                }
            } else {
                throw new Error(response.data.mensaje || "Error al generar informe");
            }
        } catch (error) {
            console.error('Error al generar el informe:', error);
            notify('error', error.response?.data?.mensaje || "Error al generar informe");
        } finally {
            setLoading(false);
        }
    };



    const handleCancel = () => {
        if (onClose) onClose();
    };

    const handleCloseReportModal = () => {
        setShowReportModal(false);
        if (onClose) onClose();
    };

    return (
        <>
            <Card className="bg-sipe-blue-dark text-sipe-white p-4">
                <CardHeader>
                    <CardTitle className="text-3xl text-center font-bold mb-2">Generar nuevo Informe</CardTitle>
                    <hr className="text-sipe-gray" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-6">
                    <div className="flex flex-col gap-4">
                        <Label className="text-sm font-medium">Tipo de Informe</Label>
                        <Select
                            value={formData.tipo}
                            onValueChange={(value) => handleSelectChange('tipo', value)}
                        >
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona el tipo de informe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Informe de inventario general">Informe de inventario general</SelectItem>
                                <SelectItem value="Informe de material por depósito">Informe de material por depósito</SelectItem>
                                <SelectItem value="Informe de material por estado">Informe de material por estado</SelectItem>
                                <SelectItem value="Informe de material por movimiento entre depósito">Informe de material por movimiento entre depósito</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tipo de gráfico */}
                    <div className="flex flex-col gap-4">
                        <Label className="text-sm font-medium">Tipo de Gráfico</Label>
                        <Select
                            value={formData.tipoGrafico}
                            onValueChange={(value) => handleSelectChange('tipoGrafico', value)}
                        >
                            <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                <SelectValue placeholder="Selecciona el tipo de gráfico" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Area">Área</SelectItem>
                                <SelectItem value="Barra">Barra</SelectItem>
                                <SelectItem value="Torta">Torta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Select de depósito si el informe es por depósito */}
                    {formData.tipo === 'Informe de material por depósito' && (
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Depósito</Label>
                            <Select
                                value={formData.deposito}
                                onValueChange={(value) => handleSelectChange('deposito', value)}
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona un depósito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {depositos.map(deposito => (
                                        <SelectItem key={deposito.id} value={deposito.id}>
                                            {deposito.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Select de estados si el informe es por estado */}
                    {formData.tipo === 'Informe de material por estado' && (
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Estado del Material</Label>
                            <Select
                                value={formData.estadoMaterial}
                                onValueChange={(value) => handleSelectChange('estadoMaterial', value)}
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Todos">Todos</SelectItem>
                                    {estadosMaterial.map(estado => (
                                        <SelectItem key={estado.id} value={estado.id}>{estado.descripcion}</SelectItem>
                                    ))}
                                </SelectContent>

                            </Select>
                        </div>
                    )}

                    {/* Selects de material y rango de fechas si el informe es por movimiento entre depósito */}
                    {formData.tipo === 'Informe de material por movimiento entre depósito' && (
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Material</Label>
                            <Select
                                value={formData.idMaterial}
                                onValueChange={(value) => handleSelectChange('idMaterial', value)}
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona un material" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Todos">Todos</SelectItem>
                                    {materiales.map(material => (
                                        <SelectItem key={material.id} value={material.id}>{material.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Label className="text-sm font-medium">Fecha de inicio</Label>
                            <Input
                                type="date"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleInputChange}
                                className="border-b bg-sipe-blue-dark text-white"
                            />
                            <Label className="text-sm font-medium">Fecha de fin</Label>
                            <Input
                                type="date"
                                name="fechaFin"
                                value={formData.fechaFin}
                                onChange={handleInputChange}
                                className="border-b bg-sipe-blue-dark text-white"
                            />
                        </div>
                    )}

                    {/* Selección de fechas para todos los tipos de informes */}
                    {(formData.tipo !== 'Informe de material por movimiento entre depósito') && (
                        <>
                            <Label className="text-sm font-medium">Fecha de inicio</Label>
                            <Input
                                type="date"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleInputChange}
                                className="border-b bg-sipe-blue-dark text-white"
                            />
                            <Label className="text-sm font-medium">Fecha de fin</Label>
                            <Input
                                type="date"
                                name="fechaFin"
                                value={formData.fechaFin}
                                onChange={handleInputChange}
                                className="border-b bg-sipe-blue-dark text-white"
                            />
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button variant="sipebuttonalt" size="sipebutton" onClick={handleCancel}>
                        CANCELAR
                    </Button>
                    <Button variant="sipebutton" size="sipebutton" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'GENERANDO...' : 'GENERAR'}
                    </Button>
                </CardFooter>
            </Card>

            <ReportDetailModal
                isOpen={showReportModal}
                onClose={handleCloseReportModal}
                reportData={reportData}
                reportType={reportType}
                tipoGrafico={formData.tipoGrafico}
                selectedMaterial={formData.idMaterial === 'Todos' ? 'Todos los materiales' : materiales.find(material => material.id === formData.idMaterial)?.nombre}
                // Ahora la fecha ya está formateada en handleSubmit, por lo que no necesitas formatearla aquí
                dateRange={`${formData.fechaInicio || 'N/A'} - ${formData.fechaFin || 'N/A'}`}
                selectedOption={formData.tipo === 'Informe de material por depósito' ? depositos.find(depo => depo.id === formData.deposito)?.nombre :
                    formData.tipo === 'Informe de material por estado' ? estadosMaterial.find(estado => estado.id === parseInt(formData.estadoMaterial))?.descripcion :
                        formData.tipo === 'Informe de material por movimiento entre depósito' ?
                            `Material: ${formData.idMaterial === 'Todos' ? 'Todos' : materiales.find(material => material.id === formData.idMaterial)?.nombre} | Fechas: ${formData.fechaInicio || 'N/A'} a ${formData.fechaFin || 'N/A'}` : 'No especificado'}
            />

        </>
    );
};

export default ReportForm;
