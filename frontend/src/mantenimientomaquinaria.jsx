import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const BASE_URL = "http://localhost:49146/api/";
const LIMITE_MAQUINARIA = 10;

Modal.setAppElement('#root');

const MaquinariaApp = () => {
  const [items, setItems] = useState([]);
  const [newNombre, setNewNombre] = useState('');
  const [newModelo, setNewModelo] = useState('');
  const [newMarca, setNewMarca] = useState('');
  const [newIdProveedor, setNewIdProveedor] = useState('');
  const [newFechaAdquisicion, setNewFechaAdquisicion] = useState('');
  const [newEstado, setNewEstado] = useState('Operativa');
  const [newCosto, setNewCosto] = useState('');
  const [newUbicacion, setNewUbicacion] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  // Obtener datos de maquinaria
  const fetchMaquinaria = async () => {
    try {
      const response = await axios.get(`${BASE_URL}maquinaria`);
      setItems(response.data);
    } catch {
      toast.error('Error al cargar los datos');
    }
  };

  useEffect(() => {
    fetchMaquinaria();
  }, []);

  // Crear maquinaria
  const handleCreate = () => {
    if (items.length >= LIMITE_MAQUINARIA) {
      toast.warn(`Límite alcanzado: solo se permiten ${LIMITE_MAQUINARIA} maquinaria.`);
      return;
    }
  
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
          // lo que quieras hacer después
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      toast.error('Por favor, completa todos los campos.');
    }
  };
  

  // Eliminar maquinaria
  const handleDelete = (id) => {
    if (window.confirm('¿Deseas eliminar esta maquinaria?')) {
      axios
        .delete(`${BASE_URL}maquinaria/${id}`)
        .then(() => {
          toast.success('Registro eliminado con éxito');
          setItems(items.filter((item) => item.id_maquinaria !== id));
        })
        .catch(() => toast.error('Error al eliminar el registro'));
    }
  };

  // Actualizar maquinaria
  const handleUpdate = () => {
    const updatedItem = {
      nombre: newNombre,
      modelo: newModelo,
      marca: newMarca,
      id_proveedor: newIdProveedor,
      fecha_adquisicion: newFechaAdquisicion,
      estado: newEstado,
      costo: newCosto,
      ubicacion: newUbicacion,
    };

    axios.put(`${BASE_URL}maquinaria/${editItemId}`, updatedItem)
      .then(() => {
        toast.success('¡Guardado con éxito!');
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id_maquinaria === editItemId ? { ...item, ...updatedItem } : item
          )
        );
        closeEditModal();
      })
      .catch((error) => {
        toast.error('Error al guardar el registro');
        console.error('Error al actualizar el item:', error);
      });
  };

  // Función para generar el backup
  const handleBackupDB = async () => {
    try {
      const response = await axios.get(`${BASE_URL}maquinaria`);
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "backup_maquinaria.json";
      link.click();
      toast.success("Backup de BD descargado exitosamente.");
    } catch (error) {
      console.error("Error al generar el backup:", error);
      toast.error("Error al generar el backup.");
    }
  };

  // Función para restaurar la base de datos
  const handleRestoreDB = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = JSON.parse(event.target.result);
        await axios.post(`${BASE_URL}restore`, { data });
        toast.success("Base de datos restaurada con éxito.");
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error al restaurar la BD:", error);
      toast.error("Error al restaurar la BD.");
    }
  };

  // Generar reporte PDF
  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      doc.text('Reporte de Maquinaria', 20, 10);

      const tableHeaders = [['ID', 'Nombre', 'Modelo', 'Marca', 'Proveedor', 'Fecha Adquisición', 'Estado', 'Costo', 'Ubicación']];
      autoTable(doc, {
        head: tableHeaders,
        body: items.map(item => [
          item.id_maquinaria,
          item.nombre,
          item.modelo,
          item.marca,
          item.id_proveedor,
          item.fecha_adquisicion,
          item.estado,
          item.costo,
          item.ubicacion,
        ]),
      });

      doc.save('reporte-maquinaria.pdf');
      toast.success('PDF generado y guardado exitosamente.');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  // Generar reporte Excel
  const generateExcelReport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Maquinaria');

      worksheet.columns = [
        { header: 'ID', key: 'id_maquinaria', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Modelo', key: 'modelo', width: 20 },
        { header: 'Marca', key: 'marca', width: 20 },
        { header: 'Proveedor', key: 'id_proveedor', width: 20 },
        { header: 'Fecha Adquisición', key: 'fecha_adquisicion', width: 20 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Costo', key: 'costo', width: 15 },
        { header: 'Ubicación', key: 'ubicacion', width: 25 },
      ];

      items.forEach(item => {
        worksheet.addRow(item);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'reporte-maquinaria.xlsx');
      toast.success('Excel generado y guardado exitosamente.');
    } catch (error) {
      console.error('Error al generar el Excel:', error);
      toast.error('Error al generar el Excel');
    }
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
      <h1>Mantenimiento MAQUINARIA (CRUD)</h1>
      <div className="col-30">
        <div className="card">
          <Link to="/">Volver al Menú Principal</Link>
          <button
  className="btn btn-primary ms-3"
  onClick={openModal}
  disabled={items.length >= LIMITE_MAQUINARIA}
>
  Nuevo
</button>

{items.length >= LIMITE_MAQUINARIA && (
  <p className="text-danger mt-2">
    Has alcanzado el número máximo de maquinaria permitida.
</p>
)}

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

      {/* Botones de descarga */}
      <div style={{
  marginTop: '30px',
  display: 'flex',
  justifyContent: 'center',
  gap: '15px',
  flexWrap: 'wrap'
}}>
  <button
    onClick={generatePDFReport}
    style={{
      backgroundColor: '#e13031',
      color: '#fff',
      padding: '10px 20px',
      width: '200px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    Descargar PDF
  </button>
  <button
    onClick={generateExcelReport}
    style={{
      backgroundColor: '#1cc605',
      color: '#fff',
      padding: '10px 20px',
      width: '200px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    Descargar Excel
  </button>
  <button
    onClick={handleBackupDB}
    style={{
      backgroundColor: '#0044cc',
      color: '#fff',
      padding: '10px 20px',
      width: '200px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    Descargar Backup BD
  </button>
  <label style={{
    backgroundColor: '#cc4400',
    color: '#fff',
    padding: '10px 20px',
    width: '200px',
    textAlign: 'center',
    borderRadius: '5px',
    cursor: 'pointer'
  }}>
    Restaurar BD
    <input
      type="file"
      onChange={(e) => handleRestoreDB(e.target.files[0])}
      style={{ display: 'none' }}
    />
  </label>
</div>

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