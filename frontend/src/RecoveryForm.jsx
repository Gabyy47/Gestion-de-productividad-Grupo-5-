import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const RecoveryForm = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/recuperar-contrasena', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre_usuario: nombreUsuario, codigo }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.mensaje);
        navigate('/login'); // Redirige a la página de inicio de sesión
      } else {
        alert(data.mensaje || 'Error al recuperar contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al recuperar contraseña');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre de usuario"
        value={nombreUsuario}
        onChange={(e) => setNombreUsuario(e.target.value)}
      />
      <input
        type="text"
        placeholder="Código de Google Authenticator"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <button type="submit">Recuperar contraseña</button>
    </form>
  );
};

export default RecoveryForm;