import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const BASE_URL = "http://localhost:49146/api/";

Modal.setAppElement ('#root');

const App = () => {
  const [items, setItems] = useState([]);
  //const [newId, setNewId] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newCantidad, setNewCantidad] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}tipo_productos`);
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
    if(newNombre.trim() && newCantidad.trim()) {
      axios.post(`${BASE_URL}tipo_productos`, {
        nombre: newNombre,
        cantidad: newCantidad
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
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      axios.delete(`${BASE_URL}tipo_productos/${id}`)
        .then(() => {
          toast.success('Registro eliminado con éxito');
          setItems((prevItems) => prevItems.filter((item) => item.id_tipo_producto !== id));
        })
        .catch((error) => {
          toast.error('Error al eliminar el registro');
          console.log("Error al eliminar el item:", error);
        });
    }
  };

  const handleUpdate = () => {
    const { nombre, cantidad } = { newNombre, newCantidad};
    axios.put(`${BASE_URL}tipo_productos/${editItemId}`, { // Agrega editItemId a la URL
      nombre,
      cantidad
    })
    .then(() => {
      toast.success('¡Guardado con éxito!');
      setItems((prevItems) => prevItems.map((item) => 
        item.id_tipo_producto === editItemId ? { ...item, nombre, cantidad} : item
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
    setNewCantidad("");
  };

  const openEditModal = (item) => {
    setEditItemId(item.id_tipo_producto); // Asegúrate de usar el campo correcto
    setNewNombre(item.nombre);
    setNewCantidad(item.cantidad);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditItemId(null);
  };

  return (
    <><div>
      <h1>Mantenimiento TIPO PRODUCTOS (CRUD)</h1>
      {/* Link para regresar a la página principal */}
      <Link to="/"> Volver al Menú Principal </Link>

      <button onClick={openModal}> Nuevo </button> 

      {/* Modal para crear un tipo de producto */}
        <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <div
                        class="col-20">
                    <div class="card">
                        <div class="card-header">Tipo de productos</div>
                        <div class="card-body">
                        <h2>Crear tipo producto</h2>
                        <button class="btn btn-success" onClick={handleCreate}style={{marginRight:'5px'}}> Guardar </button>
                        <button class="btn btn-secondary" onClick={closeModal}style={{marginLeft:'5px'}}> Cerrar </button>          
                        <span style={{ marginRight: '10px' }}></span>                      
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder='Nombre' />
        <input type="text" value={newCantidad} onChange={(e) => setNewCantidad(e.target.value)} placeholder='Cantidad' />
                        </div>
                        <div class="card-footer text-muted"></div>
                     </div>
                    </div>
      </Modal>

      {/* Modal para editar tipo productos */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal}>
      <div
                        class="col-20">
                    <div class="card">
                        <div class="card-header">Tipo de productos</div>
                        <div class="card-body">
                        <h2>Editar tipo producto</h2>
        <button class="btn btn-success" onClick={handleUpdate}style={{marginRight:'5px'}}> Guardar </button>
        <button class="btn btn-secondary" onClick={closeEditModal}style={{marginLeft:'5px'}}> Cerrar </button>
        <span style={{ marginRight: '10px' }}></span>
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder='Nombre' />
        <input type="text" value={newCantidad} onChange={(e) => setNewCantidad(e.target.value)} placeholder='Cantidad' />
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
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cantidad</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id_tipo_producto}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.id_tipo_producto}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.nombre}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.cantidad}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button onClick={() => openEditModal(item)} style={{ backgroundColor: 'yellow', marginRight: '5px' }}>Editar</button>
                <button onClick={() => handleDelete(item.id_tipo_producto)} style={{ backgroundColor: 'red', color: 'white' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div><ToastContainer
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        draggablePercent={60} /></>
  );
};

export default App; 
