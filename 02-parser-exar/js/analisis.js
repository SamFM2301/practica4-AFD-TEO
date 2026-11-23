// ---- CLASIFICACIÓN DE CARACTERES ----

function esLetra(c) {
  return /^[A-Za-z_]$/.test(c)
}

function esDigito(c) {
  return /^[0-9]$/.test(c)
}

function esEspacio(c) {
  return c === ' ' || c === '\t'
}

function esOperador(c) {
  return /^[+\-*\/]$/.test(c)
}

function esDelimitador(c) {
  return /^[();]$/.test(c)
}

// ---- AUTÓMATA DE IDENTIFICADORES ----

function automataIdentificador(lexema) {
  var estado = 0

  for (var c of lexema) {
    if (estado === 0 && esLetra(c)) {
      estado = 1
    } else if (estado === 1 && (esLetra(c) || esDigito(c))) {
      estado = 1
    } else {
      return false
    }
  }

  return estado === 1
}

// ---- AUTÓMATA DE CONSTANTES ----

function automataConstante(lexema) {
  var estado = 0

  for (var c of lexema) {
    var siguiente = -1
    var esExponente = c === 'E' || c === 'e'

    if (estado === 0) {
      if (esDigito(c)) siguiente = 1
    } else if (estado === 1) {
      if (esDigito(c)) siguiente = 1
      else if (c === '.') siguiente = 2
      else if (esExponente) siguiente = 4
    } else if (estado === 2) {
      if (esDigito(c)) siguiente = 3
    } else if (estado === 3) {
      if (esDigito(c)) siguiente = 3
      else if (esExponente) siguiente = 4
    } else if (estado === 4) {
      if (c === '+' || c === '-') siguiente = 5
      else if (esDigito(c)) siguiente = 6
    } else if (estado === 5 || estado === 6) {
      if (esDigito(c)) siguiente = 6
    }

    if (siguiente === -1) {
      return false
    }
    estado = siguiente
  }

  return estado === 1 || estado === 3 || estado === 6
}

// ---- ANÁLISIS LÉXICO ----

function esSignoDeExponente(linea, i, lexema) {
  return (
    (linea[i] === '+' || linea[i] === '-') &&
    lexema.length >= 2 &&
    esDigito(lexema[0]) &&
    /[Ee]$/.test(lexema) &&
    esDigito(linea.charAt(i + 1))
  )
}

function analizarLexico(linea, numeroLinea) {
  var simbolos = []
  var i = 0

  while (i < linea.length) {
    var c = linea[i]

    if (esEspacio(c)) {
      i++
    } else if (esOperador(c)) {
      simbolos.push('op')
      i++
    } else if (esDelimitador(c)) {
      simbolos.push(c)
      i++
    } else if (esLetra(c) || esDigito(c) || c === '.') {
      var lexema = ''

      while (
        i < linea.length &&
        (esLetra(linea[i]) ||
          esDigito(linea[i]) ||
          linea[i] === '.' ||
          esSignoDeExponente(linea, i, lexema))
      ) {
        lexema += linea[i]
        i++
      }

      if (automataIdentificador(lexema) || automataConstante(lexema)) {
        simbolos.push('id')
      } else {
        return { simbolos: simbolos, error: crearError(1, 102, numeroLinea) }
      }
    } else {
      return { simbolos: simbolos, error: crearError(1, 101, numeroLinea) }
    }
  }

  return { simbolos: simbolos, error: null }
}

// ---- PILA ----

function crearPila() {
  return { datos: [], tope: -1 }
}

function apilar(pila, simbolo) {
  pila.tope = pila.tope + 1
  pila.datos[pila.tope] = simbolo
}

function desapilar(pila) {
  var simbolo = pila.datos[pila.tope]
  pila.datos[pila.tope] = undefined
  pila.tope = pila.tope - 1
  return simbolo
}

function cima(pila) {
  return pila.datos[pila.tope]
}

// ---- TABLA DE ANÁLISIS SINTÁCTICO ----

var TABLA = {
  S: { id: ['E', ';'], '(': ['E', ';'] },
  E: { id: ['T', "E'"], '(': ['T', "E'"] },
  "E'": { op: ['op', 'T', "E'"], ')': [], ';': [], $: [] },
  T: { id: ['id'], '(': ['(', 'E', ')'] },
}

function esNoTerminal(simbolo) {
  return ['S', 'E', "E'", 'T'].includes(simbolo)
}

function codigoSinTransicion(noTerminal) {
  return noTerminal === "E'" ? 202 : 203
}

// ---- AUTÓMATA DE PILA ----

function automataPila(simbolos, numeroLinea) {
  var entrada = simbolos.concat('$')

  var pila = crearPila()
  apilar(pila, '$')
  apilar(pila, 'S')

  var posicion = 0

  while (true) {
    var x = cima(pila)
    var a = entrada[posicion]

    if (x === '$') {
      return a === '$' ? null : crearError(2, 201, numeroLinea)
    }

    if (esNoTerminal(x)) {
      var lado = TABLA[x][a]
      if (lado === undefined) {
        return crearError(2, codigoSinTransicion(x), numeroLinea)
      }

      desapilar(pila)
      for (var j = lado.length - 1; j >= 0; j--) {
        apilar(pila, lado[j])
      }
    } else if (x === a) {
      desapilar(pila)
      posicion++
    } else {
      return crearError(2, 201, numeroLinea)
    }
  }
}
