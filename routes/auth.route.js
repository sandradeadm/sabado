const express = require('express');
const router = express.Router();
const controller = require('../controller/auth.controller.js');
const milddleware = require('../middleware/usuarios.milddleware.js');

router.post('/login',
  controller.login
);

router.post(
  '/registrar',
  milddleware.validarDatos,
  milddleware.passwordValidator,
  milddleware.validarErrores,
  controller.registrar
);

router.put(
  '/:id/cambiar-password',
  milddleware.validarNuevaContraseña,
  milddleware.validarErrores,
  controller.cambiarPassword
);

router.get('/logout', async (req,res) =>{
   res.sendStatus(200);
});

module.exports = router;