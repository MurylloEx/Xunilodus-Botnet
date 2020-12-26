# Xunilodus Botnet
The open-source project of a botnet master, command control and bot with linux system's as target.

Known targets:
- Debian;
- Ubuntu;
- Linux Mint/Cinnamon;
- PopOS;
- And some others!

## 1. How it works?

Xunilodus is a botnet designed on the Python, Node.js and Shell Script language to work on systems with kernel derived from linux.

Its form of communication is based on a protocol superior to the WebSocket called SFXTP (Single Frame Xunilodus Transmission Protocol). This protocol allows communications between the Master, the Command Center and the Bot. For reasons of limitation, each frame (data packet) is restricted to 65535 bytes (~ 64kb).

Each command sent by the master to the bot is tunneled by the command center that directs which bot to send the information through an open socket.

All traffic data between a Master and a Bot is tunneled by Command Control.

<p align="center">
  <img alt="Botnet Scheme" src="https://i.imgur.com/6gCJrAI.png">
</p>

## 2. SFXTP (Single Frame Xunilodus Transmission Protocol)

<p align="center">
  <img alt="Botnet Scheme" src="https://i.imgur.com/UYBhhpe.png">
</p>

## 3. Command Control - List of supported commands

- HELP
- IMPERSONATE
- DEPERSONATE
- LISTBOTS
- SHELLCODE