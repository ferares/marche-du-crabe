import GameComponent from "@/components/Game"

interface GameProps { params: { code: string } }

export default async function Game({ params: { code } }: GameProps) {
  return (
    <main>
      <GameComponent code={code} />
    </main>
  )
}
