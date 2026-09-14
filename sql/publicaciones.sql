USE api3;

-- Tabla de Publicaciones: recursos generados por los usuarios.
CREATE TABLE IF NOT EXISTS publicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  contenido TEXT NOT NULL,
  autor_id INT NOT NULL,

  -- Integridad Referencial
  CONSTRAINT fk_publicacion_autor
    FOREIGN KEY (autor_id)
    REFERENCES usuarios(id_usuario)
    ON DELETE RESTRICT
) ENGINE=InnoDB;
