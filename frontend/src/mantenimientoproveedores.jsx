import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const BASE_URL = "http://localhost:49146/api/";

Modal.setAppElement('#root');

const App = () => {
  const [items, setItems] = useState([]);
  const [newNombre, setNewNombre] = useState("");
  const [newContacto, setNewContacto] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newCorreo, setNewCorreo] = useState("");
  const [newDireccion, setNewDireccion] = useState("");
  const [newPais, setNewPais] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}proveedores`);
      setItems(Array.isArray(response.data) ? response.data : response.data.data || []);
      console.log("Datos recibidos:", response.data);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error("Error al obtener los Items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = () => {
    if (
      newNombre.trim() &&
      newContacto.trim() &&
      newTelefono.trim() &&
      newCorreo.trim() &&
      newDireccion.trim() &&
      newPais.trim()
    ) {
      axios.post(`${BASE_URL}proveedores`, {
        nombre: newNombre,
        contacto: newContacto,
        telefono: newTelefono,
        correo: newCorreo,
        direccion: newDireccion,
        pais: newPais
      })
      .then(() => {
        toast.success('¡Proveedor guardado con éxito!');
        closeModal();
        fetchItems();
      })
      .catch((error) => {
        toast.error('Error al guardar el proveedor');
        console.log("Error al crear el proveedor:", error);
      });
    } else {
      toast.error('Por favor completa todos los campos');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      axios.delete(`${BASE_URL}proveedores/${id}`)
        .then(() => {
          toast.success('Proveedor eliminado con éxito');
          setItems((prevItems) => prevItems.filter((item) => item.id_proveedor !== id));
        })
        .catch((error) => {
          toast.error('Error al eliminar el proveedor');
          console.log("Error al eliminar el proveedor:", error);
        });
    }
  };

  const handleUpdate = () => {
    axios.put(`${BASE_URL}proveedores/${editItemId}`, {
      nombre: newNombre,
      contacto: newContacto,
      telefono: newTelefono,
      correo: newCorreo,
      direccion: newDireccion,
      pais: newPais
    })
    .then(() => {
      toast.success('¡Proveedor actualizado con éxito!');
      setItems((prevItems) => prevItems.map((item) => 
        item.id_proveedor === editItemId ? { ...item, nombre: newNombre, contacto: newContacto, telefono: newTelefono, correo: newCorreo, direccion: newDireccion, pais: newPais } : item
      ));
      closeEditModal();
    })
    .catch((error) => {
      toast.error('Error al actualizar el proveedor');
      console.log("Error al actualizar el proveedor:", error);
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openEditModal = (item) => {
    setEditItemId(item.id_proveedor);
    setNewNombre(item.nombre);
    setNewContacto(item.contacto);
    setNewTelefono(item.telefono);
    setNewCorreo(item.correo);
    setNewDireccion(item.direccion);
    setNewPais(item.pais);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewNombre("");
    setNewContacto("");
    setNewTelefono("");
    setNewCorreo("");
    setNewDireccion("");
    setNewPais("");
    setEditItemId(null);
  };

  return (
    <div className="container mt-4">
      <h1>Mantenimiento PROVEEDORES (CRUD)</h1>
      <Link to="/">Volver al Menú Principal</Link>
      <button className="btn btn-primary ms-3" onClick={openModal}>
        Nuevo
      </button>

      {/* Modal Crear */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <div className="card">
          <div className="card-header">Proveedor</div>
          <div className="card-body">
            <h2>Crear Proveedor</h2>
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
              <button className="btn btn-success" onClick={handleCreate}>Guardar</button>
              <button className="btn btn-secondary" onClick={closeModal}>Cerrar</button>
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newNombre} onChange={e => setNewNombre(e.target.value)} placeholder="Nombre" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newContacto} onChange={e => setNewContacto(e.target.value)} placeholder="Contacto" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newTelefono} onChange={e => setNewTelefono(e.target.value)} placeholder="Teléfono" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newCorreo} onChange={e => setNewCorreo(e.target.value)} placeholder="Correo" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newDireccion} onChange={e => setNewDireccion(e.target.value)} placeholder="Dirección" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newPais} onChange={e => setNewPais(e.target.value)} placeholder="País" />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal}>
        <div className="card">
          <div className="card-header">Proveedor</div>
          <div className="card-body">
            <h2>Editar Proveedor</h2>
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
              <button className="btn btn-success" onClick={handleUpdate}>Guardar</button>
              <button className="btn btn-secondary" onClick={closeEditModal}>Cerrar</button>
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newNombre} onChange={e => setNewNombre(e.target.value)} placeholder="Nombre" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newContacto} onChange={e => setNewContacto(e.target.value)} placeholder="Contacto" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newTelefono} onChange={e => setNewTelefono(e.target.value)} placeholder="Teléfono" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newCorreo} onChange={e => setNewCorreo(e.target.value)} placeholder="Correo" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newDireccion} onChange={e => setNewDireccion(e.target.value)} placeholder="Dirección" />
              <input type="text" className="form-control" style={{ maxWidth: '190px' }} value={newPais} onChange={e => setNewPais(e.target.value)} placeholder="País" />
            </div>
          </div>
        </div>
      </Modal>

      {/* Tabla de proveedores */}
      <div className="table-responsive mt-4">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Contacto</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Teléfono</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Correo</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Dirección</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>País</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id_proveedor}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.id_proveedor}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.nombre}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.contacto}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.telefono}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.correo}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.direccion}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.pais}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => openEditModal(item)} style={{ backgroundColor: 'yellow', padding: '4px 8px', marginRight: '5px' }}>Editar</button>
                  <button onClick={() => handleDelete(item.id_proveedor)} style={{ backgroundColor: 'red', color: 'white', padding: '4px 8px' }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastContainer
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        draggablePercent={60}
      />
    </div>
  );
};

export default App;
