"use client"

import { useRouter } from "next/navigation"

import { startTransition, useCallback, useEffect, useRef, useState } from "react"

import useWebSocket from "react-use-websocket"

import { wsOptions, wsURL } from "@/helpers/websockets"

import { type Response } from "@/wsServer"

export default function NewGameBtn() {
  const router = useRouter()
  const didUnmount = useRef(false)
  const [shouldConnect, setShouldConnect] = useState(true)
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(wsURL, wsOptions({ shouldReconnect: () => didUnmount.current === false, onClose: () => handleClose() }), shouldConnect)

  useEffect(() => () => { didUnmount.current = true }, [])

  useEffect(() => {
    if (!lastJsonMessage) return
    const msg = lastJsonMessage as Response
    if (msg.type === "create") {
      startTransition(() => router.push(`/${msg.code}`))
    } else if (msg.type === "error") {
      console.error(msg.text)
    }
  }, [lastJsonMessage, router])

  // shouldConnect to false on ws close
  const handleClose = useCallback(() => setShouldConnect(false), [setShouldConnect])

  // Try to reconnect the ws every 1 second
  useEffect(() => { if (!shouldConnect) setTimeout(() => setShouldConnect(true), 1000) }, [shouldConnect])
  
  const newGame = useCallback(() => sendJsonMessage({ action: "create" }), [sendJsonMessage])

  return (
    <div className="new-game">
      <button type="button" className="btn" onClick={newGame}>
        New Game
      </button>
    </div>
  )
}