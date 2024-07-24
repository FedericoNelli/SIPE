import LoginInput from "@/components/LoginInput/LoginInput"
import { motion } from 'framer-motion';


function Login() {
    return (
        <section className='flex justify-start items-center min-h-screen w-full bg-sipe-gradient'>
            <motion.div
                initial={{ x: -1000 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className='flex justify-center items-center w-4/6 h-screen'
            >
                <img src="./src/assets/images/logo/LogoSIPE.png" alt="Logo" className="w-2/5 mx-auto" />
            </motion.div>
            <div className="flex items-center justify-center min-h-screen w-2/6 bg-sipe-blue-dark">
                <LoginInput />
            </div>
        </section>
    );
}

export default Login