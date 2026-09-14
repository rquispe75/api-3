require ('dotenv').config();
const express = require('express');
const cors = require('cors');

//Ejecuta la conexion a la base de datos
require('./src/config/db');

const app = express();
app .use(cors());
app .use(express.json());
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

app.use('/api', require('./src/routes/usuarioRoutes'));
app.use('/api', require('./src/routes/rolRoutes'));
app.use('/api', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/publicacionRoutes'));