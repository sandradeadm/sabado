// =========================
// Mostrar/Ocultar contraseña
// =========================
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleButton = document.querySelector(".toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleButton.textContent = "Ocultar";
  } else {
    passwordInput.type = "password";
    toggleButton.textContent = "Mostrar";
  }
}

// =========================
// Cargar vistas en el iframe
// =========================
function cargarVista(pagina) {
  const iframe = document.getElementById("contenido");

  // Saca clases de animación si las tiene
  iframe.classList.remove("fade");
  iframe.classList.add("fade-out");

  localStorage.setItem("vistaActual", pagina);

  // Espera al fade-out y cambia el contenido
  setTimeout(() => {
    iframe.src = `views/${pagina}`;
    iframe.classList.remove("fade-out");
    iframe.classList.add("fade"); // fade-in
  }, 200); // debe coincidir con duración en CSS
}

// =========================
// Ajuste dinámico del iframe
// =========================
const iframe = document.getElementById("contenido");

// Función robusta para medir y aplicar altura
function medirYAplicarAltura() {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return;

    const body = doc.body;
    const html = doc.documentElement;
    const altura = Math.max(
      body?.scrollHeight || 0,
      body?.offsetHeight || 0,
      html?.scrollHeight || 0,
      html?.offsetHeight || 0
    );

    // Guarda scroll actual para no saltar al inicio
    const posScroll = window.scrollY;
    iframe.style.height = altura + "px";
    window.scrollTo(0, posScroll);

  } catch (e) {
    console.warn("No se pudo medir altura del iframe:", e);
  }
}

// Bandera para primera carga
let primeraCarga = true;

iframe.addEventListener("load", () => {
  // Evita reset de animación en la primera carga
  if (!primeraCarga) {
    iframe.classList.remove("fade");
    void iframe.offsetWidth; // fuerza reflow
    iframe.classList.add("fade");
  }
  primeraCarga = false;

  // 🔹 Ajuste inicial retardado para evitar salto
  setTimeout(medirYAplicarAltura, 100);

  // 🔹 Burst inicial de ajustes mientras se estabiliza el contenido
  let repeticiones = 0;
  const intervaloBurst = setInterval(() => {
    medirYAplicarAltura();
    repeticiones++;
    if (repeticiones > 5) clearInterval(intervaloBurst); // ~1 segundo
  }, 200);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  if (doc) {
    // Reajustar cuando se carguen fuentes
    if (doc.fonts?.ready) doc.fonts.ready.then(medirYAplicarAltura);

    // Reajustar cuando carguen imágenes
    Array.from(doc.images || []).forEach(img => {
      img.addEventListener("load", medirYAplicarAltura, { passive: true });
    });
  }
});

// =========================
// Escucha mensajes desde las vistas
// =========================
window.addEventListener("message", (event) => {
  if (event.data?.tipo === "ajustarAltura" && typeof event.data.altura === "number") {
    const posScroll = window.scrollY;
    iframe.style.height = event.data.altura + "px";
    window.scrollTo(0, posScroll);
  }
});

// =========================
// Restaurar última vista
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const ultimaVista = localStorage.getItem("vistaActual") || "inicio.html";
  document.getElementById("contenido").src = `views/${ultimaVista}`;
});

// =========================
// Cargar íconos SVG
// =========================
fetch('/assets/icons/iconos.svg')
  .then(res => res.text())
  .then(data => {
    document.getElementById('svg-sprite').innerHTML = data;
  });
