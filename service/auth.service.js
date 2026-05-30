const repo = require('../repositories/auth.repository.js');
const { bloquearUsuario } = require('../repositories/usuarios.repository.js');
const { registrarLog } = require('../repositories/logs.repository.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

function generarToken(user) {
  const payload = {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    rol: user.rol,
    id_rol: user.id_rol,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

usuarioDelEstado = async (user) => {
  if (user.deshabilitado) {
    await registrarLog(2, user.id_usuario, 'Intento de login usuario deshabilitado');
        throw new Error("Usuario desabilitado");

  }

  if (user.bloqueado) {
    await registrarLog(3, user.id_usuario, 'Intento de login de usuario bloqueado');
    throw new Error("Usuario bloqueado");
    
  }

}

async function login(usuario, password) {
  const fechaActual = new Date();

  const result = await repo.encontrarPorUsuariODni(usuario);
  const user = result[0];

  if (!user) {
        throw new Error("Usuario inexistente");

  }

  await usuarioDelEstado(user);

  
  const esPasswordValida = await bcrypt.compare(password, user.pass);
  
  if (!esPasswordValida ) {
    // console.log(' incorrecta la contraseña');

    const sessionIntentos = user.intentos + 1;

    if (sessionIntentos >= 3) {

      await bloquearUsuario(user.id_usuario, sessionIntentos);
      await registrarLog(5, user.id_usuario, 'Usuario bloqueado por intentos fallidos');
          throw new Error("Usuario bloqueado");

    }

    await repo.incrementarIntentos(user.id_usuario, sessionIntentos);
    await registrarLog(4, user.id_usuario, 'contraseña incorrecta');

    // return { success: false, message:``} 
    throw new Error(`contraseña incorrecta intentos: ${sessionIntentos}`);

  }

  await repo.resetIntentos(user.id_usuario);
  await registrarLog(1, user.id_usuario, 'Login exitoso!!');


  const passHist = await repo.obtenerPassHist(user.id_usuario);

  const token = generarToken(user);
  // console.log('Token generado:', token, user);
  
  return {
    success: true,
    token,
    user: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      rol: user.rol,
    },
  };
}

async function registrar(user) {

  
  const siExisteDni = await repo.existeDni(user.dni);

  if (siExisteDni.length > 0) throw new Error("El dni ya esta asociado a una cuenta");
  
  const passwordHash = await bcrypt.hash(user.password, 10);
  user.password = passwordHash;

  const crearUser = await repo.crearUsuario(user);

  const id = crearUser.rows[0].id_usuario;
  await repo.insertarPassHisto(id, user.password);
  await registrarLog(4, id, 'usuario fue creado');

  return  `ID: ${crearUser.rows[0].id_usuario},  ${crearUser.rows[0].nombre} ${crearUser.rows[0].apellido} fue creado con exito` ; 

}

async function cambiarPassword(nuevaPassword, id) {
  const passHist = await repo.obtenerPassHist(id);
  if (passHist.rows.length > 0) {
    const ultimaPassword = passHist.rows[0].pass_ult;
    if (nuevaPassword === ultimaPassword) {
      throw new Error('PASSWORD_REPETIDA');
    }
  }
  console.log('service', nuevaPassword, id);

  await repo.cambiarPassword(nuevaPassword, id);
  await repo.insertarPassHisto(id, nuevaPassword);
}



module.exports = {
  login,
  registrar,
  cambiarPassword,
};

//TODO - agregar logs a cada paso importante del proceso de login y registro (ej: intentos fallidos, bloqueos, cambios de contraseña)

// let requiereCambioPassword = false;
//   const seisMesesMs = 6 * 30 * 24 * 60 * 60 * 1000;

//   if (passHist.rows.length > 0) {
//     const fechaUltimoCambio = new Date(passHist.rows[0].fecha_cambio);
//     if (fechaActual - fechaUltimoCambio > seisMesesMs) {
//       requiereCambioPassword = true;
//     }
//   } else {
//     requiereCambioPassword = true;
//   }

//   //si requiereCambioPassword es verdad 
//   if (requiereCambioPassword) {
//     return {
//       success: false,
//       message: 'La contraseña ha expirado. Debe cambiarla.',
//       requiereCambioPassword: true,
//       user: { id_usuario: user.id_usuario, nombre: user.nombre, rol: user.rol }
//     }
//   }
//   //si todo esta correcto seguimos con el flujo normal.
//   return {
//     success: true,
//     user: {
//       id_usuario: user.id_usuario,
//       nombre: user.nombre,
//       rol: user.rol
//     }
//   };
