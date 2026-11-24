// ---- EJEMPLOS ----

var BASE = [
  '(X1+B2);',
  '(Y1+B3*C4)+D;',
  '(((VAR2+X1)));',
  '(PESO+(CARGO*DIF2));',
  '((X2+45.78)*(CARGO/ABONO)-(PORC*12.55))-INT;',
  '456.78*(12.34*3.56E45)+B2;',
]

var CAMBIOS = [
  [-1, ''],
  [3, '(PESO+(CARGO*DIF2)); &'],
  [5, '456.78*(12.34*3.56EA45)+B2;'],
  [2, '(((VAR2+X1));'],
  [4, '((X2+45.78)*(CARGO/ABONO)(PORC*12.55))-INT;'],
  [1, '(Y1+B3*C4)+*D;'],
  [5, '456.78*(*3.56E45)+B2;'],
]

function armarEjemplo(indice) {
  var [lineaCambiada, textoNuevo] = CAMBIOS[indice]
  return BASE.map((linea, i) => (i === lineaCambiada ? textoNuevo : linea)).join(
    '\n',
  )
}

// ---- ELEMENTOS DEL DOM ----

var editor = document.getElementById('entrada')
var numeros = document.getElementById('numeros')

// ---- NUMERACIÓN DE LÍNEAS ----

function actualizarNumeros(lineaError) {
  var total = leerLineas(editor.value).length
  numeros.textContent = ''
  for (var i = 1; i <= total; i++) {
    var div = document.createElement('div')
    div.textContent = i
    if (i === lineaError) {
      div.className = 'linea-error'
    }
    numeros.appendChild(div)
  }
  numeros.scrollTop = editor.scrollTop
}

// ---- ANÁLISIS ----

function analizar() {
  var lineas = leerLineas(editor.value)
  var totalSentencias = contarSentencias(lineas)

  if (totalSentencias === 0) {
    mostrarAviso('No hay sentencias para analizar.')
    actualizarNumeros(0)
    return
  }

  // Cada sentencia se revisa completa (léxico y luego el autómata de pila)
  // antes de pasar a la siguiente, así se señala el primer error del texto.
  for (var i = 0; i < lineas.length; i++) {
    if (lineaVacia(lineas[i])) continue

    var lexico = analizarLexico(lineas[i], i + 1)
    var error = lexico.error
    if (error === null) {
      error = automataPila(lexico.simbolos, i + 1)
    }

    if (error !== null) {
      mostrarError(error)
      actualizarNumeros(error.linea)
      return
    }
  }

  mostrarExito(totalSentencias)
  actualizarNumeros(0)
}

function analizarSeguro() {
  try {
    analizar()
  } catch (e) {
    mostrarAviso(
      'Ocurrió un problema al analizar. Revisa el texto e inténtalo de nuevo.',
    )
  }
}

// ---- EVENTOS ----

document.getElementById('btnAnalizar').addEventListener('click', analizarSeguro)

document.getElementById('btnLimpiar').addEventListener('click', function () {
  editor.value = ''
  document.getElementById('ejemplos').value = ''
  mostrarAviso('Escribe las sentencias y presiona Analizar.')
  actualizarNumeros(0)
  editor.focus()
})

document.getElementById('ejemplos').addEventListener('change', function () {
  if (this.value === '') return
  editor.value = armarEjemplo(Number(this.value))
  mostrarAviso('Ejemplo cargado. Presiona Analizar.')
  actualizarNumeros(0)
})

editor.addEventListener('input', function () {
  actualizarNumeros(0)
})

editor.addEventListener('scroll', function () {
  numeros.scrollTop = editor.scrollTop
})

editor.addEventListener('keydown', function (evento) {
  if (evento.ctrlKey && evento.key === 'Enter') {
    evento.preventDefault()
    analizarSeguro()
  }
})

// ---- INICIALIZACIÓN ----

pintarCatalogo()
actualizarNumeros(0)
