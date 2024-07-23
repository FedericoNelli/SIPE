import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { Label } from "@/components/Label/Label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginInput() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

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
                localStorage.setItem('userName', res.data.nombre);
                localStorage.setItem('rol', res.data.rol);
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', user);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                navigate('/dshb');  
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
        <div className="mx-auto w-full md:w-40 lg:w-80 xl:w-8/12 space-y-4">
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
        </div>
    );
}

export default LoginInput;