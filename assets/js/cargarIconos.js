//Script para cargar los iconos dentro del DOM de forma oculta
fetch('iconos.svg')
.then(response => response.text())
.then(data => {
const spriteContainer = document.getElementById('svg-sprite');
spriteContainer.innerHTML = data;
})
.catch(error => {
console.error('Error cargando los íconos SVG:', error);
});