const publicacionModel = require('../models/publicacionModel');

const listarPublicaciones = async (req, res) => {
  try {
    // Extraer los datos de req.query con valores por defecto
    const { search, page = 1, limit = 10 } = req.query;

    // Calcular el salto (OFFSET)
    const offset = (page - 1) * Number(limit);

    // Llamar al modelo
    const publicaciones = await publicacionModel.obtenerTodas(search, Number(limit), offset);

    res.json(publicaciones);
  } catch (error) {
    console.error('Error al listar publicaciones: ', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crearPost = async (req, res) => {
  try {
    const { titulo, contenido } = req.body;

    // Delegación de identidad: el autor_id nunca viene del body,
    // se extrae del usuario autenticado por el Token JWT.
    const autor_id = req.usuario.id;

    await publicacionModel.crearPublicacion(titulo, contenido, autor_id);
    res.status(201).json({ message: 'Publicación creada exitosamente' });
  } catch (error) {
    console.error('Error al crear publicación: ', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarPost = async (req, res) => {
  try {
    const post = await publicacionModel.obtenerPorId(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Propiedad de datos: sólo el dueño puede modificar el recurso
    if (post.autor_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Forbidden: No eres el dueño' });
    }

    const { titulo, contenido } = req.body;
    await publicacionModel.actualizarPublicacion(req.params.id, titulo, contenido);
    res.json({ message: 'Publicación actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar publicación: ', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminarPost = async (req, res) => {
  try {
    const post = await publicacionModel.obtenerPorId(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Propiedad de datos: sólo el dueño puede borrar el recurso
    if (post.autor_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Forbidden: No eres el dueño' });
    }

    await publicacionModel.eliminarPublicacion(req.params.id);
    res.json({ message: 'Publicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar publicación: ', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  listarPublicaciones,
  crearPost,
  actualizarPost,
  eliminarPost,
};
