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

## Ejecución con Docker (recomendado)

Levanta MySQL y la API juntos, sin instalar nada más que Docker Desktop:

```bash
docker compose up --build -d   # construir y levantar
docker compose logs -f api     # ver logs de la API
docker compose down            # detener
docker compose down -v         # detener y borrar la base (vuelve a ejecutar init.sql)
```

- La API queda en `http://localhost:3000/api` (base URL para Postman) y MySQL en `localhost:3306`.
- La API espera a que MySQL esté *healthy* antes de arrancar (`healthcheck` en `docker-compose.yml`).
- `init.sql` crea las tablas y los datos iniciales **solo en el primer arranque** (cuando el volumen está vacío).

### Usuarios sembrados

Las contraseñas están guardadas encriptadas con bcrypt; para iniciar sesión se usa el texto plano:

| Email | Contraseña | Rol | id_usuario |
|-------|------------|-----|------------|
| `juan.perez@email.com` | `admin123` | Administrador | 1 |
| `maria.gomez@email.com` | `editor123` | Editor | 2 |
| `carlos.lopez@email.com` | `usuario123` | Usuario | 3 |
| `ana.martinez@email.com` | `moderador123` | Moderador | 4 |

Las publicaciones sembradas ocupan los ids 1 a 4; las nuevas reciben el id 5 en adelante. Los usuarios registrados desde la API también empiezan en el id 5.

> Nota: la RegEx de contraseñas solo se aplica al **registro**; por eso estas contraseñas sembradas (sin mayúscula) sirven para iniciar sesión aunque no cumplirían la regla si se registraran por la API.

## Pruebas unitarias (Jest)

```bash
npm test
```

Cubre:

- `tests/validadores.test.js`: casos límite de la RegEx de contraseñas (longitud, mayúscula, número, caracteres especiales, vacío/undefined).
- `tests/authMiddleware.test.js`: mocks de `req`/`res`/`next` para verificar que el middleware `verificarToken` bloquea peticiones sin token o con token inválido, y que adjunta `req.usuario` cuando el token es válido.

## Pruebas en Postman

Instructivo para probar todos los flujos de la API y sus bloqueos de seguridad. Las capturas de la ejecución están en la carpeta [`capturas/`](capturas/).

### 1. Preparación

1. Levantar el entorno y comprobar que ambos contenedores estén activos (`api3` debe figurar como *healthy*):

   ```bash
   docker compose up --build -d
   docker compose ps
   ```

2. En Postman crear una colección (por ejemplo `TP MEPSI - API 3`) y definir estas **variables de colección** (pestaña *Variables*):

   | Variable | Valor inicial | Quién la completa |
   |----------|---------------|-------------------|
   | `baseUrl` | `http://localhost:3000/api` | Se escribe a mano |
   | `token1` | *(vacío)* | La request 04 (script post-response) |
   | `token2` | *(vacío)* | La request 05 (script post-response) |
   | `postId` | *(vacío)* | La request 09 (script post-response) |

3. En todas las requests con cuerpo usar **Body → raw → JSON**. En las protegidas usar **Authorization → Bearer Token** con `{{token1}}` o `{{token2}}` según se indique.

> Si Postman responde `ECONNREFUSED`, la API no está corriendo: revisar `docker compose ps` y `docker compose logs api`.

### 2. Requests a ejecutar (en orden)

Ejecutarlas **en el orden numérico**, porque las últimas dependen de las variables que completan las anteriores.

| # | Request | Método y URL | Auth | Body (JSON) | Resultado esperado |
|---|---------|--------------|------|-------------|--------------------|
| 01 | Registro con password débil | `POST {{baseUrl}}/usuarios` | — | `{"nombre":"Ana","apellido":"Gomez","email":"ana.debil@test.com","password":"abc"}` | **400** `La contraseña es demasiado débil.` |
| 02 | Registro Usuario 1 | `POST {{baseUrl}}/usuarios` | — | `{"nombre":"Lucia","apellido":"Fernandez","email":"usuario1.mepsi@test.com","password":"Abcdefg1"}` | **201** `Usuario registrado exitosamente` |
| 03 | Registro Usuario 2 | `POST {{baseUrl}}/usuarios` | — | `{"nombre":"Marcos","apellido":"Diaz","email":"usuario2.mepsi@test.com","password":"Abcdefg1"}` | **201** |
| 04 | Login Usuario 1 | `POST {{baseUrl}}/login` | — | `{"email":"usuario1.mepsi@test.com","password":"Abcdefg1"}` | **200** `{ "token": "..." }` y guarda `token1` |
| 05 | Login Usuario 2 | `POST {{baseUrl}}/login` | — | `{"email":"usuario2.mepsi@test.com","password":"Abcdefg1"}` | **200** y guarda `token2` |
| 06 | Perfil sin token | `GET {{baseUrl}}/perfil` | — | — | **401** `Token no proporcionado` |
| 07 | Perfil con token | `GET {{baseUrl}}/perfil` | `{{token1}}` | — | **200** con los datos de Lucia (solo los del token) |
| 08 | Crear publicación sin token | `POST {{baseUrl}}/publicaciones` | — | `{"titulo":"Sin autenticar","contenido":"No deberia crearse"}` | **401** |
| 09 | Crear publicación (`autor_id` falso) | `POST {{baseUrl}}/publicaciones` | `{{token1}}` | `{"titulo":"Curso de NodeJS","contenido":"Contenido de prueba","autor_id":999}` | **201** con `id`; se ignora el `999` y guarda `postId` |
| 10 | Listar con paginación | `GET {{baseUrl}}/publicaciones?page=1&limit=1` | — | — | **200** con una sola publicación |
| 11 | Buscar por título | `GET {{baseUrl}}/publicaciones?search=NodeJS` | — | — | **200** solo con títulos que contengan `NodeJS` |
| 12 | Actualizar publicación propia | `PUT {{baseUrl}}/publicaciones/{{postId}}` | `{{token1}}` | `{"titulo":"Curso de NodeJS actualizado","contenido":"Editado por su dueño"}` | **200** |
| 13 | Actualizar publicación ajena | `PUT {{baseUrl}}/publicaciones/{{postId}}` | `{{token2}}` | `{"titulo":"Intento de hackeo","contenido":"No deberia actualizarse"}` | **403** `Forbidden: No eres el dueño` |
| 14 | Eliminar publicación ajena | `DELETE {{baseUrl}}/publicaciones/{{postId}}` | `{{token2}}` | — | **403** `Forbidden: No eres el dueño` |

Scripts *post-response* (pestaña **Scripts → Post-response**) de las requests que guardan variables:

```js
// Requests 04 y 05 (en la 05 usar 'token2')
pm.test('Status 200', function () { pm.response.to.have.status(200); });
pm.collectionVariables.set('token1', pm.response.json().token);

// Request 09
pm.test('Status 201', function () { pm.response.to.have.status(201); });
pm.collectionVariables.set('postId', pm.response.json().id);
```

### 3. Qué demuestra cada grupo

- **01** → el backend valida la contraseña con RegEx antes de aplicar bcrypt.
- **06 y 07** → `/perfil` es estático y solo confía en el ID del JWT (no hay forma de pedir el perfil de otro usuario).
- **08** → las rutas protegidas rechazan peticiones sin token.
- **09** → el `autor_id` viene del token, no del body: el `999` enviado se descarta.
- **10 y 11** → paginación con `LIMIT/OFFSET` y búsqueda dinámica con `LIKE`.
- **12, 13 y 14** → propiedad de datos: solo el dueño puede modificar o borrar; otro usuario autenticado recibe `403`.

### 4. Flujo alternativo con los usuarios sembrados

Sin registrar nada, se puede iniciar sesión con los usuarios que crea `init.sql` (ver *Usuarios sembrados*):

1. `POST {{baseUrl}}/login` con `{"email":"juan.perez@email.com","password":"admin123"}` → guardar el token como `token1`.
2. `POST {{baseUrl}}/login` con `{"email":"maria.gomez@email.com","password":"editor123"}` → guardar el token como `token2`.
3. `PUT {{baseUrl}}/publicaciones/2` (publicación de Juan) con `{{token2}}` → **403**; con `{{token1}}` → **200**.

### 5. Repetir las pruebas desde cero

Los registros 02 y 03 usan emails únicos: si se ejecutan por segunda vez la base responde con error porque esos emails ya existen. Para volver al estado inicial (4 usuarios y 4 publicaciones sembrados):

```bash
docker compose down -v   # borra el volumen de la base
docker compose up -d     # vuelve a ejecutar init.sql
```

Después de reiniciar la base hay que volver a correr las requests **04 y 05** para obtener tokens nuevos.

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
| POST   | `/api/publicaciones`     | Sí        | Crea una publicación. El `autor_id` se ignora si viene en el body: se inyecta desde `req.usuario.id`. Responde `201` con `{ message, id }` (el `id` generado). |
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
