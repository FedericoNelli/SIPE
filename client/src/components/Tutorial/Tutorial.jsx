import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LocationForm from '@/components/Location/LocationForm';
import DepositForm from '@/components/Deposit/DepositForm';
import CategoryForm from '@/components/Category/CategoryForm';
import AisleForm from '@/components/Aisle/AisleForm';
import ShelfForm from '@/components/Shelf/ShelfForm';

const Tutorial = ({ notify }) => {
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Marcar que estamos en el tutorial
        localStorage.setItem('inTutorial', 'true');
        
        return () => {
            // Limpiar cuando el componente se desmonte
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
    }, []);

    const determineFirstStep = (steps) => {
        if (steps.ubicacion) setCurrentStep('ubicacion');
        else if (steps.deposito) setCurrentStep('deposito');
        else if (steps.categoria) setCurrentStep('categoria');
        else if (steps.pasillo) setCurrentStep('pasillo');
        else if (steps.estanteria) setCurrentStep('estanteria');
    };

    const handleNextStep = () => {
        switch (currentStep) {
            case 'ubicacion':
                setCurrentStep('deposito');
                break;
            case 'deposito':
                setCurrentStep('categoria');
                break;
            case 'categoria':
                setCurrentStep('pasillo');
                break;
            case 'pasillo':
                setCurrentStep('estanteria');
                break;
            default:
                console.log("Completing tutorial..."); // Depuración
                completeTutorial();
                return; // Salir de la función si se completa el tutorial
        }
    
        const userId = localStorage.getItem('id');
        axios.get(`http://localhost:8081/check-tutorial-status/${userId}`)
            .then(response => {
                const { steps } = response.data;
                const allStepsCompleted = !steps.ubicacion && !steps.deposito && !steps.categoria && !steps.pasillo && !steps.estanteria;
                
                if (allStepsCompleted) {
                    completeTutorial();
                }
            })
            .catch(error => {
                console.error('Error al verificar los pasos restantes del tutorial:', error);
                notify('error', 'Error al verificar los pasos restantes del tutorial');
            });
    };
    
    const completeTutorial = () => {
        const userId = localStorage.getItem('id');
        axios.patch(`http://localhost:8081/complete-tutorial/${userId}`)
            .then(() => {
                notify('success', 'Tutorial completado');
                setShowTutorial(false);
                localStorage.setItem('firstLogin', '0'); // Actualiza localStorage
    
                setTimeout(() => {
                    navigate('/dshb'); // Redirige al dashboard después de completar el tutorial
                }, 500); // Ajusta un pequeño delay si es necesario para que el toast aparezca
            })
            .catch((error) => {
                console.error('Error al completar el tutorial:', error);
                notify('error', 'Hubo un error al completar el tutorial');
            });
    };
    
    
    const getStepMessage = () => {
        switch (currentStep) {
            case 'ubicacion':
                return "Por favor, cree la primera ubicación.";
            case 'deposito':
                return "Por favor, cree el primer depósito.";
            case 'categoria':
                return "Por favor, cree la primera categoría.";
            case 'pasillo':
                return "Por favor, cree el primer pasillo.";
            case 'estanteria':
                return "Por favor, cree la primera estantería.";
            default:
                return "";
        }
    };

    if (!showTutorial) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-xl font-bold text-sipe-white mb-4">{getStepMessage()}</h1>
            {currentStep === 'ubicacion' && <LocationForm onSubmit={handleNextStep} notify={notify}  />}
            {currentStep === 'deposito' && <DepositForm onSubmit={handleNextStep} notify={notify}  />}
            {currentStep === 'categoria' && <CategoryForm onSubmit={handleNextStep} notify={notify}  />}
            {currentStep === 'pasillo' && <AisleForm onSubmit={handleNextStep} notify={notify}  />}
            {currentStep === 'estanteria' && <ShelfForm onSubmit={handleNextStep} notify={notify}  />}
        </div>
    );
};

export default Tutorial;
