import { Card } from "./Card"
import { Enemy } from "./Enemy"
import { GameState } from "./GameState"
import { Player } from "./Player"
import { Position } from "./Position"

export type Board = {
  cards: Card[][]
  playersPos: Position
  enemies: { barco: Enemy[], sol: Enemy[] }
  gameState: GameState
  shrimpCount: number
  turn: Player
  currentEnemy?: Enemy
  freedCount: number
}

export type PlayerBoard = {
  character: Player
  cards: Card[][]
  playersPos: Position
  forbiddenObjects: Position[]
  gameState: GameState
  shrimpCount: number
  turn: Player
  currentEnemy?: Enemy
  freedCount: number
}