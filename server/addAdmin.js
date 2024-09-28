const mysql = require('mysql');
const bcrypt = require('bcryptjs');

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

const nombre= 'Federico';
const apellido= 'Nelli';
const legajo= '83011';
const nombre_usuario = 'fnelli';
const contrasenia = '123';
const email = 'fnelli@epe.santafe.gov.ar';
const rol = 'Administrador';

// Encriptar la contraseña
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync(contrasenia, salt);

const user = { nombre, apellido, legajo, nombre_usuario, contrasenia: passwordHash, email, rol };

const query = 'INSERT INTO usuario SET ?';
db.query(query, user, (err, result) => {
    if (err) throw err;
    console.log('Usuario admin creado');
    db.end();
});