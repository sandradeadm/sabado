// funcion que rellena los formularios de edicion si los name coinciden
function llenarFormulario(formId, data) {
  const form = document.getElementById(formId);

  Object.keys(data).forEach(key => {
    if (form[key] !== undefined) {
      form[key].value = typeof data[key] === "boolean" ? (data[key] ? "true" : "false") : data[key];
    }
  });
}
  