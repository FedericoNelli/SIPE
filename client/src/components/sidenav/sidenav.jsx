import { Link, NavLink } from 'react-router-dom';

function Sidenav() {

    return (
        <aside className="bg-sipe-blue-light text-sipe-white min-h-full pl-12 py-8">
            <div className="">
                <Link to="/login">
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
                            <span className='flex flex-row gap-2'>
                                <img src={section.icon} alt={section.name} className='w-6' />
                                {section.label}
                            </span>
                        </NavLink>
                    ))}
                </section>
            </div>
        </aside>
    );
}

const sections = [
    { name: 'Dashboard', label: 'Dashboard', icon: 'src/assets/images/icons/Dashboard.png', path: '/dshb' },
    { name: 'Materiales', label: 'Materiales', icon: 'src/assets/images/icons/Materiales.png', path: '/mtls' },
    { name: 'Informes', label: 'Informes', icon: 'src/assets/images/icons/Informes.png', path: '/informes' },
    { name: 'Depositos', label: 'Depositos', icon: 'src/assets/images/icons/Depositos.png', path: '/depositos' },
    { name: 'Movimientos', label: 'Movimientos', icon: 'src/assets/images/icons/Dashboard.png', path: '/movimientos' },
    { name: 'Lista de usuarios', label: 'Lista de usuarios', icon: 'src/assets/images/icons/Usuarios.png', path: '/lista-de-usuarios' },
    { name: 'Control de stock', label: 'Control de stock', icon: 'src/assets/images/icons/Informes.png', path: '/control-de-stock' },
];

export default Sidenav;