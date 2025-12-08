"use strict";

console.clear()

// Load board implementation first (contains all const definitions)
importScripts('x88.js')
// importScripts('bitboard.js')  // Alternative: use bitboard instead

// All constants, functions, and classes are now defined in x88.js

// Engine-specific constants
const startpos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Utility functions for engine
function isNumeric(num) {
    return !isNaN(num)
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

class Move {
    from                // 6 bits  
    to                  // 6 bits 12
    movingpiece         // 3 bits
    capturedpiece       // 3 bits
    promotedpiece       // 3 bits 9  21 bits
    iscapture           // 1 bit
    iswinningcapture    // 1 bit
    iscastling          // 1 bit
    isenpassant         // 1 bit
    isdoublepush        // 1 bit
    issafesquareto      // 1 bit
    issattakedfrom      // 1 bit
    attackskingsquares  // 1 bit
    givescheck          // 1 bit
    givesdoublecheck    // 1 bit
    givespseudomate     // 1 bit
    // 11  -- hasta aqui 32 bits 4 bytes
    expectedvalue       // 2 bytes
}
// total 6 bytes

class Node {
    // value = 0;       // eval      2 bytes 16 bits 65535 
    parentNode = 0;  // position  4 bytes 32 bits 4294967295 4G 
    bestchild = 0;   // position  4 bytes 32 bits 4294967295 4G 
    nextsibling = 0; // position  1 byte (index actual + desplazamiento)
}
// total 10 bytes

// Node + move = 6 + 10 = 16 bytes
// En 4 Gigas de RAM, nos da 268.435.456 nodos
// hasta llenar la memoria
// a 100M nps,    2,7 segundos
// a  10M nps,   27 segundos
// a   1M nps,  268 segundos, 4 minutos y medio
// a 100k nps, 2680 segundos, 45 minutos
// a  10k nps,    7 horas y media

class UCIChessEngine {

    usebb = false
    board = (this.usebb) ? new BBBoard() : new Board()
    // board = new BBBoard()
    board = Object.seal(this.board)

    constructor() {
        // output('Engine constructor');
        // output(this.board.board.BYTES_PER_ELEMENT + ' bytes por casilla del tablero');    
    }

    getBoard() {
        // return board
    }

    init(fen) {
        this.board.loadFEN(fen)
    }

    reset() {
        this.board.reset()
        this.board.loadFEN(startpos)

    }

    debug(debug) {
        this.board.setdebug(debug)
    }

    loadFEN(fen) {
        return this.board.loadFEN(fen)
        // console.log('fen actual', this.board.getFEN())
    }

    getFEN() {
        // console.log('fen actual', this.board.getFEN())
        return this.board.getFEN()
    }

    move(move) {
        let from = (this.usebb) ? square64FromStr(move[0] + move[1]) : squareFromStr(move[0] + move[1])
        let to = (this.usebb) ? square64FromStr(move[2] + move[3]) : squareFromStr(move[2] + move[3])
        let prom = 0

        if (move.length == 5) {
            prom = charpieces.findIndex(el => (el === move[4]))
            console.assert(prom > 0, 'pieza que promociona no encontrada')
        }

        return this.board.makemove_old(from, to, prom)
    }

    perft(depth) {
        this.board.setdebug(false)
        return this.board.perft(depth)
    }

    undo() {
        return this.board.undomove()
    }

}


var engine = new UCIChessEngine();

var profile = false

onmessage = function (event) {

    var msg = event.data;
    postMessage("» " + msg);

    var params = msg.split(' ');
    var command = params.shift();

    switch (command) {

        case 'uci':
            postMessage("id name killer 3");
            postMessage("id author Mario Raúl Carbonell Martinez");
            postMessage("info string num cpus: " + navigator.hardwareConcurrency);
            postMessage("uciok");

            break;

        case 'isready':
            postMessage("readyok");
            break;

        case 'debug':
            // engine.debug(params[0])
            var debug = params.shift();
            engine.debug(debug)
            postMessage('info string debug ' + debug);
            break;

        case 'profile':
            // engine.debug(params[0])
            var profile1 = params.shift();
            profile = !profile
            // engine.debug(debug)
            postMessage('info string profile ' + profile.toString());
            break;

        case 'ucinewgame':
            engine.reset()
            // engine.loadFEN("r1bqk1nr/ppp2ppp/2nb4/3Q4/8/8/PPP1PPPP/RNB1KBNR w KQkq - 0 5")
            postMessage("ucinewgame ok");
            postMessage('info string fen ' + engine.getFEN())
            postMessage('info string syncboard')
            // postMessage(engine.getFEN());
            break;

        case 'setoption':
            postMessage(command + ' not implemented');
            break;

        case 'position':

            var position = params.shift();

            if (position === 'startpos') {
                engine.reset()
            }

            if (position === 'fen') {
                // 1B1N1b2/8/5kp1/p4n1R/P3K1P1/3r1R2/5P2/8 b - - 6 65 bm Rd4#; dm 1; id matein1.00005;
                var fenboard = params.shift()
                var fenturn = params.shift()
                var fencRsights = params.shift()
                var fenepSquare = params.shift()
                var fenhalfmoves = params.shift()
                var fennummove = params.shift()

                engine.loadFEN(fenboard + ' ' + fenturn + ' ' + fencRsights + ' ' +
                    fenepSquare + ' ' + fenhalfmoves + ' ' + fennummove)
            }

            var moves = params.shift();
            var move = ''
            if (moves === 'moves') {
                while (move = params.shift()) {
                    engine.move(move)
                }
            }

            postMessage('info string fen ' + engine.getFEN())
            postMessage('info string syncboard')

            break;

        case 'move':
            let movestr = params[0]
            let moveok = engine.move(movestr)

            if (moveok) {
                postMessage('info string move ' + movestr)
                postMessage('info string fen ' + engine.getFEN())
            } else {
                postMessage('info string cannot move ' + movestr)
            }

            break;

        case 'undo':
            let undook = engine.undo()

            if (undook) {
                postMessage('info string undo ok')
                postMessage('info string fen ' + engine.getFEN())
            } else {
                postMessage('info string cannot undo')
            }

            break;

        case 'go':
            postMessage('info string ' + command + ' not implemented');

            // thinking = true
            var command = params.shift()

            if (command == 'depth') {
                var depth = params.shift()
                // engine.minimaxRoot(depth)
            }

            if (command == 'mate') {
                var numMoves = params.shift()
                // engine.findMateIn(numMoves)
            }

            if (command == 'alt') {
                var depth = params.shift()
                // engine.findMaxRoot(depth)
            }

            // thinking = false
            break;

        case 'stop':
            postMessage('info string ' + command + ' not implemented');
            break;

        case 'ponderhit':
            postMessage('info string ' + command + ' not implemented');
            break;

        case 'quit':
            postMessage('info string ' + command + ' not implemented');
            break;

        case 'eval':
            postMessage('info string ' + command + ' not implemented');

            // engine.resetStats()
            // var eval = engine.evaluateBoard();
            // var response = {eval: eval, quies: engine.quiescence(-engine.MATE, engine.MATE)}
            // postMessage(JSON.stringify(eval));
            // engine.postMessageStats()

            break;

        case 'perft':

            // go perft 7, stockfish, rapidisimo

            var depth = params.shift()
            depth = isNumeric(depth) ? Number(depth) : 1
            postMessage('info string perft ' + depth);

            if (profile) console.profile();
            // doSomeVeryExpensiveWork();
            var d = performance.now()
            var result = engine.perft(depth)
            var d2 = performance.now()
            if (profile) console.profileEnd();

            var elapsedtime = (d2 - d).toFixed(2);
            var nps = Math.round(1000 * (result / elapsedtime));
            // var response = {depth: depth, perft: result, time: elapsedtime, nps: nps}

            var resultformatted = numberWithCommas(result)
            var elapsedtimeformatted = numberWithCommas(elapsedtime)
            var npsformatted = numberWithCommas(nps)

            postMessage('info string perft ' + depth + ' ' + resultformatted + ' time ' + elapsedtimeformatted + ' nps:' + npsformatted);


            // postMessage(JSON.stringify(response));

            break;

        default:
            postMessage('info string ' + command + ' Comando no reconocido');

    }
};




postMessage("Engine initialized");
