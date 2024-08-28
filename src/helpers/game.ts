import { shuffle } from "./array"

import { Board, PlayerBoard } from "../types/Board"
import { Card } from "../types/Card"
import { Enemy } from "../types/Enemy"
import { Player } from "../types/Player"
import { Position } from "../types/Position"
import { GameState } from "../types/GameState"

export const objectRevealedIcon = "🐚"
export const playersIcon = "🦀"
export const shrimpIcon = "🦐"
const objectIcons = ["📠", "🕶️", "🚽", "🩲", "🥫", "⚓", "🛞", "🛹", "🪀", "🛢️", "🎸", "🏐"]

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

function eatShrimp(amount: number, board: Board) {
  board.shrimpCount -= amount
  if (board.shrimpCount < 0) board.shrimpCount = 0
  if (board.shrimpCount === 0) updateGameState("lost", board)
}

function getPlayerCardData(cards: Card[][]): Card[][] {
  return cards.map((row) => row.map((card) => ({
    enemy: card.enemy,
    object: card.object ? {
      icon: card.object.icon,
      enemy: card.object.revealed ? card.object.enemy : undefined,
      revealed: card.object.revealed,
    } : undefined,
  })))
}

function getPlayerForbiddenObjects(player: Player, cards: Card[][]): Position[] {
  const postions: Position[] = []
  for (let row = 0; row < cards.length; row++) {
    const cardRow = cards[row]
    for (let column = 0; column < cardRow.length; column++) {
      const card = cardRow[column]
      if (card.object?.enemy?.player === player) postions.push({ row, column })
    }
  }
  return postions
}

function updateGameState(state: GameState, board: Board) {
  if (["lost", "win"].includes(board.gameState)) return
  board.gameState = state
}

export function generateBoard(): Board {
  const cards: Card[][] = []
  const shuffledObjectIcons = shuffle(objectIcons)
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
        card.object = { icon: shuffledObjectIcons[objectIconIndex], revealed: false }
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
  const gameState = "draw"
  const shrimpCount = 5
  const turn = "barco"
  const currentEnemy = undefined
  const freedCount = 0
  return { cards, playersPos, enemies, gameState, shrimpCount, turn, currentEnemy, freedCount }
}

export function getPlayerBoardData(player: Player, board: Board): PlayerBoard {
  return {
    character: player,
    cards: getPlayerCardData(board.cards),
    playersPos: board.playersPos,
    forbiddenObjects: getPlayerForbiddenObjects(player, board.cards),
    gameState: board.gameState,
    shrimpCount: board.shrimpCount,
    turn: board.turn,
    currentEnemy: board.currentEnemy,
    freedCount: board.freedCount,
  }
}

export function drawEnemy(board: Board) {
  board.currentEnemy = board.enemies[board.turn].pop()
  updateGameState(board.currentEnemy ? "place" : "lost", board)
}

export function placeEnemy(row: number, column: number, board: Board) {
  if (!board.currentEnemy) return
  board.cards[row][column].enemy = { isLobster: board.currentEnemy.isLobster, player: board.turn, row }
  if ((board.playersPos.row === row) && (board.playersPos.column === column)) {
    eatShrimp(1, board)
  }
  board.currentEnemy = undefined
  updateGameState("move", board)
}

export function movePlayer(row: number, column: number, board: Board) {
  const card = board.cards[row][column]
  if (pathHasEnemy(board.cards, board.playersPos, { row, column })) {
    eatShrimp(1, board)
  }
  if (card.object) {
    if (!card.object.revealed) {
      card.object.revealed = true
      if (card.object.enemy) {
        board.enemies[card.object.enemy.player].pop()
        eatShrimp(2, board)
      } else {
        board.freedCount += 1
        if (board.freedCount === 8) {
          updateGameState("win", board)
        }
      }
    }
  }
  board.playersPos = { column, row }
  board.turn = board.turn === "barco" ? "sol" : "barco"
  updateGameState("draw", board)
}