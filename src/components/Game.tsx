"use client"

import { useEffect, useState } from "react"

import { shuffle } from "@/helpers/array"
import { Card } from "@/types/Card"
import { Enemy } from "@/types/Enemy"
import { Player } from "@/types/Player"
import { Position } from "@/types/Position"

import EnemyComponent from "./Enemy"
import ObjectComponent from "./Object"

const objectRevealedIcon = "🐚"
const objectIcons = shuffle(["📠", "🕶️", "🚽", "🩲", "🥫", "⚓", "🛞", "🛹", "🧸", "🛢️", "🎸", "🏐"])
const playersIcon = "🦀"

function getRandom(min: number, max: number, exclude?: number[]) {
  let num = Math.floor(Math.random() * (max - min + 1)) + min
  while (exclude?.includes(num)) {
    num = (num + 1) % (max + 1)
  }
  return num
}

function getObjectsCountColumns(board: Card[][]) {
  const objectCountColumns: number[] = [0, 0, 0, 0, 0, 0]
  for (const row of board) {
    let currentColumn = 0
    for (const card of row) {
      if (card.object) objectCountColumns[currentColumn]++
      currentColumn++
    }
  }
  return objectCountColumns
}

function generateEnemies(player: Player, generatedEnemies?: Enemy[]) {
  const enemies: Enemy[] = []
  const lobstersPos: number[] = []
  const excludePos: number[] = []
  if (generatedEnemies) {
    for (const lobster of generatedEnemies.filter((enemy) => enemy.isLobster)) {
      excludePos.push(lobster.row, (lobster.row + 6) % 12)
    }
  }
  for (let index = 0; index < 3; index++) {
    const lobsterPos = getRandom(0, 11, excludePos)
    lobstersPos.push(lobsterPos)
    excludePos.push(lobsterPos, (lobsterPos + 6) % 12)
  }
  for (let index = 0; index < 12; index++) {
    enemies.push({ isLobster: lobstersPos.includes(index), row: index % 6, player })
  }
  return shuffle(enemies)
}

function generateHiddenEnemiesIndexes() {
  const enemiesIndexes: number[] = []
  for (let index = 0; index < 4; index++) {
    enemiesIndexes.push(getRandom(0, 11, enemiesIndexes))
  }
  return enemiesIndexes
}

function cardHasEnemy(card: Card): boolean {
  return (!!card.enemy || (card.object?.revealed && !!card.object.enemy)) || false
}

function pathHasEnemy(cards: Card[][], origin: Position, destination: Position) {
  if ((origin.column === destination.column) && (origin.row === destination.row)) return false
  if (cardHasEnemy(cards[destination.row][destination.column])) return true
  if (origin.row !== destination.row) {
    let loopStart = origin.row + 1
    let loopEnd = destination.row
    if (origin.row > destination.row) {
      loopStart = destination.row
      loopEnd = origin.row - 1
    }
    for (let row = loopStart; row <= loopEnd; row++) {
      if (cardHasEnemy(cards[row][origin.column])) return true
    }
  } else {
    let loopStart = origin.column + 1
    let loopEnd = destination.column
    if (origin.column > destination.column) {
      loopStart = destination.column
      loopEnd = origin.column - 1
    }
    for (let column = loopStart; column <= loopEnd; column++) {
      if (cardHasEnemy(cards[origin.row][column])) return true
    }
  }
  return false
}

function generateBoard() {
  const cards: Card[][] = []
  const playersPos: Position = { column: 0, row: 5 }
  const barcoEnemies = generateEnemies("barco")
  const solEnemies = generateEnemies("sol", barcoEnemies)
  const enemies: { [player in Player]: Enemy[] } = { barco: barcoEnemies, sol: solEnemies }
  const enemiesIndexes = generateHiddenEnemiesIndexes()
  let objectIconIndex = 0
  for (let row = 0; row < 6; row++) {
    const excludeColumns: number[] = []
    const objectsCountColumns = getObjectsCountColumns(cards)
    objectsCountColumns.forEach((count, index) => (count >= 2) ? excludeColumns.push(index) : null )
    const object1Column = getRandom(0, 5, excludeColumns)
    if ((row === 4) && (objectsCountColumns.filter((count) => count === 1).length === 2) && (objectsCountColumns[object1Column] === 1)) {
      excludeColumns.push(objectsCountColumns.findIndex((count, index) => (count === 1 && index !== object1Column)))
    }
    const object2Column = getRandom(0, 5, [object1Column, ...excludeColumns])
    const objectsColumns = [object1Column, object2Column]
    const columns: Card[] = []
    for (let column = 0; column < 6; column++) {
      const card: Card = {}
      if (objectsColumns.includes(column)) {
        card.object = { icon: objectIcons[objectIconIndex], revealed: false }
        const enemyIndex = enemiesIndexes.indexOf(objectIconIndex)
        if (enemyIndex > -1) {
          const player = enemyIndex < 2 ? "barco" : "sol"
          card.object.enemy = { isLobster: false, player, row }
        }
        objectIconIndex++
      }
      columns.push(card)
    }
    cards.push(columns)
  }
  for (let index = 0; index < cards[5].length; index++) {
    if (!cards[5][index].object) {
      playersPos.column = index
      break
    }
  }
  return { cards, playersPos, enemies }
}

export default function Game() {
  const [shrimpCount, setShrimpCount] = useState(5)
  const [cards, setCards] = useState<Card[][]>([])
  const [enemies, setEnemies] = useState<{ [player in Player]: Enemy[] }>({ barco: [], sol: [] })
  const [playersPos, setPlayersPos] = useState<Position>({ column: 0, row: 5 })
  const [turn, setTurn] = useState<Player>("barco")
  const [currentEnemy, setCurrentEnemy] = useState<Enemy>()
  const [gameState, setGameState] = useState<"draw" | "place" | "move" | "lost" | "win">("draw")
  const [freedCount, setFreedCount] = useState(0)

  useEffect(() => {
    if (shrimpCount <= 0) setGameState("lost")
  }, [shrimpCount])

  useEffect(() => {
    if (freedCount >= 8) setGameState((currentState) => currentState !== "lost" ? "win" : currentState)
  }, [freedCount])

  function handleDrawEnemy() {
    const nextEnemy = enemies[turn].pop()
    setCurrentEnemy(nextEnemy)
    setGameState(nextEnemy ? "place" : "lost")
  }

  function handleNewGame() {
    const { cards, enemies, playersPos } = generateBoard()
    setCards(cards)
    setEnemies(enemies)
    setPlayersPos(playersPos)
    setGameState("draw")
    setShrimpCount(5)
    setTurn("barco")
    setCurrentEnemy(undefined)
    setFreedCount(0)
  }

  function eatShrimp(amount: number) {
    setShrimpCount((currentCount) => {
      const newCount = currentCount - amount
      if (newCount < 0) return 0
      return newCount
    })
  }

  function placeEnemy(row: number, column: number) {
    if (!currentEnemy) return
    cards[row][column].enemy = { isLobster: currentEnemy.isLobster, player: turn, row }
    if ((playersPos.row === row) && (playersPos.column === column)) {
      eatShrimp(1)
    }
    setGameState("move")
    setCurrentEnemy(undefined)
  }

  function movePlayer(row: number, column: number) {
    const card = cards[row][column]
    if (pathHasEnemy(cards, playersPos, { row, column })) {
      eatShrimp(1)
    }
    if (card.object) {
      if (!card.object.revealed) {
        card.object.revealed = true
        if (card.object.enemy) {
          enemies[card.object.enemy.player].pop()
          eatShrimp(2)
        } else {
          setFreedCount((current) => current + 1)
        }
      }
    }
    setPlayersPos({ column, row })
    setTurn((current) => current === "barco" ? "sol" : "barco")
    setGameState("draw")
  }

  if (!cards.length) return (
    <div className="new-game">
      <button type="button" className="btn" onClick={handleNewGame}>
        New Game
      </button>
    </div>
  )

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
            🦐 x {shrimpCount}
          </span>
        </span>
      </header>
      <div className="board-wrapper">
        <ol className="objects">
          {cards.map((row, rowIndex) => row.map((card, cardIndex) => {
            if ((!card.object) || (!card.object.enemy) || (card.object.revealed)) return null
            return (
              <li key={`object-${rowIndex}-${cardIndex}`}>
                <span className={`card btn card--enemy-${card.object.enemy.player}`}>
                  <ObjectComponent object={card.object} />
                </span>
              </li>
            )
          }))}
        </ol>
        <ol className="board">
          {cards.map((row, rowIndex) => row.map((card, cardIndex) => {
            const hasPlayer = playersPos.column === cardIndex && playersPos.row === rowIndex
            const hasEnemy = card.enemy?.player || card.object?.revealed && card.object?.enemy?.player
            let onClickHandler = undefined
            if ((currentEnemy?.row === rowIndex) && (!card.object) && (!card.enemy)) {
              onClickHandler = () => placeEnemy(rowIndex, cardIndex)
            } else if (gameState === "move") {
              if (turn === "barco") {
                if ((playersPos.column === cardIndex)) onClickHandler = () => movePlayer(rowIndex, cardIndex)
              } else {
                if ((playersPos.row === rowIndex)) onClickHandler = () => movePlayer(rowIndex, cardIndex)
              }
            }
            return (
              <li key={`${rowIndex}-${cardIndex}`}>
                <button type="button" className={`card btn ${hasPlayer ? "card--player" : ""} ${hasEnemy ? `card--enemy-${hasEnemy}` : ""} ${card.object ? "card--object" : ""}`} onClick={onClickHandler}>
                  {card.object && <ObjectComponent object={card.object} />}
                  {card.enemy && <EnemyComponent enemy={card.enemy} />}
                  {hasPlayer && (<span className={`players players--${turn}`}>{playersIcon}</span>)}
                </button>
              </li>
            )
          }))}
        </ol>
        <ol className="enemy-rows">
          {[0,1,2,3,4,5].map((row) => (
            <li key={row}>
              {currentEnemy && currentEnemy.row === row && (
                <span className={`card btn card--enemy-${currentEnemy.player}`}>
                  <EnemyComponent enemy={currentEnemy} />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="game-actions">
        {gameState === "lost" && (
          <button type="button" className="btn" onClick={handleNewGame}>
            Lost - New Game?
          </button>
        )}
        {gameState === "win" && (
          <button type="button" className="btn" onClick={handleNewGame}>
            Win! - New Game?
          </button>
        )}
        {gameState === "draw" && (
          <button type="button" className="btn" onClick={handleDrawEnemy}>
            Draw Enemy
          </button>
        )}
      </div>
    </>
  )
}