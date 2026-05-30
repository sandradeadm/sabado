// ========== MODULO DE CREAR USUARIO ==========

// ========== FORMULARIO DE NUEVO USUARIO ==========
// Validar y enviar nuevos datos de usuario (y registrarlos en el registro de auditoría)
document.getElementById('formAgregarUsuario').addEventListener('submit', async function(event) {
    event.preventDefault();
    const btn = document.getElementById('btnAgregarUsuario');
    btn.disabled = true;
    btn.textContent = "Guardando...";

    // Obtener los valores del formulario, incluyendo los campos repetidos
    const nombre = document.getElementById('nombre').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const dni = document.getElementById('dni').value;
    const dni2 = document.getElementById('dni2').value;
    const id_rol = document.getElementById('rol').value;
    const id_grupo = document.getElementById('grupo').value;

    // VALIDACIÓN DE REPETIR CONTRASEÑA
    if (password !== password2) {
        alert('Las contraseñas no coinciden. Verifique ambas contraseñas.');
        btn.disabled = false;
        btn.textContent = "Agregar Usuario";
        return;
    }
    // VALIDACIÓN DE REPETIR DNI
    if (dni !== dni2) {
        alert('Los DNI no coinciden. Verifique ambos DNI.');
        btn.disabled = false;
        btn.textContent = "Agregar Usuario";
        return;
    }
    // VALIDACIÓN DE PASSWORD SEGURA
    if (!validarPassword(password)) {
        alert('La contraseña debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.');
        btn.disabled = false;
        btn.textContent = "Agregar Usuario";
        return;
    }

    const data = {
        nombre,
        password,
        dni,
        id_rol,
        id_grupo
    };

    try {
        const res = await fetchWithAuth('/usuarios', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (res.ok) {
            const usuarioCreado = await res.json();
            alert('Usuario agregado correctamente');
            // REGISTRO
            registrarLog(
                3,
                `El usuario ${usuario.nombre} dio de alta al usuario (${usuarioCreado.nombre})`,
                usuarioCreado.nombre
            );
            cerrarModalAgregarUsuario();
            cargarUsuarios && cargarUsuarios();
            if (typeof cargarUsuariosPorRol === "function") cargarUsuariosPorRol();
        } else {
            const txt = await res.text();
            alert('Error: ' + txt);
        }
    } catch (err) {
        alert('Error de red o servidor. Intente nuevamente.');
    }
    btn.disabled = false;
    btn.textContent = "Agregar Usuario";
});

// ========== AGREGAR MODAL DE USUARIO ==========
// Cargar roles y grupos disponibles

function abrirModalAgregarUsuario() {
    document.getElementById('modalAgregarUsuario').style.display = 'flex';
    cargarRolesYGrupos();
    const btn = document.getElementById('btnAgregarUsuario');
    btn.disabled = false;
    btn.textContent = "Agregar Usuario";
}

function cerrarModalAgregarUsuario() {
    document.getElementById('modalAgregarUsuario').style.display = 'none';
    document.getElementById('formAgregarUsuario').reset();
    const btn = document.getElementById('btnAgregarUsuario');
    btn.disabled = false;
    btn.textContent = "Agregar Usuario";
}

function cargarRolesYGrupos() {
    const selectRol = document.getElementById('rol');
    const selectGrupo = document.getElementById('grupo');
    selectRol.innerHTML = "<option disabled selected>Cargando...</option>";
    selectGrupo.innerHTML = "<option disabled selected>Cargando...</option>";

    fetchWithAuth('/usuarios/roles')
    .then(res => res.json())
    .then(roles => {
        selectRol.innerHTML = "";
        roles.forEach(r => {
            selectRol.innerHTML += `<option value="${r.id_rol}">${r.nombre}</option>`;
        });
    });

    fetchWithAuth('/usuarios/grupos')
    .then(res => res.json())
    .then(grupos => {
        selectGrupo.innerHTML = "";
        grupos.forEach(g => {
            selectGrupo.innerHTML += `<option value="${g.id_grupo}">${g.nombre}</option>`;
        });
    });
}

// ========== FUNCIÓN DE VALIDACIÓN DE CONTRASEÑA SEGURA ==========
// Si no la tienes definida global, agrégala:
function validarPassword(password) {
    const minLength = 8;
    const maxLength = 16;
    if (typeof password !== 'string') return false;
    if (password.length < minLength || password.length > maxLength) return false;
    if (!/[A-Z]/.test(password)) return false; // al menos una mayúscula
    if (!/[a-z]/.test(password)) return false; // al menos una minúscula
    if (!/[0-9]/.test(password)) return false; // al menos un número
    if (!/[!@#$%^&*()_\-+=\[\]{};:,.<>|\/?]/.test(password)) return false; // al menos un especial
    return true;
}
