const pool = require('../config/db');

const obtenerTodas = async (search, limit, offset) => {
  // Consulta base
  let query = `SELECT * FROM publicaciones`;
  const values = [];

  // Concatenar búsqueda si existe
  if (search) {
    query += ` WHERE titulo LIKE ?`;
    values.push(`%${search}%`);
  }

  // Concatenar paginación
  query += ` LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  // Ejecutar consulta segura
  const [filas] = await pool.query(query, values);
  return filas;
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM publicaciones WHERE id = ? LIMIT 1';
  const [rows] = await pool.query(query, [id]);
  return rows[0] || null;
};

const crearPublicacion = async (titulo, contenido, autor_id) => {
  const query = `INSERT INTO publicaciones (titulo, contenido, autor_id)
                 VALUES (?, ?, ?)`;
  const [resultado] = await pool.query(query, [titulo, contenido, autor_id]);
  return resultado;
};

const actualizarPublicacion = async (id, titulo, contenido) => {
  const query = 'UPDATE publicaciones SET titulo = ?, contenido = ? WHERE id = ?';
  const [resultado] = await pool.query(query, [titulo, contenido, id]);
  return resultado;
};

const eliminarPublicacion = async (id) => {
  const query = 'DELETE FROM publicaciones WHERE id = ?';
  const [resultado] = await pool.query(query, [id]);
  return resultado;
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
};
