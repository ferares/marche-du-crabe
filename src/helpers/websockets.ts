import { type Options } from "react-use-websocket"

import { type Message } from "@/wsServer"

export const wsURL = process.env.NEXT_PUBLIC_WS_URL ?? ""

export const messages: Record<string, ((...params: never[]) => Message)> = {
  create: () => ({ action: "create" }),
  join: (code: string) => ({ action: "join", code }),
  draw: () => ({ action: "draw" }),
  place: (row: number, column: number) => ({ action: "place", row, column }),
  move: (row: number, column: number) => ({ action: "move", row, column }),
  restart: () => ({ action: "restart" }),
  ping: () => ({ action: "ping" }),
}

const heartbeat: Options["heartbeat"] = { message: JSON.stringify(messages.ping()), returnMessage: JSON.stringify({ type: "pong" }) }

export const wsOptions = (shouldReconnect?: Options["shouldReconnect"]): Options => ({ retryOnError: true, share: true, shouldReconnect, heartbeat })