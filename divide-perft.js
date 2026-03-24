const { RustBoard } = require('./tests/rust-node.js');

function perft(board, depth) {
    if (depth === 0) return 1;
    
    board.board.generate_moves();
    const count = board.board.move_count();
    if (depth === 1) return count;
    
    let nodes = 0;
    for (let i = 0; i < count; i++) {
        const from = board.board.get_move_from(i);
        const to = board.board.get_move_to(i);
        
        if (board.board.make_move(i)) {
            nodes += perft(board, depth - 1);
            board.board.undo_move();
        }
    }
    return nodes;
}

function debug_perft() {
    const fen = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 10"; // Pos 4
    const board = new RustBoard('bitboard');
    board.loadFEN(fen);
    
    console.log("Dividing perft at depth 3 for Pos 4:");
    board.board.generate_moves();
    const count = board.board.move_count();
    let total = 0;
    for (let i = 0; i < count; i++) {
        const from = board.board.get_move_from(i);
        const to = board.board.get_move_to(i);
        const moveStr = squareToStr(from) + squareToStr(to);
        
        if (board.board.make_move(i)) {
            const nodes = perft(board, 2);
            console.log(`${moveStr}: ${nodes}`);
            total += nodes;
            board.board.undo_move();
        }
    }
    console.log(`Total: ${total}`);
}

function squareToStr(sq) {
    const f = sq % 8;
    const r = Math.floor(sq / 8);
    return String.fromCharCode(97 + f) + (r + 1);
}

debug_perft();
