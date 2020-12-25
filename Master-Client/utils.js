const Parser = require('binary-parser').Parser;
const UIntBuffer = require('uint-buffer');

function readUint64(buffer, position) {
  let binaryReader = new Parser().uint64be('uint64');
  let finalBuffer = Buffer.alloc(8);
  buffer.copy(finalBuffer, 0, position, position + 8);
  return binaryReader.parse(finalBuffer).uint64;
}

function readUint32(buffer, position) {
  let binaryReader = new Parser().uint32be('uint32');
  let finalBuffer = Buffer.alloc(4);
  buffer.copy(finalBuffer, 0, position, position + 4);
  return binaryReader.parse(finalBuffer).uint32;
}

function readUint16(buffer, position) {
  let binaryReader = new Parser().uint16be('uint16');
  let finalBuffer = Buffer.alloc(2);
  buffer.copy(finalBuffer, 0, position, position + 2);
  return binaryReader.parse(finalBuffer).uint16;
}

function readUint8(buffer, position) {
  let binaryReader = new Parser().uint8('uint8');
  let finalBuffer = Buffer.alloc(1);
  buffer.copy(finalBuffer, 0, position, position + 1);
  return binaryReader.parse(finalBuffer).uint8;
}

function readUintNAsBuffer(numOfBits, numValue){
  const buffer = Buffer.alloc(numOfBits / 8 | 0);
  let uintBuffer = new UIntBuffer.UintBuffer(numOfBits);
  uintBuffer.pack(buffer, numValue);
  return buffer.reverse();
}

module.exports = {
  readUint64,
  readUint32,
  readUint16,
  readUint8,
  readUintNAsBuffer
};