# Bug Report: AssemblyScript Chess Move Generator

## Status: ALL BUGS FIXED ✅

All 28 perft tests pass (7 positions × 4 depths) with 100% pass rate.

---

## Bug #1 (FIXED): Illegal Pawn Move b5b6 in Position 3

### Symptom
Position 3 (8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1) generated 15 legal moves at depth 1 instead of 14. The extra move was **b5b6** - a pawn push that puts the king in check.

### Root Cause
In `addSliderAttack()`, the pinDirection array was being set for the wrong side:

```typescript
// WRONG
this.pinDirection[who][to] = <i8>offset;

// CORRECT
this.pinDirection[oppSide][to] = <i8>offset;
```

### Fix
Changed `pinDirection[who]` to `pinDirection[oppSide]`.

---

## Bug #2 (FIXED): En Passant - `isEnPassant` evaluated after `enpassantSquare` cleared

### Symptom
En passant captures were never executed correctly in `makemove()`.

### Root Cause
`isEnPassant` was computed using `this.enpassantSquare`, but that field was overwritten to `-1` a few lines earlier:

```typescript
// WRONG: isEnPassant always false because enpassantSquare already = -1
let isEnPassant = isPawnMove && to == this.enpassantSquare;
this.enpassantSquare = -1;  // too late

// CORRECT: save before overwriting
let savedEP = this.enpassantSquare;
let isEnPassant = isPawnMove && to == savedEP;
this.enpassantSquare = -1;
```

### Fix
Save `enpassantSquare` into `savedEP` before clearing it, and use `savedEP` for the `isEnPassant` check and for computing the captured pawn's square.

---

## Bug #3 (FIXED): `undomove()` - Wrong piece color when restoring en passant captured pawn

### Symptom
After undoing an en passant capture, the wrong color pawn was restored to the board.

### Root Cause
```typescript
// WRONG: restores WP (white pawn) when undoing black's en passant capture
this.addpiece(opposite(this.stm), (this.stm == WHITE) ? WP : BP, ...)

// CORRECT: the captured pawn belongs to the side that was captured (opposite of stm)
this.addpiece(opposite(this.stm), (this.stm == WHITE) ? BP : WP, to - (16 * sign))
```

Also used `this.enpassantSquare` (already restored from history) instead of `to` for the square calculation.

### Fix
Corrected the pawn color and used `to` instead of `this.enpassantSquare` for the square.

---

## Bug #4 (FIXED): `addSliderAttack()` - RAYS array bounds check too small

### Symptom
Pins along long diagonals (e.g. b5→e2→f1) were not detected, allowing pinned pieces to make illegal moves. This caused incorrect perft counts at depth 3+ in Kiwipete, Position 4, Position 5, and Position 6.

### Root Cause
The RAYS array has 239 elements (indices 0–238), but the bounds check was `< 128`:

```typescript
// WRONG: indices 128–238 always return 0, missing pins on long diagonals
if (index >= 0 && index < 128) {
    let offset = RAYS[index];

// CORRECT
if (index >= 0 && index < 239) {
    let offset = RAYS[index];
```

The index is computed as `(from - enemyKingSq) + 119`, which can reach up to 238 for squares far apart on the board.

### Fix
Changed bounds check from `< 128` to `< 239` in `addSliderAttack()`.

---

## Bug #5 (FIXED): `addmove()` - Same RAYS bounds check too small

### Symptom
When a pinned piece tried to move, the legality check used the same incorrect bounds, causing some moves along long diagonals to bypass the pin filter.

### Root Cause
Same as Bug #4 — `< 128` instead of `< 239` in the RAYS lookup inside `addmove()`.

### Fix
Changed bounds check from `< 128` to `< 239` in `addmove()`.

---

## Final Test Results

```
node tests/perft-test.js --generator both --quick

Total tests: 84
Passed: 84
Failed: 0
Pass rate: 100.0%
```

| Position        | Depth | Expected    | AS Result   |
|-----------------|-------|-------------|-------------|
| Initial         | 1–4   | ✓           | ✓           |
| Kiwipete        | 1–4   | ✓           | ✓           |
| Position 3      | 1–4   | ✓           | ✓           |
| Position 4      | 1–4   | ✓           | ✓           |
| Position 4 Mir. | 1–4   | ✓           | ✓           |
| Position 5      | 1–4   | ✓           | ✓           |
| Position 6      | 1–4   | ✓           | ✓           |

## References

- Original JS implementation: `js/x88.js`
- AS port: `asmovegen/board.ts`
- Test positions: `tests/perft-positions.js`
