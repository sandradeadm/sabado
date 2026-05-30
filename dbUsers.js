const { Pool } = require('pg');
require('dotenv').config();

const poolUsuarios = new Pool({
  user: process.env.DB_USUARIOS_USER,
  host: process.env.DB_USUARIOS_HOST,
  database: process.env.DB_USUARIOS_NAME,
  password: process.env.DB_USUARIOS_PASS,
  port: process.env.DB_USUARIOS_PORT || 5432,
});


module.exports = poolUsuarios;