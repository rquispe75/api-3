-- =====================================================================
-- init.sql - Inicialización de la base de datos "api3"
--
-- Docker ejecuta este script UNA SOLA VEZ, cuando el volumen "db_data"
-- está vacío (primer arranque). Si lo modificas, para que se vuelva a
-- ejecutar hay que recrear el volumen:  docker compose down -v
-- =====================================================================

CREATE DATABASE IF NOT EXISTS api3;
USE api3;

-- ---------------------------------------------------------------------
-- Tabla roles (se crea primero porque usuarios la referencia)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Los ids resultantes son: 1=Administrador, 2=Editor, 3=Usuario, 4=Moderador
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Usuario con todos los privilegios'),
('Editor', 'Usuario con privilegios de edición'),
('Usuario', 'Usuario con privilegios limitados'),
('Moderador', 'Usuario con privilegios de moderación');

-- ---------------------------------------------------------------------
-- Tabla usuarios
-- Solo "email" es UNIQUE (identifica al usuario). "nombre" NO lo es:
-- puede haber dos personas llamadas igual.
-- rol_id por defecto = 3 (Usuario), para registros hechos desde la API.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- 255 caracteres: el hash de bcrypt mide 60
    telefono VARCHAR(20),
    rol_id INT DEFAULT 3,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuarios sembrados. Las contraseñas están guardadas ya ENCRIPTADAS
-- (bcrypt, 10 rondas), igual que las que genera la API al registrar.
-- Para iniciar sesión se usa la contraseña en texto plano de la derecha:
--   juan.perez@email.com      -> admin123       (Administrador)
--   maria.gomez@email.com     -> editor123      (Editor)
--   carlos.lopez@email.com    -> usuario123     (Usuario)
--   ana.martinez@email.com    -> moderador123   (Moderador)
-- Ids resultantes: Juan=1, Maria=2, Carlos=3, Ana=4.
INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id, activo) VALUES
('Juan',   'Perez',    'juan.perez@email.com',    '$2b$10$Ie/OekDgcAVHJPSOyQkle.yW5/y8gKVNNcfnHjkUgwzL./7ILH4zS', '1234567890', 1, 1),
('Maria',  'Gomez',    'maria.gomez@email.com',   '$2b$10$WOgJGq4Cgsh9JE.QM3b5.edx4tl.BFO11jl9UXYkObmxC2yqA4EUe', '0987654321', 2, 1),
('Carlos', 'Lopez',    'carlos.lopez@email.com',  '$2b$10$4j1IG1rZLCsoUIfH0412NeJuhDMGbz81paREtCk33Pl5DjSXrRb4e', '5555555555', 3, 1),
('Ana',    'Martinez', 'ana.martinez@email.com',  '$2b$10$ykQhJuSfQ2VKC25cGwjyYelhSjjMqbcT9LUbE.M3JvqrYPdHEhO1q', '1111111111', 4, 1);

-- ---------------------------------------------------------------------
-- Tabla publicaciones
-- autor_id es Foreign Key hacia usuarios(id_usuario).
-- ON DELETE RESTRICT: MySQL impide borrar un usuario que tenga
-- publicaciones (evita registros huérfanos).
-- "titulo" NO es UNIQUE: dos publicaciones pueden llamarse igual.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    autor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_publicaciones_autor` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Publicaciones sembradas (ids 1 a 4). Las nuevas creadas desde la API
-- reciben el id 5 en adelante.
INSERT INTO publicaciones (titulo, contenido, autor_id) VALUES
('Curso de NodeJS Actualizado', 'Contenido actualizado', 2),
('Curso de React', 'Otro contenido', 1),
('Curso de NodeJS Actualizado por su dueno', 'Contenido actualizado por Usuario 1', 3),
('Curso de Python', 'Contenido sobre Python', 4);
