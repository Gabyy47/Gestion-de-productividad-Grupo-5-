import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const BASE_URL = "http://localhost:49146/api/";
const LIMITE_PROVEEDORES = 10;
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

  const listaPaises = [
    "Honduras", "El Salvador", "Guatemala", "Nicaragua", "Costa Rica", "Panamá",
    "México", "Colombia", "Argentina", "Brasil", "España", "Estados Unidos",
    "Canadá", "Francia", "Alemania", "Italia", "Reino Unido", "Japón", "China",
    "India", "Chile", "Uruguay", "Paraguay", "Venezuela", "Perú", "Ecuador"
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}proveedores`);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setItems(data);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error("Error al obtener los proveedores:", error);
    }
  };

  const handleCreate = () => {
    if (items.length >= LIMITE_PROVEEDORES) {
      toast.warn(`Límite alcanzado: solo se permiten ${LIMITE_PROVEEDORES} proveedores.`);
      return;
    }

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
        toast.success('Proveedor guardado con éxito');
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
      toast.success('Proveedor actualizado con éxito');
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

  const generatePDFReport = () => {
    try {
      if (!items || items.length === 0) {
        toast.warn('No hay datos para generar el reporte');
        return;
      }
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('📄 Reporte de Proveedores', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      const tableHeaders = [['ID', 'Nombre', 'Contacto', 'Teléfono', 'Correo', 'Dirección', 'País']];
      const tableData = items.map(item => [
        item.id_proveedor,
        item.nombre,
        item.contacto,
        item.telefono,
        item.correo,
        item.direccion,
        item.pais
      ]);

      autoTable(doc, {
        startY: 25,
        head: tableHeaders,
        body: tableData,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [52, 73, 94], textColor: 255, halign: 'center' },
      });

      doc.save('reporte-proveedores.pdf');
      toast.success('PDF generado y guardado exitosamente.');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  const generateExcelReport = async () => {
    try {
      if (!items || items.length === 0) {
        toast.warn('No hay datos para generar el reporte');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Proveedores');

      worksheet.columns = [
        { header: 'ID', key: 'id_proveedor', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 25 },
        { header: 'Contacto', key: 'contacto', width: 20 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Correo', key: 'correo', width: 30 },
        { header: 'Dirección', key: 'direccion', width: 30 },
        { header: 'País', key: 'pais', width: 15 },
      ];

      items.forEach(item => worksheet.addRow(item));

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'reporte-proveedores.xlsx');
      toast.success('Excel generado y guardado exitosamente.');
    } catch (error) {
      console.error('Error al generar el Excel:', error);
      toast.error('Error al generar el Excel');
    }
  };

  return (
    <div className="container mt-4">
      <h1>Mantenimiento PROVEEDORES (CRUD)</h1>
      <Link to="/">Volver al Menú Principal</Link>
      <button className="btn btn-primary ms-3" onClick={openModal} disabled={items.length >= LIMITE_PROVEEDORES}>
        Nuevo
      </button>
      {items.length >= LIMITE_PROVEEDORES && (
        <p className="text-danger mt-2">Has alcanzado el número máximo de proveedores permitidos.</p>
      )}
  
      {items.length === 0 ? (
        <p className="text-muted mt-4">No hay proveedores registrados.</p>
      ) : (
        <>
          <div className="table-responsive mt-4">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Dirección</th>
                  <th>País</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id_proveedor}>
                    <td>{item.id_proveedor}</td>
                    <td>{item.nombre}</td>
                    <td>{item.contacto}</td>
                    <td>{item.telefono}</td>
                    <td>{item.correo}</td>
                    <td>{item.direccion}</td>
                    <td>{item.pais}</td>
                    <td>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => openEditModal(item)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id_proveedor)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
            <button onClick={generatePDFReport} className="btn btn-danger">Descargar PDF</button>
            <button onClick={generateExcelReport} className="btn btn-success">Descargar Excel</button>
          </div>
        </>
      )}
  
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <div className="card">
          <div className="card-header">Crear Proveedor</div>
          <div className="card-body">
            <input className="form-control mb-2" value={newNombre} onChange={e => setNewNombre(e.target.value)} placeholder="Nombre" />
            <input className="form-control mb-2" value={newContacto} onChange={e => setNewContacto(e.target.value)} placeholder="Contacto" />
            <input className="form-control mb-2" value={newTelefono} onChange={e => setNewTelefono(e.target.value)} placeholder="Teléfono" />
            <input className="form-control mb-2" value={newCorreo} onChange={e => setNewCorreo(e.target.value)} placeholder="Correo" />
            <input className="form-control mb-2" value={newDireccion} onChange={e => setNewDireccion(e.target.value)} placeholder="Dirección" />
            <select className="form-control mb-2" value={newPais} onChange={e => setNewPais(e.target.value)}>
              <option value="">Seleccione un país</option>
              {listaPaises.map((pais, index) => (
                <option key={index} value={pais}>{pais}</option>
              ))}
            </select>
            <button className="btn btn-success me-2" onClick={handleCreate}>Guardar</button>
            <button className="btn btn-secondary" onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      </Modal>
  
      
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal}>
        <div className="card">
          <div className="card-header">Editar Proveedor</div>
          <div className="card-body">
            <input className="form-control mb-2" value={newNombre} onChange={e => setNewNombre(e.target.value)} placeholder="Nombre" />
            <input className="form-control mb-2" value={newContacto} onChange={e => setNewContacto(e.target.value)} placeholder="Contacto" />
            <input className="form-control mb-2" value={newTelefono} onChange={e => setNewTelefono(e.target.value)} placeholder="Teléfono" />
            <input className="form-control mb-2" value={newCorreo} onChange={e => setNewCorreo(e.target.value)} placeholder="Correo" />
            <input className="form-control mb-2" value={newDireccion} onChange={e => setNewDireccion(e.target.value)} placeholder="Dirección" />
            <select className="form-control mb-2" value={newPais} onChange={e => setNewPais(e.target.value)}>
              <option value="">Seleccione un país</option>
              {listaPaises.map((pais, index) => (
                <option key={index} value={pais}>{pais}</option>
              ))}
            </select>
            <button className="btn btn-success me-2" onClick={handleUpdate}>Guardar</button>
            <button className="btn btn-secondary" onClick={closeEditModal}>Cerrar</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default App;