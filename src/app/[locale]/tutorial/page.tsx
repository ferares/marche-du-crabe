import { getTutorialBoard } from "@/helpers/game"

import TutorialComponent from "@/components/Tutorial"

export default async function Tutorial() {
  const board = getTutorialBoard()
  return (
    <main>
      <TutorialComponent board={board} />
    </main>
  )
}
