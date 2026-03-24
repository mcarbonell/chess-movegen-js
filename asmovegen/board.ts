import {
    WHITE, BLACK, EMPTY, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING,
    WP, WN, WB, WR, WQ, WK, BP, BN, BB, BR, BQ, BK,
    MAXPLY, WHITE_CASTLE_K, WHITE_CASTLE_Q, BLACK_CASTLE_K, BLACK_CASTLE_Q,
    FILE_A, FILE_H, FILE_G, FILE_F, FILE_D, FILE_B, RANK_1, RANK_8,
    MASK_CAPTURE, MASK_PROMOTION, MASK_PAWNMOVE, MASK_EP, MASK_CASTLING,
    MASK_CHECK, MASK_DOUBLECHECK, MASK_DISCOVERCHECK, MASK_SAFE,
    MASK_HANGING, MASK_FREECAPTURE, MASK_WINNINGCAPTURE,
    A1, B1, C1, D1, E1, F1, G1, H1, E8, F8, G8, C8, D8, A8, H8, B8,
    A2, H2,
    pcolor, ptype, makepiece, opposite, file, rank, validSquare, square,
    OFFSETS_KNIGHT, OFFSETS_BISHOP, OFFSETS_ROOK, OFFSETS_QUEEN, OFFSETS_KING,
    charToPiece, pieceToChar, checkbit, attackbit, lowestSetBit, bitCount, parseInt, absI32,
    RAYS, PIECE_BY_OFFSET, getRay
} from "./constants";

export interface Move {
    from: i32;
    to: i32;
    movingpiece: u8;
    captured: u8;
    promotedpiece: u8;
    mask: u8;
}

export class Board {
    stm: u8 = WHITE;
    counter50: u8 = 0;
    castlingRights: u8 = 0;
    enpassantSquare: i32 = -1;
    movenumber: i32 = 1;
    movehalfnumber: i32 = 1;

    moves: Int8Array = new Int8Array(0);

    inCheck: bool = false;
    inDoubleCheck: bool = false;
    inCheckMate: bool = false;
    inStalemate: bool = false;

    pieceat: Int8Array = new Int8Array(128);
    kingsquares: Int8Array = new Int8Array(2);
    piecesquares: Int8Array[] = [new Int8Array(16), new Int8Array(16)];

    moveFrom: Int32Array = new Int32Array(256);
    moveTo: Int32Array = new Int32Array(256);
    moveMovingpiece: Uint8Array = new Uint8Array(256);
    moveCaptured: Uint8Array = new Uint8Array(256);
    movePromoted: Uint8Array = new Uint8Array(256);
    moveMask: Uint8Array = new Uint8Array(256);
    moveCount: i32 = 0;

    attacks: Int32Array[] = [new Int32Array(128), new Int32Array(128)];
    numattacks: Uint8Array[] = [new Uint8Array(128), new Uint8Array(128)];
    chekingSquares: Int32Array[] = [new Int32Array(128), new Int32Array(128)];
    pinDirection: Int32Array[] = [new Int32Array(128), new Int32Array(128)];
    inchekValidSquares: Uint8Array[] = [new Uint8Array(128), new Uint8Array(128)];
    matingSquares: Int32Array[] = [new Int32Array(128), new Int32Array(128)];
    kingescapes: Int8Array[] = [new Int8Array(8), new Int8Array(8)];

    kingschecks: Uint8Array = new Uint8Array(2);
    // For undo - using separate arrays instead of returning object
    historyFrom: Int32Array = new Int32Array(MAXPLY);
    historyTo: Int32Array = new Int32Array(MAXPLY);
    historyCaptured: Uint8Array = new Uint8Array(MAXPLY);
    historyPromoted: Uint8Array = new Uint8Array(MAXPLY);
    historyC50: Uint8Array = new Uint8Array(MAXPLY);
    historyCR: Uint8Array = new Uint8Array(MAXPLY);
    historyEP: Int8Array = new Int8Array(MAXPLY);
    historyPly: i32 = 0;
    checkingSquare: i32 = -1;

    resetHistory(): void {
        this.historyPly = 0;
    }

    addHistory(from: i32, to: i32, captured: u8, promoted: u8, c50: u8, cr: u8, ep: i32): void {
        this.historyFrom[this.historyPly] = from;
        this.historyTo[this.historyPly] = to;
        this.historyCaptured[this.historyPly] = captured;
        this.historyPromoted[this.historyPly] = promoted;
        this.historyC50[this.historyPly] = c50;
        this.historyCR[this.historyPly] = cr;
        this.historyEP[this.historyPly] = <i8>ep;
        this.historyPly++;
    }

    popHistory(): bool {
        if (this.historyPly == 0) return false;
        this.historyPly--;
        return true;
    }

    reset(): void {
        this.resetHistory();
        this.stm = WHITE;
        this.counter50 = 0;
        this.castlingRights = 0;
        this.enpassantSquare = -1;
        this.movenumber = 1;
        this.movehalfnumber = 1;
        this.moveCount = 0;
        this.inCheck = false;
        this.inDoubleCheck = false;
        this.inCheckMate = false;
        this.inStalemate = false;
        this.pieceat.fill(EMPTY);
        this.kingsquares[0] = -1;
        this.kingsquares[1] = -1;
        this.piecesquares[0].fill(-1);
        this.piecesquares[1].fill(-1);
    }

    addpiece(color: u8, piece: u8, sq: i32): void {
        this.pieceat[sq] = piece;
        if (ptype(piece) == KING) {
            this.kingsquares[color] = <i8>sq;
            return;
        }
        for (let i = 0; i < 16; i++) {
            if (this.piecesquares[color][i] == -1) {
                this.piecesquares[color][i] = <i8>sq;
                return;
            }
        }
    }

    removepiece(color: u8, sq: i32): void {
        this.pieceat[sq] = EMPTY;
        for (let i = 0; i < 16; i++) {
            if (this.piecesquares[color][i] == sq) {
                this.piecesquares[color][i] = -1;
                return;
            }
        }
    }

    movepiece(color: u8, piece: u8, from: i32, to: i32): void {
        this.pieceat[to] = piece;
        this.pieceat[from] = EMPTY;
        if (ptype(piece) == KING) {
            this.kingsquares[color] = <i8>to;
            return;
        }
        for (let i = 0; i < 16; i++) {
            if (this.piecesquares[color][i] == from) {
                this.piecesquares[color][i] = <i8>to;
                return;
            }
        }
    }

    addattack(who: u8, piecetype: u8, from: i32, to: i32): void {
        this.attacks[who][to] |= attackbit(piecetype);
        this.numattacks[who][to]++;

        if (to == this.kingsquares[1 - who]) {
            if ((1 - who) == this.stm) {
                this.kingschecks[1 - who]++;
            }
            this.checkingSquare = from;
            this.inchekValidSquares[1 - who][from] = 1;
        }
    }

    addmove(from: i32, to: i32, maskbits: u8 = 0, promotedpiece: u8 = 0): void {
        let movingpiece = this.pieceat[from];
        let capturedpiece = (maskbits & MASK_EP) ? PAWN : this.pieceat[to];

        if (this.inCheck && ptype(movingpiece) != KING && this.inchekValidSquares[this.stm][to] == 0) {
            return;
        }

        let pindir = this.pinDirection[this.stm][from];
        if (pindir != 0) {
            let diff = from - to;
            let index = diff + 119;
            let movedirection = (index >= 0 && index < 239) ? RAYS[index] : 0;
            if (absI32(pindir) != absI32(movedirection)) {
                return;
            }
        }

        let chekingpiece = (maskbits & MASK_PROMOTION) ? promotedpiece : movingpiece;
        if (this.chekingSquares[this.stm][to] & checkbit(ptype(chekingpiece))) {
            maskbits |= MASK_CHECK;
        }

        if (maskbits & MASK_CASTLING) {
            let rookfile = (file(to) == FILE_G) ? FILE_F : FILE_D;
            let rooksquare = square(rookfile, rank(to));
            if (this.chekingSquares[this.stm][rooksquare] & checkbit(ROOK)) {
                maskbits |= MASK_CHECK;
            }
        }

        if (this.chekingSquares[this.stm][from] & MASK_DISCOVERCHECK) {
            let discoverinfo = this.chekingSquares[this.stm][from];
            let offset = discoverinfo & 0xFF;
            let moveoffset = absI32(from - to);
            if (moveoffset != offset || (maskbits & MASK_CASTLING)) {
                maskbits |= MASK_DISCOVERCHECK;
            }
        }

        let attackbits = this.attacks[opposite(this.stm)][to];
        if (attackbits == 0) {
            maskbits |= MASK_SAFE;
        } else {
            if (lowestSetBit(attackbits) < lowestSetBit(attackbit(movingpiece))) {
                maskbits |= MASK_HANGING;
            }
        }

        if (capturedpiece != EMPTY) {
            maskbits |= MASK_CAPTURE;
            if (bitCount(attackbits) == 0) maskbits |= MASK_FREECAPTURE;
            if (ptype(capturedpiece) > ptype(movingpiece)) maskbits |= MASK_WINNINGCAPTURE;
        }

        this.moveFrom[this.moveCount] = from;
        this.moveTo[this.moveCount] = to;
        this.moveMovingpiece[this.moveCount] = movingpiece;
        this.moveCaptured[this.moveCount] = capturedpiece;
        this.movePromoted[this.moveCount] = promotedpiece;
        this.moveMask[this.moveCount] = maskbits;
        this.moveCount++;
    }

    addpawnmove(from: i32, to: i32): void {
        if (this.inCheck && this.inchekValidSquares[this.stm][to] == 0) return;

        if (rank(to) == RANK_8) {
            this.addmove(from, to, MASK_PROMOTION, WN);
            this.addmove(from, to, MASK_PROMOTION, WB);
            this.addmove(from, to, MASK_PROMOTION, WR);
            this.addmove(from, to, MASK_PROMOTION, WQ);
            return;
        }

        if (rank(to) == RANK_1) {
            this.addmove(from, to, MASK_PROMOTION, BN);
            this.addmove(from, to, MASK_PROMOTION, BB);
            this.addmove(from, to, MASK_PROMOTION, BR);
            this.addmove(from, to, MASK_PROMOTION, BQ);
            return;
        }

        this.addmove(from, to);
    }

    generateMoves(): void {
        // Reset using fill (original method)
        for (let i = 0; i < 2; i++) {
            this.attacks[i].fill(0);
            this.numattacks[i].fill(0);
            this.inchekValidSquares[i].fill(0);
            this.pinDirection[i].fill(0);
            this.chekingSquares[i].fill(0);
            this.matingSquares[i].fill(0);
            this.kingescapes[i].fill(0);
        }
        this.kingschecks[0] = 0;
        this.kingschecks[1] = 0;

        this.moveCount = 0;

        let sign = (this.stm == WHITE) ? 1 : -1;
        let secondrank = (this.stm == WHITE) ? 1 : 6;

        // Calculate checking squares
        for (let turncolor = 0; turncolor < 2; turncolor++) {
            let enemyking = this.kingsquares[1 - turncolor];
            let offsetsign = (turncolor == 0) ? -1 : 1;
            let oppcolor = 1 - turncolor;

            // Pawn checks
            for (let i = 0; i < 2; i++) {
                let offset = (i == 0) ? 17 : 15;
                let csq = enemyking + (offset * offsetsign);
                if (validSquare(csq) && pcolor(this.pieceat[csq]) != turncolor) {
                    this.chekingSquares[turncolor][csq] |= checkbit(PAWN);
                }
            }

            // Knight checks
            for (let i = 0; i < 8; i++) {
                let csq = enemyking + OFFSETS_KNIGHT[i];
                if (validSquare(csq) && pcolor(this.pieceat[csq]) != turncolor) {
                    this.chekingSquares[turncolor][csq] |= checkbit(KNIGHT);
                }
            }

            // Bishop/Rook checks (sliding pieces)
            for (let p = 0; p < 2; p++) {
                let offsets = (p == 0) ? OFFSETS_BISHOP : OFFSETS_ROOK;
                for (let i = 0; i < offsets.length; i++) {
                    let to: i32 = enemyking;
                    let offset = offsets[i];
                    while (true) {
                        to = <i32>(to + offset);
                        if (!validSquare(to)) break;

                        let dest = this.pieceat[to];
                        if (dest == EMPTY) {
                            this.chekingSquares[turncolor][to] |= checkbit((p == 0) ? BISHOP : ROOK);
                            continue;
                        }

                        if (pcolor(dest) == oppcolor) {
                            this.chekingSquares[turncolor][to] |= checkbit((p == 0) ? BISHOP : ROOK);
                            break;
                        }

                        // Discovered check
                        let blockingsq: i32 = to;
                        while (true) {
                            to = <i32>(to + offset);
                            if (!validSquare(to)) break;
                            dest = this.pieceat[to];
                            if (dest == EMPTY) continue;
                            if (pcolor(dest) != turncolor) break;
                            if (ptype(dest) == BISHOP || ptype(dest) == QUEEN || ptype(dest) == ROOK) {
                                let absOff = offset < 0 ? -offset : offset;
                                this.chekingSquares[turncolor][blockingsq] = <u8>(absOff | MASK_DISCOVERCHECK);
                            }
                            break;
                        }
                        break;
                    }
                }
            }
        }

        // Calculate enemy attacks and pins
        let turn = opposite(this.stm);
        let enemysign = -sign;

        for (let i = 0; i < 16; i++) {
            let sq = this.piecesquares[turn][i];
            if (sq < 0) continue;

            let piece = this.pieceat[sq];
            if (piece == EMPTY) continue;

            let piecetype = ptype(piece);
            let color = pcolor(piece);
            if (color != turn) continue;

            if (piecetype == PAWN) {
                for (let j = 0; j < 2; j++) {
                    let offset = (j == 0) ? 17 : 15;
                    let to = sq + (offset * enemysign);
                    if (validSquare(to)) {
                        this.addattack(turn, piecetype, sq, to);
                    }
                }
            } else if (piecetype == KNIGHT || piecetype == KING) {
                let offsets = (piecetype == KNIGHT) ? OFFSETS_KNIGHT : OFFSETS_KING;
                for (let j = 0; j < offsets.length; j++) {
                    let to = sq + offsets[j];
                    if (validSquare(to)) {
                        this.addattack(turn, piecetype, sq, to);
                    }
                }
            } else {
                // Sliding pieces
                let offsets = (piecetype == BISHOP) ? OFFSETS_BISHOP : 
                              (piecetype == ROOK) ? OFFSETS_ROOK : OFFSETS_QUEEN;
                for (let j = 0; j < offsets.length; j++) {
                    let to: i32 = sq;
                    let offset = offsets[j];
                    while (true) {
                        to = <i32>(to + offset);
                        if (!validSquare(to)) break;
                        let dest = this.pieceat[to];
                        if (dest != EMPTY) {
                            this.addSliderAttack(turn, piecetype, sq, to, offset);
                            break;
                        }
                        this.addattack(turn, piecetype, sq, to);
                    }
                }
            }
        }

        // King attacks
        let kingSq = this.kingsquares[turn];
        for (let i = 0; i < OFFSETS_KING.length; i++) {
            let to = kingSq + OFFSETS_KING[i];
            if (validSquare(to)) {
                this.addattack(turn, KING, kingSq, to);
            }
        }

        this.inCheck = this.kingschecks[this.stm] > 0;
        this.inDoubleCheck = this.kingschecks[this.stm] > 1;

        // Generate moves for side to move
        if (!this.inDoubleCheck) {
            for (let i = 0; i < 16; i++) {
                let sq = this.piecesquares[this.stm][i];
                if (sq < 0) continue;

                let piece = this.pieceat[sq];
                if (piece == EMPTY) continue;

                let piecetype = ptype(piece);
                if (piecetype == PAWN) {
                    // Pawn advances
                    let to = sq + (16 * sign);
                    if (this.pieceat[to] == EMPTY) {
                        this.addpawnmove(sq, to);
                        if (rank(sq) == secondrank) {
                            to = sq + (32 * sign);
                            if (this.pieceat[to] == EMPTY) {
                                this.addmove(sq, to);
                            }
                        }
                    }

                    // Pawn captures
                    for (let j = 0; j < 2; j++) {
                        let offset = (j == 0) ? 17 : 15;
                        to = sq + (offset * sign);
                        if (!validSquare(to)) continue;
                        this.addattack(this.stm, piecetype, sq, to);

                        if (pcolor(this.pieceat[to]) == opposite(this.stm)) {
                            this.addpawnmove(sq, to);
                        }
                        if (to == this.enpassantSquare) {
                            let ilegalep = false;
                            let kingsquare = this.kingsquares[this.stm];
                            if (rank(sq) == rank(kingsquare)) {
                                let dir = (file(kingsquare) < file(sq)) ? 1 : -1;
                                let next = kingsquare + dir;
                                let count = 0;
                                while (validSquare(next)) {
                                    let piece = this.pieceat[next];
                                    next = next + dir;
                                    if (piece == EMPTY) continue;
                                    count++;
                                    if (count == 3 && (ptype(piece) == ROOK || ptype(piece) == QUEEN) && pcolor(piece) == opposite(this.stm)) {
                                        ilegalep = true;
                                        break;
                                    }
                                }
                            }
                            if (!ilegalep) {
                                if (this.inCheck) {
                                    let chekingpiece = this.pieceat[this.checkingSquare];
                                    if (ptype(chekingpiece) == PAWN) {
                                        this.inchekValidSquares[this.stm][this.enpassantSquare] = 1;
                                        this.addmove(sq, to, MASK_EP);
                                        this.inchekValidSquares[this.stm][this.enpassantSquare] = 0;
                                    }
                                } else {
                                    this.addmove(sq, to, MASK_EP);
                                }
                            }
                        }
                    }
                } else if (piecetype == KNIGHT) {
                    if (this.pinDirection[this.stm][sq] != 0) continue;
                    for (let j = 0; j < OFFSETS_KNIGHT.length; j++) {
                        let to = sq + OFFSETS_KNIGHT[j];
                        if (!validSquare(to)) continue;
                        this.addattack(this.stm, piecetype, sq, to);
                        if (this.pieceat[to] == EMPTY || pcolor(this.pieceat[to]) == opposite(this.stm)) {
                            this.addmove(sq, to);
                        }
                    }
                } else if (piecetype == BISHOP || piecetype == ROOK || piecetype == QUEEN) {
                    let offsets = (piecetype == BISHOP) ? OFFSETS_BISHOP :
                                  (piecetype == ROOK) ? OFFSETS_ROOK : OFFSETS_QUEEN;
                    let pindir = this.pinDirection[this.stm][sq];

                    for (let j = 0; j < offsets.length; j++) {
                        let offset = offsets[j];
                        if (pindir != 0) {
                            let absPin = pindir < 0 ? -pindir : pindir;
                            let absOffset = offset < 0 ? -offset : offset;
                            if (absPin != absOffset) continue;
                        }

                        let to: i32 = sq;
                        while (true) {
                            to = <i32>(to + offset);
                            if (!validSquare(to)) break;
                            let dest = this.pieceat[to];
                            if (dest != EMPTY) {
                                if (pcolor(dest) == opposite(this.stm)) {
                                    this.addmove(sq, to);
                                }
                                this.addSliderAttack(this.stm, piecetype, sq, to, offset);
                                break;
                            }
                            this.addattack(this.stm, piecetype, sq, to);
                            this.addmove(sq, to);
                        }
                    }
                }
            }
        }

        // King moves (always generated, even in double check)
        let ks = this.kingsquares[this.stm];
        for (let i = 0; i < OFFSETS_KING.length; i++) {
            let to = ks + OFFSETS_KING[i];
            if (!validSquare(to)) continue;
            this.addattack(this.stm, KING, ks, to);

            if (this.numattacks[opposite(this.stm)][to] > 0) continue;

            let dest = this.pieceat[to];
            if (dest == EMPTY || pcolor(dest) == opposite(this.stm)) {
                this.addmove(ks, to);
            }
        }

        // Castling
        if (!this.inCheck) {
            let ksq = this.kingsquares[this.stm];
            if (this.stm == WHITE && ksq == E1) {
                // Debug each condition individually
                let c1 = this.pieceat[F1] == EMPTY;
                let c2 = this.numattacks[BLACK][F1] == 0;
                let c3 = this.numattacks[BLACK][G1] == 0;
                let c4 = this.pieceat[G1] == EMPTY;
                let c5 = this.pieceat[H1] == WR;
                let c6 = (this.castlingRights & WHITE_CASTLE_K) != 0;
                if (c1 && c2 && c3 && c4 && c5 && c6) {
                    this.moveFrom[this.moveCount] = E1;
                    this.moveTo[this.moveCount] = G1;
                    this.moveMovingpiece[this.moveCount] = WK;
                    this.moveCaptured[this.moveCount] = EMPTY;
                    this.movePromoted[this.moveCount] = 0;
                    this.moveMask[this.moveCount] = MASK_CASTLING;
                    this.moveCount++;
                }
                if ((this.pieceat[D1] == EMPTY) && (this.numattacks[BLACK][D1] == 0) &&
                    (this.numattacks[BLACK][C1] == 0) && (this.pieceat[C1] == EMPTY) &&
                    (this.pieceat[B1] == EMPTY) && (this.pieceat[A1] == WR) && 
                    (this.castlingRights & WHITE_CASTLE_Q)) {
                    this.moveFrom[this.moveCount] = E1;
                    this.moveTo[this.moveCount] = C1;
                    this.moveMovingpiece[this.moveCount] = WK;
                    this.moveCaptured[this.moveCount] = EMPTY;
                    this.movePromoted[this.moveCount] = 0;
                    this.moveMask[this.moveCount] = MASK_CASTLING;
                    this.moveCount++;
                }
            } else if (this.stm == BLACK && ksq == E8) {
                if ((this.pieceat[F8] == EMPTY) && (this.numattacks[WHITE][F8] == 0) &&
                    (this.numattacks[WHITE][G8] == 0) && (this.pieceat[G8] == EMPTY) &&
                    (this.pieceat[H8] == BR) && (this.castlingRights & BLACK_CASTLE_K)) {
                    this.moveFrom[this.moveCount] = E8;
                    this.moveTo[this.moveCount] = G8;
                    this.moveMovingpiece[this.moveCount] = BK;
                    this.moveCaptured[this.moveCount] = EMPTY;
                    this.movePromoted[this.moveCount] = 0;
                    this.moveMask[this.moveCount] = MASK_CASTLING;
                    this.moveCount++;
                }
                if ((this.pieceat[D8] == EMPTY) && (this.numattacks[WHITE][D8] == 0) &&
                    (this.numattacks[WHITE][C8] == 0) && (this.pieceat[C8] == EMPTY) &&
                    (this.pieceat[B8] == EMPTY) && (this.pieceat[A8] == BR) && 
                    (this.castlingRights & BLACK_CASTLE_Q)) {
                    this.moveFrom[this.moveCount] = E8;
                    this.moveTo[this.moveCount] = C8;
                    this.moveMovingpiece[this.moveCount] = BK;
                    this.moveCaptured[this.moveCount] = EMPTY;
                    this.movePromoted[this.moveCount] = 0;
                    this.moveMask[this.moveCount] = MASK_CASTLING;
                    this.moveCount++;
                }
            }
        }
    }

    addSliderAttack(who: u8, piecetype: u8, from: i32, to: i32, direction: i32): void {
        this.attacks[who][to] |= attackbit(piecetype);
        this.numattacks[who][to]++;

        let oppSide = 1 - who;
        let enemyKingSq = this.kingsquares[oppSide];
        let attackedPiece = this.pieceat[to];

        if (to == enemyKingSq) {
            let nextSq = to + direction;
            if (validSquare(nextSq)) {
                this.attacks[who][nextSq] |= attackbit(piecetype);
                this.numattacks[who][nextSq]++;
            }
            this.kingschecks[oppSide]++;

            let sq = to;
            do {
                sq = sq - direction;
                if (!validSquare(sq)) break;
                this.inchekValidSquares[oppSide][sq] = 1;
            } while (sq != from);
            return;
        }

        let diff = from - enemyKingSq;
        let index = diff + 119;
        if (index >= 0 && index < 239) {
            let offset = RAYS[index];
            if (direction == offset) {
                let piecesinbetween = 0;
                let next = to + offset;
                while (next != enemyKingSq) {
                    if (!validSquare(next)) break;
                    if (this.pieceat[next] != EMPTY) {
                        piecesinbetween++;
                    }
                    next = next + offset;
                }

                if (piecesinbetween == 0) {
                    if (pcolor(attackedPiece) == oppSide) {
                        this.pinDirection[oppSide][to] = <i8>offset;
                    }
                }
            }
        }

        let sameColor = (who == pcolor(attackedPiece));
        let absDir = direction < 0 ? -direction : direction;
        let bitsok = checkbit(piecetype) & checkbit(ptype(attackedPiece)) & PIECE_BY_OFFSET[absDir];
        let canxray = sameColor && (bitsok != 0);

        if (canxray) {
            let next = to + direction;
            while (validSquare(next)) {
                this.numattacks[who][next]++;
                if (this.pieceat[next] != EMPTY) break;
                next = next + direction;
            }
        }
    }

    makemoveIdx(idx: i32): bool {
        return this.makemove(this.moveFrom[idx], this.moveTo[idx], this.movePromoted[idx]);
    }

    makemove(from: i32, to: i32, promoted: u8): bool {
        let captured = this.pieceat[to];
        let movingpiece = this.pieceat[from];

        this.addHistory(from, to, captured, promoted, this.counter50, this.castlingRights, this.enpassantSquare);

        let isCapture = captured != EMPTY;
        let isPawnMove = movingpiece == WP || movingpiece == BP;
        let isPawnPush = !isCapture && isPawnMove && absI32(to - from) == 32;
        let isPromotion = isPawnMove && (rank(to) == RANK_8 || rank(to) == RANK_1);
        let savedEP = this.enpassantSquare;
        let isEnPassant = isPawnMove && to == savedEP;

        this.movehalfnumber++;
        this.movenumber = this.movehalfnumber / 2;

        if (isCapture || isPawnMove) {
            this.counter50 = 0;
        } else {
            this.counter50++;
        }

        this.enpassantSquare = -1;
        if (isPawnPush) {
            let enemyPawn = (this.stm == WHITE) ? BP : WP;
            if (this.pieceat[to + 1] == enemyPawn || this.pieceat[to - 1] == enemyPawn) {
                this.enpassantSquare = (from + to) / 2;
            }
        }

        if (from == A1 || to == A1) this.castlingRights &= ~WHITE_CASTLE_Q;
        if (from == H1 || to == H1) this.castlingRights &= ~WHITE_CASTLE_K;
        if (from == A8 || to == A8) this.castlingRights &= ~BLACK_CASTLE_Q;
        if (from == H8 || to == H8) this.castlingRights &= ~BLACK_CASTLE_K;

        if (from == E1 && movingpiece == WK) {
            if (to == G1) {
                this.movepiece(this.stm, WR, H1, F1);
            }
            if (to == C1) {
                this.movepiece(this.stm, WR, A1, D1);
            }
            this.castlingRights &= ~(WHITE_CASTLE_Q | WHITE_CASTLE_K);
        }

        if (from == E8 && movingpiece == BK) {
            if (to == G8) {
                this.movepiece(this.stm, BR, H8, F8);
            }
            if (to == C8) {
                this.movepiece(this.stm, BR, A8, D8);
            }
            this.castlingRights &= ~(BLACK_CASTLE_Q | BLACK_CASTLE_K);
        }

        if (isCapture) {
            this.removepiece(opposite(this.stm), to);
        }

        this.movepiece(this.stm, movingpiece, from, to);

        if (isPromotion) {
            this.pieceat[to] = promoted;
        }

        if (isEnPassant) {
            let sqPawn = (this.stm == WHITE) ? savedEP - 16 : savedEP + 16;
            this.removepiece(opposite(this.stm), sqPawn);
        }

        this.stm = opposite(this.stm);
        return true;
    }

    undomove(): bool {
        if (!this.popHistory()) return false;

        let ply = this.historyPly;
        
        let from = this.historyFrom[ply];
        let to = this.historyTo[ply];
        let captured = this.historyCaptured[ply];
        let promoted = this.historyPromoted[ply];

        this.stm = opposite(this.stm);
        let sign = (this.stm == WHITE) ? 1 : -1;

        let movingpiece: u8;
        if (promoted != 0) {
            // Undo promotion: pieceat[to] is the promoted piece, restore pawn
            let pawn: u8 = (this.stm == WHITE) ? WP : BP;
            this.pieceat[to] = pawn;
            movingpiece = pawn;
        } else {
            movingpiece = this.pieceat[to];
        }

        this.movepiece(this.stm, movingpiece, to, from);

        if (captured != EMPTY) {
            this.addpiece(opposite(this.stm), captured, to);
        }

        this.counter50 = this.historyC50[ply];
        this.castlingRights = this.historyCR[ply];
        this.enpassantSquare = this.historyEP[ply];

        if (to == this.enpassantSquare && ptype(movingpiece) == PAWN) {
            this.addpiece(opposite(this.stm), (this.stm == WHITE) ? BP : WP, to - (16 * sign));
        }

        if (from == E1 && to == G1 && movingpiece == WK) {
            this.movepiece(this.stm, WR, F1, H1);
        }
        if (from == E1 && to == C1 && movingpiece == WK) {
            this.movepiece(this.stm, WR, D1, A1);
        }
        if (from == E8 && to == G8 && movingpiece == BK) {
            this.movepiece(this.stm, BR, F8, H8);
        }
        if (from == E8 && to == C8 && movingpiece == BK) {
            this.movepiece(this.stm, BR, D8, A8);
        }


        this.movehalfnumber--;
        this.movenumber = this.movehalfnumber / 2;

        return true;
    }

    perft(depth: i32): u64 {
        this.generateMoves();
        let nmoves = this.moveCount;
        if (depth == 1) return nmoves;

        let mFrom = new Int32Array(nmoves);
        let mTo = new Int32Array(nmoves);
        let mPromoted = new Uint8Array(nmoves);
        for (let i = 0; i < nmoves; i++) {
            mFrom[i] = this.moveFrom[i];
            mTo[i] = this.moveTo[i];
            mPromoted[i] = this.movePromoted[i];
        }

        let nodes: u64 = 0;
        for (let i = 0; i < nmoves; i++) {
            this.makemove(mFrom[i], mTo[i], mPromoted[i]);
            let childNodes = this.perft(depth - 1);
            nodes += childNodes;
            this.undomove();
        }
        return nodes;
    }

    divide(depth: i32): u64 {
        this.generateMoves();
        let nmoves = this.moveCount;

        let mFrom = new Int32Array(nmoves);
        let mTo = new Int32Array(nmoves);
        let mPromoted = new Uint8Array(nmoves);
        for (let i = 0; i < nmoves; i++) {
            mFrom[i] = this.moveFrom[i];
            mTo[i] = this.moveTo[i];
            mPromoted[i] = this.movePromoted[i];
        }

        let nodes: u64 = 0;
        for (let i = 0; i < nmoves; i++) {
            this.makemove(mFrom[i], mTo[i], mPromoted[i]);
            let movenodes = this.perft(depth - 1);
            nodes += movenodes;
            this.undomove();
        }
        return nodes;
    }

    getMoveCount(): i32 {
        return this.moveCount;
    }

    // Debug: make move and generate moves from new position
    makeMoveAndGenerate(from: i32, to: i32): i32 {
        // Find move index
        for (let i = 0; i < this.moveCount; i++) {
            if (this.moveFrom[i] == from && this.moveTo[i] == to) {
                let made = this.makemoveIdx(i);
                if (!made) return -1; // Move failed
                this.generateMoves();
                let count = this.moveCount;
                this.undomove();
                return count;
            }
        }
        return -2; // Move not found
    }

    debugMoveAndGenerate(from: i32, to: i32): i32 {
        for (let i = 0; i < this.moveCount; i++) {
            if (this.moveFrom[i] == from && this.moveTo[i] == to) {
                this.makemoveIdx(i);
                // Debug: print some board state
                let kingSq = this.kingsquares[this.stm];
                let inCheck = this.inCheck;
                this.generateMoves();
                let count = this.moveCount;
                this.undomove();
                return count;
            }
        }
        return -1; // Move not found
    }

    getMoveFrom(idx: i32): i32 {
        return this.moveFrom[idx];
    }

    getMoveTo(idx: i32): i32 {
        return this.moveTo[idx];
    }

    loadFEN(fen: string): void {
        this.reset();

        let fenParts = fen.split(' ');
        let fenBoard = fenParts[0];
        let fenSide = fenParts[1];
        let fenCastling = fenParts[2];
        let fenEp = fenParts[3];
        let fen50 = fenParts[4];
        let fenMn = fenParts[5];

        let file = FILE_A;
        let rank = 7;

        for (let i = 0; i < fenBoard.length; i++) {
            let c = fenBoard.charCodeAt(i);
            if (c == 47) { // '/'
                rank--;
                file = FILE_A;
                continue;
            }
            if (c >= 49 && c <= 56) { // '1'-'8'
                file += c - 48;
                continue;
            }

            let piece = charToPiece(String.fromCharCode(c));
            if (piece != EMPTY) {
                let sq = square(file, rank);
                let color = <u8>pcolor(piece);
                this.addpiece(color, piece, sq);
                file++;
            }
        }

        this.stm = (fenSide == 'w') ? WHITE : BLACK;

        this.castlingRights = 0;
        if (fenCastling != '-') {
            for (let i = 0; i < fenCastling.length; i++) {
                let c = fenCastling.charCodeAt(i);
                if (c == 81) this.castlingRights |= WHITE_CASTLE_Q; // 'Q'
                if (c == 75) this.castlingRights |= WHITE_CASTLE_K; // 'K'
                if (c == 113) this.castlingRights |= BLACK_CASTLE_Q; // 'q'
                if (c == 107) this.castlingRights |= BLACK_CASTLE_K; // 'k'
            }
        }

        this.enpassantSquare = (fenEp == '-') ? -1 : square(fenEp.charCodeAt(0) - 97, fenEp.charCodeAt(1) - 49);
        this.counter50 = (fen50 == '-') ? 0 : <u8>parseInt(fen50);
        this.movenumber = (fenMn == '-') ? 1 : parseInt(fenMn);
        if (this.movenumber == 0) this.movenumber = 1;
        this.movehalfnumber = this.movenumber * 2 + this.stm;
    }
}
