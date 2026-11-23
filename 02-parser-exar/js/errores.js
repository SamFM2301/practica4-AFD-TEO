// ---- CATÁLOGO DE ERRORES ----

var CATALOGO_ERRORES = [
  { tipo: 1, codigo: 100, descripcion: 'Sin error.' },
  { tipo: 1, codigo: 101, descripcion: 'Símbolo desconocido.' },
  { tipo: 1, codigo: 102, descripcion: 'Elemento inválido.' },
  { tipo: 2, codigo: 200, descripcion: 'Sin error.' },
  { tipo: 2, codigo: 201, descripcion: 'Falta delimitador.' },
  { tipo: 2, codigo: 202, descripcion: 'Falta operador.' },
  { tipo: 2, codigo: 203, descripcion: 'Falta identificador / constante.' },
]

// ---- FORMATO DE ERRORES ----

function buscarDescripcion(codigo) {
  var registro = CATALOGO_ERRORES.find((r) => r.codigo === codigo)
  return registro ? registro.descripcion : 'Error no identificado.'
}

function dosDigitos(numero) {
  return String(numero).padStart(2, '0')
}

function crearError(tipo, codigo, linea) {
  return { tipo, codigo, linea }
}

function textoError(error) {
  var inicio = error.tipo + ':' + error.codigo + ' '
  var descripcion = buscarDescripcion(error.codigo)

  if (error.tipo === 1) {
    return (
      inicio + 'Error en Línea ' + dosDigitos(error.linea) + ': ' + descripcion
    )
  }
  return inicio + 'Error Línea ' + dosDigitos(error.linea) + '. ' + descripcion
}

// ---- VISUALIZACIÓN DE ERRORES ----

function mostrarError(error) {
  var caja = document.getElementById('resultado')
  caja.textContent = ''
  agregarLineaResultado(caja, textoError(error), 'error')
}

function agregarLineaResultado(caja, texto, clase) {
  var div = document.createElement('div')
  div.className = clase ? 'linea-resultado ' + clase : 'linea-resultado'
  div.textContent = texto
  caja.appendChild(div)
}

// ---- TABLA DE CÓDIGOS ----

function pintarCatalogo() {
  var cuerpo = document.getElementById('tablaCodigos')
  var tipoAnterior = 0

  CATALOGO_ERRORES.forEach((registro) => {
    var fila = document.createElement('tr')

    var celdaTipo = document.createElement('td')
    if (registro.tipo !== tipoAnterior) {
      celdaTipo.textContent = registro.tipo
      tipoAnterior = registro.tipo
    }

    var celdaCodigo = document.createElement('td')
    celdaCodigo.textContent = registro.codigo

    var celdaDesc = document.createElement('td')
    celdaDesc.textContent = registro.descripcion

    fila.append(celdaTipo, celdaCodigo, celdaDesc)
    cuerpo.appendChild(fila)
  })
}
