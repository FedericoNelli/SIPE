import { useState } from 'react';
import { motion } from 'framer-motion';

const CompTesting = () => {
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(1);


  return (
    <div className="flex flex-col items-center space-y-6">
      
      <div className="flex space-x-4 relative">
        {[...Array(totalSteps)].map((_, index) => (
          <div key={index} className="relative flex items-center">
            

            {index < totalSteps - 1 && (
              <motion.div
                className="absolute top-1/2 left-4 w-10 h-1 z-0"  
                initial={{ backgroundColor: 'rgb(253, 186, 116)' }}  
                animate={{ backgroundColor: index + 1 < currentStep ? 'rgb(44, 59, 77)' : 'rgb(255, 177, 98)' }} 
                transition={{ duration: 0.5 }}  
              />
            )}
            
            <motion.div
              className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-500 ${index + 1 <= currentStep ? 'bg-sipe-blue-light border-sipe-blue-dark' : 'bg-sipe-orange-light border-sipe-orange-dark/15'
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

export default CompTesting;