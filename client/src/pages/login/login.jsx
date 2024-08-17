import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginInput from "@/components/LoginInput/LoginInput";
import { ChevronLeft } from 'lucide-react';


function Login() {
    const [isLoginOpen, setIsLoginOpen] = useState(false); // Controla si el login está abierto

    const toggleLogin = () => {
        setIsLoginOpen(!isLoginOpen); // Cambia el estado al hacer clic en la flecha
    };

    return (
        <section className="flex justify-start items-center min-h-screen w-full bg-sipe-gradient">
            {/* Logo con animación */}
            <motion.div
                initial={{ x: 0, scale: 1 }}
                animate={{
                    x: isLoginOpen ? "-17.5%" : "0%", // Mueve el logo a la izquierda cuando el login está abierto
                    scale: isLoginOpen ? 0.75 : 1,  // Cambia el tamaño del logo cuando el login está abierto
                }}
                transition={{ duration: 0.5 }}
                className="flex justify-center items-center w-full h-screen"
            >
                <img src="./src/assets/images/logo/LogoSIPE.png" alt="Logo" className="w-2/5 mx-auto" />
            </motion.div>

            {/* Formulario de Login */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isLoginOpen ? "0%" : "100%" }} // Mueve el login dentro o fuera de la pantalla
                transition={{ type: "tween", duration: 0.5, ease: 'easeInOut' }}
                className="fixed right-0 top-0 bottom-0 w-2/6 bg-sipe-blue-dark flex items-center justify-center"
            >
                {isLoginOpen && <LoginInput />} {/* Solo renderiza el LoginInput si está abierto */}
            </motion.div>

            {/* Flecha para abrir/cerrar el login */}
            {!isLoginOpen && (  // Solo mostrar la flecha cuando el login está cerrado
                <motion.div
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-white" // Flecha grande, blanca y centrada verticalmente
                onClick={toggleLogin}
                initial={{ x: 0 }}
                animate={{ x: [0, -30, 0, -20, 0] }}  // Dos rebotes consecutivos
                transition={{ 
                    duration: 1, 
                    repeat: Infinity,  // Repite la animación completa indefinidamente
                    repeatType: "loop", 
                    repeatDelay: 2,  // Espera 2 segundos entre ciclos de dos rebotes
                    ease: "easeInOut",  // Suavizado de la animación
                }}
            >
                <ChevronLeft size={48} strokeWidth={3} />
            </motion.div>
            )}
        </section>
    );
}

export default Login;
