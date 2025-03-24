import GameBookEditor from "@/components/game-book-editor";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="w-full">
        <h1 className="mb-6 text-3xl font-bold">YAGE</h1>
        <GameBookEditor />
      </div>
    </main>
  );
}
