const { Pool } = require('pg');
require('dotenv').config();

const poolDatos = new Pool({
  user: process.env.DB_DATOS_USER,
  host: process.env.DB_DATOS_HOST,
  database: process.env.DB_DATOS_NAME,
  password: process.env.DB_DATOS_PASS,
  port: process.env.DB_DATOS_PORT || 5432,
});


module.exports = poolDatos;