export async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.setPrototypeOf({
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
    }, Object.assign(Object.create(globalThis), imports.env || {})),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    createBoard() {
      // asmovegen/export-board/createBoard() => asmovegen/board/Board
      return exports.createBoard() >>> 0;
    },
    loadFEN(board, fen) {
      // asmovegen/export-board/loadFEN(asmovegen/board/Board, ~lib/string/String) => void
      board = board || __notnull();
      fen = __lowerString(fen) || __notnull();
      try {
        exports.loadFEN(board, fen);
      } finally {
        __release(board);
      }
    },
    perft(board, depth) {
      // asmovegen/export-board/perft(asmovegen/board/Board, i32) => u64
      board = board || __notnull();
      return BigInt.asUintN(64, exports.perft(board, depth));
    },
  }, exports);
  function __liftRecord5(pointer) {
    // asmovegen/board/Board
    // Hint: Opt-out from lifting as a record by providing an empty constructor
    if (!pointer) return null;
    return {
      stm: __getU8(pointer + 0),
      counter50: __getU8(pointer + 1),
      castlingRights: __getU8(pointer + 2),
      enpassantSquare: __getI32(pointer + 4),
      movenumber: __getI32(pointer + 8),
      movehalfnumber: __getI32(pointer + 12),
      moves: __liftTypedArray(Int8Array, __getU32(pointer + 16)),
      inCheck: __getU8(pointer + 20) != 0,
      inDoubleCheck: __getU8(pointer + 21) != 0,
      inCheckMate: __getU8(pointer + 22) != 0,
      inStalemate: __getU8(pointer + 23) != 0,
      pieceat: __liftTypedArray(Int8Array, __getU32(pointer + 24)),
      kingsquares: __liftTypedArray(Int8Array, __getU32(pointer + 28)),
      piecesquares: __liftArray(pointer => __liftTypedArray(Int8Array, __getU32(pointer)), 2, __getU32(pointer + 32)),
      moveFrom: __liftTypedArray(Int32Array, __getU32(pointer + 36)),
      moveTo: __liftTypedArray(Int32Array, __getU32(pointer + 40)),
      moveMovingpiece: __liftTypedArray(Uint8Array, __getU32(pointer + 44)),
      moveCaptured: __liftTypedArray(Uint8Array, __getU32(pointer + 48)),
      movePromoted: __liftTypedArray(Uint8Array, __getU32(pointer + 52)),
      moveMask: __liftTypedArray(Uint8Array, __getU32(pointer + 56)),
      moveCount: __getI32(pointer + 60),
      attacks: __liftArray(pointer => __liftTypedArray(Int32Array, __getU32(pointer)), 2, __getU32(pointer + 64)),
      numattacks: __liftArray(pointer => __liftTypedArray(Uint8Array, __getU32(pointer)), 2, __getU32(pointer + 68)),
      chekingSquares: __liftArray(pointer => __liftTypedArray(Int32Array, __getU32(pointer)), 2, __getU32(pointer + 72)),
      pinDirection: __liftArray(pointer => __liftTypedArray(Int32Array, __getU32(pointer)), 2, __getU32(pointer + 76)),
      inchekValidSquares: __liftArray(pointer => __liftTypedArray(Uint8Array, __getU32(pointer)), 2, __getU32(pointer + 80)),
      matingSquares: __liftArray(pointer => __liftTypedArray(Int32Array, __getU32(pointer)), 2, __getU32(pointer + 84)),
      kingescapes: __liftArray(pointer => __liftTypedArray(Int8Array, __getU32(pointer)), 2, __getU32(pointer + 88)),
      kingschecks: __liftTypedArray(Uint8Array, __getU32(pointer + 92)),
      historyFrom: __liftTypedArray(Int32Array, __getU32(pointer + 96)),
      historyTo: __liftTypedArray(Int32Array, __getU32(pointer + 100)),
      historyCaptured: __liftTypedArray(Uint8Array, __getU32(pointer + 104)),
      historyPromoted: __liftTypedArray(Uint8Array, __getU32(pointer + 108)),
      historyC50: __liftTypedArray(Uint8Array, __getU32(pointer + 112)),
      historyCR: __liftTypedArray(Uint8Array, __getU32(pointer + 116)),
      historyEP: __liftTypedArray(Int8Array, __getU32(pointer + 120)),
      historyPly: __getI32(pointer + 124),
      checkingSquare: __getI32(pointer + 128),
    };
  }
  function __lowerRecord5(value) {
    // asmovegen/board/Board
    // Hint: Opt-out from lowering as a record by providing an empty constructor
    if (value == null) return 0;
    const pointer = exports.__pin(exports.__new(132, 5));
    __setU8(pointer + 0, value.stm);
    __setU8(pointer + 1, value.counter50);
    __setU8(pointer + 2, value.castlingRights);
    __setU32(pointer + 4, value.enpassantSquare);
    __setU32(pointer + 8, value.movenumber);
    __setU32(pointer + 12, value.movehalfnumber);
    __setU32(pointer + 16, __lowerTypedArray(Int8Array, 6, 0, value.moves) || __notnull());
    __setU8(pointer + 20, value.inCheck ? 1 : 0);
    __setU8(pointer + 21, value.inDoubleCheck ? 1 : 0);
    __setU8(pointer + 22, value.inCheckMate ? 1 : 0);
    __setU8(pointer + 23, value.inStalemate ? 1 : 0);
    __setU32(pointer + 24, __lowerTypedArray(Int8Array, 6, 0, value.pieceat) || __notnull());
    __setU32(pointer + 28, __lowerTypedArray(Int8Array, 6, 0, value.kingsquares) || __notnull());
    __setU32(pointer + 32, __lowerArray((pointer, value) => { __setU32(pointer, __lowerTypedArray(Int8Array, 6, 0, value) || __notnull()); }, 7, 2, value.piecesquares) || __notnull());
    __setU32(pointer + 36, __lowerTypedArray(Int32Array, 8, 2, value.moveFrom) || __notnull());
    __setU32(pointer + 40, __lowerTypedArray(Int32Array, 8, 2, value.moveTo) || __notnull());
    __setU32(pointer + 44, __lowerTypedArray(Uint8Array, 9, 0, value.moveMovingpiece) || __notnull());
    __setU32(pointer + 48, __lowerTypedArray(Uint8Array, 9, 0, value.moveCaptured) || __notnull());
    __setU32(pointer + 52, __lowerTypedArray(Uint8Array, 9, 0, value.movePromoted) || __notnull());
    __setU32(pointer + 56, __lowerTypedArray(Uint8Array, 9, 0, value.moveMask) || __notnull());
    __setU32(pointer + 60, value.moveCount);
    __setU32(pointer + 64, __lowerArray((pointer, value) => { __setU32(pointer, __lowerTypedArray(Int32Array, 8, 2, value) || __notnull()); }, 10, 2, value.attacks) || __notnull());
    __setU32(pointer + 68, __lowerArray((pointer, value) => { __setU32(pointer, __lowerTypedArray(Uint8Array, 9, 0, value) || __notnull()); }, 11, 2, value.numattacks) || __notnull());
    __setU32(pointer + 72, __lowerArray((pointer, value) => { __setU32(pointer, __lowerTypedArray(Int32Array, 8, 2, value) || __notnull()); }, 10, 2, value.chekingSquares) || __notnull());
    __setU32(pointer + 76, __lowerArray((pointer, value) => { __setU32(pointer, __lowerTypedArray(Int32Array, 8, 2, value) || __notnull()); }, 10, 2, value.pinDirection) || __notnull());
    __setU32(pointer + 80, __lowerArray((pointer, value) => { __setU32(pointer, __lowerTypedArray(Uint8Array, 9, 0, value) || __notnull()); }, 11, 2, value.inchekValidSquares) || __notnull());
    __setU32(pointer + 84, __lowerArray((pointer, value) => { __setU32(pointer, __lowerTypedArray(Int32Array, 8, 2, value) || __notnull()); }, 10, 2, value.matingSquares) || __notnull());
    __setU32(pointer + 88, __lowerArray((pointer, value) => { __setU32(pointer, __lowerTypedArray(Int8Array, 6, 0, value) || __notnull()); }, 7, 2, value.kingescapes) || __notnull());
    __setU32(pointer + 92, __lowerTypedArray(Uint8Array, 9, 0, value.kingschecks) || __notnull());
    __setU32(pointer + 96, __lowerTypedArray(Int32Array, 8, 2, value.historyFrom) || __notnull());
    __setU32(pointer + 100, __lowerTypedArray(Int32Array, 8, 2, value.historyTo) || __notnull());
    __setU32(pointer + 104, __lowerTypedArray(Uint8Array, 9, 0, value.historyCaptured) || __notnull());
    __setU32(pointer + 108, __lowerTypedArray(Uint8Array, 9, 0, value.historyPromoted) || __notnull());
    __setU32(pointer + 112, __lowerTypedArray(Uint8Array, 9, 0, value.historyC50) || __notnull());
    __setU32(pointer + 116, __lowerTypedArray(Uint8Array, 9, 0, value.historyCR) || __notnull());
    __setU32(pointer + 120, __lowerTypedArray(Int8Array, 6, 0, value.historyEP) || __notnull());
    __setU32(pointer + 124, value.historyPly);
    __setU32(pointer + 128, value.checkingSquare);
    exports.__unpin(pointer);
    return pointer;
  }
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __lowerString(value) {
    if (value == null) return 0;
    const
      length = value.length,
      pointer = exports.__new(length << 1, 2) >>> 0,
      memoryU16 = new Uint16Array(memory.buffer);
    for (let i = 0; i < length; ++i) memoryU16[(pointer >>> 1) + i] = value.charCodeAt(i);
    return pointer;
  }
  function __liftArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const
      dataStart = __getU32(pointer + 4),
      length = __dataview.getUint32(pointer + 12, true),
      values = new Array(length);
    for (let i = 0; i < length; ++i) values[i] = liftElement(dataStart + (i << align >>> 0));
    return values;
  }
  function __lowerArray(lowerElement, id, align, values) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__pin(exports.__new(16, id)) >>> 0;
    __setU32(header + 0, buffer);
    __dataview.setUint32(header + 4, buffer, true);
    __dataview.setUint32(header + 8, length << align, true);
    __dataview.setUint32(header + 12, length, true);
    for (let i = 0; i < length; ++i) lowerElement(buffer + (i << align >>> 0), values[i]);
    exports.__unpin(buffer);
    exports.__unpin(header);
    return header;
  }
  function __liftTypedArray(constructor, pointer) {
    if (!pointer) return null;
    return new constructor(
      memory.buffer,
      __getU32(pointer + 4),
      __dataview.getUint32(pointer + 8, true) / constructor.BYTES_PER_ELEMENT
    ).slice();
  }
  function __lowerTypedArray(constructor, id, align, values) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__new(12, id) >>> 0;
    __setU32(header + 0, buffer);
    __dataview.setUint32(header + 4, buffer, true);
    __dataview.setUint32(header + 8, length << align, true);
    new constructor(memory.buffer, buffer, length).set(values);
    exports.__unpin(buffer);
    return header;
  }
  const refcounts = new Map();
  function __retain(pointer) {
    if (pointer) {
      const refcount = refcounts.get(pointer);
      if (refcount) refcounts.set(pointer, refcount + 1);
      else refcounts.set(exports.__pin(pointer), 1);
    }
    return pointer;
  }
  function __release(pointer) {
    if (pointer) {
      const refcount = refcounts.get(pointer);
      if (refcount === 1) exports.__unpin(pointer), refcounts.delete(pointer);
      else if (refcount) refcounts.set(pointer, refcount - 1);
      else throw Error(`invalid refcount '${refcount}' for reference '${pointer}'`);
    }
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  let __dataview = new DataView(memory.buffer);
  function __setU8(pointer, value) {
    try {
      __dataview.setUint8(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint8(pointer, value, true);
    }
  }
  function __setU32(pointer, value) {
    try {
      __dataview.setUint32(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint32(pointer, value, true);
    }
  }
  function __getU8(pointer) {
    try {
      return __dataview.getUint8(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint8(pointer, true);
    }
  }
  function __getI32(pointer) {
    try {
      return __dataview.getInt32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getInt32(pointer, true);
    }
  }
  function __getU32(pointer) {
    try {
      return __dataview.getUint32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint32(pointer, true);
    }
  }
  return adaptedExports;
}
