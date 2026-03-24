const { RustBoard } = require('./tests/rust-node.js');

function test_is_attacked() {
    const fen = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 10"; // Pos 4
    const board = new RustBoard('bitboard');
    board.loadFEN(fen);
    
    // b6 is rank 6 file 1 -> index 5*8 + 1 = 41
    const sq = 41;
    const isAttacked = board.board.is_attacked(sq, 1); // Attacked by BLACK (1)?
    console.log(`Is b6 (41) attacked by Black? ${isAttacked}`);
    
    const x88 = new RustBoard('x88');
    x88.loadFEN(fen);
    // b6 in x88 -> rank 5 file 1 -> 5*16 + 1 = 81
    const isAttackedX88 = x88.board.is_attacked(81, 1);
    console.log(`Is b6 (81) attacked by Black (x88)? ${isAttackedX88}`);
}

test_is_attacked();
