import { useState } from 'react';
import { Label } from '@/components/Common/Label/Label';
import { Input } from '@/components/Common/Input/Input';
import { Button } from '@/components/Common/Button/Button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

function RecoveryPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:8081/sendRecoveryCode', { email });
            setMessage('Correo de recuperación enviado');
            navigate('/rCod', { state: { email } });
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setMessage('Email no encontrado');
            } else {
                setMessage('Error al enviar el correo de recuperación');
            }
        }
    };

    return (
        <div className="bg-sipe-blue-dark">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <section className='flex justify-start items-center'>
                    <div className='grid justify-center items-center w-4/6 h-screen bg-gradient-to-br from-sipe-blue-dark from-40% to-sipe-orange-dark'>
                        <img src="./src/assets/images/logo/LogoSIPE.png" alt="Logo" className="w-2/5 mx-auto" />
                    </div>
                    <div className="flex items-center min-h-screen px-4 w-2/6 bg-sipe-blue-dark">
                        <div className="mx-auto w-full max-w-md space-y-4">
                            <div className="space-y-2">
                                <h1 className="font-bold text-sipe-white text-4xl">Recuperá tu contraseña</h1>
                                <p className="font-thin text-sipe-white">Escribí tu email y recibí allí un código para reestablecer tu contraseña</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>
                                        <Input className="border rounded-lg h-10 px-6 py-6" id="user" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </Label>
                                </div>
                                <div>
                                    <Button className="mb-5" variant="sipebutton" size="sipebutton" type="button" onClick={handleSubmit}>
                                        Enviar correo
                                    </Button>
                                    <Link to="/">
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
            </motion.div>
        </div>
    );
}

export default RecoveryPassword;



