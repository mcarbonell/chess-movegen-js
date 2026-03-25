# Plan: Port Bitboard Generator to Rust/WASM

## Objective

Port `js/bitboard.js` to Rust, compile to WebAssembly, and expose it via the
existing Node.js test infrastructure. Target: **15-30M NPS** at depth 5,
vs ~2M NPS for the JS bitboard and ~5.6M for the JS x88.

The key performance gain comes from replacing JavaScript `BigInt` (slow, heap-allocated)
with Rust `u64` (native CPU register operations), and using hardware `popcnt`/`ctz`/`clz`
instructions instead of manual implementations.

---

## Repository Context

```
movegen/
├── js/
│   ├── x88.js           # Reference implementation (correct, well-tested)
│   ├── bitboard.js      # JS bitboard to port (uses BigInt)
│   └── magic-tables.js  # Precomputed magic bitboard tables (BigInt arrays)
├── tests/
│   ├── perft-test.js    # Test runner (supports --generator as|x88|bb|both)
│   ├── perft-positions.js
│   └── as-node.js       # Example of how to wrap WASM for the test runner
└── asmovegen/           # AssemblyScript port (reference for WASM integration)
    ├── board.ts
    ├── export-board.ts  # WASM exports pattern to follow
    └── BUG_REPORT.md    # Documents bugs found during AS port (useful reference)
```

The test runner already supports `--generator as` via `tests/as-node.js`.
A new `tests/rust-node.js` wrapper needs to be created following the same pattern.

---

## Why Rust Beats JS BigInt

| Operation | JS BigInt | Rust u64 |
|-----------|-----------|----------|
| `popcnt` | Manual loop (~20 ops) | `u64::count_ones()` (1 CPU instruction) |
| `ctz` (LSB) | Lookup table + BigInt math | `u64::trailing_zeros()` (1 CPU instruction) |
| `clz` (MSB) | Manual shifts | `u64::leading_zeros()` (1 CPU instruction) |
| Subtraction | Heap allocation | Register operation |
| AND/OR/XOR | Heap allocation | Register operation |
| Magic multiply | BigInt.asUintN(64, a*b) | `u64::wrapping_mul(a, b)` |

The JS bitboard is actually **slower than x88** because BigInt operations allocate
on the heap. Rust u64 eliminates this entirely.

---

## Recommended Implementation Order

### Phase 1: x88 in Rust first (simpler, establishes infrastructure)

Port `js/x88.js` to Rust first. Reasons:
- No magic tables needed
- Simpler algorithm to debug
- Establishes the WASM interface, Cargo setup, and test integration
- Once perft passes, the infrastructure is proven

### Phase 2: Bitboard in Rust (the real target)

Port `js/bitboard.js` using the infrastructure from Phase 1.

---

## Rust Project Structure

Use the existing `chess-bitboards-wasm/` directory or create a new crate:

```
movegen/rust-movegen/
├── Cargo.toml
├── src/
│   ├── lib.rs           # WASM exports (wasm-bindgen)
│   ├── board.rs         # Board struct, make/unmake
│   ├── movegen.rs       # generate_moves() 
│   ├── attacks.rs       # Magic bitboard attack generation
│   ├── magic_tables.rs  # Static precomputed tables
│   └── types.rs         # Constants, piece types, square helpers
└── pkg/                 # wasm-pack output
```

**Cargo.toml dependencies:**
```toml
[dependencies]
wasm-bindgen = "0.2"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1

[lib]
crate-type = ["cdylib"]
```

---

## Type Mappings (JS → Rust)

```javascript
// JS
var universe = 0xffffffffffffffffn  // BigInt
var BBP = [new BigUint64Array(7), new BigUint64Array(7)]
```

```rust
// Rust
const UNIVERSE: u64 = 0xffffffffffffffff;
struct Board {
    bb: [[u64; 7]; 2],  // bb[color][piece_type], index 0 = all pieces
    // ...
}
```

### Piece constants
```rust
pub const WHITE: usize = 0;
pub const BLACK: usize = 1;
pub const PAWN: usize = 1;
pub const KNIGHT: usize = 2;
pub const BISHOP: usize = 3;
pub const ROOK: usize = 4;
pub const QUEEN: usize = 5;
pub const KING: usize = 6;
```

### Square helpers
```rust
#[inline] pub fn rank(sq: u32) -> u32 { sq >> 3 }
#[inline] pub fn file(sq: u32) -> u32 { sq & 7 }
#[inline] pub fn square(f: u32, r: u32) -> u32 { r * 8 + f }
#[inline] pub fn sq_bb(sq: u32) -> u64 { 1u64 << sq }
#[inline] pub fn lsb(bb: u64) -> u32 { bb.trailing_zeros() }
#[inline] pub fn msb(bb: u64) -> u32 { 63 - bb.leading_zeros() }
#[inline] pub fn popcount(bb: u64) -> u32 { bb.count_ones() }
#[inline] pub fn pop_lsb(bb: &mut u64) -> u32 { let sq = lsb(*bb); *bb &= *bb - 1; sq }
```

---

## Bitboard Masks (JS → Rust)

```javascript
// JS
var aFile = 0x0101010101010101n
var notAFile = ~aFile
var bbrank8 = 0xFF00000000000000n
```

```rust
pub const A_FILE: u64 = 0x0101010101010101;
pub const H_FILE: u64 = 0x8080808080808080;
pub const NOT_A_FILE: u64 = !A_FILE;
pub const NOT_H_FILE: u64 = !H_FILE;
pub const RANK_1: u64 = 0x00000000000000FF;
pub const RANK_8: u64 = 0xFF00000000000000;
pub const RANK_2: u64 = 0x000000000000FF00;
pub const RANK_7: u64 = 0x00FF000000000000;
```

---

## Shift Operations (JS → Rust)

```javascript
// JS (BigInt, slow)
function nortOne(b) { return b << 8n }
function soutOne(b) { return b >> 8n }
function eastOne(b) { return (b << 1n) & notAFile }
```

```rust
// Rust (u64, fast)
#[inline] fn north(b: u64) -> u64 { b << 8 }
#[inline] fn south(b: u64) -> u64 { b >> 8 }
#[inline] fn east(b: u64) -> u64 { (b << 1) & NOT_A_FILE }
#[inline] fn west(b: u64) -> u64 { (b >> 1) & NOT_H_FILE }
#[inline] fn north_east(b: u64) -> u64 { (b << 9) & NOT_A_FILE }
#[inline] fn north_west(b: u64) -> u64 { (b << 7) & NOT_H_FILE }
#[inline] fn south_east(b: u64) -> u64 { (b >> 7) & NOT_A_FILE }
#[inline] fn south_west(b: u64) -> u64 { (b >> 9) & NOT_H_FILE }
```

---

## Magic Bitboard Attack Generation

The JS uses "fancy magic fixed shift" (the fastest variant in the JS benchmarks).

### Converting magic-tables.js to Rust

`magic-tables.js` contains:
- `lookup_table`: array of BigInt bitboards (~88507 entries)
- `b_magics[64]`: `[offset, mask, magic]` per square for bishops  
- `r_magics[64]`: `[offset, mask, magic]` per square for rooks

**Conversion approach:**

```javascript
// JS
function calc_rook_attacks_fancymagic(s, occ) {
    let m = r_magics[s];
    let step1 = BigInt.asUintN(64, (occ | m[1]) * m[2])
    let index2 = Number((step1) >> 52n)
    return lookup_table[index2 + m[0]]
}
```

```rust
// Rust
struct Magic {
    offset: usize,
    mask: u64,
    magic: u64,
    shift: u32,
}

static ROOK_MAGICS: [Magic; 64] = [ /* converted from r_magics */ ];
static BISHOP_MAGICS: [Magic; 64] = [ /* converted from b_magics */ ];
static ATTACK_TABLE: [u64; 88507] = [ /* converted from lookup_table */ ];

#[inline]
pub fn rook_attacks(sq: usize, occ: u64) -> u64 {
    let m = &ROOK_MAGICS[sq];
    let idx = ((occ | m.mask).wrapping_mul(m.magic) >> m.shift) as usize;
    ATTACK_TABLE[m.offset + idx]
}

#[inline]
pub fn bishop_attacks(sq: usize, occ: u64) -> u64 {
    let m = &BISHOP_MAGICS[sq];
    let idx = ((occ | m.mask).wrapping_mul(m.magic) >> m.shift) as usize;
    ATTACK_TABLE[m.offset + idx]
}
```

**Note on shift values:** In the JS, rooks use `>> 52n` (12-bit index) and bishops
use `>> 55n` (9-bit index). These are fixed per the fancy magic approach. Verify
against the actual magic-tables.js values.

### Generating the Rust static tables

The easiest approach is a build script (`build.rs`) or a one-time conversion script
that reads `magic-tables.js` and outputs `magic_tables.rs`:

```bash
node scripts/convert-magic-tables.js > rust-movegen/src/magic_tables.rs
```

The conversion script extracts the BigInt values and formats them as Rust `u64` literals.

---

## Board State (JS → Rust)

```javascript
// JS BBBoard fields
stm = 0
counter50 = 0
castlingRights = 0
enpassantSquare = -1
BBP = [[u64 x7], [u64 x7]]  // [color][piece_type]
```

```rust
pub struct Board {
    pub stm: usize,           // 0=white, 1=black
    pub counter50: u8,
    pub castling: u8,         // bits: WK=1, WQ=2, BK=4, BQ=8
    pub ep_square: i8,        // -1 if none, else 0-63
    pub bb: [[u64; 7]; 2],    // bb[color][piece], [color][0] = all pieces

    // Move history
    history: [HistoryEntry; 512],
    ply: usize,

    // Move list (flat arrays, faster than Vec<Move>)
    moves: [Move; 256],
    move_count: usize,
}

#[derive(Copy, Clone)]
struct HistoryEntry {
    from: u8,
    to: u8,
    captured: u8,
    promoted: u8,
    counter50: u8,
    castling: u8,
    ep_square: i8,
}

#[derive(Copy, Clone, Default)]
pub struct Move {
    pub from: u8,
    pub to: u8,
    pub moving: u8,
    pub captured: u8,
    pub promoted: u8,
    pub flags: u8,
}
```

---

## Move Generation Pipeline (JS → Rust)

The JS `generate_bbmoves()` calls these in order:

```rust
impl Board {
    pub fn generate_moves(&mut self) {
        self.move_count = 0;
        self.update_occupancy();
        
        let check_mask = self.generate_check_mask();
        let (pin_hv, pin_d12) = self.generate_pin_masks();
        let enemy_attacks = self.generate_enemy_attacks();
        
        self.generate_pawn_moves(check_mask, pin_hv, pin_d12);
        self.generate_piece_moves(check_mask, pin_hv, pin_d12);
        self.generate_king_moves(enemy_attacks);
    }
}
```

### generate_check_mask (JS → Rust)

```javascript
// JS
generate_checkmask() {
    this.piecechecks[oppside][p] = this.generate_pawnattacks(side, this.ourking) & this.BBP[oppside][p]
    this.piecechecks[oppside][n] = arrKnightAttacks[this.ourkingsq] & this.BBP[oppside][n]
    this.piecechecks[oppside][b] = calc_bishop_attacks(this.ourkingsq, this.totalocc) & (BBP[oppside][b] | BBP[oppside][q])
    this.piecechecks[oppside][r] = calc_rook_attacks(this.ourkingsq, this.totalocc) & (BBP[oppside][r] | BBP[oppside][q])
    // build checkmask from between squares...
}
```

```rust
fn generate_check_mask(&self) -> u64 {
    let opp = 1 - self.stm;
    let king_sq = lsb(self.bb[self.stm][KING]) as usize;
    let occ = self.bb[0][0] | self.bb[1][0];
    
    let pawn_checks = pawn_attacks(self.stm, self.bb[self.stm][KING]) & self.bb[opp][PAWN];
    let knight_checks = KNIGHT_ATTACKS[king_sq] & self.bb[opp][KNIGHT];
    let bishop_checks = bishop_attacks(king_sq, occ) & (self.bb[opp][BISHOP] | self.bb[opp][QUEEN]);
    let rook_checks = rook_attacks(king_sq, occ) & (self.bb[opp][ROOK] | self.bb[opp][QUEEN]);
    
    let checkers = pawn_checks | knight_checks | bishop_checks | rook_checks;
    let num_checks = checkers.count_ones();
    
    if num_checks == 0 { return u64::MAX; }  // no check, all squares valid
    if num_checks > 1 { return 0; }          // double check, only king moves
    
    // Single check: squares between checker and king (inclusive of checker)
    let checker_sq = lsb(checkers) as usize;
    IN_BETWEEN[checker_sq][king_sq] | checkers
}
```

### generate_pin_masks (JS → Rust)

```rust
fn generate_pin_masks(&self) -> (u64, u64) {  // (pin_hv, pin_d12)
    let opp = 1 - self.stm;
    let king_sq = lsb(self.bb[self.stm][KING]) as usize;
    let our_occ = self.bb[self.stm][0];
    let enemy_occ = self.bb[opp][0];
    
    let mut pin_hv = 0u64;
    let mut pin_d12 = 0u64;
    
    // Rook/Queen pins (horizontal/vertical)
    let mut rq = rook_attacks(king_sq, enemy_occ) & (self.bb[opp][ROOK] | self.bb[opp][QUEEN]);
    while rq != 0 {
        let sq = pop_lsb(&mut rq) as usize;
        let between = IN_BETWEEN[sq][king_sq] & our_occ;
        if between.count_ones() == 1 {
            pin_hv |= IN_BETWEEN[sq][king_sq] | sq_bb(sq as u32);
        }
    }
    
    // Bishop/Queen pins (diagonal)
    let mut bq = bishop_attacks(king_sq, enemy_occ) & (self.bb[opp][BISHOP] | self.bb[opp][QUEEN]);
    while bq != 0 {
        let sq = pop_lsb(&mut bq) as usize;
        let between = IN_BETWEEN[sq][king_sq] & our_occ;
        if between.count_ones() == 1 {
            pin_d12 |= IN_BETWEEN[sq][king_sq] | sq_bb(sq as u32);
        }
    }
    
    (pin_hv, pin_d12)
}
```

---

## Precomputed Tables Needed in Rust

Beyond the magic tables, these need to be precomputed at compile time or startup:

```rust
static KNIGHT_ATTACKS: [u64; 64] = [ /* precomputed */ ];
static KING_ATTACKS: [u64; 64] = [ /* precomputed */ ];
static IN_BETWEEN: [[u64; 64]; 64] = [ /* squares between two squares */ ];
static PAWN_ATTACKS: [[u64; 64]; 2] = [ /* [color][sq] */ ];
```

These can be generated with a `build.rs` script or computed with `const fn` in Rust.

The `calc_inBetween` function from `bitboard.js` is the reference implementation.

---

## Make/Unmake (JS → Rust)

The JS `makemove`/`undomove` use bitboard operations:

```javascript
// JS
movepiece(color, piece, from, to) {
    let moveBB = squaretobitboard(from) | squaretobitboard(to)
    this.BBP[color][0] ^= moveBB
    this.BBP[color][ptype(piece)] ^= moveBB
}
```

```rust
// Rust
#[inline]
fn move_piece(&mut self, color: usize, piece: usize, from: u32, to: u32) {
    let mask = sq_bb(from) | sq_bb(to);
    self.bb[color][0] ^= mask;
    self.bb[color][piece] ^= mask;
}

#[inline]
fn add_piece(&mut self, color: usize, piece: usize, sq: u32) {
    let mask = sq_bb(sq);
    self.bb[color][0] |= mask;
    self.bb[color][piece] |= mask;
}

#[inline]
fn remove_piece(&mut self, color: usize, piece: usize, sq: u32) {
    let mask = sq_bb(sq);
    self.bb[color][0] &= !mask;
    self.bb[color][piece] &= !mask;
}
```

**Important bug to avoid** (exists in JS `undomove`): when undoing black castling,
the JS uses `wr` (white rook) instead of `br` (black rook). See `BUG_REPORT.md`
in `asmovegen/` for the full list of bugs found during the AS port — many will
apply to the Rust port too.

---

## WASM Interface

Following the pattern of `asmovegen/export-board.ts`:

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RustBoard {
    inner: Board,
}

#[wasm_bindgen]
impl RustBoard {
    #[wasm_bindgen(constructor)]
    pub fn new() -> RustBoard {
        RustBoard { inner: Board::new() }
    }

    pub fn load_fen(&mut self, fen: &str) {
        self.inner.load_fen(fen);
    }

    pub fn perft(&mut self, depth: u32) -> u64 {
        self.inner.perft(depth)
    }

    pub fn generate_moves(&mut self) {
        self.inner.generate_moves();
    }

    pub fn move_count(&self) -> u32 {
        self.inner.move_count as u32
    }
}
```

---

## Node.js Test Wrapper

Create `tests/rust-node.js` following `tests/as-node.js`:

```javascript
const { RustBoard } = require('../rust-movegen/pkg/rust_movegen.js');

class RustBoardWrapper {
    constructor() {
        this.board = new RustBoard();
    }

    loadFEN(fen) {
        this.board.load_fen(fen);
    }

    perft(depth) {
        return Number(this.board.perft(depth));
    }
}

module.exports = { RustBoard: RustBoardWrapper };
```

Then add to `tests/perft-test.js`:
```javascript
if (options.generator === 'rust' || options.generator === 'both') {
    const { RustBoard } = require('./rust-node.js');
    testGenerator('Rust Generator', RustBoard, positionsToTest);
}
```

---

## Build Commands

```bash
# Build WASM (from rust-movegen/)
wasm-pack build --target nodejs --release

# Run tests
cd movegen
node tests/perft-test.js --generator rust --quick

# Run all generators
node tests/perft-test.js --generator both --quick
```

---

## Known Bugs to Avoid (from AS port)

The AssemblyScript port revealed several bugs that will likely appear in the Rust
port too. See `asmovegen/BUG_REPORT.md` for full details. Summary:

1. **En passant `isEnPassant` evaluated after `ep_square` cleared** — save the
   ep square before overwriting it to -1 in `make_move`.

2. **Wrong pawn color in `undo_move` for en passant** — when undoing, the captured
   pawn color is `opposite(stm)`, not `stm`.

3. **RAYS/IN_BETWEEN array bounds** — ensure all index calculations are within
   array bounds. The AS port had `< 128` where it should have been `< 239`.

4. **Castling undo uses wrong piece color** — the JS `undomove` uses `wr` (white rook)
   when undoing black castling. This is a bug in the JS too but it doesn't affect
   perft because the rook is identified by position, not by piece value in the
   bitboard implementation.

---

## Validation Strategy

Use the standard perft positions from `tests/perft-positions.js`:

| Position | Depth 4 expected |
|----------|-----------------|
| Initial  | 197,281 |
| Kiwipete | 4,085,603 |
| Position 3 | 43,238 |
| Position 4 | 422,333 |
| Position 5 | 2,103,487 |
| Position 6 | 3,894,594 |

Run `node tests/perft-test.js --generator rust --quick` to validate.
All 28 tests (7 positions × depths 1-4) must pass before considering the port complete.

---

## Performance Targets

Once passing perft, benchmark with:
```bash
node tests/perft-test.js --generator rust --depth 6
```

Expected results (Node.js v20+, wasm-pack release build):
- Depth 5: **~15-30M NPS** (vs 5.6M for JS x88, ~2M for JS bitboard)
- Depth 6: **~20-40M NPS**

If performance is below 10M NPS, check:
1. Was `wasm-pack build --release` used? (not `--dev`)
2. Is `lto = true` in `Cargo.toml`?
3. Are the magic table lookups inlined? (`#[inline]` on attack functions)
4. Is the move list a fixed-size array (not `Vec`)? Vec allocation in hot paths kills performance.
