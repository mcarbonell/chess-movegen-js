# Generador de Movimientos de Ajedrez

> **Generador de movimientos de ajedrez en JavaScript con detección estrictamente legal**

[![npm version](https://badge.fury.io/js/chess-movegen-js.svg)](https://www.npmjs.com/package/chess-movegen-js)
[![npm downloads](https://img.shields.io/npm/dm/chess-movegen-js.svg)](https://www.npmjs.com/package/chess-movegen-js)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md) | **Español**

## 🎯 Características Principales

- ✅ **Generación de movimientos estrictamente legales** - Sin pseudo-movimientos que requieran validación posterior
- ✅ **Precisión Perft al 100%** - Todas las versiones verificadas con suites de pruebas estándar
- ✅ **5 implementaciones multi-lenguaje**: JS (x88, Bitboard), AssemblyScript (x88), Rust (x88, Bitboard)
- ✅ **Alto Rendimiento**: Hasta **25M+ NPS** con Rust Bitboards en el navegador
- ✅ **Motor UCI completo** - Compatible con interfaces de ajedrez estándar
- ✅ **Interfaz web avanzada** - Demo visual con selector de motor (JS, AS, Rust)
- ✅ **Web Workers** - Cálculos sin bloquear la interfaz

## 🚀 Demo Rápida

**[¡Pruebalo ahora!](https://mcarbonell.github.io/chess-movegen-js/visualizer/engine.html)** 

O abre `visualizer/engine.html` en tu navegador para ver la demo interactiva.

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
│   ├── x88.js           # Generador x88 (JS)
│   ├── bitboard.js      # Generador Bitboard (JS)
│   └── magic-tables.js  # Tablas Mágicas para bitboard
├── rust-movegen/        # Implementación en Rust (x88 y Bitboard, WASM)
├── asmovegen/           # Implementación en AssemblyScript (x88, WASM)
├── visualizer/          # Interfaz web interactiva
│   ├── engine.html      # Página principal de la demo
│   └── js/              # Workers y lógica de la UI
├── tests/               # Suite completa de tests Perft
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

Benchmarks desde la posición inicial (Profundidad 5):

| Implementación | Plataforma | NPS |
|----------------|------------|-----|
| **Rust Bitboard** | WASM/Navegador | **~25.8M** |
| **Rust x88** | WASM/Navegador | **~18.0M** |
| **AssemblyScript** | WASM/Navegador | **~12.5M** |
| **JS x88** | Node.js / Navegador | **~5.6M** |
| **JS Bitboard** | Node.js / Navegador | **~4.2M** |

**Perft desde posición inicial** (Node.js v20+, sin debug):
Todas las versiones pasan el **100% de los tests Perft** hasta profundidad 6+.


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
- Disponible en **JS**, **AssemblyScript** y **Rust**.

### Bitboards

- Representación con bitboards de 64 bits
- Más rápido y optimizado para CPUs modernas
- Usa Tablas Mágicas para piezas deslizantes
- Disponible en **JS** y **Rust**.

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

# Probar generador específico
node tests/perft-test.js --generator rust-bb --depth 6
```

### Opciones Disponibles

```bash
node tests/perft-test.js [opciones]

Opciones:
  --generator <x88|bb|as|rust-x88|rust-bb|all>   Seleccionar generador a probar (default: all)
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
  Generator: all
  Positions: 7
  Max depth: 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resumen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total tests: 140 (5 generadores * 7 posiciones * 4 profundidades)
Pasados: 140
Fallidos: 0
Tasa de éxito: 100.0%
```

## 🎯 Próximos Pasos

- [x] **Tests automatizados con suite Perft** ✅
- [x] **Publicar como paquete NPM** ✅
- [x] **Optimización con WebAssembly (AssemblyScript y Rust WASM)** ✅
- [ ] Detección de repeticiones con Zobrist hashing

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
