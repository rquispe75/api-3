const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel'); 

const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Verificar si el usuario existe en la base de datos
        const usuario = await usuarioModel.obtenerUsuarioPorEmail(email);

        //2. Si el usuario no existe, devolver un error
        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
    
//3. Comparar la password plana vs hash de la Base de Datos
const passValida = await bcrypt.compare(password, usuario.password);

//4. Si fallo la comparacion rechazar
if (!passValida) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
}

//5. El Payload: Datos utiles
// IMPORTANTE: nunca poner contraseña aca
const payload = {id: usuario.id, rol:usuario.rol.id};
 //6. Firmar el token usando el .env
 const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }); // Caduca en 2 horas

//7. Devolver el token al cliente
res.status(200).json({ token });

}
catch (error) {
    console.error('Error al iniciar sesión: ', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
}}

const obtenerPerfil = async (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ message: 'No autenticado' });
    }
    // El controlador ignora cualquier parámetro del usuario y confía
    // exclusivamente en la ID que viene dentro del Token JWT (req.usuario.id).
    const userId = req.usuario.id;
    try {
        const usuario = await usuarioModel.obtenerUsuarioPorId(userId);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
        // No enviar contraseña al cliente
        const { password, ...safeUser } = usuario;
        return res.status(200).json({ user: safeUser });
    } catch (error) {
        console.error('Error al obtener perfil: ', error);
        return res.status(500).json({ message: 'Error al obtener perfil' });
    }
};

module.exports = { loginUsuario, obtenerPerfil };
