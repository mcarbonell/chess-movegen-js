"use strict";

// Piece type and color constants (needed for Node.js)
var white = 0;
var black = 1;
var empty = 0;
var p = 1;
var n = 2;
var b = 3;
var r = 4;
var q = 5;
var k = 6;
var wp = 1;
var wn = 2;
var wb = 3;
var wr = 4;
var wq = 5;
var wk = 6;
var bp = wp + 8;
var bn = wn + 8;
var bb = wb + 8;
var br = wr + 8;
var bq = wq + 8;
var bk = wk + 8;

// Maximum ply depth for history
var MAXPLY = 100;

// Helper functions for FEN parsing and move notation
function fileFromChar(char) {
    return char.charCodeAt(0) - 'a'.charCodeAt(0);
}

function rankFromChar(char) {
    return char.charCodeAt(0) - '1'.charCodeAt(0);
}

function fileToChar(file) {
    return String.fromCharCode('a'.charCodeAt(0) + file);
}

function rankToChar(rank) {
    return String.fromCharCode('1'.charCodeAt(0) + rank);
}

function pcolor(piece) {
    return (piece === 0) ? -1 : (piece & 8) >>> 3;
}

function ptype(piece) {
    return (piece & 7) >>> 0;
}

function makepiece(pcolor, ptype) {
    return (pcolor << 3) + ptype;
}

function pieceChar(piece) {
    return charpieces[piece];
}

function opposite(turn) {
    return 1 - turn;
}

// Piece character arrays
var pieces = '.♟♚♞♝♜♛  ♙♔♘♗♖♕';
var diagpieces = [' ', '♟', '♞', '♝', '♜', '♛', '♚', '', '', '♙', '♘', '♗', 'r', '♖', '♔', ''];
var charpieces = [' ', 'P', 'N', 'B', 'R', 'Q', 'K', '', '', 'p', 'n', 'b', 'r', 'q', 'k', ''];

// Castling rights
var whitecancastleK = 1;
var whitecancastleQ = 2;
var blackcancastleK = 4;
var blackcancastleQ = 8;

// Move mask constants
var mask_capture = 1;
var mask_promotion = 1 << 1;
var mask_pawnmove = 1 << 2;
var mask_pawn2 = 1 << 15;
var mask_ep = 1 << 3;
var mask_castling = 1 << 4;
var mask_check = 1 << 5;
var mask_doublecheck = 1 << 6;
var mask_discovercheck = 1 << 7;
var mask_safe = 1 << 8;
var mask_protected = 1 << 9;
var mask_insecure = 1 << 10;
var mask_hanging = 1 << 11;
var mask_goodcapture = 1 << 12;
var mask_freecapture = 1 << 13;
var mask_winningcapture = 1 << 14;

// Bit manipulation helpers
function lowestSetBit(n) {
    if (n === 0) return 32;
    let count = 0;
    while ((n & 1) === 0) {
        n >>>= 1;
        count++;
    }
    return count;
}


function file64(square) {
    return square & 7;
}

function rank64(square) {
    return square >>> 3;
}

function square64(file, rank) {
    return file + rank * 8
}

function squareto64(squarex88) {
    return square64(file(squarex88), rank(squarex88))
}



function square64FromStr(str) {
    return square64(fileFromChar(str[0]), rankFromChar(str[1]))
}


function square64ToStr(sq) {
    return fileToChar(file64(sq)) + rankToChar(rank64(sq))
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BITBOARDS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



var _a1 = 0
var _b1 = 1
var _c1 = 2
var _d1 = 3
var _e1 = 4
var _f1 = 5
var _g1 = 6
var _h1 = 7

var _a2 = _a1 + 8
var _b2 = _b1 + 8
var _c2 = _c1 + 8
var _d2 = _d1 + 8
var _e2 = _e1 + 8
var _f2 = _f1 + 8
var _g2 = _g1 + 8
var _h2 = _h1 + 8

var _a3 = _a2 + 8
var _b3 = _b2 + 8
var _c3 = _c2 + 8
var _d3 = _d2 + 8
var _e3 = _e2 + 8
var _f3 = _f2 + 8
var _g3 = _g2 + 8
var _h3 = _h2 + 8

var _a4 = _a3 + 8
var _b4 = _b3 + 8
var _c4 = _c3 + 8
var _d4 = _d3 + 8
var _e4 = _e3 + 8
var _f4 = _f3 + 8
var _g4 = _g3 + 8
var _h4 = _h3 + 8

var _a5 = _a4 + 8
var _b5 = _b4 + 8
var _c5 = _c4 + 8
var _d5 = _d4 + 8
var _e5 = _e4 + 8
var _f5 = _f4 + 8
var _g5 = _g4 + 8
var _h5 = _h4 + 8

var _a6 = _a5 + 8
var _b6 = _b5 + 8
var _c6 = _c5 + 8
var _d6 = _d5 + 8
var _e6 = _e5 + 8
var _f6 = _f5 + 8
var _g6 = _g5 + 8
var _h6 = _h5 + 8

var _a7 = _a6 + 8
var _b7 = _b6 + 8
var _c7 = _c6 + 8
var _d7 = _d6 + 8
var _e7 = _e6 + 8
var _f7 = _f6 + 8
var _g7 = _g6 + 8
var _h7 = _h6 + 8

var _a8 = _a7 + 8
var _b8 = _b7 + 8
var _c8 = _c7 + 8
var _d8 = _d7 + 8
var _e8 = _e7 + 8
var _f8 = _f7 + 8
var _g8 = _g7 + 8
var _h8 = _h7 + 8 // 63 


function dec2bin(dec, minlenght = 0) {
    let value = BigInt(dec).toString(2);

    if (minlenght > 0) {
        while (value.length < minlenght) {
            value = '0' + value
        }
    }

    return value
    // return BigInt(dec >>> 0).toString(2);
}

function bitCount(n) {
    var tmp = n;
    var count = 0;
    while (tmp > 0n) {
        tmp = tmp & (tmp - 1);
        count++;
    }
    return count;
}

function bitCountBigInt(n) {
    var tmp = n
    var count = 0
    while (tmp > 0n) {
        tmp = tmp & (tmp - 1n)
        count++
    }
    return count
}

// From https://graphics.stanford.edu/~seander/bithacks.html
// This appeared to be the fastest
function BBbitCount(bitboard) {
    const left32 = Number(bitboard & 0xffffffffn) | 0
    const right32 = Number(bitboard >> 32n) | 0

    function count32(n) {
        n = n - ((n >> 1) & 0x55555555);
        n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
        return (((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24) | 0
    }

    return count32(left32) + count32(right32)
}

function BBbitCount__3(bits) {
    const left32 = Number(bits & 0xffffffffn)
    const right32 = Number(bits >> 32n)

    return bitCount(left32) + bitCount(right32)
}

function BBbitCount__1(bits) {
    let r = 0
    for (; bits > 0n; r++, bits &= (bits - 1n))
        return r;
}

function BBbitCount__0(b) { // BUG
    let c = b
        - ((b >> 1n) & 0x7777777777777777n)
        - ((b >> 2n) & 0x3333333333333333n)
        - ((b >> 3n) & 0x1111111111111111n)

    c = ((c + (c >> 4n)) & 0x0F0F0F0F0F0F0F0Fn) * 0x0101010101010101n;

    return BigInt(c >> 56n)
}


// https://stackoverflow.com/questions/62084510/efficiently-getting-most-and-least-significant-bit-in-javascript

/*
https://webassembly.github.io/wabt/demo/wat2wasm/

(module
  (func (export "lz64")  (param i64) (result i64)
    local.get 0
    i64.clz
  )  
)

AGFzbQEAAAABBgFgAX4BfgMCAQAHCAEEbHo2NAAACgcBBQAgAHkLAAoEbmFtZQIDAQAA

var wasmInstance =
      new WebAssembly.Instance(wasmModule, {});
var { lz64 } = wasmInstance.exports;
console.log(lz64(0xFFFFFFFFFFFFFFFFn));




export function clz(n: i64): i64 {
  
  return i64.clz(n)
}

export function ctz(n: i64): i64 {
  
  return i64.ctz(n)
}

export function popcnt(n: i64): i64 {
  
  return i64.popcnt(n)
}


;; INFO asc module.ts --textFile module.wat --outFile module.wasm --bindings raw -O3 --runtime stub
(module
 (type $i64_=>_i64 (func (param i64) (result i64)))
 (memory $0 0)
 (export "clz" (func $module/clz))
 (export "ctz" (func $module/ctz))
 (export "popcnt" (func $module/popcnt))
 (export "memory" (memory $0))
 (func $module/clz (param $0 i64) (result i64)
  local.get $0
  i64.clz
 )
 (func $module/ctz (param $0 i64) (result i64)
  local.get $0
  i64.ctz
 )
 (func $module/popcnt (param $0 i64) (result i64)
  local.get $0
  i64.popcnt
 )
)

*/


var lookup67 = [
    64, 0, 1, 39, 2, 15, 40, 23,
    3, 12, 16, 59, 41, 19, 24, 54,
    4, -1, 13, 10, 17, 62, 60, 28,
    42, 30, 20, 51, 25, 44, 55, 47,
    5, 32, -1, 38, 14, 22, 11, 58,
    18, 53, 63, 9, 61, 27, 29, 50,
    43, 46, 31, 37, 21, 57, 52, 8,
    26, 49, 45, 36, 56, 7, 48, 35,
    6, 34, 33, -1
]

function BBbitScanForward(bb) {
    return (lookup67[(bb & -bb) % 67n]) | 0;
}

var magicBSF = [
    63, 0, 58, 1, 59, 47, 53, 2,
    60, 39, 48, 27, 54, 33, 42, 3,
    61, 51, 37, 40, 49, 18, 28, 20,
    55, 30, 34, 11, 43, 14, 22, 4,
    62, 57, 46, 52, 38, 26, 32, 41,
    50, 36, 17, 19, 29, 10, 13, 21,
    56, 45, 25, 31, 35, 16, 9, 12,
    44, 24, 15, 8, 23, 7, 6, 5
]

function BBbitScanForward__1(b) {

    let index = BigInt.asUintN(64, ((b & (-b)) * 0x07EDD5E59A4E28C2n)) >> 58n
    let value = magicBSF[index]
    // if (typeof value == "undefined" ) { debugger }
    return Number(value)
}



// a function that determines the bit-index of the least significant 1 bit (LS1B)
// Forward == LSB
function BBbitScanForward__0(bb) {
    // if (!bb) return -1
    return BBbitCount((bb & -bb) - 1n);
}

function bsf(bb) {
    return BBbitScanForward(bb)
}

function msb(bb) {
    return BBbitScanReverse(bb)
}

function lsb(bb) {
    return BBbitScanForward(bb)
}


function is_single_bit(b) {
    return (b & (b - 1n)) == 0;
}


function hibit__0(n) {
    n |= (n >> 1n);
    n |= (n >> 2n);
    n |= (n >> 4n);
    n |= (n >> 8n);
    n |= (n >> 16n);
    n |= (n >> 32n);
    return n - (n >> 1n);
}


function hibit(x) {
    let y = x

    do {
        x = y
        y = x & (x - 1n); //remove low order bit
    } while (y)

    return x
}



function byte_msb(bb) {
    let result = 0
    if (bb > 0x0F) {
        bb >>= 4;
        result += 4;
    }
    if (bb > 0x07) {
        bb >>= 2;
        result += 2;
    }
    if (bb > 0x03) {
        bb >>= 1;
        result += 1;
    }
    if (bb > 0x01) {
        result += 1;
    }
    return result
}

let ms1bTable = new Uint8Array(256)
for (let i = 0; i < 256; i++) {
    ms1bTable[i] = byte_msb(i)
}

// console.log(ms1bTable)

// or the most significant 1 bit (MS1B) in an integer such as bitboards.
function BBbitScanReverse(bb) {

    // if (!bb) return -1

    let result = 0
    if (bb > 0xFFFFFFFFn) {
        bb >>= 32n;
        result = 32;
    }
    if (bb > 0xFFFFn) {
        bb >>= 16n;
        result += 16;
    }
    if (bb > 0xFFn) {
        bb >>= 8n;
        result += 8;
    }

    return result + ms1bTable[bb];
    /*
    if (bb > 0x0Fn) {
        bb >>= 4n;
        result += 4;
    }
    if (bb > 0x07n) {
        bb >>= 2n;
        result += 2;
    }
    if (bb > 0x03n) {
        bb >>= 1n;
        result += 1;
    }
    if (bb > 0x01n) {
        result += 1;
    }

    return result 
    */
}



var index64 = [
    0, 47, 1, 56, 48, 27, 2, 60,
    57, 49, 41, 37, 28, 16, 3, 61,
    54, 58, 35, 52, 50, 42, 21, 44,
    38, 32, 29, 23, 17, 11, 4, 62,
    46, 55, 26, 59, 40, 36, 15, 53,
    34, 51, 20, 43, 31, 22, 10, 45,
    25, 39, 14, 33, 19, 30, 9, 24,
    13, 18, 8, 12, 7, 6, 5, 63
]

function BBbitScanForward__0(bb) {
    const debruijn64 = 0x03f79d71b4cb0a89n
    if (!bb) return -1

    let index = BigInt.asUintN(64, ((bb ^ (bb - 1n)) * debruijn64)) >> 58n
    return index64[index];
}

function BBbitScanReverse__0(bb) {

    if (!bb) return -1

    const debruijn64 = 0x03f79d71b4cb0a89n
    bb |= bb >> 1n
    bb |= bb >> 2n
    bb |= bb >> 4n
    bb |= bb >> 8n
    bb |= bb >> 16n
    bb |= bb >> 32n
    let index = BigInt.asUintN(64, (bb * debruijn64)) >> 58n

    return index64[index];
}



// highest_bit_unrolled
function BBbitScanReverse__1(n) {
    if (n & 0x7FFFFFFF00000000n) {
        if (n & 0x7FFF000000000000n) {
            if (n & 0x7F00000000000000n) {
                if (n & 0x7000000000000000n) {
                    if (n & 0x4000000000000000n)
                        return 63;
                    else
                        return (n & 0x2000000000000000n) ? 62 : 61;
                } else {
                    if (n & 0x0C00000000000000n)
                        return (n & 0x0800000000000000n) ? 60 : 59;
                    else
                        return (n & 0x0200000000000000n) ? 58 : 57;
                }
            } else {
                if (n & 0x00F0000000000000n) {
                    if (n & 0x00C0000000000000n)
                        return (n & 0x0080000000000000n) ? 56 : 55;
                    else
                        return (n & 0x0020000000000000n) ? 54 : 53;
                } else {
                    if (n & 0x000C000000000000n)
                        return (n & 0x0008000000000000n) ? 52 : 51;
                    else
                        return (n & 0x0002000000000000n) ? 50 : 49;
                }
            }
        } else {
            if (n & 0x0000FF0000000000n) {
                if (n & 0x0000F00000000000n) {
                    if (n & 0x0000C00000000000n)
                        return (n & 0x0000800000000000n) ? 48 : 47;
                    else
                        return (n & 0x0000200000000000n) ? 46 : 45;
                } else {
                    if (n & 0x00000C0000000000n)
                        return (n & 0x0000080000000000n) ? 44 : 43;
                    else
                        return (n & 0x0000020000000000n) ? 42 : 41;
                }
            } else {
                if (n & 0x000000F000000000n) {
                    if (n & 0x000000C000000000n)
                        return (n & 0x0000008000000000n) ? 40 : 39;
                    else
                        return (n & 0x0000002000000000n) ? 38 : 37;
                } else {
                    if (n & 0x0000000C00000000n)
                        return (n & 0x0000000800000000n) ? 36 : 35;
                    else
                        return (n & 0x0000000200000000n) ? 34 : 33;
                }
            }
        }
    } else {
        if (n & 0x00000000FFFF0000n) {
            if (n & 0x00000000FF000000n) {
                if (n & 0x00000000F0000000n) {
                    if (n & 0x00000000C0000000n)
                        return (n & 0x0000000080000000n) ? 32 : 31;
                    else
                        return (n & 0x0000000020000000n) ? 30 : 29;
                } else {
                    if (n & 0x000000000C000000n)
                        return (n & 0x0000000008000000n) ? 28 : 27;
                    else
                        return (n & 0x0000000002000000n) ? 26 : 25;
                }
            } else {
                if (n & 0x0000000000F00000n) {
                    if (n & 0x0000000000C00000n)
                        return (n & 0x0000000000800000n) ? 24 : 23;
                    else
                        return (n & 0x0000000000200000n) ? 22 : 21;
                } else {
                    if (n & 0x00000000000C0000n)
                        return (n & 0x0000000000080000n) ? 20 : 19;
                    else
                        return (n & 0x0000000000020000n) ? 18 : 17;
                }
            }
        } else {
            if (n & 0x000000000000FF00n) {
                if (n & 0x000000000000F000n) {
                    if (n & 0x000000000000C000n)
                        return (n & 0x0000000000008000n) ? 16 : 15;
                    else
                        return (n & 0x0000000000002000n) ? 14 : 13;
                } else {
                    if (n & 0x0000000000000C00n)
                        return (n & 0x0000000000000800n) ? 12 : 11;
                    else
                        return (n & 0x0000000000000200n) ? 10 : 9;
                }
            } else {
                if (n & 0x00000000000000F0n) {
                    if (n & 0x00000000000000C0n)
                        return (n & 0x0000000000000080n) ? 8 : 7;
                    else
                        return (n & 0x0000000000000020n) ? 6 : 5;
                } else {
                    if (n & 0x000000000000000Cn)
                        return (n & 0x0000000000000008n) ? 4 : 3;
                    else
                        return (n & 0x0000000000000002n) ? 2 : (n ? 1 : 0);
                }
            }
        }
    }
}







function sq64(bb) {
    return BBbitScanForward(bb)
}

function randomInt32() {
    return Number(Math.random() * 2147483647 | 0)
}

function lowestSetBit(value) {
    return BigInt((value) & (-value))
}



// Zero High Bits Starting with Specified Bit Position
function bzhi(src, sq) {
    return src & ((1n << BigInt(sq)) - 1n)
}

// Gets mask up to lowest set bit.
function blsmsk(x) {
    return x ^ (x - 1n)
}


function positive(sq) {
    return -2n << BigInt(sq)
}

function negative(sq) {
    return (1n << BigInt(sq)) - 1n
}



function byteswap(b) {

    b = ((b >> 8n) & 0x00FF00FF00FF00FFn) | ((b & 0x00FF00FF00FF00FFn) << 8n);
    b = ((b >> 16n) & 0x0000FFFF0000FFFFn) | ((b & 0x0000FFFF0000FFFFn) << 16n);

    return (b >> 32n) | (b << 32n)
    // return BigInt.asUintN(64, (b >> 32n) | (b << 32n))
}



function setBit(board, square) {
    return board |= 1n << BigInt(square)
}

function removeBit(board, square) {
    return board &= ~(1n << BigInt(square))
}

function getBit(board, square) {
    return board & (1n << BigInt(square))
}

/* 
    * Array lookup for bigint of square is
    * faster than casting number to bigint
    */
var numberBigInt = [
    0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n,
    8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n,
    16n, 17n, 18n, 19n, 20n, 21n, 22n, 23n,
    24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n,
    32n, 33n, 34n, 35n, 36n, 37n, 38n, 39n,
    40n, 41n, 42n, 43n, 44n, 45n, 46n, 47n,
    48n, 49n, 50n, 51n, 52n, 53n, 54n, 55n,
    56n, 57n, 58n, 59n, 60n, 61n, 62n, 63n, 64n,
]

var universe = 0xffffffffffffffffn;

var aFile = 0x0101010101010101n
var bFile = 0x0202020202020202n
var cFile = 0x0404040404040404n
var dFile = 0x0808080808080808n
var eFile = 0x1010101010101010n
var fFile = 0x2020202020202020n
var gFile = 0x4040404040404040n
var hFile = 0x8080808080808080n

var notAFile = ~aFile
var notBFile = ~bFile
var notCFile = ~cFile
var notDFile = ~dFile
var notEFile = ~eFile
var notFFile = ~fFile
var notGFile = ~gFile
var notHFile = ~hFile

var notABFile = ~aFile & ~bFile
var notGHFile = ~gFile & ~hFile

var bbrank8 = 0xFF00000000000000n
var bbrank7 = 0x00FF000000000000n
var bbrank6 = 0x0000FF0000000000n
var bbrank5 = 0x000000FF00000000n
var bbrank4 = 0x00000000FF000000n
var bbrank3 = 0x0000000000FF0000n
var bbrank2 = 0x000000000000FF00n
var bbrank1 = 0x00000000000000FFn

var bborders = bbrank1 | bbrank8 | aFile | hFile

var bbpromotion = bbrank8 | bbrank1

var lightBB = 0x55AA55AA55AA55AAn
var darkBB = 0xAA55AA55AA55AA55n

var maindia = 0x8040201008040201n;
var mainantidia = 0x0102040810204080n;

function nortOne(b) { return b << 8n }
function soutOne(b) { return b >> 8n }

function eastOne(b) { return (b << 1n) & notAFile }
function noEaOne(b) { return (b << 9n) & notAFile }
function soEaOne(b) { return (b >> 7n) & notAFile }
function westOne(b) { return (b >> 1n) & notHFile }
function soWeOne(b) { return (b >> 9n) & notHFile }
function noWeOne(b) { return (b << 7n) & notHFile }

function noNoEa(b) { return (b << 17n) & notAFile }
function noEaEa(b) { return (b << 10n) & notABFile }
function soEaEa(b) { return (b >> 6n) & notABFile }
function soSoEa(b) { return (b >> 15n) & notAFile }
function noNoWe(b) { return (b << 15n) & notHFile }
function noWeWe(b) { return (b << 6n) & notGHFile }
function soWeWe(b) { return (b >> 10n) & notGHFile }
function soSoWe(b) { return (b >> 17n) & notHFile }

function noNoEa(b) { return (b & notHFile) << 17n }
function noEaEa(b) { return (b & notGHFile) << 10n }
function soEaEa(b) { return (b & notGHFile) >> 6n }
function soSoEa(b) { return (b & notHFile) >> 15n }
function noNoWe(b) { return (b & notAFile) << 15n }
function noWeWe(b) { return (b & notABFile) << 6n }
function soWeWe(b) { return (b & notABFile) >> 10n }
function soSoWe(b) { return (b & notAFile) >> 17n }

let arrKnightAttacks = new BigUint64Array(64)
let arrKingAttacks = new BigUint64Array(64)
let arrRookAttacks = new BigUint64Array(64)
let arrBishopAttacks = new BigUint64Array(64)

let arrFileMask = new BigUint64Array(64)
let arrRankMask = new BigUint64Array(64)
let arrDiagonalMask = new BigUint64Array(64)
let arrAntiDiagMask = new BigUint64Array(64)
let arrPositive = new BigUint64Array(64)
let arrNegative = new BigUint64Array(64)

let arrSquareBit = new BigUint64Array(64)
let arrinBetween = []
let arrinBetweenIncluded = []
let RANK_ATTACK = new Uint8Array(512)


function squaretobitboard(square64) {
    return arrSquareBit[square64]
    // return ( 1n << BigInt(square64) )
}

function knightAttacks(sq) { return arrKnightAttacks[sq] }
function kingAttacks(sq) { return arrKingAttacks[sq] }
function rookAttacks(sq) { return arrRookAttacks[sq] }
function bishopAttacks(sq) { return arrBishopAttacks[sq] }


/////////////////////////////////////////////////////////////////////////////////////
// FILL
/////////////////////////////////////////////////////////////////////////////////////
function knightFill(knights) { return calcknightAttacks(knights) | knights }

function calckingAttacks(kingSet) {
    let sq = bsf(kingSet)
    let attacks = eastOne(kingSet) | westOne(kingSet);
    kingSet |= attacks;
    attacks |= nortOne(kingSet) | soutOne(kingSet);

    if (sq === _h8) {
        attacks = removeBit(attacks, _a8)
    }

    return attacks;
}

// Clamp the value to 64-bits, otherwise it might go larger
// return BigInt.asUintN(64, attacks);

function calcknightAttacks(knights) {
    let east = eastOne(knights);
    let west = westOne(knights);
    let attacks = (east | west) << 16n;
    attacks |= (east | west) >> 16n;
    east = eastOne(east);
    west = westOne(west);
    attacks |= (east | west) << 8n;
    attacks |= (east | west) >> 8n;

    if (bsf(knights) === _g8) {
        attacks = removeBit(attacks, _a8)
    }

    if (bsf(knights) === _h8) {
        attacks = removeBit(attacks, _a7)
        attacks = removeBit(attacks, _b8)
    }

    return attacks
}


/////////////////////////////////////////////////////////////////////////////////////
function rankMask(sq) { return (0xffn) << BigInt(sq & 56) }
function fileMask(sq) { return (0x0101010101010101n) << BigInt(sq & 7) }

function diagonalMask(sq) {
    let diag = (sq & 7) - (sq >> 3);
    return (diag >= 0) ? maindia >> BigInt(diag * 8) : maindia << BigInt(-diag * 8);
}

function antiDiagMask(sq) {
    let diag = 7 - (sq & 7) - (sq >> 3);
    return (diag >= 0) ? mainantidia >> BigInt(diag * 8) : mainantidia << BigInt(-diag * 8);
}
/////////////////////////////////////////////////////////////////////////////////////


/*
function file_attacks(sq, occ) {
    occ &= fileMask(sq) & ~arrSquareBit[sq]

    return ((occ - arrSquareBit[sq]) ^ byteswap(byteswap(occ) - arrSquareBit[sq ^ 56])) & fileMask(sq)
}

function diag_attacks(sq, occ) {
    occ &= diagonalMask(sq) & ~arrSquareBit[sq]

    return ((occ - arrSquareBit[sq]) ^ byteswap(byteswap(occ) - arrSquareBit[sq ^ 56])) & diagonalMask(sq)
}

function adiag_attacks(sq, occ) {
    occ &= antiDiagMask(sq) & ~arrSquareBit[sq]

    return ((occ - arrSquareBit[sq]) ^ byteswap(byteswap(occ) - arrSquareBit[sq ^ 56])) & antiDiagMask(sq)
}



U64 xrayRookAttacks(U64 occ, U64 blockers, enumSquare rookSq) {
   U64 attacks = rookAttacks(occ, rookSq);
   blockers &= attacks;
   return attacks ^ rookAttacks(occ ^ blockers, rookSq);
}

U64 xrayBishopAttacks(U64 occ, U64 blockers, enumSquare bishopSq) {
   U64 attacks = bishopAttacks(occ, bishopSq);
   blockers &= attacks;
   return attacks ^ bishopAttacks(occ ^ blockers, bishopSq);
}


*/





/////////////////////////////////////////////////////////////////////////////////////
// HIPERBOLA QUINTESSENCE
// Hyperbola Quintessence algorithm (for sliding pieces)
/////////////////////////////////////////////////////////////////////////////////////
/* Generate attack for ranks. */
function rank_attacks(sq, occ) {
    let file_mask = sq & 7;
    let rank_mask = sq & 56;
    let o = (occ >> numberBigInt[rank_mask]) & 126n;

    return BigInt(RANK_ATTACK[Number(o) * 4 + file_mask]) << numberBigInt[rank_mask]
}

function attacks(sq, occ, attacks) {
    occ &= attacks & ~arrSquareBit[sq]

    let step1 = (occ - arrSquareBit[sq])
    let step2 = byteswap(occ) - arrSquareBit[sq ^ 56]
    let step3 = byteswap(step2)
    return BigInt.asUintN(64, (step1 ^ step3)) & attacks
}

function calc_rook_attacks_hq(sq, occ) {
    return attacks(sq, occ, arrFileMask[sq]) | rank_attacks(sq, occ);
}

function calc_bishop_attacks_hq(sq, occ) {
    return attacks(sq, occ, arrDiagonalMask[sq]) | attacks(sq, occ, arrAntiDiagMask[sq]);
}

/////////////////////////////////////////////////////////////////////////////////////
// NO HEADACHES
/////////////////////////////////////////////////////////////////////////////////////
var maskh8 = hFile | bbrank8
var maska8 = aFile | bbrank8
var maska1 = aFile | bbrank1
var maskh1 = hFile | bbrank1
function calc_bishop_attacks_easy(sq, occ) {
    let tmp = 0n
    let att = 0n
    let sqbb = arrSquareBit[sq]

    occ &= ~sqbb
    tmp = sqbb; while (!(tmp & (occ | maskh8))) { att |= tmp <<= 9n; }
    tmp = sqbb; while (!(tmp & (occ | maska8))) { att |= tmp <<= 7n; }
    tmp = sqbb; while (!(tmp & (occ | maska1))) { att |= tmp >>= 9n; }
    tmp = sqbb; while (!(tmp & (occ | maskh1))) { att |= tmp >>= 7n; }
    return att;
}

function calc_rook_attacks_easy(sq, occ) {
    let tmp = 0n
    let att = 0n
    let sqbb = arrSquareBit[sq]

    occ &= ~sqbb
    tmp = sqbb; while (!(tmp & (occ | hFile))) { att |= tmp <<= 1n; }
    tmp = sqbb; while (!(tmp & (occ | aFile))) { att |= tmp >>= 1n; }
    tmp = sqbb; while (!(tmp & (occ | bbrank8))) { att |= tmp <<= 8n; }
    tmp = sqbb; while (!(tmp & (occ | bbrank1))) { att |= tmp >>= 8n; }
    return att;
}

/////////////////////////////////////////////////////////////////////////////////////
// FROM TO BLOCKERS
/////////////////////////////////////////////////////////////////////////////////////
function fromtoblockers(sq, line, occ) {
    occ &= line
    let upblockers = occ & arrPositive[sq]
    let downblockers = occ & arrNegative[sq]
    let lsb = (upblockers) ? BBbitScanForward(upblockers) : sq
    let msb = (downblockers) ? BBbitScanReverse(downblockers) : sq
    return arrinBetweenIncluded[msb][lsb]
}

var maskrook1 = bbrank8 | bbrank1
var maskrook2 = hFile | aFile
function calc_rook_attacks_fromto(sq, occ) {

    let s1 = fromtoblockers(sq, arrFileMask[sq], occ | maskrook1)
    let s2 = fromtoblockers(sq, arrRankMask[sq], occ | maskrook2)

    return s1 ^ s2
}
var maskbishop = bbrank8 | hFile | bbrank1 | aFile
function calc_bishop_attacks_fromto(sq, occ) {
    occ |= maskbishop
    let s3 = fromtoblockers(sq, arrDiagonalMask[sq], occ)
    let s4 = fromtoblockers(sq, arrAntiDiagMask[sq], occ)

    return s3 ^ s4
}

/////////////////////////////////////////////////////////////////////////////////////
// OCUSSION DIFFERENCE
/////////////////////////////////////////////////////////////////////////////////////
function odiff2(sq, line, occ) { // bug

    let bb1 = occ & line
    let bb2 = (bb1 & arrPositive[sq]) | arrSquareBit[_h8]
    let bb3 = (bb1 & arrNegative[sq]) | arrSquareBit[_a1]
    let hibitbb3 = hibit(bb3)
    let bb4 = bb2 - hibitbb3
    let bb5 = BigInt.asUintN(64, (bb4 ^ bb2))

    return (bb5 | hibitbb3) & line
}

function calc_rook_attacks_odiff2(sq, occ) {
    let s1 = odiff2(sq, arrFileMask[sq], occ | maskrook1)
    let s2 = odiff2(sq, arrRankMask[sq], occ | maskrook2)

    return s1 ^ s2
}

function calc_bishop_attacks_odiff2(sq, occ) {
    occ |= maskbishop
    let s3 = odiff2(sq, arrDiagonalMask[sq], occ)
    let s4 = odiff2(sq, arrAntiDiagMask[sq], occ)

    return s3 ^ s4
}



function odiff(sq, line, occ) {
    occ &= line
    let upblockers = occ & arrPositive[sq]
    let downblockers = occ & arrNegative[sq]
    let msb = (downblockers) ? hibit(downblockers) : arrSquareBit[sq]
    let result1 = upblockers ^ (upblockers - msb)
    return result1 & line
}

function calc_rook_attacks_odiff(sq, occ) {
    let s1 = odiff(sq, arrFileMask[sq], occ | maskrook1)
    let s2 = odiff(sq, arrRankMask[sq], occ | maskrook2)

    return s1 ^ s2
}

function calc_bishop_attacks_odiff(sq, occ) {
    occ |= maskbishop
    let s3 = odiff(sq, arrDiagonalMask[sq], occ)
    let s4 = odiff(sq, arrAntiDiagMask[sq], occ)

    return s3 ^ s4
}

/////////////////////////////////////////////////////////////////////////////////////
// SLIDE ARITHMETIC
/////////////////////////////////////////////////////////////////////////////////////
function slide_arithmetic(sq, line, occ) {
    occ &= line
    let upblockers = occ & arrPositive[sq]
    let downblockers = occ & arrNegative[sq]
    let msb = (downblockers) ? BBbitScanReverse(downblockers) : sq

    let result1 = upblockers ^ (upblockers - 1n)
    let result2 = arrPositive[msb] | arrSquareBit[msb]

    return result1 & result2 & line
}

function calc_rook_attacks_slide(sq, occ) {
    let s1 = odiff(sq, arrFileMask[sq], occ | maskrook1)
    let s2 = slide_arithmetic(sq, arrRankMask[sq], occ | maskrook2)

    return s1 ^ s2
}

function calc_bishop_attacks_slide(sq, occ) {
    occ |= maskbishop
    let s3 = slide_arithmetic(sq, arrDiagonalMask[sq], occ)
    let s4 = slide_arithmetic(sq, arrAntiDiagMask[sq], occ)

    return s3 ^ s4
}

/////////////////////////////////////////////////////////////////////////////////////
// FANCY BLACK MAGIC FIXED SHIFT
/////////////////////////////////////////////////////////////////////////////////////
function calc_rook_attacks_fancymagic(s, occ) {
    let m = r_magics[s];
    // let index1 = m[0]
    let step1 = BigInt.asUintN(64, (occ | m[1]) * m[2])
    let index2 = Number((step1) >> (52n)) // 64n - 12n

    return lookup_table[index2 + m[0]]
}

function calc_bishop_attacks_fancymagic(s, occ) {
    let m = b_magics[s];
    // let index1 = m[0]
    let step1 = BigInt.asUintN(64, (occ | m[1]) * m[2])
    let index2 = Number((step1) >> (55n)) // 64n - 9n

    return lookup_table[index2 + m[0]]
}



/////////////////////////////////////////////////////////////////////////////////////
// QBB
/////////////////////////////////////////////////////////////////////////////////////
// fen r1bqk1nr/ppp2ppp/2nb4/3Q4/8/8/PPP1PPPP/RNB1KBNR w KQkq - 0 5
function calc_rook_attacks_qbb(sq, occupation) {
    let piece = arrSquareBit[sq];
    occupation ^= piece; /* remove the selected piece from the occupation */
    let sqbigint1 = numberBigInt[sq]
    let sqbigint2 = numberBigInt[63 - sq]

    let piecesup = (aFile << sqbigint1) & (occupation | bbrank8); /* find the pieces up */
    let piecesdo = (hFile >> sqbigint2) & (occupation | bbrank1); /* find the pieces down */
    let piecesri = (bbrank1 << sqbigint1) & (occupation | hFile); /* find pieces on the right */
    let piecesle = (bbrank8 >> sqbigint2) & (occupation | aFile); /* find pieces on the left */

    let step1 = (hFile >> numberBigInt[63 - lsb(piecesup)])
    let step2 = (aFile << numberBigInt[msb(piecesdo)])
    let step3 = (bbrank8 >> numberBigInt[63 - lsb(piecesri)])
    let step4 = (bbrank1 << numberBigInt[msb(piecesle)])

    let result1 = (step1 & step2)
    let result2 = (step3 & step4)

    return (result1 | result2) ^ piece
    /* From every direction find the first piece and from that piece put a mask in the opposite direction.
        Put togheter all the 4 masks and remove the moving piece */
}


/* return the bitboard with the bishops destinations */
function calc_bishop_attacks_qbb(sq, occupation) {  /* it's the same as the rook */
    let piece = arrSquareBit[sq];
    occupation ^= piece;
    let sqbigint1 = numberBigInt[sq]
    let sqbigint2 = numberBigInt[63 - sq]

    let piecesup = (0x8040201008040201n << sqbigint1) & (occupation | 0xFF80808080808080n);
    let piecesdo = (0x8040201008040201n >> sqbigint2) & (occupation | 0x01010101010101FFn);
    let piecesle = (0x8102040810204081n << sqbigint1) & (occupation | 0xFF01010101010101n);
    let piecesri = (0x8102040810204081n >> sqbigint2) & (occupation | 0x80808080808080FFn);

    let step1 = (0x8040201008040201n >> numberBigInt[63 - lsb(piecesup)])
    let step2 = (0x8040201008040201n << numberBigInt[msb(piecesdo)])
    let step3 = (0x8102040810204081n >> numberBigInt[63 - lsb(piecesle)])
    let step4 = (0x8102040810204081n << numberBigInt[msb(piecesri)])

    let result1 = (step1 & step2)
    let result2 = (step3 & step4)

    return (result1 | result2) ^ piece
}


/////////////////////////////////////////////////////////////////////////////////////
// CURRENTLY USED
/////////////////////////////////////////////////////////////////////////////////////
//
// Firefox tiene los bitboards mas rápidos que Chrome!
// Chrome tiene 0x88 mas rápido que firefox
//
// Firefox
// 0x88       info string perft 5 4,865,609 time 2,006.00 nps:2,425,528
// fancymagic info string perft 5 4,865,609 time 2,506.00 nps:1,941,584
// odiff      info string perft 5 4,865,609 time 2,944.00 nps:1,652,720
// fromto     info string perft 5 4,865,609 time 3,216.00 nps:1,512,938
// slide      info string perft 5 4,865,609 time 3,481.00 nps:1,397,762
// easy       info string perft 5 4,865,609 time 3,514.00 nps:1,384,635
// hq         info string perft 5 4,865,609 time 4,266.00 nps:1,140,555
// qbb        info string perft 5 4,876,133 time 4,474.00 nps:1,089,882 * Bug
//
// Chrome
// 0x88       info string perft 5 4,865,609 time 633.90   nps:7,675,673 (google chrome de escritorio)
// 0x88       info string perft 5 4,865,609 time 668.90   nps:7,274,045 (google chrome de vscode)
// fancymagic info string perft 5 4,865,609 time 4,552.80 nps:1,068,707
// odiff      nps:800k
// odiff2     nps:690k
// fromto     info string perft 5 4,865,609 time 6,415.30 nps:758,438
// slide      info string perft 5 4,865,609 time 6,766.60 nps:719,039
// easy       info string perft 5 4,865,609 time 8,078.00 nps:602,328
// qbb        nps:580k  * Bug
// hq         info string perft 5 4,865,609 time 9,728.00 nps:500,165
// 
function calc_rook_attacks(s, occ) {
    return calc_rook_attacks_fancymagic(s, occ)
}

function calc_bishop_attacks(s, occ) {
    return calc_bishop_attacks_fancymagic(s, occ)
}

function calc_queen_attacks(s, occ) {
    return calc_rook_attacks(s, occ) | calc_bishop_attacks(s, occ)
}
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////
// INIT BITBOARDS
/////////////////////////////////////////////////////////////////////////////////////
function calc_inBetween(sq1, sq2) {
    sq1 = BigInt(sq1)
    sq2 = BigInt(sq2)
    const m1 = BigInt(-1);
    const a2a7 = 0x0001010101010100n
    const b2g7 = 0x0040201008040200n
    const h1b7 = 0x0002040810204080n /* Thanks Dustin, g2b7 did not work for c1-a3 */
    let btwn = (m1 << sq1) ^ (m1 << sq2)
    let file = (sq2 & 7n) - (sq1 & 7n)
    let rank = ((sq2 | 7n) - sq1) >> 3n
    let line = ((file & 7n) - 1n) & a2a7 /* a2a7 if same file */

    line += 2n * (((rank & 7n) - 1n) >> 58n)  /* b1g1 if same rank */
    line += (((rank - file) & 15n) - 1n) & b2g7; /* b2g7 if same diagonal */
    line += (((rank + file) & 15n) - 1n) & h1b7; /* h1b7 if same antidiag */
    line *= btwn & -btwn; /* mul acts like shift by smaller square */
    return line & btwn;   /* return the bits on that line in-between */
}
/* Generate rank attack to fill the RANK_ATTACK array. */
function generate_rank_attack(o, f) {
    let x, y
    let b;

    y = 0;
    for (x = f - 1; x >= 0; --x) {
        b = 1 << x;
        y |= b;
        if ((o & b) == b) break;
    }
    for (x = f + 1; x < 8; ++x) {
        b = 1 << x;
        y |= b;
        if ((o & b) == b) break;
    }
    return y;
}

function init_bitboard_tables() {
    let sqBB = 1n
    for (let sq = 0; sq <= 63; sq++, sqBB <<= 1n) {

        arrSquareBit[sq] = 1n << BigInt(sq)

        arrKingAttacks[sq] = calckingAttacks(sqBB)
        arrKnightAttacks[sq] = calcknightAttacks(sqBB)

        arrFileMask[sq] = fileMask(sq)
        arrRankMask[sq] = rankMask(sq)
        arrDiagonalMask[sq] = diagonalMask(sq)
        arrAntiDiagMask[sq] = antiDiagMask(sq)

        arrRookAttacks[sq] = arrFileMask[sq] ^ arrRankMask[sq]
        arrBishopAttacks[sq] = arrDiagonalMask[sq] ^ arrAntiDiagMask[sq]

        arrPositive[sq] = positive(sq)
        arrNegative[sq] = negative(sq)

        for (let f = 0; f < 8; ++f) {
            RANK_ATTACK[sq * 8 + f] = generate_rank_attack(sq * 2, f);
        }

        arrinBetween[sq] = new BigUint64Array(64).fill(0n)
        arrinBetweenIncluded[sq] = new BigUint64Array(64).fill(0n)

        for (let sq2 = 0; sq2 <= 63; sq2++) {
            arrinBetween[sq][sq2] = calc_inBetween(sq, sq2)
            arrinBetweenIncluded[sq][sq2] = arrinBetween[sq][sq2] | (1n << BigInt(sq)) | (1n << BigInt(sq2))
        }
    }
}

init_bitboard_tables()

// debug_bitboard(calc_inBetween(squareto64(h2), squareto64(h7))) 
// debug_bitboard(arrinBetween[squareto64(a3)][squareto64(e7)]) 


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DEBUG
/////////////////////////////////////////////////////////////////////////////////////
function debug_bitboard(bitboard, name = 'bitboard') {

    let bytes = new Uint8Array(8)
    for (let rank = 8; rank--;) {
        bytes[rank] = Number(bitboard >> (8n * BigInt(rank)) & 255n)
        let bitstr = dec2bin(bytes[rank], 8).split('').reverse().join(' ')
        console.log(rank + 1, bitstr, bytes[rank])
    }
    console.log('   a b c d e f g h');

    let bbaux = bitboard
    let squares = []

    while (bbaux !== 0n) {

        let lsb = lowestSetBit(bbaux)
        let sq64 = BBbitScanForward(lsb)
        bbaux &= ~lsb
        squares.push(square64ToStr(sq64))
    }

    console.log(name, BBbitCount(bitboard), 'bits:', squares.join(' '))

    let bits = dec2bin(bitboard)
    // console.log(bits.length, bits)
    console.assert(bits.length <= 64, 'bitboard con mas de 64 bits')
}


/////////////////////////////////////////////////////////////////////////////////////
// AUX
/////////////////////////////////////////////////////////////////////////////////////
function pawnforward1(color, bitboard) {
    return (color === white) ? (bitboard << 8n) : (bitboard >> 8n)
}

function pawnforward2(color, forward1) {
    return (color === white) ? ((bbrank3 & forward1) << 8n) : ((bbrank6 & forward1) >> 8n)
}

function pawnattacksleft(color, bitboard) {
    return (color === white) ? ((bitboard & notAFile) << 7n) : ((bitboard & notHFile) >> 7n)
}

function pawnattacksright(color, bitboard) {
    return (color === white) ? ((bitboard & notHFile) << 9n) : ((bitboard & notAFile) >> 9n)
}

let sign = [-1, 1]




class BBBoard {
    // Little-Endian Rank-File Mapping

    stm = 0; // side to move
    counter50 = 0;
    castlingRights = 0;
    enpassantSquare = -1;
    movenumber = 0;
    movehalfnumber = 0;
    debugvalue = false;
    checkingSquare = -1;

    numChecks = 0
    inCheck = false
    inDoubleCheck = false
    inCheckMate = false
    inStalemate = false
    isDraw = false

    BBP = [
        new BigUint64Array(7).fill(0n), // 0 all white pieces, 1 pawns 2 knights... 6 king
        new BigUint64Array(7).fill(0n),
    ]

    piecechecks = [
        new BigUint64Array(7).fill(0n),
        new BigUint64Array(7).fill(0n),
    ]

    enemypieceattacks = 0n
    enemypawnattacks = 0n
    enemyattacks = 0n
    enemychecks = 0n
    checkmask = universe

    enemyking = 0n
    enemykingsq = 0
    ourking = 0n
    ourkingsq = 0

    enemyocc = 0n
    ourocc = 0n
    totalocc = this.enemyocc | this.ourocc
    pieceattacks = 0n
    pawnattacks = 0n

    pinD12 = 0n
    pinHV = 0n

    movesbb = []

    history = {
        from: new Uint8Array(MAXPLY).fill(0),
        to: new Uint8Array(MAXPLY).fill(0),
        capturedpiece: new Uint8Array(MAXPLY).fill(0),
        promotedpiece: new Uint8Array(MAXPLY).fill(0),
        counter50: new Uint8Array(MAXPLY).fill(0),
        castlingRights: new Uint8Array(MAXPLY).fill(0),
        enpassantSquare: new Int8Array(MAXPLY).fill(-1),

        movestr: [],

        ply: 0,

        reset: function () {
            this.ply = 0
            this.movestr = []

            this.from.fill(0)
            this.to.fill(0)
            this.capturedpiece.fill(0)
            this.promotedpiece.fill(0)
            this.counter50.fill(0)
            this.castlingRights.fill(0)
            this.enpassantSquare.fill(0)
        },

        add: function (from, to, cp, pm, c50, cr, ep) {

            this.to[this.ply] = to
            this.from[this.ply] = from
            this.counter50[this.ply] = c50
            this.capturedpiece[this.ply] = cp
            this.promotedpiece[this.ply] = pm
            this.castlingRights[this.ply] = cr
            this.enpassantSquare[this.ply] = ep

            this.ply += 1

            this.movestr[this.ply] = square64ToStr(from) + square64ToStr(to)
        },

        pop: function () {

            if (this.ply <= 0) return false

            this.ply -= 1

            return {
                to: this.to[this.ply],
                from: this.from[this.ply],
                counter50: this.counter50[this.ply],
                capturedpiece: this.capturedpiece[this.ply],
                promotedpiece: this.promotedpiece[this.ply],
                castlingRights: this.castlingRights[this.ply],
                enpassantSquare: this.enpassantSquare[this.ply],
            }
        },

        debug: function () {

            let historymoves = []
            historymoves.push('ply: ' + this.ply)
            for (let ply = 0; ply < this.ply; ply++) {

                if (this.from[ply] === this.to[ply]) break

                historymoves.push(square64ToStr(this.from[ply]) + square64ToStr(this.to[ply]))
            }

            return historymoves.join(' ')
        }
    }

    reset() {
        // Little-Endian Rank-File Mapping

        this.stm = 0; // side to move
        this.counter50 = 0;
        this.castlingRights = 0;
        this.enpassantSquare = -1;
        this.movenumber = 0;
        this.movehalfnumber = 0;

        this.debugvalue = false

        this.checkingSquare = -1 // Square from which check is given

        this.numChecks = 0
        this.inCheck = false
        this.inDoubleCheck = false
        this.inCheckMate = false
        this.inStalemate = false
        this.isDraw = false

        this.BBP[0].fill(0n)
        this.BBP[1].fill(0n)
        this.piecechecks[0].fill(0n)
        this.piecechecks[1].fill(0n)

        this.enemypieceattacks = 0n
        this.enemypawnattacks = 0n
        this.enemyattacks = 0n
        this.enemychecks = 0n
        this.checkmask = universe

        this.enemyking = 0n
        this.enemykingsq = 0
        this.ourking = 0n
        this.ourkingsq = 0

        this.enemyocc = 0n
        this.ourocc = 0n
        this.totalocc = this.enemyocc | this.ourocc
        this.pieceattacks = 0n
        this.pawnattacks = 0n

        this.pinD12 = 0n
        this.pinHV = 0n

        this.movesbb = []
        this.history.reset()
    }

    init_bitboards(board) {

        this.stm = board.stm; // side to move
        this.counter50 = board.counter50;
        this.castlingRights = board.castlingRights;
        this.enpassantSquare = board.enpassantSquare;
        this.movenumber = board.movenumber;
        this.movehalfnumber = board.movehalfnumber;

        this.debugvalue = false

        this.numChecks = 0
        this.inCheck = false
        this.inDoubleCheck = false
        this.inCheckMate = false
        this.inStalemate = false
        this.isDraw = false

        this.BBP[0].fill(0n)
        this.BBP[1].fill(0n)
        this.piecechecks[0].fill(0n)
        this.piecechecks[1].fill(0n)

        for (let sq = a1; sq <= h8; sq++) {

            if (!validSquare(sq)) { sq += 7; continue }

            let piece = board.pieceat[sq]

            if (piece !== empty) {

                let bitsq = squaretobitboard(squareto64(sq))
                let color = pcolor(piece)
                let type = ptype(piece)

                this.BBP[color][0] |= bitsq
                this.BBP[color][type] |= bitsq
            }
        }
    }

    getMoveStr(move) {

        let checkStr = (move.mask & mask_check) ? '+' : '';
        let discovercheckStr = (move.mask & mask_discovercheck) ? 'D+' : '';

        if (move.mask & mask_castling) {
            let movingStr = (file64(move.to) === fileg) ? '00' : '000'
            return movingStr + checkStr + discovercheckStr
        } else {
            // console.log(move)
            let promStr = (move.promotedpiece === 0) ? '' : '=' + charpieces[move.promotedpiece & 7]
            let movingStr = charpieces[move.movingpiece & 7];
            let captureStr = (move.captured) ? 'x' + charpieces[move.captured & 7] : '';

            // let doublecheckStr = (move.mask & mask_doublecheck) ? '+' : '';            
            let enpassantkStr = (move.mask & mask_ep) ? 'ep' : '';
            // let safeStr = (move.mask & mask_safe) ? '' : '.';
            // let hangingStr = (move.mask & mask_hanging) ? '?' : '';
            let freecaptStr = (move.mask & mask_freecapture) ? '@' : '';
            // let winningStr = (move.mask &  mask_winningcapture) ? '!' : '';

            return movingStr +
                square64ToStr(move.from) +
                captureStr +
                square64ToStr(move.to) +
                promStr +
                checkStr + discovercheckStr + enpassantkStr + freecaptStr
            // +  safeStr + hangingStr + winningStr + freecaptStr
        }
    }

    getMovesStr() {
        let movesbbStr = []
        for (let move of this.movesbb) {
            movesbbStr.push(this.getMoveStr(move))
        }
        return movesbbStr
    }


    addbbmove(side, piece, from, to, maskbits, promotedpiece = 0) {
        let chekingpiece = (promotedpiece === 0) ? piece : promotedpiece
        let ischeck = this.piecechecks[side][chekingpiece] & arrSquareBit[to]
        let capturedpiece = (maskbits & mask_capture) ? this.pieceat(to) : empty

        if (ischeck) {
            maskbits |= mask_check
        }
        if ((maskbits & mask_capture) && (capturedpiece > piece)) {
            maskbits |= mask_freecapture
        }

        let move = {
            from: from,
            to: to,
            promotedpiece: promotedpiece,
            movingpiece: piece,
            capturedpiece: capturedpiece,
            mask: maskbits
        }
        Object.freeze(move)

        this.movesbb.push(move)
    }

    generate_bbpiecemoves(side, piece, sq, attacks) {
        let enemypieces = this.BBP[opposite(side)][0]

        while (attacks) {
            let destBB = lowestSetBit(attacks)
            let destSq = BBbitScanForward(destBB)
            attacks ^= destBB
            let mask = (destBB & enemypieces) ? mask_capture : 0
            this.addbbmove(side, piece, sq, destSq, mask)
        }
    }

    generate_bbmovespawn1(side, turnsign, forward1) {
        let promotions = forward1 & bbpromotion
        let notpromotions = forward1 & ~bbpromotion

        while (promotions) {
            let squareBB = lowestSetBit(promotions)
            let sq = BBbitScanForward(squareBB)
            let from = sq + (8 * turnsign)
            promotions ^= squareBB

            this.addbbmove(side, p, from, sq, mask_pawnmove | mask_promotion, n)
            this.addbbmove(side, p, from, sq, mask_pawnmove | mask_promotion, b)
            this.addbbmove(side, p, from, sq, mask_pawnmove | mask_promotion, r)
            this.addbbmove(side, p, from, sq, mask_pawnmove | mask_promotion, q)
        }

        while (notpromotions) {
            let squareBB = lowestSetBit(notpromotions)
            let sq = BBbitScanForward(squareBB)
            let from = sq + (8 * turnsign)
            notpromotions ^= squareBB

            this.addbbmove(side, p, from, sq, mask_pawnmove)
        }
    }

    generate_bbmovespawn2(side, turnsign, forward2) {
        while (forward2) {
            let squareBB = lowestSetBit(forward2)
            let sq = BBbitScanForward(squareBB)
            forward2 ^= squareBB

            this.addbbmove(side, p, sq + (16 * turnsign), sq, mask_pawnmove | mask_pawn2)
        }
    }

    generate_bbmovespawncapture(side, offset, captureleft) {
        let promotions = captureleft & bbpromotion
        let notpromotions = captureleft & ~bbpromotion

        while (promotions) {
            let squareBB = lowestSetBit(promotions)
            let sq = BBbitScanForward(squareBB)
            let from = sq + offset
            promotions ^= squareBB

            this.addbbmove(side, p, from, sq, mask_capture | mask_pawnmove | mask_promotion, n)
            this.addbbmove(side, p, from, sq, mask_capture | mask_pawnmove | mask_promotion, b)
            this.addbbmove(side, p, from, sq, mask_capture | mask_pawnmove | mask_promotion, r)
            this.addbbmove(side, p, from, sq, mask_capture | mask_pawnmove | mask_promotion, q)
        }

        while (notpromotions) {
            let squareBB = lowestSetBit(notpromotions)
            let sq = BBbitScanForward(squareBB)
            let from = sq + offset
            notpromotions ^= squareBB

            this.addbbmove(side, p, from, sq, mask_capture | mask_pawnmove)
        }
    }

    generate_pawnattacks(side, sqbb) {
        return pawnattacksleft(side, sqbb) | pawnattacksright(side, sqbb)
    }

    generate_1pieceattacks(piece, sq, totalocc) {
        switch (piece) {
            case p: return this.generate_pawnattacks(this.stm, arrSquareBit[sq])
            case n: return arrKnightAttacks[sq]
            case b: return calc_bishop_attacks(sq, totalocc)
            case r: return calc_rook_attacks(sq, totalocc)
            case q: return calc_queen_attacks(sq, totalocc)
            case k: return arrKingAttacks[sq]
        }
    }

    // Clavadas erroneas con dama
    // fen 3r3k/8/3P4/3K1Q1r/8/8/8/8 w - - 0 1
    // fen 3r2bk/5Q2/3P4/3KP2r/4P3/8/8/7q w - - 0 1                
    // if ( (piece === q) && (lowestbit & pinD12 ) ) attacks &= pinD12
    // if ( (piece === q) && (lowestbit & pinHV ) ) attacks &= pinHV
    generate_pinnedqueen(sqbb, sq, totalocc, pinD12, pinHV) {

        if (sqbb & pinD12) return calc_bishop_attacks(sq, totalocc) & pinD12
        if (sqbb & pinHV) return calc_rook_attacks(sq, totalocc) & pinHV

        console.assert(false, 'generate_pinnedqueen')
    }


    generate_checkmask() {

        let side = this.stm
        let oppside = opposite(side)

        // Piezas rivales que nos están dando jaque ahora mismo

        this.piecechecks[oppside][p] = this.generate_pawnattacks(side, this.ourking) & this.BBP[oppside][p]
        this.piecechecks[oppside][n] = arrKnightAttacks[this.ourkingsq] & this.BBP[oppside][n]
        this.piecechecks[oppside][b] = calc_bishop_attacks(this.ourkingsq, this.totalocc) & (this.BBP[oppside][b] | this.BBP[oppside][q])
        this.piecechecks[oppside][r] = calc_rook_attacks(this.ourkingsq, this.totalocc) & (this.BBP[oppside][r] | this.BBP[oppside][q])

        if (this.piecechecks[oppside][p]) {
            this.checkmask &= this.piecechecks[oppside][p]
        }
        if (this.piecechecks[oppside][n]) {
            this.checkmask &= this.piecechecks[oppside][n]
        }
        if (this.piecechecks[oppside][b]) {
            let lowestbit = lowestSetBit(this.piecechecks[oppside][b])
            let sq = BBbitScanForward(lowestbit)
            this.checkmask &= arrinBetween[sq][this.ourkingsq] | lowestbit
        }
        if (this.piecechecks[oppside][r]) {
            let lowestbit = lowestSetBit(this.piecechecks[oppside][r])
            let sq = BBbitScanForward(lowestbit)
            this.checkmask &= arrinBetween[sq][this.ourkingsq] | lowestbit
        }

        this.enemychecks =
            this.piecechecks[oppside][p] |
            this.piecechecks[oppside][n] |
            this.piecechecks[oppside][b] |
            this.piecechecks[oppside][r]

        // Jaque doble coronando
        // fen 3nk3/4P3/8/b7/8/5n2/8/2K1R3 w - - 0 1
        this.numChecks = BBbitCount(this.enemychecks)
        this.inCheck = this.numChecks > 0
    }

    generate_pinmasks() {

        let side = this.stm
        let oppside = opposite(side)
        let enemyRQ = calc_rook_attacks(this.ourkingsq, this.enemyocc) & (this.BBP[oppside][r] | this.BBP[oppside][q])
        let enemyBQ = calc_bishop_attacks(this.ourkingsq, this.enemyocc) & (this.BBP[oppside][b] | this.BBP[oppside][q])

        while (enemyRQ) {
            let lowestbit = lowestSetBit(enemyRQ)
            let sq = BBbitScanForward(lowestbit)
            let ourpieces = arrinBetween[sq][this.ourkingsq] & this.ourocc
            if (BBbitCount(ourpieces) === 1) {
                this.pinHV |= arrinBetween[sq][this.ourkingsq] | lowestbit
            }
            enemyRQ ^= lowestbit
        }

        while (enemyBQ) {
            let lowestbit = lowestSetBit(enemyBQ)
            let sq = BBbitScanForward(lowestbit)
            let ourpieces = arrinBetween[sq][this.ourkingsq] & this.ourocc
            if (BBbitCount(ourpieces) === 1) {
                this.pinD12 |= arrinBetween[sq][this.ourkingsq] | lowestbit
            }
            enemyBQ ^= lowestbit
        }
    }

    generate_enemyattacks() {

        let side = this.stm
        let oppside = opposite(side)

        // Calculamos los ataques del enemigo
        let totaloccwihtoutourking = this.totalocc & ~this.ourking

        let squaresBB = this.BBP[oppside][p]
        if (squaresBB) {
            this.enemypawnattacks = pawnattacksleft(oppside, squaresBB) | pawnattacksright(oppside, squaresBB)
        }

        squaresBB = this.BBP[oppside][n]
        while (squaresBB) {
            let lowestbit = lowestSetBit(squaresBB)
            let sq = BBbitScanForward(lowestbit)
            squaresBB ^= lowestbit
            this.enemypieceattacks |= arrKnightAttacks[sq]
        }

        squaresBB = this.BBP[oppside][b] | this.BBP[oppside][q]
        while (squaresBB) {
            let lowestbit = lowestSetBit(squaresBB)
            let sq = BBbitScanForward(lowestbit)
            squaresBB ^= lowestbit
            this.enemypieceattacks |= calc_bishop_attacks(sq, totaloccwihtoutourking)
        }

        squaresBB = this.BBP[oppside][r] | this.BBP[oppside][q]
        while (squaresBB) {
            let lowestbit = lowestSetBit(squaresBB)
            let sq = BBbitScanForward(lowestbit)
            squaresBB ^= lowestbit
            this.enemypieceattacks |= calc_rook_attacks(sq, totaloccwihtoutourking)
        }

        squaresBB = this.BBP[oppside][k]
        if (squaresBB) {
            let lowestbit = lowestSetBit(squaresBB)
            let sq = BBbitScanForward(lowestbit)
            squaresBB ^= lowestbit
            this.enemypieceattacks |= arrKingAttacks[sq]
        }


        this.enemyattacks = this.enemypieceattacks | this.enemypawnattacks
    }


    generate_pawnmoves() {
        // Movimientos y ataques de peones

        let side = this.stm
        let oppside = opposite(side)

        let turnsign = sign[side]

        let squaresBB = this.BBP[side][p]
        if (squaresBB === 0) return


        if (this.enpassantSquare != -1) {
            // fen 8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 
            // fen 8/2p5/3p4/KP5r/QR3p1k/8/4P1P1/8 w - - 
            // fen 8/2p5/3p4/KP1P3r/QR3p1k/8/4P1P1/8 w - - 
            // fen kb4r1/3p1p2/8/2P1P1P1/8/6K1/8/8 b - - 0 1

            let epSquare = this.enpassantSquare
            let epPawnsq = epSquare + (turnsign * 8)

            let epMask = arrSquareBit[epSquare] | arrSquareBit[epPawnsq]

            if (epMask & this.checkmask) {
                let possiblepawns = this.generate_pawnattacks(oppside, arrSquareBit[epSquare]) & squaresBB
                while (possiblepawns) {

                    let ourpawn = lowestSetBit(possiblepawns)
                    let ourpawnsq = BBbitScanForward(ourpawn)
                    possiblepawns ^= ourpawn

                    // If the pawn is pinned but the en passant square is not on the
                    // pin mask then the move is illegal.
                    // if ((1ULL << from) & board.pinD && !(board.pinD & (1ull << ep)))
                    //   continue;
                    if (ourpawn & this.pinHV) continue

                    let ilegalep = ((ourpawn & this.pinD12) && !(arrSquareBit[epSquare] & this.pinD12))
                    if (ilegalep) continue

                    let rankpawn = rank64(epPawnsq)
                    let rankmask = 0xFFn << BigInt(rankpawn * 8)

                    let enemypinners = this.BBP[oppside][r] | this.BBP[oppside][q]
                    let aligned = (this.ourking & rankmask) !== 0n && (enemypinners & rankmask) !== 0n

                    if (aligned) {
                        // Si quitamos los 2 peones, y una torre desde nuestro rey ataca sus piezas que clavan  
                        let rankocc = this.totalocc & rankmask & ~ourpawn & ~arrSquareBit[epPawnsq]
                        let rankattacks = rank_attacks(this.ourkingsq, rankocc)
                        ilegalep = (rankattacks & enemypinners) !== 0n
                    }

                    if (!ilegalep) {
                        this.addbbmove(side, p, ourpawnsq, epSquare, mask_ep)
                    } else {
                    }

                }
            }
        }


        this.pawnattacks = pawnattacksleft(side, squaresBB) | pawnattacksright(side, squaresBB)

        let forward0 = squaresBB & ~this.pinD12
        let forwardunpinnedHV = forward0 & ~this.pinHV
        let forwardpinnedHV = forward0 & this.pinHV
        let forward1 = (pawnforward1(side, forwardunpinnedHV) |
            (pawnforward1(side, forwardpinnedHV) & this.pinHV)) & ~this.totalocc
        let forward2 = pawnforward2(side, forward1) & ~this.totalocc

        let unpinnedHV = squaresBB & ~this.pinHV
        let pinnedD12 = unpinnedHV & this.pinD12
        let unpinnedD12 = unpinnedHV & ~this.pinD12
        let captureleft = (pawnattacksleft(side, pinnedD12) & this.pinD12) | pawnattacksleft(side, unpinnedD12)
        let captureright = (pawnattacksright(side, pinnedD12) & this.pinD12) | pawnattacksright(side, unpinnedD12)

        captureleft &= this.enemyocc
        captureright &= this.enemyocc

        forward1 &= this.checkmask
        forward2 &= this.checkmask
        captureleft &= this.checkmask
        captureright &= this.checkmask

        this.generate_bbmovespawn1(side, turnsign, forward1)
        this.generate_bbmovespawn2(side, turnsign, forward2)
        this.generate_bbmovespawncapture(side, (7 * turnsign), captureleft)
        this.generate_bbmovespawncapture(side, (9 * turnsign), captureright)

    }

    generate_piecemoves() {

        // Si estamos en jaque doble, solo se puede mover el rey
        if (this.numChecks > 1) return

        let side = this.stm
        let useloop = false

        if (!useloop) {
            // Generamos las jugadas del bando que toca mover
            let squaresBB = this.BBP[side][n]
            while (squaresBB) {
                let lowestbit = lowestSetBit(squaresBB)
                squaresBB ^= lowestbit

                let ispinnedD12 = (lowestbit & this.pinD12) !== 0n
                let ispinnedHV = (lowestbit & this.pinHV) !== 0n
                if (ispinnedD12 | ispinnedHV) continue

                let sq = BBbitScanForward(lowestbit)
                let attacks = arrKnightAttacks[sq]
                this.pieceattacks |= attacks

                attacks &= ~this.ourocc
                attacks &= this.checkmask

                this.generate_bbpiecemoves(side, n, sq, attacks)
            }

            squaresBB = this.BBP[side][b] | this.BBP[side][q]
            while (squaresBB) {
                let lowestbit = lowestSetBit(squaresBB)
                squaresBB ^= lowestbit

                let piece = (lowestbit & this.BBP[side][b]) ? b : q

                let ispinnedHV = (lowestbit & this.pinHV) !== 0n
                if (ispinnedHV) continue
                let ispinnedD12 = (lowestbit & this.pinD12) !== 0n

                let sq = BBbitScanForward(lowestbit)
                let attacks = calc_bishop_attacks(sq, this.totalocc)
                this.pieceattacks |= attacks

                attacks &= ~this.ourocc
                attacks &= this.checkmask

                if (ispinnedD12) attacks &= this.pinD12

                this.generate_bbpiecemoves(side, piece, sq, attacks)
            }

            squaresBB = this.BBP[side][r] | this.BBP[side][q]
            while (squaresBB) {

                let lowestbit = lowestSetBit(squaresBB)
                squaresBB ^= lowestbit

                let piece = (lowestbit & this.BBP[side][r]) ? r : q

                let ispinnedD12 = (lowestbit & this.pinD12) !== 0n
                if (ispinnedD12) continue
                let ispinnedHV = (lowestbit & this.pinHV) !== 0n

                let sq = BBbitScanForward(lowestbit)
                let attacks = calc_rook_attacks(sq, this.totalocc)
                this.pieceattacks |= attacks

                attacks &= ~this.ourocc
                attacks &= this.checkmask

                if (ispinnedHV) attacks &= this.pinHV

                this.generate_bbpiecemoves(side, piece, sq, attacks)
            }
        }

        if (useloop)
            for (let piece = n; piece <= q; piece++) {

                let squaresBB = this.BBP[side][piece]
                if (squaresBB === 0) continue

                // Movimientos y ataques de Piezas
                while (squaresBB) {

                    let lowestbit = lowestSetBit(squaresBB)
                    squaresBB ^= lowestbit

                    let ispinnedD12 = (lowestbit & this.pinD12) !== 0n
                    let ispinnedHV = (lowestbit & this.pinHV) !== 0n

                    if ((piece === n) && (ispinnedD12 || ispinnedHV)) continue
                    if ((piece === b) && ispinnedHV) continue
                    if ((piece === r) && ispinnedD12) continue

                    let sq = BBbitScanForward(lowestbit)
                    let attacks = 0n
                    let ispinnedqueen = (piece === q) && (ispinnedD12 || ispinnedHV)

                    attacks = (ispinnedqueen) ?
                        this.generate_pinnedqueen(lowestbit, sq, this.totalocc, this.pinD12, this.pinHV) :
                        this.generate_1pieceattacks(piece, sq, this.totalocc)

                    this.pieceattacks |= attacks
                    attacks &= ~this.ourocc
                    attacks &= this.checkmask

                    if ((piece === b) && ispinnedD12) attacks &= this.pinD12
                    if ((piece === r) && ispinnedHV) attacks &= this.pinHV

                    this.generate_bbpiecemoves(side, piece, sq, attacks)
                }
            }
    }

    generate_kingmoves() {

        let side = this.stm
        let oppside = opposite(side)

        // Movimientos de nuestro rey
        let attacks = arrKingAttacks[this.ourkingsq] // this.generate_1pieceattacks(k, this.ourkingsq, this.totalocc)
        this.pieceattacks |= attacks

        attacks &= ~this.ourocc
        attacks &= ~this.enemyattacks

        this.generate_bbpiecemoves(side, k, this.ourkingsq, attacks)


        // Enroques
        if (!this.inCheck) {
            if (side === white) {
                if (this.ourkingsq === _e1) {
                    let f1g1 = arrSquareBit[_f1] | arrSquareBit[_g1]
                    let d1c1 = arrSquareBit[_d1] | arrSquareBit[_c1]
                    let d1c1b1 = d1c1 | arrSquareBit[_b1]
                    if ((this.totalocc & f1g1) === 0n &&
                        (this.enemyattacks & f1g1) === 0n &&
                        (this.BBP[side][r] & arrSquareBit[_h1]) &&
                        (this.castlingRights & whitecancastleK)
                    ) this.addbbmove(side, k, this.ourkingsq, _g1, mask_castling)

                    if ((this.totalocc & d1c1b1) === 0n &&
                        (this.enemyattacks & d1c1) === 0n &&
                        (this.BBP[side][r] & arrSquareBit[_a1]) &&
                        (this.castlingRights & whitecancastleQ)
                    ) this.addbbmove(side, k, this.ourkingsq, _c1, mask_castling)
                }
            } else {
                if (this.ourkingsq === _e8) {
                    let f8g8 = arrSquareBit[_f8] | arrSquareBit[_g8]
                    let d8c8 = arrSquareBit[_d8] | arrSquareBit[_c8]
                    let d8c8b8 = d8c8 | arrSquareBit[_b8]
                    if ((this.totalocc & f8g8) === 0n &&
                        (this.enemyattacks & f8g8) === 0n &&
                        (this.BBP[side][r] & arrSquareBit[_h8]) &&
                        (this.castlingRights & blackcancastleK)
                    ) this.addbbmove(side, k, this.ourkingsq, _g8, mask_castling)

                    if ((this.totalocc & d8c8b8) === 0n &&
                        (this.enemyattacks & d8c8) === 0n &&
                        (this.BBP[side][r] & arrSquareBit[_a8]) &&
                        (this.castlingRights & blackcancastleQ)
                    ) this.addbbmove(side, k, this.ourkingsq, _c8, mask_castling)
                }
            }
        }
    }



    generate_bbmoves() {

        this.movesbb = []

        let side = this.stm
        let oppside = opposite(side)

        this.enemyocc = this.BBP[oppside][0]
        this.ourocc = this.BBP[side][0]
        this.totalocc = this.enemyocc | this.ourocc
        this.pieceattacks = 0n
        this.pawnattacks = 0n
        this.enemypieceattacks = 0n
        this.enemypawnattacks = 0n
        this.enemyattacks = 0n

        this.inCheck = false
        this.numChecks = 0

        // Calculamos las casillas que darian jaque al rey rival
        this.enemyking = this.BBP[oppside][k]
        this.enemykingsq = BBbitScanForward(this.enemyking)

        this.ourking = this.BBP[side][k]
        this.ourkingsq = BBbitScanForward(this.ourking)

        // piecechecks son las piezas propias que dan jaque
        this.piecechecks[white].fill(0n)
        this.piecechecks[black].fill(0n)
        this.checkmask = universe
        this.pinD12 = 0n
        this.pinHV = 0n

        this.generate_checkmask()
        this.generate_pinmasks()
        this.generate_enemyattacks()

        this.generate_pawnmoves()
        this.generate_piecemoves()
        this.generate_kingmoves()

        // debug_bitboard(checkmask, 'checkmask')
        // debug_bitboard(piecechecks[oppside][r], 'enemychecks')        
        // Calculamos las piezas propias clavadas
        // R2nkb1R/3bp3/6q1/1B6/1r6/1N6/2P1Q3/1KB4r w - - 0 1
        // 
    }

    makemove(move) {

        let from = move.from
        let to = move.to
        let capturedpiece = move.capturedpiece
        let promotedpiece = move.promotedpiece

        this.history.add(from, to, capturedpiece, promotedpiece, this.counter50, this.castlingRights, this.enpassantSquare)

        let boardtopiece = this.pieceat(to)
        let iscapture = boardtopiece != empty
        let movingpiece = this.pieceat(from)
        let ispawnmove = ptype(movingpiece) === p
        let ispawnpush = !iscapture && ispawnmove && Math.abs(to - from) == 16
        let ispromotion = ispawnmove && (rank64(to) == rank8 || rank64(to) == rank1)
        let isenpassant = ispawnmove && to == this.enpassantSquare
        // let iskingmove = ptype(movingpiece) == k

        // console.assert(!(move.mask & mask_capture) || iscapture, 'makemove mask_capture iscapture')
        // console.assert(!(move.mask & mask_pawnmove) || ispawnmove, 'makemove mask_pawnmove')
        // console.assert(!(move.mask & mask_pawn2) || ispawnpush, 'makemove mask_pawn2')
        // console.assert(!(move.mask & mask_promotion) || (promotedpiece !== empty) , 'makemove mask_promotion 1', promotedpiece)
        // console.assert(!(move.mask & mask_promotion) || ispromotion, 'makemove mask_promotion 2')
        // console.assert(!(move.mask & mask_castling) || (ptype(movingpiece) === k) , 'makemove mask_castling')
        // console.assert(!(move.mask & mask_ep) || isenpassant, 'makemove mask_castling')

        // console.assert(!iscapture || ptype(capturedpiece) === ptype(boardtopiece), 'makemove capturedpiece', ptype(capturedpiece), ptype(boardtopiece))
        if (iscapture && (ptype(capturedpiece) !== ptype(boardtopiece))) {
            console.log(this.history.debug(), square64ToStr(from), square64ToStr(to), movingpiece, this.stm)
            console.log(move)
            console.log(this.history)
            throw new Error("Something went badly wrong!");
        }
        // console.assert(move.movingpiece > 0, 'move.movingpiece', move.movingpiece)
        // console.assert(ptype(movingpiece) === ptype(move.movingpiece), 'makemove movingpiece', movingpiece, move.movingpiece, square64ToStr(from), square64ToStr(to))
        // console.assert(movingpiece != empty, 'makemove movingpiece empty')
        // console.assert(!ispromotion || promotedpiece > 0, 'pieza que promociona sin ser promocion')

        this.movehalfnumber += 1
        this.movenumber = this.movehalfnumber / 2 >> 0 // truco para convetir a entero

        if (iscapture || ispawnmove) {
            this.counter50 = 0
        } else {
            this.counter50 += 1
        }

        // En passant square
        this.enpassantSquare = -1
        if (ispawnpush) {
            let enemypawn = (this.stm === white) ? bp : wp;

            if ((this.pieceat(to + 1) === enemypawn) || (this.pieceat(to - 1) === enemypawn)) {
                this.enpassantSquare = (from + to) / 2
            }

            console.assert(
                (this.stm == white && rank64(from) == rank2 && rank64(to) == rank4) ||
                (this.stm == black && rank64(from) == rank7 && rank64(to) == rank5),
                'error generating en passant square'
            )
        }

        if ((from == _a1) || (to == _a1)) this.castlingRights &= ~whitecancastleQ
        if ((from == _h1) || (to == _h1)) this.castlingRights &= ~whitecancastleK
        if ((from == _a8) || (to == _a8)) this.castlingRights &= ~blackcancastleQ
        if ((from == _h8) || (to == _h8)) this.castlingRights &= ~blackcancastleK

        if ((from == _e1) && (movingpiece == wk)) {
            if (to == _g1) {
                console.assert(this.castlingRights && whitecancastleK, 'whitecancastleK')
                console.assert(this.pieceat(_h1) == wr, 'no rook on h1 when castling')
                this.movepiece(this.stm, wr, _h1, _f1)
            }
            if (to == _c1) {
                console.assert(this.castlingRights && whitecancastleQ, 'whitecancastleQ')
                console.assert(this.pieceat(_a1) == wr, 'no rook on a1 when castling')
                this.movepiece(this.stm, wr, _a1, _d1)
            }
            this.castlingRights &= ~(whitecancastleQ | whitecancastleK)
        }

        if ((from == _e8) && (movingpiece == bk)) {
            if (to == _g8) {
                console.assert(this.castlingRights && blackcancastleK, 'blackcancastleK')
                console.assert(this.pieceat(_h8) == br, 'no rook on h8 when castling')
                this.movepiece(this.stm, br, _h8, _f8)
            }
            if (to == _c8) {
                console.assert(this.castlingRights && blackcancastleK, 'blackcancastleK')
                console.assert(this.pieceat(_a8) == br, 'no rook on a8 when castling')
                this.movepiece(this.stm, br, _a8, _d8)
            }
            this.castlingRights &= ~(blackcancastleQ | blackcancastleK)
        }

        if (iscapture) {
            this.removepiece(opposite(this.stm), capturedpiece, to)
        }

        // Execute the move
        this.movepiece(this.stm, movingpiece, from, to)

        if (ispromotion) {
            console.assert(promotedpiece != empty, 'no piece to promote to')
            if ((this.stm == white) && (promotedpiece > 8)) promotedpiece -= 8
            this.removepiece(this.stm, p, to)
            this.addpiece(this.stm, promotedpiece, to)
        }

        if (isenpassant) {
            let sqpawn = (this.stm == white) ? to - 8 : to + 8;
            this.removepiece(opposite(this.stm), p, sqpawn)
        }

        this.stm = opposite(this.stm)

        this.debug()
        return true
    }

    makemove_old(from, to, promotedpiece = 0) {
        // console.log('makemove_old', square64ToStr(from), square64ToStr(to), promotedpiece)

        let movemask = 0
        let movingpiece = this.pieceat(from)
        let capturedpiece = this.pieceat(to)
        let iscapture = capturedpiece != empty
        let ispawnmove = ptype(movingpiece) == p
        let ispawnpush = !iscapture && ispawnmove && Math.abs(to - from) == 16
        let ispromotion = ispawnmove && (rank64(to) == rank8 || rank64(to) == rank1)
        let isenpassant = ispawnmove && to == this.enpassantSquare

        if (iscapture) movemask |= mask_capture
        if (ispawnmove) movemask |= mask_pawnmove
        if (ispawnpush) movemask |= mask_pawn2
        if (ispromotion) movemask |= mask_promotion
        if (isenpassant) movemask |= mask_ep
        if (movingpiece === k) {
            if ((file(from) === filee) && (file(to) === fileg)) movemask |= mask_castling
            if ((file(from) === filee) && (file(to) === filec)) movemask |= mask_castling
        }

        let move = {
            movingpiece: movingpiece,
            from: from,
            to: to,
            capturedpiece: capturedpiece,
            promotedpiece: promotedpiece,
            mask: movemask
        }

        return this.makemove(move)
    }

    undomove() {
        let undo = this.history.pop()

        if (undo == false) return false;

        this.stm = opposite(this.stm)
        let signo = (this.stm === white) ? 1 : -1

        if (undo.promotedpiece !== 0) {
            let promoted = this.pieceat(undo.to)
            console.assert(ptype(undo.promotedpiece) === ptype(promoted), 'undomove promotedpiece')

            this.removepiece(this.stm, undo.promotedpiece, undo.to)
            this.addpiece(this.stm, p, undo.to)
        }

        let movingpiece = this.pieceat(undo.to)

        this.movepiece(this.stm, movingpiece, undo.to, undo.from)

        if (undo.capturedpiece) {
            this.addpiece(opposite(this.stm), undo.capturedpiece, undo.to)
        }
        console.assert(this.stm === pcolor(movingpiece), 'undomove() piece color does not match side to move')
        if (this.stm !== pcolor(movingpiece)) {
            console.log(this.history.debug(), square64ToStr(undo.from), square64ToStr(undo.to), movingpiece, this.stm)
            console.log(this.history)
            throw new Error("Something went badly wrong!");
        }

        this.counter50 = undo.counter50
        this.castlingRights = undo.castlingRights
        this.enpassantSquare = undo.enpassantSquare

        if (undo.to === undo.enpassantSquare) {
            if (ptype(movingpiece) === p) {
                this.addpiece(opposite(this.stm), p, undo.enpassantSquare - (8 * signo))
            }
        }

        if ((undo.from == _e1) && (undo.to == _g1) && (movingpiece == wk)) {
            console.assert(this.pieceat(_f1) == wr, 'no rook on f1 when undoing')
            this.movepiece(this.stm, wr, _f1, _h1)
        }

        if ((undo.from == _e1) && (undo.to == _c1) && (movingpiece == wk)) {
            console.assert(this.pieceat(_d1) == wr, 'no rook on d1 when undoing')
            this.movepiece(this.stm, wr, _d1, _a1)
        }

        if ((undo.from == _e8) && (undo.to == _g8) && (movingpiece == bk)) {
            console.assert(this.pieceat(_f8) == br, 'no rook on f8 when undoing')
            this.movepiece(this.stm, wr, _f8, _h8)
        }

        if ((undo.from == _e8) && (undo.to == _c8) && (movingpiece == bk)) {
            console.assert(this.pieceat(_d8) == br, 'no rook on d8 when undoing')
            this.movepiece(this.stm, wr, _d8, _a8)
        }

        this.movehalfnumber -= 1
        this.movenumber = this.movehalfnumber / 2 >> 0 // truco para convetir a entero        

        // this.generateMoves()
        // this.debug()

        return true;
    }

    addpiece(color, piece, square) {

        this.BBP[color][0] |= squaretobitboard(square)
        this.BBP[color][ptype(piece)] |= squaretobitboard(square)
    }

    movepiece(color, piece, from, to) {

        let moveBB = squaretobitboard(from) | squaretobitboard(to)
        this.BBP[color][0] ^= moveBB
        this.BBP[color][ptype(piece)] ^= moveBB
    }

    removepiece(color, piece, square) {

        this.BBP[color][0] &= ~squaretobitboard(square)
        this.BBP[color][ptype(piece)] &= ~squaretobitboard(square)
    }

    loadFEN(fenstring) {

        this.reset()

        // Load FEN string
        let file = filea;
        let rank = rank8;
        let [fenboard, fenstm, fencastling, fenep, fen50, fenmn] = fenstring.split(' ');

        // Parse board position
        for (let i = 0; i < fenboard.length; i++) {
            let char = fenboard[i];
            if (char === '/') {
                rank--;
                file = filea;
                continue;
            }

            if (!isNaN(char)) {
                file += Number(char);
                continue;
            }

            let piece = charpieces.findIndex(el => (el === char));
            let sq = square64(file, rank)

            if (piece > 0) {
                this.addpiece(pcolor(piece), ptype(piece), sq)
                file++;
            }

            console.assert(piece > 0, ' piece > 0 ')
        }

        // Parse side to move
        this.stm = (fenstm === 'w') ? white : black;

        // Parse castling rights
        this.castlingRights = 0
        if (fencastling != '-') {
            for (let i = 0; i < fencastling.length; i++) {
                let char = fencastling[i];
                if (char == 'Q') this.castlingRights |= whitecancastleQ;
                if (char == 'K') this.castlingRights |= whitecancastleK;
                if (char == 'q') this.castlingRights |= blackcancastleQ;
                if (char == 'k') this.castlingRights |= blackcancastleK;
            }
        }

        // Parse en passant square
        this.enpassantSquare = (fenep == '-') ? -1 : squareto64(squareFromStr(fenep))

        // Parse 50-move counter
        this.counter50 = (fen50 == '-') ? 0 : Number(fen50)

        // Parse move number
        this.movenumber = (fenmn == '-') ? 1 : Number(fenmn)
        if (this.movenumber == 0) this.movenumber = 1

        this.movehalfnumber = ((this.movenumber) * 2) + this.stm

        // this.generateMoves()
        this.debug()
    }

    pieceat(sq) {
        let squareBB = squaretobitboard(sq)
        let pcolor = -1
        for (let color of [white, black]) {
            if (this.BBP[color][0] & squareBB) {
                pcolor = color
                break
            }
        }
        if (pcolor === -1) return empty

        if (this.BBP[pcolor][p] & squareBB) return makepiece(pcolor, p)
        if (this.BBP[pcolor][n] & squareBB) return makepiece(pcolor, n)
        if (this.BBP[pcolor][b] & squareBB) return makepiece(pcolor, b)
        if (this.BBP[pcolor][r] & squareBB) return makepiece(pcolor, r)
        if (this.BBP[pcolor][q] & squareBB) return makepiece(pcolor, q)
        if (this.BBP[pcolor][k] & squareBB) return makepiece(pcolor, k)

        console.assert(false, 'getFenBoard pieceat', sq)
    }

    getFenBoard() {
        let fenboard = ''
        let numempty = 0

        for (let rank = rank8; rank >= rank1; rank--) {

            for (let file = filea; file <= fileh; file++) {

                let sq = square64(file, rank)
                let piece = this.pieceat(sq)

                if (!piece) { numempty++; continue }
                if (numempty > 0) { fenboard += numempty.toString(); numempty = 0 }

                fenboard += pieceChar(piece) // charpieces[piece]                                            
            }

            if (numempty > 0) { fenboard += numempty.toString(); numempty = 0 }
            if (rank > rank1) fenboard += '/'
        }

        return fenboard
    }

    getFEN() {

        function getFenCastling(castlingRights) {

            if (!castlingRights) return '-'

            let cr = ''
            if (castlingRights & whitecancastleK) cr += 'K'
            if (castlingRights & whitecancastleQ) cr += 'Q'
            if (castlingRights & blackcancastleK) cr += 'k'
            if (castlingRights & blackcancastleQ) cr += 'q'

            return cr
        }

        let fenboard = this.getFenBoard()
        let fenstm = (this.stm == white) ? 'w' : 'b'
        let fencastling = getFenCastling(this.castlingRights)
        let fenep = (this.enpassantSquare > 0) ? square64ToStr(this.enpassantSquare) : '-'
        let fen50 = this.counter50
        let fenmn = this.movenumber

        return [fenboard, fenstm, fencastling, fenep, fen50, fenmn].join(' ')
    }

    setdebug(debug) {
        console.log('setdebug', debug)

        this.debugvalue = [1, '1', 'true', 'on', true].includes(debug)

        this.debug()
    }

    debug() {
        if (this.debugvalue) {



            console.log('History', this.history.debug())
            this.generate_bbmoves()
            console.log('bitbo fen', this.getFEN())
            console.log('bitbo moves', this.movesbb.length, this.getMovesStr().join(' '))
            if (this.numChecks > 1) {
                console.log('bb double check')
            }
            console.log('BB inCheck', BBbitCount(this.enemychecks), this.inCheck)

            let queenbb = lowestSetBit(this.BBP[white][q])
            let queensq = BBbitScanForward(queenbb)
            queensq = _d4
            let occ = this.BBP[white][0] | this.BBP[black][0] | squaretobitboard(queensq)
            // debug_bitboard(occ)
            let bb = calc_rook_attacks_odiff2(queensq, occ) // | calc_bishop_attacks_odiff2(queensq, occ)

            // fen 7Q/1k6/1p6/8/8/4P3/4K3/8 w - - 0 1
            // fen 6Q1/1k6/1p6/8/8/4P3/4K3/8 w - - 0 1            
            debug_bitboard(bb, 'queen')
            console.log('queen', square64ToStr(queensq))
        }
    }

    perft(depth) {

        // http://www.rocechess.ch/perft.html falla en perft 7 con los caballos 
        // console.log('perft ', depth)
        this.generate_bbmoves()
        var moves = this.movesbb
        var nodes = 0

        var nmoves = moves.length
        if (depth === 1) return nmoves
        // if (depth === 0) return 1

        for (var i = 0; i < nmoves; i++) {
            this.makemove(moves[i]);
            nodes += this.perft(depth - 1);
            this.undomove();
        }

        return nodes;
    }

    divide(depth) {

        // http://www.rocechess.ch/perft.html falla en perft 7 con los caballos 
        // console.log('perft ', depth)
        this.generate_bbmoves()
        var moves = this.movesbb
        var nodes = 0

        var nmoves = moves.length
        if (depth === 1) return nmoves
        // if (depth === 0) return 1

        for (var i = 0; i < nmoves; i++) {
            this.makemove(moves[i]);
            let movenodes = this.perft(depth - 1)
            nodes += movenodes
            console.log(this.getMoveStr(moves[i]), movenodes)
            this.undomove();
        }

        return nodes;
    }

}

function testbitboards() {

    let board = engine.board
    let bbboard = new BBBoard()

    bbboard.loadFEN(board.getFEN())
    // bbboard.init_bitboards(board)
    bbboard.generate_bbmoves(board.stm)

    console.log('bitbo fen', bbboard.getFEN())
    console.log('88fen fen', board.getFEN())

    console.log('bitbo moves', bbboard.movesbb.length, bbboard.getMovesStr().join(' '))
}










// [88507]
// Magic bitboard tables imported from external file
var lookup_table, b_magics, r_magics;
if (typeof module !== 'undefined' && require) {
    const magicTables = require('./magic-tables.js');
    lookup_table = magicTables.lookup_table;
    b_magics = magicTables.b_magics;
    r_magics = magicTables.r_magics;
} else {
    // In browser, these should be loaded via script tag before bitboard.js
}



// Node.js export compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BBBoard };
}

