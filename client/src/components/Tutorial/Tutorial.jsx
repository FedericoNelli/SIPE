import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DepositForm from '@/components/Deposit/DepositForm';
import CategoryForm from '@/components/Category/CategoryForm';
import AisleForm from '@/components/Aisle/AisleForm';
import ShelfForm from '@/components/Shelf/ShelfForm';
import Stepper from '@/components/Stepper/Stepper';
import { Button } from '../Common/Button/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/Common/Cards/Card";

const Tutorial = ({ notify }) => {
    const navigate = useNavigate();
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // Iniciar en el paso 1 (número)
    const [ubicacionId, setUbicacionId] = useState(null); // Guardamos el idUbicacion
    const [depositoId, setDepositoId] = useState(null);   // Guardamos el idDeposito
    const [categoriaId, setCategoriaId] = useState(null);
    const [pasilloId, setPasilloId] = useState(null);
    const [estanteriaId, setEstanteriaId] = useState(null);
    const totalSteps = 5;
    const [sides, setSides] = useState([]);
    const [aisles, setAisles] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [depositos, setDepositos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [estanterias, setEstanterias] = useState([]);

    // Agregar manejo de localStorage
    useEffect(() => {
        // Recuperamos los valores desde localStorage si existen
        const savedCurrentStep = JSON.parse(localStorage.getItem('currentStep'));
        const savedDepositoId = JSON.parse(localStorage.getItem('depositoId'));
        const savedCategoriaId = JSON.parse(localStorage.getItem('categoriaId'));
        const savedPasilloId = JSON.parse(localStorage.getItem('pasilloId'));
        const savedEstanteriaId = JSON.parse(localStorage.getItem('estanteriaId'));

        if (savedCurrentStep) setCurrentStep(savedCurrentStep);
        if (savedDepositoId) setDepositoId(savedDepositoId);
        if (savedCategoriaId) setCategoriaId(savedCategoriaId);
        if (savedPasilloId) setPasilloId(savedPasilloId);
        if (savedEstanteriaId) setEstanteriaId(savedEstanteriaId);
    }, []);

    useEffect(() => {
        localStorage.setItem('inTutorial', 'true');
        return () => {
            localStorage.setItem('inTutorial', 'false');
        };
    }, []);

    // Guardar los cambios de los valores en localStorage cuando se actualizan
    useEffect(() => {
        localStorage.setItem('currentStep', JSON.stringify(currentStep));
    }, [currentStep]);

    useEffect(() => {
        const savedUbicacionId = JSON.parse(localStorage.getItem('ubicacionId'));
        if (savedUbicacionId) setUbicacionId(savedUbicacionId);
    }, []);


    useEffect(() => {
        localStorage.setItem('depositoId', JSON.stringify(depositoId));
    }, [depositoId]);

    useEffect(() => {
        localStorage.setItem('categoriaId', JSON.stringify(categoriaId));
    }, [categoriaId]);

    useEffect(() => {
        localStorage.setItem('pasilloId', JSON.stringify(pasilloId));
    }, [pasilloId]);

    useEffect(() => {
        localStorage.setItem('estanteriaId', JSON.stringify(estanteriaId));
    }, [estanteriaId]);

    useEffect(() => {
        localStorage.setItem('currentStep', JSON.stringify(currentStep));
    }, [currentStep]);

    useEffect(() => {
        const savedCurrentStep = JSON.parse(localStorage.getItem('currentStep'));
        if (savedCurrentStep) setCurrentStep(savedCurrentStep);
    }, []);

    useEffect(() => {
        // Chequeamos si estamos en el paso 5 y si ya recargamos la página
        if (currentStep === 5 && !localStorage.getItem('reloaded')) {
            localStorage.setItem('reloaded', 'true'); // Marcamos que ya recargamos
            window.location.reload(); // Forzamos la recarga
        }
    }, [currentStep]);

    useEffect(() => {
        const userId = localStorage.getItem('id');
        axios.get(`http://localhost:8081/check-tutorial-status/${userId}`)
            .then(response => {
                const { showTutorial, steps } = response.data;
                if (showTutorial) {
                    setShowTutorial(true);
                    determineFirstStep(steps);
                }
            })
            .catch(error => {
                console.error('Error al verificar el estado del tutorial:', error);
                notify('error', 'Error al verificar el estado del tutorial');
            });
    }, [notify]);

    useEffect(() => {
        axios.get('http://localhost:8081/aisles')
            .then(response => {
                setAisles(response.data);
            })
            .catch(error => {
                console.error('Error fetching aisles:', error);
                notify('error', 'Error al cargar pasillos');
            });

        axios.get('http://localhost:8081/deposit-locations')
            .then(response => {
                setUbicaciones(response.data);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
                notify('error', 'Error al cargar ubicaciones');
            });

        axios.get('http://localhost:8081/sides')
            .then(response => {
                setSides(response.data);
            })
            .catch(error => {
                console.error('Error fetching sides:', error);
                notify('error', 'Error al cargar lados');
            });

        axios.get('http://localhost:8081/deposits')
            .then(response => {
                setDepositos(response.data);
            })
            .catch(error => {
                console.error('Error al obtener depósitos:', error);
                notify('error', 'Error al cargar depósitos');
            });

        axios.get('http://localhost:8081/categories')
            .then(response => {
                setCategorias(response.data);
            })
            .catch(error => {
                console.error('Error al obtener categorias:', error);
                notify('error', 'Error al cargar categorias');
            });

        axios.get('http://localhost:8081/shelves')
            .then(response => {
                setEstanterias(response.data);
            })
            .catch(error => {
                console.error('Error al obtener estanterias:', error);
                notify('error', 'Error al cargar estanterias');
            });
    }, [notify]);

    const determineFirstStep = (steps) => {
        if (steps.deposito) setCurrentStep(1);
        else if (steps.categoria) setCurrentStep(2);
        else if (steps.pasillo) setCurrentStep(3);
        else if (steps.estanteria) setCurrentStep(4);
        else if (steps.confirmStep) setCurrentStep(5);
    };

    const handleNextStep = (newUbicacionId, newDepositoId, newCategoriaId, newPasilloId, newEstanteriaId) => {
        if (newUbicacionId) {
            setUbicacionId(newUbicacionId);
            localStorage.setItem('ubicacionId', JSON.stringify(newUbicacionId));
        }
        if (newDepositoId) {
            setDepositoId(newDepositoId);
            localStorage.setItem('depositoId', JSON.stringify(newDepositoId));
        }
        if (newCategoriaId) {
            setCategoriaId(newCategoriaId);
            localStorage.setItem('categoriaId', JSON.stringify(newCategoriaId));
        }
        if (newPasilloId) {
            setPasilloId(newPasilloId);
            localStorage.setItem('pasilloId', JSON.stringify(newPasilloId));
        }
        if (newEstanteriaId) {
            setEstanteriaId(newEstanteriaId);
            localStorage.setItem('estanteriaId', JSON.stringify(newEstanteriaId));
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTutorial();
        }
    };

    const handleCancel = async () => {
        if (estanteriaId) {
            try {
                // Primero verificar si hay espacios ocupados en la estantería
                const { data: espacios } = await axios.get(`http://localhost:8081/spaces/${estanteriaId}`);
                const espaciosOcupados = espacios.filter(espacio => espacio.ocupado);

                if (espaciosOcupados.length > 0) {
                    notify('error', "No se puede eliminar la estantería porque tiene espacios ocupados");
                    return;
                }

                // Si no hay espacios ocupados, eliminar la estantería
                await axios.delete('http://localhost:8081/delete-shelves', {
                    data: { shelfIds: [estanteriaId] } // Enviamos un array con el ID de la estantería
                })
                    .then(response => {
                        console.log('Respuesta del servidor:', response.data); // Verificar la respuesta del servidor
                        notify('info', "Estantería eliminada. Volviendo al paso anterior...");
                    })
                    .catch(error => {
                        console.error('Error en la solicitud:', error.response?.data || error.message); // Mostrar el error detallado
                        notify('error', "No se pudo eliminar la estantería. Intenta nuevamente.");
                    });
            } catch (error) {
                console.error('Error al eliminar la estantería', error); // Verificar cualquier otro error
                notify('error', "No se pudo eliminar la estantería. Intenta nuevamente.");
            }
        }
        handlePreviousStep();
    };


    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            localStorage.removeItem('ubicacionId');
            localStorage.removeItem('depositoId');
            localStorage.removeItem('pasilloId');
            localStorage.removeItem('estanteriaId');
            localStorage.removeItem('categoriaId');
            localStorage.removeItem('reloaded');
        }
    };


    const completeTutorial = () => {
        const userId = localStorage.getItem('id');
        axios.patch(`http://localhost:8081/complete-tutorial/${userId}`)
            .then(() => {
                setShowTutorial(false);
                localStorage.setItem('firstLogin', '0');
                localStorage.removeItem('ubicacionId');
                localStorage.removeItem('depositoId');
                localStorage.removeItem('categoriaId');
                localStorage.removeItem('pasilloId');
                localStorage.removeItem('estanteriaId');
                localStorage.removeItem('currentStep');
                
                setTimeout(() => {
                    navigate('/dshb');
                }, 500);
            })
            .catch((error) => {
                console.error('Error al completar el tutorial:', error);
                notify('error', 'Hubo un error al completar el tutorial');
            });
    };

    const pageVariants = {
        initial: {
            opacity: 0,
            x: 300,
            y: 0
        },
        in: {
            opacity: 1,
            x: 0,
            y: 0
        },
        out: {
            opacity: 0,
            x: -300,
            y: 0
        }
    };

    const pageTransition = {
        type: "tween",
        ease: "easeOut",
        duration: 0.5
    };

    if (!showTutorial) return null;

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen">
            {/* Modal con Stepper debajo */}
            <div className="relative z-10 mb-8">

                {/* Agregamos el key dinámico aquí */}
                <div key={currentStep}>
                    <motion.div
                        key={currentStep} // Cambia la key con cada paso para activar la animación
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        {/* Renderizado de los formularios según currentStep numérico */}
                        {currentStep === 1 && (
                            <DepositForm
                                onSubmit={handleNextStep}
                                notify={notify}
                                isTutorial={true}
                                currentStep={currentStep}
                                handlePreviousStep={handlePreviousStep}
                                ubicacionId={ubicacionId} // PASAMOS idUbicacion
                            />
                        )}
                        {currentStep === 2 && (
                            <CategoryForm
                                onSubmit={handleNextStep}
                                notify={notify}
                                isTutorial={true}
                                currentStep={currentStep}
                                handlePreviousStep={handlePreviousStep}
                                ubicacionId={ubicacionId}  // PASAMOS idUbicacion
                                depositoId={depositoId}    // PASAMOS idDeposito
                            />
                        )}
                        {currentStep === 3 && (
                            <AisleForm
                                onSubmit={handleNextStep}
                                notify={notify}
                                isTutorial={true}
                                currentStep={currentStep}
                                handlePreviousStep={handlePreviousStep}
                                ubicacionId={ubicacionId}  // PASAMOS idUbicacion
                                depositoId={depositoId}    // PASAMOS idDeposito
                                categoriaId={categoriaId} // PASAMOS idCategoria
                            />
                        )}
                        {currentStep === 4 && (
                            <ShelfForm
                                onSubmit={handleNextStep}
                                notify={notify}
                                isTutorial={true}
                                currentStep={currentStep}
                                handlePreviousStep={handlePreviousStep}
                                ubicacionId={ubicacionId}  // PASAMOS idUbicacion
                                depositoId={depositoId}    // PASAMOS idDeposito
                                categoriaId={categoriaId} // PASAMOS idCategoria
                                pasilloId={pasilloId}
                            />
                        )}
                        {currentStep === 5 && (
                            <div className='bg-sipe-blue-dark rounded-lg'>
                                <div className="bg-sipe-blue-dark text-white rounded-lg pt-8 px-12">
                                    <h2 className="text-3xl font-bold mb-4 text-center">Confirmación de datos</h2>
                                    <div className="flex flex-row items-center mb-4 gap-10">

                                        {/* Card de Ubicación */}
                                        <Card className="bg-sipe-blue-light text-sipe-white">
                                            <CardHeader>
                                                <strong className="text-center text-xl h-2">Ubicación</strong>
                                            </CardHeader>
                                            <CardContent className="text-center">
                                                <span>
                                                    {ubicaciones.find(u => u.id === ubicacionId)?.nombre}
                                                </span>
                                            </CardContent>
                                        </Card>

                                        {/* Card de Depósito */}
                                        <Card className="bg-sipe-blue-light text-sipe-white">
                                            <CardHeader>
                                                <strong className="text-center text-xl h-2">Depósito</strong>
                                            </CardHeader>
                                            <CardContent className="text-center">
                                                <span>
                                                    {depositos.find(d => d.id === depositoId)?.nombreDeposito}
                                                </span>
                                            </CardContent>
                                        </Card>

                                        {/* Card de Categoría */}
                                        <Card className="bg-sipe-blue-light text-sipe-white">
                                            <CardHeader>
                                                <strong className="text-center text-xl h-2">Categoría</strong>
                                            </CardHeader>
                                            <CardContent className="text-center">
                                                <span>
                                                    {categorias.find(c => c.id === categoriaId)?.descripcion}
                                                </span>
                                            </CardContent>
                                        </Card>

                                        {/* Card de Pasillo */}
                                        <Card className="bg-sipe-blue-light text-sipe-white">
                                            <CardHeader>
                                                <strong className="text-center text-xl h-2">Pasillo</strong>
                                            </CardHeader>
                                            <CardContent className="text-center">
                                                <span>
                                                    {aisles.find(p => p.id === pasilloId)?.numero}
                                                </span>
                                            </CardContent>
                                        </Card>

                                        {/* Card de Estantería */}
                                        <Card className="bg-sipe-blue-light text-sipe-white">
                                            <CardHeader>
                                                <strong className="text-center text-xl h-2">Estantería</strong>
                                            </CardHeader>
                                            <CardContent className="text-center">
                                                <span>
                                                    {estanterias.find(e => e.id === estanteriaId)?.numero}
                                                </span>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Footer con botones */}
                                <CardFooter className="flex justify-center gap-2">
                                    <Button onClick={handleCancel} variant="sipebuttonalt" size="sipebutton">VOLVER</Button>
                                    <Button onClick={completeTutorial} variant="sipebutton" size="sipebutton">CONFIRMAR</Button>
                                </CardFooter>
                            </div>
                        )}

                    </motion.div>
                </div>
            </div>

            {/* Stepper colocado debajo del modal, con espacio */}
            <div className="absolute bottom-6 w-full flex justify-center">
                <Stepper currentStep={currentStep} totalSteps={totalSteps} />
            </div>
        </div>
    );

};

export default Tutorial;
