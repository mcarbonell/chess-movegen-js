import { instantiate } from '../../asmovegen/export-board.js';

let board = null;
let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
let wasmExports = null;

async function init() {
    try {
        const response = await fetch('../../asmovegen/export-board.wasm');
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.compile(buffer);
        wasmExports = await instantiate(module, { env: { abort: () => {} } });
        board = wasmExports.createBoard();
        // Cargar el FEN actual por si se recibió el mensaje 'position' antes de que terminara el init
        if (currentFen && board && wasmExports) wasmExports.loadFEN(board, currentFen);
        postMessage("info string AssemblyScript Engine initialized");
    } catch (e) {
        postMessage("info string Error init: " + e.message);
    }
}

init();

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

self.onmessage = function (e) {
    let msg = e.data;
    let params = msg.split(' ');
    let command = params.shift();

    switch (command) {
        case 'uci':
            postMessage('id name AssemblyScript x88');
            postMessage('id author Mario');
            postMessage('uciok');
            break;
        case 'isready':
            postMessage('readyok');
            break;
        case 'position':
            if (params[0] === 'fen') params.shift();
            let fen = msg.substring(msg.indexOf('fen') + 4);
            currentFen = fen;
            if (board && wasmExports) wasmExports.loadFEN(board, fen);
            postMessage('info string fen ' + currentFen);
            postMessage('info string syncboard');
            break;
        case 'perft':
            let depth = Number(params.shift());
            if (!board) return;
            
            let start = performance.now();
            let nodes = Number(wasmExports.perft(board, depth));
            let end = performance.now();
            let elapsed = end - start;
            let nps = Math.round(1000 * (nodes / elapsed));
            
            postMessage('info string perft ' + depth + ' ' + 
                numberWithCommas(nodes) + ' time ' + elapsed.toFixed(2) + ' nps:' + numberWithCommas(nps));
            break;
    }
};