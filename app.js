require('dotenv').config();
const logsRouter = require('./routes/logs.routes');
const usuariosRouter = require('./routes/usuarios.routes');
const alumnosRouter = require('./routes/alumnos.routes');
const materiasRouter = require('./routes/materias.route');
const cursosRouter = require('./routes/cursos.routes');
const planesRouter = require('./routes_old/planes');
const tutoresRouter = require('./routes/tutor.route');
const authRouter = require('./routes/auth.route');
const frontendRouter = require('./routes/frontend.route');
const profeRouter = require('./routes/profe.routes');
const authmilddleware  = require('./middleware/auth.middleware.js');
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Ruta de autenticación SIN protección
app.use('/api/auth', authRouter);

// Protege todas las rutas /api (excepto /api/auth que ya pasó)
app.use('/api', authmilddleware.authenticateToken);

app.use(function(req, res, next) {
  if (!req.user) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  }
  next();
});

// Archivos estáticos
app.use('/css', express.static('assets/css'));
app.use('/assets', express.static('assets'));
app.use('/views', express.static('views'));
app.use('/services', express.static('services'));

// Ruta para servir index.html
app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'index.html'))});
app.get('/login.html', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'login.html'))});

// Rutas de la app
app.use('/api/tutores',  tutoresRouter);
app.use('/api/planes',  planesRouter);
app.use('/api/cursos',  cursosRouter);
app.use('/api/materias',  materiasRouter);
app.use('/api/alumnos',  alumnosRouter);
app.use('/api/usuarios',  usuariosRouter);
app.use('/api/logs',  logsRouter);
app.use('/api/frontend', frontendRouter);
app.use('/api/profesores',  profeRouter);

// authmilddleware.estaAutorizado('Supervisor'),
// authmilddleware.estaAutorizado('Supervisor'),
// authmilddleware.estaAutorizado('Supervisor'),
// authmilddleware.estaAutorizado('Supervisor'),
// authmilddleware.estaAutorizado('Supervisor'),
// authmilddleware.estaAutorizado('Supervisor'),

module.exports = {app};
