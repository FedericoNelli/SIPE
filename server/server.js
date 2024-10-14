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
const SECRET_KEY = 'SIPE';
const { format } = require('date-fns');

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
        s.id AS salidaId,
        DATE_FORMAT(s.fecha, '%d-%m-%Y') AS fechaSalida,
        GROUP_CONCAT(m.nombre ORDER BY ds.idMaterial ASC SEPARATOR ', ') AS nombresMateriales,
        GROUP_CONCAT(ds.cantidad ORDER BY ds.idMaterial ASC SEPARATOR ' , ') AS cantidadesMateriales,
        GROUP_CONCAT(DISTINCT d.nombre ORDER BY d.nombre ASC SEPARATOR ', ') AS depositoNombre,
        GROUP_CONCAT(DISTINCT u.nombre ORDER BY u.nombre ASC SEPARATOR ', ') AS ubicacionNombre
    FROM 
        salida_material s
    JOIN 
        detalle_salida_material ds ON s.id = ds.idSalida
    JOIN 
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

        if (results.length === 0) {
            return res.status(200).json({ message: 'No hay registros de salidas de materiales', data: [] });
        }

        res.status(200).json(results);
    });
});

//Este endpoint se usa para el informe de salida de material
app.get('/exits-details', (req, res) => {
    const query = `
        SELECT 
        s.id AS salidaId,
        DATE_FORMAT(s.fecha, '%d-%m-%Y') AS fechaSalida,
        m.nombre AS nombreMaterial, -- Devolver el nombre del material individualmente
        ds.cantidad AS cantidadMaterial, -- Devolver la cantidad del material individualmente
        d.nombre AS depositoNombre,
        u.nombre AS ubicacionNombre
    FROM 
        salida_material s
    JOIN 
        detalle_salida_material ds ON s.id = ds.idSalida
    JOIN 
        Material m ON ds.idMaterial = m.id
    LEFT JOIN 
        Deposito d ON m.idDeposito = d.id
    LEFT JOIN 
        Ubicacion u ON d.idUbicacion = u.id
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

// Endpoint POST para registrar la salida de un material
app.post('/materials/exits', async (req, res) => {
    const salidas = req.body; // Aquí recibes un array de objetos

    try {
        const { motivo, fecha, idUsuario } = salidas[0]; // Tomamos el motivo, fecha, y usuario del primer material (asumimos que es el mismo para todos)

        // 1. Registrar la salida principal en la tabla `salida_material`
        const salidaId = await new Promise((resolve, reject) => {
            db.query('INSERT INTO salida_material (fecha, motivo, idUsuario) VALUES (?, ?, ?)',
                [fecha, motivo, idUsuario], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId); // Obtener el id de la nueva salida
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

        return res.status(201).json({ message: 'Salida registrada con éxito y notificaciones actualizadas' });

    } catch (error) {
        console.error('Error registrando salida de material:', error.message);
        console.error(error.stack); // Esto imprimirá el stack trace completo
        return res.status(500).json({ message: 'Error registrando salida de material' });
    }
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
            return res.status(404).send('Pasillo no encontrado' );
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

            const userId = result.insertId;

            if (imagen) {
                const imagenPath = `/uploads/SIPEUser-img-${userId}${path.extname(imagen.originalname)}`;
                const newFilePath = path.join(__dirname, 'public', imagenPath);

                fs.rename(imagen.path, newFilePath, (err) => {
                    if (err) {
                        console.error('Error al renombrar la imagen:', err);
                        return res.status(500).json({ mensaje: 'Error al guardar la imagen' });
                    }

                    db.query('UPDATE usuario SET imagen = ? WHERE id = ?', [imagenPath, userId], (err) => {
                        if (err) {
                            console.error('Error al actualizar la base de datos con la imagen:', err);
                            return res.status(500).json({ mensaje: 'Error al actualizar la imagen en la base de datos' });
                        }
                        res.status(200).json({ mensaje: 'Usuario creado con éxito y imagen guardada' });
                    });
                });
            } else {
                res.status(200).json({ mensaje: 'Usuario creado con éxito' });
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
app.put('/editUser/:id', upload.single('imagen'), (req, res) => {
    const userId = req.params.id;
    const { nombre, apellido, legajo, nombre_usuario, email, rol, eliminarImagen } = req.body;
    const imagen = req.file;

    if (!nombre || !apellido || !legajo || !nombre_usuario || !email || !rol) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Actualiza la información del usuario
    const updateUserQuery = 'UPDATE usuario SET nombre = ?, apellido = ?, legajo = ?, nombre_usuario = ?, email = ?, rol = ? WHERE id = ?';
    const values = [nombre, apellido, legajo, nombre_usuario, email, rol, userId];

    db.query(updateUserQuery, values, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al actualizar el usuario' });
        }

        // Si hay una nueva imagen para guardar
        if (imagen) {
            const imagenPath = `/uploads/SIPEUser-img-${userId}${path.extname(imagen.originalname)}`;
            const newFilePath = path.join(__dirname, 'public', imagenPath);

            fs.rename(imagen.path, newFilePath, (err) => {
                if (err) {
                    console.error('Error al renombrar la imagen:', err);
                    return res.status(500).json({ mensaje: 'Error al guardar la imagen' });
                }

                db.query('UPDATE usuario SET imagen = ? WHERE id = ?', [imagenPath, userId], (err) => {
                    if (err) {
                        console.error('Error al actualizar la base de datos con la imagen:', err);
                        return res.status(500).json({ mensaje: 'Error al actualizar la imagen en la base de datos' });
                    }
                    res.status(200).json({ mensaje: 'Usuario actualizado correctamente con imagen' });
                });
            });
        }
        // Si se solicita eliminar la imagen
        else if (eliminarImagen === 'true') {
            // Elimina el archivo físico si existe
            db.query('SELECT imagen FROM usuario WHERE id = ?', [userId], (err, result) => {
                if (err) {
                    console.error('Error al obtener la imagen actual:', err);
                    return res.status(500).json({ mensaje: 'Error al obtener la imagen actual' });
                }

                const currentImagePath = result[0]?.imagen;
                if (currentImagePath) {
                    const fullPath = path.join(__dirname, 'public', currentImagePath);
                    fs.unlink(fullPath, (err) => {
                        if (err && err.code !== 'ENOENT') {
                            console.error('Error al eliminar la imagen física:', err);
                            return res.status(500).json({ mensaje: 'Error al eliminar la imagen física' });
                        }

                        // Actualiza la columna de imagen en la base de datos
                        db.query('UPDATE usuario SET imagen = NULL WHERE id = ?', [userId], (err) => {
                            if (err) {
                                console.error('Error al actualizar la base de datos:', err);
                                return res.status(500).json({ mensaje: 'Error al actualizar la base de datos' });
                            }
                            res.status(200).json({ mensaje: 'Usuario actualizado y la imagen eliminada correctamente' });
                        });
                    });
                } else {
                    res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
                }
            });
        }
        else {
            // Si no se eliminó ni agregó una imagen
            res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
        }
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
        res.status(200).json({ message: 'Pasillo agregado exitosamente', id: result.insertId });
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
        query += ` WHERE p.idDeposito = ? GROUP BY p.id, p.numero, d.Nombre, u.nombre, l1.descripcion, l2.descripcion`;
        db.query(query, [depositoId], (err, results) => {
            if (err) return res.status(500).send('Error al consultar la base de datos');
            res.json(results);
        });
    } else {
        query += ` GROUP BY p.id, p.numero, d.Nombre, u.nombre, l1.descripcion, l2.descripcion`;
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
        JOIN 
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

    // Si idLado2 no está definido o es una cadena vacía, se asigna null
    const idLado2Value = idLado2 !== undefined && idLado2 !== '' ? idLado2 : null;

    const query = `
        UPDATE Pasillo 
        SET numero = ?, idDeposito = ?, idLado1 = ?, idLado2 = ? 
        WHERE id = ?
    `;

    const values = [numero, idDeposito, idLado1, idLado2Value, aisleId];

    db.query(query, values, (err, result) => {
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
        res.status(200).json({ message: 'Depósito agregado exitosamente', id: result.insertId });
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
        JOIN Ubicacion u ON d.idUbicacion = u.id
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

    const query = `
        UPDATE Deposito
        SET nombre = ?, idUbicacion = ?
        WHERE id = ?
    `;

    const values = [nombre, idUbicacion, depositId];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar el depósito:', err);
            return res.status(500).json({ error: 'Error al actualizar el depósito' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Depósito no encontrado' });
        }

        res.status(200).json({ message: 'Depósito actualizado correctamente' });
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
        res.status(200).json({ message: 'Ubicación agregada exitosamente', id: result.insertId});
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

    const query = 'INSERT INTO Categoria (descripcion) VALUES (?)';
    const values = [descripcion];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al insertar categoría:', err);
            return res.status(500).json({ message: 'Error al agregar categoría' });
        }
        res.status(200).json({ message: 'Categoría agregada exitosamente', id: result.insertId });
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

    const query = 'UPDATE Categoria SET descripcion = ? WHERE id = ?';
    db.query(query, [descripcion, categoryId], (err, result) => {
        if (err) {
            console.error('Error al actualizar la categoría:', err);
            return res.status(500).json({ message: 'Error al actualizar la categoría' });
        }
        res.status(200).json({ message: 'Categoría actualizada exitosamente' });
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


// Obtener una estantería por ID
app.get('/shelf/:id', (req, res) => {
    const shelfId = req.params.id;
    const query = `
        SELECT Estanteria.*, Pasillo.numero AS pasilloNumero, Lado.descripcion AS ladoDescripcion
        FROM Estanteria
        JOIN Pasillo ON Estanteria.idPasillo = Pasillo.id
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

    // Construimos la consulta para eliminar múltiples IDs
    const placeholders = shelfIds.map(() => '?').join(',');
    const query = `DELETE FROM estanteria WHERE id IN (${placeholders})`;

    db.query(query, shelfIds, (err, result) => {
        if (err) {
            console.error('Error eliminando estanterías:', err);
            return res.status(500).json({ message: 'Error eliminando estanterías' });
        }

        res.status(200).json({ message: 'Estanterías eliminadas correctamente' });
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
            mat.nombre AS nombreMaterial,  -- Aquí traemos el nombre del material
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
        LEFT JOIN 
            Material mat ON m.idMaterial = mat.id  -- Unimos la tabla Material para obtener el nombre
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

    // Obtener toda la información del material en el depósito de origen, incluyendo el nombre
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

                // Cambiamos la validación para usar el nombre y el idDepositoDestino
                const queryMaterialDestino = 'SELECT id, cantidad FROM Material WHERE nombre = ? AND idDeposito = ?';

                // Usamos el nombre del material y el idDepositoDestino para verificar si el material ya existe en el depósito de destino
                db.query(queryMaterialDestino, [nombre, idDepositoDestino], (err, materialDestinoResult) => {
                    if (err) {
                        console.error('Error al verificar el material en el depósito de destino:', err);
                        res.status(500).json({ error: 'Error al verificar el material en el depósito de destino' });
                        return;
                    }

                    if (materialDestinoResult.length > 0) {
                        // Si el material ya existe en el depósito de destino, actualizar la cantidad
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

                                const insertMovementQuery = `
                                    INSERT INTO movimiento (idUsuario, idMaterial, cantidad, idDepositoOrigen, idDepositoDestino, fechaMovimiento) 
                                    VALUES (?, ?, ?, ?, ?, NOW())
                                `;

                                db.query(insertMovementQuery, [idUsuario, idMaterialDestino, cantidadMovida, idDepositoOrigen, idDepositoDestino], (err) => {
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
                        // Si el material no existe en el depósito de destino, crear un nuevo registro
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

                        db.query(insertMaterialDestinoQuery, valoresInsertMaterial, (err) => {
                            if (err) {
                                console.error('Error al crear el material en el depósito de destino:', err);
                                res.status(500).json({ error: 'Error al crear el material en el depósito de destino' });
                                return;
                            }

                            // Notificar la creación del nuevo material en el depósito de destino
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

                                    const insertMovementQuery = `
                                        INSERT INTO movimiento (idUsuario, idMaterial, cantidad, idDepositoOrigen, idDepositoDestino, fechaMovimiento) 
                                        VALUES (?, ?, ?, ?, ?, NOW())
                                    `;

                                    db.query(insertMovementQuery, [idUsuario, idMaterial, cantidadMovida, idDepositoOrigen, idDepositoDestino], (err) => {
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
                    }
                });
            });
        });
    });
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

app.get('/movements/:id', async (req, res) => {
    const movementId = req.params.id;
    const query = `
        SELECT 
            m.*, 
            d1.nombre AS depositoOrigenNombre, 
            d2.nombre AS depositoDestinoNombre,
            mat.nombre AS nombreMaterial  -- Se agrega el nombre del material
        FROM 
            movimiento m
        LEFT JOIN 
            deposito d1 ON m.idDepositoOrigen = d1.id
        LEFT JOIN 
            deposito d2 ON m.idDepositoDestino = d2.id
        LEFT JOIN 
            Material mat ON m.idMaterial = mat.id  -- Se agrega el JOIN para obtener el nombre del material
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
    const { fechaMovimiento, idMaterial, idUsuario, idDepositoOrigen, idDepositoDestino, cantidad } = req.body;

    const cantidadNueva = Number(cantidad);  // La nueva cantidad movida

    try {
        // Iniciar la transacción
        await db.beginTransaction();

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
            SET fechaMovimiento = ?, idMaterial = ?, idUsuario = ?, idDepositoOrigen = ?, idDepositoDestino = ?, cantidad = ?
            WHERE id = ?
        `;
        await db.query(queryUpdateMovimiento, [fechaMovimiento, idMaterial, idUsuario, idDepositoOrigen, idDepositoDestino, cantidadNueva, id]);

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
        return res.status(401).json({ mensaje: 'Vuelva a iniciar sesión' });
    }

    const { tipo, fechaInicio, fechaFin, deposito, estadoMaterial, idMaterial, tipoGrafico, idSalida, idMovimiento, idDetalleSalida } = req.body;

    // Validación de campos obligatorios
    if (!tipo) {
        return res.status(400).json({ mensaje: 'Campos obligatorios faltantes' });
    }

    // Agrega este log para verificar qué tipo de informe está recibiendo el backend
    console.log('Tipo de informe recibido:', tipo);

    // Crear la consulta SQL para insertar el informe en la base de datos
    const insertQuery = `
    INSERT INTO Informe (tipo, tipoGrafico, fechaGeneracion, idUsuario, idMaterial, idDeposito, idEstado, idMovimiento, idSalida, idDetalleSalida, fechaInicio, fechaFin) 
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
        fechaInicio,
        fechaFin
    ];

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
                        es.descripcion AS estadoMaterial
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
                            es.descripcion AS estadoMaterial
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
                            es.descripcion AS estadoMaterial
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
                }
                break;

            case 'Informe de material por deposito':
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
                        es.descripcion AS estadoMaterial
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
                if (!fechaInicio || !fechaFin) {
                    return res.status(400).json({ mensaje: 'Debe especificar el rango de fechas' });
                }

                if (idMovimiento && idMovimiento !== 'Todos') {
                    // Si se selecciona un movimiento específico
                    reportQuery = `
                            SELECT 
                                mo.id, 
                                mo.fechaMovimiento, 
                                mo.cantidad, 
                                m.nombre AS nombreMaterial,  
                                d1.nombre AS depositoOrigen, 
                                d2.nombre AS depositoDestino,
                                u.nombre AS usuario
                            FROM 
                                Movimiento mo
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
                                AND mo.id = ?
                        `;
                    reportParams.push(fechaInicio, fechaFin, idMovimiento);
                } else {
                    // Si se selecciona "Todos" los movimientos
                    reportQuery = `
                            SELECT 
                                mo.id, 
                                mo.fechaMovimiento, 
                                mo.cantidad, 
                                m.nombre AS nombreMaterial,  
                                d1.nombre AS depositoOrigen, 
                                d2.nombre AS depositoDestino,
                                u.nombre AS usuario
                            FROM 
                                Movimiento mo
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
                    reportParams.push(fechaInicio, fechaFin);
                }
                break;

            case 'Informe de salida de material':
                if (!fechaInicio || !fechaFin) {
                    return res.status(400).json({ mensaje: 'Debe especificar el rango de fechas' });
                }

                if (idDetalleSalida && idDetalleSalida !== 'Todos') {
                    // Si se selecciona una salida específica
                    reportQuery = `
                            SELECT 
                                sm.id, 
                                sm.fecha, 
                                dsm.cantidad, 
                                m.nombre AS nombreMaterial, 
                                u.nombre AS nombreUsuario
                            FROM 
                                salida_material sm
                            JOIN 
                                detalle_salida_material dsm ON sm.id = dsm.idSalida
                            JOIN 
                                Material m ON dsm.idMaterial = m.id
                            JOIN 
                                Usuario u ON sm.idUsuario = u.id
                            WHERE 
                                sm.fecha BETWEEN ? AND ? AND sm.id = ?
                        `;
                    reportParams.push(fechaInicio, fechaFin, idDetalleSalida);
                } else {
                    // Si se selecciona "Todas" las salidas
                    reportQuery = `
                            SELECT 
                                sm.id, 
                                sm.fecha, 
                                dsm.cantidad, 
                                m.nombre AS nombreMaterial, 
                                u.nombre AS nombreUsuario
                            FROM 
                                salida_material sm
                            JOIN 
                                detalle_salida_material dsm ON sm.id = dsm.idSalida
                            JOIN 
                                Material m ON dsm.idMaterial = m.id
                            JOIN 
                                Usuario u ON sm.idUsuario = u.id
                            WHERE 
                                sm.fecha BETWEEN ? AND ?
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

    const query = `SELECT id, tipo, fechaGeneracion, idUsuario, idMaterial, idDeposito, tipoGrafico, fechaInicio, fechaFin, idEstado, idMovimiento, idSalida, idDetalleSalida FROM Informe WHERE id = ?;`;


    db.query(query, [reportId], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al consultar la base de datos');
        }
        if (results.length === 0) return res.status(404).send('Informe no encontrado');

        const report = results[0];
        report.datos = [];


        // Evitar ejecutar consultas innecesarias si el tipo no es el adecuado
        if (report.tipo === 'Informe de inventario general') {
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
                        e.descripcion AS estadoMaterial
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
        if (report.tipo === 'Informe de material por movimiento entre deposito') {
            if (report.fechaInicio && report.fechaFin && report.idMovimiento) {
                additionalQueries.push(new Promise((resolve, reject) => {
                    const movimientoQuery = `
                        SELECT 
                            mo.id, 
                            DATE_FORMAT(mo.fechaMovimiento, '%d-%m-%Y') AS fechaMovimiento, 
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
                            mo.fechaMovimiento BETWEEN ? AND ? AND mo.id = ?
                    `;

                    // Formatear las fechas con el formato adecuado para MySQL
                    const fechaInicioFormateada = format(new Date(report.fechaInicio), 'yyyy-MM-dd');
                    const fechaFinFormateada = format(new Date(report.fechaFin), 'yyyy-MM-dd');

                    db.query(movimientoQuery, [fechaInicioFormateada, fechaFinFormateada, report.idMovimiento], (err, movimientoResults) => {
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

        if (report.tipo === 'Informe de salida de material') {
            if (report.fechaInicio && report.fechaFin) {
                additionalQueries.push(new Promise((resolve, reject) => {
                    const salidaMaterialQuery = `
                        SELECT 
                            ds.id AS detalleId,
                            DATE_FORMAT(sm.fecha, '%d-%m-%Y') AS fechaSalida,
                            ds.cantidad,
                            m.nombre AS nombreMaterial,
                            u.nombre AS nombreUsuario,
                            sm.motivo
                        FROM 
                            detalle_salida_material ds
                        LEFT JOIN 
                            Material m ON ds.idMaterial = m.id
                        LEFT JOIN 
                            salida_material sm ON ds.idSalida = sm.id
                        LEFT JOIN 
                            Usuario u ON sm.idUsuario = u.id
                        WHERE 
                            ds.id = ? AND sm.fecha BETWEEN ? AND ?;
                    `;

                    const fechaInicioFormateada = format(new Date(report.fechaInicio), 'yyyy-MM-dd');
                    const fechaFinFormateada = format(new Date(report.fechaFin), 'yyyy-MM-dd');

                    db.query(salidaMaterialQuery, [report.idDetalleSalida, fechaInicioFormateada, fechaFinFormateada], (err, salidaResults) => {
                        if (err) return reject(err);
                        report.datos = salidaResults.length > 0 ? salidaResults : [];
                        resolve();
                    });
                }));
            } else {
                console.error('Error: rango de fechas o ID de detalle de salida no definido en el informe');
                return res.status(400).send('Rango de fechas o ID de detalle de salida no definido');
            }
        }

        Promise.all(additionalQueries)
            .then(() => {
                res.json(report)
            })
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
