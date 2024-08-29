import { type Options } from "react-use-websocket"

export const wsURL = process.env.NEXT_PUBLIC_WS_URL ?? ""

export const wsOptions = (shouldReconnect?: Options["shouldReconnect"]): Options => ({ retryOnError: true, share: true, shouldReconnect })