import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginInput from "@/components/LoginInput/LoginInput";
import { useNavigate } from "react-router-dom";

function Login() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);
    const [startExpand, setStartExpand] = useState(false); 
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        setStartExpand(true); 
        setTimeout(() => {
            setIsLoginSuccessful(true);
        }, 1250); 
        setTimeout(() => {
            navigate('/dshb'); 
        }, 1250); 
    };

    const openLogin = () => {
        setIsLoginOpen(true);
    };

    return (
        <section className="flex justify-start items-center min-h-screen w-full bg-sipe-gradient overflow-hidden relative">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "tween", duration: 2.5, ease: 'easeInOut' }}
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

            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isLoginOpen ? "0%" : "100%" }}
                transition={{ type: "tween", duration: 1, ease: 'easeInOut' }}
                className="fixed right-0 top-0 bottom-0 w-1/4 bg-sipe-blue-dark flex items-center justify-center"
            >
                {isLoginOpen && <LoginInput onLoginSuccess={handleLoginSuccess} />}
            </motion.div>

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
