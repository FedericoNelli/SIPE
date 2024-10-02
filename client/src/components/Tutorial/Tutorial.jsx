import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LocationForm from '@/components/Location/LocationForm';
import DepositForm from '@/components/Deposit/DepositForm';
import CategoryForm from '@/components/Category/CategoryForm';
import AisleForm from '@/components/Aisle/AisleForm';
import ShelfForm from '@/components/Shelf/ShelfForm';
import Stepper from '@/components/Stepper/Stepper';


const Tutorial = ({ notify }) => {
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // Iniciar en el paso 1 (número)
    const [ubicacionId, setUbicacionId] = useState(null); // Guardamos el idUbicacion
    const [depositoId, setDepositoId] = useState(null);   // Guardamos el idDeposito
    const [categoriaId, setCategoriaId] = useState(null);
    const [pasilloId, setPasilloId] = useState(null);
    const [estanteriaId, setEstanteriaId] = useState(null);
    const navigate = useNavigate();
    const totalSteps = 5;

    useEffect(() => {
        localStorage.setItem('inTutorial', 'true');
        return () => {
            localStorage.setItem('inTutorial', 'false');
        };
    }, []);

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

    const determineFirstStep = (steps) => {
        if (steps.ubicacion) setCurrentStep(1);
        else if (steps.deposito) setCurrentStep(2);
        else if (steps.categoria) setCurrentStep(3);
        else if (steps.pasillo) setCurrentStep(4);
        else if (steps.estanteria) setCurrentStep(5);
    };

    const handleNextStep = (newUbicacionId, newDepositoId, newCategoriaId, newPasilloId, newEstanteriaId) => {
        if (newUbicacionId) {
            setUbicacionId(newUbicacionId); // Guardamos el idUbicacion cuando se crea
        }
        if (newDepositoId) {
            setDepositoId(newDepositoId); // Guardamos el idDeposito cuando se crea
        }
        if (newCategoriaId) {
            setCategoriaId(newCategoriaId); // Guardamos el idCategoria cuando se crea
        }
        if (newPasilloId){
            setPasilloId(newPasilloId);
        }
        if (newEstanteriaId){
            setEstanteriaId(newEstanteriaId);
        }
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTutorial();
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeTutorial = () => {
        const userId = localStorage.getItem('id');
        axios.patch(`http://localhost:8081/complete-tutorial/${userId}`)
            .then(() => {
                notify('success', 'Tutorial completado');
                setShowTutorial(false);
                localStorage.setItem('firstLogin', '0');

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

                <motion.div
                    key={currentStep} // Cambia la key con cada paso para activar la animación
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                >
                    {/* Renderizado de los formularios según currentStep numérico */}
                    {currentStep === 1 && <LocationForm onSubmit={handleNextStep} notify={notify} isTutorial={true} />}
                    {currentStep === 2 && (
                        <DepositForm
                            onSubmit={handleNextStep}
                            notify={notify}
                            isTutorial={true}
                            currentStep={currentStep}
                            handlePreviousStep={handlePreviousStep}
                            ubicacionId={ubicacionId} // PASAMOS idUbicacion
                        />
                    )}
                    {currentStep === 3 && (
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
                    {currentStep === 4 && (
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
                    {currentStep === 5 && (
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
                </motion.div>
            </div>

            {/* Stepper colocado debajo del modal, con espacio */}
            <div className="absolute bottom-6 w-full flex justify-center">
                <Stepper currentStep={currentStep} totalSteps={totalSteps} />
            </div>
        </div>
    );
};

export default Tutorial;
