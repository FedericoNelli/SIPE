import { motion } from 'framer-motion';

const Stepper = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex flex-col items-center space-y-6">

            <div className="flex space-x-4 relative">
                {[...Array(totalSteps)].map((_, index) => (
                    <div key={index} className="relative flex items-center">

                        {/* Línea que conecta los pasos */}
                        {index < totalSteps - 1 && (
                            <motion.div
                                className=""
                                initial={{ backgroundColor: 'rgb(253, 186, 116)' }}
                                animate={{ backgroundColor: index + 1 < currentStep ? 'rgb(44, 59, 77)' : 'rgb(255, 177, 98)' }}
                                transition={{ duration: 0.5 }}
                            />
                        )}

                        {/* Círculos del Stepper */}
                        <motion.div
                            className={`relative z-10 w-4 h-4 flex items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                index + 1 <= currentStep ? 'bg-sipe-orange-light border-sipe-orange-dark/15' : 'bg-sipe-blue-light border-sipe-blue-dark'
                            }`}
                            initial={{ scale: 1 }}
                            animate={{ scale: index + 1 === currentStep ? 1.2 : 1 }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Stepper;
