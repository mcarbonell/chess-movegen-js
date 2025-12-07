# Chess Move Generator

> **Generador de movimientos de ajedrez en JavaScript con detección de jugadas estrictamente legales**

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Características Principales

- ✅ **Generación de movimientos estrictamente legales** - No genera pseudo-movimientos que requieran validación posterior
- ✅ **Detección integrada de jaques, mates y ahogados** - Durante la generación, no como paso posterior
- ✅ **Dos implementaciones**: x88 y Bitboards
- ✅ **Análisis táctico automático** - Cada movimiento incluye información sobre capturas ganadoras, piezas colgadas, casillas seguras
- ✅ **Motor UCI completo** - Compatible con interfaces de ajedrez estándar
- ✅ **Interfaz web interactiva** - Demo visual con tablero drag & drop
- ✅ **Web Workers** - Cálculos sin bloquear la UI

## 🚀 Demo Rápida

Abre `engine.html` en tu navegador para ver la demo interactiva.

## 📦 Uso

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
│   ├── engine.js        # Motor UCI con Web Worker
│   └── chess.js         # Librería auxiliar
├── css/                 # Estilos
├── img/                 # Recursos gráficos
├── engine.html          # Demo interactiva principal
├── index.html           # Página de inicio
├── ANALISIS.md          # Análisis técnico detallado
└── README.md            # Este archivo
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

## 🧪 Running Tests

The project includes a comprehensive Perft test suite to validate move generation correctness and measure performance.

### Quick Start

```bash
# Run quick test suite (depths 1-4, ~1 minute)
node tests/perft-test.js --quick

# Test specific position
node tests/perft-test.js --position 0 --depth 5

# Test only x88 generator up to depth 6
node tests/perft-test.js --generator x88 --depth 6
```

### Available Options

```bash
node tests/perft-test.js [options]

Options:
  --generator <x88|bb|both>   Select generator to test (default: both)
  --position <n>              Test only position n (default: all)
  --depth <n>                 Test up to depth n (default: 6)
  --quick                     Quick test mode (depths 1-4)
  --help                      Show help message
```

### Test Positions

The test suite includes 7 standard positions from [Chess Programming Wiki](https://www.chessprogramming.org/Perft_Results):

| Position | Description | Max Depth Tested |
|----------|-------------|------------------|
| 0 | Initial position | 10 |
| 1 | Kiwipete (complex middle game) | 6 |
| 2 | En passant edge cases | 8 |
| 3 | Promotions | 6 |
| 4 | Promotions (mirrored) | 6 |
| 5 | Complex tactical position | 5 |
| 6 | Symmetrical position | 6 |

### Expected Output

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
  ✓ Depth 1: 20 nodes [0ms, 140,449 NPS]
  ✓ Depth 2: 400 nodes [10ms, 41,318 NPS]
  ✓ Depth 3: 8,902 nodes [121ms, 73,778 NPS]
  ✓ Depth 4: 197,281 nodes [2.06s, 95,880 NPS]

Kiwipete
FEN: r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1
  ✓ Depth 1: 48 nodes [0ms, 2,113,472 NPS]
  ✓ Depth 2: 2,039 nodes [15ms, 137,388 NPS]
  ✓ Depth 3: 97,862 nodes [758ms, 129,174 NPS]
  ✓ Depth 4: 4,085,603 nodes [23.98s, 170,321 NPS]

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total tests: 28
Passed: 28
Failed: 0
Pass rate: 100.0%

Performance Summary:
  Depth 1: 2,113,472 NPS avg
  Depth 2: 137,388 NPS avg
  Depth 3: 129,174 NPS avg
  Depth 4: 136,513 NPS avg
```

### Performance Benchmarks

Measured on Node.js v20+ with x88 generator (optimized, no debug):

| Depth | Nodes | Time | NPS |
|-------|-------|------|-----|
| 1 | 20 | <1ms | ~25k |
| 2 | 400 | ~1ms | ~268k |
| 3 | 8,902 | ~10ms | ~864k |
| 4 | 197,281 | ~83ms | **2.4M** |
| 5 | 4,865,609 | ~871ms | **5.6M** |
| 6 | 119,060,324 | ~17s | **7.0M** |

**Quick test suite** (all 7 positions, depths 1-4): ~1.4 seconds

> 💡 **Tip**: The performance is significantly faster with debug logging disabled. 
> Make sure to comment out `this.debug()` calls in production.

### Troubleshooting

If tests fail or show errors:

1. **Ensure Node.js is installed**: The tests require Node.js v14 or higher
2. **Check all files are present**: Make sure `tests/` directory exists with all test files
3. **Verify x88.js modifications**: The file should have Node.js compatibility added

### Posiciones de Test Conocidas

```javascript
// Posición Kiwipete
board.loadFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
console.log(board.perft(5)); // 193,690,690

// Captura al paso compleja
board.loadFEN('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
```

## 🎯 Próximos Pasos

- [ ] Implementar búsqueda alfabeta completa
- [ ] Agregar evaluación de posiciones
- [ ] Tabla de transposiciones con Zobrist hashing
- [x] **Tests automatizados con suite Perft** ✅
- [ ] Optimización con WebAssembly
- [ ] Publicar como paquete NPM

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
