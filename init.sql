-- Eliminar la base de datos si ya existe para evitar errores al crearla
DROP DATABASE IF EXISTS my_database;

-- Crear la base de datos y usarla
CREATE DATABASE IF NOT EXISTS my_database;
USE my_database;

-- Crear roles primero para referenciar desde usuarios
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles iniciales
INSERT IGNORE INTO roles (nombre, descripcion) VALUES
('Administrador', 'Usuario con todos los privilegios'),
('Editor', 'Usuario con privilegios de edición'),
('Usuario', 'Usuario con privilegios limitados'),
('Moderador', 'Usuario con privilegios de moderación');

-- Ahora crear usuarios (roles ya existen)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT DEFAULT 3,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuarios iniciales
INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id, activo) VALUES
('Juan', 'Perez', 'juan.perez@email.com', 'hashed_password_1', '1234567890', 1, 1),
('Maria', 'Gomez', 'maria.gomez@email.com', 'hashed_password_2', '0987654321', 2, 1),
('Carlos', 'Lopez', 'carlos.lopez@email.com', 'hashed_password_3', '5555555555', 3, 1),
('Ana', 'Martinez', 'ana.martinez@email.com', 'hashed_password_4', '1111111111', 4, 1)
AS new (nombre, apellido, email, password, telefono, rol_id, activo)
ON DUPLICATE KEY UPDATE
    nombre = new.nombre,
    apellido = new.apellido,
    password = new.password,
    telefono = new.telefono,
    rol_id = new.rol_id,
    activo = new.activo,
    updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL UNIQUE,
    contenido TEXT NOT NULL,
    autor_id INT NOT NULL,
    KEY `fk_publicaciones_autor` (autor_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `publicaciones` (`id`, `titulo`, `contenido`, `autor_id`) VALUES
(1, 'Curso de NodeJS Actualizado', 'Contenido actualizado', 2),
(2, 'Curso de React', 'Otro contenido', 1),
(3, 'Curso de NodeJS Actualizado por su dueno', 'Contenido actualizado por Usuario 1', 3),
(4, 'Curso de Python', 'Contenido sobre Python', 4);

ALTER TABLE `publicaciones`
    ADD CONSTRAINT `fk_publicaciones_autor` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT;