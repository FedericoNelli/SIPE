import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Button } from "@/components/Common/Button/Button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/Common/Select/Select";
import { Input } from "@/components/Common/Input/Input";
import axios from 'axios';

const ReportForm = ({ onClose, notify, onReportUpdated }) => {
    const [formData, setFormData] = useState({
        tipo: '',
        fechaInicio: '',
        fechaFin: '',
        deposito: '',
        estadoMaterial: '',
        idMaterial: '',
        tipoGrafico: '',
        idSalida: '',
        idDetalleSalida: '',
        idMovimiento: ''
    });
    const [depositos, setDepositos] = useState([]);
    const [estadosMaterial, setEstadosMaterial] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [materialesConMovimientos, setMaterialesConMovimientos] = useState([]);
    const [materialesConSalidas, setMaterialesConSalidas] = useState([]);
    const [loading, setLoading] = useState(false);

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

        if (formData.tipo === 'Informe de salida de material') {
            axios.get('http://localhost:8081/materials-with-exits')
                .then(response => {
                    setMaterialesConSalidas(response.data.materiales)
                })
                .catch(error => console.error('Error fetching materials with exits:', error));
        }

        // Obtener materiales con movimientos si el tipo de informe es "Informe de material por movimiento entre deposito"
        if (formData.tipo === 'Informe de material por movimiento entre deposito') {
            axios.get('http://localhost:8081/materials-with-movements')
                .then(response => {
                    setMaterialesConMovimientos(response.data.materiales);
                })
                .catch(error => console.error('Error fetching materials with movements:', error));
        }
    }, [formData.tipo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
                onReportUpdated();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

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
            const formattedStartDate = formData.fechaInicio ? format(new Date(formData.fechaInicio + 'T00:00:00'), 'yyyy-MM-dd') : null;
            const formattedEndDate = formData.fechaFin ? format(new Date(formData.fechaFin + 'T00:00:00'), 'yyyy-MM-dd') : null;

            const reportDataToSend = {
                ...formData,
                fechaInicio: formattedStartDate,
                fechaFin: formattedEndDate,
                deposito: formData.deposito,
                estadoMaterial: formData.estadoMaterial,
                /* idMaterial: formData.idMaterial, */
                /* idDetalleSalida: formData.tipo === 'Informe de salida de material' ? formData.idDetalleSalida : null, */
                idMaterial: formData.tipo === 'Informe de material por movimiento entre deposito' || formData.tipo === 'Informe de salida de material' ? formData.idMaterial : null
            };

            const response = await axios.post('http://localhost:8081/addReport', reportDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                notify('success', "¡Informe generado con éxito!");
                onClose();
                onReportUpdated();
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

    // Obtener la fecha actual y formatearla para el atributo max
    const today = new Date();
    const formattedToday = format(today, 'yyyy-MM-dd');

    const handleCancel = () => {
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
                            <SelectContent className="bg-sipe-blue-light">
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" value="Informe de inventario general">Informe de inventario general</SelectItem>
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" value="Informe de material por deposito">Informe de material por depósito</SelectItem>
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" value="Informe de material por estado">Informe de material por estado</SelectItem>
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" value="Informe de material por movimiento entre deposito">Informe de material por movimiento entre depósito</SelectItem>
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" value="Informe de salida de material">Informe de salida de material</SelectItem>
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
                            <SelectContent className="bg-sipe-blue-light">
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" value="Area">Área</SelectItem>
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" value="Barra">Barra</SelectItem>
                                <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" value="Torta">Torta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Select de depósito si el informe es por depósito */}
                    {formData.tipo === 'Informe de material por deposito' && (
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Depósito</Label>
                            {depositos.length === 0 ? (
                                <div className="text-sipe-gray">No hay depósitos para seleccionar</div>
                            ) : (
                                <Select
                                    value={formData.deposito}
                                    onValueChange={(value) => handleSelectChange('deposito', value)}
                                >
                                    <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Selecciona un depósito" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-sipe-blue-light">
                                        {depositos.map(deposito => (
                                            <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={deposito.id} value={deposito.id}>
                                                {deposito.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
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
                                <SelectContent className="bg-sipe-blue-light">
                                    {estadosMaterial.map(estado => (
                                        <SelectItem className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm" key={estado.id} value={estado.id}>{estado.descripcion}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Selects de material si el informe es por salida de material */}
                    {formData.tipo === 'Informe de salida de material' && (
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Material</Label>
                            {materialesConSalidas.length === 0 ? (
                                <div className="text-sipe-gray text-sm">No hay salidas para seleccionar</div>
                            ) : (
                                <Select
                                    value={formData.idMaterial}
                                    onValueChange={(value) => handleSelectChange('idMaterial', value)}
                                >
                                    <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Selecciona un material" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-sipe-blue-light">
                                        {materialesConSalidas.map((material, index) => (
                                            <SelectItem
                                                className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                                key={`${material.idMaterial}-${index}`}
                                                value={material.idMaterial}
                                            >
                                                {material.nombreMaterial} - {material.depositoNombre} - {material.ubicacionNombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    {/* Selects de material y rango de fechas si el informe es por movimiento entre depósitos */}
                    {formData.tipo === 'Informe de material por movimiento entre deposito' && (
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Material</Label>
                            {materialesConMovimientos.length === 0 ? (
                                <div className="text-sipe-gray text-sm">No hay movimientos para seleccionar</div>
                            ) : (
                                <Select
                                    value={formData.idMaterial}
                                    onValueChange={(value) => handleSelectChange('idMaterial', value)}
                                >
                                    <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                        <SelectValue placeholder="Selecciona un material" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-sipe-blue-light">
                                        {materialesConMovimientos.map(material => (
                                            <SelectItem
                                                className="bg-sipe-blue-light text-sipe-white border-sipe-white rounded-sm"
                                                key={material.idMaterial}
                                                value={material.idMaterial}
                                            >
                                                {material.nombreMaterial} - {material.depositoNombre} - {material.ubicacionNombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}


                    {/* Selección de fechas (siempre presente para todos los tipos de informes) */}
                    <div className="flex flex-col gap-4">
                        <Label className="text-sm font-medium">Fecha de inicio</Label>
                        <Input
                            type="date"
                            name="fechaInicio"
                            value={formData.fechaInicio}
                            onChange={handleInputChange}
                            className="border-b bg-sipe-blue-dark text-white"
                            max={formattedToday}
                        />
                        <Label className="text-sm font-medium">Fecha de fin</Label>
                        <Input
                            type="date"
                            name="fechaFin"
                            value={formData.fechaFin}
                            onChange={handleInputChange}
                            className="border-b bg-sipe-blue-dark text-white"
                            max={formattedToday}
                        />
                    </div>
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
        </>
    );
};

export default ReportForm;
