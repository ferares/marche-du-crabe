"use client"

import { type Card } from "@/types/Card"
import { type Player } from "@/types/Player"
import { type Position } from "@/types/Position"

import { playersIcon } from "@/helpers/game"

import ObjectComponent from "./Object"
import EnemyComponent from "./Enemy"

interface CardComponentProps { isActive: boolean, card: Card, playersPos: Position, turn: Player, cardPosition: Position, onClick?: () => void }

export default function CardComponent({ isActive, card, turn, playersPos, cardPosition, onClick }: CardComponentProps) {
  const hasPlayer = playersPos.column === cardPosition.column && playersPos.row === cardPosition.row
  const hasEnemy = card.enemy?.player ?? (card.object?.revealed && card.object?.enemy?.player)

  return (
    <button type="button" className={`card btn ${isActive ? "card--active" : ""} ${onClick ? "" : "card--disabled"} ${hasPlayer ? "card--player" : ""} ${hasEnemy ? `card--enemy-${hasEnemy}` : ""} ${card.object ? "card--object" : ""} ${card.object?.revealed ? "card--object-revealed" : ""}`} onClick={onClick}>
      {card.object && <ObjectComponent object={card.object} />}
      {card.enemy && <EnemyComponent enemy={card.enemy} />}
      {hasPlayer && (<span className={`players players--${turn}`}>{playersIcon}</span>)}
    </button>
  )
}