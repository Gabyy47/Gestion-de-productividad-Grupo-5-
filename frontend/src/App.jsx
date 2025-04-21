import React, { useState }from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './mainpage.jsx';
import MantUsuarios from './mantenimientousuarios.jsx';
import MantenimientoEmpleados from './mantenimientoempleados.jsx';
import Login from './Login.jsx';
import RecoveryForm from './RecoveryForm';
import MantTipoProductos from './mantenimientotipoproductos.jsx';
import MantProveedores from "./mantenimientoproveedores.jsx"; 
import MantMaquinaria from './mantenimientomaquinaria.jsx';
import MantProductos from './mantenimientoproductos.jsx';
import SeguimientoProductos from './SeguimientoProductos.jsx';
import ListaEmpleados from './ListaEmpleados.jsx';
import Dashboard from './Dashboard.jsx';


const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  //const navigate = useNavigate(); // Ahora useNavigate está definido
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token'); // Elimina el token del localStorage
    //navigate('/login'); // Redirige a la página de inicio de sesión
  };
  return (
    <Router>
      <Routes>
        {/* Define las rutas */}
        <Route path="/" element={token ? <MainPage onLogout={handleLogout} /> : <Login onLogin={handleLogin} />} />
        <Route path="/MantUsuario" element={token ? <MantUsuarios /> : <Login onLogin={handleLogin} />} />
        <Route path="/MantEmpleado" element={token ? <MantenimientoEmpleados /> : <Login onLogin={handleLogin} />} />
        <Route path="/MantTipoProductos" element={token ? <MantTipoProductos />: <Login onLogin={handleLogin} />} />
        <Route path="/Mantproveedores" element={token ? <MantProveedores />: <Login onLogin={handleLogin} /> } /> 
        <Route path="/MantMaquinaria" element={token ? <MantMaquinaria />: <Login onLogin={handleLogin} />} />
        <Route path="/MantProductos" element={token ? <MantProductos/>: <Login onLogin={handleLogin}/>} />
        <Route path="/SeguimientoProductos" element={token ? <SeguimientoProductos/>: <Login onLogin={handleLogin}/>} />
        <Route path="/ListaEmpleados" element={token ? <ListaEmpleados/>: <Login onLogin={handleLogin}/>} />
        <Route path="/Dashboard" element={token ? <Dashboard/>: <Login onLogin={handleLogin}/>} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/recovery" element={<RecoveryForm />} />
      </Routes>
    </Router>
  );
};


export default App;