export interface ChessJSMove {
    from: string;
    to: string;
    san: string;
    flags: string;
    piece?: string;
    color?: string;
    captured?: string;
    promotion?: string;
}

export interface MoveOptions {
    from: string;
    to: string;
    promotion?: string;
}

export class ChessJSAdapter {
    constructor(fen?: string);
    load(fen: string): boolean;
    reset(): void;
    fen(): string;
    turn(): 'w' | 'b';
    isCheck(): boolean;
    isCheckmate(): boolean;
    isStalemate(): boolean;
    isDraw(): boolean;
    isInsufficientMaterial(): boolean;
    isGameOver(): boolean;
    moves(options?: { verbose?: boolean; square?: string }): string[] | ChessJSMove[];
    move(move: string | MoveOptions, options?: any): ChessJSMove | null;
    undo(): ChessJSMove | null;
    header(): object;
    ascii(): string;
    history(options?: { verbose?: boolean }): string[] | ChessJSMove[];
    get(square: string): { type: string; color: string } | null;
}
