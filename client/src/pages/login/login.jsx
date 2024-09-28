import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginInput from "@/components/LoginInput/LoginInput";
import { useNavigate } from "react-router-dom";
import Tutorials from '../Tutorials/Tutorials';

function Login() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);
    const [startExpand, setStartExpand] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        setStartExpand(true);
        setTimeout(() => {
            setIsLoginSuccessful(true); // Marca el login como exitoso después de la animación
            
            if (localStorage.getItem('firstLogin') === '1') {
                setShowTutorial(true); // Mostrar el tutorial después de la animación
                navigate('/tuto'); // Redirigir a la ruta donde se encuentra el componente Tutorial
            } else {
                navigate('/dshb');
            }
        }, 1250); // Espera 1.25 segundos para que la animación se complete antes de ejecutar el tutorial
    };
    

    const handleFirstLogin = () => {
        setShowTutorial(true);
        navigate('/tuto'); // Redirigir a la ruta donde se encuentra el componente Tutorial
    };
    

    const openLogin = () => {
        setIsLoginOpen(true);
    };

    return (
        <section className="flex justify-start items-center min-h-screen w-full bg-sipe-gradient overflow-hidden relative">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "tween", duration: 2, ease: 'easeInOut' }}
                onAnimationComplete={openLogin}
            >
                <motion.div
                    initial={{ x: 0, scale: 1 }}
                    animate={{
                        x: isLoginOpen ? "-12%" : "0%",
                        scale: isLoginOpen ? 0.75 : 1,
                    }}
                    transition={{ duration: 1 }}
                    className="flex justify-center items-center w-full h-screen"
                >
                    <img src="./src/assets/images/logo/LogoSIPE.png" alt="Logo" className="w-2/6 mx-auto" />
                </motion.div>
            </motion.div>

            {!showTutorial ? (
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: isLoginOpen ? "0%" : "100%" }}
                    transition={{ type: "tween", duration: 1, ease: 'easeInOut' }}
                    className="fixed right-0 top-0 bottom-0 w-1/4 bg-sipe-blue-dark flex items-center justify-center"
                >
                    {isLoginOpen && <LoginInput onLoginSuccess={handleLoginSuccess} onFirstLogin={handleFirstLogin} />}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-opacity-75 bg-sipe-blue-dark"
                >
                    <Tutorials /> 
                </motion.div>
            )}

            {startExpand && (
                <motion.div
                    initial={{ width: "25%", right: 0 }}
                    animate={{ width: "100%", right: 0 }}
                    transition={{
                        duration: 1,
                        ease: [0.42, 0, 0.58, 1]
                    }}
                    className="fixed top-0 bottom-0 bg-sipe-blue-dark z-50"
                />
            )}

            {isLoginSuccessful && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="fixed top-0 left-0 w-full h-full bg-sipe-blue-dark z-50"
                />
            )}
        </section>
    );
}

export default Login;
