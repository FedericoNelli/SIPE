import { Link, NavLink } from 'react-router-dom';
import { Home, Box, FileText, Archive, ArrowUpRight, Users, BarChart } from 'lucide-react';

const sections = [
    { name: 'Dashboard', label: 'Dashboard', icon: <Home />, path: '/dshb' },
    { name: 'Materiales', label: 'Materiales', icon: <Box />, path: '/mtls' },
    { name: 'Informes', label: 'Informes', icon: <FileText />, path: '/informes' },
    { name: 'Depositos', label: 'Depositos', icon: <Archive />, path: '/depositos' },
    { name: 'Movimientos', label: 'Movimientos', icon: <ArrowUpRight />, path: '/movimientos' },
    { name: 'Lista de usuarios', label: 'Lista de usuarios', icon: <Users />, path: '/lista-de-usuarios' },
    { name: 'Control de stock', label: 'Control de stock', icon: <BarChart />, path: '/control-de-stock' },
];

function Aside() {
    return (
        <aside className="bg-sipe-blue-light text-sipe-white min-h-full pl-12 py-8">
            <div>
                <Link to="/">
                    <img className="w-48 mb-12 mr-20" src="src/assets/images/logo/LogoSIPE.png" alt="SIPE" />
                </Link>
                <section className='flex flex-col items-start'>
                    {sections.map((section, index) => (
                        <NavLink
                            key={index}
                            to={section.path}
                            className={({ isActive }) =>
                                `w-full text-left font-light text-sipe-white hover:bg-sipe-orange-dark hover:text-sipe-white rounded-l-lg px-3 py-3 transition ease-in-out duration-300 ${isActive ? 'bg-sipe-orange-dark text-sipe-white' : 'text-zinc-400'}`
                            }
                        >
                            <span className='flex flex-row gap-2 items-center'>
                                {section.icon} {/* Renderiza el ícono como un componente React */}
                                {section.label}
                            </span>
                        </NavLink>
                    ))}
                </section>
            </div>
        </aside>
    );
}

export default Aside;