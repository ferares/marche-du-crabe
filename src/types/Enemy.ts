import { type Player } from "./Player"

export type Enemy = {
  isLobster: boolean
  player: Player
  row: number
}