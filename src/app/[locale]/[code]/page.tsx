import { viewport } from "@/helpers/game"

import GameComponent from "@/components/Game"

export { viewport }

interface GameProps { params: { code: string } }
export default async function Game({ params: { code } }: GameProps) {
  return (
    <main>
      <GameComponent code={code} />
    </main>
  )
}
