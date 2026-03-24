// Compare divide output between JS and AS generators
const fs = require('fs');
const path = require('path');
const { instantiateSync } = require('@assemblyscript/loader');
const { Board: JSBoard } = require('./x88-node.js');

const fen = process.argv[2] || 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1';
const depth = parseInt(process.argv[3] || '3');

function squareToStr(sq) {
    const files = 'abcdefgh';
    return files[sq & 7] + ((sq >> 4) + 1);
}

function promoChar(p) {
    if (!p) return '';
    const t = p & 7;
    return ['', 'p', 'n', 'b', 'r', 'q', 'k'][t] || '';
}

// JS divide
const jsBoard = new JSBoard();
jsBoard.loadFEN(fen);
jsBoard.generateMoves();
const jsMoves = [...jsBoard.moves];
const jsResults = {};
for (const move of jsMoves) {
    jsBoard.makemove(move);
    const nodes = depth > 1 ? jsBoard.perft(depth - 1) : 1;
    jsBoard.undomove();
    const uci = squareToStr(move.from) + squareToStr(move.to) + promoChar(move.promotedpiece);
    jsResults[uci] = nodes;
}

// AS divide
const wasmBuffer = fs.readFileSync(path.join(__dirname, '..', 'asmovegen', 'export-board.wasm'));
const wasmModule = instantiateSync(wasmBuffer, {
    env: { memory: new WebAssembly.Memory({ initial: 8 }), abort: () => {} }
});
const exp = wasmModule.exports;
const boardPtr = exp.createBoard();
exp.loadFEN(boardPtr, exp.__newString(fen));
exp.generateMoves(boardPtr);
const nmoves = exp.getMoveCount(boardPtr);

// Save moves before recursion overwrites them
const asMoveList = [];
for (let i = 0; i < nmoves; i++) {
    asMoveList.push({
        from: exp.getMoveFrom(boardPtr, i),
        to: exp.getMoveTo(boardPtr, i),
        promoted: exp.getMovePromoted(boardPtr, i)
    });
}

const asResults = {};
for (const m of asMoveList) {
    exp.makemove(boardPtr, m.from, m.to, m.promoted);
    const nodes = depth > 1 ? Number(exp.perft(boardPtr, depth - 1)) : 1;
    exp.undomove(boardPtr);
    const uci = squareToStr(m.from) + squareToStr(m.to) + promoChar(m.promoted);
    asResults[uci] = (asResults[uci] || 0) + nodes;
}

// Compare
const allMoves = new Set([...Object.keys(jsResults), ...Object.keys(asResults)]);
const diffs = [];
for (const uci of [...allMoves].sort()) {
    const js = jsResults[uci] || 0;
    const as = asResults[uci] || 0;
    if (js !== as) diffs.push({ uci, js, as, diff: as - js });
}

console.log(`FEN: ${fen}`);
console.log(`Depth: ${depth}`);
console.log(`JS total: ${Object.values(jsResults).reduce((a,b)=>a+b,0)}`);
console.log(`AS total: ${Object.values(asResults).reduce((a,b)=>a+b,0)}`);
console.log('');
if (diffs.length === 0) {
    console.log('No differences found!');
} else {
    console.log(`Differences (${diffs.length} moves):`);
    for (const d of diffs) {
        console.log(`  ${d.uci}: JS=${d.js} AS=${d.as} diff=${d.diff > 0 ? '+' : ''}${d.diff}`);
    }
}
