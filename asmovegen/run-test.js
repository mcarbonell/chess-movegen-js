const fs = require('fs');
const path = require('path');

async function main() {
    console.log('=== Perft Tests ===\n');
    
    const positions = [
        { name: 'Initial', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', depth: 2, expected: 400 },
        { name: 'Kiwipete', fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', depth: 2, expected: 2039 },
        { name: 'Position 3', fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', depth: 2, expected: 191 },
    ];
    
    // JS
    const { Board: BoardJS } = require('../js/x88.js');
    
    console.log('JS:');
    for (const pos of positions) {
        const board = new BoardJS();
        board.loadFEN(pos.fen);
        let result = board.perft(pos.depth);
        console.log(`  ${pos.name} d${pos.depth}: ${result} (expected ${pos.expected}) ${result === pos.expected ? '✓' : '✗'}`);
    }
    
    console.log('');
    
    // Load WASM
    const wasmBuffer = fs.readFileSync(path.join(__dirname, 'test.wasm'));
    const module = await WebAssembly.instantiate(wasmBuffer, {
        env: { 
            memory: new WebAssembly.Memory({ initial: 8 }),
            abort: () => {} 
        }
    });
    
    console.log('AS:');
    let as1 = module.instance.exports.testPerftStartD2();
    console.log(`  Initial d2: ${as1} (expected 400) ${as1 === 400 ? '✓' : '✗'}`);
    
    let as2 = module.instance.exports.testKiwipeteD2();
    console.log(`  Kiwipete d2: ${as2} (expected 2039) ${as2 === 2039 ? '✓' : '✗'}`);
    
    let as3 = module.instance.exports.testPos3D2();
    console.log(`  Position 3 d2: ${as3} (expected 191) ${as3 === 191 ? '✓' : '✗'}`);
}

main().catch(console.error);
