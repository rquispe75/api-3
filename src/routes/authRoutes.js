const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta de autenticación: login
router.post('/login', authController.loginUsuario);

// Ruta protegida y estática: devuelve los datos del usuario autenticado.
// El controlador ignora cualquier parámetro y confía exclusivamente en
// la ID que viene dentro del Token JWT.
router.get('/perfil', authMiddleware.verificarToken, authController.obtenerPerfil);

module.exports = router;
