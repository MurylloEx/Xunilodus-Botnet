/*
 * Copyright (c) 2018-2019 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview Externs for uint-buffer 1.0
 * @see https://github.com/rochars/uint-buffer
 * @externs
 */

/**
 * A class to write and read unsigned ints to and from byte buffers.
 */
var UintBuffer = {};

/**
 * The number of bits used by one number.
 * @type {number}
 */
UintBuffer.prototype.bits = 0;

/**
 * The number of bytes used by one number.
 * @type {number}
 */
UintBuffer.prototype.bytes = 0;

/**
 * Write one unsigned integer to a byte buffer.
 * @param {!Uint8Array|!Array<number>} buffer An array of bytes.
 * @param {number} num The number.
 * @param {number=} index The index being written in the byte buffer.
 * @return {number} The next index to write on the byte buffer.
 * @throws {TypeError} If num is not a number.
 * @throws {RangeError} On overflow.
 */
UintBuffer.prototype.pack = function(buffer, num, index=0) {};

/**
 * Read one unsigned integer from a byte buffer.
 * @param {!Uint8Array|!Array<number>} buffer An array of bytes.
 * @param {number=} index The index to read.
 * @return {number} The number.
 * @throws {RangeError} On overflow.
 */
UintBuffer.prototype.unpack = function(buffer, index=0) {};

/**
 * Write one unsigned integer to a byte buffer.
 * This method assumes the input has already been validated
 * and should be used only if you know what you are doing.
 * @param {!Uint8Array|!Array<number>} buffer An array of bytes.
 * @param {number} num The number.
 * @param {number=} index The index being written in the byte buffer.
 * @return {number} The next index to write on the byte buffer.
 */
UintBuffer.prototype.packUnsafe = function(buffer, num, index=0) {};

/**
 * Read one integer number from a byte buffer.
 * @param {!Uint8Array|!Array<number>} buffer An array of bytes.
 * @param {number=} index The index to read.
 * @return {number}
 */
UintBuffer.prototype.unpackUnsafe = function(buffer, index=0) {};

/**
 * Throws error in case of overflow.
 * @param {number} num The number.
 * @throws {RangeError} On overflow.
 * @protected
 */
UintBuffer.prototype.overflow = function(num) {};
