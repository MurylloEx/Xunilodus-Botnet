// Type definitions for uint-buffer 1.0
// Project: https://github.com/rochars/uint-buffer
// Definitions by: Rafael da Silva Rocha <https://github.com/rochars>
// Definitions: https://github.com/rochars/uint-buffer

export = UintBuffer;

declare module UintBuffer {

  class UintBuffer {
    /**
     * @param {number} bits The number of bits used by the integer.
     */
    constructor(bits: number);

    /**
     * The number of bits used by one number.
     * @type {number}
     */
    bits: number;

    /**
     * The number of bytes used by one number.
     * @type {number}
     */
    bytes: number;
    /**
     * @type {number}
     * @protected
     */
    max: number;
    /**
     * @type {number}
     * @protected
     */
    min: number;

    /**
     * Write one unsigned integer to a byte buffer.
     * @param {!Uint8Array|!Array<number>} buffer An array of bytes.
     * @param {number} num The number.
     * @param {number=} index The index being written in the byte buffer.
     * @return {number} The next index to write on the byte buffer.
     * @throws {TypeError} If num is not a number.
     * @throws {RangeError} On overflow.
     */
    pack(buffer: Uint8Array|number[], num: number, index?: number): number;

    /**
     * Read one unsigned integer from a byte buffer.
     * @param {!Uint8Array|!Array<number>} buffer An array of bytes.
     * @param {number=} index The index to read.
     * @return {number} The number.
     * @throws {RangeError} On overflow.
     */
    unpack(buffer: Uint8Array|number[], index?: number): number;

    /**
     * Write one unsigned integer to a byte buffer.
     * This method assumes the input has already been validated
     * and should be used only if you know what you are doing.
     * @param {!Uint8Array|!Array<number>} buffer An array of bytes.
     * @param {number} num The number.
     * @param {number=} index The index being written in the byte buffer.
     * @return {number} The next index to write on the byte buffer.
     */
    packUnsafe(buffer: Uint8Array|number[], index?: number): number;

    /**
     * Read one integer number from a byte buffer.
     * @param {!Uint8Array|!Array<number>} buffer An array of bytes.
     * @param {number=} index The index to read.
     * @return {number}
     */
    unpackUnsafe(buffer: Uint8Array|Array<number>, index?: number): number;

    /**
     * Throws error in case of overflow.
     * @param {number} num The number.
     * @throws {RangeError} On overflow.
     * @protected
     */
    overflow(num: number): void;
  }
}
