import Board from "@/components/Board"

interface GameProps { params: { code: string } }

export default async function Game({ params: { code } }: GameProps) {
  return (
    <main className="main-content">
      <Board code={code} />
    </main>
  )
}
