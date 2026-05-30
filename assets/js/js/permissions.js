// =========== ADMINISTRACIÓN DE PERMISOS Y ROLES ==========

// ========== ADMINISTRAR PERMISOS ==========
// Mostrar ventana modal para buscar usuarios y cambiar sus roles
function abrirModalGestionarPermisos() {
    document.getElementById('modalGestionarPermisos').style.display = 'flex';
    document.getElementById('buscarUsuarioPermisos').value = '';
    document.getElementById('selectUsuarioPermisos').innerHTML = '';
    document.getElementById('rolActualPermisos').classList.add('hidden');
    document.getElementById('cambiarRolPermisos').classList.add('hidden');
    document.getElementById('btnGuardarRolPermisos').classList.add('hidden');
    usuariosBusquedaPermisos = [];
    usuarioSeleccionadoPermisos = null;
}

function cerrarModalGestionarPermisos() {
    document.getElementById('modalGestionarPermisos').style.display = 'none';
}

// Buscar usuarios por nombre/DNI para permisos modal
function buscarUsuarioParaPermiso() {
    const query = document.getElementById('buscarUsuarioPermisos').value.trim();
    if (query.length < 2) {
        document.getElementById('selectUsuarioPermisos').innerHTML = '';
        document.getElementById('rolActualPermisos').classList.add('hidden');
        document.getElementById('cambiarRolPermisos').classList.add('hidden');
        document.getElementById('btnGuardarRolPermisos').classList.add('hidden');
        return;
    }
    fetchWithAuth(`/usuarios?search=${encodeURIComponent(query)}&page=1&limit=10`)
        .then(res => res.json())
        .then(data => {
            usuariosBusquedaPermisos = data.usuarios;
            const select = document.getElementById('selectUsuarioPermisos');
            select.innerHTML = '';
            usuariosBusquedaPermisos.forEach(u => {
                select.innerHTML += `<option value="${u.id_usuario}">${u.nombre} (${u.dni})</option>`;
            });
            document.getElementById('rolActualPermisos').classList.add('hidden');
            document.getElementById('cambiarRolPermisos').classList.add('hidden');
            document.getElementById('btnGuardarRolPermisos').classList.add('hidden');
        });
}

// Cargar el rol del usuario actual y los posibles nuevos roles
function cargarRolActualUsuario() {
    const select = document.getElementById('selectUsuarioPermisos');
    const userId = select.value;
    if (!userId) {
        document.getElementById('rolActualPermisos').classList.add('hidden');
        document.getElementById('cambiarRolPermisos').classList.add('hidden');
        document.getElementById('btnGuardarRolPermisos').classList.add('hidden');
        usuarioSeleccionadoPermisos = null;
        return;
    }
    usuarioSeleccionadoPermisos = usuariosBusquedaPermisos.find(u => u.id_usuario == userId);
    document.getElementById('rolActualPermisos').classList.remove('hidden');
    document.getElementById('inputRolActualPermisos').value = usuarioSeleccionadoPermisos.rol || '';
    fetchWithAuth('/usuarios/roles')
    .then(res => res.json())
    .then(roles => {
        const selectRol = document.getElementById('selectNuevoRolPermisos');
        selectRol.innerHTML = '';
        roles.forEach(r => {
            selectRol.innerHTML += `<option value="${r.id_rol}" ${usuarioSeleccionadoPermisos.id_rol == r.id_rol ? 'selected' : ''}>${r.nombre}</option>`;
        });
        document.getElementById('cambiarRolPermisos').classList.remove('hidden');
        document.getElementById('btnGuardarRolPermisos').classList.remove('hidden');
    });
}

// CAMBIO DE ROL - Guardar el nuevo rol seleccionado para el usuario
function guardarNuevoRolPermisos() {
    if (!usuarioSeleccionadoPermisos) return;
    const btn = document.getElementById('btnGuardarRolPermisos');
    btn.disabled = true;
    btn.textContent = "Guardando...";
    const nuevoRol = document.getElementById('selectNuevoRolPermisos').value;
    const nombreRol = document.getElementById('selectNuevoRolPermisos').selectedOptions[0].textContent;
    if (nuevoRol == usuarioSeleccionadoPermisos.id_rol) {
        alert('El usuario ya tiene ese rol.');
        btn.disabled = false;
        btn.textContent = "Guardar cambio de rol";
        return;
    }
    fetchWithAuth(`/usuarios/${usuarioSeleccionadoPermisos.id_usuario}/cambiar-rol`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nuevoRol })
    })
    .then(res => {
        if (res.ok) {
            alert('Rol cambiado correctamente');
            registrarLog(
                9, // ID de operación de cambio de rol
                `El usuario ${usuario.nombre} cambió el rol del usuario (${usuarioSeleccionadoPermisos.nombre}) al rol ${nombreRol}`,
                usuarioSeleccionadoPermisos.nombre
            );
            cerrarModalGestionarPermisos();
            cargarUsuarios && cargarUsuarios();
            if (typeof cargarUsuariosPorRol === "function") cargarUsuariosPorRol();
        } else {
            res.text().then(txt => alert('Error: ' + txt));
        }
        btn.disabled = false;
        btn.textContent = "Guardar cambio de rol";
    })
    .catch(() => {
        alert('Error de red o servidor. Intente nuevamente.');
        btn.disabled = false;
        btn.textContent = "Guardar cambio de rol";
    });
}

// ========== ADMINISTRAR GRUPOS ==========
// Modal para buscar usuarios y cambiar sus grupos
function abrirModalGestionarGrupos() {
    document.getElementById('modalGestionarGrupos').style.display = 'flex';
    document.getElementById('buscarUsuarioGrupos').value = '';
    document.getElementById('selectUsuarioGrupos').innerHTML = '';
    document.getElementById('grupoActualGrupos').classList.add('hidden');
    document.getElementById('cambiarGrupoGrupos').classList.add('hidden');
    document.getElementById('btnGuardarGrupoGrupos').classList.add('hidden');
    usuariosBusquedaGrupos = [];
    usuarioSeleccionadoGrupos = null;
}

function cerrarModalGestionarGrupos() {
    document.getElementById('modalGestionarGrupos').style.display = 'none';
}

// Buscar usuarios para grupos modal
function buscarUsuarioParaGrupo() {
    const query = document.getElementById('buscarUsuarioGrupos').value.trim();
    if (query.length < 2) {
        document.getElementById('selectUsuarioGrupos').innerHTML = '';
        document.getElementById('grupoActualGrupos').classList.add('hidden');
        document.getElementById('cambiarGrupoGrupos').classList.add('hidden');
        document.getElementById('btnGuardarGrupoGrupos').classList.add('hidden');
        return;
    }
    fetchWithAuth(`/usuarios?search=${encodeURIComponent(query)}&page=1&limit=10`)
        .then(res => res.json())
        .then(data => {
            usuariosBusquedaGrupos = data.usuarios;
            const select = document.getElementById('selectUsuarioGrupos');
            select.innerHTML = '';
            usuariosBusquedaGrupos.forEach(u => {
                select.innerHTML += `<option value="${u.id_usuario}">${u.nombre} (${u.dni})</option>`;
            });
            document.getElementById('grupoActualGrupos').classList.add('hidden');
            document.getElementById('cambiarGrupoGrupos').classList.add('hidden');
            document.getElementById('btnGuardarGrupoGrupos').classList.add('hidden');
        });
}

// Cargar el grupo de usuarios actual y posibles nuevos grupos
function cargarGrupoActualUsuario() {
    const select = document.getElementById('selectUsuarioGrupos');
    const userId = select.value;
    if (!userId) {
        document.getElementById('grupoActualGrupos').classList.add('hidden');
        document.getElementById('cambiarGrupoGrupos').classList.add('hidden');
        document.getElementById('btnGuardarGrupoGrupos').classList.add('hidden');
        usuarioSeleccionadoGrupos = null;
        return;
    }
    usuarioSeleccionadoGrupos = usuariosBusquedaGrupos.find(u => u.id_usuario == userId);
    document.getElementById('grupoActualGrupos').classList.remove('hidden');
    document.getElementById('inputGrupoActualGrupos').value = usuarioSeleccionadoGrupos.grupo || '';
    fetchWithAuth('/usuarios/grupos')
    .then(res => res.json())
    .then(grupos => {
        const selectGrupo = document.getElementById('selectNuevoGrupoGrupos');
        selectGrupo.innerHTML = '';
        grupos.forEach(g => {
            selectGrupo.innerHTML += `<option value="${g.id_grupo}" ${usuarioSeleccionadoGrupos.id_grupo == g.id_grupo ? 'selected' : ''}>${g.nombre}</option>`;
        });
        document.getElementById('cambiarGrupoGrupos').classList.remove('hidden');
        document.getElementById('btnGuardarGrupoGrupos').classList.remove('hidden');
    });
}

// Guardar nuevo grupo seleccionado para el usuario
function guardarNuevoGrupoGrupos() {
    if (!usuarioSeleccionadoGrupos) return;
    const btn = document.getElementById('btnGuardarGrupoGrupos');
    btn.disabled = true;
    btn.textContent = "Guardando...";
    const nuevoGrupo = document.getElementById('selectNuevoGrupoGrupos').value;
    const nombreGrupo = document.getElementById('selectNuevoGrupoGrupos').selectedOptions[0].textContent;
    if (nuevoGrupo == usuarioSeleccionadoGrupos.id_grupo) {
        alert('El usuario ya está en ese grupo.');
        btn.disabled = false;
        btn.textContent = "Guardar cambio de grupo";
        return;
    }
    fetchWithAuth(`/usuarios/${usuarioSeleccionadoGrupos.id_usuario}/cambiar-grupo`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nuevoGrupo })
    })
    .then(res => {
        if (res.ok) {
            alert('Grupo cambiado correctamente');
            registrarLog(
                10, 
                `El usuario ${usuario.nombre} cambió el grupo del usuario (${usuarioSeleccionadoGrupos.nombre}) al grupo ${nombreGrupo}`,
                usuarioSeleccionadoGrupos.nombre
            );
            cerrarModalGestionarGrupos();
            cargarUsuarios && cargarUsuarios();
        } else {
            res.text().then(txt => alert('Error: ' + txt));
        }
        btn.disabled = false;
        btn.textContent = "Guardar cambio de grupo";
    })
    .catch(() => {
        alert('Error de red o servidor. Intente nuevamente.');
        btn.disabled = false;
        btn.textContent = "Guardar cambio de grupo";
    });
}
