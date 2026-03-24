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

export function generateMoves(board: Board): void {
  board.generateMoves();
}

export function getMoveCount(board: Board): i32 {
  return board.moveCount;
}

export function getMoveFrom(board: Board, idx: i32): i32 {
  return board.moveFrom[idx];
}

export function getMoveTo(board: Board, idx: i32): i32 {
  return board.moveTo[idx];
}

export function getMovePromoted(board: Board, idx: i32): i32 {
  return board.movePromoted[idx];
}

export function makemove(board: Board, from: i32, to: i32, promoted: i32): void {
  board.makemove(from, to, <u8>promoted);
}

export function getPinDirection(board: Board, side: i32, sq: i32): i32 {
  return board.pinDirection[side][sq];
}

export function getNumAttacks(board: Board, side: i32, sq: i32): i32 {
  return board.numattacks[side][sq];
}

export function undomove(board: Board): void {
  board.undomove();
}

export function getPieceAt(board: Board, sq: i32): i32 {
  return board.pieceat[sq];
}

export function getPieceSquare(board: Board, side: i32, idx: i32): i32 {
  return board.piecesquares[side][idx];
}

export function getKingSquare(board: Board, side: i32): i32 {
  return board.kingsquares[side];
}
