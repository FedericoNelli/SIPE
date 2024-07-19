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
        res.json({ token });
    });
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

app.listen(8081, () => {
    console.log(`Servidor corriendo en el puerto 8081`);
});