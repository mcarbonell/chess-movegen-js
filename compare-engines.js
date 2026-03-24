const { RustBoard } = require('./tests/rust-node.js');

function perft(board, depth) {
    if (depth === 0) return 1;
    return Number(board.board.perft(depth));
}

function debug_perft() {
    const fen = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 10"; // Pos 4
    console.log("FEN:", fen);
    
    const engines = [
        { name: 'rust-x88', board: new RustBoard('x88') },
        { name: 'rust-bb', board: new RustBoard('bitboard') }
    ];
    
    engines.forEach(e => {
        e.board.loadFEN(fen);
        console.log(`\nEngine: ${e.name}`);
        e.board.board.generate_moves();
        const count = e.board.board.move_count();
        console.log(`Depth 1 moves: ${count}`);
        
        const moves = [];
        for (let i = 0; i < count; i++) {
            const from = e.board.board.get_move_from(i);
            const to = e.board.board.get_move_to(i);
            const moveStr = squareToStr(from, e.name) + squareToStr(to, e.name);
            
            if (e.board.board.make_move(i)) {
                const nodes = perft(e.board, 2);
                moves.push({ str: moveStr, nodes });
                e.board.board.undo_move();
            }
        }
        moves.sort((a,b) => a.str.localeCompare(b.str));
        moves.forEach(m => console.log(`${m.str}: ${m.nodes}`));
        console.log(`Total Depth 3: ${moves.reduce((acc, m) => acc + m.nodes, 0)}`);
    });
}

function squareToStr(sq, type) {
    if (type === 'rust-bb') {
        const f = sq % 8;
        const r = Math.floor(sq / 8);
        return String.fromCharCode(97 + f) + (r + 1);
    } else {
        const f = sq & 7;
        const r = sq >> 4;
        return String.fromCharCode(97 + f) + (r + 1);
    }
}

debug_perft();
