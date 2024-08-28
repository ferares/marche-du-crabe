"use client"

import { useRouter } from "next/navigation"

import { startTransition, useCallback, useEffect } from "react"
import useWebSocket from "react-use-websocket"

export default function NewGameBtn() {
  const router = useRouter()
  const { lastMessage, sendMessage } = useWebSocket("ws://localhost:8080")

  useEffect(() => {
    if (!lastMessage) return
    const { type, code } = JSON.parse(lastMessage.data as string) as { type: string, code: string }
    if ((type === "create") && (code)) {
      if (code) startTransition(() => router.push(`/${code}`))
    }
  }, [lastMessage, router])
  
  const newGame = useCallback(() => {
    sendMessage(JSON.stringify({ action: "create" }))
  }, [sendMessage])

  return (
    <div className="new-game">
      <button type="button" className="btn" onClick={newGame}>
        New Game
      </button>
    </div>
  )
}