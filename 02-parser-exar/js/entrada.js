// ---- LECTURA DE SENTENCIAS ----

function leerLineas(texto) {
  return texto.replace(/\r/g, '').split('\n')
}

function lineaVacia(linea) {
  return /^[ \t]*$/.test(linea)
}

function contarSentencias(lineas) {
  return lineas.filter((linea) => !lineaVacia(linea)).length
}
