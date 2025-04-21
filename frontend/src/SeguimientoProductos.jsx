import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = "http://localhost:49146/api/";

const App = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

    if (loading) {
        return <div>Cargando productos...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

   
    return (
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
    );
};

export default App;