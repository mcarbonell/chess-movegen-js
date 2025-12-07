const path = require('path');

// --- Global Constants and Helpers for bitboard.js ---

// File and Rank constants (x88 style, but required by bitboard.js loadFEN logic)
global.filea = 0;
global.fileb = 1;
global.filec = 2;
global.filed = 3;
global.filee = 4;
global.filef = 5;
global.fileg = 6;
global.fileh = 7;

global.rank1 = 0;
global.rank2 = 1;
global.rank3 = 2;
global.rank4 = 3;
global.rank5 = 4;
global.rank6 = 5;
global.rank7 = 6;
global.rank8 = 7;

// x88 Square Helpers (needed because bitboard.js loadFEN uses squareto64(squareFromStr(fenep)))
// and squareto64 uses file() and rank() which expect x88 squares.
global.file = function (square) {
    return square & 7;
}

global.rank = function (square) {
    return square >>> 4;
}

global.square = function (file, rank) {
    return file + rank * 16;
}

// These helper functions are also defined in bitboard.js but strictly scoped to the module.
// We define them globally so our global.squareFromStr can use them.
global.fileFromChar = function (char) {
    return char.charCodeAt(0) - 'a'.charCodeAt(0);
}

global.rankFromChar = function (char) {
    return char.charCodeAt(0) - '1'.charCodeAt(0);
}

global.squareFromStr = function (str) {
    return global.square(global.fileFromChar(str[0]), global.rankFromChar(str[1]));
}

// ----------------------------------------------------

const bitboard = require(path.join(__dirname, '..', 'js', 'bitboard.js'));

module.exports = {
    BBBoard: bitboard.BBBoard
};
