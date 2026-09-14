# API 3 — Documentación

API REST en Node.js/Express con MySQL, siguiendo el patrón MVC. Implementa autenticación con JWT, control de acceso basado en la identidad del token, validación de contraseñas con RegEx y un módulo de Publicaciones con paginación y búsqueda.

## Requisitos previos

- Node.js y MySQL en ejecución.
- Base de datos configurada según `.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`).

## Instalación

```bash
npm install
npm run dev
```

## Pruebas unitarias (Jest)

```bash
npm test
```

Cubre:

- `tests/validadores.test.js`: casos límite de la RegEx de contraseñas (longitud, mayúscula, número, caracteres especiales, vacío/undefined).
- `tests/authMiddleware.test.js`: mocks de `req`/`res`/`next` para verificar que el middleware `verificarToken` bloquea peticiones sin token o con token inválido, y que adjunta `req.usuario` cuando el token es válido.

## Seguridad de contraseñas (RegEx)

El backend nunca confía en la validación del frontend. Antes de aplicar `bcrypt`, `registrarUsuario` valida la contraseña contra:

```js
const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
```

Requisitos: mínimo 8 caracteres, al menos 1 mayúscula y al menos 1 número. Si no cumple, responde `400` con `{ "error": "La contraseña es demasiado débil." }`.

## Identidad y endpoint de perfil

- `GET /api/perfil` — Endpoint **estático** y protegido por `verificarToken`. Nunca recibe un ID por parámetro: el controlador toma la identidad exclusivamente de `req.usuario.id`, extraído del JWT decodificado por el middleware. Esto evita que un usuario pueda ver datos de otro cambiando un ID en la URL (IDOR).

## Endpoints

### Usuarios / Autenticación

| Método | Ruta            | Protegida | Descripción                              |
|--------|-----------------|-----------|-------------------------------------------|
| POST   | `/api/usuarios` | No        | Registra un usuario (valida password con RegEx). |
| POST   | `/api/login`    | No        | Login. Devuelve un JWT (`{ id, rol }`).  |
| GET    | `/api/perfil`   | Sí        | Devuelve los datos del usuario autenticado, usando sólo el ID del token. |

### Publicaciones

| Método | Ruta                     | Protegida | Descripción |
|--------|--------------------------|-----------|-------------|
| GET    | `/api/publicaciones`     | No        | Lista publicaciones con paginación (`page`, `limit`) y búsqueda (`search`). |
| POST   | `/api/publicaciones`     | Sí        | Crea una publicación. El `autor_id` se ignora si viene en el body: se inyecta desde `req.usuario.id`. |
| PUT    | `/api/publicaciones/:id` | Sí        | Actualiza una publicación. Sólo el dueño (`autor_id === req.usuario.id`) puede editarla; caso contrario `403 Forbidden`. |
| DELETE | `/api/publicaciones/:id` | Sí        | Elimina una publicación. Misma verificación de propiedad que en `PUT`. |

Las rutas protegidas requieren el header `Authorization: Bearer <token>`.

### Paginación y búsqueda

`GET /api/publicaciones?search=curso&page=1&limit=10`

- `page` y `limit` (por defecto `1` y `10`) se usan para calcular `OFFSET = (page - 1) * limit` y armar `LIMIT ? OFFSET ?`.
- Si se envía `search`, se agrega `WHERE titulo LIKE '%search%'` a la consulta.

## Integridad referencial (Publicaciones)

```sql
CREATE TABLE publicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  contenido TEXT NOT NULL,
  autor_id INT NOT NULL,
  CONSTRAINT fk_publicacion_autor
    FOREIGN KEY (autor_id)
    REFERENCES usuarios(id_usuario)
    ON DELETE RESTRICT
) ENGINE=InnoDB;
```

`autor_id` es Foreign Key hacia `usuarios(id_usuario)`. Con `ON DELETE RESTRICT`, MySQL impide eliminar un usuario mientras tenga publicaciones asociadas, evitando registros huérfanos.

## Propiedad de datos

Antes de ejecutar `UPDATE`/`DELETE` sobre una publicación, el controlador consulta el recurso en la base de datos y compara `post.autor_id` contra `req.usuario.id`. Si no coinciden, responde `403 { "error": "Forbidden: No eres el dueño" }`, sin importar que el usuario esté autenticado.

## Estructura del proyecto (MVC)

```
src/
  config/db.js              Pool de conexión MySQL
  controllers/               Lógica de negocio (auth, usuario, publicacion)
  middlewares/authMiddleware.js  Verificación de JWT (req.usuario)
  models/                    Acceso a datos (SQL parametrizado)
  routes/                    Definición de endpoints Express
  utils/validadores.js       RegEx de contraseñas (testeable con Jest)
tests/                       Suites de Jest (RegEx + mocks de middleware)
```
