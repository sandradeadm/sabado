const service = require("../service/auth.service.js");

async function login(req, res) {
  try {
    const { usuario, password } = req.body;
    
    const result = await service.login(usuario, password, req.ip);
    console.log(result);
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

async function registrar(req, res) {
  try {
    const user = req.body;
    res.json(await service.registrar(user));
  } catch (err) {
    console.error('Error en registrar:', err);
    res.status(500).json({ error: err.message });
  }
};

async function cambiarPassword(req, res) {
  try {
    const { nuevaPassword } = req.body;   

    await service.cambiarPassword(nuevaPassword, req.params.id);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error en cambiar-password:', err);
    res.status(500).send('Error cambiando la contraseña');
  }
};

module.exports = {
  login,
  registrar,
  cambiarPassword
};