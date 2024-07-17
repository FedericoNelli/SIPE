import { Button } from "@/components/button/button"
import { Input } from "@/components/input/input"
import { Checkbox } from "@/components/checkbox/checkbox"
import { Label } from "@/components/label/label"
import { Link } from "react-router-dom"

function LoginInput() {
    return (
        <div className="mx-auto w-full max-w-md space-y-4">
            <div className="space-y-2">
                <h1 className="font-bold text-sipe-white text-4xl">Bienvenido a SIPE</h1>
                <p className="font-thin text-sipe-white">Por favor, entrá con tu cuenta</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>
                        <Input id="user" placeholder="Usuario" required type="text" />
                    </Label>
                </div>
                <div className="space-y-2">
                    <Label>
                        <Input id="password" placeholder="Contraseña" required type="password" />
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
                <div className="mt-10">
                    <Link to="/dshb">
                        <Button variant="sipebuttonalt" size="sipebutton" type="submit">
                            A Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LoginInput
