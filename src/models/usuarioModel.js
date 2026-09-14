const pool = require('../config/db');
const crearUsuario = async (nombre, apellido, email, password) => {
  // Usamos ? para evitar inyecciones SQL
  // Nunca concatenar variables directamente en la consulta SQL
    const query = 'INSERT INTO usuarios (nombre, apellido, email, password) VALUES (?, ?, ?, ?)';
    const [resultado] = await pool.query(query, [nombre, apellido, email, password]);
  return resultado;
};

const obtenerUsuarioPorEmail = async (email) => {
  const query = 'SELECT * FROM usuarios WHERE email = ? LIMIT 1';
  const [rows] = await pool.query(query, [email]);
  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  const rolId = row.rol_id ?? (row.rol && row.rol.id) ?? null;
  return {
    id: row.id_usuario,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    password: row.password,
    rol: { rol_id: rolId },
  };
};

const obtenerUsuarioPorId = async (id_usuario) => {
  // Trae datos del usuario y el nombre del rol desde la tabla roles
  const query = `
    SELECT u.*, r.nombre AS rol_nombre
    FROM usuarios u
    LEFT JOIN roles r ON u.rol_id = r.id
    WHERE u.id_usuario = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(query, [id_usuario]);
  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  const rolNombre = row.rol_nombre ?? null;
  return {
    //id: row.id_usuario,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    password: row.password,
    // Mantengo la clave `rol_id` pero ahora contiene el nombre del rol según lo solicitado
    rol: { rol_id: rolNombre },
  };
};

module.exports = {
  crearUsuario,
  obtenerUsuarioPorEmail,
  obtenerUsuarioPorId,
};