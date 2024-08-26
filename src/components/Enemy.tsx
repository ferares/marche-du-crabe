import { Enemy } from "@/types/Enemy"

const enemyIcons = { lobster: "🦞", octopus: "🐙" }

interface EnemyComponentProps { enemy: Enemy }

export default function EnemyComponent({ enemy }: EnemyComponentProps) {
  return (
    <span className={`enemy enemy--${enemy.player}`}>
      {enemy.isLobster ? enemyIcons.lobster : enemyIcons.octopus}
    </span>
  )
}