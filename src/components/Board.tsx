"use client"

import { useEffect, useState } from "react"

import { PlayerBoard } from "@/types/Board"

import { objectRevealedIcon, playersIcon, shrimpIcon } from "@/helpers/game"

import EnemyComponent from "./Enemy"
import ObjectComponent from "./Object"
import NewGameBtn from "./NewGameBtn"
import useWebSocket from "react-use-websocket"
import CardComponent from "./Card"

interface BoardComponentProps { code: string }

export default function BoardComponent({ code }: BoardComponentProps) {
  const { lastMessage, sendMessage } = useWebSocket("ws://localhost:8080")
  const [board, setBoard] = useState<PlayerBoard>()

  useEffect(() => {
    console.log(lastMessage)
    if (!lastMessage) return
    const msg = JSON.parse(lastMessage.data)
    if ((msg.type === "join") || (msg.type === "update")) {
      setBoard(msg.board)
    }
  }, [lastMessage])

  useEffect(() => {
    if (!board) sendMessage(JSON.stringify({ action: "join", code }))
  }, [code, sendMessage, board])

  function handleDrawEnemy() {
    sendMessage(JSON.stringify({ action: "draw" }))
  }

  function placeEnemy(row: number, column: number) {
    sendMessage(JSON.stringify({ action: "place", row, column }))
  }

  function movePlayer(row: number, column: number) {
    sendMessage(JSON.stringify({ action: "move", row, column }))
  }

  if (!board) return "Loading...."

  const { cards, freedCount, gameState, playersPos, forbiddenObjects, shrimpCount, turn, currentEnemy, character } = board

  return (
    <>
      <header className="game-header">
        <h2 className="turn-title">
          Turn: {turn}
        </h2>
        <span className="counts">
          <span className="count">
            {objectRevealedIcon} x {freedCount}
          </span>
          <span className="count">
            {shrimpIcon} x {shrimpCount}
          </span>
        </span>
      </header>
      <div className="board-wrapper">
        <ol className="objects">
          {forbiddenObjects.map((position, index) => {
            const card = cards[position.row][position.column]
            return (
              <li key={`object-${index}`}>
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
                <span className={`card btn card--enemy-${currentEnemy.player} card--disabled`}>
                  <EnemyComponent enemy={currentEnemy} />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="game-actions">
        {/* TODO: win & lost should reset the current room instead of creating a new one */}
        {(gameState === "lost") && (
          <NewGameBtn label="Lost - New Game?" />
        )}
        {(gameState === "win") && (
          <NewGameBtn label="Win! - New Game?" />
        )}
        {(gameState === "draw") && (turn === character) && (
          <button type="button" className="btn" onClick={handleDrawEnemy}>
            Draw Enemy
          </button>
        )}
      </div>
    </>
  )
}