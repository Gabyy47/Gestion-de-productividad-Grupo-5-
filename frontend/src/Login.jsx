import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:49146/api/';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

const Login = ({ onLogin }) => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Enviando solicitud POST a /verificar-usuario...");
            const usuarioResponse = await api.post('/verificar-usuario', {
                nombre_usuario: nombreUsuario,
            });

            console.log("Respuesta de /verificar-usuario:", usuarioResponse);

            if (!usuarioResponse.data.existe) {
                alert('Usuario no encontrado');
                return;
            }

            console.log("Enviando solicitud POST a /login...");
            const loginResponse = await axios.post(`${BASE_URL}login`, {
                nombre_usuario: nombreUsuario,
                contraseña: contrasena,
            });

            console.log("Respuesta de /login:", loginResponse);

            if (loginResponse.status === 200) {
                const token = loginResponse.data.token;
                console.log("Token recuperado:", token);
                localStorage.setItem("token", token);
                console.log("Token almacenado en localStorage");
                onLogin(token);
                navigate('/');
            } else {
                alert(loginResponse.data.mensaje || 'Error de inicio de sesión');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de inicio de sesión');
        }
    };

    return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', paddingRight: '20px' }}>
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginLeft: 'auto', marginRight: '50px' }}>
        <input
            type="text"
            placeholder="Nombre de usuario"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            style={{ marginBottom: '10px', padding: '8px', borderRadius: '3px', border: '1px solid #ddd' }}
        />
        <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            style={{ marginBottom: '10px', padding: '8px', borderRadius: '3px', border: '1px solid #ddd' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Iniciar sesión
        </button>
    </form>
</div>
    );
};

export default Login;