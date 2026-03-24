const fs = require('fs');
const path = require('path');
const { instantiateSync } = require('@assemblyscript/loader');

class ASBoard {
    constructor() {
        const wasmBuffer = fs.readFileSync(path.join(__dirname, '..', 'asmovegen', 'export-board.wasm'));
        this.module = instantiateSync(wasmBuffer, {
            env: {
                memory: new WebAssembly.Memory({ initial: 8 }),
                abort: () => {}
            }
        });
        this.boardPtr = this.module.exports.createBoard();
    }

    loadFEN(fen) {
        const { __newString, loadFEN } = this.module.exports;
        const fenPtr = __newString(fen);
        loadFEN(this.boardPtr, fenPtr);
    }

    perft(depth) {
        // perft returns u64 which in JS is BigInt from AssemblyScript
        return Number(this.module.exports.perft(this.boardPtr, depth));
    }
}

module.exports = { ASBoard };
