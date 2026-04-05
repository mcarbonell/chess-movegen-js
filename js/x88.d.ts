export interface Move {
    from: number;
    to: number;
    movingpiece: number;
    captured: number;
    promotedpiece: number;
    mask: number;
}

export class Board {
    stm: number;
    counter50: number;
    castlingRights: number;
    enpassantSquare: number;
    movenumber: number;
    movehalfnumber: number;
    moves: Move[];

    constructor();
    reset(): void;
    loadFEN(fen: string): void;
    getFEN(): string;
    generateMoves(): Move[];
    makemove(move: Move): boolean;
    undomove(): boolean;
    perft(depth: number): number;
    divide(depth: number): void;
    getMoveStr(move: Move): string;
    squareToStr(sq: number): string;
}
