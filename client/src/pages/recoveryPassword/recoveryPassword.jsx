import { Label } from '../../components/label/label';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import { Link } from 'react-router-dom';

function RecoveryPassword() {
    return (
        <>
            <section className='flex justify-start items-center'>
            <div className='grid justify-center items-center w-4/6 h-screen bg-gradient-to-br from-sipe-blue-dark from-40% to-sipe-orange-dark'>
                <img src="./src/assets/images/logo/LogoSIPE.png" alt="Logo" className="w-2/5 mx-auto" />
            </div>
            <div className="flex items-center min-h-screen px-4 w-2/6 bg-sipe-blue-dark">
                <div className="mx-auto w-full max-w-md space-y-4">
                    <div className="space-y-2">
                        <h1 className="font-bold text-sipe-white text-4xl">Recuperá tu contraseña</h1>
                        <p className="font-thin text-sipe-white">Escribí tu usuario y recibí tu contraseña en el email que se usó para el registro de tu cuenta en el sistema</p>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>
                                <Input id="user" placeholder="Usuario" />
                            </Label>
                        </div>
                        <div>
                            <Button className="mb-5" variant="sipebutton" size="sipebutton" type="submit">
                                Enviar contraseña
                            </Button>
                            <Link to="/login">
                                <Button variant="sipebuttonalt" size="sipebutton" type="submit">
                                    Cancelar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}

export default RecoveryPassword
