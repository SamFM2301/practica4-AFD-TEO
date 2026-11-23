// ---- MENSAJES DE RESULTADO ----

function mostrarExito(totalSentencias) {
  var caja = document.getElementById('resultado')
  caja.textContent = ''

  agregarLineaResultado(caja, '1:100 Sin error.', '')

  var detalle = document.createElement('p')
  detalle.className = 'detalle'
  if (totalSentencias === 1) {
    detalle.textContent = 'La sentencia está libre de errores sintácticos.'
  } else {
    detalle.textContent =
      'Las ' + totalSentencias + ' sentencias están libres de errores sintácticos.'
  }
  caja.appendChild(detalle)
}

function mostrarAviso(texto) {
  var caja = document.getElementById('resultado')
  caja.textContent = ''
  var p = document.createElement('p')
  p.className = 'mensaje-vacio'
  p.textContent = texto
  caja.appendChild(p)
}
