import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, Cell, LabelList, Pie, PieChart, Label } from "recharts";
import { X } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/Common/Chart/Chart";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/Common/Button/Button";

function ReportModalDetail({ isOpen, onClose, reportData, reportType, tipoGrafico, selectedMaterial, dateRange, selectedOption, selectedDeposito, selectedEstado }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (Array.isArray(reportData) && reportData.length > 0) {
            let formattedData = [];

            if (reportType === "Informe de inventario general") {
                // Mapeo de datos para el Informe de inventario general
                formattedData = reportData.map((item) => ({
                    name: item.nombre || "Sin nombre",
                    value: item.cantidad || 0,
                    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Genera un color aleatorio
                }));
            } else if (reportType === "Informe de material por depósito") {
                formattedData = reportData.map((item) => ({
                    name: item.nombre || "Sin nombre",
                    value: item.cantidad || 0,
                    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                }));
            } else if (reportType === "Informe de material por estado") {
                const groupedData = reportData.reduce((acc, item) => {
                    const estado = item.estadoDescripcion || "Sin estado";
                    const existing = acc.find((data) => data.name === estado);

                    if (existing) {
                        existing.value += item.cantidad;
                        existing.materials += `, ${item.nombre} (${item.cantidad})`; // Agrega el nombre del material y la cantidad
                    } else {
                        acc.push({
                            name: estado,
                            value: item.cantidad || 0,
                            materials: `${item.nombre} (${item.cantidad})`, // Agrega el nombre del material y la cantidad
                            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                        });
                    }
                    return acc;
                }, []);
                formattedData = groupedData;
            }

            console.log('Datos formateados para el gráfico (después de formatear):', formattedData);
            setChartData(formattedData);
        } else {
            console.log('reportData no es un array o está vacío:', reportData);
            setChartData([]);
        }
    }, [reportData, reportType]);


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
                                {dateRange}
                            </h3>
                        )}

                        {reportType === "Informe de material por estado" && (
                            <h3 className="text-center text-lg font-medium text-sipe-white mb-4">
                                Estado: {selectedEstado} <br />
                                {dateRange}
                            </h3>
                        )}

                        {reportType === "Informe de material por movimiento entre depósito" && (
                            <h3 className="text-center text-lg font-medium text-sipe-white mb-4">
                                Material: {selectedMaterial} <br />
                                {dateRange}
                            </h3>
                        )}

                        {reportType === "Informe de material por depósito" && (
                            <h3 className="text-center text-lg font-medium text-sipe-white mb-4">
                                Depósito: {selectedDeposito} <br /> {/* Mostrar el depósito seleccionado */}
                                {dateRange}
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
                                                dataKey="name" // Mostrar el nombre del estado
                                                position="top"
                                                offset={10}
                                                className="fill-foreground text-sipe-white"
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
                                            nameKey="name" // Utilizar "name" para mostrar el estado
                                            innerRadius={100}
                                            outerRadius={200}
                                            strokeWidth={5}
                                            isAnimationActive={true}
                                            label={({ name, value }) => `${name}: ${value}`} // Mostrar el nombre del estado y la cantidad total
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
                                                                    className="fill-foreground text-3xl font-bold"
                                                                >
                                                                    {totalMaterials} {/* Mostrar la cantidad total de materiales */}
                                                                </tspan>
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={(viewBox.cy || 0) + 24}
                                                                    className="fill-muted-foreground"
                                                                >
                                                                    Materiales {/* Texto debajo del número */}
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
                                            dataKey="value" // Cambiado de 'value1' a 'value'
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

export default ReportModalDetail;
