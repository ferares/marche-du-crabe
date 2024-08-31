import { getTutorialBoard, viewport } from "@/helpers/game"

import TutorialComponent from "@/components/Tutorial"

export { viewport }

export default async function Tutorial() {
  const board = getTutorialBoard()
  return (
    <main>
      <TutorialComponent board={board} />
    </main>
  )
}
