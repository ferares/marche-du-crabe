import { Object } from "@/types/Object"

import EnemyComponent from "./Enemy"

const objectRevealedIcon = "🐚"

interface ObjectComponentProps { object: Object }

// TODO: Show hidden enemies with some sort of distinction from regularly placed enemies
export default function ObjectComponent({ object }: ObjectComponentProps) {
  return (
    <span className="object">
      {object.revealed ? (object.enemy ? <EnemyComponent enemy={object.enemy} /> : objectRevealedIcon) : object.icon}
    </span>
  )
}