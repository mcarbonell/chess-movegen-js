"use strict";

importScripts('../../rust-movegen/pkg-web/rust_movegen.js');

let board = null;
let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

async function init() {
    try {
        await wasm_bindgen({ module_or_path: '../../rust-movegen/pkg-web/rust_movegen_bg.wasm' });
        board = new wasm_bindgen.RustBitboardBoard();
        // Cargar el FEN actual por si se recibió el mensaje 'position' antes de que terminara el init
        if (currentFen) board.loadFEN(currentFen);
        postMessage("info string Rust Bitboard Engine initialized");
    } catch (e) {
        postMessage("info string Error init: " + e.message);
    }
}

init();

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

onmessage = function (e) {
    let msg = e.data;
    let params = msg.split(' ');
    let command = params.shift();

    switch (command) {
        case 'uci':
            postMessage('id name Rust Bitboard');
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
            if (board) board.loadFEN(fen);
            postMessage('info string fen ' + currentFen);
            postMessage('info string syncboard');
            break;
        case 'perft':
            let depth = Number(params.shift());
            if (!board) return;
            
            let start = performance.now();
            let nodes = Number(board.perft(depth));
            let end = performance.now();
            let elapsed = end - start;
            let nps = Math.round(1000 * (nodes / elapsed));
            
            postMessage('info string perft ' + depth + ' ' + 
                numberWithCommas(nodes) + ' time ' + elapsed.toFixed(2) + ' nps:' + numberWithCommas(nps));
            break;
    }
};