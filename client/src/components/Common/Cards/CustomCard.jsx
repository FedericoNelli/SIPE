import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Common/Cards/Card";
import { Button } from "@/components/Common/Button/Button";
import { useState, useEffect } from "react";

const colSpanClasses = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
};

function CustomCard({ 
    colSpan = 1, 
    title, 
    totalElement, 
    buttonText, 
    additionalDescription, 
    Icon, 
    onButtonClick, 
    buttonDisabled 
}) {
    const colSpanClass = colSpanClasses[colSpan] || colSpanClasses[1]; // Fallback a col-span-1 si colSpan es inválido

    // Tamaño del icono responsivo
    const [iconSize, setIconSize] = useState(48);

    useEffect(() => {
        const updateSize = () => {
            if (window.innerWidth >= 1536) {
                setIconSize(76); // Tamaño para 2xl
            } else {
                setIconSize(48); // Tamaño base
            }
        };

        updateSize(); // Ajuste inicial
        window.addEventListener("resize", updateSize); // Escucha cambios de tamaño de pantalla

        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return (
        <Card className={`flex flex-col items-center justify-center bg-sipe-white bg-opacity-10 shadow-[6px_6px_8px_rgba(0,0,0,0.25)] text-sipe-white ${colSpanClass}`}>
            <CardHeader className="flex flex-col items-center">
                {Icon && <Icon size={iconSize} color="#FFB162" />} {/* Icono responsivo */}
                <CardTitle className="text-base 2xl:text-2xl font-light">{title}</CardTitle>
                <CardDescription className="text-2xl 2xl:text-4xl font-bold">{totalElement}</CardDescription>
                {additionalDescription && (
                    <CardDescription className="text-base 2xl:text-xl text-center w-5/6 font-thin">{additionalDescription}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex justify-center">
                <Button
                    className="bg-sipe-orange-light text-white text-lg hover:bg-sipe-orange-light-variant"
                    onClick={onButtonClick}
                    disabled={buttonDisabled}
                    aria-disabled={buttonDisabled} // Mejora accesibilidad
                >
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
}

export default CustomCard;
