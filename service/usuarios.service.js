const repo = require('../repositories/usuarios.repository.js');
const { registrarLog } = require('../repositories/logs.repository.js');

 async function obtenerUsuario(id) {
  const result = await repo.obtenerUsuario(id);
  return result;
}

async function roles() {
  const result = await repo.obtenerRoles();
  return result;
}

async function grupos() {
  const result = await repo.obtenerGrupos();
  return result;
}

async function habilitarUsuario(id) {
    await repo.habilitarUsuario(id);
}

async function deshabilitarUsuario(id) {
  await repo.deshabilitarUsuario(id);  
}

async function desbloquearUsuario(id) {
  await repo.desbloquearUsuario(id);
}

async function bloquearUsuario(id, intentos) {
  await repo.bloquearUsuario(id, intentos);
}

async function cambiarGrupo(id, id_grupo) {
  await repo.cambiarGrupo(id, id_grupo);
}

async function cambiarRol(id, id_rol){
  await repo.cambiarRol(id, id_rol);
}  

async function cargarUsuariosPorRol() {
  const result = await repo.obtenerUsuariosPorRol();
  return result;
}

function normalizarPaginacion({ page, limit }) {
  const MAX_LIMIT = 50;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    MAX_LIMIT
  );

  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
}

function procesarBusqueda(search) {
  if (!search) return null;

  const value = search.trim();
  if (!value) return null;

  if (/^\d+$/.test(value)) {
    return { type: 'dni', value };
  }

  return { type: 'nombre', value };
}

async function listarUsuarios(query) {
  const { page, limit, offset } = normalizarPaginacion(query);
  const search = procesarBusqueda(query.search);

  const { usuarios, total } =
    await repo.listarUsuarios({
      search,
      limit,
      offset
    });

  return {
    usuarios: usuarios,
    total: total
  };
}

module.exports = {
  // login,
  // registrar,
  grupos,
  roles,
  cargarUsuariosPorRol,
  listarUsuarios,

  habilitarUsuario,
  deshabilitarUsuario,
  desbloquearUsuario,
  cambiarGrupo,
  cambiarRol,
  // cambiarPassword
  obtenerUsuario

};
