"use client"

import { useRouter } from "next/navigation"

import { startTransition, useEffect } from "react"
import useWebSocket from "react-use-websocket"

interface NewGameBtnProps { label: string }

export default function NewGameBtn({ label }: NewGameBtnProps) {
  const router = useRouter()
  const { lastMessage, sendMessage } = useWebSocket("ws://localhost:8080")

  useEffect(() => {
    if (!lastMessage) return
    const { type, code } = JSON.parse(lastMessage.data)
    if ((type === "create") && (code)) {
      if (code) startTransition(() => router.push(`/${code}`))
    }
  }, [lastMessage, router])
  
  async function handleNewGame() {
    sendMessage(JSON.stringify({ action: "create" }))
  }

  return (
    <div className="new-game">
      <button type="button" className="btn" onClick={handleNewGame}>
        {label}
      </button>
    </div>
  )
}