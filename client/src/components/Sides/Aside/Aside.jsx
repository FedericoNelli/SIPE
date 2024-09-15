import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Home, Box, FileText, Archive, ArrowUpRight, Users, Warehouse, Tags, ChevronDown, ChevronUp } from 'lucide-react';


const sections = [
    { name: 'Dashboard', label: 'Dashboard', icon: <Home />, path: '/dshb', roles: ['Administrador', 'Colaborador'] },
    { name: 'Materiales', label: 'Materiales', icon: <Box />, path: '/mtls', roles: ['Administrador', 'Colaborador'] },
    { name: 'Categorias', label: 'Categorías', icon: <Tags />, path: '/category', roles: ['Administrador'] },
    {
        name: 'Almacenamiento',
        label: 'Almacenamiento',
        icon: <Archive />,
        roles: ['Administrador'],
        subMenu: [
            { name: 'Pasillos', path: '/aisle' },
            { name: 'Estanterías', path: '/shelf' },
            { name: 'Lados', path: '/side' }
        ]
    },
    {
        name: 'Depositos',
        label: 'Depósitos',
        icon: <Warehouse />,
        roles: ['Administrador'],
        subMenu: [
            { name: 'Depósitos', path: '/deposit' },
            { name: 'Ubicaciones', path: '/locations' }
        ]
    },
    { name: 'Movimientos', label: 'Movimientos', icon: <ArrowUpRight />, path: '/movement', roles: ['Administrador'] },
    { name: 'Informes', label: 'Informes', icon: <FileText />, path: '/informes', roles: ['Administrador'] },
    { name: 'Lista de usuarios', label: 'Lista de usuarios', icon: <Users />, path: '/user', roles: ['Administrador'] },
];

function Aside() {
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const rol = localStorage.getItem('rol');
    const location = useLocation();

    useEffect(() => {
        const isInDeposits = sections[4].subMenu.some(subItem => subItem.path === location.pathname);
        const isInShelves = sections[3].subMenu.some(subItem => subItem.path === location.pathname);

        if (isInDeposits) {
            setOpenSubMenu('Depositos');
        } else if (isInShelves) {
            setOpenSubMenu('Almacenamiento'); 
        }
    }, [location]);

    const toggleSubMenu = (menuName) => {
        if (openSubMenu === menuName) {
            setOpenSubMenu(null); 
        } else {
            setOpenSubMenu(menuName); 
        }
    };

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
                            <div key={index} className='w-full'>
                                {section.subMenu ? (
                                    <div>
                                        <button
                                            onClick={() => toggleSubMenu(section.name)}
                                            className={`w-full text-left font-light  rounded-l-lg px-3 py-3 mb-2 transition ease-in-out duration-300 flex justify-between items-center hover:bg-sipe-gray/20 hover:text-sipe-white text-zinc-400`}
                                        >
                                            <span className='flex flex-row gap-2 items-center'>
                                                {section.icon}
                                                {section.label}
                                            </span>
                                            {openSubMenu === section.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        {openSubMenu === section.name && (
                                            <div className="ml-8">
                                                {section.subMenu.map((subItem, subIndex) => (
                                                    <NavLink
                                                        key={subIndex}
                                                        to={subItem.path}
                                                        className={({ isActive }) =>
                                                            `flex items-center text-left font-light text-sipe-white rounded-l-lg px-3 py-2 mb-2 transition ease-in-out duration-300 before:content-['●'] before:mr-2 before:mb-0.5 ${isActive ? 'bg-sipe-orange-dark text-sipe-white' : 'hover:bg-sipe-gray/20 hover:text-sipe-white text-zinc-400'}`
                                                        }
                                                    >
                                                        {subItem.name}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        to={section.path}
                                        className={({ isActive }) =>
                                            `w-full text-left font-light text-sipe-white rounded-l-lg px-3 py-3 mb-2 transition ease-in-out duration-300 flex items-center gap-2 ${isActive ? 'bg-sipe-orange-dark text-sipe-white' : 'hover:bg-sipe-gray/20 hover:text-sipe-white text-zinc-400'}`
                                        }
                                    >
                                        <span className='flex flex-row gap-2 items-center'>
                                            {section.icon}
                                            {section.label}
                                        </span>
                                    </NavLink>
                                )}
                            </div>
                        ))}
                </section>
            </div>
        </aside>
    );
}

export default Aside;
