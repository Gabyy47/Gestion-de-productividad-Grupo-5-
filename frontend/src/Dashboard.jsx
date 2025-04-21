import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = "http://localhost:49146/api/";

const App = () => {
    const [empleados, setEmpleados] = useState([]);
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
    }, []);

    if (loading) {
        return <div>Cargando empleados...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="card" style={{ marginLeft: '300px' }}>
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
    );
};

export default App;