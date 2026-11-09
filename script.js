/* =====================================================================
 * 1. Definición del AFD   M = (Q, Σ, δ, q0, F)
 * ===================================================================== */

// Σ  Alfabeto: cada elemento es una columna de la tabla de transiciones.
// Cualquier carácter que no esté aquí no tiene transición (va al estado de error).
const ALFABETO = [
  { nombre: 'Dígito', simbolos: '0123456789' }, // columna 0
  { nombre: ',', simbolos: ',' }, //               columna 1
  { nombre: '.', simbolos: '.' }, //               columna 2
  { nombre: '%', simbolos: '%' }, //               columna 3
  { nombre: '$', simbolos: '$' }, //               columna 4
  { nombre: '+ / -', simbolos: '+-−' }, //         columna 5
];

// q0  Estado inicial.
const ESTADO_INICIAL = 0;

// Valor que indica "no hay transición": la cadena se desecha.
const ERROR = -1;

// δ  Tabla (matriz) de transiciones.
const TABLA_TRANSICIONES = [
  //          Díg    ,    .    %    $   +/-
  /* q0  */ [   1,  -1,  -1,  -1,  12,  24],
  /* q1  */ [   2,   5,   9,  11,  -1,  -1],
  /* q2  */ [   3,   5,   9,  11,  -1,  -1],
  /* q3  */ [   4,   5,   9,  11,  -1,  -1],
  /* q4  */ [   4,  -1,   9,  11,  -1,  -1],
  /* q5  */ [   6,  -1,  -1,  -1,  -1,  -1],
  /* q6  */ [   7,  -1,  -1,  -1,  -1,  -1],
  /* q7  */ [   8,  -1,  -1,  -1,  -1,  -1],
  /* q8  */ [  -1,   5,   9,  11,  -1,  -1],
  /* q9  */ [  10,  -1,  -1,  -1,  -1,  -1],
  /* q10 */ [  10,  -1,  -1,  11,  -1,  -1],
  /* q11 */ [  -1,  -1,  -1,  -1,  -1,  -1],
  /* q12 */ [  13,  -1,  -1,  -1,  -1,  -1],
  /* q13 */ [  14,  17,  21,  -1,  -1,  -1],
  /* q14 */ [  15,  17,  21,  -1,  -1,  -1],
  /* q15 */ [  16,  17,  21,  -1,  -1,  -1],
  /* q16 */ [  16,  -1,  21,  -1,  -1,  -1],
  /* q17 */ [  18,  -1,  -1,  -1,  -1,  -1],
  /* q18 */ [  19,  -1,  -1,  -1,  -1,  -1],
  /* q19 */ [  20,  -1,  -1,  -1,  -1,  -1],
  /* q20 */ [  -1,  17,  21,  -1,  -1,  -1],
  /* q21 */ [  22,  -1,  -1,  -1,  -1,  -1],
  /* q22 */ [  23,  -1,  -1,  -1,  -1,  -1],
  /* q23 */ [  -1,  -1,  -1,  -1,  -1,  -1],
  /* q24 */ [  25,  -1,  -1,  -1,  -1,  -1],
  /* q25 */ [  25,  -1,   9,  11,  -1,  -1],
];

// F  Estados de aceptación y el tipo de cadena que reconoce cada uno.
//    Un estado que no aparece aquí no es de aceptación.
//    La clasificación se hace dentro del mismo autómata: el tipo depende
//    del estado de aceptación en el que termina la cadena.
const ESTADOS_ACEPTACION = {
  1: 'Natural',
  2: 'Natural',
  3: 'Natural',
  4: 'Natural',
  8: 'Natural',
  10: 'Real',
  11: 'Porcentaje',
  13: 'Valor monetario',
  14: 'Valor monetario',
  15: 'Valor monetario',
  16: 'Valor monetario',
  20: 'Valor monetario',
  22: 'Valor monetario',
  23: 'Valor monetario',
  25: 'Entero',
};

/* =====================================================================
 * 2. Motor del AFD (genérico: solo lee la tabla)
 * ===================================================================== */

// Devuelve la columna de la tabla que corresponde al carácter,
// o el valor de error si el carácter no pertenece al alfabeto.
function columnaDe(caracter) {
  for (let columna = 0; columna < ALFABETO.length; columna++) {
    if (ALFABETO[columna].simbolos.includes(caracter)) return columna;
  }
  return ERROR;
}

// δ(estado, caracter): consulta la matriz de transiciones.
function transicion(estado, caracter) {
  const fila = TABLA_TRANSICIONES[estado];
  const columna = columnaDe(caracter);
  if (fila === undefined || columna === ERROR) return ERROR;
  return fila[columna] ?? ERROR;
}

// δ*(q0, cadena): recorre la cadena carácter por carácter.
// Si en algún momento no hay transición, se detiene (la cadena se desecha).
function ejecutarAFD(cadena) {
  let estado = ESTADO_INICIAL;
  for (const caracter of cadena) {
    estado = transicion(estado, caracter);
    if (estado === ERROR) break;
  }
  return estado;
}

// Devuelve el tipo de cadena si el estado es de aceptación, o null si no.
function tipoDeEstado(estado) {
  return ESTADOS_ACEPTACION[estado] ?? null;
}

// Lista de tipos distintos que reconoce el autómata (sale de la tabla F).
function tiposDelAutomata() {
  const tipos = [];
  for (const tipo of Object.values(ESTADOS_ACEPTACION)) {
    if (!tipos.includes(tipo)) tipos.push(tipo);
  }
  return tipos;
}

// Revisa que la tabla sea coherente con el alfabeto (útil si se modifica).
function validarDefinicion() {
  const totalEstados = TABLA_TRANSICIONES.length;
  TABLA_TRANSICIONES.forEach((fila, estado) => {
    if (fila.length !== ALFABETO.length) {
      console.warn(`q${estado}: tiene ${fila.length} columnas y el alfabeto tiene ${ALFABETO.length}.`);
    }
    fila.forEach((destino, columna) => {
      if (destino !== ERROR && (destino < 0 || destino >= totalEstados)) {
        console.warn(`δ(q${estado}, ${ALFABETO[columna]?.nombre}) = q${destino} no existe.`);
      }
    });
  });
}

/* =====================================================================
 * 3. Módulo de análisis
 *    (los if de esta sección solo preparan el texto; no simulan al AFD)
 * ===================================================================== */

const ESPACIOS = ' \t\n\r\f\v ';

// Signos de puntuación que pueden ir pegados a una cadena numérica
// dentro de un párrafo, p. ej. "2024," "10%." "(500)" "120,000,".
const DELIMITADORES_INICIALES = '([{¿¡"\'«“‘';
const DELIMITADORES_FINALES = ',.;:!?)]}"\'»”’…';

// Separa el texto en palabras (por espacios y saltos de línea) y guarda
// el número de línea en el que empieza cada una.
function extraerPalabras(texto) {
  const palabras = [];
  let actual = '';
  let linea = 1;
  let lineaPalabra = 1;

  for (const caracter of texto) {
    const esEspacio = ESPACIOS.includes(caracter);
    if (esEspacio && actual !== '') {
      palabras.push({ texto: actual, linea: lineaPalabra });
      actual = '';
    }
    if (!esEspacio && actual === '') lineaPalabra = linea;
    if (!esEspacio) actual += caracter;
    if (caracter === '\n') linea++;
  }
  if (actual !== '') palabras.push({ texto: actual, linea: lineaPalabra });

  return palabras;
}

// Quita la puntuación pegada al inicio y al final de la palabra
// (la coma o el punto final de "120,000," o "10%.").
// El párrafo original no se modifica; solo se limpia la copia a evaluar.
function limpiarPalabra(palabra) {
  let inicio = 0;
  let fin = palabra.length;
  while (inicio < fin && DELIMITADORES_INICIALES.includes(palabra[inicio])) inicio++;
  while (fin > inicio && DELIMITADORES_FINALES.includes(palabra[fin - 1])) fin--;
  return palabra.slice(inicio, fin);
}

// Analiza todo el texto y devuelve solo las cadenas aceptadas por el AFD.
// Las cadenas inválidas (p. ej. "a137", "12abc") se desechan y no se muestran.
function analizarTexto(texto) {
  const resultados = [];

  for (const palabra of extraerPalabras(texto)) {
    const cadena = limpiarPalabra(palabra.texto);
    if (cadena === '') continue;

    const estadoFinal = ejecutarAFD(cadena);
    const tipo = tipoDeEstado(estadoFinal);
    if (tipo === null) continue;

    resultados.push({
      numero: resultados.length + 1,
      linea: palabra.linea,
      cadena,
      tipo,
      estado: estadoFinal,
    });
  }

  return resultados;
}

/* =====================================================================
 * 4. Módulo de resultados (interfaz)
 * ===================================================================== */

const CLASE_POR_TIPO = {
  Natural: 'tipo-natural',
  Real: 'tipo-real',
  Porcentaje: 'tipo-porcentaje',
  'Valor monetario': 'tipo-monetario',
  Entero: 'tipo-entero',
};

const PLURAL_POR_TIPO = {
  Natural: 'Naturales',
  Real: 'Reales',
  Porcentaje: 'Porcentajes',
  'Valor monetario': 'Valores monetarios',
  Entero: 'Enteros',
};

function crearCelda(etiqueta, texto, clase) {
  const celda = document.createElement(etiqueta);
  celda.textContent = texto;
  if (clase) celda.className = clase;
  return celda;
}

// Dibuja la tabla de transiciones tal como está declarada en el código.
function dibujarTablaTransiciones() {
  const encabezado = document.getElementById('transiciones-encabezado');
  const cuerpo = document.getElementById('transiciones-cuerpo');
  encabezado.replaceChildren();
  cuerpo.replaceChildren();

  const filaEncabezado = document.createElement('tr');
  filaEncabezado.appendChild(crearCelda('th', 'Estado'));
  for (const simbolo of ALFABETO) filaEncabezado.appendChild(crearCelda('th', simbolo.nombre));
  filaEncabezado.appendChild(crearCelda('th', 'Aceptación (tipo)'));
  encabezado.appendChild(filaEncabezado);

  TABLA_TRANSICIONES.forEach((fila, estado) => {
    const tipo = tipoDeEstado(estado);
    const marcaInicial = estado === ESTADO_INICIAL ? '→ ' : '';
    const marcaFinal = tipo === null ? '' : ' *';

    const tr = document.createElement('tr');
    if (tipo !== null) tr.className = 'estado-final';

    const claseEstado = estado === ESTADO_INICIAL ? 'estado-inicial' : '';
    tr.appendChild(crearCelda('td', `${marcaInicial}q${estado}${marcaFinal}`, claseEstado));

    for (const destino of fila) {
      const esError = destino === ERROR;
      tr.appendChild(crearCelda('td', esError ? '—' : `q${destino}`, esError ? 'estado-error' : ''));
    }

    tr.appendChild(crearCelda('td', tipo ?? '—'));
    cuerpo.appendChild(tr);
  });
}

// Tarjetas con el total de cadenas válidas y el conteo por tipo.
function dibujarResumen(resultados) {
  const resumen = document.getElementById('resumen');
  resumen.replaceChildren();

  const tarjetas = [{ texto: 'Cadenas válidas', total: resultados.length }];
  for (const tipo of tiposDelAutomata()) {
    const total = resultados.filter((r) => r.tipo === tipo).length;
    tarjetas.push({ texto: PLURAL_POR_TIPO[tipo] ?? tipo, total });
  }

  for (const tarjeta of tarjetas) {
    const div = document.createElement('div');
    div.className = 'tarjeta';
    div.appendChild(crearCelda('span', String(tarjeta.total), 'tarjeta-numero'));
    div.appendChild(crearCelda('span', tarjeta.texto, 'tarjeta-texto'));
    resumen.appendChild(div);
  }
}

// Tabla de resultados: No. | No. Línea | Cadena | Tipo
function dibujarResultados(resultados) {
  const cuerpo = document.getElementById('resultados-cuerpo');
  const mensaje = document.getElementById('mensaje-vacio');
  cuerpo.replaceChildren();

  for (const r of resultados) {
    const tr = document.createElement('tr');
    tr.appendChild(crearCelda('td', String(r.numero)));
    tr.appendChild(crearCelda('td', String(r.linea)));
    tr.appendChild(crearCelda('td', r.cadena));
    tr.appendChild(crearCelda('td', r.tipo, CLASE_POR_TIPO[r.tipo] ?? ''));
    cuerpo.appendChild(tr);
  }

  mensaje.textContent = 'No se encontraron cadenas numéricas válidas.';
  mensaje.classList.toggle('oculto', resultados.length > 0);
}

/* =====================================================================
 * 5. Módulo de entrada (eventos)
 * ===================================================================== */

function alAnalizar() {
  const texto = document.getElementById('texto-entrada').value;
  const resultados = analizarTexto(texto);
  dibujarResumen(resultados);
  dibujarResultados(resultados);
}

function alLimpiar() {
  document.getElementById('texto-entrada').value = '';
  document.getElementById('resultados-cuerpo').replaceChildren();
  const mensaje = document.getElementById('mensaje-vacio');
  mensaje.textContent = 'Aun no hay resultados. Presiona "Analizar texto".';
  mensaje.classList.remove('oculto');
  dibujarResumen([]);
}

function iniciar() {
  validarDefinicion();
  dibujarTablaTransiciones();
  dibujarResumen([]);
  document.getElementById('btn-analizar').addEventListener('click', alAnalizar);
  document.getElementById('btn-limpiar').addEventListener('click', alLimpiar);
}

if (typeof document !== 'undefined') iniciar();
