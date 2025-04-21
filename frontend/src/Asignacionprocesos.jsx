import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';

const AsignacionProcesos = () => {
    const [empleados, setEmpleados] = useState([]);
    const [tiposRopa, setTiposRopa] = useState([]);
    const [tiposEstampado, setTiposEstampado] = useState([]);
    const [tiposDefecto, setTiposDefecto] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
    const [procesosAsignados, setProcesosAsignados] = useState({ ropa: [], estampado: [], genero: [], defecto: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [
                    empleadosResponse,
                    tiposRopasResponse,
                    tiposEstampadoResponse,
                    tiposDefectoResponse,
                ] = await Promise.all([
                    axios.get('/api/empleados'), // Reemplaza con tu endpoint real de empleados
                    axios.get('/api/tipos_ropas'),
                    axios.get('/api/tipos_estampado'),
                    axios.get('/api/tipos_defecto'),
                ]);
                setEmpleados(empleadosResponse.data);
                setTiposRopa(tiposRopasResponse.data);
                setTiposEstampado(tiposEstampadoResponse.data);
                setTiposDefecto(tiposDefectoResponse.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Error al cargar los datos iniciales.');
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchEmpleadoProcesos = async () => {
            if (empleadoSeleccionado) {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`/api/empleados/${empleadoSeleccionado}/procesos`);
                    setProcesosAsignados(response.data);
                    setLoading(false);
                } catch (err) {
                    setError(err.message || 'Error al cargar los procesos del empleado.');
                    setLoading(false);
                }
            } else {
                setProcesosAsignados({ ropa: [], estampado: [], genero: [], defecto: [] });
            }
        };

        fetchEmpleadoProcesos();
    }, [empleadoSeleccionado]);

    const handleEmpleadoChange = (event) => {
        setEmpleadoSeleccionado(event.target.value);
    };

    const handleProcesoChange = (tipo, id, checked) => {
        setProcesosAsignados(prevState => ({
            ...prevState,
            [tipo]: checked
                ? [...prevState[tipo], id]
                : prevState[tipo].filter(itemId => itemId !== id),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (empleadoSeleccionado) {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.post(`/api/empleados/${empleadoSeleccionado}/procesos`, procesosAsignados);
                alert(response.data.message);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || err.message || 'Error al guardar los procesos del empleado.');
                setLoading(false);
            }
        } else {
            alert('Por favor, selecciona un empleado.');
        }
    };

    if (loading) {
        return <div>Cargando datos...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Asignación de Procesos a Empleados</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="empleado">Seleccionar Empleado:</label>
                    <select id="empleado" value={empleadoSeleccionado} onChange={handleEmpleadoChange}>
                        <option value="">-- Seleccionar --</option>
                        {empleados.map(empleado => (
                            <option key={empleado.id_empleado} value={empleado.id_empleado}>{empleado.nombre} {empleado.apellido}</option>
                        ))}
                    </select>
                </div>

                {empleadoSeleccionado && (
                    <div>
                        <h3>Asignar Tipos de Ropa:</h3>
                        {tiposRopa.map(ropa => (
                            <div key={ropa.id}>
                                <input
                                    type="checkbox"
                                    id={`ropa-${ropa.id}`}
                                    value={ropa.id}
                                    checked={procesosAsignados.ropa.some(r => r.id === ropa.id)}
                                    onChange={(e) => handleProcesoChange('ropa', ropa.id, e.target.checked)}
                                />
                                <label htmlFor={`ropa-${ropa.id}`}>{ropa.nombre}</label>
                            </div>
                        ))}

                        <h3>Asignar Tipos de Estampado:</h3>
                        {tiposEstampado.map(estampado => (
                            <div key={estampado.id}>
                                <input
                                    type="checkbox"
                                    id={`estampado-${estampado.id}`}
                                    value={estampado.id}
                                    checked={procesosAsignados.estampado.some(e => e.id === estampado.id)}
                                    onChange={(e) => handleProcesoChange('estampado', estampado.id, e.target.checked)}
                                />
                                <label htmlFor={`estampado-${estampado.id}`}>{estampado.nombre}</label>
                            </div>
                        ))}

                        <h3>Asignar Tipos de Defecto Permitidos:</h3>
                        {tiposDefecto.map(defecto => (
                            <div key={defecto.id}>
                                <input
                                    type="checkbox"
                                    id={`defecto-${defecto.id}`}
                                    value={defecto.id}
                                    checked={procesosAsignados.defecto.some(d => d.id === defecto.id)}
                                    onChange={(e) => handleProcesoChange('defecto', defecto.id, e.target.checked)}
                                />
                                <label htmlFor={`defecto-${defecto.id}`}>{defecto.nombre}</label>
                            </div>
                        ))}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Asignación'}
                        </button>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </div>
                )}
            </form>
        </div>
    );
};

export default AsignacionProcesos;