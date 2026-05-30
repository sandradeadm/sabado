const service = require("../service/usuarios.service.js");


async function listarUsuarios(req, res) {
  try {
    const result = await service.listarUsuarios(req.query);
    res.json(result);
  } catch (err) {
    console.error('Error en listarUsuarios:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Error interno del servidor'
    });
  }
}

 async function obtenerUsuario(req, res){
  try {
    const result = await service.obtenerUsuario(req.user.id_usuario);
    res.json(result);
  } catch (error) {
    console.error('Error en obtenerUsuario:', error);
    res.status(500).json({
      error: error.message || 'Error interno del servidor'
    });
  }
}

// Controlador para obtener los grupos de usuarios

async function grupos(req, res) {
  try {
    const result = await service.grupos();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function roles(req, res) {
  try {
    const result  = await service.roles();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cambiarGrupo(req, res) {
  try {
    const { nuevoGrupo } = req.body;  
    await service.cambiarGrupo(req.params.id, nuevoGrupo);
    res.json({ success: true, message: 'Grupo cambiado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cambiarRol(req, res) {
  try {
    const { nuevoRol } = req.body;  
    await service.cambiarRol(req.params.id, nuevoRol);
    res.json({ success: true, message: 'Rol cambiado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cargarUsuariosPorRol(req, res) {
  try {
    const result = await service.cargarUsuariosPorRol();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


//funciones para estado de usuario

async function deshabilitarUsuario(req, res) {
  try {
    await service.deshabilitarUsuario(req.params.id);
    res.json({ success: true, message: 'Usuario deshabilitado exitosamente' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
}

async function habilitarUsuario(req, res) {
  try {
    await service.habilitarUsuario(req.params.id);
    res.json({ success: true, message: 'Usuario habilitado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//no se usa pero la deje igual por las dudas, atte ERIC :)
async function bloquearUsuario(req, res) {
   try {
    await service.bloquearUsuario(req.params.id, req.params.intentos);
    res.json({ success: true, message: 'Usuario bloqueado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function desbloquearUsuario(req, res) {
  try {
    await service.desbloquearUsuario(req.params.id);
    res.json({ success: true, message: 'Usuario desbloqueado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}




module.exports = {
  grupos, 
  roles,
  cargarUsuariosPorRol,
  listarUsuarios,
  deshabilitarUsuario,
  habilitarUsuario,
  desbloquearUsuario,
  cambiarGrupo,
  cambiarRol,
  obtenerUsuario
};
