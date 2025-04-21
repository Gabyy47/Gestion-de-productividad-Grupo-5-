import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const BASE_URL = "http://localhost:49146/api/";

Modal.setAppElement("#root");

const MaquinariaApp = () => {
  const [items, setItems] = useState([]);
  const [newNombre, setNewNombre] = useState("");
  const [newModelo, setNewModelo] = useState("");
  const [newMarca, setNewMarca] = useState("");
  const [newIdProveedor, setNewIdProveedor] = useState("");
  const [newFechaAdquisicion, setNewFechaAdquisicion] = useState("");
  const [newEstado, setNewEstado] = useState("Operativa");
  const [newCosto, setNewCosto] = useState("");
  const [newUbicacion, setNewUbicacion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  // Obtener datos de maquinaria
  const fetchMaquinaria = async () => {
    try {
      const response = await axios.get(`${BASE_URL}maquinaria`);
      setItems(response.data);
    } catch {
      toast.error("Error al cargar los datos");
    }
  };

  useEffect(() => {
    fetchMaquinaria();
  }, []);

  // Crear maquinaria
  const handleCreate = () => {
    if (newNombre && newModelo && newMarca && newIdProveedor && newFechaAdquisicion && newEstado && newCosto && newUbicacion) {
      axios
        .post(`${BASE_URL}maquinaria`, {
          nombre: newNombre,
          modelo: newModelo,
          marca: newMarca,
          id_proveedor: newIdProveedor,
          fecha_adquisicion: newFechaAdquisicion,
          estado: newEstado,
          costo: newCosto,
          ubicacion: newUbicacion,
        })
        .then((response) => {
          toast.success("¡Guardado con éxito!");
          setItems([...items, response.data]);
          closeModal();
        })
        .catch(() => toast.error("Error al guardar datos"));
    } else {
      toast.error("Por favor completa todos los campos");
    }
  };

  // Eliminar maquinaria
  const handleDelete = (id) => {
    if (window.confirm("¿Deseas eliminar esta maquinaria?")) {
      axios
        .delete(`${BASE_URL}maquinaria/${id}`)
        .then(() => {
          toast.success("Registro eliminado con éxito");
          setItems(items.filter((item) => item.id_maquinaria !== id));
        })
        .catch(() => toast.error("Error al eliminar el registro"));
    }
  };

  // Actualizar maquinaria
  const handleUpdate = () => {
    const { nombre, modelo, marca, id_proveedor, fecha_adquisicion, estado, costo, ubicacion } = { 
      newNombre, newModelo, newMarca, newIdProveedor, newFechaAdquisicion, newEstado, newCosto, newUbicacion 
    };

    axios.put(`${BASE_URL}maquinaria/${editItemId}`, { 
      nombre,
      modelo,
      marca,
      id_proveedor,
      fecha_adquisicion,
      estado,
      costo,
      ubicacion
    })
    .then(() => {
      toast.success("¡Guardado con éxito!");
      setItems((prevItems) => prevItems.map((item) => 
        item.id_maquinaria === editItemId ? 
        { ...item, nombre, modelo, marca, id_proveedor, fecha_adquisicion, estado, costo, ubicacion } 
        : item
      ));
      closeEditModal();
    })
    .catch((error) => {
      toast.error("Error al guardar el registro");
      console.log("Error al actualizar el item:", error);
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = (item) => {
    setEditItemId(item.id_maquinaria);
    setNewNombre(item.nombre);
    setNewModelo(item.modelo);
    setNewMarca(item.marca);
    setNewIdProveedor(item.id_proveedor);
    setNewFechaAdquisicion(item.fecha_adquisicion);
    setNewEstado(item.estado);
    setNewCosto(item.costo);
    setNewUbicacion(item.ubicacion);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false);

  return (
    <div>
      <h1>Mantenimiento MAQUINARIA(CRUD)</h1>
      <div className="col-30">
        <div className="card">
          <Link to="/">Volver al Menú Principal</Link>
          <button onClick={openModal}>Nuevo</button>

          {/* Tabla de maquinaria */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Nombre</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Modelo</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Marca</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Proveedor</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Fecha</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Estado</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Costo</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Ubicación</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id_maquinaria}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.id_maquinaria}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.nombre}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.modelo}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.marca}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.id_proveedor}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.fecha_adquisicion}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.estado}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>${item.costo}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.ubicacion}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button onClick={() => openEditModal(item)} style={{ backgroundColor: "yellow", marginRight: "5px", color: 'black'}}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(item.id_maquinaria)} style={{ backgroundColor: "red", color: "white" }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Agregar */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <h2>Agregar Maquinaria</h2>
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder="Nombre" />
        <input type="text" value={newModelo} onChange={(e) => setNewModelo(e.target.value)} placeholder="Modelo" />
        <input type="text" value={newMarca} onChange={(e) => setNewMarca(e.target.value)} placeholder="Marca" />
        <input type="number" value={newIdProveedor} onChange={(e) => setNewIdProveedor(e.target.value)} placeholder="ID Proveedor" />
        <input type="date" value={newFechaAdquisicion} onChange={(e) => setNewFechaAdquisicion(e.target.value)} />
        <select value={newEstado} onChange={(e) => setNewEstado(e.target.value)}>
          <option value="Operativa">Operativa</option>
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Fuera de servicio">Fuera de servicio</option>
        </select>
        <input type="number" value={newCosto} onChange={(e) => setNewCosto(e.target.value)} placeholder="Costo" />
        <input type="text" value={newUbicacion} onChange={(e) => setNewUbicacion(e.target.value)} placeholder="Ubicación" />
        <button onClick={handleCreate}>Guardar</button>
        <button onClick={closeModal}>Cerrar</button>
      </Modal>

      {/* Modal para Editar */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal}>
        <h2>Editar Maquinaria</h2>
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder="Nombre" />
        <input type="text" value={newModelo} onChange={(e) => setNewModelo(e.target.value)} placeholder="Modelo" />
        <input type="text" value={newMarca} onChange={(e) => setNewMarca(e.target.value)} placeholder="Marca" />
        <input type="number" value={newIdProveedor} onChange={(e) => setNewIdProveedor(e.target.value)} placeholder="ID Proveedor" />
        <input type="date" value={newFechaAdquisicion} onChange={(e) => setNewFechaAdquisicion(e.target.value)} />
        <select value={newEstado} onChange={(e) => setNewEstado(e.target.value)}>
          <option value="Operativa">Operativa</option>
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Fuera de servicio">Fuera de servicio</option>
        </select>
        <input type="number" value={newCosto} onChange={(e) => setNewCosto(e.target.value)} placeholder="Costo" />
        <input type="text" value={newUbicacion} onChange={(e) => setNewUbicacion(e.target.value)} placeholder="Ubicación" />
        <button onClick={handleUpdate}>Actualizar</button>
        <button onClick={closeEditModal}>Cerrar</button>
      </Modal>

      <ToastContainer autoClose={3000} 
      hideProgressBar={false} 
      closeOnClick 
      pauseOnHover 
      draggable 
      draggablePercent={60} />
    </div>
  );
};

export default MaquinariaApp;
