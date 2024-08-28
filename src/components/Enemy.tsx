import { type Enemy } from "@/types/Enemy"

import { enemyIcons } from "@/helpers/game"

interface EnemyComponentProps { enemy: Enemy }

export default function EnemyComponent({ enemy }: EnemyComponentProps) {
  return (
    <span className={`enemy enemy--${enemy.player}`}>
      {enemy.isLobster ? enemyIcons.lobster : enemyIcons.octopus}
    </span>
  )
}