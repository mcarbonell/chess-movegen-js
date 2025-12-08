# Generador de Movimientos de Ajedrez

> **Generador de movimientos de ajedrez en JavaScript con detección estrictamente legal**

[![npm version](https://badge.fury.io/js/chess-movegen-js.svg)](https://www.npmjs.com/package/chess-movegen-js)
[![npm downloads](https://img.shields.io/npm/dm/chess-movegen-js.svg)](https://www.npmjs.com/package/chess-movegen-js)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md) | **Español**

## 🎯 Características Principales

- ✅ **Generación de movimientos estrictamente legales** - Sin pseudo-movimientos que requieran validación posterior
- ✅ **Detección integrada de jaques, mates y ahogados** - Durante la generación, no como paso posterior
- ✅ **Dos implementaciones**: x88 y Bitboards
- ✅ **Análisis táctico automático** - Cada movimiento incluye información sobre capturas ganadoras, piezas colgadas, casillas seguras
- ✅ **Motor UCI completo** - Compatible con interfaces de ajedrez estándar
- ✅ **Interfaz web interactiva** - Demo visual con tablero drag & drop
- ✅ **Web Workers** - Cálculos sin bloquear la interfaz

## 🚀 Demo Rápida

**[¡Pruebalo ahora!](https://mcarbonell.github.io/chess-movegen-js/engine.html)** 

O abre `engine.html` en tu navegador para ver la demo interactiva.

## 📦 Instalación

### NPM

```bash
npm install chess-movegen-js
```

### Uso

```javascript
const { Board } = require('chess-movegen-js');

const board = new Board();
board.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
board.generateMoves();

console.log(`Movimientos legales: ${board.moves.length}`); // 20
```

## 📖 Ejemplos de Uso

### Inicialización Básica

```javascript
// Crear un tablero
const board = new Board();

// Cargar una posición FEN
board.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

// Generar todos los movimientos legales
board.generateMoves();

// Ver los movimientos
console.log(board.moves);
```

### Análisis de Movimientos

Los movimientos incluyen información táctica:

```javascript
board.generateMoves();

board.moves.forEach(move => {
    const moveStr = board.getMoveStr(move);
    console.log(moveStr);
    
    // Información táctica en move.mask:
    // - mask_check: Da jaque
    // - mask_safe: Casilla segura
    // - mask_hanging: Pieza quedaría colgada
    // - mask_freecapture: Captura sin defensa
    // - mask_winningcapture: Captura ganadora
});
```

### Hacer y Deshacer Movimientos

```javascript
// Hacer un movimiento
const move = board.moves[0];
board.makemove(move);

// Deshacer
board.undomove();
```

### Perft (Testing de Generación)

```javascript
// Contar nodos a profundidad 5
const nodes = board.perft(5);
console.log(`Nodes: ${nodes}`); // 4,865,609 desde posición inicial

// Divide (mostrar nodos por movimiento)
board.divide(4);
```

## 🏗️ Estructura del Proyecto

```
movegen/
├── js/
│   ├── x88.js           # Generador con representación x88 (1842 líneas)
│   ├── bitboard.js      # Generador con bitboards
│   ├── magic-tables.js  # Tablas Mágicas para bitboard
│   └── engine.js        # Motor UCI con Web Worker
├── assets/              # Estilos css y js para la demo
├── img/                 # Recursos gráficos
├── engine.html          # Demo interactiva principal
├── ANALISIS.md          # Análisis técnico detallado
└── README.es.md         # Este archivo
```


## 🎮 Motor UCI

El proyecto incluye un motor UCI completo que se ejecuta en Web Worker:

```javascript
// Crear motor
const w = new Worker("js/engine.js");

// Comunicación UCI
w.postMessage('uci');
w.postMessage('position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
w.postMessage('perft 6');

// Escuchar respuestas
w.onmessage = function(event) {
    console.log(event.data);
};
```

### Comandos UCI Soportados

- `uci` - Inicializar motor
- `isready` - Verificar disponibilidad
- `ucinewgame` - Nueva partida
- `position [fen|startpos] [moves ...]` - Establecer posición
- `move <move>` - Hacer movimiento (ej: e2e4)
- `undo` - Deshacer movimiento
- `perft <depth>` - Test de generación de movimientos

## ⚡ Rendimiento

**Perft desde posición inicial** (Node.js v20+, sin debug):

| Depth | Nodos | Tiempo | NPS |
|-------|-------|--------|-----|
| 1 | 20 | <1ms | ~25k |
| 2 | 400 | ~1ms | ~268k |
| 3 | 8,902 | ~10ms | ~864k |
| 4 | 197,281 | ~83ms | **2.4M** |
| 5 | 4,865,609 | ~871ms | **5.6M** |
| 6 | 119,060,324 | ~17s | **7.0M** |

**En navegador** (puede variar según browser y hardware):
- Chrome/Edge: ~3-5M NPS
- Firefox: ~2-4M NPS

> **Nota**: Estos resultados son con el código optimizado (sin llamadas a `debug()`). 
> El rendimiento en producción es excelente para JavaScript puro.

## 🎨 Características Técnicas Destacadas

### 1. Detección de Clavadas

Las piezas clavadas se detectan durante la generación. Los movimientos ilegales nunca se generan:

```javascript
// pinDirection[side][square] indica si una pieza está clavada
// y en qué dirección
```

### 2. Enriquecimiento Táctico

Cada movimiento contiene flags que indican:
- Si da jaque o jaque mate
- Si la pieza quedaría colgada
- Si es una captura ganadora
- Si es una casilla segura

### 3. Casos Especiales

- ✅ Captura al paso con clavadas horizontales
- ✅ Jaques a la descubierta (incluyendo en enroques)
- ✅ Detección de mates en una jugada
- ✅ Promociones múltiples

## 🔬 Implementaciones

### x88 (Recomendado para aprendizaje)

- Array de 128 posiciones (16×8)
- Validación ultra rápida: `if (sq & 0x88) continue`
- Código más legible y fácil de entender
- Archivo: [`js/x88.js`](js/x88.js)

### Bitboards (Experimental)

- Representación con bitboards de 64 bits
- Más rápido en teoría, más complejo
- Archivo: [`js/bitboard.js`](js/bitboard.js)

## 📚 Documentación

Para un análisis técnico completo del código, consulta [`ANALISIS.md`](ANALISIS.md).

## 🧪 Testing

El proyecto usa **Perft** para validar la generación de movimientos:

```javascript
// Desde consola del navegador en engine.html
w.postMessage('perft 5');

// O en código
const board = new Board();
board.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
console.log(board.perft(5)); // Debe ser 4,865,609
```

## 🧪 Ejecutar Tests

El proyecto incluye una suite completa de tests Perft para validar la correctitud de la generación de movimientos y medir el rendimiento.

### Inicio Rápido

```bash
# Ejecutar suite rápida (profundidades 1-4, ~1 minuto)
node tests/perft-test.js --quick

# Probar posición específica
node tests/perft-test.js --position 0 --depth 5

# Probar solo generador x88 hasta profundidad 6
node tests/perft-test.js --generator x88 --depth 6
```

### Opciones Disponibles

```bash
node tests/perft-test.js [opciones]

Opciones:
  --generator <x88|bb|both>   Seleccionar generador a probar (default: both)
  --position <n>              Probar solo posición n (default: all)
  --depth <n>                 Probar hasta profundidad n (default: 6)
  --quick                     Modo test rápido (profundidades 1-4)
  --help                      Mostrar mensaje de ayuda
```

### Posiciones de Test

La suite de tests incluye 7 posiciones estándar de [Chess Programming Wiki](https://www.chessprogramming.org/Perft_Results):

| Posición | Descripción | Profundidad Máxima |
|----------|-------------|---------------------|
| 0 | Posición inicial | 10 |
| 1 | Kiwipete (medio juego complejo) | 6 |
| 2 | Casos especiales de captura al paso | 8 |
| 3 | Promociones | 6 |
| 4 | Promociones (espejo) | 6 |
| 5 | Posición táctica compleja | 5 |
| 6 | Posición simétrica | 6 |

### Salida Esperada

```
Chess Move Generator - Perft Test Suite

Configuration:
  Generator: x88
  Positions: 7
  Max depth: 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing: x88 Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Initial Position
FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
  ✓ Depth 1: 20 nodes [1ms, 17,891 NPS]
  ✓ Depth 2: 400 nodes [2ms, 167,560 NPS]
  ✓ Depth 3: 8,902 nodes [9ms, 973,343 NPS]
  ✓ Depth 4: 197,281 nodes [80ms, 2,480,626 NPS]

Kiwipete
FEN: r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1
  ✓ Depth 1: 48 nodes [0ms, 302,457 NPS]
  ✓ Depth 2: 2,039 nodes [2ms, 1,220,008 NPS]
  ✓ Depth 3: 97,862 nodes [32ms, 3,068,986 NPS]
  ✓ Depth 4: 4,085,603 nodes [548ms, 7,461,185 NPS]

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total tests: 28
Passed: 28
Failed: 0
Pass rate: 100.0%

Performance Summary:
  Depth 1: 883,697 NPS avg (368 nodes in 2ms)
  Depth 2: 2,126,798 NPS avg (13,446 nodes in 10ms)
  Depth 3: 3,360,700 NPS avg (561,558 nodes in 170ms)
  Depth 4: 4,722,406 NPS avg (22,337,738 nodes in 4.51s)
```

### Benchmarks de Rendimiento

Medido en Node.js v20+ con generador x88 (optimizado, sin debug):

| Depth | Nodos | Tiempo | NPS |
|-------|-------|--------|-----|
| 1 | 20 | <1ms | ~25k |
| 2 | 400 | ~1ms | ~268k |
| 3 | 8,902 | ~10ms | ~864k |
| 4 | 197,281 | ~83ms | **2.4M** |
| 5 | 4,865,609 | ~871ms | **5.6M** |
| 6 | 119,060,324 | ~17s | **7.0M** |

**Suite de tests rápida** (7 posiciones, profundidades 1-4): ~1.4 segundos

> 💡 **Consejo**: El rendimiento es significativamente más rápido con el logging de debug desactivado. 
> Asegúrate de comentar las llamadas a `this.debug()` en producción.

### Solución de Problemas

Si los tests fallan o muestran errores:

1. **Asegúrate de tener Node.js instalado**: Los tests requieren Node.js v14 o superior
2. **Verifica que todos los archivos estén presentes**: Asegúrate de que el directorio `tests/` existe con todos los archivos
3. **Verifica las modificaciones de x88.js**: El archivo debe tener compatibilidad con Node.js añadida

### Posiciones de Test Conocidas

```javascript
// Posición Kiwipete
board.loadFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
console.log(board.perft(5)); // 193,690,690

// Captura al paso compleja
board.loadFEN('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
```

## 🎯 Próximos Pasos

- [x] **Tests automatizados con suite Perft** ✅
- [x] **Publicar como paquete NPM** ✅
- [ ] Detección de repeticiones con Zobrist hashing
- [ ] Optimización con WebAssembly
- [ ] Implementar búsqueda alfabeta completa
- [ ] Agregar evaluación de posiciones

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📖 Recursos y Referencias

- [Chess Programming Wiki](https://www.chessprogramming.org/)
- [0x88 Board Representation](https://www.chessprogramming.org/0x88)
- [Perft Results](https://www.chessprogramming.org/Perft_Results)
- [UCI Protocol](https://www.chessprogramming.org/UCI)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👤 Autor

**Mario Raúl Carbonell Martínez**

---

⭐ Si encuentras útil este proyecto, considera darle una estrella en GitHub!
