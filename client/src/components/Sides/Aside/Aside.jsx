import { Link, NavLink } from 'react-router-dom';
import { Home, Box, FileText, Archive, ArrowUpRight, Users, BarChart, Warehouse } from 'lucide-react';
import { motion } from 'framer-motion';

const sections = [
    { name: 'Dashboard', label: 'Dashboard', icon: <Home />, path: '/dshb', roles: ['Administrador', 'Colaborador'] },
    { name: 'Materiales', label: 'Materiales', icon: <Box />, path: '/mtls', roles: ['Administrador', 'Colaborador'] },
    { name: 'Estanterias', label: 'Estanterías', icon: <Archive />, path: '/shelf', roles: ['Administrador'] },
    { name: 'Depositos', label: 'Depósitos', icon: <Warehouse />, path: '/deposit', roles: ['Administrador'] },
    { name: 'Movimientos', label: 'Movimientos', icon: <ArrowUpRight />, path: '/movement', roles: ['Administrador'] },
    { name: 'Informes', label: 'Informes', icon: <FileText />, path: '/informes', roles: ['Administrador'] },
    { name: 'Lista de usuarios', label: 'Lista de usuarios', icon: <Users />, path: '/user', roles: ['Administrador'] },
    { name: 'Control de stock', label: 'Control de stock', icon: <BarChart />, path: '/control-de-stock', roles: ['Administrador'] },
];

function Aside() {
    const rol = localStorage.getItem('rol');

    return (
        <aside className="bg-sipe-blue-light text-sipe-white min-h-full pl-12 py-8">
            <div>
                <Link to="/">
                    <img className="w-40 mb-12 mr-20" src="src/assets/images/logo/LogoSIPE.png" alt="SIPE" />
                </Link>
                <section className='flex flex-col items-start'>
                    {sections
                        .filter(section => section.roles.includes(rol))
                        .map((section, index) => (
                            <NavLink
                                key={index}
                                to={section.path}
                                className={({ isActive }) =>
                                    `w-full text-left font-light text-sipe-white rounded-l-lg px-3 py-3 mb-2 transition ease-in-out duration-300 ${isActive ? 'bg-sipe-orange-dark text-sipe-white' : 'hover:bg-sipe-gray/20 hover:text-sipe-white text-zinc-400'}`
                                }
                            >
                                <span className='flex flex-row gap-2 items-center'>
                                    {section.icon}
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