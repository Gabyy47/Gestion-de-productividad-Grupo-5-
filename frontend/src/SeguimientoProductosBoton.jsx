// SeguimientoProductosBoton.js
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    return (
        <div className="mt-3">
            <Link to="/SeguimientoProductos" className="btn btn-primary">
                Seguimiento de Productos
            </Link>
        </div>
    );
};

export default App;