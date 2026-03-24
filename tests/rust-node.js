// rust-node.js - Node.js wrapper for the Rust WASM move generator
const { RustBoard, RustBitboardBoard } = require('../rust-movegen/pkg/rust_movegen.js');

class RustBoardWrapper {
    constructor(engineType = 'x88') {
        if (engineType === 'bitboard' || engineType === 'rust-bb') {
            this.board = new RustBitboardBoard();
        } else {
            this.board = new RustBoard();
        }
    }

    reset() {
        this.board.reset();
    }

    // This method is called by the test runner
    loadFEN(fen) {
        this.board.loadFEN ? this.board.loadFEN(fen) : this.board.load_fen(fen);
    }

    perft(depth) {
        return Number(this.board.perft(depth));
    }
}

module.exports = { RustBoard: RustBoardWrapper };
