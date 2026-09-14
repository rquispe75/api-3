const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel');
const { passRegex } = require('../utils/validadores');

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    // Testeo de la contraseña plana contra la Regex
    if (!passRegex.test(password)) {
      return res.status(400).json({
        error: 'La contraseña es demasiado débil.',
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await usuarioModel.crearUsuario( nombre, apellido, email, hashedPassword);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
    console.error('Error al registrar usuario: ', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

module.exports = {
  registrarUsuario,
};