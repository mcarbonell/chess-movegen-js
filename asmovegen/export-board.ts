import { Board } from "./board";

export function createBoard(): Board {
  return new Board();
}

export function loadFEN(board: Board, fen: string): void {
  board.loadFEN(fen);
}

export function perft(board: Board, depth: i32): u64 {
  return board.perft(depth);
}
