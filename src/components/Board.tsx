"use client"

import { useRouter } from "next/navigation"

import { startTransition, useEffect, useState } from "react"

import useWebSocket from "react-use-websocket"

import { type PlayerBoard } from "@/types/Board"

import { enemyIcons, objectRevealedIcon, shrimpIcon } from "@/helpers/game"

import { type Response } from "@/wsServer"

import EnemyComponent from "./Enemy"
import ObjectComponent from "./Object"
import CardComponent from "./Card"

interface BoardComponentProps { code: string }

export default function BoardComponent({ code }: BoardComponentProps) {
  const router = useRouter()
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(process.env.NEXT_PUBLIC_WS_URL ?? "")
  const [board, setBoard] = useState<PlayerBoard>()
  const [waitForPlayer, setWaitForPlayer] = useState(true)

  useEffect(() => {
    if (!lastJsonMessage) return
    const msg = lastJsonMessage as Response
    if ((msg.type === "join") || (msg.type === "update")) {
      setBoard(msg.board)
      setWaitForPlayer(msg.new ?? false)
    } else if (msg.type === "start") {
      setWaitForPlayer(false)
    } else if (msg.type === "error") {
      console.error(msg.text)
      startTransition(() => router.push("/"))
    }
  }, [lastJsonMessage, router])

  useEffect(() => {
    if (!board) sendJsonMessage({ action: "join", code })
  }, [code, sendJsonMessage, board])

  function restartGame() {
    sendJsonMessage({ action: "restart" })
  }

  function handleDrawEnemy() {
    sendJsonMessage({ action: "draw" })
  }

  function placeEnemy(row: number, column: number) {
    sendJsonMessage({ action: "place", row, column })
  }

  function movePlayer(row: number, column: number) {
    sendJsonMessage({ action: "move", row, column })
  }

  async function handleShare() {
    if (navigator?.share) {
      await navigator.share({
        title: 'BusesUY',
        text: '',
        url: window.location.href,
      })
    } else {
      await navigator?.clipboard.writeText(window.location.href)
    }
  }

  if (!board) return "Loading...."

  const { cards, freedCount, gameState, playersPos, forbiddenObjects, shrimpCount, turn, currentEnemy, character, enemyCount } = board

  return (
    <>
      <header className="game-header">
        <h2 className="turn-title">
          {turn === character ? "Your turn" : "Waiting for other player"}
          {turn === character && gameState === "draw" && ": Draw an enemy card"}
          {turn === character && gameState === "place" && ": Place the enemy card"}
          {turn === character && gameState === "move" && ": Move the crabs"}
        </h2>
        <span className="counts">
          <span className="count" title="Freed crabs">
            {objectRevealedIcon} x {freedCount}
          </span>
          <span className="count" title="Remaining shrimps">
            {shrimpIcon} x {shrimpCount}
          </span>
          <span className="count" title="Remaining enemy cards">
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
              <li key={`object-${index}`} title="Object with enemy">
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
                <span className={`card btn btn--enemy card--enemy-${currentEnemy.player} card--disabled`} title="Place enemy on this row">
                  <EnemyComponent enemy={currentEnemy} />
                </span>
              )}
            </li>
          ))}
          {(gameState === "draw") && (turn === character) && (
            <li>
              <button type="button" className="card btn btn--draw" title="Draw an enemy" onClick={handleDrawEnemy}>
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
                  You Lose! - New Game?
                </button>
              </div>
            )}
            {(gameState === "win") && (
              <div className="new-game">
                <button type="button" className="btn" onClick={restartGame}>
                  You Win! - New Game?
                </button>
              </div>
            )}
          </div>
          )}
      </div>
      {waitForPlayer && (
        <div className="share">
          <button type="button" className="btn" onClick={handleShare}>
            Share the URL with a friend to start the game
          </button>
        </div>
      )}
    </>
  )
}