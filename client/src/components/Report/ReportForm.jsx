import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";
import { Label } from "@/components/Common/Label/Label";
import { Button } from "@/components/Common/Button/Button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/Common/Select/Select";
import { Input } from "@/components/Common/Input/Input";

const ReportForm = ({ onClose, notify }) => {
    const [formData, setFormData] = useState({
        tipo: '',
        fechaInicio: '',
        fechaFin: '',
        deposito: '',
        estadoMaterial: '',
        idMaterial: '', // Añadir material al formulario
        tipoGrafico: '',
        idSalida: '',
        idDetalleSalida: '',
        idMovimiento: ''
    });
    const [depositos, setDepositos] = useState([]);
    const [estadosMaterial, setEstadosMaterial] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [exits, setExits] = useState([]);
    const [movements, setMovements] = useState([]); // Añadir estado para las salidas de material
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

        // Si el informe seleccionado es "Informe de salida de material", hacemos la solicitud al endpoint /exits
        if (formData.tipo === 'Informe de salida de material') {
            axios.get('http://localhost:8081/exits-details')
                .then(response => {
                    setExits(response.data)
                }
                )
                .catch(error => console.error('Error fetching exits:', error));
        } if (formData.tipo === 'Informe de material por movimiento entre deposito') {
            axios.get('http://localhost:8081/movements')
                .then(response => setMovements(response.data))
                .catch(error => console.error('Error fetching movements:', error));
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
            }
        };

        // Agregar el evento de tecla al montar el componente
        window.addEventListener("keydown", handleEscape);

        // Limpiar el evento al desmontar el componente
        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    const handleMultiSelectChange = (name, value) => {
        setFormData((prevData) => {
            const currentValues = prevData[name];
            if (currentValues.includes(value)) {
                // Si el valor ya está seleccionado, lo quitamos
                return {
                    ...prevData,
                    [name]: currentValues.filter((val) => val !== value)
                };
            } else {
                // Si no está seleccionado, lo agregamos
                return {
                    ...prevData,
                    [name]: [...currentValues, value]
                };
            }
        });
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
                deposito: formData.deposito,
                estadoMaterial: formData.estadoMaterial,
                idMaterial: formData.idMaterial,
                idDetalleSalida: formData.tipo === 'Informe de salida de material' ? formData.idDetalleSalida : null,
                idMovimiento: formData.tipo === 'Informe de material por movimiento entre deposito' ? formData.idMovimiento : null
            };

            // Aquí agregas el log para verificar qué tipo de informe se está enviando
            console.log("Enviando informe al backend:", reportDataToSend);

            const response = await axios.post('http://localhost:8081/addReport', reportDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Response del informe generado:', response.data);
            if (response.status === 200) {
                notify('success', "¡Informe generado con éxito!");

                // Recargar la página después de 2 segundos
                /* setTimeout(() => {
                    window.location.reload();
                }, 2000); */  // Recargar después de 2 segundos
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
                                <SelectItem value="Informe de material por deposito">Informe de material por depósito</SelectItem>
                                <SelectItem value="Informe de material por estado">Informe de material por estado</SelectItem>
                                <SelectItem value="Informe de material por movimiento entre deposito">Informe de material por movimiento entre depósito</SelectItem>
                                <SelectItem value="Informe de salida de material">Informe de salida de material</SelectItem>
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
                    {formData.tipo === 'Informe de material por deposito' && (
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

                    {/* Selects de material si el informe es por salida de material */}
                    {formData.tipo === 'Informe de salida de material' && (
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Material</Label>
                            <Select
                                value={formData.idDetalleSalida}
                                onValueChange={(value) => handleSelectChange('idDetalleSalida', value)}
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona un material" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Todos">Todos</SelectItem>
                                    {exits.map(exit => (
                                        <SelectItem key={exit.salidaId} value={exit.salidaId}>{exit.nombreMaterial}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Selects de material y rango de fechas si el informe es por movimiento entre depósitos */}
                    {formData.tipo === 'Informe de material por movimiento entre deposito' && (
                        <div className="flex flex-col gap-4">
                            <Label className="text-sm font-medium">Material</Label>
                            <Select
                                value={formData.idMovimiento} // Usamos idMovimiento como FK para movimientos
                                onValueChange={(value) => handleSelectChange('idMovimiento', value)}
                            >
                                <SelectTrigger className="bg-sipe-blue-dark text-sipe-white border-sipe-white rounded-lg">
                                    <SelectValue placeholder="Selecciona un movimiento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {movements.map(movement => (
                                        <SelectItem key={movement.id} value={movement.id}>{movement.nombreMaterial}{' '}{movement.depositoOrigen}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
