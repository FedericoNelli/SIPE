import { useState, useEffect } from 'react';
import { Label } from '@/components/Common/Label/Label';
import { Input } from '@/components/Common/Input/Input';
import { Button } from '@/components/Common/Button/Button';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function RecoveryCode() {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [resendTimeout, setResendTimeout] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state.email;

    useEffect(() => {
        let timer;
        if (resendTimeout > 0) {
            timer = setTimeout(() => setResendTimeout(resendTimeout - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimeout]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:8081/verifyRecoveryCode', { email, recoveryCode: code });
            navigate('/chPsw', { state: { email } });
        } catch (err) {
            setMessage('Código incorrecto');
        }
    };

    const handleResendCode = async () => {
        try {
            await axios.post('http://localhost:8081/sendRecoveryCode', { email });
            setMessage('Nuevo código enviado');
            setResendTimeout(60);
        } catch (err) {
            setMessage('Error al reenviar el código');
        }
    };

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
                            <p className="font-thin text-sipe-white">Ingresá el código que enviamos a tu email</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    <Input className="border rounded-lg h-10 px-6 py-6" id="user" placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
                                </Label>
                            </div>
                            <div>
                                <Button className="mb-5" variant="sipebutton" size="sipebutton" type="submit" onClick={handleSubmit}>
                                    Confirmar
                                </Button>
                                <Button className="mb-5" variant="sipebutton" size="sipebutton" type="button" onClick={handleResendCode} disabled={resendTimeout > 0}>
                                    {resendTimeout > 0 ? `Reenviar código (${resendTimeout})` : 'Reenviar código'}
                                </Button>
                                <Link to="/rPsw">
                                    <Button variant="sipebuttonalt" size="sipebutton" type="submit">
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                            {message && <div className="text-sipe-white">{message}</div>}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default RecoveryCode;


