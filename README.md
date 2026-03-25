# Chess Move Generator

> **JavaScript chess move generator with strictly legal move generation**

[![npm version](https://badge.fury.io/js/chess-movegen-js.svg)](https://www.npmjs.com/package/chess-movegen-js)
[![npm downloads](https://img.shields.io/npm/dm/chess-movegen-js.svg)](https://www.npmjs.com/package/chess-movegen-js)
[![CI](https://github.com/mcarbonell/chess-movegen-js/actions/workflows/ci.yml/badge.svg)](https://github.com/mcarbonell/chess-movegen-js/actions)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**English** | [Español](README.es.md)

## 🎯 Key Features

- ✅ **Strictly legal move generation** - No pseudo-moves requiring post-validation
- ✅ **Integrated check, checkmate, and stalemate detection** - During generation, not as a post-processing step
- ✅ **Two implementations**: x88 and Bitboards
- ✅ **Automatic tactical analysis** - Each move includes information about winning captures, hanging pieces, safe squares
- ✅ **Complete UCI engine** - Compatible with standard chess interfaces
- ✅ **Interactive web interface** - Visual demo with drag & drop board
- ✅ **Web Workers** - Calculations without blocking the UI

## 🚀 Quick Demo

**[Try it live!](https://mcarbonell.github.io/chess-movegen-js/engine.html)** 

Or open `engine.html` in your browser locally.

## 📦 Installation

### NPM

```bash
npm install chess-movegen-js
```

### Usage

```javascript
const { Board } = require('chess-movegen-js');

const board = new Board();
board.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
board.generateMoves();

console.log(`Legal moves: ${board.moves.length}`); // 20
```

## 📖 Usage Examples

### Basic Initialization

```javascript
// Create a board
const board = new Board();

// Load a FEN position
board.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

// Generate all legal moves
board.generateMoves();

// View the moves
console.log(board.moves);
```

### Move Analysis

Moves include tactical information:

```javascript
board.generateMoves();

board.moves.forEach(move => {
    const moveStr = board.getMoveStr(move);
    console.log(moveStr);
    
    // Tactical information in move.mask:
    // - mask_check: Gives check
    // - mask_safe: Safe square
    // - mask_hanging: Piece would be hanging
    // - mask_freecapture: Undefended capture
    // - mask_winningcapture: Winning capture
});
```

### Make and Unmake Moves

```javascript
// Make a move
const move = board.moves[0];
board.makemove(move);

// Unmake
board.undomove();
```

### Perft (Move Generation Testing)

```javascript
// Count nodes at depth 5
const nodes = board.perft(5);
console.log(`Nodes: ${nodes}`); // 4,865,609 from initial position

// Divide (show nodes per move)
board.divide(4);
```

## 🏗️ Project Structure

```
movegen/
├── js/
│   ├── x88.js           # x88 representation generator (1842 lines)
│   ├── bitboard.js      # Bitboard generator
│   ├── magic-tables.js  # Magic tables for bitboard
│   └── engine.js        # UCI engine with Web Worker
├── assets/              # css and js assets for the demo
├── img/                 # Graphic resources
├── engine.html          # Main interactive demo
├── ANALISIS.md          # Detailed technical analysis
└── README.md            # This file
```

## 🎮 UCI Engine

The project includes a complete UCI engine running in a Web Worker:

```javascript
// Create engine
const w = new Worker("js/engine.js");

// UCI communication
w.postMessage('uci');
w.postMessage('position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
w.postMessage('perft 6');

// Listen for responses
w.onmessage = function(event) {
    console.log(event.data);
};
```

### Supported UCI Commands

- `uci` - Initialize engine
- `isready` - Check availability
- `ucinewgame` - New game
- `position [fen|startpos] [moves ...]` - Set position
- `move <move>` - Make move (e.g., e2e4)
- `undo` - Unmake move
- `perft <depth>` - Move generation test

## ⚡ Performance

**Perft from initial position** (Node.js v20+, no debug):

| Depth | Nodes | Time | NPS |
|-------|-------|------|-----|
| 1 | 20 | <1ms | ~25k |
| 2 | 400 | ~1ms | ~268k |
| 3 | 8,902 | ~10ms | ~864k |
| 4 | 197,281 | ~83ms | **2.4M** |
| 5 | 4,865,609 | ~871ms | **5.6M** |
| 6 | 119,060,324 | ~17s | **7.0M** |

**In browser** (may vary by browser and hardware):
- Chrome/Edge: ~3-5M NPS
- Firefox: ~2-4M NPS

> **Note**: These results are with optimized code (no `debug()` calls). 
> Production performance is excellent for pure JavaScript.

## 🎨 Technical Highlights

### 1. Pin Detection

Pinned pieces are detected during generation. Illegal moves are never generated:

```javascript
// pinDirection[side][square] indicates if a piece is pinned
// and in which direction
```

### 2. Tactical Enrichment

Each move contains flags indicating:
- If it gives check or checkmate
- If the piece would be hanging
- If it's a winning capture
- If it's a safe square

### 3. Special Cases

- ✅ En passant capture with horizontal pins
- ✅ Discovered checks (including in castling)
- ✅ Mate-in-one detection
- ✅ Multiple promotions

## 🔬 Implementations

### x88 (Recommended for learning)

- 128-position array (16×8)
- Ultra-fast validation: `if (sq & 0x88) continue`
- More readable and easier to understand code
- File: [`js/x88.js`](js/x88.js)

### Bitboards (Experimental)

- 64-bit bitboard representation
- Faster in theory, more complex
- File: [`js/bitboard.js`](js/bitboard.js)

## 📚 Documentation

For a complete technical analysis of the code, see [`ANALISIS.md`](ANALISIS.md).

## 🧪 Testing

The project uses **Perft** to validate move generation:

```javascript
// From browser console in engine.html
w.postMessage('perft 5');

// Or in code
const board = new Board();
board.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
console.log(board.perft(5)); // Should be 4,865,609
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
  --generator <x88|bb|as|rust-x88|rust-bb|all>   Select generator to test (default: all)
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

> 💡 **Tip**: Performance is significantly faster with debug logging disabled. 
> Make sure to comment out `this.debug()` calls in production.

### Troubleshooting

If tests fail or show errors:

1. **Ensure Node.js is installed**: The tests require Node.js v14 or higher
2. **Check all files are present**: Make sure `tests/` directory exists with all test files
3. **Verify x88.js modifications**: The file should have Node.js compatibility added

### Known Test Positions

```javascript
// Kiwipete position
board.loadFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
console.log(board.perft(5)); // 193,690,690

// Complex en passant capture
board.loadFEN('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
```

## 🎯 Next Steps

- [x] **Automated tests with Perft suite** ✅
- [x] **Publish as NPM package** ✅
- [ ] Repetition check with Zobrist hashing
- [ ] WebAssembly optimization
- [ ] Add position evaluation
- [ ] Implement full alpha-beta search

## ⚙️ Continuous Integration (GitHub Actions)

- **Badge:** agregado arriba en este `README`.
- **Qué ejecuta:** el workflow `CI` corre los tests rápidos (`npm test`) automáticamente en `push` y `pull_request`. El job de tests completos de bitboard (`npm run test:bb`) está configurado como ejecución manual para evitar ejecuciones largas en cada push.

Cómo lanzar el test completo desde GitHub UI:

1. Ve a la pestaña **Actions** del repositorio.
2. Selecciona el workflow `CI`.
3. Pulsa **Run workflow**, elige la rama (`main` o `master`) y ejecuta.

Usando la CLI `gh` (GitHub CLI) puedes lanzar el workflow así:

```bash
gh workflow run ci.yml --ref main
```

Nota: el workflow `CI` incluye matrix de versiones Node para los tests rápidos y reserva un job manual (`test-bitboard-full`) con mayor `timeout` para las pruebas intensivas.

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📖 Resources and References

- [Chess Programming Wiki](https://www.chessprogramming.org/)
- [0x88 Board Representation](https://www.chessprogramming.org/0x88)
- [Perft Results](https://www.chessprogramming.org/Perft_Results)
- [UCI Protocol](https://www.chessprogramming.org/UCI)

## 📝 License

This project is under the MIT License - see the LICENSE file for details.

## 👤 Author

**Mario Raúl Carbonell Martínez**

---

⭐ If you find this project useful, consider giving it a star on GitHub!
