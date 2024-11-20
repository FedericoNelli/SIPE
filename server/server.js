const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const app = express();
const fs = require('fs');
const fsPromises = fs.promises;
const SECRET_KEY = process.env.SECRET_KEY;
const { format, addDays } = require('date-fns');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});

// Enpoint para configurar el transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const queryPromise = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

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

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Por Favor inicie sesión nuevamente' });
        req.user = user;
        next();
    });
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limitar el tamaño a 10 MB
});

app.get('/materials/search', (req, res) => {
    const query = req.query.query;

    const searchQuery = `
        SELECT 
            m.id, 
            m.nombre, 
            m.cantidad, 
            m.imagen, 
            m.matricula, 
            DATE_FORMAT(m.fechaUltimoEstado, '%d-%m-%Y') AS fechaUltimoEstado,
            DATE_FORMAT(m.fechaAlta, '%d-%m-%Y') AS fechaAlta,  
            m.bajoStock, 
            m.idEstado, 
            es.descripcion AS estadoDescripcion, 
            m.ultimoUsuarioId,
            m.idCategoria, 
            c.descripcion AS categoriaNombre,
            m.idDeposito, 
            d.nombre AS depositoNombre,
            u.id AS ubicacionId,
            u.nombre AS ubicacionNombre, 
            m.idEspacio, 
            e.numeroEspacio,
            et.id AS estanteriaId,
            et.numero AS estanteriaNumero,  
            et.cantidad_estante AS cantidadEstante,   
            et.cantidad_division AS cantidadDivision, 
            e.fila AS estanteEstanteria,                
            e.columna AS divisionEstanteria,             
            p.numero AS pasilloNumero,
            l.descripcion AS lado,
            COALESCE(us.nombre_usuario, 'No disponible') AS ultimoUsuarioNombre  -- Usar COALESCE para evitar valores null
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
            Usuario us ON m.ultimoUsuarioId = us.id 
        WHERE 
            m.nombre LIKE ?`;

    const likeQuery = `%${query}%`;

    db.query(searchQuery, [likeQuery], (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');

        if (results.length === 0) {
            return res.status(200).json({ message: 'Material no encontrado' });
        }

        res.json(results);
    });
});

//Endpoint para obtener detalles del material
app.get('/materials/details/:id', (req, res) => {
    const id = req.params.id;

    const query = `
    SELECT 
        m.id, 
        m.nombre, 
        m.cantidad, 
        m.imagen, 
        m.matricula, 
        DATE_FORMAT(m.fechaUltimoEstado, '%d-%m-%Y') AS fechaUltimoEstado,
        DATE_FORMAT(m.fechaAlta, '%d-%m-%Y') AS fechaAlta,  
        m.bajoStock, 
        m.idEstado, 
        es.descripcion AS estadoDescripcion,
        m.ultimoUsuarioId, 
        m.idCategoria, 
        c.descripcion AS categoriaNombre,
        m.idDeposito, 
        d.nombre AS depositoNombre,
        u.id AS ubicacionId,
        u.nombre AS ubicacionNombre, 
        m.idEspacio, 
        e.numeroEspacio,
        et.id AS estanteriaId,
        et.numero AS estanteriaNumero,  
        et.cantidad_estante AS cantidadEstante,   
        et.cantidad_division AS cantidadDivision, 
        e.fila AS estanteEstanteria,                
        e.columna AS divisionEstanteria,             
        p.numero AS pasilloNumero,
        l.descripcion AS lado,
        COALESCE(uu.nombre_usuario, 'No disponible') AS ultimoUsuarioNombre  
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
    WHERE 
        m.id = ?`;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el material:', err);
            return res.status(500).json({ mensaje: 'Error al obtener el material' });
        }
        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Material no encontrado' });
        }

        res.status(200).json(results[0]);  // <-- Enviar los resultados
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
        et.numero AS estanteriaNumero,                 
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

//Este endpoint trae la lista de materiales por ID, se usa en EditarMaterial
app.get('/materials/:id', (req, res) => {
    const id = req.params.id;

    const query = `
    SELECT 
        m.id, 
        m.nombre, 
        m.cantidad, 
        m.imagen, 
        m.matricula, 
        DATE_FORMAT(m.fechaUltimoEstado, '%d-%m-%Y') AS fechaUltimoEstado,
        DATE_FORMAT(m.fechaAlta, '%d-%m-%Y') AS fechaAlta,  
        m.bajoStock, 
        m.idEstado, 
        es.descripcion AS estadoDescripcion, 
        m.idCategoria, 
        c.descripcion AS categoriaNombre,
        m.idDeposito, 
        d.nombre AS depositoNombre,
        u.id AS ubicacionId,
        u.nombre AS ubicacionNombre, 
        m.idEspacio, 
        e.numeroEspacio,
        et.id AS estanteriaId,
        et.numero as estanteriaNumero,  
        et.cantidad_estante AS cantidadEstante,   
        et.cantidad_division AS cantidadDivision, 
        e.fila AS estanteEstanteria,                
        e.columna AS divisionEstanteria,
        p.id AS idPasillo,             
        p.numero AS pasilloNumero,
        l.descripcion AS lado
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
    WHERE 
        m.id = ?`;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el material:', err);
            return res.status(500).json({ mensaje: 'Error al obtener el material' });
        }
        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Material no encontrado' });
        }
        res.status(200).json(results[0]);
    });
});


// Endpoint para editar un material
app.put('/materiales/:id', authenticateToken, upload.single('imagen'), (req, res) => {
    const id = req.params.id;
    const { nombre, cantidad, matricula, fechaUltimoEstado, bajoStock, idCategoria, idDeposito, idEspacio, eliminarImagen } = req.body;
    const nuevaImagen = req.file ? '/uploads/' + req.file.filename : null;
    let { idEstado } = req.body;
    let idEstadoComp = idEstado;
    const usuarioId = req.user.id;

    idEstado = assignStatus(cantidad, bajoStock);

    // Primero, obtener la imagen existente si existe
    db.query('SELECT imagen FROM Material WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener la imagen actual del material:', err);
            return res.status(500).json({ error: 'Error al obtener la imagen actual del material' });
        }

        const imagenActual = results.length > 0 ? results[0].imagen : null;
        const nombreActual = results[0].nombre;
        const idDepositoActual = results[0].idDeposito;

        // Determinar el nombre e idDeposito que se utilizarán
        const nombreFinal = nombre || nombreActual;
        const idDepositoFinal = idDeposito || idDepositoActual;

        // Validar que no exista otro material con el mismo nombre en el mismo depósito
        db.query('SELECT * FROM Material WHERE nombre = ? AND idDeposito = ? AND id != ?', [nombreFinal, idDepositoFinal, id], (err, results) => {
            if (err) {
                console.error('Error al verificar si ya existe un material con el mismo nombre en el mismo depósito:', err);
                return res.status(500).json({ error: 'Error al verificar el material' });
            }
            if (results.length > 0) {
                // Existe otro material con el mismo nombre en el mismo depósito
                return res.status(400).json({ error: 'Ya existe un material con el mismo nombre en este depósito' });
            }
            // Construir la consulta de actualización con los parámetros que se han enviado
            const queryParams = [
                nombre || null,
                cantidad || null,
                bajoStock || null,
                matricula || null,
                fechaUltimoEstado || null,
                idEstado || null,
                idCategoria || null,
                idDeposito || null,
                idEspacio || null,
                nuevaImagen
            ];

            let query = `
            UPDATE Material SET
            nombre = COALESCE(?, nombre),
            cantidad = COALESCE(?, cantidad),
            bajoStock = COALESCE(?, bajoStock), 
            matricula = COALESCE(?, matricula),
            fechaUltimoEstado = COALESCE(?, NOW()),
            idEstado = COALESCE(?, idEstado),
            idCategoria = COALESCE(?, idCategoria),
            idDeposito = COALESCE(?, idDeposito),
            idEspacio = COALESCE(?, idEspacio)`;

            if (nuevaImagen) {
                query += `, imagen = ?`;
            } else if (eliminarImagen === 'true' && imagenActual) {
                query += `, imagen = NULL`;
                queryParams.pop(); // No incluir nuevaImagen ya que se está eliminando
            } else {
                queryParams.pop(); // No incluir nuevaImagen si no se está eliminando ni agregando
            }

            query += ` WHERE id = ?`;
            queryParams.push(id);

            db.query(query, queryParams, (err, result) => {
                if (err) {
                    console.error('Error al actualizar el material:', err);
                    return res.status(500).json({ error: 'Error al actualizar el material', details: err.message });
                }

                // Si se sube una nueva imagen, eliminar la imagen anterior
                if (nuevaImagen && imagenActual) {
                    const fullPath = path.join(__dirname, 'public', imagenActual);
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            console.error('Error al eliminar la imagen anterior:', err);
                        }
                    });
                }

                // Si se marca para eliminar y no hay nueva imagen, eliminar la imagen actual
                if (eliminarImagen === 'true' && imagenActual && !nuevaImagen) {
                    const fullPath = path.join(__dirname, 'public', imagenActual);
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            console.error('Error al eliminar la imagen marcada para eliminación:', err);
                        }
                    });
                }

                if (idEstado != idEstadoComp) {
                    handleStockNotifications(nombre, cantidad, bajoStock, (error) => {
                        if (error) {
                            return res.status(500).json({ error: 'Error al manejar notificaciones de stock' });
                        }
                        // Insertar registro en Auditoria después de la actualización
                        db.query(
                            `INSERT INTO Auditoria (id_usuario, tipo_accion, comentario) VALUES (?, 'Edición de Material', ?)`,
                            [usuarioId, `Material editado: ${nombre}`],
                            (err) => {
                                if (err) {
                                    console.error('Error al registrar auditoría:', err);
                                    return res.status(500).json({ error: 'Error al registrar auditoría' });
                                }
                                res.status(200).json({ success: 'Material actualizado con éxito y auditoría registrada' });
                            }
                        );
                    });
                } else {
                    // Insertar registro en Auditoria después de la actualización
                    db.query(
                        `INSERT INTO Auditoria (id_usuario, tipo_accion, comentario) VALUES (?, 'Edición de Material', ?)`,
                        [usuarioId, `Material editado: ${nombre}`],
                        (err) => {
                            if (err) {
                                console.error('Error al registrar auditoría:', err);
                                return res.status(500).json({ error: 'Error al registrar auditoría' });
                            }
                            res.status(200).json({ success: 'Material actualizado con éxito y auditoría registrada' });
                        }
                    );
                };
            });
        });
    });
});


app.post('/addMaterial', upload.single('imagen'), (req, res) => {
    const { nombre, matricula, idEspacio, idCategoria, idDeposito, fechaAlta, fechaUltimoEstado, ultimoUsuarioId, ocupado } = req.body;
    let { cantidad, bajoStock } = req.body;
    const imagen = req.file;

    if (!nombre || cantidad == null || !matricula || !idEspacio || !idCategoria || !idDeposito || !ultimoUsuarioId) {
        return res.status(400).json({ mensaje: 'Campos obligatorios faltantes' });
    }

    // Verificar si ya existe un material con el mismo nombre en el mismo depósito
    const checkQuery = 'SELECT * FROM Material WHERE LOWER(nombre) = LOWER(?) AND idDeposito = ?';
    db.query(checkQuery, [nombre, idDeposito], (err, results) => {
        if (err) {
            console.error('Error al verificar material:', err);
            return res.status(500).json({ mensaje: 'Error al verificar material' });
        }

        if (results.length > 0) {
            // Si existe, devolver error
            return res.status(400).json({ mensaje: 'Ya existe un material con este nombre en el depósito seleccionado' });
        }

        let idEstado = assignStatus(cantidad, bajoStock);

        const insertQuery = `INSERT INTO Material (nombre, cantidad, matricula, bajoStock, idEstado, idEspacio, idCategoria, idDeposito, fechaAlta, fechaUltimoEstado, ultimoUsuarioId, ocupado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [nombre, cantidad, matricula, bajoStock, idEstado, idEspacio, idCategoria, idDeposito, fechaAlta, fechaUltimoEstado, ultimoUsuarioId, ocupado];

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
});

app.delete('/materials/delete/:id', (req, res) => {
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

// Endpoint para obtener las salidas de materiales
app.get('/exits', (req, res) => {
    const query = `
        SELECT 
            s.id AS salidaId,
            numero,
            motivo,
            DATE_FORMAT(s.fecha, '%d-%m-%Y') AS fechaSalida,
            COALESCE(GROUP_CONCAT(m.nombre ORDER BY ds.idMaterial ASC SEPARATOR ', '), 'Sin Material') AS nombresMateriales,
            COALESCE(GROUP_CONCAT(ds.cantidad ORDER BY ds.idMaterial ASC SEPARATOR ' , '), 'Sin Cantidad') AS cantidadesMateriales,
            COALESCE(GROUP_CONCAT(DISTINCT d.nombre ORDER BY d.nombre ASC SEPARATOR ', '), 'Sin Depósito') AS depositoNombre,
            COALESCE(GROUP_CONCAT(DISTINCT u.nombre ORDER BY u.nombre ASC SEPARATOR ', '), 'Sin Ubicación') AS ubicacionNombre
        FROM 
            salida_material s
        LEFT JOIN 
            detalle_salida_material ds ON s.id = ds.idSalida
        LEFT JOIN 
            Material m ON ds.idMaterial = m.id
        LEFT JOIN 
            Deposito d ON m.idDeposito = d.id
        LEFT JOIN 
            Ubicacion u ON d.idUbicacion = u.id
        GROUP BY 
            s.id, s.fecha
        ORDER BY 
            s.fecha DESC;
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching material exits:', error);
            return res.status(500).json({ error: 'Error al obtener las salidas de materiales' });
        }
        // Siempre devuelve un objeto con la propiedad 'data', que es un array
        res.status(200).json({ data: results });
    });
});

//Este endpoint se usa para el informe de salida de material y para el editar salida de materiales
app.get('/exits-details', (req, res) => {
    const query = `
        SELECT 
            s.id AS salidaId,
            DATE_FORMAT(s.fecha, '%d-%m-%Y') AS fechaSalida,
            s.motivo,
            u.id AS usuarioId,
            u.nombre AS usuarioNombre, 
            ds.cantidad AS cantidadMaterial, 
            m.id AS idMaterial,
            m.cantidad as cantidadDisponible,
            m.nombre AS nombreMaterial, 
            d.id AS depositoId, 
            d.nombre AS depositoNombre, 
            ub.id AS ubicacionId,
            ub.nombre AS ubicacionNombre
        FROM 
            salida_material s
        JOIN 
            detalle_salida_material ds ON s.id = ds.idSalida
        JOIN 
            Material m ON ds.idMaterial = m.id
        LEFT JOIN 
            Deposito d ON m.idDeposito = d.id
        LEFT JOIN 
            Ubicacion ub ON d.idUbicacion = ub.id
        LEFT JOIN 
            Usuario u ON s.idUsuario = u.id 
        ORDER BY 
            s.fecha DESC;
    `;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching material exit details:', error);
            return res.status(500).json({ error: 'Error al obtener los detalles de las salidas de materiales' });
        }

        res.status(200).json(results);
    });
});

app.post('/materials/exits', async (req, res) => {
    const salidas = req.body; // Aquí recibes un array de objetos

    try {
        let { motivo, fecha, idUsuario, numero } = salidas[0]; // Tomamos el motivo, fecha, y usuario del primer material (asumimos que es el mismo para todos)
        fecha = addDays(new Date(fecha), 2); // Ajuste de día
        const formattedFecha = format(fecha, 'yyyy-MM-dd');

        // 1. Registrar la salida principal en la tabla `salida_material`
        const salidaId = await new Promise((resolve, reject) => {
            db.query('INSERT INTO salida_material (fecha, numero, motivo, idUsuario) VALUES (?, ?, ?, ?)',
                [formattedFecha, numero, motivo, idUsuario], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                });
        });

        // 2. Para cada material, agregar su detalle a la tabla `detalle_salida_material`
        for (const salida of salidas) {
            const { idMaterial, cantidad } = salida;

            // Verificar que el material existe y obtener la cantidad disponible
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT cantidad, bajoStock, nombre FROM Material WHERE id = ?', [idMaterial], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });

            if (!result || result.length === 0) {
                return res.status(404).json({ message: 'Material no encontrado' });
            }

            const material = result[0];

            if (material.cantidad < cantidad) {
                return res.status(400).json({ message: `La cantidad de salida no puede ser mayor a la cantidad disponible para el material ${material.nombre}` });
            }

            // Registrar el detalle del material en la tabla `detalle_salida_material`
            await new Promise((resolve, reject) => {
                db.query('INSERT INTO detalle_salida_material (idSalida, idMaterial, cantidad) VALUES (?, ?, ?)',
                    [salidaId, idMaterial, cantidad], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
            });

            // Actualizar la cantidad del material en la tabla `Material`
            await new Promise((resolve, reject) => {
                db.query('UPDATE Material SET cantidad = cantidad - ? WHERE id = ?', [cantidad, idMaterial], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            // Obtener la nueva cantidad después de la actualización
            const nuevaCantidad = material.cantidad - cantidad;

            // Asignar el nuevo estado utilizando assignStatus
            const nuevoEstado = assignStatus(nuevaCantidad, material.bajoStock);

            // Verificar que 'nuevoEstado' sea un valor válido antes de realizar el UPDATE
            if ([1, 2, 3].includes(nuevoEstado)) {
                // Actualizar el idEstado del material
                await new Promise((resolve, reject) => {
                    db.query('UPDATE Material SET idEstado = ? WHERE id = ?', [nuevoEstado, idMaterial], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            } else {
                console.error(`Error: El estado asignado (${nuevoEstado}) no es válido para el material con id: ${idMaterial}`);
                return res.status(500).json({ message: 'Error al actualizar el estado del material' });
            }

            // Manejar las notificaciones de stock
            handleStockNotifications(material.nombre, nuevaCantidad, material.bajoStock, (error) => {
                if (error) {
                    console.error('Error al manejar notificaciones de stock:', error);
                    return res.status(500).json({ message: 'Error al manejar notificaciones de stock' });
                }
            });
        }

        // 3. Registrar la acción en la tabla de auditoría
        await new Promise((resolve, reject) => {
            const comentario = `Salida generada con número: ${numero}`;
            const tipoAccion = "Creación de Salida";
            db.query('INSERT INTO Auditoria (id_usuario, tipo_accion, comentario) VALUES (?, ?, ?)',
                [idUsuario, tipoAccion, comentario], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
        });

        return res.status(201).json({ message: 'Salida registrada con éxito, notificaciones actualizadas, y auditoría registrada' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe una salida con el número de salida ingresado' })
        } else {
            console.error('Error registrando salida de material:', error.message);
            console.error(error.stack);
            return res.status(500).json({ message: 'Error registrando salida de material' });
        }

    }
});


app.put('/materials/exits/:id', async (req, res) => {
    const salidaId = req.params.id;
    const salidasActualizadas = req.body;

    try {
        if (!salidasActualizadas || Object.keys(salidasActualizadas).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron datos para actualizar la salida' });
        }

        // Extraer los datos de `salidasActualizadas`
        let { motivo, fecha, idUsuario, numero, idUbicacion, idDeposito, materials } = salidasActualizadas;

        if (!motivo || !fecha || !idUsuario || !idUbicacion || !idDeposito || !materials) {
            return res.status(400).json({ message: 'Datos incompletos para actualizar la salida' });
        }

        // Si `numero` está vacío o no está definido, obtener el número original de la salida
        if (!numero) {
            const originalNumero = await new Promise((resolve, reject) => {
                db.query('SELECT numero FROM salida_material WHERE id = ?', [salidaId], (err, results) => {
                    if (err) return reject(err);
                    if (results.length > 0) {
                        resolve(results[0].numero);
                    } else {
                        reject(new Error('Salida no encontrada'));
                    }
                });
            });
            numero = originalNumero;
        } else {
            // Verificar si el `numero` ya existe en otra salida
            const existingNumero = await new Promise((resolve, reject) => {
                db.query('SELECT id FROM salida_material WHERE numero = ? AND id != ?', [numero, salidaId], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });
            if (existingNumero.length > 0) {
                return res.status(409).json({ message: `El número de salida ${numero} ya existe.` });
            }
        }

        // Revertir las cantidades en el inventario de cada material de la salida original
        const originalSalidas = await new Promise((resolve, reject) => {
            db.query(`
                SELECT dsm.idMaterial, dsm.cantidad, m.cantidad AS stockActual, m.bajoStock
                FROM detalle_salida_material dsm
                JOIN Material m ON dsm.idMaterial = m.id
                WHERE dsm.idSalida = ?
            `, [salidaId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Revertimos la cantidad en la tabla Material
        for (const salida of originalSalidas) {
            const { idMaterial, cantidad, stockActual, bajoStock } = salida;
            const nuevaCantidad = stockActual + cantidad;

            await new Promise((resolve, reject) => {
                db.query('UPDATE Material SET cantidad = ? WHERE id = ?', [nuevaCantidad, idMaterial], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const nuevoEstado = assignStatus(nuevaCantidad, bajoStock);
            if ([1, 2, 3].includes(nuevoEstado)) {
                await new Promise((resolve, reject) => {
                    db.query('UPDATE Material SET idEstado = ? WHERE id = ?', [nuevoEstado, idMaterial], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }
        }
        // Formatear la fecha
        const formattedFecha = fecha.includes('-') ? fecha : format(new Date(fecha), 'yyyy-MM-dd');
        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE salida_material SET numero = ?, fecha = ?, motivo = ?, idUsuario = ? WHERE id = ?',
                [numero, formattedFecha, motivo, idUsuario, salidaId],
                (err) => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
        // Borrar los detalles de salida anteriores para agregar los nuevos detalles
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM detalle_salida_material WHERE idSalida = ?', [salidaId], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        // Insertar los detalles de salida actualizados y ajustar inventario
        for (const salida of materials) {
            const { idMaterial, cantidad } = salida;
            if (cantidad < 0) {
                return res.status(400).json({ message: 'La cantidad no puede ser negativa' });
            }
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT cantidad, bajoStock, nombre FROM Material WHERE id = ?', [idMaterial], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });

            if (!result || result.length === 0) {
                return res.status(404).json({ message: 'Material no encontrado' });
            }
            const material = result[0];
            const nuevaCantidadMaterial = material.cantidad - cantidad;
            if (nuevaCantidadMaterial < 0) {
                return res.status(400).json({ message: `La cantidad de salida no puede ser mayor a la cantidad disponible para el material ${material.nombre}` });
            }
            await new Promise((resolve, reject) => {
                db.query('INSERT INTO detalle_salida_material (idSalida, idMaterial, cantidad) VALUES (?, ?, ?)', [salidaId, idMaterial, cantidad], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise((resolve, reject) => {
                db.query('UPDATE Material SET cantidad = ? WHERE id = ?', [nuevaCantidadMaterial, idMaterial], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const nuevoEstado = assignStatus(nuevaCantidadMaterial, material.bajoStock);
            if ([1, 2, 3].includes(nuevoEstado)) {
                await new Promise((resolve, reject) => {
                    db.query('UPDATE Material SET idEstado = ? WHERE id = ?', [nuevoEstado, idMaterial], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }

            handleStockNotifications(material.nombre, nuevaCantidadMaterial, material.bajoStock, (error) => {
                if (error) {
                    console.error('Error en notificaciones de stock:', error);
                    return res.status(500).json({ message: 'Error al manejar notificaciones de stock' });
                }
            });
        }

        // Registrar la acción de edición en la tabla de auditoría
        await new Promise((resolve, reject) => {
            const comentario = `Salida editada con número: ${numero}`;
            const tipoAccion = "Edición de Salida";
            db.query('INSERT INTO Auditoria (id_usuario, tipo_accion, comentario) VALUES (?, ?, ?)',
                [idUsuario, tipoAccion, comentario], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
        });

        res.status(200).json({ message: 'Salida actualizada con éxito y auditoría registrada' });

    } catch (error) {
        console.error('Error actualizando salida:', error);
        res.status(500).json({ message: 'Error actualizando salida' });
    }
});



app.get('/materials-with-exits', (req, res) => {
    const query = `
        SELECT DISTINCT dm.idMaterial, m.nombre AS nombreMaterial, d.nombre AS depositoNombre, u.nombre AS ubicacionNombre
        FROM detalle_salida_material dm
        JOIN Material m ON dm.idMaterial = m.id
        JOIN Deposito d ON m.idDeposito = d.id
        JOIN Ubicacion u ON d.idUbicacion = u.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener materiales con salidas:', err);
            return res.status(500).json({ mensaje: 'Error al obtener materiales con salidas' });
        }

        // Respondemos con los materiales y detalles de salida
        res.status(200).json({ materiales: results });
    });
});

app.get('/last-material-output', (req, res) => {
    const query = `
        SELECT 
            sm.id AS idSalida,
            sm.fecha
        FROM 
            Salida_material sm
        ORDER BY 
            sm.fecha DESC
        LIMIT 1;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener la última salida de material:', err);
            return res.status(500).json({ error: 'Error al obtener la última salida de material' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No hay registros de salidas de material' });
        }
        res.json(results[0]);
    });
});



app.delete('/delete-exits', (req, res) => {
    const { exitIds } = req.body; // El JSON enviado desde el frontend debe contener un campo "exitIds"

    if (!exitIds || exitIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron salidas para eliminar' });
    }

    // Construimos la consulta para eliminar múltiples IDs
    const placeholders = exitIds.map(() => '?').join(',');
    const query = `DELETE FROM salida_material WHERE id IN (${placeholders})`;

    db.query(query, exitIds, (err, result) => {
        if (err) {
            console.error('Error eliminando salidas:', err);
            return res.status(500).json({ message: 'Error eliminando salidas' });
        }

        res.status(200).json({ message: 'Salidas eliminadas correctamente' });
    });
});

// Endpoint para obtener materiales por depósito
app.get('/materials/deposit/:idDeposito', (req, res) => {
    const idDeposito = req.params.idDeposito;

    const query = `
    SELECT 
        m.id, 
        m.nombre, 
        m.cantidad, 
        m.matricula, 
        m.idDeposito, 
        d.nombre AS depositoNombre
    FROM 
        Material m
    LEFT JOIN 
        Deposito d ON m.idDeposito = d.id
    WHERE 
        d.id = ?`;

    db.query(query, [idDeposito], (err, results) => {
        if (err) {
            console.error('Error al obtener los materiales por depósito:', err);
            return res.status(500).send('Error al consultar la base de datos');
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron materiales para este depósito' });
        }

        res.status(200).json(results);
    });
});

app.get('/aisles-shelves', (req, res) => {
    const query = `
        SELECT 
            p.id, p.numero, d.Nombre AS nombreDeposito, u.nombre AS ubicacionDeposito,
            p.idLado1,
            p.idLado2,
            COALESCE(l1.descripcion, 'Sin lado') AS lado1Descripcion, 
            COALESCE(l2.descripcion, 'Sin lado') AS lado2Descripcion
        FROM 
            Pasillo p
        LEFT JOIN 
            Deposito d ON p.idDeposito = d.id
        LEFT JOIN 
            Lado l1 ON p.idLado1 = l1.id
        LEFT JOIN 
            Lado l2 ON p.idLado2 = l2.id
        LEFT JOIN 
            Ubicacion u ON d.idUbicacion = u.id
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

app.delete('/locations/delete/:id', (req, res) => {
    const ubicacionId = req.params.id;

    // Verificar si la ubicación existe en la base de datos
    const queryCheckUbicacion = 'SELECT id FROM Ubicacion WHERE id = ?';
    db.query(queryCheckUbicacion, [ubicacionId], (err, results) => {
        if (err) {
            console.error('Error al verificar la ubicación:', err);
            return res.status(500).send('Error al verificar la ubicación');
        }

        if (results.length > 0) {
            // Si la ubicación existe, proceder a eliminarla
            const queryDeleteUbicacion = 'DELETE FROM Ubicacion WHERE id = ?';

            db.query(queryDeleteUbicacion, [ubicacionId], (err, result) => {
                if (err) {
                    console.error('Error al eliminar la ubicación:', err);
                    return res.status(500).send('Error al eliminar la ubicación');
                }

                res.status(200).send('Ubicación eliminada con éxito');
            });
        } else {
            // Si la ubicación no existe
            return res.status(404).send('Ubicación no encontrada');
        }
    });
});

app.delete('/deposits/delete/:id', (req, res) => {
    const depositoId = req.params.id;

    // Verificar si el depósito existe en la base de datos
    const queryCheckDeposito = 'SELECT id FROM Deposito WHERE id = ?';

    db.query(queryCheckDeposito, [depositoId], (err, results) => {
        if (err) {
            console.error('Error al verificar el depósito:', err);
            return res.status(500).send('Error al verificar el depósito');
        }

        if (results.length > 0) {
            // Si el depósito existe, proceder a eliminarlo
            const queryDeleteDeposito = 'DELETE FROM Deposito WHERE id = ?';

            db.query(queryDeleteDeposito, [depositoId], (err, result) => {
                if (err) {
                    console.error('Error al eliminar el depósito:', err);
                    return res.status(500).send('Error al eliminar el depósito');
                }
                res.status(200).send('Depósito eliminado con éxito');
            });
        } else {
            // Si el depósito no existe
            return res.status(404).send('Depósito no encontrado');
        }
    });
});

app.delete('/category/delete/:id', (req, res) => {
    const categoriaId = req.params.id;

    // Verificar si el depósito existe en la base de datos
    const queryCheckCategoria = 'SELECT id FROM Categoria WHERE id = ?';

    db.query(queryCheckCategoria, [categoriaId], (err, results) => {
        if (err) {
            console.error('Error al verificar la categoria:', err);
            return res.status(500).send('Error al verificar la categoria');
        }

        if (results.length > 0) {
            // Si el depósito existe, proceder a eliminarlo
            const queryDeleteCategoria = 'DELETE FROM Categoria WHERE id = ?';

            db.query(queryDeleteCategoria, [categoriaId], (err, result) => {
                if (err) {
                    console.error('Error al eliminar la categoria:', err);
                    return res.status(500).send('Error al eliminar la categoria');
                }
                res.status(200).send('Categoria eliminada con éxito');
            });
        } else {
            // Si el depósito no existe
            return res.status(404).send('Categoria no encontrada');
        }
    });
});

app.delete('/aisle/delete/:id', (req, res) => {
    const pasilloId = req.params.id;

    // Verificar si el depósito existe en la base de datos
    const queryCheckPasillo = 'SELECT id FROM Pasillo WHERE id = ?';

    db.query(queryCheckPasillo, [pasilloId], (err, results) => {
        if (err) {
            console.error('Error al verificar el pasillo:', err);
            return res.status(500).send('Error al verificar el pasillo');
        }

        if (results.length > 0) {
            // Si el depósito existe, proceder a eliminarlo
            const queryDeletePasillo = 'DELETE FROM Pasillo WHERE id = ?';

            db.query(queryDeletePasillo, [pasilloId], (err, result) => {
                if (err) {
                    console.error('Error al eliminar el pasillo:', err);
                    return res.status(500).send('Error al eliminar el pasillo');
                }
                res.status(200).send('Pasillo eliminado con éxito');
            });
        } else {
            // Si el depósito no existe
            return res.status(404).send('Pasillo no encontrado');
        }
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
                `INSERT INTO usuario_notificacion (idUsuario, idNotificacion, visto) 
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

function notifyNewMaterialCreation(nombre, idDeposito, callback) {
    // Obtener el nombre del depósito
    const queryDeposito = `SELECT nombre FROM Deposito WHERE id = ?`;

    db.query(queryDeposito, [idDeposito], (error, depositoResult) => {
        if (error) {
            console.error('Error al obtener el nombre del depósito:', error);
            return callback({ mensaje: 'Error al obtener el nombre del depósito' });
        }

        if (depositoResult.length === 0) {
            return callback({ mensaje: 'Depósito no encontrado' });
        }

        const nombreDeposito = depositoResult[0].nombre;

        const descripcion = `Se ha creado el material '${nombre}' en el '${nombreDeposito}' ya que no existía.`;

        db.query(
            `INSERT INTO notificacion (descripcion, fecha) VALUES (?, NOW())`,
            [descripcion],
            (error, result) => {
                if (error) {
                    console.error('Error al agregar notificación de nuevo material', error);
                    return callback({ mensaje: 'Error al agregar notificación de nuevo material' });
                }

                const notificacionId = result.insertId;

                db.query(
                    `INSERT INTO usuario_notificacion (idUsuario, idNotificacion, visto) 
                    SELECT id, ?, FALSE FROM usuario`,
                    [notificacionId],
                    (error) => {
                        if (error) {
                            console.error('Error al relacionar notificación de nuevo material con usuarios', error);
                            return callback({ mensaje: 'Error al relacionar notificación de nuevo material con usuarios' });
                        }
                        return callback(null);
                    }
                );
            }
        );
    });
}

function assignStatus(cantidad, bajoStock) {

    // Convertir a números para asegurar que las comparaciones sean correctas
    cantidad = parseInt(cantidad, 10);
    bajoStock = parseInt(bajoStock, 10);

    if (cantidad > bajoStock) {
        return 1; // Disponible
    } else if (cantidad <= bajoStock && cantidad > 0) {
        return 2; // Bajo stock
    } else if (cantidad === 0) {
        return 3; // Sin stock
    }

}

// Endpoint para verificar si es necesario mostrar el tutorial
app.get('/check-tutorial-status/:id', (req, res) => {
    const userId = req.params.id;

    const queryUser = 'SELECT firstLogin FROM usuario WHERE id = ?';
    db.query(queryUser, [userId], (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        if (results.length === 0) return res.status(404).send('Usuario no encontrado');

        const firstLogin = results[0].firstLogin;

        const queryCounts = `
            SELECT 
                (SELECT COUNT(*) FROM Deposito) AS depositoCount,
                (SELECT COUNT(*) FROM Categoria) AS categoriaCount,
                (SELECT COUNT(*) FROM Pasillo) AS pasilloCount,
                (SELECT COUNT(*) FROM Estanteria) AS estanteriaCount
        `;

        db.query(queryCounts, (err, countsResults) => {
            if (err) return res.status(500).send('Error al consultar las tablas clave');

            const { depositoCount, categoriaCount, pasilloCount, estanteriaCount } = countsResults[0];
            const tutorialComplete = depositoCount > 0 && categoriaCount > 0 && pasilloCount > 0 && estanteriaCount > 0;

            if (firstLogin === 1 && tutorialComplete) {
                return res.json({
                    redirectToChangePassword: true,
                    showTutorial: true,
                    steps: { confirmStep: true } // Aseguramos que muestre el paso de confirmación
                });
            }

            if (firstLogin === 1) {
                return res.json({
                    showTutorial: true,
                    steps: {
                        deposito: depositoCount === 0,
                        categoria: categoriaCount === 0,
                        pasillo: pasilloCount === 0,
                        estanteria: estanteriaCount === 0,
                        confirmStep: true
                    }
                });
            }

            res.json({ showTutorial: false });
        });
    });
});



// Cambiar de POST a PATCH, ya que estamos realizando una actualización
app.patch('/complete-tutorial/:id', (req, res) => {
    const userId = req.params.id; // Obtén el userId del parámetro de la URL

    if (!userId) {
        return res.status(400).json({ message: 'El ID del usuario es obligatorio' });
    }

    // Actualiza el campo `firstLogin` a `0`
    const query = 'UPDATE usuario SET firstLogin = 0 WHERE id = ?';

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el estado del tutorial:', err);
            return res.status(500).json({ message: 'Error al completar el tutorial' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Tutorial completado con éxito' });
    });
});



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
        const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET_KEY, { expiresIn: '24h' });

        // Verificar si es el primer login
        const firstLogin = user.firstLogin;

        res.json({
            token,
            nombre: user.nombre,
            rol: user.rol,
            id: user.id,
            firstLogin
        });
    });
});

app.post('/logout', (req, res) => {
    res.status(200).send('Logout exitoso');
});

// Endpoint para agregar usuarios
app.post('/addUser', upload.single('imagen'), (req, res) => {
    const { nombre, apellido, legajo, nombre_usuario, contrasenia, email, rol } = req.body;
    const imagen = req.file;

    if (!nombre || !apellido || !legajo || !nombre_usuario || !contrasenia || !email || !rol) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    if (!req.headers.authorization) {
        return res.status(401).send("Authorization header missing");
    }

    const token = req.headers.authorization.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return res.status(401).json({message: 'Por favor inicie sesión nuevamente'});
    }

    if (decoded.rol !== 'Administrador') {
        return res.status(403).json({message: 'Permiso denegado'});
    }

    const checkUserQuery = `
        SELECT COUNT(*) AS userCount FROM usuario 
        WHERE nombre_usuario = ? OR legajo = ? OR email = ?
    `;

    db.query(checkUserQuery, [nombre_usuario, legajo, email], (err, result) => {
        if (err) {
            return res.status(500).send("Error al verificar la existencia de usuario");
        }
        const { userCount } = result[0];
        if (userCount > 0) {
            return res.status(400).json({ message: 'Ya existe un usuario con el mismo nombre de usuario, legajo o email' });
        }
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(contrasenia, salt);
        const user = {
            nombre,
            apellido,
            legajo,
            nombre_usuario,
            contrasenia: passwordHash,
            email,
            rol,
            firstLogin: 1
        };
        const query = 'INSERT INTO usuario SET ?';
        db.query(query, user, (err, result) => {
            if (err) {
                return res.status(500).send("Error al crear el usuario");
            }
            const userId = result.insertId;
            if (imagen) {
                const imagenPath = `/uploads/SIPEUser-img-${userId}${path.extname(imagen.originalname)}`;
                const newFilePath = path.join(__dirname, 'public', imagenPath);

                fs.rename(imagen.path, newFilePath, (err) => {
                    if (err) {
                        console.error('Error al renombrar la imagen:', err);
                        return res.status(500).json({ message: 'Error al guardar la imagen' });
                    }

                    db.query('UPDATE usuario SET imagen = ? WHERE id = ?', [imagenPath, userId], (err) => {
                        if (err) {
                            console.error('Error al actualizar la base de datos con la imagen:', err);
                            return res.status(500).json({ message: 'Error al actualizar la imagen en la base de datos' });
                        }
                        res.status(200).json({ message: 'Usuario creado con éxito y imagen guardada' });
                    });
                });
            } else {
                res.status(200).json({ message: 'Usuario creado con éxito' });
            }
        });
    });
});



app.get('/users', (req, res) => {
    const query = `
        SELECT 
            u.id, u.nombre, u.apellido, u.legajo, u.imagen, u.nombre_usuario, u.email, u.rol 
        FROM Usuario u`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Eliminar un usuario
app.delete('/users/delete/:id', (req, res) => {
    const userId = req.params.id;

    // Verificar que el ID del usuario es válido
    if (!userId) {
        return res.status(400).json({ mensaje: 'ID de usuario faltante' });
    }

    // Verificar si el usuario existe
    db.query('SELECT * FROM usuario WHERE id = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ mensaje: 'Error al buscar el usuario' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Eliminar la imagen asociada si existe
        const user = results[0];
        if (user.imagen) {
            const imagenPath = path.join(__dirname, 'public', user.imagen);
            fs.unlink(imagenPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Error al eliminar la imagen:', err);
                }
            });
        }

        // Eliminar el usuario de la base de datos
        db.query('DELETE FROM usuario WHERE id = ?', [userId], (err) => {
            if (err) {
                return res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
            }

            res.status(200).json({ mensaje: 'Usuario eliminado con éxito' });
        });
    });
});

// Editar un usuario
app.put('/editUser/:id', upload.single('imagen'), async (req, res) => {
    const userId = req.params.id;
    const { nombre, apellido, legajo, nombre_usuario, email, rol, eliminarImagen } = req.body;
    const imagen = req.file;

    if (!nombre || !apellido || !legajo || !nombre_usuario || !email || !rol) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        // Verificar duplicado de nombre_usuario
        const existingUsername = await queryPromise(
            'SELECT id FROM usuario WHERE nombre_usuario = ? AND id != ?',
            [nombre_usuario, userId]
        );
        if (existingUsername.length > 0) {
            return res.status(409).json({ message: 'El nombre de usuario ya está en uso' });
        }

        // Verificar duplicado de legajo
        const existingLegajo = await queryPromise(
            'SELECT id FROM usuario WHERE legajo = ? AND id != ?',
            [legajo, userId]
        );
        if (existingLegajo.length > 0) {
            return res.status(409).json({ message: 'El legajo ya está en uso' });
        }

        // Verificar duplicado de email
        const existingEmail = await queryPromise(
            'SELECT id FROM usuario WHERE email = ? AND id != ?',
            [email, userId]
        );
        if (existingEmail.length > 0) {
            return res.status(409).json({ message: 'El email ya está en uso' });
        }

        // Actualiza la información del usuario
        const updateUserQuery = `
            UPDATE usuario 
            SET nombre = ?, apellido = ?, legajo = ?, nombre_usuario = ?, email = ?, rol = ? 
            WHERE id = ?
        `;
        const values = [nombre, apellido, legajo, nombre_usuario, email, rol, userId];

        await queryPromise(updateUserQuery, values);

        // Si hay una nueva imagen para guardar
        if (imagen) {
            const imagenPath = `/uploads/SIPEUser-img-${userId}${path.extname(imagen.originalname)}`;
            const newFilePath = path.join(__dirname, 'public', imagenPath);

            try {
                await fsPromises.rename(imagen.path, newFilePath);

                await queryPromise('UPDATE usuario SET imagen = ? WHERE id = ?', [imagenPath, userId]);
                return res.status(200).json({ message: 'Usuario actualizado correctamente con imagen' });
            } catch (err) {
                console.error('Error al procesar la imagen:', err);
                return res.status(500).json({ message: 'Error al procesar la imagen' });
            }
        }
        // Si se solicita eliminar la imagen
        else if (eliminarImagen === 'true') {
            try {
                const result = await queryPromise('SELECT imagen FROM usuario WHERE id = ?', [userId]);
                const currentImagePath = result[0]?.imagen;
                if (currentImagePath) {
                    const fullPath = path.join(__dirname, 'public', currentImagePath);
                    try {
                        await fsPromises.unlink(fullPath);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.error('Error al eliminar la imagen física:', err);
                            return res.status(500).json({ message: 'Error al eliminar la imagen física' });
                        }
                    }

                    await queryPromise('UPDATE usuario SET imagen = NULL WHERE id = ?', [userId]);
                    return res.status(200).json({ message: 'Usuario actualizado y la imagen eliminada correctamente' });
                } else {
                    return res.status(200).json({ message: 'Usuario actualizado correctamente' });
                }
            } catch (err) {
                console.error('Error al procesar la eliminación de imagen:', err);
                return res.status(500).json({ message: 'Error al procesar la eliminación de imagen' });
            }
        } else {
            // Si no se eliminó ni agregó una imagen
            return res.status(200).json({ message: 'Usuario actualizado correctamente' });
        }
    } catch (err) {
        console.error('Error al actualizar el usuario:', err);
        return res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
});


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

        // Obtener el nombre del usuario
        const userName = results[0].nombre;
        // Obtener el año actual
        const currentYear = new Date().getFullYear();
        // Generar un código de verificación de 5 dígitos
        const recoveryCode = Math.floor(10000 + Math.random() * 90000).toString();

        // Guardar el código de recuperación en la base de datos
        const query = 'UPDATE usuario SET cod_recuperacion = ? WHERE email = ?';
        db.query(query, [recoveryCode, email], (err, result) => {
            if (err) {
                console.error('Error al actualizar el código de recuperación:', err);
                return res.status(500).send('Error al actualizar el código de recuperación');
            }

            // Leer la plantilla HTML
            const templatePath = path.join(__dirname, '/TemplateMail/TemplateMail');
            fs.readFile(templatePath, 'utf-8', (err, data) => {
                if (err) {
                    console.error('Error al leer la plantilla HTML:', err);
                    return res.status(500).send('Error al leer la plantilla HTML');
                }

                // Reemplazar el código de recuperación en la plantilla HTML
                let customizedTemplate = data.replace('ABCDE', recoveryCode);
                customizedTemplate = customizedTemplate.replace('Usuario', userName);
                customizedTemplate = customizedTemplate.replace('2024', currentYear);

                // Configurar las opciones del correo con el contenido HTML
                const mailOptions = {
                    from: 'sipe.supp@gmail.com',
                    to: email,
                    subject: 'Código de recuperación de contraseña',
                    html: customizedTemplate // Enviar el HTML personalizado
                };

                // Enviar el correo
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
});

// Endpoint para verificar el código de recuperación
app.post('/verifyRecoveryCode', (req, res) => {
    const { email, recoveryCode } = req.body;

    const query = 'SELECT * FROM usuario WHERE email = ? AND cod_recuperacion = ?';
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

    const query = 'UPDATE usuario SET contrasenia = ?, cod_recuperacion = NULL, firstLogin = 0 WHERE email = ?';
    db.query(query, [passwordHash, email], (err, result) => {
        if (err) {
            console.error('Error al actualizar la contraseña:', err);
            return res.status(500).send('Error al actualizar la contraseña');
        }
        res.status(200).send('Contraseña actualizada');
    })
});


// Endpoint para agregar un nuevo pasillo
app.post('/addAisle', (req, res) => {
    const { numero, idDeposito, idLado1, idLado2 } = req.body;

    // Validación de campos requeridos
    if (!numero || !idDeposito || !idLado1) {
        return res.status(400).json({ error: 'Todos los campos requeridos deben estar completos' });
    }

    // Primero, verificar si ya existe un pasillo con el mismo número en el depósito
    const checkQuery = 'SELECT * FROM Pasillo WHERE numero = ? AND idDeposito = ?';
    db.query(checkQuery, [numero, idDeposito], (err, results) => {
        if (err) {
            console.error('Error al verificar pasillo:', err);
            return res.status(500).json({ error: 'Error al verificar pasillo', details: err });
        }

        if (results.length > 0) {
            // El pasillo ya existe
            return res.status(400).json({ error: 'Ya existe un pasillo con este número en el depósito seleccionado' });
        } else {
            // Si no existe, proceder a insertar
            const insertQuery = `
                INSERT INTO Pasillo (numero, idDeposito, idLado1, idLado2)
                VALUES (?, ?, ?, ?)
            `;
            const values = [numero, idDeposito, idLado1, idLado2 || null]; // Si no hay `idLado2`, insertar `null`

            db.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Error al insertar pasillo:', err);
                    return res.status(500).json({ error: 'Error al agregar pasillo', details: err });
                }
                res.status(200).json({ message: 'Pasillo agregado exitosamente', id: result.insertId });
            });
        }
    });
});



app.get('/aisles', (req, res) => {
    const depositoId = req.query.depositoId;
    let query = `
        SELECT 
            p.id, 
            p.numero, 
            d.Nombre AS nombreDeposito, 
            u.nombre AS ubicacionDeposito,
            CONCAT_WS(', ', l1.descripcion, l2.descripcion) AS ladosDescripcion, 
            COUNT(s.id) as totalEstanterias
        FROM 
            Pasillo p
        LEFT JOIN 
            Deposito d ON p.idDeposito = d.id
        LEFT JOIN 
            Lado l1 ON p.idLado1 = l1.id
        LEFT JOIN 
            Lado l2 ON p.idLado2 = l2.id
        LEFT JOIN 
            Ubicacion u ON d.idUbicacion = u.id
        LEFT JOIN 
            Estanteria s ON p.id = s.idPasillo
        `;

    if (depositoId) {
        query += ` WHERE p.idDeposito = ? 
        GROUP BY p.id, p.numero, d.Nombre, u.nombre, l1.descripcion, l2.descripcion
        ORDER BY p.numero ASC`;
        db.query(query, [depositoId], (err, results) => {
            if (err) return res.status(500).send('Error al consultar la base de datos');
            res.json(results);
        });
    } else {
        query += ` GROUP BY p.id, p.numero, d.Nombre, u.nombre, l1.descripcion, l2.descripcion
        ORDER BY p.numero ASC`;
        db.query(query, (err, results) => {
            if (err) return res.status(500).send('Error al consultar la base de datos');
            res.json(results);
        });
    }
});


//Endpoint para traer un pasillo a traves del ID
app.get('/aisle/:id', (req, res) => {
    const aisleId = req.params.id;
    const query = `
        SELECT 
            p.id, p.numero, p.idDeposito, p.idLado1, p.idLado2, d.idUbicacion 
        FROM 
            Pasillo p 
        LEFT JOIN 
            Deposito d ON p.idDeposito = d.id
        WHERE 
            p.id = ?
    `;
    db.query(query, [aisleId], (err, result) => {
        if (err) {
            console.error('Error al obtener el pasillo:', err);
            return res.status(500).json({ error: 'Error al obtener el pasillo', details: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Pasillo no encontrado' });
        }
        res.status(200).json(result[0]);
    });
});


// Endpoint para eliminar múltiples pasillos
app.delete('/delete-aisles', (req, res) => {
    const { aisleIds } = req.body; // Recibe los IDs de los pasillos a eliminar

    if (!aisleIds || aisleIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron pasillos para eliminar' });
    }

    const placeholders = aisleIds.map(() => '?').join(',');
    const query = `DELETE FROM pasillo WHERE id IN (${placeholders})`;

    db.query(query, aisleIds, (err, result) => {
        if (err) {
            console.error('Error eliminando pasillos:', err);
            return res.status(500).json({ message: 'Error eliminando pasillos' });
        }

        res.status(200).json({ message: 'Pasillos eliminados correctamente' });
    });
});

// Endpoint para actualizar un pasillo existente
app.put('/edit-aisle/:id', (req, res) => {
    const aisleId = req.params.id;
    const { numero, idDeposito, idLado1, idLado2 } = req.body;

    if (!numero || !idDeposito || !idLado1) {
        return res.status(400).json({ error: 'Todos los campos requeridos deben estar completos' });
    }

    const idLado2Value = idLado2 !== undefined && idLado2 !== '' ? idLado2 : null;

    // Verificar si ya existe un pasillo con el mismo número en el mismo depósito (excluyendo el actual)
    const checkQuery = `
        SELECT id FROM Pasillo 
        WHERE numero = ? AND idDeposito = ? AND id != ?
    `;

    db.query(checkQuery, [numero, idDeposito, aisleId], (err, results) => {
        if (err) {
            console.error('Error al verificar el pasillo:', err);
            return res.status(500).json({ error: 'Error al verificar el pasillo' });
        }

        if (results.length > 0) {
            // Existe otro pasillo con el mismo número en el mismo depósito
            return res.status(409).json({ error: 'Ya existe un pasillo con el mismo número en este depósito' });
        }

        // Si no existe conflicto, proceder con la actualización
        const updateQuery = `
            UPDATE Pasillo 
            SET numero = ?, idDeposito = ?, idLado1 = ?, idLado2 = ? 
            WHERE id = ?
        `;

        const values = [numero, idDeposito, idLado1, idLado2Value, aisleId];

        db.query(updateQuery, values, (err, result) => {
            if (err) {
                console.error('Error al actualizar el pasillo:', err);
                return res.status(500).json({ error: 'Error al actualizar el pasillo', details: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Pasillo no encontrado' });
            }
            res.status(200).json({ message: 'Pasillo actualizado correctamente' });
        });
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


app.post('/addDeposit', (req, res) => {
    const { nombre, idUbicacion } = req.body;

    if (!nombre || !idUbicacion) {
        return res.status(400).json({ message: 'Nombre y ubicación son obligatorios' });
    }
    const checkQuery = `
        SELECT * FROM Deposito 
        WHERE nombre = ? AND idUbicacion = ?
    `;
    db.query(checkQuery, [nombre, idUbicacion], (err, results) => {
        if (err) {
            console.error('Error al verificar depósito:', err);
            return res.status(500).json({ error: 'Error al verificar depósito', details: err });
        }
        if (results.length > 0) {
            // La estantería ya existe
            return res.status(400).json({ error: 'Ya existe una depósito con este nombre en esa ubicación' });
        } else {
            const query = 'INSERT INTO Deposito (nombre, idUbicacion) VALUES (?, ?)';
            const values = [nombre, idUbicacion];
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error al insertar depósito:', err);
                    return res.status(500).json({ message: 'Error al agregar depósito' });
                }
                res.status(200).json({ message: 'Depósito agregado exitosamente', id: result.insertId });
            });
        }
    });
});


app.get('/deposits', (req, res) => {
    const query = `
        SELECT 
        d.id, 
        d.nombre AS nombreDeposito, 
        u.nombre AS nombreUbicacion, 
        COUNT(DISTINCT p.id) AS cantidadPasillos, 
        COUNT(DISTINCT e.id) AS cantidadEstanterias,
        COUNT(m.id) AS totalMateriales
    FROM 
        Deposito d
    LEFT JOIN 
        Ubicacion u ON d.idUbicacion = u.id
    LEFT JOIN 
        Pasillo p ON d.id = p.idDeposito
    LEFT JOIN 
        Estanteria e ON p.id = e.idPasillo
    LEFT JOIN 
        Material m ON d.id = m.idDeposito
    GROUP BY 
        d.id, d.nombre, u.nombre;
        `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Endpoint para eliminar múltiples depósitos
app.delete('/delete-deposits', (req, res) => {
    const { depositIds } = req.body; // Recibe los IDs de los depósitos a eliminar

    if (!depositIds || depositIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron depósitos para eliminar' });
    }

    const placeholders = depositIds.map(() => '?').join(',');
    const query = `DELETE FROM deposito WHERE id IN (${placeholders})`;

    db.query(query, depositIds, (err, result) => {
        if (err) {
            console.error('Error eliminando depósitos:', err);
            return res.status(500).json({ message: 'Error eliminando depósitos' });
        }

        res.status(200).json({ message: 'Depósitos eliminados correctamente' });
    });
});

// Obtener un depósito por su ID
app.get('/deposits/:id', (req, res) => {
    const depositId = req.params.id;
    const query = `
        SELECT d.id, d.nombre, d.idUbicacion, u.nombre AS nombreUbicacion
        FROM Deposito d
        LEFT JOIN Ubicacion u ON d.idUbicacion = u.id
        WHERE d.id = ?
    `;

    db.query(query, [depositId], (err, result) => {
        if (err) {
            console.error('Error al obtener el depósito:', err);
            return res.status(500).json({ error: 'Error al obtener el depósito' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Depósito no encontrado' });
        }

        res.status(200).json(result[0]);
    });
});

// Editar un depósito por su ID
app.put('/edit-deposit/:id', (req, res) => {
    const depositId = req.params.id;
    const { nombre, idUbicacion } = req.body;

    // Validar que los campos requeridos estén completos
    if (!nombre || !idUbicacion) {
        return res.status(400).json({ error: 'Todos los campos requeridos deben estar completos' });
    }

    // Verificar si ya existe un depósito con el mismo nombre en la misma ubicación, excluyendo el depósito actual
    const checkDuplicateQuery = `
        SELECT id FROM Deposito
        WHERE nombre = ? AND idUbicacion = ? AND id != ?
    `;

    db.query(checkDuplicateQuery, [nombre, idUbicacion, depositId], (err, results) => {
        if (err) {
            console.error('Error al verificar depósito duplicado:', err);
            return res.status(500).json({ error: 'Error al verificar depósito duplicado' });
        }

        if (results.length > 0) {
            // Ya existe otro depósito con el mismo nombre en la misma ubicación
            return res.status(409).json({ error: 'Ya existe un depósito con el mismo nombre en esta ubicación' });
        }

        // Si no hay duplicados, proceder con la actualización
        const updateQuery = `
            UPDATE Deposito
            SET nombre = ?, idUbicacion = ?
            WHERE id = ?
        `;
        const values = [nombre, idUbicacion, depositId];
        db.query(updateQuery, values, (err, result) => {
            if (err) {
                console.error('Error al actualizar el depósito:', err);
                return res.status(500).json({ error: 'Error al actualizar el depósito' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Depósito no encontrado' });
            }

            res.status(200).json({ message: 'Depósito actualizado correctamente' });
        });
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

// Endpoint para agregar ubicación
app.post('/addLocation', (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: 'El Nombre es obligatorio' });
    }

    const query = 'INSERT INTO Ubicacion (nombre) VALUES (?)';
    const values = [nombre];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al insertar ubicación:', err);
            return res.status(500).json({ message: 'Error al agregar ubicación' });
        }
        res.status(200).json({ message: 'Ubicación agregada exitosamente', id: result.insertId });
    });
});

// Obtener Ubicación
app.get('/deposit-locations', (req, res) => {
    const query = `
    SELECT 
        u.id, 
        u.nombre AS nombre, 
        COUNT(d.id) AS totalDepositos
    FROM 
        Ubicacion u
    LEFT JOIN 
        Deposito d ON u.id = d.idUbicacion
    GROUP BY 
        u.id, u.nombre;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Endpoint para eliminar múltiples ubicaciones
app.delete('/delete-locations', (req, res) => {
    const { locationIds } = req.body; // Recibe los IDs de las ubicaciones a eliminar

    if (!locationIds || locationIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron ubicaciones para eliminar' });
    }

    // Construimos la consulta para eliminar múltiples IDs
    const placeholders = locationIds.map(() => '?').join(',');
    const query = `DELETE FROM ubicacion WHERE id IN (${placeholders})`;

    db.query(query, locationIds, (err, result) => {
        if (err) {
            console.error('Error eliminando ubicaciones:', err);
            return res.status(500).json({ message: 'Error eliminando ubicaciones' });
        }

        res.status(200).json({ message: 'Ubicaciones eliminadas correctamente' });
    });
});

app.get('/locations/:id', (req, res) => {
    const locationId = req.params.id;

    const query = 'SELECT id, nombre FROM Ubicacion WHERE id = ?';

    db.query(query, [locationId], (err, result) => {
        if (err) {
            console.error('Error al obtener la ubicación:', err);
            return res.status(500).json({ error: 'Error al obtener la ubicación' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Ubicación no encontrada' });
        }

        res.status(200).json(result[0]);
    });
});

app.put('/edit-location/:id', (req, res) => {
    const locationId = req.params.id;
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const query = 'UPDATE Ubicacion SET nombre = ? WHERE id = ?';
    const values = [nombre, locationId];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar la ubicación:', err);
            return res.status(500).json({ error: 'Error al actualizar la ubicación' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ubicación no encontrada' });
        }

        res.status(200).json({ message: 'Ubicación actualizada correctamente' });
    });
});


// Obtener Depósitos
app.get('/depo-names', (req, res) => {
    const query = 'SELECT id, nombre FROM Deposito';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Obtener Categorías
app.get('/categories', (req, res) => {
    const query = `
        SELECT c.id, c.descripcion, COUNT(m.id) AS material_count
        FROM Categoria c
        LEFT JOIN Material m ON c.id = m.IdCategoria
        GROUP BY c.id;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});


app.post('/addCategory', (req, res) => {
    const { descripcion } = req.body;

    if (!descripcion) {
        return res.status(400).json({ message: 'La descripción es obligatoria' });
    }

    // Verificar si la descripción ya existe (insensible a mayúsculas y minúsculas)
    const checkQuery = 'SELECT * FROM Categoria WHERE LOWER(descripcion) = LOWER(?)';
    db.query(checkQuery, [descripcion], (err, results) => {
        if (err) {
            console.error('Error al verificar categoría:', err);
            return res.status(500).json({ message: 'Error al verificar categoría' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'La categoría ya existe' });
        } else {
            const insertQuery = 'INSERT INTO Categoria (descripcion) VALUES (?)';
            db.query(insertQuery, [descripcion], (err, result) => {
                if (err) {
                    console.error('Error al insertar categoría:', err);
                    return res.status(500).json({ message: 'Error al agregar categoría' });
                }
                res.status(200).json({ message: 'Categoría agregada exitosamente', id: result.insertId });
            });
        }
    });
});


// Endpoint para eliminar categorías seleccionadas
app.delete('/delete-categories', (req, res) => {
    const { categoryIds } = req.body;

    if (!categoryIds || categoryIds.length === 0) {
        return res.status(400).json({ error: "No se han proporcionado categorías para eliminar" });
    }

    const query = 'DELETE FROM Categoria WHERE id IN (?)';
    db.query(query, [categoryIds], (err, result) => {
        if (err) {
            console.error('Error eliminando categorías:', err);
            return res.status(500).json({ error: "Error eliminando categorías" });
        }

        res.status(200).json({ message: "Categorías eliminadas correctamente" });
    });
});

// Endpoint para editar una categoría
app.put('/categories/:id', (req, res) => {
    const categoryId = req.params.id;
    const { descripcion } = req.body;

    if (!descripcion) {
        return res.status(400).json({ message: 'La descripción es obligatoria' });
    }
    // Verificar si ya existe una categoría con la misma descripción (excluyendo la actual)
    const checkQuery = 'SELECT id FROM Categoria WHERE descripcion = ? AND id != ?';
    db.query(checkQuery, [descripcion, categoryId], (err, results) => {
        if (err) {
            console.error('Error al verificar la categoría:', err);
            return res.status(500).json({ message: 'Error al verificar la categoría' });
        }
        if (results.length > 0) {
            return res.status(409).json({ message: 'Ya existe una categoría con esa descripción' });
        }
        const updateQuery = 'UPDATE Categoria SET descripcion = ? WHERE id = ?';
        db.query(updateQuery, [descripcion, categoryId], (err, result) => {
            if (err) {
                console.error('Error al actualizar la categoría:', err);
                return res.status(500).json({ message: 'Error al actualizar la categoría' });
            }
            res.status(200).json({ message: 'Categoría actualizada exitosamente' });
        });
    });
});


app.get('/total-categories', (req, res) => {
    const query = 'SELECT COUNT(id) AS total FROM Categoria';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json({ total: results[0].total });
    });
});

// Obtener Estados
app.get('/statuses', (req, res) => {
    const query = 'SELECT id, descripcion FROM Estado';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

app.get('/shelves', (req, res) => {
    const query = `
        SELECT 
        e.id, 
        e.numero, 
        e.cantidad_estante, 
        e.cantidad_division, 
        e.idPasillo, 
        e.idLado, 
        p.numero AS numeroPasillo, 
        l.descripcion AS direccionLado,
        d.nombre AS nombreDeposito,
        u.nombre AS nombreUbicacion,
        COUNT(m.id) AS totalMateriales
    FROM 
        Estanteria e
    LEFT JOIN 
        Pasillo p ON e.idPasillo = p.id
    LEFT JOIN 
        Lado l ON e.idLado = l.id
    LEFT JOIN 
        Deposito d ON p.idDeposito = d.id
    LEFT JOIN 
        Ubicacion u ON d.idUbicacion = u.id
    LEFT JOIN 
        Espacio esp ON esp.idEstanteria = e.id
    LEFT JOIN 
        Material m ON m.idEspacio = esp.id
    GROUP BY 
        e.id, e.numero, e.cantidad_estante, e.cantidad_division, 
        p.numero, l.descripcion, d.nombre, u.nombre

    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});


// Endpoint para agregar una nueva estantería
app.post('/addShelf', (req, res) => {
    const { numero, cantidad_estante, cantidad_division, idPasillo, idLado } = req.body;

    // Validación de campos obligatorios
    if (!numero || !cantidad_estante || !cantidad_division || !idPasillo || !idLado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Primero, verificar si ya existe una estantería idéntica
    const checkQuery = `
        SELECT * FROM Estanteria 
        WHERE numero = ?
    `;
    db.query(checkQuery, [numero], (err, results) => {
        if (err) {
            console.error('Error al verificar estantería:', err);
            return res.status(500).json({ error: 'Error al verificar estantería', details: err });
        }

        if (results.length > 0) {
            // La estantería ya existe
            return res.status(400).json({ error: 'Ya existe una estantería con este número' });
        } else {
            // Si no existe, proceder a insertar
            const insertQuery = `
                INSERT INTO Estanteria (numero, cantidad_estante, cantidad_division, idPasillo, idLado)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [numero, cantidad_estante, cantidad_division, idPasillo, idLado];

            db.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Error al insertar estantería:', err);
                    return res.status(500).json({ error: 'Error al agregar estantería', details: err });
                }
                res.status(200).json({ message: 'Estantería agregada exitosamente', id: result.insertId });
            });
        }
    });
});


// Obtener una estantería por ID
app.get('/shelf/:id', (req, res) => {
    const shelfId = req.params.id;
    const query = `
        SELECT Estanteria.*, Pasillo.numero AS pasilloNumero, Lado.descripcion AS ladoDescripcion
        FROM Estanteria
        LEFT JOIN Pasillo ON Estanteria.idPasillo = Pasillo.id
        JOIN Lado ON Estanteria.idLado = Lado.id
        WHERE Estanteria.id = ?
    `;
    db.query(query, [shelfId], (err, result) => {
        if (err) {
            console.error('Error fetching shelf:', err);
            return res.status(500).json({ error: 'Error al obtener la estantería' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Estantería no encontrada' });
        }
        res.status(200).json(result[0]);
    });
});

// Actualizar una estantería
app.put('/edit-shelf/:id', (req, res) => {
    const shelfId = req.params.id;
    const { numero, cantidad_estante, cantidad_division, idPasillo, idLado } = req.body;

    // Primero verificamos si ya existe una estantería con el mismo número en el mismo pasillo y lado (excluyendo la actual)
    const checkDuplicateShelfQuery = `
        SELECT id FROM Estanteria 
        WHERE numero = ? AND id != ?
    `;

    db.query(checkDuplicateShelfQuery, [numero, shelfId], (err, duplicateResults) => {
        if (err) {
            console.error('Error al verificar estantería duplicada:', err);
            return res.status(500).json({ error: 'Error al verificar estantería duplicada' });
        }

        if (duplicateResults.length > 0) {
            // Existe otra estantería con el mismo número en el mismo pasillo y lado
            return res.status(409).json({ error: 'Ya existe una estantería con este número' });
        }

        // Continuamos con el proceso existente
        // Primero obtenemos los valores actuales de la estantería
        const getCurrentShelfQuery = `
            SELECT cantidad_estante, cantidad_division 
            FROM Estanteria 
            WHERE id = ?
        `;

        db.query(getCurrentShelfQuery, [shelfId], (err, rows) => {
            if (err) {
                console.error('Error al obtener datos actuales de la estantería:', err);
                return res.status(500).json({ error: 'Error al obtener los datos de la estantería' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Estantería no encontrada' });
            }

            const currentShelf = rows[0];

            // Comparamos si los valores de cantidad_estante o cantidad_division cambian
            if (currentShelf.cantidad_estante !== cantidad_estante || currentShelf.cantidad_division !== cantidad_division) {
                // Validamos si hay materiales en los espacios de la estantería
                const checkMaterialsQuery = `
                    SELECT Material.id 
                    FROM Material 
                    INNER JOIN Espacio ON Material.idEspacio = Espacio.id 
                    WHERE Espacio.idEstanteria = ?
                `;

                db.query(checkMaterialsQuery, [shelfId], (err, materials) => {
                    if (err) {
                        console.error('Error verificando materiales:', err);
                        return res.status(500).json({ error: 'Error verificando materiales en la estantería' });
                    }

                    if (materials.length > 0) {
                        return res.status(400).json({ error: 'No se pueden modificar cantidad_estante o cantidad_division si hay materiales en los espacios de la estantería' });
                    }
                    // Si no hay materiales, procedemos con la actualización
                    updateShelf();
                });
            } else {
                // Si no cambian esos valores, procedemos directamente con la actualización
                updateShelf();
            }
        });

        function updateShelf() {
            const query = `
                UPDATE Estanteria
                SET numero = ?, cantidad_estante = ?, cantidad_division = ?, idPasillo = ?, idLado = ?
                WHERE id = ?
            `;

            const values = [numero, cantidad_estante, cantidad_division, idPasillo, idLado, shelfId];

            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error al actualizar estantería:', err);
                    return res.status(500).json({ error: 'Error al actualizar la estantería' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Estantería no encontrada' });
                }
                res.status(200).json({ message: 'Estantería actualizada correctamente' });
            });
        }
    });
});



// Endpoint para vaciar estanterías
app.post('/empty-shelves', (req, res) => {
    const { shelfIds } = req.body;

    if (!shelfIds || shelfIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron estanterías para vaciar.' });
    }

    // Consulta SQL para eliminar los espacios de las estanterías seleccionadas
    const query = 'DELETE FROM Espacio WHERE idEstanteria IN (?)';

    db.query(query, [shelfIds], (err, results) => {
        if (err) {
            console.error('Error al vaciar estanterías:', err);
            return res.status(500).json({ message: 'Error al vaciar estanterías.' });
        }

        return res.status(200).json({ message: 'Estanterías vaciadas correctamente.' });
    });
});


// Endpoint para eliminar múltiples estanterías
app.delete('/delete-shelves', (req, res) => {
    const { shelfIds } = req.body; // Recibe los IDs de las estanterías a eliminar

    if (!shelfIds || shelfIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron estanterías para eliminar' });
    }

    // Verificamos si hay materiales en los espacios de las estanterías seleccionadas
    const checkMaterialsQuery = `
        SELECT Material.id 
        FROM Material 
        INNER JOIN Espacio ON Material.idEspacio = Espacio.id 
        WHERE Espacio.idEstanteria IN (${shelfIds.map(() => '?').join(',')})
    `;

    db.query(checkMaterialsQuery, shelfIds, (err, materials) => {
        if (err) {
            console.error('Error verificando materiales:', err);
            return res.status(500).json({ message: 'Error verificando materiales en las estanterías' });
        }

        if (materials.length > 0) {
            // Si hay materiales en los espacios de alguna estantería, no permitimos la eliminación
            return res.status(400).json({ message: 'No se pueden eliminar estanterías con materiales asignados' });
        }

        // Si no hay materiales, construimos la consulta para eliminar las estanterías
        const deleteQuery = `DELETE FROM estanteria WHERE id IN (${shelfIds.map(() => '?').join(',')})`;

        db.query(deleteQuery, shelfIds, (err, result) => {
            if (err) {
                console.error('Error eliminando estanterías:', err);
                return res.status(500).json({ message: 'Error: Debe vaciar la estantería antes de eliminarla' });
            }

            res.status(200).json({ message: 'Estanterías eliminadas correctamente' });
        });
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


// Endpoint para obtener los lados asociados a un pasillo
app.get('/sides/:aisleId', (req, res) => {
    const { aisleId } = req.params;

    const query = `
        SELECT l.id, l.descripcion
        FROM Lado l
        JOIN Pasillo p ON (p.idLado1 = l.id OR p.idLado2 = l.id)
        WHERE p.id = ?
    `;

    db.query(query, [aisleId], (err, results) => {
        if (err) {
            console.error('Error al obtener los lados asociados al pasillo:', err);
            return res.status(500).json({ mensaje: 'Error al obtener los lados' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron lados para este pasillo' });
        }

        res.status(200).json(results);
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

// Endpoint para obtener la cantidad total de estanterías
app.get('/total-estanterias', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM Estanteria';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results[0]);
    });
});

// Endpoint para obtener el último material ingresado, basado en la fecha del último estado
app.get('/last-material', (req, res) => {
    const query = 'SELECT nombre, fechaUltimoEstado FROM Material ORDER BY fechaUltimoEstado DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error al consultar la base de datos');
        }

        if (results.length === 0) {
            return res.json({ message: 'No se encontró ningún material', material: null });
        }

        res.json({ nombre: results[0].nombre });
    });
});


app.get('/movements', (req, res) => {
    const query = `
        SELECT 
            m.id,
            numero, 
            m.fechaMovimiento, 
            u.nombre AS Usuario,
            mat.nombre AS nombreMaterial,
            m.cantidad, 
            d1.nombre AS depositoOrigen, 
            d2.nombre AS depositoDestino,
            ub.nombre AS ubicacionNombre
        FROM 
            movimiento m
        LEFT JOIN 
            usuario u ON m.idUsuario = u.id
        LEFT JOIN 
            deposito d1 ON m.idDepositoOrigen = d1.id
        LEFT JOIN 
            deposito d2 ON m.idDepositoDestino = d2.id
            LEFT JOIN 
            Ubicacion ub ON d2.idUbicacion = ub.id
        LEFT JOIN 
            Material mat ON m.idMaterial = mat.id
        ORDER BY
            m.fechaMovimiento DESC;
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
    let { idMaterial, idUsuario, idDepositoDestino, cantidadMovida, numero, fechaMovimiento } = req.body;
    fechaMovimiento = new Date(fechaMovimiento);
    fechaMovimiento.setMinutes(fechaMovimiento.getMinutes() + fechaMovimiento.getTimezoneOffset()); // Ajustar a UTC
    fechaMovimiento = fechaMovimiento.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

    const queryMaterialOrigen = `
        SELECT id, cantidad, matricula, fechaUltimoEstado, bajoStock, idEstado, idEspacio, ultimoUsuarioId, idCategoria, nombre, ocupado, idDeposito 
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
        const { cantidad, matricula, fechaUltimoEstado, bajoStock, idEstado, idEspacio, ultimoUsuarioId, idCategoria, nombre, ocupado } = materialOrigen;
        const idDepositoOrigen = materialOrigen.idDeposito;

        const cantidadMovidaNumero = Number(cantidadMovida);
        const cantidadNumero = Number(cantidad);

        if (cantidadMovidaNumero > cantidadNumero) {
            res.status(400).json({ error: 'Cantidad insuficiente en el depósito de origen' });
            return;
        }

        const nuevaCantidadOrigen = cantidadNumero - cantidadMovidaNumero;
        const nuevoEstadoOrigen = assignStatus(nuevaCantidadOrigen, bajoStock);

        const updateMaterialOrigenQuery = `
            UPDATE Material 
            SET cantidad = ?, idEstado = ? 
            WHERE id = ?
        `;

        db.query(updateMaterialOrigenQuery, [nuevaCantidadOrigen, nuevoEstadoOrigen, idMaterial], (err) => {
            if (err) {
                console.error('Error al actualizar el material en el depósito de origen:', err);
                res.status(500).json({ error: 'Error al actualizar el material en el depósito de origen' });
                return;
            }

            handleStockNotifications(nombre, nuevaCantidadOrigen, bajoStock, (error) => {
                if (error) {
                    console.error('Error al manejar notificaciones de stock en origen:', error);
                    res.status(500).json({ error: 'Error al manejar notificaciones de stock en origen' });
                    return;
                }

                const queryMaterialDestino = 'SELECT id, cantidad FROM Material WHERE nombre = ? AND idDeposito = ?';

                db.query(queryMaterialDestino, [nombre, idDepositoDestino], (err, materialDestinoResult) => {
                    if (err) {
                        console.error('Error al verificar el material en el depósito de destino:', err);
                        res.status(500).json({ error: 'Error al verificar el material en el depósito de destino' });
                        return;
                    }

                    const insertMovementAndAudit = (idMaterialMovimiento) => {
                        const insertMovementQuery = `
                            INSERT INTO movimiento (idUsuario, idMaterial, cantidad, idDepositoOrigen, idDepositoDestino, fechaMovimiento, confirmado, numero) 
                            VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)
                        `;

                        db.query(insertMovementQuery, [idUsuario, idMaterialMovimiento, cantidadMovida, idDepositoOrigen, idDepositoDestino, fechaMovimiento, numero], (err) => {
                            if (err) {
                                if (err.code === 'ER_DUP_ENTRY') {
                                    return res.status(400).json({ error: 'Ya existe un movimiento con el número de movimiento ingresado' });
                                } else {
                                    console.error('Error al agregar el movimiento:', err);
                                    res.status(500).json({ error: 'Error al agregar el movimiento' });
                                    return;
                                }
                            }
                            // Registrar la confirmación del movimiento en la tabla de auditoría
                            const comentario = `Movimiento confirmado con número: ${numero}`;
                            db.query('INSERT INTO Auditoria (id_usuario, tipo_accion, comentario) VALUES (?, ?, ?)',
                                [idUsuario, 'Confirmación de Movimiento', comentario], (err) => {
                                    if (err) {
                                        console.error('Error al registrar en auditoría:', err);
                                        res.status(500).json({ error: 'Error al registrar en auditoría' });
                                        return;
                                    }
                                    res.status(200).json({ message: 'Movimiento registrado y material actualizado correctamente, auditoría registrada' });
                                });
                        });
                    };

                    if (materialDestinoResult.length > 0) {
                        const { id: idMaterialDestino, cantidad: cantidadDestino } = materialDestinoResult[0];
                        const nuevaCantidadDestino = Number(cantidadDestino) + cantidadMovidaNumero;
                        const nuevoEstadoDestino = assignStatus(nuevaCantidadDestino, bajoStock);

                        const updateMaterialDestinoQuery = `
                            UPDATE Material 
                            SET cantidad = ?, idEstado = ? 
                            WHERE id = ?
                        `;

                        db.query(updateMaterialDestinoQuery, [nuevaCantidadDestino, nuevoEstadoDestino, idMaterialDestino], (err) => {
                            if (err) {
                                console.error('Error al actualizar el material en el depósito de destino:', err);
                                res.status(500).json({ error: 'Error al actualizar el material en el depósito de destino' });
                                return;
                            }

                            handleStockNotifications(nombre, nuevaCantidadDestino, bajoStock, (error) => {
                                if (error) {
                                    console.error('Error al manejar notificaciones de stock en destino:', error);
                                    res.status(500).json({ error: 'Error al manejar notificaciones de stock en destino' });
                                    return;
                                }

                                insertMovementAndAudit(idMaterialDestino);
                            });
                        });

                    } else {
                        const nuevoEstadoDestino = assignStatus(cantidadMovidaNumero, bajoStock);

                        const insertMaterialDestinoQuery = `
                            INSERT INTO Material (
                                cantidad, matricula, fechaUltimoEstado, bajoStock, idEstado, idEspacio, 
                                ultimoUsuarioId, idCategoria, idDeposito, nombre, ocupado, fechaAlta
                            ) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                        `;

                        const valoresInsertMaterial = [
                            cantidadMovidaNumero, matricula, fechaUltimoEstado, bajoStock,
                            nuevoEstadoDestino, null, ultimoUsuarioId, idCategoria, idDepositoDestino, nombre, ocupado
                        ];

                        db.query(insertMaterialDestinoQuery, valoresInsertMaterial, (err, result) => {
                            if (err) {
                                console.error('Error al crear el material en el depósito de destino:', err);
                                res.status(500).json({ error: 'Error al crear el material en el depósito de destino' });
                                return;
                            }

                            const idMaterialDestino = result.insertId;

                            notifyNewMaterialCreation(nombre, idDepositoDestino, (error) => {
                                if (error) {
                                    console.error('Error al notificar la creación de nuevo material:', error);
                                    res.status(500).json({ error: 'Error al notificar la creación de nuevo material' });
                                    return;
                                }

                                handleStockNotifications(nombre, cantidadMovidaNumero, bajoStock, (error) => {
                                    if (error) {
                                        console.error('Error al manejar notificaciones de stock en destino:', error);
                                        res.status(500).json({ error: 'Error al manejar notificaciones de stock en destino' });
                                        return;
                                    }
                                    insertMovementAndAudit(idMaterialDestino);
                                });
                            });
                        });
                    }
                });
            });
        });
    });
});



app.get('/movements/:id', async (req, res) => {
    const movementId = req.params.id;
    const query = `
        SELECT 
            m.*, 
            d1.nombre AS depositoOrigenNombre, 
            d2.nombre AS depositoDestinoNombre,
            mat.nombre AS nombreMaterial
        FROM 
            movimiento m
        LEFT JOIN 
            deposito d1 ON m.idDepositoOrigen = d1.id
        LEFT JOIN 
            deposito d2 ON m.idDepositoDestino = d2.id
        LEFT JOIN 
            Material mat ON m.idMaterial = mat.id
        WHERE 
            m.id = ?`;

    db.query(query, [movementId], (err, results) => {
        if (err) {
            console.error('Error al obtener el movimiento:', err);
            res.status(500).json({ error: 'Error al obtener el movimiento' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Movimiento no encontrado' });
            return;
        }
        res.json(results[0]);
    });
});

app.put('/edit-movements/:id', async (req, res) => {
    const id = req.params.id;
    const { fechaMovimiento, idMaterial, idUsuario, idDepositoOrigen, idDepositoDestino, cantidad, numero } = req.body;

    const cantidadNueva = Number(cantidad);  // La nueva cantidad movida

    try {
        // Iniciar la transacción
        await db.beginTransaction();

        // Verificar si ya existe otro movimiento con el mismo número, excluyendo el actual
        const checkNumeroQuery = `
        SELECT id FROM movimiento 
        WHERE numero = ? AND id != ?
        `;
        const numeroResults = await new Promise((resolve, reject) => {
            db.query(checkNumeroQuery, [numero, id], (err, results) => {
                if (err) {
                    console.error('Error al verificar número duplicado:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (numeroResults.length > 0) {
            await new Promise((resolve, reject) => {
                db.rollback((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            return res.status(409).json({ error: 'Ya existe un movimiento con el mismo número' });
        }

        // Obtener el movimiento actual para comparar los cambios
        const queryMovimientoActual = `
            SELECT idDepositoOrigen, idDepositoDestino, cantidad
            FROM movimiento 
            WHERE id = ?
        `;

        // Ejecutar la consulta con promesa
        const resultMovimientoActual = await new Promise((resolve, reject) => {
            db.query(queryMovimientoActual, [id], (err, result) => {
                if (err) {
                    console.error('Error en la consulta del movimiento actual:', err);  // Mostrar error si hay un fallo en la consulta
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        // Verificar si el resultado está vacío
        if (!resultMovimientoActual || resultMovimientoActual.length === 0) {
            await db.rollback();
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }

        const movimientoActual = resultMovimientoActual[0];
        const { idDepositoOrigen: depositoOrigenAnterior, idDepositoDestino: depositoDestinoAnterior, cantidad: cantidadAnterior } = movimientoActual;
        const cantidadAnteriorMovida = Number(cantidadAnterior);

        // Calcular la diferencia entre la cantidad nueva y la cantidad anterior
        const diferenciaCantidad = cantidadNueva - cantidadAnteriorMovida;

        // Si cambió la cantidad movida o cambió el depósito de origen o destino, ajustamos los materiales correspondientes
        if (diferenciaCantidad !== 0 || depositoOrigenAnterior !== idDepositoOrigen || depositoDestinoAnterior !== idDepositoDestino) {
            // 1. Actualizar el depósito de origen (aplicar la diferencia de cantidad si hubo un cambio en la cantidad)
            if (depositoOrigenAnterior === idDepositoOrigen && diferenciaCantidad !== 0) {
                const queryUpdateOrigen = `
                    UPDATE Material 
                    SET cantidad = cantidad - ? 
                    WHERE id = ? AND idDeposito = ?
                `;
                await db.query(queryUpdateOrigen, [diferenciaCantidad, idMaterial, idDepositoOrigen]);
            }

            // Si cambió el depósito de origen, revertimos el impacto anterior en el depósito antiguo y aplicamos en el nuevo
            if (depositoOrigenAnterior !== idDepositoOrigen) {
                // Revertir la cantidad en el depósito anterior
                const queryRevertirOrigenAnterior = `
                    UPDATE Material 
                    SET cantidad = cantidad + ? 
                    WHERE id = ? AND idDeposito = ?
                `;
                await db.query(queryRevertirOrigenAnterior, [cantidadAnteriorMovida, idMaterial, depositoOrigenAnterior]);

                // Aplicar la nueva cantidad en el nuevo depósito de origen
                const queryUpdateNuevoOrigen = `
                    UPDATE Material 
                    SET cantidad = cantidad - ? 
                    WHERE id = ? AND idDeposito = ?
                `;
                await db.query(queryUpdateNuevoOrigen, [cantidadNueva, idMaterial, idDepositoOrigen]);
            }

            // 2. Actualizar el depósito de destino (aplicar la diferencia de cantidad si hubo un cambio en la cantidad)
            if (depositoDestinoAnterior === idDepositoDestino && diferenciaCantidad !== 0) {
                const queryUpdateDestino = `
                    UPDATE Material 
                    SET cantidad = cantidad + ? 
                    WHERE id = ? AND idDeposito = ?
                `;
                await db.query(queryUpdateDestino, [diferenciaCantidad, idMaterial, idDepositoDestino]);
            }

            // Si cambió el depósito de destino, revertimos el impacto anterior en el depósito antiguo y aplicamos en el nuevo
            if (depositoDestinoAnterior !== idDepositoDestino) {
                // Revertir la cantidad en el depósito anterior
                const queryRevertirDestinoAnterior = `
                    UPDATE Material 
                    SET cantidad = cantidad - ? 
                    WHERE id = ? AND idDeposito = ?
                `;
                await db.query(queryRevertirDestinoAnterior, [cantidadAnteriorMovida, idMaterial, depositoDestinoAnterior]);

                // Aplicar la nueva cantidad en el nuevo depósito de destino
                const queryUpdateNuevoDestino = `
                    UPDATE Material 
                    SET cantidad = cantidad + ? 
                    WHERE id = ? AND idDeposito = ?
                `;
                await db.query(queryUpdateNuevoDestino, [cantidadNueva, idMaterial, idDepositoDestino]);
            }
        }

        // Finalmente, actualizamos el movimiento
        const queryUpdateMovimiento = `
            UPDATE movimiento 
            SET numero = ?, fechaMovimiento = ?, idMaterial = ?, idUsuario = ?, idDepositoOrigen = ?, idDepositoDestino = ?, cantidad = ?
            WHERE id = ?
        `;
        await db.query(queryUpdateMovimiento, [numero, fechaMovimiento, idMaterial, idUsuario, idDepositoOrigen, idDepositoDestino, cantidadNueva, id]);

        // Registrar la acción de edición en la tabla de auditoría
        const comentario = `Movimiento editado con número: ${numero}`;
        await db.query(
            'INSERT INTO Auditoria (id_usuario, tipo_accion, comentario) VALUES (?, ?, ?)',
            [idUsuario, 'Edición de Movimiento', comentario]
        );

        // Confirmar la transacción
        await db.commit();

        res.json({ message: 'Movimiento y materiales actualizados correctamente' });

    } catch (error) {
        // Si ocurre un error, revertir la transacción
        await db.rollback();
        console.error('Error al actualizar el movimiento:', error);
        res.status(500).json({ error: 'Error al actualizar el movimiento' });
    }
});

// Endpoint para eliminar múltiples movimientos
app.delete('/delete-movements', (req, res) => {
    const { movementIds } = req.body; // Recibe los IDs de los movimientos a eliminar

    if (!movementIds || movementIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron movimientos para eliminar' });
    }

    const placeholders = movementIds.map(() => '?').join(',');
    const query = `DELETE FROM movimiento WHERE id IN (${placeholders})`;

    db.query(query, movementIds, (err, result) => {
        if (err) {
            console.error('Error eliminando movimientos:', err);
            return res.status(500).json({ message: 'Error eliminando movimientos' });
        }

        res.status(200).json({ message: 'Movimientos eliminados correctamente' });
    });
});

app.get('/materials-with-movements', (req, res) => {
    const query = `
        SELECT DISTINCT m.id AS idMaterial, m.nombre AS nombreMaterial, d2.nombre AS depositoNombre, u.nombre AS ubicacionNombre
        FROM Movimiento mo
        JOIN Material m ON mo.idMaterial = m.id
        JOIN Deposito d2 ON m.idDeposito = d2.id
        JOIN Ubicacion u ON d2.idUbicacion = u.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener materiales con movimientos:', err);
            return res.status(500).json({ mensaje: 'Error al obtener materiales con movimientos' });
        }

        // Respondemos con los idMaterial y nombres
        res.status(200).json({ materiales: results });
    });
});

app.get('/last-moved-material', (req, res) => {
    const query = `
        SELECT 
            m.idMaterial AS materialId, 
            mat.nombre AS materialNombre,
            MAX(m.fechaMovimiento) AS ultimaFecha
        FROM Movimiento m

        LEFT JOIN Material mat ON m.idMaterial = mat.id
        WHERE m.confirmado = TRUE
        GROUP BY m.idMaterial
        ORDER BY ultimaFecha DESC

        LIMIT 1;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener el último material movido:', err);
            return res.status(500).json({ error: 'Error al obtener el último material movido' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No existen movimientos de material registrados' });
        }

        res.json(results[0]);
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

// Endpoint para obtener los informes generados
app.get('/reports', (req, res) => {
    const query = `
        SELECT 
            i.id, 
            i.fechaGeneracion, 
            u.nombre AS Usuario, 
            i.tipo,
            i.tipoGrafico,
            m.nombre AS nombreMaterial,
            d.nombre AS nombreDeposito
        FROM 
            Informe i
        LEFT JOIN 
            Usuario u ON i.idUsuario = u.id
        LEFT JOIN 
            Material m ON i.idMaterial = m.id
        LEFT JOIN 
            Deposito d ON i.idDeposito = d.id
        ORDER BY 
            i.fechaGeneracion DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los informes:', err);
            if (!res.headersSent) { // Verifica si ya se envió una respuesta
                return res.status(500).json({ error: 'Error al obtener los informes' });
            }
            return;
        }
        if (!res.headersSent) { // Verifica si ya se envió una respuesta
            res.json(results);
        }
    });
});


// Endpoint para agregar un informe
app.post('/addReport', (req, res) => {
    // Obtener el token del encabezado de autorización
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'No se proporcionó el token de autenticación' });
    }

    // Verificar el token y extraer el idUsuario
    let idUsuario;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        idUsuario = decoded.id;
    } catch (error) {
        return res.status(401).json({ mensaje: 'Vuelva a iniciar sesión' });
    }

    const { tipo, fechaInicio, fechaFin, deposito, estadoMaterial, idMaterial, tipoGrafico, idSalida, idMovimiento, idDetalleSalida } = req.body;

    if (!tipo) {
        return res.status(400).json({ mensaje: 'Campos obligatorios faltantes' });
    }

    const insertQuery = `
        INSERT INTO Informe (tipo, tipoGrafico, fechaGeneracion, idUsuario, idMaterial, idDeposito, idEstado, idMovimiento, idSalida, idDetalleSalida, fechaInicio, fechaFin) 
        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const formatDateForDB = (date) => {
        if (!date) return null;
        const dateObj = new Date(date);
        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formattedFechaInicio = formatDateForDB(fechaInicio);
    const formattedFechaFin = formatDateForDB(fechaFin);

    const insertValues = [
        tipo,
        tipoGrafico,
        idUsuario,
        idMaterial || null,
        deposito || null,
        estadoMaterial || null,
        tipo === 'Informe de material por movimiento entre deposito' ? idMovimiento || null : null,
        tipo === 'Informe de salida de material' ? idSalida || null : null,
        tipo === 'Informe de salida de material' ? idDetalleSalida || null : null,
        formattedFechaInicio,
        formattedFechaFin
    ];

    db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
            console.error('Error al insertar informe:', err);
            return res.status(500).json({ mensaje: 'Error al insertar informe' });
        }

        const informeId = result.insertId;
        let reportQuery = '';
        let reportParams = [];

        // Generar la consulta y parámetros según el tipo de informe
        switch (tipo) {
            case 'Informe de inventario general':
                reportQuery = `
                    SELECT 
                        GROUP_CONCAT(m.nombre SEPARATOR ', ') AS nombre_material, 
                        GROUP_CONCAT(m.cantidad SEPARATOR ', ') AS cantidad, 
                        GROUP_CONCAT(c.descripcion SEPARATOR ', ') AS categoria, 
                        GROUP_CONCAT(d.nombre SEPARATOR ', ') AS nombre_deposito,
                        GROUP_CONCAT(es.descripcion SEPARATOR ', ') AS estado_material
                    FROM 
                        Material m
                    LEFT JOIN 
                        Categoria c ON m.idCategoria = c.id
                    LEFT JOIN 
                        Deposito d ON m.idDeposito = d.id
                    LEFT JOIN 
                        Estado es ON m.idEstado = es.id
                `;
                break;

            case 'Informe de material por estado':
                reportQuery = `
                    SELECT 
                        GROUP_CONCAT(m.nombre SEPARATOR ', ') AS nombre_material, 
                        GROUP_CONCAT(m.cantidad SEPARATOR ', ') AS cantidad, 
                        GROUP_CONCAT(c.descripcion SEPARATOR ', ') AS categoria, 
                        GROUP_CONCAT(d.nombre SEPARATOR ', ') AS nombre_deposito,
                        GROUP_CONCAT(es.descripcion SEPARATOR ', ') AS estado_material
                    FROM 
                        Material m
                    LEFT JOIN 
                        Categoria c ON m.idCategoria = c.id
                    LEFT JOIN 
                        Deposito d ON m.idDeposito = d.id
                    LEFT JOIN 
                        Estado es ON m.idEstado = es.id
                    WHERE 
                        m.idEstado = ?
                `;
                reportParams.push(estadoMaterial);
                break;

            case 'Informe de material por deposito':
                if (!deposito) {
                    return res.status(400).json({ mensaje: 'Debe especificar el depósito' });
                }
                reportQuery = `
                    SELECT 
                        GROUP_CONCAT(m.nombre SEPARATOR ', ') AS nombre_material, 
                        GROUP_CONCAT(m.cantidad SEPARATOR ', ') AS cantidad, 
                        GROUP_CONCAT(c.descripcion SEPARATOR ', ') AS categoria, 
                        GROUP_CONCAT(d.nombre SEPARATOR ', ') AS nombre_deposito,
                        GROUP_CONCAT(es.descripcion SEPARATOR ', ') AS estado_material
                    FROM 
                        Material m
                    LEFT JOIN 
                        Categoria c ON m.idCategoria = c.id
                    LEFT JOIN 
                        Deposito d ON m.idDeposito = d.id
                    LEFT JOIN 
                        Estado es ON m.idEstado = es.id
                    WHERE 
                        d.id = ?
                `;
                reportParams.push(deposito);
                break;

            case 'Informe de material por movimiento entre deposito':
                if (!fechaInicio || !fechaFin || !idMaterial) {
                    return res.status(400).json({ mensaje: 'Debe especificar el rango de fechas y el material' });
                }
                reportQuery = `
                    SELECT 
                        GROUP_CONCAT(mo.fechaMovimiento SEPARATOR ', ') AS fecha_movimiento, 
                        GROUP_CONCAT(mo.cantidad SEPARATOR ', ') AS cantidad_movimiento, 
                        GROUP_CONCAT(m.nombre SEPARATOR ', ') AS nombre_material,  
                        GROUP_CONCAT(d1.nombre SEPARATOR ', ') AS deposito_origen, 
                        GROUP_CONCAT(d2.nombre SEPARATOR ', ') AS deposito_destino
                    FROM 
                        Movimiento mo
                    LEFT JOIN 
                        Material m ON mo.idMaterial = m.id  
                    LEFT JOIN 
                        Deposito d1 ON mo.idDepositoOrigen = d1.id
                    LEFT JOIN 
                        Deposito d2 ON mo.idDepositoDestino = d2.id
                    WHERE 
                        mo.fechaMovimiento BETWEEN ? AND ?
                        AND mo.idMaterial = ?
                `;
                reportParams.push(formattedFechaInicio, formattedFechaFin, idMaterial);
                break;

            case 'Informe de salida de material':
                if (!fechaInicio || !fechaFin || !idMaterial) {
                    return res.status(400).json({ mensaje: 'Debe especificar el rango de fechas y el material' });
                }
                reportQuery = `
                    SELECT 
                        GROUP_CONCAT(sm.fecha SEPARATOR ', ') AS fecha_salida, 
                        GROUP_CONCAT(sm.motivo SEPARATOR ', ') AS motivo_salida, 
                        GROUP_CONCAT(dsm.cantidad SEPARATOR ', ') AS cantidad, 
                        GROUP_CONCAT(m.nombre SEPARATOR ', ') AS nombre_material
                    FROM 
                        salida_material sm
                    JOIN 
                        detalle_salida_material dsm ON sm.id = dsm.idSalida
                    JOIN 
                        Material m ON dsm.idMaterial = m.id
                    WHERE 
                        sm.fecha BETWEEN ? AND ?
                        AND dsm.idMaterial = ?
                `;
                reportParams.push(formattedFechaInicio, formattedFechaFin, idMaterial);
                break;

            default:
                return res.status(400).json({ mensaje: 'Tipo de informe no válido' });
        }

        // Ejecutar la consulta de detalles para el tipo de informe y almacenarlos en detalle_informe
        db.query(reportQuery, reportParams, (err, reportResult) => {
            if (err) {
                console.error('Error al generar el informe:', err);
                return res.status(500).json({ mensaje: 'Error al generar el informe' });
            }

            const detail = reportResult[0];
            const detailInsertValues = [
                informeId,
                detail.nombre_material || null,
                detail.cantidad || detail.cantidad_movimiento || null,
                detail.categoria || null,
                detail.estado_material || null,
                detail.nombre_deposito || null,
                detail.deposito_origen || null,
                detail.deposito_destino || null,
                detail.fecha_movimiento || null,
                detail.cantidad_movimiento || null,
                detail.fecha_salida || null,
                detail.motivo_salida || null
            ];

            const detailInsertQuery = `
                INSERT INTO detalle_informe 
                (informe_id, nombre_material, cantidad, categoria, estado_material, nombre_deposito, 
                deposito_origen, deposito_destino, fecha_movimiento, cantidad_movimiento, fecha_salida, motivo_salida) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Insertar los detalles en detalle_informe
            db.query(detailInsertQuery, detailInsertValues, (err) => {
                if (err) {
                    console.error('Error al insertar detalles del informe:', err);
                    return res.status(500).json({ mensaje: 'Error al insertar detalles del informe' });
                }

                res.status(200).json({
                    mensaje: 'Informe y detalles generados con éxito',
                    informeId: informeId,
                });
            });
        });
    });
});

// Endpoint para obtener los detalles de un informe específico
app.get('/reports/:id', (req, res) => {
    const reportId = req.params.id;

    // Consulta principal para obtener los datos del informe desde la tabla Informe
    const reportQuery = `
        SELECT 
            id, tipo, fechaGeneracion, idUsuario, idMaterial, idDeposito, 
            tipoGrafico, fechaInicio, fechaFin, idEstado, idMovimiento, idSalida, idDetalleSalida 
        FROM Informe 
        WHERE id = ?;
    `;

    db.query(reportQuery, [reportId], (err, reportResults) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al consultar la base de datos');
        }
        if (reportResults.length === 0) {
            return res.status(404).send('Informe no encontrado');
        }

        // Asignar los datos principales del informe
        const report = reportResults[0];

        // Consulta para obtener los detalles del informe desde detalle_informe
        const detailQuery = `
            SELECT 
                nombre_material, 
                cantidad, 
                categoria, 
                estado_material, 
                nombre_deposito, 
                deposito_origen, 
                deposito_destino, 
                fecha_movimiento, 
                cantidad_movimiento, 
                fecha_salida, 
                motivo_salida
            FROM detalle_informe 
            WHERE informe_id = ?;
        `;

        db.query(detailQuery, [reportId], (err, detailResults) => {
            if (err) {
                console.error('Error al obtener los detalles del informe:', err);
                return res.status(500).send('Error al obtener los detalles del informe');
            }

            // Si se encuentran detalles, asignarlos al informe
            if (detailResults.length > 0) {
                const detail = detailResults[0]; // Debe ser un único registro con valores concatenados
                report.detalles = {
                    nombre_material: detail.nombre_material || 'N/A',
                    cantidad: detail.cantidad || 'N/A',
                    categoria: detail.categoria || 'N/A',
                    estado_material: detail.estado_material || 'N/A',
                    nombre_deposito: detail.nombre_deposito || 'N/A',
                    deposito_origen: detail.deposito_origen || 'N/A',
                    deposito_destino: detail.deposito_destino || 'N/A',
                    fecha_movimiento: detail.fecha_movimiento || 'N/A',
                    cantidad_movimiento: detail.cantidad_movimiento || 'N/A',
                    fecha_salida: detail.fecha_salida || 'N/A',
                    motivo_salida: detail.motivo_salida || 'N/A'
                };
            } else {
                report.detalles = {}; // Si no hay detalles, asignar un objeto vacío
            }

            return res.json(report);
        });
    });
});



// Endpoint para eliminar informes seleccionados
app.delete('/delete-reports', (req, res) => {
    const { reportIds } = req.body;

    if (!reportIds || reportIds.length === 0) {
        return res.status(400).json({ error: "No se han proporcionado informes para eliminar" });
    }

    const query = 'DELETE FROM Informe WHERE id IN (?)';
    db.query(query, [reportIds], (err, result) => {
        if (err) {
            console.error('Error eliminando informes:', err);
            return res.status(500).json({ error: "Error eliminando informes" });
        }

        res.status(200).json({ message: "Informes eliminados correctamente" });
    });
});



// Endpoint para obtener la cantidad total de informes
app.get('/total-reports', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM Informe';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results[0]);
    });
});

// Endpoint para obtener registros de auditoría
app.get('/audits', (req, res) => {
    const query = `
        SELECT Auditoria.id, Auditoria.fecha, Usuario.nombre AS nombre_usuario, Auditoria.tipo_accion, Auditoria.comentario
        FROM Auditoria
        JOIN Usuario ON Auditoria.id_usuario = Usuario.id
        ORDER BY Auditoria.fecha DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener registros de auditoría:', err);
            return res.status(500).json({ error: 'Error al obtener registros de auditoría' });
        }
        res.status(200).json(results);
    });
});

app.delete('/delete-audits', (req, res) => {
    const { auditIds } = req.body;

    // Verificar que se envíen IDs de auditoría
    if (!auditIds || auditIds.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron auditorías para eliminar' });
    }

    // Convertir los IDs en una lista de placeholders para la consulta
    const placeholders = auditIds.map(() => '?').join(',');

    // Consulta para eliminar múltiples registros de auditoría
    const deleteQuery = `DELETE FROM Auditoria WHERE id IN (${placeholders})`;

    db.query(deleteQuery, auditIds, (err, result) => {
        if (err) {
            console.error('Error al eliminar auditorías:', err);
            return res.status(500).json({ error: 'Error al eliminar auditorías' });
        }

        res.status(200).json({ message: 'Auditorías eliminadas correctamente' });
    });
});

app.get('/total-audits', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM Auditoria';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results[0]);
    });
});

app.get('/api/notifications/:userId', (req, res) => {
    const { userId } = req.params;
    db.query(
        `SELECT n.id, n.descripcion, n.fecha, un.visto
            FROM notificacion n
            JOIN usuario_notificacion un ON n.id = un.idNotificacion
            WHERE un.idUsuario = ?
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
        WHERE idUsuario = ? AND idNotificacion IN (?)
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

// Endpoint para obtener pasillos por depósito
app.get('/aisles/:idDeposito', (req, res) => {
    const idDeposito = req.params.idDeposito;

    const query = 'SELECT id, numero FROM Pasillo WHERE idDeposito = ?';
    db.query(query, [idDeposito], (err, results) => {
        if (err) {
            console.error('Error al obtener los pasillos:', err);
            return res.status(500).json({ error: 'Error al obtener los pasillos' });
        }
        res.json(results);
    });
});

// Endpoint para obtener estanterías por pasillo
app.get('/shelves/:idPasillo', (req, res) => {
    const idPasillo = req.params.idPasillo;

    const query = 'SELECT id, numero FROM Estanteria WHERE idPasillo = ?';
    db.query(query, [idPasillo], (err, results) => {
        if (err) {
            console.error('Error al obtener las estanterías:', err);
            return res.status(500).json({ error: 'Error al obtener las estanterías' });
        }
        res.json(results);
    });
});


app.listen(8081, () => {
    console.log(`Servidor corriendo en el puerto 8081`);
});
