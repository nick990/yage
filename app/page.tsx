import GameBookEditor from "@/components/game-book-editor"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Game Book Editor</h1>
        <GameBookEditor />
      </div>
    </main>
  )
}

