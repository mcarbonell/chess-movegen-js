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
- ✅ **100% Perft Accuracy** - All implementations verified against standard test suites
- ✅ **5 Multi-language implementations**: JS (x88, Bitboard), AssemblyScript (x88), Rust (x88, Bitboard)
- ✅ **High Performance**: Up to **25M+ NPS** with Rust Bitboards in the browser
- ✅ **Complete UCI engine** - Compatible with standard chess interfaces
- ✅ **Advanced web interface** - Visual demo with engine selector (JS, AS, Rust)
- ✅ **Web Workers** - Calculations without blocking the UI

## 🚀 Quick Demo

**[Try it live!](https://mcarbonell.github.io/chess-movegen-js/visualizer/engine.html)** 

Or open `visualizer/engine.html` in your browser locally.

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
│   ├── x88.js           # x88 representation generator (JS)
│   ├── bitboard.js      # Bitboard generator (JS)
│   └── magic-tables.js  # Magic tables for bitboard
├── rust-movegen/        # Rust implementation (x88 & Bitboard, WASM)
├── asmovegen/           # AssemblyScript implementation (x88, WASM)
├── visualizer/          # Interactive web interface
│   ├── engine.html      # Main demo page
│   └── js/              # Engine workers and UI logic
├── tests/               # Comprehensive Perft test suite
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

Benchmarks from initial position (Depth 5):

| Implementation | Platform | NPS |
|----------------|----------|-----|
| **Rust Bitboard** | WASM/Browser | **~25.8M** |
| **Rust x88** | WASM/Browser | **~18.0M** |
| **AssemblyScript** | WASM/Browser | **~12.5M** |
| **JS x88** | Node.js / Browser | **~5.6M** |
| **JS Bitboard** | Node.js / Browser | **~4.2M** |

**Perft from initial position** (Node.js v20+, no debug):
All versions pass **100% of Perft tests** up to depth 6+.

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
- Available in **JS**, **AssemblyScript**, and **Rust**.

### Bitboards

- 64-bit bitboard representation
- Faster and optimized for modern CPUs
- Uses Magic Bitboards for sliding pieces
- Available in **JS** and **Rust**.

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

# Test specific generator
node tests/perft-test.js --generator rust-bb --depth 6
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
  Generator: all
  Positions: 7
  Max depth: 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total tests: 140 (5 generators * 7 positions * 4 depths)
Passed: 140
Failed: 0
Pass rate: 100.0%
```

## 🎯 Next Steps

- [x] **Automated tests with Perft suite** ✅
- [x] **Publish as NPM package** ✅
- [x] **WebAssembly optimization (AssemblyScript & Rust WASM)** ✅
- [ ] Repetition check with Zobrist hashing

## ⚙️ Continuous Integration (GitHub Actions)

- **Badge:** Added at the top of this `README`.
- **Workflow:** The `CI` workflow automatically runs quick tests (`npm test`) on `push` and `pull_request`. Full bitboard tests (`npm run test:bb`) are configured for manual execution to avoid long runs on every push.

How to launch the full test from GitHub UI:

1. Go to the **Actions** tab of the repository.
2. Select the `CI` workflow.
3. Click **Run workflow**, choose the branch (`main` or `master`), and execute.

Using the `gh` CLI (GitHub CLI):

```bash
gh workflow run ci.yml --ref main
```

Note: The `CI` workflow includes a matrix of Node versions for quick tests and reserves a manual job (`test-bitboard-full`) with a longer `timeout` for intensive testing.

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
