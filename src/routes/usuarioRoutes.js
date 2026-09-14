const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Ruta para registrar un nuevo usuario
router.post('/usuarios', usuarioController.registrarUsuario);
router.post('/usuarios/login', require('../controllers/authController').loginUsuario);

module.exports = router;