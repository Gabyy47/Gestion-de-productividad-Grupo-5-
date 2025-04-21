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
const LIMITE_EMPLEADOS = 10;

Modal.setAppElement('#root');

const App = () => {
  const [items, setItems] = useState([]);
  //const [newId, setNewId] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newApellido, setNewApellido] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newCargo, setNewCargo] = useState("");
  const [newSalario, setNewSalario] = useState("");
  const [newEstado, setNewEstado] = useState("");
  const [newFecha_contratacion, setNewFecha_contratacion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}empleados`);
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
    const lettersOnlyRegex = /^[A-Za-z\s]+$/; // Expresión regular para solo letras y espacios
    const numbersOnlyRegex = /^[0-9]+$/; // Expresión regular para solo números
    if (items.length >= LIMITE_EMPLEADOS) {
      toast.warn('Límite alcanzado: solo se permiten ${LIMITE_EMPLEADOS} empleados.');
      return;
    }
    if (!lettersOnlyRegex.test(newNombre)) {
      toast.error('El nombre solo debe contener letras');
      return;
    }
    if (!lettersOnlyRegex.test(newApellido)) {
      toast.error('El apellido solo debe contener letras');
      return;
    }
    if (!numbersOnlyRegex.test(newTelefono)) {
      toast.error('El teléfono solo debe contener números');
      return;
    }
    if (!lettersOnlyRegex.test(newCargo)) {
      toast.error('El cargo solo debe contener letras');
      return;
    }
    if (!numbersOnlyRegex.test(newSalario)) {
      toast.error('El salario solo debe contener números');
      return;
    }
    if (!lettersOnlyRegex.test(newEstado)) {
      toast.error('El estado solo debe contener letras');
      return;
    }
    if (parseInt(newTelefono) < 0) {
      toast.error('El teléfono no puede ser negativo');
      return;
    }
    if (parseInt(newSalario) < 0) {
      toast.error('El salario no puede ser negativo');
      return;
    }
    if(newNombre.trim() && newApellido.trim() && newTelefono.trim() && newCargo.trim() && newSalario.trim() && newEstado.trim() && newFecha_contratacion.trim() ) {
      axios.post(`${BASE_URL}empleados`, {
        nombre: newNombre,
        apellido: newApellido,
        telefono: newTelefono,
        cargo: newCargo,
        salario: newSalario,
        estado: newEstado,
        fecha_contratacion: newFecha_contratacion
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

  const handleDelete = async (id) => {
    const employeeId = parseInt(id); // Definir employeeId
    console.log("ID a eliminar:", employeeId);
    if (window.confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
        toast.info('Eliminando empleado...');
        try {
            await axios.delete(`${BASE_URL}empleados/${employeeId}`); // Usar employeeId aquí
            toast.success('Registro eliminado con éxito');
            setItems((prevItems) => prevItems.filter((item) => item.id_empleado !== employeeId));
        } catch (error) {
            toast.error('Error al eliminar el registro');
            console.log("Error al eliminar el item:", error);
        }
    }
};

  const handleUpdate = () => {
    const lettersOnlyRegex = /^[A-Za-z\s]+$/;
    const numbersOnlyRegex = /^[0-9]+$/;

    if (!lettersOnlyRegex.test(newNombre)) {
      toast.error('El nombre solo debe contener letras');
      return;
    }
    if (!lettersOnlyRegex.test(newApellido)) {
      toast.error('El apellido solo debe contener letras');
      return;
    }
    if (!numbersOnlyRegex.test(newTelefono)) {
      toast.error('El teléfono solo debe contener números');
      return;
    }
    if (!lettersOnlyRegex.test(newCargo)) {
      toast.error('El cargo solo debe contener letras');
      return;
    }
    if (!numbersOnlyRegex.test(newSalario)) {
      toast.error('El salario solo debe contener números');
      return;
    }
    if (!lettersOnlyRegex.test(newEstado)) {
      toast.error('El estado solo debe contener letras');
      return;
    }
    if (parseInt(newTelefono) < 0) {
      toast.error('El teléfono no puede ser negativo');
      return;
    }
    if (parseInt(newSalario) < 0) {
      toast.error('El salario no puede ser negativo');
      return;
    }
    const { nombre, apellido, telefono, cargo, salario, estado, fecha_contratacion } = { newNombre, newApellido, newTelefono, newCargo, newSalario, newEstado, newFecha_contratacion };
    axios.put(`${BASE_URL}empleados/${editItemId}`, { // Agrega editItemId a la URL
      nombre,
      apellido,
      telefono,
      cargo,
      salario,
      estado,
      fecha_contratacion
    })
    .then(() => {
      toast.success('¡Guardado con éxito!');
      setItems((prevItems) => prevItems.map((item) => 
        item.id_empleado === editItemId ? { ...item, nombre, apellido, telefono, cargo, salario, estado, fecha_contratacion } : item
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
    setNewTelefono("");
    setNewCargo("");
    setNewSalario("");
    setNewEstado("");
    setNewFecha_contratacion("");
  };

  const openEditModal = (item) => {
    setEditItemId(item.id_empleado); // Asegúrate de usar el campo correcto
    setNewNombre(item.nombre);
    setNewApellido(item.apellido);
    setNewTelefono(item.telefono);
    setNewCargo(item.cargo);
    setNewSalario(item.salario);
    setNewEstado(item.estado);
    setNewFecha_contratacion(item.fecha_contratacion);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditItemId(null);
  };

  //GENERAR REPORTE PDF 
  const generatePDFReport = () => {
  try {
    console.log('Generando reporte PDF...');
    const doc = new jsPDF();
    doc.text('Reporte de Empleado', 20, 10);
    const tableHeaders = [['ID', 'Nombre', 'Apellido', 'Telefono', 'Cargo', 'Salario', 'Estado', 'Fecha Contratacion']];
    autoTable(doc,{
      head: tableHeaders,
      body: items.map(item => [
        item.id_empleado,
        item.nombre,
        item.apellido,
        item.telefono,
        item.cargo,
        item.salario,
        item.estado,
        item.fecha_contratacion
      ]),
    });
    // Guardar el documento como un archivo PDF
    doc.save('reporte-empleados.pdf');
    console.log('PDF generado y guardado exitosamente.');
    toast.success('PDF generado y guardado exitosamente.');
    } catch (error) {
    console.error('Error al generar el PDF:', error);
    toast.error('Error al generar el PDF');
     }
  };

  //GENERAR LOS REPORTES EXCEL
  // Función para generar el reporte en Excel
  async function generateExcelReport() {
    console.log('Generando reporte Excel...');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Empleados');
  
    worksheet.columns = [
      { header: 'ID', key: 'id_empleado', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Telefono', key: 'telefono', width: 30 },
      { header: 'Cargo', key: 'cargo', width: 15 },
      { header: 'Salario', key: 'salario', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Fecha Contratacion', key: 'fecha_contratacion', width: 20 },
    ];
  
    items.forEach(item => {
      worksheet.addRow(item);
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'reporte-empleados.xlsx');
    console.log('Excel generado y guardado exitosamente.');
    toast.success('Excel generado y guardado exitosamente.');
  }

  return (
    <div>
      <h1>Mantenimiento LIV (CRUD)- Empleados</h1>
      {/* Link para regresar a la página principal */}
      <Link to="/">Volver al Menú Principal</Link>
      <button
         className="btn btn-primary ms-3"
         onClick={openModal}
         disabled={items.length >= LIMITE_EMPLEADOS}
       >
          Nuevo
          </button>

{items.length >= LIMITE_EMPLEADOS && (
  <p className="text-danger mt-2">
    Has alcanzado el número máximo de empleados permitidos.
  </p>
)}


      <button onClick={openModal}>Nuevo</button>

      {/* Modal para crear empleado */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
      <div
                        className="col-20">
                    <div className="card">
                        <div className="card-header">Usuario</div>
                        <div className="card-body">
        <h2>Crear empleado</h2>
        <button className="btn btn-success" onClick={handleCreate}style={{marginRight:'5px'}}> Guardar </button>
                        <button className="btn btn-secondary" onClick={closeModal}style={{marginLeft:'5px'}}> Cerrar </button>          
                        <span style={{ marginRight: '10px' }}></span>
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder='Nombre' />
        <input type="text" value={newApellido} onChange={(e) => setNewApellido(e.target.value)} placeholder='Apellido' />
        <input type="text" value={newTelefono} onChange={(e) => setNewTelefono(e.target.value)} placeholder='Telefono' />
        <input type="text" value={newCargo} onChange={(e) => setNewCargo(e.target.value)} placeholder='Cargo' />
        <input type="text" value={newSalario} onChange={(e) => setNewSalario(e.target.value)} placeholder='Salario' />
        <input type="text" value={newEstado} onChange={(e) => setNewEstado(e.target.value)} placeholder='Estado' />
        <input type="date" value={newFecha_contratacion} onChange={(e) => setNewFecha_contratacion(e.target.value)} placeholder='Fecha_contratacio' />
        </div>
                        <div className="card-footer text-muted"></div>
                     </div>
                    </div>

      </Modal>

      {/* Modal para editar empleado */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal}>
      <div
                        className="col-20">
                    <div className="card">
                        <div className="card-header">Emplado</div>
                        <div className="card-body">
                        <h2>Editar Empleado</h2>
        <button className="btn btn-success" onClick={handleUpdate}style={{marginRight:'5px'}}> Guardar </button>
        <button className="btn btn-secondary" onClick={closeEditModal}style={{marginLeft:'5px'}}> Cerrar </button>
        <span style={{ marginRight: '10px' }}></span>
        <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder='Nombre' />
        <input type="text" value={newApellido} onChange={(e) => setNewApellido(e.target.value)} placeholder='Apellido' />
        <input type="text" value={newTelefono} onChange={(e) => setNewTelefono(e.target.value)} placeholder='Telefono' />
        <input type="text" value={newCargo} onChange={(e) => setNewCargo(e.target.value)} placeholder='Cargo' />
        <input type="text" value={newSalario} onChange={(e) => setNewSalario(e.target.value)} placeholder='Salario' />
        <input type="text" value={newEstado} onChange={(e) => setNewEstado(e.target.value)} placeholder='Estado' />
        <input type="date" value={newFecha_contratacion} onChange={(e) => setNewFecha_contratacion(e.target.value)} placeholder='Fecha_contratacion' />
        </div>
                        <div className="card-footer text-muted"></div>
                     </div>
                    </div>
      </Modal>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Apellido</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Teléfono</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cargo</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Salario</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Estado</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fecha Contratación</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id_empleado}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.id_empleado}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.nombre}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.apellido}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.telefono}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.cargo}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.salario}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.estado}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.fecha_contratacion}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button onClick={() => openEditModal(item)} style={{ backgroundColor: 'yellow', marginRight: '5px' }}>Editar</button>
                <button onClick={() => handleDelete(item.id_empleado)} style={{ backgroundColor: 'red', color: 'white' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <button onClick={generatePDFReport} style={{ backgroundColor: '#e13031', marginRight: '5px' }}>Descargar PDF</button>
        <button onClick={generateExcelReport} style={{ backgroundColor: '#1cc605', marginRight: '5px' }}>Descargar Excel</button>
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