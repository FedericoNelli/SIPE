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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sipe'
});
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
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
app.put('/materiales/:id', upload.single('imagen'), (req, res) => {
    const id = req.params.id;
    const { nombre, cantidad, matricula, fechaUltimoEstado, bajoStock, idCategoria, idDeposito, idEspacio, eliminarImagen } = req.body;
    const nuevaImagen = req.file ? '/uploads/' + req.file.filename : null;
    let { idEstado } = req.body;
    let idEstadoComp = idEstado;

    idEstado = assignStatus(cantidad, bajoStock);

    // Primero, obtener la imagen existente si existe
    db.query('SELECT imagen FROM Material WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener la imagen actual del material:', err);
            return res.status(500).json({ error: 'Error al obtener la imagen actual del material' });
        }

        const imagenActual = results.length > 0 ? results[0].imagen : null;

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
                        return res.status(500).json({ mensaje: 'Error al manejar notificaciones de stock' });
                    }
                    res.status(200).json({ mensaje: 'Material actualizado con éxito' });
                });
            } else {
                res.status(200).json({ mensaje: 'Material actualizado con éxito' });
            };
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
        ex.id AS salidaId,
        ex.cantidad,
        m.nombre AS materialNombre,
        DATE_FORMAT(ex.fecha, '%d-%m-%Y %H:%i:%s') AS fechaSalida,
        d.nombre AS depositoNombre,
        u.nombre AS ubicacionNombre -- Asumimos que el campo 'nombre' es el nombre de la ubicación
    FROM 
        salida_material ex
    JOIN 
        Material m ON ex.idMaterial = m.id
    LEFT JOIN 
        Deposito d ON m.idDeposito = d.id
    LEFT JOIN 
        Ubicacion u ON d.idUbicacion = u.id -- Asumimos que 'idUbicacion' es la FK de la tabla Deposito
    ORDER BY 
        ex.fecha DESC;
`;



    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching material exits:', error);
            return res.status(500).json({ error: 'Error al obtener las salidas de materiales' });
        }

        // En vez de retornar un 404, devolvemos un array vacío o un mensaje indicando que no hay registros
        if (results.length === 0) {
            return res.status(200).json({ message: 'No hay registros de salidas de materiales', data: [] });
        }

        res.status(200).json(results);
    });
});


// Endpoint POST para registrar la salida de un material
app.post('/materiales/salidas', async (req, res) => {
    const { idMaterial, cantidad, motivo, fecha } = req.body;

    try {
        // Verificar que el material existe y obtener la cantidad disponible
        const result = await new Promise((resolve, reject) => {
            db.query('SELECT cantidad FROM Material WHERE id = ?', [idMaterial], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Material no encontrado' });
        }

        const material = result[0];

        if (material.cantidad < cantidad) {
            return res.status(400).json({ message: 'La cantidad de salida no puede ser mayor a la cantidad disponible' });
        }

        // Registrar la salida del material
        await new Promise((resolve, reject) => {
            db.query('INSERT INTO salida_material (idMaterial, cantidad, motivo, fecha) VALUES (?, ?, ?, ?)',
                [idMaterial, cantidad, motivo, fecha], (err) => {
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

        return res.status(201).json({ message: 'Salida de material registrada con éxito' });
    } catch (error) {
        console.error('Error registrando salida de material:', error.message);
        console.error(error.stack); // Esto imprimirá el stack trace completo
        return res.status(500).json({ message: 'Error registrando salida de material' });
    }
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

function notifyNewMaterialCreation(nombre, deposito, callback) {
    const descripcion = `Se ha creado el material '${nombre}' en el depósito '${deposito}' ya que no existía.`;

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
                `INSERT INTO usuario_notificacion (usuario_id, notificacion_id, visto) 
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
// Cambia la ruta para incluir el parámetro de ID del usuario
app.get('/check-tutorial-status/:id', (req, res) => {
    const userId = req.params.id; // Obtén el userId del parámetro de la URL
    // Verificamos si es el primer login del usuario
    const queryUser = 'SELECT firstLogin FROM usuario WHERE id = ?';
    db.query(queryUser, [userId], (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        if (results.length === 0) return res.status(404).send('Usuario no encontrado'); // Maneja el caso donde no se encuentra el usuario

        const firstLogin = results[0].firstLogin;

        if (firstLogin === 1) {
            // Verificamos si ya existen datos en las tablas clave
            const queryCounts = `
                SELECT
                    (SELECT COUNT(*) FROM Ubicacion) AS ubicacionCount, 
                    (SELECT COUNT(*) FROM Deposito) AS depositoCount,
                    (SELECT COUNT(*) FROM Categoria) AS categoriaCount,
                    (SELECT COUNT(*) FROM Pasillo) AS pasilloCount,
                    (SELECT COUNT(*) FROM Estanteria) AS estanteriaCount
            `;
            db.query(queryCounts, (err, results) => {
                if (err) return res.status(500).send('Error al consultar las tablas clave');

                const { ubicacionCount, depositoCount, categoriaCount, pasilloCount, estanteriaCount } = results[0];

                // Si alguna tabla está vacía, activamos el tutorial para esa parte
                const needsTutorial = {
                    ubicacion: ubicacionCount === 0,
                    deposito: depositoCount === 0,
                    categoria: categoriaCount === 0,
                    pasillo: pasilloCount === 0,
                    estanteria: estanteriaCount === 0
                };

                res.json({ showTutorial: true, steps: needsTutorial });
            });
        } else {
            res.json({ showTutorial: false });
        }
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
        const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET_KEY, { expiresIn: '5h' });

        // Verificar si es el primer login
        const firstLogin = user.firstLogin;

        res.json({
            token,
            nombre: user.nombre,
            rol: user.rol,
            id: user.id,
            firstLogin // Indicar si es el primer login
        });
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
        return res.status(401).send("Authorization header missing");
    }

    const token = req.headers.authorization.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return res.status(401).send("Token inválido");
    }

    if (decoded.rol !== 'Administrador') {
        return res.status(403).send('Permiso denegado');
    }

    // Verificar si el tutorial ya está completo
    const tutorialQuery = 'SELECT firstLogin FROM usuario WHERE rol = "Administrador" LIMIT 1';
    db.query(tutorialQuery, (err, result) => {
        if (err) {
            return res.status(500).send("Error al verificar el estado del tutorial");
        }

        // Si el tutorial ya está completo, se establecerá `firstLogin` en 0
        const isTutorialComplete = result[0]?.firstLogin === 0;

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
            firstLogin: isTutorialComplete ? 0 : 1
        };

        const query = 'INSERT INTO usuario SET ?';
        db.query(query, user, (err, result) => {
            if (err) {
                return res.status(500).send("Error al crear el usuario");
            }
            res.status(200).send('Usuario creado');
        });
    });
});


app.get('/users', (req, res) => {
    const query = `
        SELECT 
            u.id, u.nombre, u.apellido, u.legajo, u.nombre_usuario, u.email, u.rol 
        FROM Usuario u`;

    db.query(query, (err, results) => {
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

            // Leer la plantilla HTML
            const templatePath = path.join(__dirname, '/TemplateMail/TemplateMail');
            fs.readFile(templatePath, 'utf-8', (err, data) => {
                if (err) {
                    console.error('Error al leer la plantilla HTML:', err);
                    return res.status(500).send('Error al leer la plantilla HTML');
                }

                // Reemplazar el código de recuperación en la plantilla HTML
                const customizedTemplate = data.replace('ABCDE', recoveryCode);

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


// Endpoint para agregar un nuevo pasillo
app.post('/addAisle', (req, res) => {
    const { numero, idDeposito, idLado1, idLado2 } = req.body;

    if (!numero || !idDeposito || !idLado1) {
        return res.status(400).json({ error: 'Todos los campos requeridos deben estar completos' });
    }

    const query = `
        INSERT INTO Pasillo (numero, idDeposito, idLado1, idLado2)
        VALUES (?, ?, ?, ?)
    `;

    const values = [numero, idDeposito, idLado1, idLado2 || null]; // Si no hay `idLado2`, insertar `null`

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al insertar pasillo:', err);
            return res.status(500).json({ error: 'Error al agregar pasillo', details: err });
        }
        res.status(200).json({ message: 'Pasillo agregado exitosamente', result });
    });
});


app.get('/aisle', (req, res) => {
    const depositoId = req.query.depositoId;
    let query = `
        SELECT 
            p.id, p.numero, d.Nombre AS nombreDeposito, u.nombre AS ubicacionDeposito,
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
    if (depositoId) {
        query += ` WHERE p.idDeposito = ?`;
        db.query(query, [depositoId], (err, results) => {
            if (err) return res.status(500).send('Error al consultar la base de datos');
            res.json(results);
        });
    } else {
        db.query(query, (err, results) => {
            if (err) return res.status(500).send('Error al consultar la base de datos');
            res.json(results);
        });
    }
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
        SELECT d.id, d.nombre, d.idUbicacion, u.nombre AS nombreUbicacion 
        FROM Deposito d 
        LEFT JOIN Ubicacion u ON d.idUbicacion = u.id`;

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
        res.status(200).json({ message: 'Ubicación agregada exitosamente' });
    });
});

// Obtener Ubicación
app.get('/deposit-locations', (req, res) => {
    const query = 'SELECT id, nombre FROM Ubicacion';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
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
    const query = 'SELECT id, descripcion FROM Categoria';
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

    const query = 'INSERT INTO Categoria (descripcion) VALUES (?)';
    const values = [descripcion];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al insertar categoría:', err);
            return res.status(500).json({ message: 'Error al agregar categoría' });
        }
        res.status(200).json({ message: 'Categoría agregada exitosamente' });
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
            e.id, e.numero, e.cantidad_estante, e.cantidad_division, e.idPasillo, e.idLado, 
            p.numero AS numeroPasillo, 
            l.descripcion AS direccionLado,
            d.nombre AS nombreDeposito,
            u.nombre AS nombreUbicacion
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
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Endpoint para agregar una nueva estantería
app.post('/addShelf', (req, res) => {
    const { numero, cantidad_estante, cantidad_division, idPasillo, idLado } = req.body;

    if (!numero || !cantidad_estante || !cantidad_division || !idPasillo || !idLado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO Estanteria (numero, cantidad_estante, cantidad_division, idPasillo, idLado) VALUES (?, ?, ?, ?, ?)';
    const values = [numero, cantidad_estante, cantidad_division, idPasillo, idLado];

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
        SELECT nombre, cantidad, matricula, fechaUltimoEstado, bajoStock, idEstado, idEspacio, ultimoUsuarioId, idCategoria, idDeposito, ocupado 
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
            nombre, cantidad, matricula, fechaUltimoEstado, bajoStock,
            idEstado, idEspacio, ultimoUsuarioId, idCategoria, ocupado
        } = materialOrigen;
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

        db.query(updateMaterialOrigenQuery, [nuevaCantidadOrigen, nuevoEstadoOrigen, idMaterial], (err, updateResult) => {
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

                    if (materialDestinoResult.length > 0) {
                        const { id: idMaterialDestino, cantidad: cantidadDestino } = materialDestinoResult[0];
                        const nuevaCantidadDestino = Number(cantidadDestino) + cantidadMovidaNumero;
                        const nuevoEstadoDestino = assignStatus(nuevaCantidadDestino, bajoStock);

                        const updateMaterialDestinoQuery = `
                            UPDATE Material 
                            SET cantidad = ?, idEstado = ? 
                            WHERE id = ?
                        `;

                        db.query(updateMaterialDestinoQuery, [nuevaCantidadDestino, nuevoEstadoDestino, idMaterialDestino], (err, updateResult) => {
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
                        });

                    } else {
                        const nuevoEstadoDestino = assignStatus(cantidadMovidaNumero, bajoStock);

                        const insertMaterialDestinoQuery = `
                            INSERT INTO Material (
                                nombre, cantidad, matricula, fechaUltimoEstado, bajoStock, idEstado, idEspacio, 
                                ultimoUsuarioId, idCategoria, idDeposito, ocupado, fechaAlta
                            ) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                        `;

                        const valoresInsertMaterial = [
                            nombre, cantidadMovidaNumero, matricula, fechaUltimoEstado, bajoStock,
                            nuevoEstadoDestino, idEspacio, ultimoUsuarioId, idCategoria, idDepositoDestino, ocupado
                        ];

                        db.query(insertMaterialDestinoQuery, valoresInsertMaterial, (err, insertResult) => {
                            if (err) {
                                console.error('Error al crear el material en el depósito de destino:', err);
                                res.status(500).json({ error: 'Error al crear el material en el depósito de destino' });
                                return;
                            }

                            // Obtener el nombre del depósito destino
                            const getDepositNameQuery = `SELECT nombre FROM Deposito WHERE id = ?`;

                            db.query(getDepositNameQuery, [idDepositoDestino], (err, result) => {
                                if (err) {
                                    console.error('Error al obtener el nombre del depósito:', err);
                                    res.status(500).json({ error: 'Error al obtener el nombre del depósito' });
                                    return;
                                }

                                if (result.length === 0) {
                                    res.status(404).json({ error: 'Depósito no encontrado' });
                                    return;
                                }

                                const nombreDeposito = result[0].nombre;

                                // Notificar sobre la creación de un nuevo material
                                notifyNewMaterialCreation(nombre, nombreDeposito, (error) => {
                                    if (error) {
                                        console.error('Error al manejar notificación de nuevo material:', error);
                                        res.status(500).json({ error: 'Error al manejar notificación de nuevo material' });
                                        return;
                                    }

                                    handleStockNotifications(nombre, cantidadMovidaNumero, bajoStock, (error) => {
                                        if (error) {
                                            console.error('Error al manejar notificaciones de stock en destino:', error);
                                            res.status(500).json({ error: 'Error al manejar notificaciones de stock en destino' });
                                            return;
                                        }

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
                                });
                            });
                        });
                    }
                });
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
            res.status(500).json({ error: 'Error al obtener los informes' });
            return;
        }
        res.json(results);
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
        const decoded = jwt.verify(token, SECRET_KEY); // Usa la clave secreta definida
        idUsuario = decoded.id; // Extraer el id del usuario
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }

    const { tipo, fechaInicio, fechaFin, deposito, estadoMaterial, idMaterial, tipoGrafico } = req.body;

    // Validación de campos obligatorios
    if (!tipo) {
        return res.status(400).json({ mensaje: 'Campos obligatorios faltantes' });
    }

    // Crear la consulta SQL para insertar el informe en la base de datos
    const insertQuery = `
    INSERT INTO Informe (tipo, tipoGrafico, fechaGeneracion, idUsuario, idMaterial, idDeposito, idEstado, fechaInicio, fechaFin) 
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)`;
    const insertValues = [tipo, tipoGrafico, idUsuario, idMaterial || null, deposito || null, estadoMaterial || null, fechaInicio, fechaFin];


    db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
            console.error('Error al insertar informe:', err);
            return res.status(500).json({ mensaje: 'Error al insertar informe' });
        }

        const informeId = result.insertId;

        // Generar el informe dependiendo del tipo de informe seleccionado
        let reportQuery = '';
        let reportParams = [];

        switch (tipo) {
            case 'Informe de inventario general':
                reportQuery = `
                    SELECT 
                        m.id, 
                        m.nombre, 
                        m.cantidad, 
                        c.descripcion AS categoria, 
                        d.nombre AS depositoNombre,
                        es.descripcion AS estadoDescripcion
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
                if (estadoMaterial === 'Todos') {
                    reportQuery = `
                            SELECT 
                                m.id, 
                                m.nombre, 
                                m.cantidad, 
                                c.descripcion AS categoria, 
                                d.nombre AS depositoNombre,
                                es.descripcion AS estadoDescripcion
                            FROM 
                                Material m
                            LEFT JOIN 
                                Categoria c ON m.idCategoria = c.id
                            LEFT JOIN 
                                Deposito d ON m.idDeposito = d.id
                            LEFT JOIN 
                                Estado es ON m.idEstado = es.id
                        `;
                } else {
                    reportQuery = `
                            SELECT 
                                m.id, 
                                m.nombre, 
                                m.cantidad, 
                                c.descripcion AS categoria, 
                                d.nombre AS depositoNombre,
                                es.descripcion AS estadoDescripcion
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
                    reportParams.push(estadoMaterial); // Aquí debe ser el id del estado, no su descripción
                }
                break;

            case 'Informe de material por depósito':
                if (!deposito) {
                    return res.status(400).json({ mensaje: 'Debe especificar el depósito' });
                }
                reportQuery = `
                    SELECT 
                        m.id, 
                        m.nombre, 
                        m.cantidad, 
                        c.descripcion AS categoria, 
                        d.nombre AS depositoNombre,
                        es.descripcion AS estadoDescripcion
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

            case 'Informe de material por movimiento entre depósito':
                if (!fechaInicio || !fechaFin) {
                    return res.status(400).json({ mensaje: 'Debe especificar el rango de fechas' });
                }

                if (idMaterial && idMaterial !== 'Todos') {
                    // Si se selecciona un material específico
                    reportQuery = `
                        SELECT 
                            mo.id, 
                            mo.fechaMovimiento, 
                            mo.cantidad, 
                            mo.nombreMaterial, 
                            d1.nombre AS depositoOrigen, 
                            d2.nombre AS depositoDestino,
                            u.nombre AS usuario
                        FROM 
                            movimiento mo
                        LEFT JOIN 
                            Deposito d1 ON mo.idDepositoOrigen = d1.id
                        LEFT JOIN 
                            Deposito d2 ON mo.idDepositoDestino = d2.id
                        LEFT JOIN 
                            Usuario u ON mo.idUsuario = u.id
                        WHERE 
                            mo.fechaMovimiento BETWEEN ? AND ?
                            AND mo.nombreMaterial = ?
                    `;
                    reportParams.push(fechaInicio, fechaFin, idMaterial);
                } else {
                    // Si se selecciona "Todos" los materiales
                    reportQuery = `
                        SELECT 
                            mo.id, 
                            mo.fechaMovimiento, 
                            mo.cantidad, 
                            mo.nombreMaterial, 
                            d1.nombre AS depositoOrigen, 
                            d2.nombre AS depositoDestino,
                            u.nombre AS usuario
                        FROM 
                            movimiento mo
                        LEFT JOIN 
                            Deposito d1 ON mo.idDepositoOrigen = d1.id
                        LEFT JOIN 
                            Deposito d2 ON mo.idDepositoDestino = d2.id
                        LEFT JOIN 
                            Usuario u ON mo.idUsuario = u.id
                        WHERE 
                            mo.fechaMovimiento BETWEEN ? AND ?
                    `;
                    reportParams.push(fechaInicio, fechaFin);
                }
                break;

            default:
                return res.status(400).json({ mensaje: 'Tipo de informe no válido' });
        }

        // Ejecutar la consulta para generar el informe
        db.query(reportQuery, reportParams, (err, reportResult) => {
            if (err) {
                console.error('Error al generar el informe:', err);
                return res.status(500).json({ mensaje: 'Error al generar el informe' });
            }

            res.status(200).json({
                mensaje: 'Informe generado con éxito',
                informeId: informeId,
                datos: reportResult,
            });
        });
    });
});



// Endpoint para obtener los detalles de un informe específico
app.get('/reports/:id', (req, res) => {
    const reportId = req.params.id;

    const query = `SELECT id, tipo, fechaGeneracion, idUsuario, idMaterial, idDeposito, tipoGrafico, fechaInicio, fechaFin, idEstado FROM Informe WHERE id = ?`;


    db.query(query, [reportId], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al consultar la base de datos');
        }
        if (results.length === 0) return res.status(404).send('Informe no encontrado');

        const report = results[0];
        report.datos = [];

        // Si ambos son NULL, podría realizarse una consulta para devolver todos los materiales
        if (report.idMaterial === null && report.idDeposito === null) {
            const generalQuery = 'SELECT nombre, cantidad, idEstado FROM Material';
            db.query(generalQuery, (err, generalResults) => {
                if (err) {
                    console.error('Error al obtener datos generales:', err);
                    return res.status(500).send('Error al obtener datos generales');
                }
                return res.json({ ...report, datos: generalResults.length > 0 ? generalResults : [] });
            });
            return;
        }

        const additionalQueries = [];

        if (report.idMaterial) {
            additionalQueries.push(new Promise((resolve, reject) => {
                const materialQuery = 'SELECT * FROM Material WHERE id = ?';
                db.query(materialQuery, [report.idMaterial], (err, materialResults) => {
                    if (err) return reject(err);
                    report.material = materialResults[0] || null;
                    resolve();
                });
            }));
        }

        if (report.idDeposito) {
            additionalQueries.push(new Promise((resolve, reject) => {
                const depositoQuery = 'SELECT * FROM Deposito WHERE id = ?';
                db.query(depositoQuery, [report.idDeposito], (err, depositoResults) => {
                    if (err) return reject(err);
                    report.deposito = depositoResults[0] || null;
                    resolve();
                });
            }));

            additionalQueries.push(new Promise((resolve, reject) => {
                const materialByDepositoQuery = 'SELECT nombre, cantidad, idEstado FROM Material WHERE idDeposito = ?';
                db.query(materialByDepositoQuery, [report.idDeposito], (err, materialByDepositoResults) => {
                    if (err) return reject(err);
                    report.datos = materialByDepositoResults.length > 0 ? materialByDepositoResults : [];
                    resolve();
                });
            }));
        }

        // Agregar caso para "Informe de material por estado" incluyendo la opción "Todos"
        if (report.tipo === 'Informe de material por estado') {
            console.log('Procesando informe de material por estado...');
            additionalQueries.push(new Promise((resolve, reject) => {
                const estadoQuery = `
                    SELECT 
                        m.id, 
                        m.nombre, 
                        m.cantidad, 
                        m.idEstado, 
                        e.descripcion AS estadoDescripcion
                    FROM 
                        Material m 
                    LEFT JOIN 
                        Estado e ON m.idEstado = e.id
                `;

                // Si `idEstado` es específico
                if (report.idEstado && report.idEstado !== 'Todos') {
                    estadoQuery += ` WHERE e.id = ?`;
                    db.query(estadoQuery, [report.idEstado], (err, estadoResults) => {
                        if (err) return reject(err);
                        console.log('Resultados de la consulta para estado específico:', estadoResults); // Verifica los resultados aquí
                        report.datos = estadoResults.length > 0 ? estadoResults : [];
                        resolve();
                    });
                } else {
                    // Si no hay un estado específico seleccionado, trae todos los materiales con sus estados
                    db.query(estadoQuery, (err, estadoResults) => {
                        if (err) return reject(err);
                        console.log('Resultados de la consulta para todos los estados:', estadoResults); // Verifica los resultados aquí
                        report.datos = estadoResults.length > 0 ? estadoResults : [];
                        resolve();
                    });
                }
            }));
        }





        // Manejar el caso para "Informe de material por movimiento entre depósito"
        if (report.tipo === 'Informe de material por movimiento entre depósito') {
            if (report.fechaInicio && report.fechaFin) {
                additionalQueries.push(new Promise((resolve, reject) => {
                    const movimientoQuery = `
                        SELECT 
                            mo.id, 
                            mo.fechaMovimiento, 
                            mo.cantidad, 
                            m.nombre AS nombreMaterial, 
                            d1.nombre AS depositoOrigen, 
                            d2.nombre AS depositoDestino,
                            u.nombre AS usuario
                        FROM 
                            movimiento mo
                        LEFT JOIN 
                            Material m ON mo.idMaterial = m.id
                        LEFT JOIN 
                            Deposito d1 ON mo.idDepositoOrigen = d1.id
                        LEFT JOIN 
                            Deposito d2 ON mo.idDepositoDestino = d2.id
                        LEFT JOIN 
                            Usuario u ON mo.idUsuario = u.id
                        WHERE 
                            mo.fechaMovimiento BETWEEN ? AND ?
                    `;
                    db.query(movimientoQuery, [report.fechaInicio, report.fechaFin], (err, movimientoResults) => {
                        if (err) return reject(err);
                        report.datos = movimientoResults.length > 0 ? movimientoResults : [];
                        resolve();
                    });
                }));
            } else {
                console.error('Error: rango de fechas no definido en el informe');
                return res.status(400).send('Rango de fechas no definido');
            }
        }

        Promise.all(additionalQueries)
            .then(() => res.json(report))
            .catch((err) => {
                console.error('Error al realizar las consultas adicionales:', err);
                res.status(500).send('Error al obtener información adicional del informe');
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
