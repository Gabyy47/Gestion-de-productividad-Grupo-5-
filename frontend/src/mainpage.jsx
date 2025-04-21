//import React, { useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import MenuMantenimientos from './MenuMantenimientos';
import SeguimientoProductos from './SeguimientoProductos'; // 'S' y 'P' en mayúscula
import ListaEmpleados from './ListaEmpleados'; 
import Reportes from './Reportes'; // <--- ¡Asegúrate de tener esta línea!
import axios from 'axios';
import React, { useState, useEffect } from 'react';

const BASE_URL = "http://localhost:49146/api/";

// Componentes de las vistas
const Dashboard = () => <h2>Dashboard</h2>;
const Settings = () => <h2>Configuración</h2>;
const MantenimientoUsuario = () => <h2>Mantenimiento de Usuario</h2>;
const MantenimientoEmpleado = () => <h2>Mantenimiento de Empleado</h2>;
const Mantenimientotipoproductos = () => <h2>Mantenimiento de tipo de productos</h2>;
const Mantenimientoproveedores = () => <h2>Mantenimiento proveedores</h2>;
const Mantenimientomaquinaria = () => <h2>Mantenimiento maquinaria</h2>;
const Mantenimientoproducto = () => <h2>Mantenimiento de producto</h2>;
//const SeguimientoProductos = () => <h2>Seguimiento productos</h2>;


const MainPage = ({ onLogout }) => {
    // const [activeView, setActiveView] = useState('dashboard'); // Comentar o eliminar
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };
    const [empleados, setEmpleados] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const response = await axios.get(`${BASE_URL}empleados`);
                setEmpleados(response.data);
                setLoading(false);
            } catch (error) {
                setError('Error al cargar los empleados');
                setLoading(false);
                console.error('Error fetching empleados:', error);
            }
        };

        fetchEmpleados();

        const fetchProductos = async () => {
            try {
                const response = await axios.get(`${BASE_URL}Productos`);
                setProductos(response.data);
                setLoading(false);
            } catch (error) {
                setError('Error al cargar los productos');
                setLoading(false);
                console.error('Error fetching productos:', error);
            }
        };

        fetchProductos();
    }, []);

    // const renderView = () => { // Comentar o eliminar esta función
    //     switch (activeView) {
    //         case 'dashboard':
    //             return <Dashboard />;
    //         case 'settings':
    //             return <Settings />;
    //         default:
    //             return <Dashboard />;
    //     }
    // };

    if (loading) {
        return <div>Cargando empleados...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (loading) {
        return <div>Cargando productos...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="d-flex">
            {/* Menú lateral */}
            <nav className="bg-secondary text-white vh-100 p-3" style={{ width: '300px' }}>
                <h2 className="text-center">Menú</h2>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link to="/" className="nav-link btn text-white">
                            Dashboard
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/usuarios" className="nav-link btn text-white">
                            Usuarios
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/configuracion" className="nav-link btn text-white">
                            Configuración
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/SeguimientoProductos" className="nav-link btn text-white">
                            Seguimiento de Productos
                        </Link>
                    </li>
                    <li className="nav-item">
                        <MenuMantenimientos />
                    </li>
                </ul>
            </nav>
            {/* Área de contenido principal */}
            <div className="flex-grow-1 p-4">
                {/* {renderView()} */}
                {/* <h1>Main Page</h1> */} {/* También puedes eliminar esto */}
                <button onClick={handleLogout}>Logout</button>
                <div className="mt-3"> {/* Contenedor para los botones de navegación */}
                <Link to="/SeguimientoProductos" className="btn btn-primary me-2">
                 Seguimiento de Productos
                </Link>
                <Link to="/ListaEmpleados" className="btn btn-info me-2">
                 Lista de empleados
                </Link>
                <Link to="/Reportes" className="btn btn-success">
                 Reporte
                </Link>
                </div>
                <div className="card" style={{ marginLeft: '250px' }}>
            <div className="card-body">
                <h5 className="card-title">Empleados</h5>
                <table className="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Cargo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empleados.map(empleado => (
                            <tr key={empleado.id_empleado}> {/* Asegúrate de usar el ID correcto */}
                                <td>{empleado.nombre}</td>
                                <td>{empleado.cargo}</td>
                                <td>
                                    {empleado.estado === 'Activo' ? (
                                        <span className="text-success">{empleado.estado}</span>
                                    ) : (
                                        <span className="text-danger">{empleado.estado}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div>
            <h2>Seguimiento de Productos</h2>
            <table className="table table-sm table-striped"> {/* Usamos table-sm para una tabla más compacta */}
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Proveedor</th>
                        <th>Stock</th>
                        <th>Última Compra</th>
                        <th>Estado</th> {/* Podemos añadir un estado al producto si lo tienes */}
                    </tr>
                </thead>
                <tbody>
                    {productos.map(producto => (
                        <tr key={producto.id_producto}>
                            <td>{producto.id_producto}</td>
                            <td>{producto.nombre}</td>
                            <td>{producto.proveedor}</td>
                            <td>{producto.cantidad_stock}</td>
                            <td>{producto.fecha_ultima_compra}</td>
                            <td>{producto.descripcion}</td>
                            <td>{producto.cantidad_stock > 10 ? (<span className="text-success">En Stock</span>) : (<span className="text-warning">Bajo Stock</span>)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
                <Routes>
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* Rutas de mantenimiento */}
                    <Route path="/MantUsuario" element={<MantenimientoUsuario />} />
                    <Route path="/MantEmpleado" element={<MantenimientoEmpleado />} />
                    <Route path="/MantTipoProductos" element={<Mantenimientotipoproductos />} />
                    <Route path="/MantProveedores" element={<Mantenimientoproveedores />} />
                    <Route path="/MantMaquinaria" element={<Mantenimientomaquinaria />} />
                    <Route path="/MantProductos" element={<Mantenimientoproducto />} />
                    {/* Ruta para Seguimiento de Productos */}
                    <Route path="/SeguimientoProductos" element={<SeguimientoProductos />} />
                    <Route path="/ListaEmpleados" element={<ListaEmpleados />} />
                    <Route path="/Reportes" element={<Reportes />} />
                </Routes>
            </div>
        </div>
    );
};

export default MainPage;