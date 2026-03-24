# Debug Report: AssemblyScript vs JavaScript x88 Perft Comparison

## Summary

We have successfully fixed the root move generation issue (Position 3 now generates 14 moves instead of 15). However, there are still discrepancies in the recursive perft function.

## Key Finding: Different Results Based on Board Reuse

When testing perft at depth 2, we get DIFFERENT results depending on whether we create a new board for each move vs reusing the same board:

### Method 1: Create NEW board for each root move
```typescript
for (let i = 0; i < 48; i++) {
    const board = new Board();
    board.loadFEN(fen);
    board.generateMoves();
    board.makemoveIdx(i);
    board.generateMoves();
    total += board.moveCount;
}
```
Results:
- Initial: **400** ✓
- Kiwipete: **2039** ✓
- Position 3: **191** ✓

### Method 2: Reuse SAME board (perft function)
```typescript
perft(depth: i32): u64 {
    this.generateMoves();
    let nmoves = this.moveCount;
    if (depth == 1) return nmoves;
    let nodes: u64 = 0;
    for (let i = 0; i < nmoves; i++) {
        this.makemoveIdx(i);
        nodes += this.perft(depth - 1);
        this.undomove();
    }
    return nodes;
}
```
Results:
- Initial: **398** ✗ (off by 2)
- Kiwipete: **2020** ✗ (off by 19)
- Position 3: **136** ✗ (off by 55)

## Root Move Generation (Depth 1) - FIXED ✓

All depth 1 tests pass correctly:
- Initial Position: 20 moves ✓
- Kiwipete: 48 moves ✓
- Position 3: 14 moves ✓ (was 15 before fix)

## Bug Fixed in addSliderAttack

The key bug was in the `addSliderAttack` function at line 616:

**Before (incorrect):**
```typescript
this.pinDirection[who][to] = <i8>offset;
```

**After (correct):**
```typescript
this.pinDirection[oppSide][to] = <i8>offset;
```

The pinDirection array stores which side's piece is pinned. When a slider attacks, it pins the OPPOSITE side's piece against their king, so we need `oppSide` (not `who`).

## Additional Fix: Added matingSquares

Added `matingSquares` array to match JS implementation, which is cleared in generateMoves().

## Remaining Issue: Recursive State Management

The discrepancy suggests there's a state management issue in:
1. The recursive `perft` function when iterating on same board
2. Some state not being properly reset between iterations

The issue is NOT with array filling (tested with manual loops). The issue is somewhere in the flow of makemoveIdx -> generateMoves -> undomove when reusing the same board object.

## Test Results

| Position | Depth | Expected | New Board | Same Board | Status |
|----------|-------|----------|-----------|------------|--------|
| Initial | 1 | 20 | 20 | 20 | ✓ |
| Initial | 2 | 400 | 400 | 398 | ✗ |
| Kiwipete | 1 | 48 | 48 | 48 | ✓ |
| Kiwipete | 2 | 2039 | 2039 | 2020 | ✗ |
| Position 3 | 1 | 14 | 14 | 14 | ✓ |
| Position 3 | 2 | 191 | 191 | 136 | ✗ |

## Next Steps

1. Add detailed debugging to trace state changes during recursive perft
2. Compare JS vs AS state after each makemoveIdx and undomove call
3. Check if there's any global state that needs to be reset but isn't
