const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const app = express();
const SECRET_KEY = 'peron74';

app.use(cors());
app.use(express.json());

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

app.post('/login', (req, res) => {
    const { user, password } = req.body;

    // Consulta a la base de datos para verificar usuario y contraseña
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
        res.json({ token, nombre:user.nombre, rol:user.rol });
    });
});

app.post('/logout', (req, res) => {
    // No es necesario hacer nada en el servidor para logout con JWT.
    res.status(200).send('Logout exitoso');
});

// Endpoint para agregar usuarios
app.post('/addUser', (req, res) => {
    const { nombre, apellido, legajo, nombre_usuario, contrasenia, email, rol } = req.body;

    // Verificar si el usuario actual es administrador
    const token = req.headers.authorization.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
    } catch(err){
        return res.status(401).send("Token invalido");
    }
    if (decoded.rol !== 'Administrador') {
        return res.status(403).send('Permiso denegado');
    }

    // Encriptar la contraseña
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(contrasenia, salt);

    const user = { nombre, apellido, legajo, nombre_usuario, contrasenia: passwordHash, email, rol};

    // Insertar el usuario en la base de datos
    const query = 'INSERT INTO usuario SET ?';
    db.query(query, user, (err, result) => {
        if (err){
            console.log(err);
            return res.status(500).send("Error al crear el usuario");
        } res.status(201).send('Usuario creado');
    });
});

app.get('/materials', (req, res) => {
    const query = `
        SELECT 
            m.id, m.nombre, m.cantidad, m.imagen, m.matricula, m.fechaUltimoEstado, 
            m.mapa, m.bajoStock, m.estadoId, m.idEspacio, m.ultimoUsuarioId, 
            m.idCategoria, m.idDeposito, 
            d.nombre AS depositoNombre, 
            u.nombre AS ubicacionNombre, 
            es.descripcion AS estadoDescripcion, 
            c.descripcion AS categoriaDescripcion
        FROM 
            Material m
        LEFT JOIN 
            Deposito d ON m.idDeposito = d.id
        LEFT JOIN 
            Ubicacion u ON d.idUbicacion = u.id
        LEFT JOIN 
            Estado es ON m.estadoId = es.id
        LEFT JOIN 
            Categoria c ON m.idCategoria = c.id
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

app.get('/materials/search', (req, res) => {
    const query = req.query.query;

    const searchQuery = `
        SELECT 
            m.id, m.nombre, m.cantidad, m.imagen, m.matricula, m.fechaUltimoEstado, 
            m.mapa, m.bajoStock, m.estadoId, m.idEspacio, m.ultimoUsuarioId, 
            m.idCategoria, m.idDeposito, 
            d.nombre AS depositoNombre, 
            u.nombre AS ubicacionNombre, 
            es.descripcion AS estadoDescripcion, 
            c.descripcion AS categoriaDescripcion
        FROM 
            Material m
        LEFT JOIN 
            Deposito d ON m.idDeposito = d.id
        LEFT JOIN 
            Ubicacion u ON d.idUbicacion = u.id
        LEFT JOIN 
            Estado es ON m.estadoId = es.id
        LEFT JOIN 
            Categoria c ON m.idCategoria = c.id
        WHERE 
            m.nombre LIKE ?
    `;

    const likeQuery = `${query}%`;

    db.query(searchQuery, [likeQuery], (err, results) => {
        if (err) return res.status(500).send('Error al consultar la base de datos');
        res.json(results);
    });
});

// Endpoint para agregar usuarios
app.post('/addMaterial', (req, res) => {
    const { nombre, apellido, legajo, nombre_usuario, contrasenia, email, rol } = req.body;

    // Verificar si el usuario actual es administrador
    const token = req.headers.authorization.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
    } catch(err){
        return res.status(401).send("Token invalido");
    }
    if (decoded.rol !== 'Administrador') {
        return res.status(403).send('Permiso denegado');
    }

    // Insertar el usuario en la base de datos
    const query = 'INSERT INTO usuario SET ?';
    db.query(query, user, (err, result) => {
        if (err){
            console.log(err);
            return res.status(500).send("Error al crear el usuario");
        } res.status(201).send('Usuario creado');
    });
});

app.listen(8081, () => {
    console.log(`Servidor corriendo en el puerto 8081`);
});