# Bug Report: AssemblyScript Chess Move Generator

## Executive Summary

The AssemblyScript port of the x88 chess move generator passes all depth-1 perft tests but fails at depth 2+. The root cause is a state management bug in the recursive `perft()` function when reusing the same Board object for multiple move generations.

## Bug #1 (FIXED): Illegal Pawn Move b5b6 in Position 3

### Symptom
Position 3 (8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1) generated 15 legal moves at depth 1 instead of 14. The extra move was **b5b6** - a pawn push that puts the king in check.

### Root Cause
In `addSliderAttack()` (board.ts:616), the pinDirection array was being set incorrectly:

```typescript
// ANTES (incorrecto)
this.pinDirection[who][to] = <i8>offset;

// DESPUÉS (correcto)  
this.pinDirection[oppSide][to] = <i8>offset;
```

The pinDirection array stores which side's piece is pinned. When a slider attacks, it pins the **opposite** side's piece against their king, so we need `oppSide` (not `who`).

### Fix Applied
Changed line 616 in board.ts from `pinDirection[who]` to `pinDirection[oppSide]`.

---

## Bug #2 (OPEN): Recursive Perft State Corruption

### Symptom
When using the recursive `perft()` function on the **same Board object**, the move count is incorrect:
- Creating **new Board** for each root move: ✅ Correct (2039)
- Reusing **same Board** with perft(): ❌ Wrong (2020)

```
| Position   | Depth | Expected | New Board | Same Board |
|------------|-------|----------|-----------|------------|
| Initial    | 1     | 20       | 20 ✓      | 20 ✓       |
| Initial    | 2     | 400      | 400 ✓     | 398 ✗      |
| Kiwipete   | 1     | 48       | 48 ✓      | 48 ✓       |
| Kiwipete   | 2     | 2039     | 2039 ✓    | 2020 ✗     |
| Position 3 | 1     | 14       | 14 ✓      | 14 ✓       |
| Position 3 | 2     | 191      | 191 ✓     | 136 ✗      |
```

### Investigation Steps Taken

1. **Verified generateMoves() clears all arrays** ✅
   - `attacks`, `numattacks`, `inchekValidSquares`, `pinDirection`, `chekingSquares`, `matingSquares`, `kingescapes`, `kingschecks` are all cleared with `.fill(0)`

2. **Verified perft(1) returns same as moveCount** ✅
   - After `makemoveIdx(i)` + `generateMoves()`, `board.moveCount` equals `board.perft(1)`

3. **Tested different iteration patterns**:
   - New board per move: 2039 ✓
   - Same board, iterate with makemoveIdx → generateMoves → undomove: 2020 ✗
   - Same board with perft(): 2020 ✗

4. **Verified JS implementation**: JavaScript x88.js works correctly with both approaches

### Suspected Root Cause

The issue is likely in one of these areas:

1. **undomove()** doesn't restore some critical state
2. **makemoveIdx()** modifies state that should persist across the iteration but isn't being handled correctly
3. Some **global state** in generateMoves() isn't being properly reset

### Missing Features (Added)

Added `matingSquares` array to match JS implementation:
```typescript
matingSquares: Int32Array[] = [new Int32Array(128), new Int32Array(128)];
```

Also added clearing in `generateMoves()`:
```typescript
this.matingSquares[i].fill(0);
```

---

## Current State of Port

### ✅ Working Correctly
- Root move generation (depth 1) for all test positions
- Pin detection (after Bug #1 fix)
- Move legality checking
- Basic move generation

### ❌ Not Working
- Recursive perft() at depth 2+ when reusing same Board object

### Files Modified
- `asmovegen/board.ts` - Main Board class
- `asmovegen/constants.ts` - Constants and helpers
- `asmovegen/test.ts` - Test functions

### Key Functions to Debug
1. `perft()` - recursive move counting
2. `makemoveIdx()` - make a move by index
3. `undomove()` - undo last move
4. `generateMoves()` - generate all legal moves

---

## Next Steps

To fix Bug #2, recommend:

1. Add detailed state snapshots before/after each makemoveIdx and undomove
2. Compare AS state with JS state at each step
3. Check if any array isn't being properly restored in undomove()
4. Verify history management (castling, en-passant, 50-move counter)

---

## Test Commands

```bash
# Run perft tests
cd movegen
node tests/perft-test.js --quick

# Run AS tests
cd asmovegen
node run-test.js
```

## References

- Original JS implementation: `js/x88.js`
- AS port: `asmovegen/board.ts`
- Test positions: `tests/perft-positions.js`
