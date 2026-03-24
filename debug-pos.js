const { RustBoard } = require('./tests/rust-node.js');

function debug_pos5() {
    const fen = "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8";
    const board = new RustBoard('x88');
    board.loadFEN(fen);
    
    // We don't have getMoves() on RustBoard, but we can call it on the internal board.
    // Actually, I can just count them.
    board.board.generate_moves();
    const count = board.board.move_count();
    console.log(`Total moves: ${count}`);
    
    const pieces = {};
    for (let i = 0; i < count; i++) {
        const from = board.board.get_move_from(i);
        const to = board.board.get_move_to(i);
        const fromStr = squareToStr(from);
        const toStr = squareToStr(to);
        const piece = fromStr; // Group by from square
        pieces[piece] = (pieces[piece] || 0) + 1;
        // console.log(`${fromStr}-${toStr}`);
    }
    console.log(pieces);
}

function squareToStr(sq) {
    const f = sq & 7;
    const r = sq >> 4;
    return String.fromCharCode(97 + f) + (r + 1);
}

debug_pos5();
