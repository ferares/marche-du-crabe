"use client"

import { useRouter } from "next/navigation"

import { startTransition, useCallback, useEffect, useRef, useState } from "react"

import { useTranslations } from "next-intl"

import useWebSocket from "react-use-websocket"

import { type PlayerBoard } from "@/types/Board"

import { enemyIcons, objectRevealedIcon, shrimpIcon } from "@/helpers/game"
import { wsOptions, wsURL } from "@/helpers/websockets"

import { useLoaderContext } from "@/context/Loader"
import { useAlertsContext } from "@/context/Alerts"

import { type Response } from "@/wsServer"

import EnemyComponent from "./Enemy"
import ObjectComponent from "./Object"
import CardComponent from "./Card"
import Modal from "./Modal"

interface BoardComponentProps { code: string }

export default function BoardComponent({ code }: BoardComponentProps) {
  const t = useTranslations()
  const router = useRouter()
  const didUnmount = useRef(false)
  const { setLoading } = useLoaderContext()
  const { pushAlert } = useAlertsContext()
  const [shouldConnect, setShouldConnect] = useState(true)
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(wsURL, wsOptions({ shouldReconnect: () => didUnmount.current === false, onOpen: () => handleReconnect(), onClose: () => handleClose() }), shouldConnect)
  const [board, setBoard] = useState<PlayerBoard>()
  const [waitForPlayer, setWaitForPlayer] = useState(true)

  const restartGame = useCallback(() => sendJsonMessage({ action: "restart" }), [sendJsonMessage])

  const handleDrawEnemy = useCallback(() => sendJsonMessage({ action: "draw" }), [sendJsonMessage])

  const placeEnemy = useCallback((row: number, column: number) => sendJsonMessage({ action: "place", row, column }), [sendJsonMessage])

  const movePlayer = useCallback((row: number, column: number) => sendJsonMessage({ action: "move", row, column }), [sendJsonMessage])

  useEffect(() => {
    didUnmount.current = false
    return () => { didUnmount.current = true }
  }, [])

  useEffect(() => {
    if (!lastJsonMessage) return
    const msg = lastJsonMessage as Response
    if ((msg.type === "join") || (msg.type === "update")) {
      setBoard(msg.board)
      console.log(msg.board)
      if ((!msg.board.new) && (msg.board.connectedPlayers < 2)) {
        setLoading(true, t("Messages.player-disconnected"))
      } else {
        setLoading(false)
      }
      setWaitForPlayer(msg.board.new ?? false)
    } else if (msg.type === "start") {
      setWaitForPlayer(false)
    } else if (msg.type === "error") {
      console.error(msg.text)
      if (msg.code === 500) {
        pushAlert("danger", t("Messages.error"))
      } else {
        if (msg.code === 404) {
          pushAlert("danger", t("Messages.game-not-found"))
        } else if (msg.code === 409) {
          pushAlert("danger", t("Messages.game-full"))
        }
        startTransition(() => router.push("/"))
      }
    }
  }, [lastJsonMessage, router, pushAlert, setLoading, t])

  // Join the room if the board hasn't been setup yet
  useEffect(() => { if (!board) sendJsonMessage({ action: "join", code }) }, [code, sendJsonMessage, board])

  // shouldConnect to false on ws close
  function handleClose() {
    if (didUnmount.current) return
    setLoading(true, t("Messages.connection-lost"))
    setShouldConnect(false)
  }

  // Try to reconnect the ws every 1 second
  useEffect(() => { if (!shouldConnect) setTimeout(() => setShouldConnect(true), 1000) }, [shouldConnect])

  // On reconnect re-join the room
  const handleReconnect = useCallback(() => {
    setLoading(false)
    sendJsonMessage({ action: "join", code })
  }, [code, sendJsonMessage, setLoading])

  // TODO: Re-enable this
  // const handleShare = useCallback(async () => {
  //   if (navigator?.share) {
  //     await navigator.share({ title: 'Join my game!', text: '', url: window.location.href })
  //   } else {
  //     await navigator?.clipboard?.writeText(window.location.href)
  //   }
  // }, [])

  if (!board) return t("Labels.loading")

  const { cards, freedCount, gameState, playersPos, forbiddenObjects, shrimpCount, turn, currentEnemy, character, enemyCount } = board

  return (
    <>
      <header className="game-header">
        <h2 className="turn-title">
          {turn === character ? t("Messages.your-turn") : t("Messages.waiting-for-player")}
          {turn === character && gameState === "draw" && `: ${t("Messages.draw-card")}`}
          {turn === character && gameState === "place" && `: ${t("Messages.place-card")}`}
          {turn === character && gameState === "move" && `: ${t("Messages.move-crabs")}`}
        </h2>
        <span className="counts">
          <span className="count" title={t("Messages.freed-crabs")}>
            {objectRevealedIcon} x {freedCount}
          </span>
          <span className="count" title={t("Messages.remaining-shrimps")}>
            {shrimpIcon} x {shrimpCount}
          </span>
          <span className="count" title={t("Messages.remaining-enemy-cards")}>
            <span className="">
              <span>
                {enemyIcons.lobster}
              </span>
              <span>
                {enemyIcons.octopus}
              </span>
            </span>
            &nbsp;x {enemyCount}
          </span>
        </span>
      </header>
      <div className="board-wrapper">
        <ol className="objects">
          {forbiddenObjects.map((position, index) => {
            const card = cards[position.row][position.column]
            return (
              <li key={`object-${index}`} title={t("Messages.object-enemy")}>
                <span className={`card btn card--enemy-${card.object?.enemy?.player} card--disabled`}>
                  {card.object && <ObjectComponent object={card.object} />}
                </span>
              </li>
            )
          })}
        </ol>
        <ol className={`board ${["place", "move"].includes(gameState) && turn === character ? "board--active" : ""}`}>
          {cards.map((row, rowIndex) => row.map((card, cardIndex) => {
            let onClickHandler = undefined
            if (turn === character) {
              if ((currentEnemy?.row === rowIndex) && (!card.object) && (!card.enemy)) {
                onClickHandler = () => placeEnemy(rowIndex, cardIndex)
              } else if (gameState === "move") {
                if (turn === "barco") {
                  if ((playersPos.column === cardIndex)) onClickHandler = () => movePlayer(rowIndex, cardIndex)
                } else {
                  if ((playersPos.row === rowIndex)) onClickHandler = () => movePlayer(rowIndex, cardIndex)
                }
              }
            }
            return (
              <li key={`${rowIndex}-${cardIndex}`}>
                <CardComponent card={card} cardPosition={{ column: cardIndex, row: rowIndex }} onClick={onClickHandler} playersPos={playersPos} turn={turn} />
              </li>
            )
          }))}
        </ol>
        <ol className="enemy-rows">
          {[0,1,2,3,4,5].map((row) => (
            <li key={row}>
              {currentEnemy && currentEnemy.row === row && (
                <span className={`card btn btn--enemy card--enemy-${currentEnemy.player} card--disabled`} title={t("Messages.place-enemy")}>
                  <EnemyComponent enemy={currentEnemy} />
                </span>
              )}
            </li>
          ))}
          {(gameState === "draw") && (turn === character) && (
            <li>
              <button type="button" className="card btn btn--draw" title={t("Messages.draw-card")} onClick={handleDrawEnemy}>
                <span>
                  {enemyIcons.lobster}
                </span>
                <span>
                  {enemyIcons.octopus}
                </span>
              </button>
            </li>
          )}
        </ol>
        {((gameState === "lost") || (gameState === "win")) && (
          <div className="game-actions">
            {(gameState === "lost") && (
              <div className="new-game">
                <button type="button" className="btn" onClick={restartGame}>
                  {t("Messages.game-lose")}
                </button>
              </div>
            )}
            {(gameState === "win") && (
              <div className="new-game">
                <button type="button" className="btn" onClick={restartGame}>
                  {t("Messages.game-win")}
                </button>
              </div>
            )}
          </div>
          )}
      </div>
      <Modal id="share-modal" labelledBy="share-modal-title" open={waitForPlayer} closeable={false}>
        <h2 id="share-modal-title" style={{ textAlign: "center" }}>
          {t("Messages.share")}
        </h2>
      </Modal>
    </>
  )
}