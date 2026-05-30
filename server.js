const app = require('./app').app;

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto http://localhost:${PORT}`);
});