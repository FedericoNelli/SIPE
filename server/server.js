const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');
const SECRET_KEY = 'peron74';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sipe'
});

// Configuración de multer para almacenar archivos en public/uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        getNextImageNumber((err, imageNumber) => {
            if (err) {
                return cb(err);
            }
            const filename = `SIPE-img${imageNumber}${path.extname(file.originalname)}`;
            cb(null, filename);
        });
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limitar el tamaño a 10 MB
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));


db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});

const getNextImageNumber = (callback) => {
    const query = 'SELECT COUNT(*) AS count FROM Material WHERE imagen IS NOT NULL';
    db.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        const count = results[0].count;
        callback(null, count + 1);
    });
};

// Consulta a la base de datos para verificar usuario y contraseña
app.post('/login', (req, res) => {
    const { user, password } = req.body;

    const query = 'SELECT * FROM usuario WHERE nombre_usuario = ?';
    db.query(query, [user], (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');

        if (results.length === 0) {
            return res.status(401).send('Usuario no encontrado');
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.contrasenia);

        if (!isPasswordValid) {
            return res.status(401).send('Contraseña incorrecta');
        }

        // Generar y devolver el token JWT
        const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, nombre: user.nombre, rol: user.rol, id: user.id });
    });
});

app.post('/logout', (req, res) => {
    res.status(200).send('Logout exitoso');
});

// Endpoint para agregar usuarios
app.post('/addUser', (req, res) => {
    const { nombre, apellido, legajo, nombre_usuario, contrasenia, email, rol } = req.body;

    if (!nombre || !apellido || !legajo || !nombre_usuario || !contrasenia || !email || !rol) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    if (!req.headers.authorization) {
        console.log('No Authorization header');
        return res.status(401).send("Authorization header missing");
    }

    const token = req.headers.authorization.split(' ')[1];
    console.log('Token recibido:', token);

    let decoded;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return res.status(401).send("Token invalido");
    }

    if (decoded.rol !== 'Administrador') {
        console.log('Usuario no es administrador:', decoded.rol);
        return res.status(403).send('Permiso denegado');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(contrasenia, salt);

    const user = { nombre, apellido, legajo, nombre_usuario, contrasenia: passwordHash, email, rol };

    const query = 'INSERT INTO usuario SET ?';
    db.query(query, user, (err, result) => {
        if (err) {
            console.log('Error al insertar en la base de datos:', err);
            return res.status(500).send("Error al crear el usuario");
        }
        res.status(200).send('Usuario creado');
    });
});

app.get('/users', (req, res) => {
    const query = `
        SELECT 
            u.id, u.nombre, u.apellido, u.legajo, u.nombre_usuario, u.email, u.rol FROM Usuario u`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

app.get('/materials', (req, res) => {
    const { ubicacion, deposito, categoria, estado } = req.query;

    let query = `
    SELECT 
        m.id, 
        m.nombre, 
        m.cantidad, 
        m.imagen, 
        m.matricula, 
        DATE_FORMAT(m.fechaUltimoEstado, '%d-%m-%Y') AS fechaUltimoEstado, 
        m.mapa, 
        m.bajoStock, 
        m.idEstado, 
        m.idEspacio, 
        m.ultimoUsuarioId, 
        m.idCategoria, 
        m.idDeposito, 
        d.nombre AS depositoNombre, 
        u.nombre AS ubicacionNombre, 
        es.descripcion AS estadoDescripcion, 
        c.descripcion AS categoriaNombre,
        et.id AS estanteriaId,                 
        et.cantidad_estante AS cantidadEstante,   
        et.cantidad_division AS cantidadDivision,   
        e.fila AS estanteEstanteria,                
        e.columna AS divisionEstanteria,             
        p.numero AS pasilloNumero,
        l.descripcion AS lado,
        e.numeroEspacio,
        uu.nombre_usuario AS ultimoUsuarioNombre
    FROM 
        Material m
    LEFT JOIN 
        Deposito d ON m.idDeposito = d.id
    LEFT JOIN 
        Ubicacion u ON d.idUbicacion = u.id
    LEFT JOIN 
        Estado es ON m.idEstado = es.id
    LEFT JOIN 
        Categoria c ON m.idCategoria = c.id
    LEFT JOIN 
        Espacio e ON m.idEspacio = e.id
    LEFT JOIN 
        Estanteria et ON e.idEstanteria = et.id
    LEFT JOIN 
        Pasillo p ON et.idPasillo = p.id
    LEFT JOIN 
        Lado l ON et.idLado = l.id
    LEFT JOIN 
        Usuario uu ON m.ultimoUsuarioId = uu.id
`;

    const filters = [];
    if (ubicacion) {
        filters.push(`u.nombre = ${db.escape(ubicacion)}`);
    }
    if (deposito) {
        filters.push(`d.nombre = ${db.escape(deposito)}`);
    }
    if (categoria) {
        filters.push(`c.descripcion = ${db.escape(categoria)}`);
    }
    if (estado) {
        filters.push(`es.descripcion = ${db.escape(estado)}`);
    }

    if (filters.length > 0) {
        query += ' WHERE ' + filters.join(' AND ');
    }

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

function handleStockNotifications(nombre, cantidad, bajoStock, callback) {
    cantidad = Number(cantidad);
    bajoStock = Number(bajoStock);
    let descripcion = null;

    if (cantidad === 0) {
        descripcion = `El material ${nombre} se ha quedado sin stock.`;
    } else if (cantidad <= bajoStock) {
        descripcion = `El material ${nombre} ha llegado a su límite de bajo stock.`;
    } else {
        return callback(null);
    }

    db.query(
        `INSERT INTO notificacion (descripcion, fecha) VALUES (?, NOW())`,
        [descripcion],
        (error, result) => {
            if (error) {
                console.error('Error al agregar notificación', error);
                return callback({ mensaje: 'Error al agregar notificación' });
            }

            const notificacionId = result.insertId;

            db.query(
                `INSERT INTO usuario_notificacion (usuario_id, notificacion_id, visto) 
                 SELECT id, ?, FALSE FROM usuario`,
                [notificacionId],
                (error) => {
                    if (error) {
                        console.error('Error al relacionar notificación con usuarios', error);
                        return callback({ mensaje: 'Error al relacionar notificación con usuarios' });
                    }
                    return callback(null);
                }
            );
        }
    );
}

// Endpoint para agregar un nuevo material
app.post('/addMaterial', upload.single('imagen'), (req, res) => {
    const { nombre, cantidad, matricula, bajoStock, idEstado, idEspacio, idCategoria, idDeposito, fechaUltimoEstado, ultimoUsuarioId, ocupado } = req.body;
    const imagen = req.file;

    if (!nombre || cantidad == null || !matricula || !idEstado || !idEspacio || !idCategoria || !idDeposito || !ultimoUsuarioId) {
        return res.status(400).json({ mensaje: 'Campos obligatorios faltantes' });
    }

    const insertQuery = `INSERT INTO Material (nombre, cantidad, matricula, bajoStock, idEstado, idEspacio, idCategoria, idDeposito, fechaUltimoEstado, ultimoUsuarioId, ocupado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [nombre, cantidad, matricula, bajoStock, idEstado, idEspacio, idCategoria, idDeposito, fechaUltimoEstado, ultimoUsuarioId, ocupado];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('Error al insertar material:', err);
            return res.status(500).json({ mensaje: 'Error al insertar material' });
        }

        const materialId = result.insertId;

        handleStockNotifications(nombre, cantidad, bajoStock, (error) => {
            if (error) {
                return res.status(500).json({ mensaje: 'Error al manejar notificaciones de stock' });
            }
            res.status(200).json({ mensaje: 'Material agregado con éxito' });
        });

        if (imagen) {
            const imagenPath = `/uploads/SIPE-img-${materialId}${path.extname(imagen.originalname)}`;
            const newFilePath = path.join(__dirname, 'public', imagenPath);

            fs.rename(imagen.path, newFilePath, (err) => {
                if (err) {
                    console.error('Error al renombrar la imagen:', err);
                    return res.status(500).json({ mensaje: 'Error al guardar la imagen' });
                }

                db.query('UPDATE Material SET imagen = ? WHERE id = ?', [imagenPath, materialId], (err) => {
                    if (err) {
                        console.error('Error al actualizar la base de datos con la imagen:', err);
                        return res.status(500).json({ mensaje: 'Error al actualizar la imagen en la base de datos' });
                    }
                });
            });
        }
    });
});

// Endpoint para editar un material
app.put('/materiales/:id', upload.single('imagen'), (req, res) => {
    const id = req.params.id;
    const { nombre, cantidad, matricula, bajoStock, idEstado, idCategoria, idDeposito, idEspacio  } = req.body;
    const imagen = req.file ? '/uploads/' + req.file.filename : null;

    const queryParams = [
        nombre || null, 
        cantidad || null, 
        matricula || null, 
        idEstado || null, 
        idCategoria || null, 
        idDeposito || null, 
        idEspacio || null,
        imagen
    ];

    let query = `
        UPDATE Material SET 
        nombre = COALESCE(?, nombre), 
        cantidad = COALESCE(?, cantidad), 
        matricula = COALESCE(?, matricula), 
        idEstado = COALESCE(?, idEstado), 
        idCategoria = COALESCE(?, idCategoria), 
        idDeposito = COALESCE(?, idDeposito), 
        idEspacio = COALESCE(?, idEspacio)`;

    if (imagen) {
        query += `, imagen = ?`;
    } else {
        // Si no hay imagen, elimina el último parámetro
        queryParams.pop();
    }

    query += ` WHERE id = ?`;
    queryParams.push(id);

    db.query(query, queryParams, (err, result) => {
        if (err) {
            console.error('Error al actualizar el material:', err);
            return res.status(500).json({ error: 'Error al actualizar el material', details: err.message });
        }
        // Verificar si se debe agregar una notificación
        handleStockNotifications(nombre, cantidad, bajoStock, (error) => {
            if (error) {
                return res.status(500).json({ mensaje: 'Error al manejar notificaciones de stock' });
            }
            res.status(200).json({ mensaje: 'Material agregado con éxito' });
        });
    });
});

app.get('/materials/search', (req, res) => {
    const query = req.query.query;

    const searchQuery = `
        SELECT 
            m.id, m.nombre, m.cantidad, m.imagen, m.matricula, m.fechaUltimoEstado, 
            m.mapa, m.bajoStock, m.idEstado, m.idEspacio, m.ultimoUsuarioId, 
            m.idCategoria, m.idDeposito, 
            d.nombre AS depositoNombre, 
            u.nombre AS ubicacionNombre, 
            es.descripcion AS estadoDescripcion, 
            c.descripcion AS categoriaDescripcion,
            e.numeroEspacio
        FROM 
            Material m
        LEFT JOIN 
            Deposito d ON m.idDeposito = d.id
        LEFT JOIN 
            Ubicacion u ON d.idUbicacion = u.id
        LEFT JOIN 
            Estado es ON m.idEstado = es.id
        LEFT JOIN 
            Categoria c ON m.idCategoria = c.id
        LEFT JOIN 
            Espacio e ON m.idEspacio = e.id           
        WHERE 
            m.nombre LIKE ?
    `;

    const likeQuery = `${query}%`;

    db.query(searchQuery, [likeQuery], (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Enpoint para configurar el transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sipe.supp@gmail.com',
        pass: 'ektg hzdy ndzm dtcp'
    }
});

// Endpoint para enviar el código de verificación
app.post('/sendRecoveryCode', (req, res) => {
    const { email } = req.body;

    // Verificar si el email existe en la base de datos
    const checkEmailQuery = 'SELECT * FROM usuario WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al consultar la base de datos');
        }

        if (results.length === 0) {
            return res.status(404).send('Email no encontrado');
        }

        // Generar un código de verificación de 5 dígitos
        const recoveryCode = Math.floor(10000 + Math.random() * 90000).toString();

        // Guardar el código de recuperación en la base de datos
        const query = 'UPDATE usuario SET recovery_code = ? WHERE email = ?';
        db.query(query, [recoveryCode, email], (err, result) => {
            if (err) {
                console.error('Error al actualizar el código de recuperación:', err);
                return res.status(500).send('Error al actualizar el código de recuperación');
            }

            // Enviar el código de recuperación por correo electrónico
            const mailOptions = {
                from: 'marielle.feeney37@ethereal.email',
                to: email,
                subject: 'Código de recuperación de contraseña',
                text: `Tu código de recuperación es: ${recoveryCode}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar el correo electrónico:', error);
                    return res.status(500).send('Error al enviar el correo electrónico');
                }
                res.status(200).send('Correo de recuperación enviado');
            });
        });
    });
});

// Endpoint para verificar el código de recuperación
app.post('/verifyRecoveryCode', (req, res) => {
    const { email, recoveryCode } = req.body;

    const query = 'SELECT * FROM usuario WHERE email = ? AND recovery_code = ?';
    db.query(query, [email, recoveryCode], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al consultar la base de datos');
        }

        if (results.length === 0) {
            return res.status(401).send('Código de recuperación incorrecto');
        }

        res.status(200).send('Código verificado');
    });
});

// Endpoint para cambiar la contraseña
app.post('/changePassword', (req, res) => {
    const { email, newPassword } = req.body;

    // Encriptar la nueva contraseña
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    const query = 'UPDATE usuario SET contrasenia = ?, recovery_code = NULL WHERE email = ?';
    db.query(query, [passwordHash, email], (err, result) => {
        if (err) {
            console.error('Error al actualizar la contraseña:', err);
            return res.status(500).send('Error al actualizar la contraseña');
        }
        res.status(200).send('Contraseña actualizada');
    })
});

app.get('/shelves', (req, res) => {
    const query = `
        SELECT 
            e.id, e.cantidad_estante, e.cantidad_division, e.idPasillo, e.idLado, 
            p.numero AS numeroPasillo, 
            l.descripcion AS direccionLado 
        FROM 
            Estanteria e
        LEFT JOIN 
            Pasillo p ON e.idPasillo = p.id
        LEFT JOIN 
            Lado l ON e.idLado = l.id
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

app.post('/addDeposit', (req, res) => {
    const { nombre, idUbicacion } = req.body;

    if (!nombre || !idUbicacion) {
        return res.status(400).json({ message: 'Nombre y ubicación son obligatorios' });
    }

    const query = 'INSERT INTO Deposito (nombre, idUbicacion) VALUES (?, ?)';
    const values = [nombre, idUbicacion];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al insertar depósito:', err);
            return res.status(500).json({ message: 'Error al agregar depósito' });
        }
        res.status(200).json({ message: 'Depósito agregado exitosamente' });
    });
});

app.get('/deposits', (req, res) => {
    const query = `
        SELECT d.id, d.nombre, d.idUbicacion, u.nombre AS nombreUbicacion FROM Deposito d LEFT JOIN Ubicacion u ON d.idUbicacion = u.id`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});


app.get('/deposit-names', (req, res) => {
    const locationId = req.query.locationId;
    if (!locationId) {
        return res.status(400).send('Se requiere locationId');
    }
    const query = 'SELECT id, nombre FROM Deposito WHERE idUbicacion = ?';
    db.query(query, [locationId], (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

//Obtener Ubicación
app.get('/deposit-locations', (req, res) => {
    const query = 'SELECT id, nombre FROM Ubicacion';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

//Obtener Depósitos
app.get('/depo-names', (req, res) => {
    const query = 'SELECT id, nombre FROM Deposito';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

//Obtener Categorías
app.get('/categories', (req, res) => {
    const query = 'SELECT id, descripcion FROM Categoria';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

//Obtener Estados
app.get('/statuses', (req, res) => {
    const query = 'SELECT id, descripcion FROM Estado';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Endpoint para agregar una nueva estantería
app.post('/addShelf', (req, res) => {
    const { cantidad_estante, cantidad_division, idPasillo, idLado } = req.body;

    if (!cantidad_estante || !cantidad_division || !idPasillo || !idLado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO Estanteria (cantidad_estante, cantidad_division, idPasillo, idLado) VALUES (?, ?, ?, ?)';
    const values = [cantidad_estante, cantidad_division, idPasillo, idLado];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al insertar estantería:', err);
            return res.status(500).json({ error: 'Error al agregar estantería', details: err });
        }
        res.status(200).json({ message: 'Estantería agregada exitosamente', result });
    });
});

app.get('/shelf', (req, res) => {
    const query = 'SELECT id FROM Estanteria';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

app.get('/spaces/:shelfId', (req, res) => {
    const { shelfId } = req.params;
    const query = `
        SELECT Espacio.id, Espacio.fila, Espacio.columna, Espacio.numeroEspacio,
        CASE 
            WHEN Material.id IS NOT NULL THEN true 
            ELSE false 
        END AS ocupado
        FROM Espacio
        LEFT JOIN Material ON Material.idEspacio = Espacio.id
        WHERE Espacio.idEstanteria = ?
    `;
    db.query(query, [shelfId], (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Endpoint para obtener los pasillos
app.get('/aisles', (req, res) => {
    const query = 'SELECT id, numero FROM Pasillo';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Endpoint para obtener los lados
app.get('/sides', (req, res) => {
    const query = 'SELECT id, descripcion FROM Lado';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Endpoint para obtener la cantidad total de materiales
app.get('/total-materials', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM Material';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results[0]);
    });
});

// Endpoint para obtener la cantidad de materiales con bajo stock
app.get('/low-stock-materials', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM Material WHERE cantidad <= bajoStock';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results[0]);
    });
});

//Endpoint para obtener la cantidad total de estanterías
app.get('/total-estanterias', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM Estanteria';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results[0]);
    });
});


//Endpoint para obtener el último material ingresado, basado en la fecha del último estado
app.get('/last-material', (req, res) => {
    const query = 'SELECT nombre, fechaUltimoEstado FROM Material ORDER BY fechaUltimoEstado DESC LIMIT 1';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error al consultar la base de datos');
        }

        if (results.length === 0) {
            return res.status(404).send('No se encontró ningún material');
        }

        res.json({ nombre: results[0].nombre });
    });
});

app.delete('/materials/:id', (req, res) => {
    const materialId = req.params.id;

    // Primero, obtenemos la información del material para obtener el path de la imagen
    const queryGetImage = 'SELECT imagen FROM Material WHERE id = ?';

    db.query(queryGetImage, [materialId], (err, results) => {
        if (err) {
            console.error('Error al obtener la imagen:', err);
            return res.status(500).send('Error al obtener la imagen');
        }

        if (results.length > 0) {
            const imagePath = results[0].imagen; // Obtener el path de la imagen

            if (imagePath) {
                const fullPath = path.join(__dirname, 'public', imagePath); // Construir la ruta completa

                // Eliminar la imagen del sistema de archivos
                fs.unlink(fullPath, (err) => {
                    if (err) {
                        console.error('Error al eliminar la imagen:', err);
                        // Aunque falle la eliminación de la imagen, seguimos eliminando el material
                    }

                    // Eliminar el registro de la base de datos una vez que tratamos de eliminar la imagen
                    const queryDeleteMaterial = 'DELETE FROM Material WHERE id = ?';
                    db.query(queryDeleteMaterial, [materialId], (err, result) => {
                        if (err) {
                            console.error('Error al eliminar el material:', err);
                            return res.status(500).send('Error al eliminar el material');
                        }
                        res.status(200).send('Material eliminado con éxito y se intentó eliminar la imagen.');
                    });
                });
            } else {
                // Si no hay imagen, eliminamos directamente el material de la base de datos
                const queryDeleteMaterial = 'DELETE FROM Material WHERE id = ?';
                db.query(queryDeleteMaterial, [materialId], (err, result) => {
                    if (err) {
                        console.error('Error al eliminar el material:', err);
                        return res.status(500).send('Error al eliminar el material');
                    }
                    res.status(200).send('Material eliminado con éxito (sin imagen asociada).');
                });
            }
        } else {
            return res.status(404).send('Material no encontrado');
        }
    });
});



//Endpoint para editar un material
app.put('/materiales/:id', upload.single('imagen'), (req, res) => {
    const id = req.params.id;
    // Asegúrate de que los campos sean tomados de req.body o tengan un valor por defecto.
    const { nombre, cantidad, matricula, idEstado, idCategoria, idDeposito, idEspacio } = req.body;
    const imagen = req.file ? '/uploads/' + req.file.filename : null;

    // Maneja los valores por defecto si req.body no envía esos campos
    const queryParams = [
        nombre || null, 
        cantidad || null, 
        matricula || null, 
        idEstado || null, 
        idCategoria || null, 
        idDeposito || null, 
        idEspacio || null,
        imagen
    ];

    let query = `
        UPDATE Material SET 
        nombre = COALESCE(?, nombre), 
        cantidad = COALESCE(?, cantidad), 
        matricula = COALESCE(?, matricula), 
        idEstado = COALESCE(?, idEstado), 
        idCategoria = COALESCE(?, idCategoria), 
        idDeposito = COALESCE(?, idDeposito), 
        idEspacio = COALESCE(?, idEspacio)`;

    if (imagen) {
        query += `, imagen = ?`;
    } else {
        // Si no hay imagen, elimina el último parámetro
        queryParams.pop();
    }

    query += ` WHERE id = ?`;
    queryParams.push(id);

    db.query(query, queryParams, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar el material', details: err.message });
        }
        res.status(200).send('Material actualizado correctamente');
    });
});

// Ruta para subir la imagen generada desde el canvas
app.post('/upload', (req, res) => {
    const { image, id } = req.body;

    if (!image || !id) {
        return res.status(400).send('Faltan parámetros obligatorios');
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, 'public', 'uploads', `SIPE-map-${id}.png`);

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error al guardar la imagen:', err);
            return res.status(500).send('Error al guardar la imagen');
        }

        // Guardar el path en la base de datos
        const imagePath = `/uploads/SIPE-map-${id}.png`;
        const updateQuery = 'UPDATE Material SET mapa = ? WHERE id = ?';

        db.query(updateQuery, [imagePath, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar la base de datos:', err);
                return res.status(500).send('Error al actualizar la base de datos');
            }

            res.status(200).send({ message: 'Imagen guardada con éxito y path actualizado en la base de datos', path: imagePath });
        });
    });
});

app.delete('/materiales/:id/imagen', (req, res) => {
    const materialId = req.params.id;

    // Primero, obtén la información del material para obtener la ruta de la imagen
    const queryGetImage = 'SELECT imagen FROM Material WHERE id = ?';

    db.query(queryGetImage, [materialId], (err, results) => {
        if (err) {
            console.error('Error al obtener la imagen:', err);
            return res.status(500).send('Error al obtener la imagen');
        }

        if (results.length > 0) {
            const imagePath = results[0].imagen;

            if (imagePath) {
                const fullPath = path.join(__dirname, 'public', imagePath);

                // Elimina la imagen del sistema de archivos
                fs.unlink(fullPath, (err) => {
                    if (err) {
                        console.error('Error al eliminar la imagen:', err);
                        return res.status(500).send('Error al eliminar la imagen');
                    }

                    // Actualiza la base de datos para eliminar la referencia a la imagen
                    const queryDeleteImage = 'UPDATE Material SET imagen = NULL WHERE id = ?';
                    db.query(queryDeleteImage, [materialId], (err, result) => {
                        if (err) {
                            console.error('Error al actualizar la base de datos:', err);
                            return res.status(500).send('Error al actualizar la base de datos');
                        }
                        res.status(200).send('Imagen eliminada correctamente');
                    });
                });
            } else {
                return res.status(404).send('No hay imagen para eliminar');
            }
        } else {
            return res.status(404).send('Material no encontrado');
        }
    });
});

app.get('/movements', (req, res) => {
    const query = `
        SELECT 
            m.id, 
            m.fechaMovimiento, 
            u.nombre AS Usuario,
            m.nombreMaterial, 
            m.cantidad, 
            d1.nombre AS depositoOrigen, 
            d2.nombre AS depositoDestino
        FROM 
            movimiento m
        LEFT JOIN 
            usuario u ON m.idUsuario = u.id
        LEFT JOIN 
            deposito d1 ON m.idDepositoOrigen = d1.id
        LEFT JOIN 
            deposito d2 ON m.idDepositoDestino = d2.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los movimientos:', err);
            res.status(500).json({ error: 'Error al obtener los movimientos' });
            return;
        }
        res.json(results);
    });
});


app.post('/addMovements', (req, res) => {
    const { idMaterial, idUsuario, idDepositoDestino, cantidadMovida } = req.body;

    // Obtener toda la información del material en el depósito de origen
    const queryMaterialOrigen = `
        SELECT nombre, cantidad, matricula, fechaUltimoEstado, mapa, bajoStock, idEstado, idEspacio, ultimoUsuarioId, idCategoria, idDeposito, ocupado 
        FROM Material 
        WHERE id = ?
    `;

    db.query(queryMaterialOrigen, [idMaterial], (err, materialResult) => {
        if (err) {
            console.error('Error al obtener el material:', err);
            res.status(500).json({ error: 'Error al obtener el material' });
            return;
        }

        if (materialResult.length === 0) {
            res.status(404).json({ error: 'Material no encontrado en el depósito de origen' });
            return;
        }

        const materialOrigen = materialResult[0];
        const {
            nombre, cantidad, matricula, fechaUltimoEstado, mapa, bajoStock,
            idEstado, idEspacio, ultimoUsuarioId, idCategoria, ocupado
        } = materialOrigen;
        const idDepositoOrigen = materialOrigen.idDeposito;

        if (cantidadMovida > cantidad) {
            res.status(400).json({ error: 'Cantidad insuficiente en el depósito de origen' });
            return;
        }

        // Calcular la nueva cantidad después del movimiento en el depósito de origen
        const nuevaCantidadOrigen = cantidad - cantidadMovida;

        // Actualizar la cantidad en la tabla Material para el depósito de origen
        const updateMaterialOrigenQuery = `
            UPDATE Material 
            SET cantidad = ? 
            WHERE id = ?
        `;

        db.query(updateMaterialOrigenQuery, [nuevaCantidadOrigen, idMaterial], (err, updateResult) => {
            if (err) {
                console.error('Error al actualizar el material en el depósito de origen:', err);
                res.status(500).json({ error: 'Error al actualizar el material en el depósito de origen' });
                return;
            }

            // Verificar si el material ya existe en el depósito de destino
            const queryMaterialDestino = 'SELECT id, cantidad FROM Material WHERE nombre = ? AND idDeposito = ?';

            db.query(queryMaterialDestino, [nombre, idDepositoDestino], (err, materialDestinoResult) => {
                if (err) {
                    console.error('Error al verificar el material en el depósito de destino:', err);
                    res.status(500).json({ error: 'Error al verificar el material en el depósito de destino' });
                    return;
                }

                if (materialDestinoResult.length > 0) {
                    // El material ya existe en el depósito de destino, actualizamos la cantidad
                    const { id: idMaterialDestino, cantidad: cantidadDestino } = materialDestinoResult[0];
                    const nuevaCantidadDestino = cantidadDestino + cantidadMovida;

                    const updateMaterialDestinoQuery = `
                        UPDATE Material 
                        SET cantidad = ? 
                        WHERE id = ?
                    `;

                    db.query(updateMaterialDestinoQuery, [nuevaCantidadDestino, idMaterialDestino], (err, updateResult) => {
                        if (err) {
                            console.error('Error al actualizar el material en el depósito de destino:', err);
                            res.status(500).json({ error: 'Error al actualizar el material en el depósito de destino' });
                            return;
                        }

                        // Guardar el log del movimiento en la tabla movimiento
                        const insertMovementQuery = `
                            INSERT INTO movimiento (idUsuario, nombreMaterial, cantidad, idDepositoOrigen, idDepositoDestino, fechaMovimiento) 
                            VALUES (?, ?, ?, ?, ?, NOW())
                        `;

                        db.query(insertMovementQuery, [idUsuario, nombre, cantidadMovida, idDepositoOrigen, idDepositoDestino], (err, result) => {
                            if (err) {
                                console.error('Error al agregar el movimiento:', err);
                                res.status(500).json({ error: 'Error al agregar el movimiento' });
                                return;
                            }

                            res.status(200).json({ message: 'Movimiento registrado y material actualizado correctamente' });
                        });
                    });

                } else {
                    // El material no existe en el depósito de destino, lo creamos con la cantidad movida
                    const insertMaterialDestinoQuery = `
                        INSERT INTO Material (
                            nombre, cantidad, matricula, fechaUltimoEstado, mapa, bajoStock, idEstado, idEspacio, 
                            ultimoUsuarioId, idCategoria, idDeposito, ocupado
                        ) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    const valoresInsertMaterial = [
                        nombre, cantidadMovida, matricula, fechaUltimoEstado, mapa, bajoStock,
                        idEstado, idEspacio, ultimoUsuarioId, idCategoria, idDepositoDestino, ocupado
                    ];

                    db.query(insertMaterialDestinoQuery, valoresInsertMaterial, (err, insertResult) => {
                        if (err) {
                            console.error('Error al crear el material en el depósito de destino:', err);
                            res.status(500).json({ error: 'Error al crear el material en el depósito de destino' });
                            return;
                        }

                        // Guardar el log del movimiento en la tabla movimiento
                        const insertMovementQuery = `
                            INSERT INTO movimiento (idUsuario, nombreMaterial, cantidad, idDepositoOrigen, idDepositoDestino, fechaMovimiento) 
                            VALUES (?, ?, ?, ?, ?, NOW())
                        `;

                        db.query(insertMovementQuery, [idUsuario, nombre, cantidadMovida, idDepositoOrigen, idDepositoDestino], (err, result) => {
                            if (err) {
                                console.error('Error al agregar el movimiento:', err);
                                res.status(500).json({ error: 'Error al agregar el movimiento' });
                                return;
                            }

                            res.status(200).json({ message: 'Movimiento registrado y material creado en el destino correctamente' });
                        });
                    });
                }
            });
        });
    });
});



app.get('/deposit-locations-movements', (req, res) => {
    const query = `SELECT d.id, d.nombre, u.nombre AS ubicacion 
                FROM deposito d 
                JOIN ubicacion u ON d.idUbicacion = u.id`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las ubicaciones de los depósitos:', err);
            res.status(500).json({ error: 'Error al obtener las ubicaciones' });
            return;
        }
        res.json(results);
    });
});

app.get('/api/notifications/:userId', (req, res) => {
    const { userId } = req.params;
    db.query(
        `SELECT n.id, n.descripcion, n.fecha, un.visto
         FROM notificacion n
         JOIN usuario_notificacion un ON n.id = un.notificacion_id
         WHERE un.usuario_id = ?
         ORDER BY n.fecha DESC`,
        [userId],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al obtener notificaciones' });
            } else {
                res.json(results);
            }
        }
    );
});

app.post('/api/notifications/mark-as-viewed', (req, res) => {
    const { userId, notificationIds } = req.body;

    if (!userId || !notificationIds || notificationIds.length === 0) {
        return res.status(400).json({ mensaje: 'Datos incorrectos' });
    }

    const query = `
        UPDATE usuario_notificacion
        SET visto = TRUE
        WHERE usuario_id = ? AND notificacion_id IN (?)
    `;

    db.query(query, [userId, notificationIds], (error) => {
        if (error) {
            console.error('Error al marcar notificaciones como vistas', error);
            return res.status(500).json({ mensaje: 'Error al marcar notificaciones como vistas' });
        }
        res.status(200).json({ mensaje: 'Notificaciones marcadas como vistas' });
    });
});

app.get('/notificaciones-material', (req, res) => {
    const query = `
        SELECT id, nombre, cantidad, bajoStock
        FROM material
        WHERE cantidad <= bajoStock OR cantidad = 0
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});


app.listen(8081, () => {
    console.log(`Servidor corriendo en el puerto 8081`);
});