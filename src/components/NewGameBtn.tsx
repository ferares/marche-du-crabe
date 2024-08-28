"use client"

import { useRouter } from "next/navigation"

import { startTransition, useCallback, useEffect } from "react"

import useWebSocket from "react-use-websocket"

import { type Response } from "@/wsServer"

export default function NewGameBtn() {
  const router = useRouter()
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(process.env.NEXT_PUBLIC_WS_URL ?? "")

  useEffect(() => {
    if (!lastJsonMessage) return
    const msg = lastJsonMessage as Response
    if (msg.type === "create") {
      startTransition(() => router.push(`/${msg.code}`))
    } else if (msg.type === "error") {
      console.error(msg.text)
    }
  }, [lastJsonMessage, router])
  
  const newGame = useCallback(() => {
    sendJsonMessage({ action: "create" })
  }, [sendJsonMessage])

  return (
    <div className="new-game">
      <button type="button" className="btn" onClick={newGame}>
        New Game
      </button>
    </div>
  )
}