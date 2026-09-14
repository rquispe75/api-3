const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool;

//Ejecutar en BD bajo el pool
pool.query('SELECT 1 + 1 AS solution') .then(([rows]) => {
  console.log('La conexión a la base de datos se ha establecido correctamente.');
  console.log('Resultado de la consulta: ', rows[0].solution);
}).catch((error) => {
  console.error('Error al conectar a la base de datos: ', error);
});