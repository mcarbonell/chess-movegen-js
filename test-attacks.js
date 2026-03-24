const { RustBoard } = require('./tests/rust-node.js');

function test_attacks() {
    const board = new RustBoard('bitboard');
    // Queen at d1, White Pawn at d3
    const fen = "8/8/8/8/8/3P4/8/3Q4 w - - 0 1";
    board.loadFEN(fen);
    
    board.board.generate_moves();
    const count = board.board.move_count();
    console.log(`Moves for Queen at d1 (blocked by d3):`);
    for (let i = 0; i < count; i++) {
        const from = board.board.get_move_from(i);
        const to = board.board.get_move_to(i);
        if (squareToStr(from) === 'd1') {
            console.log(`d1-${squareToStr(to)}`);
        }
    }
}

function squareToStr(sq) {
    const f = sq % 8;
    const r = Math.floor(sq / 8);
    return String.fromCharCode(97 + f) + (r + 1);
}

test_attacks();
