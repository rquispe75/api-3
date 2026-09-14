const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Listado público con paginación (page, limit) y búsqueda (search)
router.get('/publicaciones', publicacionController.listarPublicaciones);

// Crear publicación: el autor_id se extrae del Token, nunca del body
router.post('/publicaciones', verificarToken, publicacionController.crearPost);

// Modificar/eliminar: sólo el dueño del recurso puede hacerlo
router.put('/publicaciones/:id', verificarToken, publicacionController.actualizarPost);
router.delete('/publicaciones/:id', verificarToken, publicacionController.eliminarPost);

module.exports = router;
