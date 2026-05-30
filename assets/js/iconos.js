// Array con los IDs de los símbolos definidos
const iconIds = [
  'flecha-derecha', 'cruz', 'lupa', 'estrella', 'engranaje', 'mas', 'recargar', 'buscar', 'escudo', 'medalla', 
  'medalla-alt', 'configuracion', 'escudo-alt', 'estrella-alt', 'borrar', 'subir', 'usuario-accion', 'usuario', 'usuarios', 'usuarios-alt',
];

const container = document.getElementById('icon-container');

iconIds.forEach(id => {
  // Crear elemento SVG que usa el símbolo correspondiente
  const svgUse = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgUse.setAttribute("class", "icon");
  svgUse.setAttribute("width", "24");
  svgUse.setAttribute("height", "24");
  svgUse.setAttribute("viewBox", "0 0 24 24");
  
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute('href', `#${id}`);
  svgUse.appendChild(use);

  container.appendChild(svgUse);
});
