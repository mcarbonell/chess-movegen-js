declare namespace __AdaptedExports {
  /** Exported memory */
  export const memory: WebAssembly.Memory;
  /**
   * asmovegen/export-board/createBoard
   * @returns `asmovegen/board/Board`
   */
  export function createBoard(): __Record5<never>;
  /**
   * asmovegen/export-board/loadFEN
   * @param board `asmovegen/board/Board`
   * @param fen `~lib/string/String`
   */
  export function loadFEN(board: __Record5<undefined>, fen: string): void;
  /**
   * asmovegen/export-board/perft
   * @param board `asmovegen/board/Board`
   * @param depth `i32`
   * @returns `u64`
   */
  export function perft(board: __Record5<undefined>, depth: number): bigint;
}
/** asmovegen/board/Board */
declare interface __Record5<TOmittable> {
  /** @type `u8` */
  stm: number | TOmittable;
  /** @type `u8` */
  counter50: number | TOmittable;
  /** @type `u8` */
  castlingRights: number | TOmittable;
  /** @type `i32` */
  enpassantSquare: number | TOmittable;
  /** @type `i32` */
  movenumber: number | TOmittable;
  /** @type `i32` */
  movehalfnumber: number | TOmittable;
  /** @type `~lib/typedarray/Int8Array` */
  moves: Int8Array;
  /** @type `bool` */
  inCheck: boolean | TOmittable;
  /** @type `bool` */
  inDoubleCheck: boolean | TOmittable;
  /** @type `bool` */
  inCheckMate: boolean | TOmittable;
  /** @type `bool` */
  inStalemate: boolean | TOmittable;
  /** @type `~lib/typedarray/Int8Array` */
  pieceat: Int8Array;
  /** @type `~lib/typedarray/Int8Array` */
  kingsquares: Int8Array;
  /** @type `~lib/array/Array<~lib/typedarray/Int8Array>` */
  piecesquares: Array<Int8Array>;
  /** @type `~lib/typedarray/Int32Array` */
  moveFrom: Int32Array;
  /** @type `~lib/typedarray/Int32Array` */
  moveTo: Int32Array;
  /** @type `~lib/typedarray/Uint8Array` */
  moveMovingpiece: Uint8Array;
  /** @type `~lib/typedarray/Uint8Array` */
  moveCaptured: Uint8Array;
  /** @type `~lib/typedarray/Uint8Array` */
  movePromoted: Uint8Array;
  /** @type `~lib/typedarray/Uint8Array` */
  moveMask: Uint8Array;
  /** @type `i32` */
  moveCount: number | TOmittable;
  /** @type `~lib/array/Array<~lib/typedarray/Int32Array>` */
  attacks: Array<Int32Array>;
  /** @type `~lib/array/Array<~lib/typedarray/Uint8Array>` */
  numattacks: Array<Uint8Array>;
  /** @type `~lib/array/Array<~lib/typedarray/Int32Array>` */
  chekingSquares: Array<Int32Array>;
  /** @type `~lib/array/Array<~lib/typedarray/Int32Array>` */
  pinDirection: Array<Int32Array>;
  /** @type `~lib/array/Array<~lib/typedarray/Uint8Array>` */
  inchekValidSquares: Array<Uint8Array>;
  /** @type `~lib/array/Array<~lib/typedarray/Int32Array>` */
  matingSquares: Array<Int32Array>;
  /** @type `~lib/array/Array<~lib/typedarray/Int8Array>` */
  kingescapes: Array<Int8Array>;
  /** @type `~lib/typedarray/Uint8Array` */
  kingschecks: Uint8Array;
  /** @type `~lib/typedarray/Int32Array` */
  historyFrom: Int32Array;
  /** @type `~lib/typedarray/Int32Array` */
  historyTo: Int32Array;
  /** @type `~lib/typedarray/Uint8Array` */
  historyCaptured: Uint8Array;
  /** @type `~lib/typedarray/Uint8Array` */
  historyPromoted: Uint8Array;
  /** @type `~lib/typedarray/Uint8Array` */
  historyC50: Uint8Array;
  /** @type `~lib/typedarray/Uint8Array` */
  historyCR: Uint8Array;
  /** @type `~lib/typedarray/Int8Array` */
  historyEP: Int8Array;
  /** @type `i32` */
  historyPly: number | TOmittable;
  /** @type `i32` */
  checkingSquare: number | TOmittable;
}
/** Instantiates the compiled WebAssembly module with the given imports. */
export declare function instantiate(module: WebAssembly.Module, imports: {
  env: unknown,
}): Promise<typeof __AdaptedExports>;
