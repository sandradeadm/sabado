// ========== FUNCIONALIDAD DE PAGINACIÓN Y BÚSQUEDA ==========

// ========== CARGAR USUARIOS Y COMPLETAR TABLA ==========
// Obtener la lista de usuarios del backend y rellenar la tabla principal
// Aplicar paginación, buscar y mostrar el estado de cada usuario
async function cargarUsuarios() {
    const res = await fetchWithAuth(`/usuarios?search=${encodeURIComponent(search)}&page=${pagina}&limit=${limite}`);
    const data = await res.json();
    const tbody = document.getElementById('usuariosBody');
    tbody.innerHTML = "";
    data.usuarios.forEach((u, idx) => {
        let estados = [];
        if (u.deshabilitado) estados.push('Deshabilitado');
        else estados.push('Habilitado');
        if (u.bloqueado) estados.push('Bloqueado');
        const estadosStr = estados.join(' / ');
        const zebra = idx % 2 === 0 ? 'bg-white' : 'bg-blue-50';

        tbody.innerHTML += `
            <tr class="${zebra}">
                <td class="px-4 py-2">${u.id_usuario}</td>
                <td class="px-4 py-2">${u.nombre}</td>
                <td class="px-4 py-2">
                    <div class="flex items-center gap-2">
                        <input type="password" readonly value="${u.pass}" class="bg-transparent focus:outline-none w-24" id="pass-${u.id_usuario}">
                        <button onclick="verPass('${u.id_usuario}')" class="hover:bg-gray-100 rounded-full p-1" title="Ver contraseña">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542 7z"/>
                            </svg>
                        </button>
                    </div>
                </td>
                <td class="px-4 py-2">${u.dni}</td>
                <td class="px-4 py-2">${u.rol}</td>
                <td class="px-4 py-2">${u.grupo}</td>
                <td class="px-4 py-2">${estadosStr}</td>
                <td class="px-4 py-2 text-center">
                    <button onclick="abrirModalAccionUsuario(${u.id_usuario}, '${u.nombre}', ${u.bloqueado}, ${u.deshabilitado})"
                        class="hover:bg-blue-100 p-2 rounded-full border border-blue-200" title="Opciones">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="3" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11.25 2.25c.38 0 .7.28.74.65l.01.1v.98c1.11.1 2.16.42 3.11.92l.7-.7a.75.75 0 0 1 1.13.98l-.07.08-.7.7a8.25 8.25 0 0 1 1.84 3.11l.98-.01a.75.75 0 0 1 .1 1.49l-.1.01-.98.01c-.1 1.11-.42 2.16-.92 3.11l.7.7a.75.75 0 0 1-.98 1.13l-.08-.07-.7-.7a8.25 8.25 0 0 1-3.11 1.84l.01.98a.75.75 0 0 1-1.49.1l-.01-.1-.01-.98a8.25 8.25 0 0 1-3.11-.92l-.7.7a.75.75 0 0 1-1.13-.98l.07-.08.7-.7a8.25 8.25 0 0 1-1.84-3.11l-.98.01a.75.75 0 0 1-.1-1.49l.1-.01.98-.01c.1-1.11.42-2.16.92-3.11l-.7-.7a.75.75 0 0 1 .98-1.13l.08.07.7.7a8.25 8.25 0 0 1 3.11-1.84l-.01-.98A.75.75 0 0 1 11.25 2.25z" />
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });

    // Mostrar el rango de usuarios y el total en la paginación
    const paginacionInfo = document.getElementById('paginacionInfo');
    const inicio = (pagina - 1) * limite + 1;
    const fin = Math.min(pagina * limite, data.total);
    paginacionInfo.textContent = `Mostrando ${inicio} a ${fin} de ${data.total} usuarios`;

    // Habilitar o deshabilitar los botones de paginación según corresponda
    document.getElementById('prevBtn').disabled = pagina === 1;
    document.getElementById('nextBtn').disabled = pagina * limite >= data.total;
}

// ========== USUARIOS POR ROL ==========
// Obtener el número de usuarios por rol y mostrarlo en insignias
async function cargarUsuariosPorRol() {
    const res = await fetchWithAuth('/usuarios/usuarios-por-rol');
    const data = await res.json();
    const contenedor = document.getElementById('usuariosPorRolContainer');
    contenedor.innerHTML = '';

    // Paleta de colores para insignias, se pueden agregar más si hay más roles
    const colores = [
        'bg-red-100 text-red-800',
        'bg-green-100 text-green-800',
        'bg-blue-100 text-blue-800',
        'bg-purple-100 text-purple-800',
        'bg-pink-100 text-pink-800',
        'bg-yellow-100 text-yellow-800',
        'bg-gray-100 text-gray-800'
    ];

    data.forEach((rol, idx) => {
        contenedor.innerHTML += `
            <div class="flex justify-between items-center">
                <span class="text-gray-600">${rol.nombre}:</span>
                <span class="font-semibold px-2 py-1 rounded ${colores[idx % colores.length]}">${rol.cantidad}</span>
            </div>
        `;
    });
}

// ========== PAGINACIÓN Y ACCIONES DE BÚSQUEDA ==========
// Botón de búsqueda y paginación para la tabla principal de usuarios
document.getElementById('buscarBtn').onclick = function() {
    search = document.getElementById('buscador').value;
    pagina = 1;
    cargarUsuarios();
};

document.getElementById('limite').onchange = function() {
    limite = parseInt(this.value);
    pagina = 1;
    cargarUsuarios();
};

document.getElementById('prevBtn').onclick = function() {
    if (pagina > 1) {
        pagina--;
        cargarUsuarios();
    }
};

document.getElementById('nextBtn').onclick = function() {
    pagina++;
    cargarUsuarios();
};
