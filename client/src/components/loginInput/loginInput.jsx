import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { Checkbox } from "@/components/checkbox/checkbox";
import { Label } from "@/components/label/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginInput() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const res = await axios.post('http://localhost:8081/login', { user, password });
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                navigate('/dshb');  
            } else {
                console.log(res.data);
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="mx-auto w-full md:w-40 lg:w-80 space-y-4">
            <div className="space-y-2">
                <h1 className="font-bold text-sipe-white text-4xl">Bienvenido a SIPE</h1>
                <p className="font-thin text-sipe-white">Por favor, entrá con tu cuenta</p>
            </div>
            <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="space-y-2">
                        <Label htmlFor="user">
                            <Input id="user" placeholder="Usuario" required type="text" onChange={u => setUser(u.target.value)} />
                        </Label>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            <Input id="password" placeholder="Contraseña" required type="password" onChange={u => setPassword(u.target.value)} />
                        </Label>
                    </div>
                    <div className='flex justify-center items-center gap-2 text-zinc-500'>
                        <Checkbox /> <span className="text-xs">Recordarme</span>
                        <Link className="ml-auto text-xs" to="/rPsw">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <Button variant="sipebutton" size="sipebutton" type="submit">
                        LOGIN
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default LoginInput;