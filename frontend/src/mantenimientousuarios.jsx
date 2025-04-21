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
  //const [newId, setNewId] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newApellido, setNewApellido] = useState("");
  const [newNombre_usuario, setNewNombre_usuario] = useState("");
  const [newCorreo, setNewCorreo] = useState("");
  const [newContraseña, setNewContraseña] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}usuario`);
      setItems(response.data);
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
    if(newNombre.trim() && newApellido.trim() && newNombre_usuario.trim() && newCorreo.trim() && newContraseña.trim()) {
      axios.post(`${BASE_URL}usuarios`, {
        nombre: newNombre,
        apellido: newApellido,
        nombre_usuario: newNombre_usuario,
        correo: newCorreo,
        contraseña: newContraseña
      })
      .then((response) => {
        toast.success('¡Guardado con éxito!');
        setItems((prevItems) => [...prevItems, response.data]);
        closeModal();
      })
      .catch((error) => {
        toast.error('Error al guardar datos');
        console.log("Error al crear el item:", error);
      });
    } else {
      toast.error('Por favor completa todos los campos');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      axios.delete(`${BASE_URL}usuario/${id}`)
        .then(() => {
          toast.success('Registro eliminado con éxito');
          setItems((prevItems) => prevItems.filter((item) => item.id_usuario !== id));
        })
        .catch((error) => {
          toast.error('Error al eliminar el registro');
          console.log("Error al eliminar el item:", error);
        });
    }
  };

  const handleUpdate = () => {
    const { nombre, apellido, nombre_usuario, correo, contraseña } = { newNombre, newApellido, newNombre_usuario, newCorreo, newContraseña };
    axios.put(`${BASE_URL}usuario/${editItemId}`, {
      nombre,
      apellido,
      nombre_usuario,
      correo,
      contraseña
    })
    .then(() => {
      toast.success('¡Guardado con éxito!');
      setItems((prevItems) => prevItems.map((item) => 
        item.id_usuario === editItemId ? { ...item, nombre, apellido, nombre_usuario, correo, contraseña } : item
      ));
      closeEditModal();
    })
    .catch((error) => {
      toast.error('Error al guardar el registro');
      console.log("Error al actualizar el item:", error);
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewNombre("");
    setNewApellido("");
    setNewNombre_usuario("");
    setNewCorreo("");
    setNewContraseña("");
  };

  const openEditModal = (item) => {
    setEditItemId(item.id_usuario); // Asegúrate de usar el campo correcto
    setNewNombre(item.nombre);
    setNewApellido(item.apellido);
    setNewNombre_usuario(item.nombre_usuario);
    setNewCorreo(item.correo);
    setNewContraseña(item.contraseña);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditItemId(null);
  };

  return (
    <div>
      <h1>Mantenimiento Usuario LIV (CRUD)</h1>
      {/* Link para regresar a la página principal */}
      <Link to="/">Volver al Menú Principal</Link>

      <button onClick={openModal}>Nuevo</button>

      {/* Modal para crear usuario */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
      <div
                        class="col-20">
                    <div class="card">
                        <div class="card-header">Usuario</div>
                        <div class="card-body">
                        <h2>Crear Usuario</h2>
                        <button class="btn btn-success" onClick={handleCreate}style={{marginRight:'5px'}}> Guardar </button>
                        <button class="btn btn-secondary" onClick={closeModal}style={{marginLeft:'5px'}}> Cerrar </button>          
                        <span style={{ marginRight: '10px' }}></span> 
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder='Nombre' />
        <input type="text" value={newApellido} onChange={(e) => setNewApellido(e.target.value)} placeholder='Apellido' />
        <input type="text" value={newNombre_usuario} onChange={(e) => setNewNombre_usuario(e.target.value)} placeholder='Nombre_usuario' />
        <input type="text" value={newCorreo} onChange={(e) => setNewCorreo(e.target.value)} placeholder='Correo' />
        <input type="password" value={newContraseña} onChange={(e) => setNewContraseña(e.target.value)} placeholder='Contraseña' />
        </div>
                        <div class="card-footer text-muted"></div>
                     </div>
                    </div>

      </Modal>

      {/* Modal para editar usuario */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal}>
      <div
                        class="col-20">
                    <div class="card">
                        <div class="card-header">Usuario</div>
                        <div class="card-body">
                        <h2>Editar Usuario</h2>
        <button class="btn btn-success" onClick={handleUpdate}style={{marginRight:'5px'}}> Guardar </button>
        <button class="btn btn-secondary" onClick={closeEditModal}style={{marginLeft:'5px'}}> Cerrar </button>
        <span style={{ marginRight: '10px' }}></span>
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder='Nombre' />
        <input type="text" value={newApellido} onChange={(e) => setNewApellido(e.target.value)} placeholder='Apellido' />
        <input type="text" value={newNombre_usuario} onChange={(e) => setNewNombre_usuario(e.target.value)} placeholder='Nombre_usuario' />
        <input type="text" value={newCorreo} onChange={(e) => setNewCorreo(e.target.value)} placeholder='Correo' />
        <input type="password" value={newContraseña} onChange={(e) => setNewContraseña(e.target.value)} placeholder='Contraseña' />
        </div>
                        <div class="card-footer text-muted"></div>
                     </div>
                    </div>
      </Modal>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Apellido</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre_Usuario</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Correo</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Contraseña</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
            
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id_usuario}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.id_usuario}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.nombre}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.apellido}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.nombre_usuario}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.correo}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.contraseña}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button onClick={() => openEditModal(item)} style={{ backgroundColor: 'yellow', marginRight: '5px' }}>Editar</button>
                <button onClick={() => handleDelete(item.id_usuario)} style={{ backgroundColor: 'red', color: 'white' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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