import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

const Map = ({ pasillo, estanteria, estantes, divisiones, objetoEstante, objetoDivision }) => {
    const cellWidth = 70;
    const cellHeight = 35;
    const fontSize = 16;
    const objectFontSize = 20;
    const fontFamily = 'Poppins, sans-serif';

    return (
        <div className="flex justify-center items-center max-w-full max-h-full overflow-hidden">
            <Stage width={divisiones * cellWidth + 50} height={estantes * cellHeight + 75}>
                <Layer>
                    <Text
                        x={-5}
                        y={cellHeight * (estantes / 2) + 90}
                        text="Estante"
                        fontSize={14}
                        fill="white"
                        rotation={-90}
                        offsetX={-10}
                        offsetY={-10}
                        fontFamily={fontFamily}
                    />
                    <Text
                        x={cellWidth * (divisiones / 2)}
                        y={27}
                        text="División"
                        fontSize={14}
                        fill="white"
                        fontFamily={fontFamily}
                    />
                    
                    {Array.from({ length: estantes }).map((_, estanteIndex) =>
                        Array.from({ length: divisiones }).map((_, divisionIndex) => {
                            const x = divisionIndex * cellWidth + 30;
                            const y = estanteIndex * cellHeight + 50;
                            const divisionNumber = estanteIndex * divisiones + divisionIndex + 1;
                            return (
                                <React.Fragment key={`estante-${estanteIndex}-division-${divisionIndex}`}>
                                    <Rect
                                        x={x}
                                        y={y}
                                        width={cellWidth}
                                        height={cellHeight}
                                        fill="#A35139"
                                        stroke="#1B2632"
                                        strokeWidth={1}
                                    />
                                    
                                    <Text
                                        x={x + 5}
                                        y={y + 5}
                                        text={divisionNumber}
                                        fontSize={10}
                                        fill="white"
                                        fontFamily={fontFamily}
                                    />
                                    
                                    {objetoEstante === estanteIndex + 1 && objetoDivision === divisionIndex + 1 && (
                                        <Text
                                            x={x + cellWidth / 2}
                                            y={y + cellHeight / 2}
                                            text="O"
                                            offsetX={fontSize / 2}
                                            offsetY={fontSize / 2}
                                            fontSize={objectFontSize}
                                            fill="white"
                                            fontStyle="bold"
                                            fontFamily={fontFamily}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default Map;
