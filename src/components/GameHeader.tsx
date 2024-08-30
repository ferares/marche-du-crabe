"use client"

import { useTranslations } from "next-intl"

import { type PlayerBoard } from "@/types/Board"

import { enemyIcons, forbiddenObjectsIcon, objectRevealedIcon, shrimpIcon } from "@/helpers/game"

interface GameHeaderProps { board: PlayerBoard }

export default function GameHeader({ board }: GameHeaderProps) {
  const t = useTranslations()
  const { turn, character, gameState, freedCount, enemyCount, shrimpCount, forbiddenObjects, cards } = board
  const forbiddenObjectsIcons = forbiddenObjects.map((position) => {
    const card = cards[position.row][position.column]
    return card.object?.icon
  })
  return (
    <header className="game-header">
      <h2 className="turn-title" role="status">
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
          <span>
            <span>
              {enemyIcons.lobster}
            </span>
            <span>
              {enemyIcons.octopus}
            </span>
          </span>
          &nbsp;x {enemyCount}
        </span>
        <span className="counts counts--objects" title={t("Messages.object-enemy")}>
          {forbiddenObjectsIcon} = {forbiddenObjectsIcons[0]}&nbsp;{forbiddenObjectsIcons[1]}
        </span>
      </span>
    </header>
  )
}