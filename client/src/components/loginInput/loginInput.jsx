import { Button } from "@/components/Common/Button/Button";
import { Input } from "@/components/Common/Input/Input";
import { Checkbox } from "@/components/Common/Checkbox/Checkbox";
import { Label } from "@/components/Common/Label/Label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import axios from "axios";

function LoginInput({ onLoginSuccess }) {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoginSuccessful, setIsLoginSuccessful] = useState(false); // Controla la animación de desaparición

    useEffect(() => {
        const savedUser = localStorage.getItem('rememberedUser');
        if (savedUser) {
            setUser(savedUser);
            setRememberMe(true);
        }
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const res = await axios.post('http://localhost:8081/login', { user, password });
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('id', res.data.id);
                localStorage.setItem('userName', res.data.nombre);
                localStorage.setItem('rol', res.data.rol);
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', user);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                setIsLoginSuccessful(true); // Inicia la animación de desaparición
                setTimeout(() => {
                    onLoginSuccess(); // Llama a la función para completar el login
                }, 1000); // Retrasa la llamada para completar la animación
            } else {
                setErrorMessage('Usuario y/o contraseña incorrectos.');
            }
        } catch (err) {
            console.log(err);
            setErrorMessage('Usuario y/o contraseña incorrectos.');
        }
    }

    function handleCheckboxChange(isChecked) {
        setRememberMe(isChecked);
        if (!isChecked) {
            localStorage.removeItem('rememberedUser');
            setUser('');
        }
    }

    return (
        <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={isLoginSuccessful ? { opacity: 0 } : { opacity: 1, y: 0 }} // Desaparición suave
            transition={{ duration: 1, ease: 'easeInOut' }} // Control de la duración de la animación
            className="mx-auto w-full max-w-xs space-y-4"
        >
            <div className="space-y-2">
                <h1 className="font-bold text-sipe-white text-4xl">Bienvenido a SIPE</h1>
                <p className="font-thin text-sipe-white">Por favor, entrá con tu cuenta</p>
            </div>
            <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user">
                            <Input className="border rounded-lg h-10 px-6 py-6" id="user" placeholder="Usuario" required type="text" value={user} onChange={u => setUser(u.target.value)} />
                        </Label>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            <Input className="border rounded-lg h-10 px-6 py-6" id="password" placeholder="Contraseña" required type="password" value={password} onChange={u => setPassword(u.target.value)} />
                        </Label>
                    </div>
                    <div className='flex justify-center items-center gap-2 text-sipe-gray'>
                        <Checkbox checked={rememberMe} onCheckedChange={handleCheckboxChange} /> <span className="text-xs">Recordarme</span>
                        <Link className="ml-auto text-xs" to="/rPsw">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    {errorMessage && <div className="text-red-500 text-xs">{errorMessage}</div>}
                    <Button variant="sipebutton" size="sipebutton" type="submit">
                        LOGIN
                    </Button>
                </form>
            </div>
        </motion.div>
    );
}

export default LoginInput;
