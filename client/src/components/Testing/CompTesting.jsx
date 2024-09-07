import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import axios from "axios" // Asegúrate de tener axios instalado

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/Common/Cards/Card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/Common/Chart/Chart"

export function CompTesting() {
    const [chartData, setChartData] = React.useState([]);
    const [totalmaterials, setTotalmaterials] = React.useState(0);

    // UseEffect para obtener los datos de la base de datos
    React.useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const response = await axios.get('http://localhost:8081/materials');
                const materials = response.data.map(item => ({
                    material: item.nombre,
                    materials: item.cantidad,
                    fill: getRandomColor() // Puedes definir una función para asignar colores
                }));
                setChartData(materials);

                // Calcular el total
                const total = materials.reduce((acc, curr) => acc + curr.materials, 0);
                setTotalmaterials(total);
            } catch (error) {
                console.error('Error fetching materials', error);
            }
        };
        
        fetchMaterials();
    }, []);

    // Función para generar colores aleatorios (puedes personalizarla)
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    return (
        <Card className="flex flex-col bg-yellow-100">
            <CardHeader className="items-center pb-0">
                <CardTitle>Pie Chart - Donut with Text</CardTitle>
                <CardDescription className="text-sipe-blue-dark">January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="materials"
                            nameKey="material"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
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
                                                    {totalmaterials.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Institutos
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total materials for the last 6 months
                </div>
            </CardFooter>
        </Card>
    )
}
