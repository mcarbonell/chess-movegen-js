// Piece type and color constants
export const WHITE: u8 = 0;
export const BLACK: u8 = 1;

export const EMPTY: u8 = 0;
export const PAWN: u8 = 1;
export const KNIGHT: u8 = 2;
export const BISHOP: u8 = 3;
export const ROOK: u8 = 4;
export const QUEEN: u8 = 5;
export const KING: u8 = 6;

export const WP: u8 = 1;
export const WN: u8 = 2;
export const WB: u8 = 3;
export const WR: u8 = 4;
export const WQ: u8 = 5;
export const WK: u8 = 6;
export const BP: u8 = 9;
export const BN: u8 = 10;
export const BB: u8 = 11;
export const BR: u8 = 12;
export const BQ: u8 = 13;
export const BK: u8 = 14;

export const MAXPLY: i32 = 100;

export const FILE_A: i32 = 0;
export const FILE_B: i32 = 1;
export const FILE_C: i32 = 2;
export const FILE_D: i32 = 3;
export const FILE_E: i32 = 4;
export const FILE_F: i32 = 5;
export const FILE_G: i32 = 6;
export const FILE_H: i32 = 7;

export const RANK_1: i32 = 0;
export const RANK_2: i32 = 1;
export const RANK_3: i32 = 2;
export const RANK_4: i32 = 3;
export const RANK_5: i32 = 4;
export const RANK_6: i32 = 5;
export const RANK_7: i32 = 6;
export const RANK_8: i32 = 7;

export const A1: i32 = 0;
export const B1: i32 = 1;
export const C1: i32 = 2;
export const D1: i32 = 3;
export const E1: i32 = 4;
export const F1: i32 = 5;
export const G1: i32 = 6;
export const H1: i32 = 7;

export const A2: i32 = 16;
export const B2: i32 = 17;
export const C2: i32 = 18;
export const D2: i32 = 19;
export const E2: i32 = 20;
export const F2: i32 = 21;
export const G2: i32 = 22;
export const H2: i32 = 23;

export const A8: i32 = 112;
export const B8: i32 = 113;
export const C8: i32 = 114;
export const D8: i32 = 115;
export const E8: i32 = 116;
export const F8: i32 = 117;
export const G8: i32 = 118;
export const H8: i32 = 119;

export const WHITE_CASTLE_K: u8 = 1;
export const WHITE_CASTLE_Q: u8 = 2;
export const BLACK_CASTLE_K: u8 = 4;
export const BLACK_CASTLE_Q: u8 = 8;

export const MASK_CAPTURE: u8 = 1;
export const MASK_PROMOTION: u8 = 1 << 1;
export const MASK_PAWNMOVE: u8 = 1 << 2;
export const MASK_EP: u8 = 1 << 3;
export const MASK_CASTLING: u8 = 1 << 4;
export const MASK_CHECK: u8 = 1 << 5;
export const MASK_DOUBLECHECK: u8 = 1 << 6;
export const MASK_DISCOVERCHECK: u8 = 1 << 7;
export const MASK_SAFE: u8 = 1 << 8;
export const MASK_HANGING: u8 = 1 << 11;
export const MASK_FREECAPTURE: u8 = 1 << 13;
export const MASK_WINNINGCAPTURE: u8 = 1 << 14;

@inline
export function pcolor(piece: u8): i32 {
    return piece == 0 ? -1 : (piece >> 3) & 1;
}

@inline
export function ptype(piece: u8): u8 {
    return piece & 7;
}

@inline
export function makepiece(color: u8, type: u8): u8 {
    return (color << 3) | type;
}

@inline
export function opposite(turn: u8): u8 {
    return 1 - turn;
}

@inline
export function file(sq: i32): i32 {
    return sq & 7;
}

@inline
export function rank(sq: i32): i32 {
    return sq >> 4;
}

@inline
export function validSquare(sq: i32): bool {
    return (sq & 0x88) == 0;
}

@inline
export function square(f: i32, r: i32): i32 {
    return (r << 4) | f;
}

export function fileFromChar(c: i32): i32 {
    return c - 97;
}

export function rankFromChar(c: i32): i32 {
    return c - 49;
}

@inline
export function lowestSetBit(n: i32): i32 {
    if (n == 0) return 32;
    let count: i32 = 0;
    let n32 = <u32>n;
    while ((n32 & 1) == 0) {
        n32 >>= 1;
        count++;
    }
    return count;
}

@inline
export function bitCount(n: i32): i32 {
    let count: i32 = 0;
    let n32 = <u32>n;
    while (n32 != 0) {
        count += n32 & 1;
        n32 >>= 1;
    }
    return count;
}

@inline
export function absI32(x: i32): i32 {
    return x < 0 ? -x : x;
}

@inline
export function parseInt(s: string): i32 {
    let result: i32 = 0;
    for (let i = 0; i < s.length; i++) {
        let c = s.charCodeAt(i);
        if (c >= 48 && c <= 57) { // '0'-'9'
            result = result * 10 + (c - 48);
        }
    }
    return result;
}

@inline
export function popcount64(x: u64): u32 {
    let xx = <u64>x;
    xx = xx - ((xx >> 1) & <u64>0x5555555555555555);
    xx = (xx & <u64>0x3333333333333333) + ((xx >> 2) & <u64>0x3333333333333333);
    xx = (xx + (xx >> 4)) & <u64>0x0f0f0f0f0f0f0f0f;
    return <u32>((xx * <u64>0x0101010101010101) >> 56);
}

@inline
export function lsb64(x: u64): u32 {
    if (x == 0) return 64;
    return <u32>ctz64(x);
}

@inline
export function msb64(x: u64): u32 {
    if (x == 0) return 64;
    return 63 - <u32>clz64(x);
}

@inline
export function ctz64(x: u64): i32 {
    if (x == 0) return 64;
    let count: i32 = 0;
    let x32 = <u32>x;
    if (x32 != 0) {
        while ((x32 & 1) == 0) {
            x32 >>= 1;
            count++;
        }
        return count;
    }
    x32 = <u32>(x >> 32);
    count = 32;
    while ((x32 & 1) == 0) {
        x32 >>= 1;
        count++;
    }
    return count;
}

@inline
export function clz64(x: u64): i32 {
    if (x == 0) return 64;
    let count: i32 = 0;
    let x32 = <u32>(x >> 32);
    if (x32 != 0) {
        while ((x32 & 0x80000000) == 0) {
            x32 <<= 1;
            count++;
        }
        return count;
    }
    x32 = <u32>x;
    count = 32;
    while ((x32 & 0x80000000) == 0) {
        x32 <<= 1;
        count++;
    }
    return count;
}

export const CHECKBIT_PAWN: i32 = 1;
export const CHECKBIT_KNIGHT: i32 = 1 << 1;
export const CHECKBIT_BISHOP: i32 = 1 << 2;
export const CHECKBIT_ROOK: i32 = 1 << 3;
export const CHECKBIT_QUEEN: i32 = CHECKBIT_BISHOP | CHECKBIT_ROOK;
export const CHECKBIT_KING: i32 = 1 << 5;

export const ATTACKBIT_PAWN: i32 = 1;
export const ATTACKBIT_KNIGHT: i32 = 1 << 1;
export const ATTACKBIT_BISHOP: i32 = 1 << 2;
export const ATTACKBIT_ROOK: i32 = 1 << 3;
export const ATTACKBIT_QUEEN: i32 = 1 << 4;
export const ATTACKBIT_KING: i32 = 1 << 5;

@inline
export function checkbit(type: u8): i32 {
    if (type == PAWN) return CHECKBIT_PAWN;
    if (type == KNIGHT) return CHECKBIT_KNIGHT;
    if (type == BISHOP) return CHECKBIT_BISHOP;
    if (type == ROOK) return CHECKBIT_ROOK;
    if (type == QUEEN) return CHECKBIT_QUEEN;
    if (type == KING) return CHECKBIT_KING;
    return 0;
}

@inline
export function attackbit(type: u8): i32 {
    if (type == PAWN) return ATTACKBIT_PAWN;
    if (type == KNIGHT) return ATTACKBIT_KNIGHT;
    if (type == BISHOP) return ATTACKBIT_BISHOP;
    if (type == ROOK) return ATTACKBIT_ROOK;
    if (type == QUEEN) return ATTACKBIT_QUEEN;
    if (type == KING) return ATTACKBIT_KING;
    return 0;
}

// Offset arrays for piece movement
export const OFFSETS_KNIGHT: i32[] = [-18, -33, -31, -14, 18, 33, 31, 14];
export const OFFSETS_BISHOP: i32[] = [-17, -15, 17, 15];
export const OFFSETS_ROOK: i32[] = [-16, 1, 16, -1];
export const OFFSETS_QUEEN: i32[] = [-17, -16, -15, 1, 17, 16, 15, -1];
export const OFFSETS_KING: i32[] = [-17, -16, -15, 1, 17, 16, 15, -1];

// FEN piece character mapping
export function charToPiece(c: string): u8 {
    if (c == 'P') return WP;
    if (c == 'N') return WN;
    if (c == 'B') return WB;
    if (c == 'R') return WR;
    if (c == 'Q') return WQ;
    if (c == 'K') return WK;
    if (c == 'p') return BP;
    if (c == 'n') return BN;
    if (c == 'b') return BB;
    if (c == 'r') return BR;
    if (c == 'q') return BQ;
    if (c == 'k') return BK;
    return EMPTY;
}

export function pieceToChar(p: u8): string {
    if (p == WP) return 'P';
    if (p == WN) return 'N';
    if (p == WB) return 'B';
    if (p == WR) return 'R';
    if (p == WQ) return 'Q';
    if (p == WK) return 'K';
    if (p == BP) return 'p';
    if (p == BN) return 'n';
    if (p == BB) return 'b';
    if (p == BR) return 'r';
    if (p == BQ) return 'q';
    if (p == BK) return 'k';
    return '.';
}

export const RAYS: i32[] = [
    17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0,
    0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0,
    0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,
    0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0,
    0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0,
    0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0,
    0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0,
    0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0,
    0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,
    -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17
];

export const PIECE_BY_OFFSET: i32[] = [
    0, CHECKBIT_ROOK, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    CHECKBIT_ROOK, 0, CHECKBIT_BISHOP, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

@inline
export function getRay(from: i32, to: i32): i32 {
    let index = to - from + 119;
    if (index >= 0 && index < 128) {
        return RAYS[index];
    }
    return 0;
}
