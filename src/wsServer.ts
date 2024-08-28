import { WebSocket, WebSocketServer } from "ws"

import { Board } from "./types/Board"

import { generateCode } from "./helpers/strings"
import { drawEnemy, generateBoard, getPlayerBoardData, movePlayer, placeEnemy } from "./helpers/game"

const wss = new WebSocketServer({
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

type Room = { code: string, board: Board, players: WebSocket[] }

const rooms: { [code: string]: Room } = {}

function getPlayerRoom(player: WebSocket) {
  for (const code of Object.keys(rooms)) {
    if (rooms[code].players.includes(player)) return rooms[code]
  }
  return
}

function getPlayerChar(player: WebSocket, room: Room) {
  return room.players.indexOf(player) === 0 ? "barco" : "sol"
}

function isPlayerTurn(player: WebSocket, room: Room) {
  const playerChar = getPlayerChar(player, room)
  return room.board.turn === playerChar
}

function createRoom() {
  let code = generateCode(10)
  while (rooms[code]) code = generateCode(10)
  const board = generateBoard()
  rooms[code] = { code, board, players: [] }
  console.log(`New room created with code ${code}`)
  return code
}

function addPlayer(code: string, player: WebSocket) {
  const room = rooms[code]
  room.players.push(player)
  console.log(`New player on room ${code}`)
  return rooms[code].board
}

function leaveRoom(player: WebSocket) {
  const room = getPlayerRoom(player)
  if (room) {
    room.players.splice(room.players.indexOf(player), 1)
    if (room.players.length === 0) {
      delete(rooms[room.code])
      console.log(`Room ${room.code} became empty and was deleted.`)
    }
  }
}

function broadCastBoardUpdate(room: Room) {
  for (let index = 0; index < room.players.length; index++) {
    const player = room.players[index]
    if (player.readyState === 1) {
      player.send(JSON.stringify({
        type: "update",
        board: getPlayerBoardData(getPlayerChar(player, room), room.board),
      }))
    }
  }
}

wss.on("connection", function connection(ws) {
  console.log("Client connected")

  ws.on("error", console.error)

  ws.on("close", () => console.log("Client disconnected"))

  ws.on("message", function message(data) {
    console.log("Received:", data)
    const msg = JSON.parse(data.toString())
    if (msg.action === "create") {
      if (ws.readyState === 1) {
        // If the user is already in a room leave it
        leaveRoom(ws)
        // Create room
        const code = createRoom()
        // Add player to room
        ws.send(JSON.stringify({ type: "create", code }))
      }
    } else if (msg.action === "join") {
      if (ws.readyState === 1) {
        if (rooms[msg.code]) {
          const room = rooms[msg.code]
          // If the user is already in this room
          const playerRoom = getPlayerRoom(ws)
          if (playerRoom?.code === msg.code) {
            // Send an error
            ws.send(JSON.stringify({ type: "error", text: `Player already on room ${msg.code}.` }))
          } else {
            if (room.players.length === 2) {
              ws.send(JSON.stringify({ type: "error", text: `Room is full ${msg.code}.` }))
            } else {
              // If the user is already in a room leave it
              leaveRoom(ws)
              // Add player to room
              const board = addPlayer(msg.code, ws)
              const playerChar = getPlayerChar(ws, room)
              ws.send(JSON.stringify({ type: "join", board: getPlayerBoardData(playerChar, board) }))
            }
          }
        } else {
          ws.send(JSON.stringify({ type: "error", text: `No room with code ${msg.code} exists.` }))
        }
      }
    } else if (msg.action === "move") {
      console.log(`Move: ${msg.row}, ${msg.column}`)
      const { row, column } = msg
      const room = getPlayerRoom(ws)
      if ((room) && (row !== undefined) && (column !== undefined)) {
        if (isPlayerTurn(ws, room)) {
          movePlayer(row, column, room.board)
          broadCastBoardUpdate(room)
        }
      }
    } else if (msg.action === "place") {
      console.log(`Place: ${msg.row}, ${msg.column}`)
      const { row, column } = msg
      const room = getPlayerRoom(ws)
      if ((room) && (row !== undefined) && (column !== undefined)) {
        if (isPlayerTurn(ws, room)) {
          placeEnemy(row, column, room.board)
          broadCastBoardUpdate(room)
        }
      }
    } else if (msg.action === "draw") {
      console.log(`Draw`)
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