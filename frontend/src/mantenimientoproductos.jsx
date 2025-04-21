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
  const [newUnidad_medida, setNewUnidad_medida] = useState("");
  const [newProveedor, setNewProveedor] = useState("");
  const [newPrecio_unitario, setNewPrecio_unitario] = useState("");
  const [newCantidad_stock, setNewCantidad_stock] = useState("");
  const [newFecha_ultima_compra, setNewFecha_ultima_compra] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}Productos`);
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
    if(newNombre.trim() && newUnidad_medida.trim() && newProveedor.trim() && newPrecio_unitario.trim() && newCantidad_stock.trim() && newFecha_ultima_compra.trim()) {
      axios.post(`${BASE_URL}Productos`, {
        nombre: newNombre,
        unidad_medida: newUnidad_medida,
        proveedor: newProveedor,
        precio_unitario: newPrecio_unitario,
        cantidad_stock: newCantidad_stock,
        fecha_ultima_compra: newFecha_ultima_compra
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
      axios.delete(`${BASE_URL}Productos/${id}`)
        .then(() => {
          toast.success('Registro eliminado con éxito');
          setItems((prevItems) => prevItems.filter((item) => item.id_producto !== id));
        })
        .catch((error) => {
          toast.error('Error al eliminar el registro');
          console.log("Error al eliminar el item:", error);
        });
    }
  };

  const handleUpdate = () => {
    const { nombre, unidad_medida, proveedor, precio_unitario, cantidad_stock, fecha_ultima_compra } = { newNombre, newUnidad_medida, newProveedor, newPrecio_unitario, newCantidad_stock, newFecha_ultima_compra };
    axios.put(`${BASE_URL}Productos/${editItemId}`, {
      id_producto:editItemId,
      nombre,
      unidad_medida,
      proveedor,
      precio_unitario,
      cantidad_stock,
      fecha_ultima_compra
    })
    .then(() => {
      toast.success('¡Guardado con éxito!');
      setItems((prevItems) => prevItems.map((item) => 
        item.id_producto === editItemId ? { ...item, nombre, unidad_medida, proveedor, precio_unitario, cantidad_stock, fecha_ultima_compra } : item
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
    setNewUnidad_medida("");
    setNewProveedor("");
    setNewPrecio_unitario("");
    setNewCantidad_stock("");
    setNewFecha_ultima_compra("");
  };

  const openEditModal = (item) => {
    setEditItemId(item.id_producto); // Asegúrate de usar el campo correcto
    setNewNombre(item.nombre);
    setNewUnidad_medida(item.unidad_medida);
    setNewProveedor(item.proveedor);
    setNewPrecio_unitario(item.precio_unitario);
    setNewCantidad_stock(item.cantidad_stock);
    setNewFecha_ultima_compra(item.fecha_ultima_compra);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditItemId(null);
  };

  return (
    <div>
      <h1>Mantenimiento PRODUCTOS (CRUD)</h1>
      {/* Link para regresar a la página principal */}
      <Link to="/"> Volver al Menú Principal </Link>
      <button onClick={openModal}>Nuevo</button>

      {/* Modal para crear un producto */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <h2>Crear Producto</h2>
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder='Nombre' />
        <input type="text" value={newUnidad_medida} onChange={(e) => setNewUnidad_medida(e.target.value)} placeholder='Unidad Medida' />
        <input type="text" value={newProveedor} onChange={(e) => setNewProveedor(e.target.value)} placeholder='Proveedor' />
        <input type="text" value={newPrecio_unitario} onChange={(e) => setNewPrecio_unitario(e.target.value)} placeholder='Precio Unitario' />
        <input type="text" value={newCantidad_stock} onChange={(e) => setNewCantidad_stock(e.target.value)} placeholder='Cantidad Stock' />
        <input type="date" value={newFecha_ultima_compra} onChange={(e) => setNewFecha_ultima_compra(e.target.value)} placeholder='Fecha Ultima Compra' />
        <button onClick={handleCreate}>Guardar</button>
        <button onClick={closeModal}>Cerrar</button>
      </Modal>

      {/* Modal para editar productos */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal}>
        <h2>Editar Producto</h2>
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder='Nombre' />
        <input type="text" value={newUnidad_medida} onChange={(e) => setNewUnidad_medida(e.target.value)} placeholder='Unidad Medida' />
        <input type="text" value={newProveedor} onChange={(e) => setNewProveedor(e.target.value)} placeholder='Proveedor' />
        <input type="text" value={newPrecio_unitario} onChange={(e) => setNewPrecio_unitario(e.target.value)} placeholder='Precio_Unitario' />
        <input type="text" value={newCantidad_stock} onChange={(e) => setNewCantidad_stock(e.target.value)} placeholder='Cantidad_Stock' />
        <input type="date" value={newFecha_ultima_compra} onChange={(e) => setNewFecha_ultima_compra(e.target.value)} placeholder='Fecha_Ultima_Compra' />
        <button onClick={handleUpdate}>Guardar</button>
        <button onClick={closeEditModal}>Cerrar</button>
      </Modal>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>id_producto</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>unidad_medida</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Proveedor</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Precio_Unitario</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>cantidad_stock</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fecha_Ultima_Compra</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id_producto}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.id_producto}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.nombre}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.unidad_medida}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.proveedor}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.precio_unitario}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.cantidad_stock}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.fecha_ultima_compra}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button onClick={() => openEditModal(item)} style={{ backgroundColor: 'yellow', marginRight: '5px' }}>Editar</button>
                <button onClick={() => handleDelete(item.id_producto)} style={{ backgroundColor: 'red', color: 'white' }}>Eliminar</button>
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
