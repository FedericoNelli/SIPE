import { useState } from 'react';
import { Label } from '@/components/Common/Label/Label';
import { Input } from '@/components/Common/Input/Input';
import { Button } from '@/components/Common/Button/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChangePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state.email;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Las contraseñas no coinciden');
            return;
        }
        try {
            await axios.post('http://localhost:8081/changePassword', { email, newPassword: password });
            setMessage('Contraseña actualizada');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setMessage('Error al actualizar la contraseña');
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
                            <h1 className="font-bold text-sipe-white text-4xl">Cambiar contraseña</h1>
                            <p className="font-thin text-sipe-white">Ingresá tu nueva contraseña</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    <Input className="border rounded-lg h-10 px-6 py-6" id="user" placeholder="Nueva contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </Label>
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    <Input className="border rounded-lg h-10 px-6 py-6" id="user" placeholder="Confirmar contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </Label>
                            </div>
                            <div>
                                <Button className="mb-5" variant="sipebutton" size="sipebutton" type="submit" onClick={handleSubmit}>
                                    Cambiar contraseña
                                </Button>
                            </div>
                            {message && <div className="text-sipe-white">{message}</div>}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default ChangePassword;


