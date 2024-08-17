
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Common/Cards/Card";
import { Button } from "@/components/Common/Button/Button";


function CustomCard({ colSpan = 1, title, totalElement, buttonText, additionalDescription, Icon, onButtonClick, buttonDisabled }) {
    const colSpanClass = `col-span-${colSpan}`;

    return (
        <Card className={`flex flex-col items-center justify-center bg-sipe-white bg-opacity-10 shadow-[6px_6px_8px_rgba(0,0,0,0.25)] text-sipe-white ${colSpanClass}`}>
            <CardHeader className="flex flex-col items-center">
                {Icon && <Icon size={76} color="#FFB162" />}
                <CardTitle className="text-2xl font-light">{title}</CardTitle>
                <CardDescription className="text-4xl font-bold">{totalElement}</CardDescription>
                {additionalDescription && (
                    <CardDescription className="text-xl text-center w-5/6 font-thin">{additionalDescription}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex justify-center">
                <Button 
                    className="bg-sipe-orange-light text-white text-lg hover:bg-sipe-orange-light-variant" 
                    onClick={onButtonClick} 
                    disabled={buttonDisabled}
                >
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
}

export default CustomCard;
