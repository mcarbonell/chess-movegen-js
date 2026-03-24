import { Board } from "./board";

export function testPerftStartD2(): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    return <i32>board.perft(2);
}

export function testKiwipeteD2(): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    return <i32>board.perft(2);
}

export function perftStartD3(): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    return <i32>board.perft(3);
}

export function perftStartD4(): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    return <i32>board.perft(4);
}

export function perftKiwipeteD3(): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    return <i32>board.perft(3);
}

export function perftPos3D3(): i32 {
    const board = new Board();
    board.loadFEN("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    return <i32>board.perft(3);
}

export function perftPos3D4(): i32 {
    const board = new Board();
    board.loadFEN("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    return <i32>board.perft(4);
}

export function perftPos4D3(): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");
    return <i32>board.perft(3);
}

export function perftPos5D3(): i32 {
    const board = new Board();
    board.loadFEN("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8");
    return <i32>board.perft(3);
}

export function perftPos6D3(): i32 {
    const board = new Board();
    board.loadFEN("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10");
    return <i32>board.perft(3);
}

export function testPos3D2(): i32 {
    const board = new Board();
    board.loadFEN("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    return <i32>board.perft(2);
}

export function perftPos3D1(): i32 {
    const board = new Board();
    board.loadFEN("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    board.generateMoves();
    return board.moveCount;
}

export function getPos3MoveFrom(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    board.generateMoves();
    return board.moveFrom[idx];
}

export function getPos3MoveTo(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    board.generateMoves();
    return board.moveTo[idx];
}

export function perftPos3Move(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    board.generateMoves();
    let from = board.moveFrom[idx];
    let to = board.moveTo[idx];
    for (let i = 0; i < board.moveCount; i++) {
        if (board.moveFrom[i] == from && board.moveTo[i] == to) {
            board.makemoveIdx(i);
            board.generateMoves();
            let count = board.moveCount;
            board.undomove();
            return count;
        }
    }
    return -1;
}

export function testInitialD1(): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.generateMoves();
    return board.moveCount;
}

export function getInitialMoveFrom(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.generateMoves();
    return board.moveFrom[idx];
}

export function getInitialMoveTo(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.generateMoves();
    return board.moveTo[idx];
}

export function perftInitialDivide(d: i32): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    return <i32>board.perft(d);
}

export function perftInitialMove(idx: i32, d: i32): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.generateMoves();
    let from = board.moveFrom[idx];
    let to = board.moveTo[idx];
    for (let i = 0; i < board.moveCount; i++) {
        if (board.moveFrom[i] == from && board.moveTo[i] == to) {
            board.makemoveIdx(i);
            let count = <i32>board.perft(d - 1);
            board.undomove();
            return count;
        }
    }
    return -1;
}

export function perftInitialManualDivideDebug(): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.generateMoves();
    let total: i32 = 0;
    for (let i = 0; i < board.moveCount; i++) {
        board.makemoveIdx(i);
        let count = <i32>board.perft(1);
        board.undomove();
        total += count;
        if (count !== 20) {
            // Manual check
        }
    }
    return total;
}

export function perftInitialCounts(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.generateMoves();
    board.makemoveIdx(idx);
    return board.moveCount;
}

export function getKiwipeteMoveFrom(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    return board.moveFrom[idx];
}

export function getKiwipeteMoveTo(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    return board.moveTo[idx];
}

export function perftKiwipeteMove(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    let from = board.moveFrom[idx];
    let to = board.moveTo[idx];
    for (let i = 0; i < board.moveCount; i++) {
        if (board.moveFrom[i] == from && board.moveTo[i] == to) {
            board.makemoveIdx(i);
            board.generateMoves();
            let count = board.moveCount;
            board.undomove();
            return count;
        }
    }
    return -1;
}

export function perftKiwipeteMove2(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    let from = board.moveFrom[idx];
    let to = board.moveTo[idx];
    for (let i = 0; i < board.moveCount; i++) {
        if (board.moveFrom[i] == from && board.moveTo[i] == to) {
            board.makemoveIdx(i);
            let count = <i32>board.perft(1);
            board.undomove();
            return count;
        }
    }
    return -1;
}

export function testKiwipeteCounts(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    board.makemoveIdx(idx);
    board.generateMoves();
    let count = board.moveCount;
    board.undomove();
    return count;
}

export function testAfterE4D1(): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    board.generateMoves();
    return board.moveCount;
}

export function testAfterE4D2(): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    return <i32>board.perft(2);
}

export function testAfterE4MoveD1(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    board.generateMoves();
    board.makemoveIdx(idx);
    board.generateMoves();
    let count = board.moveCount;
    board.undomove();
    return count;
}

export function perftInitialDivideTotal(): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    return <i32>board.divide(2);
}

export function perftInitialOneMove(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.generateMoves();
    let from = board.moveFrom[idx];
    let to = board.moveTo[idx];
    for (let i = 0; i < board.moveCount; i++) {
        if (board.moveFrom[i] == from && board.moveTo[i] == to) {
            board.makemoveIdx(i);
            let count = <i32>board.perft(1);
            board.undomove();
            return count;
        }
    }
    return -1;
}

export function comparePerftVsManualKiwipete(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    let from = board.moveFrom[idx];
    let to = board.moveTo[idx];
    for (let i = 0; i < board.moveCount; i++) {
        if (board.moveFrom[i] == from && board.moveTo[i] == to) {
            board.makemoveIdx(i);
            let p1 = <i32>board.perft(1);
            board.generateMoves();
            let mc = board.moveCount;
            board.undomove();
            if (p1 !== mc) {
                // Return negative difference
                return -1;
            }
            return p1;
        }
    }
    return -2;
}

export function debugPerftKiwipete(idx: i32): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    let from = board.moveFrom[idx];
    let to = board.moveTo[idx];
    for (let i = 0; i < board.moveCount; i++) {
        if (board.moveFrom[i] == from && board.moveTo[i] == to) {
            board.makemoveIdx(i);
            
            // Call perft(1) which generates moves and returns count
            let count = <i32>board.perft(1);
            
            board.undomove();
            return count;
        }
    }
    return -1;
}

export function testPerftKiwipeteDivide(): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    let nmoves = board.moveCount;
    let total: i32 = 0;
    for (let i = 0; i < nmoves; i++) {
        board.makemoveIdx(i);
        let count = <i32>board.perft(1);
        total += count;
        board.undomove();
    }
    return total;
}

export function manualPerftKiwipete2(): i32 {
    // Method: Create new board for each root move
    let total: i32 = 0;
    for (let i = 0; i < 48; i++) {
        const board = new Board();
        board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
        board.generateMoves();
        board.makemoveIdx(i);
        board.generateMoves();
        total += board.moveCount;
    }
    return total;
}

export function debugPerftIterate(): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    let nmoves = board.moveCount;
    let total: i32 = 0;
    
    for (let i = 0; i < nmoves; i++) {
        board.makemoveIdx(i);
        board.generateMoves();
        let count = board.moveCount;
        board.undomove();
        total += count;
    }
    return total;
}

export function debugMove39(): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    
    // Make move 39 (a1b1)
    board.makemoveIdx(39);
    
    // Method 1
    board.generateMoves();
    let count1 = board.moveCount;
    
    // Method 2
    let count2 = <i32>board.perft(1);
    
    board.undomove();
    
    return count1 - count2;  // Should be 0 if equal
}

export function debugSequence(): i32 {
    const board = new Board();
    board.loadFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    board.generateMoves();
    
    // Iterate through moves and check each one
    let nmoves = board.moveCount;
    for (let i = 0; i < nmoves; i++) {
        board.makemoveIdx(i);
        board.generateMoves();
        let count1 = board.moveCount;
        let count2 = <i32>board.perft(1);
        board.undomove();
        
        if (count1 !== count2) {
            return i;  // Return first index where they differ
        }
    }
    return -1;
}
