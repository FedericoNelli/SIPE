import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, Cell, LabelList, Pie, PieChart, Label } from "recharts";
import { X } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/Common/Chart/Chart";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/Common/Button/Button";
import { format } from "date-fns"; // Usar para formatear fechas

function ReportDetailModal({ isOpen, onClose, reportData, reportType, tipoGrafico, selectedMaterial, dateRange, selectedOption, selectedOption1 }) {
    const [chartData, setChartData] = useState([]);
    const [materialDetails, setMaterialDetails] = useState([]); // Para los detalles de materiales en los informes de salida de material y movimientos

    useEffect(() => {
        if (reportData) {
            let formattedData = [];

            const splitField = (field) => field ? field.split(', ') : [];

            if (reportType === "Informe de inventario general" || reportType === "Informe de material por deposito") {
                const materials = splitField(reportData.nombre_material);
                const quantities = splitField(reportData.cantidad);
                const deposits = splitField(reportData.nombre_deposito);

                formattedData = materials.map((material, index) => ({
                    name: `${material} - Depósito ${deposits[index] || "N/A"}`,
                    value: parseInt(quantities[index], 10) || 0,
                    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                }));
            } else if (reportType === "Informe de material por estado") {
                const materials = splitField(reportData.nombre_material);
                const quantities = splitField(reportData.cantidad);
                const deposits = splitField(reportData.nombre_deposito);
                const states = splitField(reportData.estado_material);

                formattedData = materials.map((material, index) => ({
                    name: `${material} - Depósito ${deposits[index] || "N/A"}`,
                    value: parseInt(quantities[index], 10) || 0,
                    estado: states[index] || "Sin estado",
                    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                }));
            } else if (reportType === "Informe de material por movimiento entre deposito") {
                const materials = splitField(reportData.nombre_material);
                const quantities = splitField(reportData.cantidad_movimiento);
                const origins = splitField(reportData.deposito_origen);
                const destinations = splitField(reportData.deposito_destino);
                const dates = splitField(reportData.fecha_movimiento);
                const users = splitField(reportData.usuario);

                formattedData = materials.map((material, index) => ({
                    name: `Origen: ${origins[index] || "N/A"} -> Destino: ${destinations[index] || "N/A"}`,
                    value: parseInt(quantities[index], 10) || 0,
                    depositoOrigen: origins[index],
                    depositoDestino: destinations[index],
                    nombreMaterial: material,
                    fechaMovimiento: dates[index] || "N/A",
                    usuario: users[index] || "Desconocido",
                    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                }));
                setMaterialDetails(formattedData);
            } else if (reportType === "Informe de salida de material") {
                const materials = splitField(reportData.nombre_material);
                const quantities = splitField(reportData.cantidad);
                const dates = splitField(reportData.fecha_salida);
                const users = splitField(reportData.usuario);
                const reasons = splitField(reportData.motivo_salida);

                formattedData = materials.map((material, index) => ({
                    name: material,
                    value: parseInt(quantities[index], 10) || 0,
                    fecha: dates[index] || "Sin fecha",
                    usuario: users[index] || "Desconocido",
                    motivo: reasons[index] || "Sin motivo",
                    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                }));
                setMaterialDetails(formattedData);
            }

            setChartData(formattedData);
        } else {
            setChartData([]);
        }
    }, [reportData, reportType]);



    const [startDate, endDate] = dateRange.split(' - '); // Dividimos las dos fechas
    const formattedStartDate = startDate ? format(new Date(startDate), 'dd/MM/yyyy') : 'N/A';
    const formattedEndDate = endDate ? format(new Date(endDate), 'dd/MM/yyyy') : 'N/A';
    // Obtener valores únicos de `selectedOption` y `selectedOption1`
    const uniqueSelectedOption = Array.from(new Set(selectedOption.split(', '))).join(', ');
    const uniqueSelectedOption1 = Array.from(new Set(selectedOption1.split(', '))).join(', ');

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    if (!reportData || !isOpen) return null;

    const chartConfig = {
        value1: {
            label: "Series 1",
            color: "hsl(var(--chart-1))",
        },
        value2: {
            label: "Series 2",
            color: "hsl(var(--chart-2))",
        },
        value: {
            label: "Cantidad",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
                >
                    <motion.div
                        key="modal-content"
                        className="flex flex-col w-full max-w-4xl h-auto shadow-xl relative bg-sipe-blue-dark rounded-3xl p-10"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute top-4 right-4 text-sipe-white cursor-pointer">
                            <X size={20} strokeWidth={4} onClick={onClose} />
                        </div>

                        {/* Título del Informe */}
                        <h1 className="text-center text-4xl font-bold text-sipe-white mb-4">{reportType}</h1>

                        {/* Mostrar subtítulos según el tipo de informe */}
                        {reportType === "Informe de inventario general" && (
                            <h3 className="text-center text-lg font-medium text-sipe-white mb-4">
                                {formattedStartDate} - {formattedEndDate}
                            </h3>
                        )}

                        {reportType === "Informe de material por estado" && (
                            <h3 className="text-center text-lg font-medium text-sipe-white mb-4">
                                Estado: {uniqueSelectedOption1} <br />
                                {formattedStartDate} - {formattedEndDate}
                            </h3>
                        )}

                        {reportType === "Informe de material por movimiento entre deposito" && (
                            <h3 className="text-center text-lg font-medium text-sipe-white mb-4">
                                Material: {selectedMaterial} <br />
                                {formattedStartDate} - {formattedEndDate}
                            </h3>
                        )}

                        {reportType === "Informe de salida de material" && (
                            <h3 className="text-center text-lg font-medium text-sipe-white mb-4">
                                Material: {selectedMaterial} <br />
                                {formattedStartDate} - {formattedEndDate}
                            </h3>
                        )}

                        {reportType === "Informe de material por deposito" && (
                            <h3 className="text-center text-lg font-medium text-sipe-white mb-4">
                                Depósito: {uniqueSelectedOption} <br /> {/* Mostrar el depósito seleccionado */}
                                {formattedStartDate} - {formattedEndDate}
                            </h3>
                        )}

                        {/* Contenedor del gráfico */}
                        <div className="w-full flex justify-center items-center">
                            <ChartContainer config={chartConfig} className="w-full">
                                {tipoGrafico === "Barra" && (
                                    <BarChart
                                        data={chartData}
                                        width={700}
                                        height={400}
                                        margin={{ top: 20, left: 0, right: 0 }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tickFormatter={(value) => value}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="var(--color-value)"
                                            radius={8}
                                            isAnimationActive={true}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                            <LabelList
                                                dataKey="value"
                                                position="top"
                                                offset={10}
                                                className="fill-sipe-white"
                                                fontSize={12}
                                                fontWeight="bold"
                                            />
                                        </Bar>
                                    </BarChart>
                                )}

                                {tipoGrafico === "Torta" && (
                                    <PieChart width={500} height={500}>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={chartData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={100}
                                            outerRadius={200}
                                            strokeWidth={5}
                                            isAnimationActive={true}
                                            label={({ name, value, cx, cy, midAngle, outerRadius }) => {
                                                const RADIAN = Math.PI / 180;
                                                const x = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
                                                const y = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        textAnchor={x > cx ? 'start' : 'end'}
                                                        dominantBaseline="central"
                                                        className="font-bold fill-sipe-white"
                                                    >
                                                        {`${name} Cantidad:${value}`}
                                                    </text>
                                                );
                                            }}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                            <Label
                                                content={({ viewBox }) => {
                                                    const totalMaterials = reportData.length;
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                            >
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={viewBox.cy}
                                                                    className="fill-sipe-white text-3xl font-bold"
                                                                >
                                                                    {totalMaterials} {/* Mostrar la cantidad total de materiales */}
                                                                </tspan>
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={(viewBox.cy || 0) + 24}
                                                                    className="fill-sipe-white font-bold"
                                                                >
                                                                    Materiales
                                                                </tspan>
                                                            </text>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </Pie>
                                    </PieChart>
                                )}


                                {tipoGrafico === "Area" && (
                                    <AreaChart
                                        data={chartData}
                                        width={700}
                                        height={400}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => value}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Area
                                            dataKey="value"
                                            name="Cantidad Material"
                                            type="natural"
                                            fill="var(--color-value1)"
                                            fillOpacity={0.4}
                                            stroke="var(--color-value1)"
                                            stackId="a"
                                        />
                                    </AreaChart>
                                )}
                            </ChartContainer>
                        </div>

                        {/* Detalles del informe debajo del gráfico */}
                        <div className="bg-sipe-orange-dark rounded-xl mt-8 p-4 flex flex-col justify-center items-center w-full text-sipe-white">
                            <h2 className="text-center text-2xl font-bold mb-2">Detalle del Informe</h2>
                            <p className="font-bold">Total de registros: {reportData.length}</p>

                            {/* Detalles adicionales para los informes de salida de material y movimientos */}
                            {reportType === "Informe de salida de material" && (
                                <div className="mt-4 w-full">
                                    <h3 className="text-center font-bold">Detalles de Salidas:</h3>
                                    <ul className="list-disc pl-5">
                                        {materialDetails.map((item, index) => (
                                            <li key={index} className="text-sipe-white">
                                                Material: {item.name}, Cantidad: {item.value}, Fecha: {item.fecha}, Usuario: {item.usuario}, Motivo: {item.motivo}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {reportType === "Informe de material por movimiento entre deposito" && (
                                <div className="mt-4 w-full">
                                    <h3 className="text-center font-bold">Detalles de Movimientos:</h3>
                                    <ul className="list-disc pl-5">
                                        {materialDetails.map((item, index) => (
                                            <li key={index} className="text-sipe-white">
                                                Material: {item.nombreMaterial}, Cantidad: {item.value}, Origen: {item.depositoOrigen}, Destino: {item.depositoDestino}, Fecha: {item.fechaMovimiento}, Usuario: {item.usuario}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <p className="text-center">El gráfico muestra la cantidad de datos relacionados con el informe seleccionado.</p>
                        </div>

                        {/* Botón Cerrar */}
                        <div className="flex justify-center mt-4">
                            <Button variant="sipebutton" size="sipebutton" onClick={onClose} className="w-1/3">
                                CERRAR
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ReportDetailModal;
