import { viewport } from "@/helpers/game"

import TutorialComponent from "@/components/Tutorial"

export { viewport }

export default async function Tutorial() {
  return (
    <main>
      <TutorialComponent />
    </main>
  )
}
