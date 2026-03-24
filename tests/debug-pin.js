const fs = require('fs');
const loader = require('@assemblyscript/loader');
const buf = fs.readFileSync('asmovegen/export-board.wasm');
const wm = loader.instantiateSync(buf, { env: { memory: new WebAssembly.Memory({ initial: 8 }), abort: function() {} } });
const exp = wm.exports;
const bp = exp.createBoard();
const fen = 'r3k2r/p1ppqpb1/1n2pnp1/1b1PN3/1p2P3/2N2Q1p/PPPBBPPP/R4K1R w kq - 2 2';
exp.loadFEN(bp, exp.__newString(fen));
exp.generateMoves(bp);

const files = 'abcdefgh';
function sq2str(s) { return s < 0 ? 'inv' : files[s & 7] + ((s >> 4) + 1); }

const pins = [];
for (let s = 0; s < 128; s++) {
    if (s & 0x88) continue;
    const pin = exp.getPinDirection(bp, 0, s);
    if (pin !== 0) pins.push(sq2str(s) + '=' + pin);
}
console.log('WHITE pins:', pins.join(', ') || 'none');
console.log('numattacks BLACK e2(20):', exp.getNumAttacks(bp, 1, 20));
console.log('pieceat b5(65):', exp.getPieceAt(bp, 65));
console.log('king WHITE:', sq2str(exp.getKingSquare(bp, 0)));
