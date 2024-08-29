"use client"

import { useRouter } from "next/navigation"

import { startTransition, useCallback, useEffect, useRef, useState } from "react"

import useWebSocket from "react-use-websocket"

import { wsOptions, wsURL } from "@/helpers/websockets"

import { useLoaderContext } from "@/context/Loader"
import { useAlertsContext } from "@/context/Alerts"

import { type Response } from "@/wsServer"

export default function NewGameBtn() {
  const router = useRouter()
  const { setLoading } = useLoaderContext()
  const { pushAlert } = useAlertsContext()
  const didUnmount = useRef(false)
  const [shouldConnect, setShouldConnect] = useState(true)
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(wsURL, wsOptions({ shouldReconnect: () => didUnmount.current === false, onClose: () => handleClose(), onOpen: () => handleOpen() }), shouldConnect)

  useEffect(() => {
    didUnmount.current = false
    return () => { didUnmount.current = true }
  }, [])

  useEffect(() => {
    if (!lastJsonMessage) return
    const msg = lastJsonMessage as Response
    if (msg.type === "create") {
      setLoading(true)
      startTransition(() => {
        router.push(`/${msg.code}`)
        setLoading(false)
      })
    } else if (msg.type === "error") {
      pushAlert("danger", "There was a problem creating a new game. Try again later.")
      console.error(msg.text)
    }
  }, [lastJsonMessage, router, setLoading, pushAlert])

  const handleOpen = useCallback(() => setLoading(false), [setLoading])

  // shouldConnect to false on ws close
  function handleClose() {
    if (didUnmount.current) return
    setLoading(true, "The connection to the game server was lost. Reconnecting...")
    setShouldConnect(false)
  }

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