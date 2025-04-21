//Declaracion de modulos requeridos

var Express = require("express")
var bodyParser = require("body-parser")
var cors = require("cors")
var mysql = require("mysql2")
var jwt = require ("jsonwebtoken")
var  cookieParser = require("cookie-parser") 
var speakeasy = require("speakeasy")
var QRCode = require("qrcode") // Instala la librería: npm install qrcode

var conexion = mysql.createConnection({

    host:"localhost",
    port:"3306",
    user:"root",
    password:"1984",
    database:"l4test",
    authPlugins: {

        mysql_native_password: () => () => Buffer.from('1984')

      }

});

//Funcion para registrar el consumo de la API en bitacora
function registrarBitacora(tabla_afectada, tipo_operacion) {
    const query = "INSERT INTO bitacora (tabla_afectada, tipo_operacion) VALUES (?, ?)";
    const values = [tabla_afectada, tipo_operacion];
 
    conexion.query(query, values, (err, results) => {
        if (err) {
            handleDatabaseError(err, "Error en registrar la bitacora:");
                return;
        }
        logger.info("Listado de la bitacora - OK");
    });
}



//Inicio del uso de Express.js

var app = Express();

//Declaracion usos y libs

app.use(cors({

    origin: function (origin, callback) {
      const allowedOrigins = ['http://localhost:49146', 'http://localhost:3000', 'http://localhost:3306', 'http://localhost:5173']; 
  
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {

        callback(new Error('Not allowed by CORS'));
      }
    },
    
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Habilita las cookies si es necesario

}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());


//Definicion del Listener

const logger = require("./logger"); // Importar logger

app.listen(49146, () => {
    conexion.connect((err) => {
        if (err) {
            logger.error("Error al conectar a la BD: " + err.message);
            throw err;
        }
        logger.info("Conexión a la BD con éxito!");
    });
});



app.get('/api/json', (solicitud, respuesta) => {
    respuesta.json({ text: "HOLA ESTE ES UN JSON" });
});

app.get('/', (solicitud, respuesta) => {
    respuesta.send("¡Hola Mundo!");
});

function handleDatabaseError(err, res, message) {
    logger.error(message, err);
    res.status(500).json({ error: err.message });
}

const SECRET_KEY = "1984"; 

// Middleware para verificar JWT en rutas protegidas
const verificarToken = (req, res, next) => {
    const token = req.cookies.token; // Obtiene el token de la cookie
    if (!token) return res.status(401).json({ mensaje: "Acceso denegado" });

    try {
        const verificado = jwt.verify(token, SECRET_KEY);
        req.usuario = verificado;
        next();
    } catch (error) {
        res.status(400).json({ mensaje: "Token inválido" });
    }
};


// Ruta protegida con JWT
app.get("/api/seguro", verificarToken, (req, res) => {
    res.json({ mensaje: "Acceso concedido a la ruta segura", usuario: req.usuario });
});

// Ruta para iniciar sesión y generar el token
app.post("/api/login", (req, res) => {
    console.log("Ruta /api/login llamada");
    const { nombre_usuario, contraseña } = req.body;

    // Verifica las credenciales del usuario en la base de datos
    const query = "SELECT * FROM l4test.usuario WHERE nombre_usuario = ? AND contraseña = ?";
    conexion.query(query, [nombre_usuario, contraseña], (err, rows) => {
        if (err) {
            return handleDatabaseError(err, res, "Error en inicio de sesión:");
        }

        // Verificar si se encontraron filas (credenciales válidas)
        const credencialesValidas = rows.length > 0;

        if (credencialesValidas) {
            const usuario = rows[0];

            // Genera el token JWT
            const token = jwt.sign({ id_usuario: usuario.id_usuario }, SECRET_KEY, { expiresIn: "1h" });

            // Envía el token en una cookie
            res.cookie("token", token, { httpOnly: false, secure: false }); // Ajusta 'secure' en producción
            res.json({ mensaje: "Inicio de sesión exitoso", token: token });
        } else {
            res.status(401).json({ mensaje: "Credenciales inválidas" });
        }
    });
});

// Ruta para cerrar sesión
app.get("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ mensaje: "Sesión cerrada" });
});

app.post("/api/recuperar-contrasena", async (req, res) => {
    const { nombre_usuario, codigo } = req.body;

    try {
        // Obtener el secreto del usuario de la base de datos
        const query = "SELECT secreto_google_auth FROM l4test.usuario WHERE nombre_usuario = ?";
        conexion.query(query, [nombre_usuario], async (err, rows) => {
            if (err) {
                return handleDatabaseError(err, res, "Error al obtener el secreto del usuario:");
            }

            if (rows.length === 0) {
                return res.status(404).json({ mensaje: "Usuario no encontrado" });
            }

            const secreto = rows[0].secreto_google_auth;

            // Registrar el secreto y el código
            console.log("Secreto:", secreto);
            console.log("Código recibido:", codigo);

            // Verificar el código de Google Authenticator
            const verificado = speakeasy.totp.verify({
                secret: secreto,
                encoding: "base32",
                token: codigo,
            });

            // Registrar el resultado de la verificación
            console.log("Verificado:", verificado);

            if (verificado) {
                // Permitir al usuario establecer una nueva contraseña
                // (Implementa la lógica para actualizar la contraseña en la base de datos)
                res.json({ mensaje: "Código válido. Nueva contraseña establecida." });
            } else {
                res.status(400).json({ mensaje: "Código inválido" });
            }
        });
    } catch (error) {
        console.error("Error en recuperación de contraseña:", error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
});

// Ruta para verificar si un usuario existe por nombre de usuario
app.post("/api/verificar-usuario", (req, res) => {
    const { nombre_usuario } = req.body;

    const query = "SELECT * FROM l4test.usuario WHERE nombre_usuario = ?";
    conexion.query(query, [nombre_usuario], (err, rows) => {
        if (err) {
            return res.status(500).json({ mensaje: "Error al verificar el usuario" });
        }

        if (rows.length > 0) {
            res.json({ existe: true });
        } else {
            res.json({ existe: false });
        }
    });
});

//Get listado de usuarios
app.get('/api/usuario', (request, response) => {
    var query = "SELECT * FROM l4test.usuario";

    conexion.query(query, (err, rows) => {
        if (err) {
            logger.error("Error en listado de usuario: " + err.message);
            return response.status(500).json({ error: "Error en listado de usuario" });
        }
        response.cookie('mi_cookie', 'valor_de_la_cookie', { 
            expires: new Date(Date.now() + 900000), 
            httpOnly: true, 
            secure: false,  
            sameSite: 'lax' 
        });
        response.json(rows);
        registrarBitacora("usuario", "GET", request.body); // Registra la petición en la bitácora
        logger.info("Listado de usuarios - OK");
    });
});



app.get("/api/cookie", (req, res) => {
    if (!req.cookies) {
        return res.status(400).json({ error: "Las cookies no están habilitadas o enviadas correctamente." });
    }

    const miCookie = req.cookies.mi_cookie;

    if (miCookie) {
        logger.info("Cookie leída correctamente");
        res.json({ mensaje: "Valor de la cookie:", cookie: miCookie });
    } else {
        res.status(404).json({ mensaje: "No se encontró la cookie" });
    }
});

//Get listado de usuarios con where

app.get('/api/usuario/:id', (request, response) => {
    console.log(request.params);
    const query = "SELECT * FROM l4test.usuario WHERE id_usuario = ?";
    const values = [parseInt(request.params.id)];
    conexion.query(query, values, (err, rows) => {
        if (err) {
            handleDatabaseError(err, res, "Error en listado de usuarios con where:");
            return;
        }
        registrarBitacora("usuario", "GET", request.body); // Registra la petición en la bitácora
        logger.info("Listado de usuarios con where - OK");
        response.json(rows);
    });
});

//Post insert de usuarios

app.post('/api/usuario', (request, response) => {
    // Verificar si el campo 'nombre' está presente en la solicitud
    const query = "INSERT INTO l4test.usuario (nombre, apellido, nombre_usuario, correo, contraseña, secreto_google_auth) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [request.body.nombre, request.body.apellido, request.body.nombre_usuario, request.body.correo, request.body.contraseña, secreto.base32];
    const secreto = speakeasy.generateSecret({ length: 20 });

    conexion.query(query, values, (err) => {
        if (err) {
            // Manejar el error de la base de datos
            return response.status(500).json({ error: "Error en la base de datos." });
        }

        // Generar el código QR para el secreto
        QRCode.toDataURL(secreto.otpauth_url, (err, url) => {
            if (err) {
                return response.status(500).json({ error: "Error al generar el código QR." });
            }

            // Mostrar el código QR al usuario
            response.json({ secreto: secreto.base32, qr_code: url });

        });

        registrarBitacora("usuario", "INSERT", request.body);
            logger.info("INSERT de usuarios - OK");
            console.log("Secreto:", secreto.base32);
            response.json("INSERT EXITOSO!");
    });

});



//Put Update de usuarios

app.put('/api/usuario', (request, response) => {
    const query = "UPDATE l4test.usuario SET nombre = ?, apellido = ?, correo = ?, nombre_usuario = ? WHERE id_usuario = ?";
    const values = [request.body.nombre, request.body.apellido, request.body.correo, request.body.nombre_usuario, request.body.id_usuario];
    conexion.query(query, values, (err) => {
        if (err) {
            handleDatabaseError(err, response, "Error en actualización de usuario:");
            return;
        }
        registrarBitacora("usuario", "UPDATE", request.body);
        logger.info("ACTUALIZACIÓN de usuarios - OK");
        response.json("UPDATE EXITOSO!");
    });
});

//Delete de usuarios

app.delete('/api/usuario/:id', (request, response) => {
    const query = "DELETE FROM l4test.usuario WHERE id_usuario = ?";
    const values = [parseInt(req.params.id)];
    conexion.query(query, values, (err) => {
        if (err) {
            handleDatabaseError(err, res, "Error en eliminación de usuario:");
            return;
        }
        registrarBitacora("usuario", "DELETE", request.body);
        logger.info("DELETE de usuarios - OK");
        response.json("DELETE EXITOSO!");
    });
});

//tabla empleados 
//Get listado de empleados
// Rutas de empleados
app.get('/api/empleados', (request, response) => {
    const query = "SELECT * FROM l4test.empleados";
    conexion.query(query, (err, rows) => {
        if (err) {
            handleDatabaseError(err, res, "Error en listado de empleados:");
            return;
        }
        registrarBitacora("empleados", "GET", request.body);
        logger.info("Listado de empleados - OK");
        response.json(rows);
    });
});

app.get('/api/empleados/:id', (request, response) => {
    const query = "SELECT * FROM l4test.empleados WHERE id_empleado = ?";
    const values = [parseInt(request.params.id)];
    conexion.query(query, values, (err, rows) => {
        if (err) {
            handleDatabaseError(err, res, "Error en listado de empleados con where:");
            return;
        }
        registrarBitacora("empleados", "GET", request.body); 
        logger.info("Listado de empleados con where - OK");
        response.json(rows);
    });
});

app.post('/api/empleados', (request, response) => {
    // Validación de campos requeridos
    if (!request.body["nombre"] || !request.body["apellido"]) {
        return response.status(400).json({ error: "Los campos 'nombre' y 'apellido' son requeridos." });
    }

    const query = `
        INSERT INTO l4test.empleados (nombre, apellido, telefono, cargo, salario, estado, fecha_contratacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        request.body["nombre"],
        request.body["apellido"],
        request.body["telefono"],
        request.body["cargo"],
        request.body["salario"],
        request.body["estado"],
        request.body["fecha_contratacion"]
    ];

    conexion.query(query, values, (err) => {
        if (err) {
            return handleDatabaseError(err, response, "Error en inserción de empleado:");
        }
        registrarBitacora("empleados", "POST");
        logger.info("INSERT de empleados - OK");
        response.json("INSERT EXITOSO!");
    });
});

app.put('/api/empleados/:id', (request, response) => {
    console.log("Params:", request.params);
    console.log("Body:", request.body);
    const query = `
        UPDATE l4test.empleados 
        SET nombre = ?, apellido = ?, telefono = ?, cargo = ?, salario = ?, estado = ?, fecha_contratacion = ? 
        WHERE id_empleado = ?
    `;
    const values = [
        request.body["nombre"],
        request.body["apellido"],
        request.body["telefono"],
        request.body["cargo"],
        request.body["salario"],
        request.body["estado"],
        request.body["fecha_contratacion"],
        request.body["id_empleado"]
    ];

    conexion.query(query, values, (err) => {
        if (err) {
            handleDatabaseError(err, response, "Error en actualización de empleado:");
            return;
        }
        registrarBitacora("empleados", "PUT");
        logger.info("ACTUALIZACIÓN de empleados - OK");
        response.json("UPDATE EXITOSO!");
    });
});

app.delete('/api/empleados/:id', (request, response) => {
    console.log("Params:", request.params);
    const query = "DELETE FROM l4test.empleados WHERE id_empleado = ?";
    const values = [parseInt(request.params.id)];
    conexion.query(query, values, (err) => {
        if (err) {
            handleDatabaseError(err, response, "Error en eliminación de empleado:");
            return;
        }
        registrarBitacora("empleados", "DELETE");
        logger.info("DELETE de empleados - OK");
        response.json("DELETE EXITOSO!");
    });
});

function handleDatabaseError(err, response, message) {
    logger.error(message, err);
    response.status(500).json({ error: err.message });
}

//GET tipo de productos

app.get('/api/tipo_productos', (request, response) => {
    var query = "SELECT * FROM l4test.tipo_productos";
    
    conexion.query(query, (err, rows) => { 
        if (err) {
            logger.error("Error en listado de tipo productos: " + err.message);
            return response.status(500).json({ error: "Error en listado de tipo producto" });
        }
        response.json(rows);
        registrarBitacora("tipo_productos", "GET", request.body); // Registra la petición en la bitácora
        logger.info("Listado de tipo productos - OK");
    });
});

// GET con where tipo productos
app.get('/api/tipo_productos/:id',(request, response)=>{
    var query = "SELECT * FROM l4test.tipo_productos WHERE id_tipo_producto = ?"
    var values = [parseInt(request.params.id)];

    conexion.query(query,values,function(err,rows,fields){
        if (err){
            handleDatabaseError(err, response, "Error en listado de tipos de productos con where:");
            return;
        }
        registrarBitacora("tipo_productos", "GET", request.body); 
        logger.info("Listado de tipo de productos con where - OK");
        response.json(rows);
    });
});

// Insert tipo productos
app.post('/api/tipo_productos', (request, response) => {
    var query = "INSERT INTO l4test.tipo_productos (nombre, cantidad) VALUES (?, ?)";
    var values = [
        request.body["nombre"],
        request.body["cantidad"]
    ];

    conexion.query(query, values, function(err, rows, fields) {
        if (err) {
            handleDatabaseError(err, response, "Error en inserción de tipo de productos:");
            return;
        }
        registrarBitacora("tipo_productos", "INSERT", request.body); // Registra accion en la bitácora
        logger.info("INSERT de tipo de productos - OK");
        response.json("INSERT EXITOSO!");
    });
});

// PUT de tipo de productos
app.put('/api/tipo_productos/:id', (request, response) => {
    console.log("Params:", request.params);
    console.log("Body:", request.body);
    const query = `
        UPDATE l4test.tipo_productos 
        SET nombre = ?, cantidad = ? WHERE id_tipo_producto = ?
    `;
    const values = [
        request.body["nombre"],
        request.body["cantidad"],
        request.body["id_tipo_producto"]
    ];

    conexion.query(query, values, (err) => {
        if (err) {
            handleDatabaseError(err, response, "Error en actualización de empleado:");
            return;
        }
        registrarBitacora("tipo_productos", "PUT");
        logger.info("ACTUALIZACIÓN tipo productos - OK");
        response.json("UPDATE EXITOSO!");
    });
});


//Delete de tipo de productos

//Delete de tipo de productos

app.delete('/api/tipo_productos/:id', (request, response) => {
    var query = "DELETE FROM l4test.tipo_productos where id_tipo_producto = ?";
    var values = [
        parseInt(request.params.id)
    ];

    conexion.query(query, values, function(err, rows, fields) {
        if (err) {
            handleDatabaseError(err, response, "Error en la eliminación de tipo de productos:");
            return;
        }
        
        registrarBitacora("tipo_productos", "DELETE", request.body); // Registra accion en la bitácora
        logger.info("DELETE de tipo de productos - OK");
        response.json("DELETE EXITOSO!");
    });
});

//Get listado de los productos HECHO POR AILEEN
app.get('/api/productos',(request, response)=>{
    var query = "SELECT * FROM L4TEST.PRODUCTOS"
    conexion.query(query,function(err,rows,fields){
        if (err){
            response.send("301 ERROR EN LISTADO PRODUCTO")
        };
        registrarBitacora("productos", "GET", request.body); //REGISTRAR LA PETICION EN LA BITACORA
        response.send(rows)
        console.log("listado de productos - OK")
    })
});

//Get listado de productos con where
app.get('/api/productos/:id',(request, response)=>{
    var query = "SELECT * FROM L4TEST.PRODUCTOS WHERE id_producto = ?"
    var values = [
        parseInt(request.params.id)
    ];
    conexion.query(query,values,function(err,rows,fields){
        if (err){
            response.send("301 ERROR EN LISTADO PRODUCTOS")
        };
        registrarBitacora("productos", "GET", request.body);
        response.send(rows)
        console.log("listado de productos con where - OK")
    })
});


//Post insert de productos
app.post('/api/productos', (request, response) => {
    var query = "INSERT INTO PRODUCTOS (nombre, unidad_medida, proveedor, precio_unitario, cantidad_stock, fecha_ultima_compra, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)";
    var values = [
        request.body["nombre"],
        request.body["unidad_medida"],
        request.body["proveedor"],
        request.body["precio_unitario"],
        request.body["cantidad_stock"],
        request.body["fecha_ultima_compra"],
        request.body["descripcion"]
    ];
    conexion.query(query, values, function(err, rows, fields) {
        if (err) {
            console.log(err.message);
            return response.status(500).json({ error: err.message }); // Mejor manejo de errores
        }
        registrarBitacora("productos", "POST", request.body);
        response.json("INSERT EXITOSO!");
        console.log("INSERT de productos - OK");
    });
});


//Put Update de productos
app.put('/api/productos', (request, response) => {
    var query = "UPDATE PRODUCTOS SET nombre = ?, unidad_medida = ?, proveedor = ?, precio_unitario = ?, cantidad_stock = ?, fecha_ultima_compra = ?, descripcion = ? where id_producto = ?";
    var values = [
        request.body["nombre"],
        request.body["unidad_medida"],
        request.body["proveedor"],
        request.body["precio_unitario"],
        request.body["cantidad_stock"],
        request.body["fecha_ultima_compra"],
        request.body["descripcion"],
        request.body["id_producto"]
    ];
    conexion.query(query, values, function(err, rows, fields) {
        if (err) {
            console.log(err.message);
            return response.status(500).json({ error: err.message }); // Mejor manejo de errores
        }
        registrarBitacora("productos", "PUT", request.body);
        response.json("UPDATE EXITOSO!");
        console.log("UPDATE de productos - OK");
    });
});


//Delete de productos
app.delete('/api/productos/:id', (request, response) => {
    var query = "DELETE FROM PRODUCTOS where id_producto = ?";
    var values = [
        parseInt(request.params.id)
    ];
    conexion.query(query, values, function(err, rows, fields) {
        if (err) {
            console.log(err.message);
            return response.status(500).json({ error: err.message }); // Mejor manejo de errores
        }
        registrarBitacora("productos", "DELETE", request.body);
        response.json("DELETE EXITOSO!");
        console.log("DELETE de productos - OK");
    });
});

// Get listado de maquinaria
app.get('/api/maquinaria', (request, response) => {
    const query = "SELECT * FROM l4test.maquinaria";
    conexion.query(query, (err, rows) => {
        if (err) {
            return handleDatabaseError(err, response, "Error en listado de la maquinaria:");
        }
        registrarBitacora("maquinaria", "GET");
        logger.info("Listado de maquinaria - OK");
        response.json(rows);
    });
});

// Get maquinaria con where (por id)
app.get('/api/maquinaria/:id', (request, response) => {
    const query = "SELECT * FROM l4test.maquinaria WHERE id_maquinaria = ?";
    const values = [parseInt(request.params.id)];
    conexion.query(query, values, (err, rows) => {
        if (err) {
            return handleDatabaseError(err, response, "Error en listado de la maquinaria:");
        }
        registrarBitacora("maquinaria", "GET");
        logger.info("Listado de maquinaria - OK");
        response.json(rows);
    });
});

// Post insert de maquinaria
app.post('/api/maquinaria', (request, response) => {
    try {
        const { nombre, modelo, marca, id_proveedor, fecha_adquisicion, estado, costo, ubicacion } = request.body;
        const query = `
            INSERT INTO l4test.maquinaria (nombre, modelo, marca, id_proveedor, fecha_adquisicion, estado, costo, ubicacion) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [nombre, modelo, marca, id_proveedor, fecha_adquisicion, estado, costo, ubicacion];
        conexion.query(query, values, (err) => {
            if (err) {
                return handleDatabaseError(err, response, "Error en inserción de maquinaria:");
            }
            registrarBitacora("maquinaria", "POST");
            logger.info("INSERT de maquinaria - OK");
            response.json("INSERT EXITOSO!");
        });
    } catch (error) {
        console.error(error);
        response.status(400).json({ error: "Error al analizar el cuerpo de la solicitud JSON" });
    }
});

// Put update de maquinaria
app.put('/api/maquinaria', (request, response) => {
    try {
        const { nombre, modelo, marca, id_proveedor, fecha_adquisicion, estado, costo, ubicacion, id_maquinaria } = request.body;
        const query = `
            UPDATE l4test.maquinaria 
            SET nombre = ?, modelo = ?, marca = ?, id_proveedor = ?, fecha_adquisicion = ?, estado = ?, costo = ?, ubicacion = ? 
            WHERE id_maquinaria = ?
        `;
        const values = [nombre, modelo, marca, id_proveedor, fecha_adquisicion, estado, costo, ubicacion, id_maquinaria];
        conexion.query(query, values, (err) => {
            if (err) {
                return handleDatabaseError(err, response, "Error en actualización de maquinaria:");
            }
            registrarBitacora("maquinaria", "PUT");
            logger.info("ACTUALIZACIÓN de maquinaria - OK");
            response.json("UPDATE EXITOSO!");
        });
    } catch (error) {
        console.error(error);
        response.status(400).json({ error: "Error al analizar el cuerpo de la solicitud JSON" });
    }
});

// Delete de maquinaria
app.delete('/api/maquinaria/:id', (request, response) => {
    const query = "DELETE FROM l4test.maquinaria WHERE id_maquinaria = ?";
    const values = [parseInt(request.params.id)];
    conexion.query(query, values, (err) => {
        if (err) {
            return handleDatabaseError(err, response, "Error en eliminación de maquinaria:");
        }
        registrarBitacora("maquinaria", "DELETE");
        logger.info("DELETE de maquinaria - OK");
        response.json("DELETE EXITOSO!");
    });
});

app.get('/api/proveedores', (req, res) => {
    const query = "SELECT * FROM proveedores";
    conexion.query(query, (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener proveedores" });
        registrarBitacora("Proveedores", "GET");
        res.json({ status: "success", data: rows });
    });
});

app.get('/api/proveedores/:id', (req, res) => {
    const query = "SELECT * FROM proveedores WHERE id_proveedor = ?";
    const values = [parseInt(req.params.id)];
    conexion.query(query, values, (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener proveedor" });
        if (rows.length === 0) return res.status(404).json({ error: "Proveedor no encontrado" });
        registrarBitacora("Proveedores", "GET");
        res.json({ status: "success", data: rows[0] });
    });
});

app.post('/api/proveedores', (req, res) => {
    const { nombre, contacto, telefono, correo, direccion, pais } = req.body;
    if (!nombre || !contacto || !telefono || !correo || !direccion || !pais) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    const query = "INSERT INTO proveedores (nombre, contacto, telefono, correo, direccion, pais) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [nombre, contacto, telefono, correo, direccion, pais];
    conexion.query(query, values, (err, result) => {
        if (err) {
            console.error("Error al insertar proveedor:", err.message);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "El correo ya está registrado." });
            }
            return res.status(500).json({ error: err.message });
        }
        registrarBitacora("Proveedores", "INSERT");
        res.status(201).json({ status: "success", message: "Proveedor agregado con éxito", proveedor_id: result.insertId });
    });
});

app.put('/api/proveedores/:id', (req, res) => {
    const { nombre, contacto, telefono, correo, direccion, pais } = req.body;
    const id_proveedor = parseInt(req.params.id);
    if (!nombre || !contacto || !telefono || !correo || !direccion || !pais) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    const query = "UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, correo = ?, direccion = ?, pais = ? WHERE id_proveedor = ?";
    const values = [nombre, contacto, telefono, correo, direccion, pais, id_proveedor];
    conexion.query(query, values, (err, result) => {
        if (err) {
            console.error("Error al actualizar proveedor:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        registrarBitacora("Proveedores", "PUT");
        res.json({ status: "success", message: "Proveedor actualizado con éxito" });
    });
});

app.delete('/api/proveedores/:id', (req, res) => {
    const query = "DELETE FROM proveedores WHERE id_proveedor = ?";
    const values = [parseInt(req.params.id)];
    conexion.query(query, values, (err, result) => {
        if (err) {
            console.error("Error al eliminar proveedor:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        registrarBitacora("Proveedores", "DELETE");
        res.json({ status: "success", message: "Proveedor eliminado con éxito" });
    });
});

// GET listado de bitacora
app.get('/api/bitacora', (request, response, next) => {
    const query = "SELECT * FROM l4test.bitacora";
    conexion.query(query, (err, rows) => {
        if (err) {
            return next({ status: 500, message: "Error al obtener la bitácora" });
        }
        logger.info("Listado de la bitacora - OK");
        response.json(rows); 
    });
});




