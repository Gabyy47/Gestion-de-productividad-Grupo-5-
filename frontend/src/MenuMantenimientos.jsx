import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MenuMantenimientos = () => {
    const [mostrarMantenimientos, setMostrarMantenimientos] = useState(false);

    const toggleMantenimientos = () => {
        setMostrarMantenimientos(!mostrarMantenimientos);
    };

    return (
        <div className="nav-item">
            <div className="nav-link btn text-white" onClick={toggleMantenimientos} style={{ cursor: 'pointer' }}>
                Mantenimientos
            </div>
            {mostrarMantenimientos && (
                <ul className="nav flex-column ms-3">
                    <li className="nav-item">
                        <Link to="/MantUsuario" className="nav-link text-white">
                            Mantenimiento de Usuario
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/MantEmpleado" className="nav-link text-white">
                            Mantenimiento de Empleado
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/MantTipoProductos" className="nav-link text-white">
                            Mantenimiento de tipo de productos
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/MantProveedores" className="nav-link text-white">
                            Mantenimiento Proveedores
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/MantMaquinaria" className="nav-link text-white">
                            Mantenimiento de maquinaria
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/MantProductos" className="nav-link text-white">
                            Mantenimiento de productos
                        </Link>
                    </li>
                    {/* Aquí puedes agregar más enlaces de mantenimiento */}
                </ul>
            )}
        </div>
    );
};

export default MenuMantenimientos;