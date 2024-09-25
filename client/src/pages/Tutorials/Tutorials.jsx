import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Tutorial from '@/components/Tutorial/Tutorial';
import toast, { Toaster } from 'react-hot-toast';

function Tutorials() {
    const navigate = useNavigate();

    useEffect(() => {
        const firstLogin = localStorage.getItem('firstLogin');

        // Redirige al tutorial si el usuario aún no ha completado el proceso
        if (firstLogin === '1') {
            navigate('/tuto', { replace: true });
        }

        // Prevenir la navegación hacia atrás al dashboard
        const handlePopState = () => {
            if (localStorage.getItem('firstLogin') === '1') {
                navigate('/tuto', { replace: true });
            }
        };

        // Agregar el evento
        window.addEventListener('popstate', handlePopState);

        // Limpiar el evento cuando el componente se desmonte
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    const notify = (type, message) => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-sipe-gradient"> {/* Añadimos clases Tailwind para centrar y el fondo */}
            <div className="w-full max-w-3xl"> {/* Controla el tamaño máximo de los formularios */}
                <Tutorial notify={notify} />
            </div>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    className: '',
                    duration: 5000,
                    style: {
                        background: '#2C3B4D',
                        color: '#EEE9DF',
                    },
                }}
            />
        </div>
    );
}

export default Tutorials;
