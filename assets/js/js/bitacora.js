document.addEventListener('DOMContentLoaded', function() {
    // ========== RESTRICCIÓN DE ACCESO POR ROL ==========
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
        window.location.href = "Login.html";
        return;
    } else {
        const usuario = JSON.parse(usuarioStr);
        const rol = usuario.rol ? usuario.rol.toLowerCase() : "";
        if (rol !== "administrador" && rol !== "soporte") {
            alert("Acceso restringido. Solo Administradores y Soporte pueden acceder.");
            window.location.href = "inicio.html";
            return;
        }
    }

    // ========== PAGINACIÓN Y FILTROS DE LOGS ==========
    let paginaLog = 1;
    let limiteLog = 10;
    let search = "";
    let fechaInicio = "";
    let fechaFin = "";

    // Elementos
    const cantidadLogs = document.getElementById('cantidadLogs');
    const buscador = document.getElementById('buscador');
    const fechaInicioElem = document.getElementById('fechaInicio');
    const fechaFinElem = document.getElementById('fechaFin');
    const btnBuscarLogs = document.getElementById('btnBuscarLogs');
    const prevLogBtn = document.getElementById('prevLogBtn');
    const nextLogBtn = document.getElementById('nextLogBtn');
    const paginacionLogsInfo = document.getElementById('paginacionLogsInfo');
    const tablaBitacoraBody = document.querySelector("#tablaBitacora tbody");
    const noDatos = document.getElementById('noDatos');

    // ========== EVENTOS ==========
    cantidadLogs.addEventListener('change', function() {
        limiteLog = parseInt(this.value);
        paginaLog = 1;
        cargarLogs();
    });

    buscador.addEventListener('input', function() {
        search = this.value;
        paginaLog = 1;
        cargarLogs();
    });

    fechaInicioElem.addEventListener('change', function() {
        fechaInicio = this.value;
    });
    fechaFinElem.addEventListener('change', function() {
        fechaFin = this.value;
    });

    btnBuscarLogs.addEventListener('click', function() {
        paginaLog = 1;
        cargarLogs();
    });

    prevLogBtn.addEventListener('click', function() {
        if (paginaLog > 1) {
            paginaLog--;
            cargarLogs();
        }
    });

    nextLogBtn.addEventListener('click', function() {
        paginaLog++;
        cargarLogs();
    });

    // ========== FUNCIÓN PRINCIPAL: CARGAR LOGS ==========
    async function cargarLogs() {
        let query = `?page=${paginaLog}&limit=${limiteLog}`;
        if (search) query += `&search=${encodeURIComponent(search)}`;
        if (fechaInicio) query += `&fechaInicio=${fechaInicio}`;
        if (fechaFin) query += `&fechaFin=${fechaFin}`;

        try {
            const res = await fetchWithAuth(`/logs${query}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            tablaBitacoraBody.innerHTML = "";
            if (data.logs && data.logs.length > 0) {
                noDatos.classList.add('hidden');
               data.logs.forEach(log => {
    const date = new Date(log.hora_y_fecha);
    const fechaLocal = date.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    tablaBitacoraBody.innerHTML += `
        <tr>
            <td class="px-4 py-2">${fechaLocal}</td>
            <td class="px-4 py-2">${log.usuario || ''}</td>
            <td class="px-4 py-2">${log.operacion || ''}</td>
            <td class="px-4 py-2">${log.detalle || ''}</td>
            <td class="px-4 py-2">${log.ip || ''}</td>
            <td class="px-4 py-2">${log.mac || ''}</td>
            <td class="px-4 py-2">${log.usuario_afectado || ''}</td>
        </tr>
    `;
});
                // PAGINACIÓN INFO
                const inicio = (paginaLog - 1) * limiteLog + 1;
                const fin = Math.min(paginaLog * limiteLog, data.total);
                paginacionLogsInfo.textContent = `Mostrando ${inicio} a ${fin} de ${data.total} logs`;

                prevLogBtn.disabled = paginaLog === 1;
                nextLogBtn.disabled = paginaLog * limiteLog >= data.total;
            } else {
                noDatos.classList.remove('hidden');
                paginacionLogsInfo.textContent = "No hay registros.";
                prevLogBtn.disabled = true;
                nextLogBtn.disabled = true;
            }
        } catch (err) {
            tablaBitacoraBody.innerHTML = '<tr><td colspan="7" class="text-center text-red-500 p-4">Error al cargar los logs</td></tr>';
        }
    }

    // CARGA INICIAL
    cargarLogs();
});
