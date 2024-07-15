import { Button } from "@/components/button/button"
import { Input } from "@/components/input/input"
import { Checkbox } from "@/components/checkbox/checkbox"
import { Label } from "@/components/label/label"

function Login() {
    return (
        <>
        <section className='flex justify-start items-center'>
            <div className='grid justify-center items-center w-4/6 h-screen bg-gradient-to-br from-sipe-blue-dark from-40% to-sipe-orange-dark'>
                <img src="./src/assets/images/logo/LogoSIPE.png" alt="Logo" className="w-2/5 mx-auto" />
            </div>
            <div className="flex items-center min-h-screen px-4 w-2/6 bg-sipe-blue-dark">
                <div className="mx-auto w-full max-w-sm space-y-4">
                    <div className="space-y-2">
                        <h1 className="font-bold text-sipe-white text-4xl">Bienvenido a SIPE</h1>
                        <p className="font-thin text-sipe-white">Por favor, entrá con tu cuenta</p>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>
                                <Input id="email" placeholder="Usuario" required type="email" />
                            </Label>
                        </div>
                        <div className="space-y-2">
                            <Label>
                                <Input id="password" placeholder="Contraseña" required type="password" />
                            </Label>
                        </div>
                        <div className='flex justify-center items-center gap-2 text-zinc-500'>
                            <Checkbox /> <span className="text-xs">Recordarme</span>
                            <a className="ml-auto text-xs" href="#">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                        <Button variant="sipebutton" size="sipebutton" type="submit">
                            LOGIN
                        </Button>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}

export default Login