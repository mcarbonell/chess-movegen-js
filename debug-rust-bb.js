const { RustBoard } = require('./tests/rust-node.js');
const bbWrapper = new (class extends RustBoard { constructor() { super('bitboard'); } })();
const bb = bbWrapper.board;

bb.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
bb.generate_moves();
const count = bb.move_count();
console.log(`Initial Black moves: ${count}`);
for (let i = 0; i < count; i++) {
    const from = bb.get_move_from(i);
    const to = bb.get_move_to(i);
    console.log(`Black move ${i} from ${from} to ${to}`);
}
