import React from 'react';
import styles from './sidenav.module.css';

function Sidenav() {
    return (
        <aside className="bg-sipe-blue-light text-sipe-white min-h-screen p-10 py-6">
            <div className="flex flex-col items-center">
                <img className="w-48 mb-12" src="src/assets/images/logo/LogoSIPE.png" alt="SIPE" />
                <ul className={`{styles.ul} flex justify-center align-middle flex-col font-light`}>
                    <li className={styles.li}><img src="src/assets/images/icons/Dashboard.png" alt=""/>Dashboard</li>
                    <li className={styles.li}><img src="src/assets/images/icons/Materiales.png" alt=""/>Materiales</li>
                    <li className={styles.li}><img src="src/assets/images/icons/Informes.png" alt=""/>Informes</li>
                    <li className={styles.li}><img src="src/assets/images/icons/Depositos.png" alt=""/>Depósitos</li>
                    <li className={styles.li}><img src="src/assets/images/icons/Dashboard.png" alt=""/>Movimientos</li>
                    <li className={styles.li}><img src="src/assets/images/icons/Usuarios.png" alt=""/>Lista de usuarios</li>
                    <li className={styles.li}><img src="src/assets/images/icons/ControlStock.png" alt=""/>Control de stock</li>
                </ul>
            </div>
        </aside>
    )
}

export default Sidenav;