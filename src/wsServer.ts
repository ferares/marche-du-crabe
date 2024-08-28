import { type WebSocket, WebSocketServer } from "ws"

import { type PlayerBoard, type Board } from "./types/Board"
import { type Player } from "./types/Player"

import { generateCode } from "./helpers/strings"
import { drawEnemy, generateBoard, getPlayerBoardData, movePlayer, placeEnemy } from "./helpers/game"

export type Message = { action: string, code?: string, row?: number, column?: number }
export type Response = { type: "create", code: string } | { type: "join" | "update", board: PlayerBoard } | { type: "error", text: string }

type Room = { code: string, board: Board, players: Map<Player, WebSocket> }

const rooms: Record<string, Room> = {}

function sendMessage(ws: WebSocket, msg: Response) {
  if (!ws.OPEN) {
    ws.addEventListener("open", () => sendMessage(ws, msg), { once: true })
  } else {
    ws.send(JSON.stringify(msg))
  }
}

function getPlayerRoom(ws: WebSocket) {
  for (const [, room] of Object.entries(rooms)) {
    if ((room.players.get("barco") === ws) || (room.players.get("sol") === ws)) return room
  }
  return
}

function getPlayerChar(ws: WebSocket, room: Room): Player | undefined {
  if (room.players.get("barco") === ws) return "barco"
  if (room.players.get("sol") === ws) return "sol"
}

function isPlayerTurn(player: WebSocket, room: Room) {
  const playerChar = getPlayerChar(player, room)
  return room.board.turn === playerChar
}

function createRoom() {
  let code = generateCode(10)
  while (rooms[code]) code = generateCode(10)
  const board = generateBoard()
  if (!board) return
  rooms[code] = { code, board, players: new Map() }
  return code
}

function restartRoom(room: Room) {
  const board = generateBoard()
  if (!board) return false
  room.board = board
  return true
}

function addPlayer(code: string, ws: WebSocket) {
  const room = rooms[code]
  if (!room) return
  if (room.players.size >= 2) return
  if (room.players.has("barco")) room.players.set("sol", ws)
  else room.players.set("barco", ws)
  return room.board
}

function leaveRoom(ws: WebSocket) {
  const room = getPlayerRoom(ws)
  if (!room) return
  const character = getPlayerChar(ws, room)
  if (!character) return
  room.players.delete(character)
  if (room.players.size === 0) {
    delete(rooms[room.code])
  }
}

function broadCastBoardUpdate(room: Room) {
  room.players.forEach((ws) => {
    const character = getPlayerChar(ws, room)
    if (!character) return
    sendMessage(ws, { type: "update", board: getPlayerBoardData(character, room.board) })
  })
}

export default function startWSServer() {
  const wss = new WebSocketServer({
    host: "0.0.0.0",
    port: 8080,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024 // Size (in bytes) below which messages
      // should not be compressed if context takeover is disabled.
    }
  })

  wss.on("connection", function connection(ws) {
    ws.on("error", console.error)
  
    ws.on("close", () => leaveRoom(ws))
  
    ws.on("message", function message(data) {
      const msg = JSON.parse(String(data)) as Message
      if (msg.action === "create") {
        // Create a new room
        const code = createRoom()
        if (!code) return sendMessage(ws, { type: "error", text: "Error creating room." })
        sendMessage(ws, { type: "create", code })
      } else if (msg.action === "restart") {
        const room = getPlayerRoom(ws)
        if (room) {
          if (restartRoom(room)) {
            broadCastBoardUpdate(room)
          } else {
            sendMessage(ws, { type: "error", text: "Error resetting room." })
          }
        }
      } else if (msg.action === "join") {
        if (msg.code) {
          const room = rooms[msg.code]
          if (!room) return sendMessage(ws, { type: "error", text: "Room not found." })
          // Check if the player is already in this room
          const playerRoom = getPlayerRoom(ws)
          if (playerRoom?.code !== msg.code) {
            // Check if the room is full
            if (room.players.size === 2) {
              sendMessage(ws, { type: "error", text: `Room is full ${msg.code}.` })
            } else {
              // If the player is already in another room leave it
              leaveRoom(ws)
              // Add player to this room
              const board = addPlayer(msg.code, ws)
              if (!board) return
              const playerChar = getPlayerChar(ws, room)
              if (!playerChar) return
              sendMessage(ws, { type: "join", board: getPlayerBoardData(playerChar, board) })
            }
          }
        } else {
          sendMessage(ws, { type: "error", text: `No room with code ${msg.code} exists.` })
        }
      } else if (msg.action === "move") {
        const { row, column } = msg
        const room = getPlayerRoom(ws)
        if ((room) && (row !== undefined) && (column !== undefined)) {
          if (isPlayerTurn(ws, room)) {
            movePlayer(row, column, room.board)
            broadCastBoardUpdate(room)
          }
        }
      } else if (msg.action === "place") {
        const { row, column } = msg
        const room = getPlayerRoom(ws)
        if ((room) && (row !== undefined) && (column !== undefined)) {
          if (isPlayerTurn(ws, room)) {
            placeEnemy(row, column, room.board)
            broadCastBoardUpdate(room)
          }
        }
      } else if (msg.action === "draw") {
        const room = getPlayerRoom(ws)
        if (room) {
          if (isPlayerTurn(ws, room)) {
            drawEnemy(room.board)
            broadCastBoardUpdate(room)
          }
        }
      }
    })
  })

  return wss
}

startWSServer()