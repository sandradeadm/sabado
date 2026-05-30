function formatearDNI(dni) {
    return Number(dni).toLocaleString("es-AR");
}

async function cargarPerfil() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetchWithAuth('/usuarios/me', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },

                });

        if (!res.ok) {
            throw new Error("No se pudo obtener el perfil");
        }

        const usuario = await res.json();
        document.getElementById("idUsuario").textContent = usuario.id_usuario;
        document.getElementById("grupo").textContent = usuario.grupo;

        document.getElementById("nombre").textContent = usuario.nombre;
        document.getElementById("dni").textContent = formatearDNI(usuario.dni);
        document.getElementById("rol").textContent = usuario.rol;
        document.getElementById("grupo").textContent = usuario.grupo;

    } catch (error) {
        console.error(error);
    }
}

cargarPerfil();
