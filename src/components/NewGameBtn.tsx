"use client"

import { useRouter } from "next/navigation"

import { startTransition, useCallback, useEffect, useRef } from "react"

import useWebSocket from "react-use-websocket"

import { wsOptions, wsURL } from "@/helpers/websockets"

import { type Response } from "@/wsServer"

export default function NewGameBtn() {
  const router = useRouter()
  const didUnmount = useRef(false)
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(wsURL, wsOptions(() => didUnmount.current === false))

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
  
  const newGame = useCallback(() => sendJsonMessage({ action: "create" }), [sendJsonMessage])

  return (
    <div className="new-game">
      <button type="button" className="btn" onClick={newGame}>
        New Game
      </button>
    </div>
  )
}