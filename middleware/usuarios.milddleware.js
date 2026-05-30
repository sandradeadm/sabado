const { body, validationResult } = require("express-validator");

const passwordValidator = body("password")
  .isLength({ min: 8, max: 16 })
  .withMessage("La contraseña debe tener entre 8 y 16 caracteres")
  .matches(/[A-Z]/)
  .withMessage("Debe contener al menos una mayúscula")
  .matches(/[a-z]/)
  .withMessage("Debe contener al menos una minúscula")
  .matches(/[0-9]/)
  .withMessage("Debe contener al menos un número")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Debe contener un carácter especial");

const validarDatos = [
  body("nombre").notEmpty().withMessage("Nombre requerido"),
  body("dni")
    .notEmpty()
    .withMessage("DNI requerido")
    .isNumeric()
    .withMessage("DNI inválido"),
  body("id_rol").isInt({ min: 1 }).withMessage("Rol inválido"),
  body("id_grupo").isInt({ min: 1 }).withMessage("Grupo inválido"),
];

const validarNuevaContraseña = [
  body("nuevaPassword").notEmpty().withMessage("Nueva contraseña requerida"),
];

const passwordValidatorContrseañaNueva = body("nuevaPassword")
  .isLength({ min: 8, max: 16 })
  .withMessage("La contraseña debe tener entre 8 y 16 caracteres")
  .matches(/[A-Z]/)
  .withMessage("Debe contener al menos una mayúscula")
  .matches(/[a-z]/)
  .withMessage("Debe contener al menos una minúscula")
  .matches(/[0-9]/)
  .withMessage("Debe contener al menos un número")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Debe contener un carácter especial");

const validarErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.message});
  }
  next();
};

module.exports = {
  passwordValidator,
  validarDatos,
  validarNuevaContraseña,
  passwordValidatorContrseañaNueva,
  validarErrores,
};
