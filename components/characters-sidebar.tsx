import { useState } from "react";
import { Character, createCharacter } from "@/models/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Plus, Trash2 } from "lucide-react";

interface CharactersSidebarProps {
  characters: Character[];
  onCharactersChange: (characters: Character[]) => void;
}

export function CharactersSidebar({
  characters,
  onCharactersChange,
}: CharactersSidebarProps) {
  const [newCharacterName, setNewCharacterName] = useState("");

  const handleAddCharacter = () => {
    if (newCharacterName.trim()) {
      const newCharacter = createCharacter(newCharacterName.trim());
      onCharactersChange([...characters, newCharacter]);
      setNewCharacterName("");
    }
  };

  const handleDeleteCharacter = (id: string) => {
    onCharactersChange(characters.filter((char) => char.id !== id));
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;
      onCharactersChange(
        characters.map((char) =>
          char.id === id ? { ...char, image: base64Image } : char
        )
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-64 h-full border-l border-gray-200 p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Personaggi</h2>

      <div className="flex gap-2 mb-4">
        <Input
          value={newCharacterName}
          onChange={(e) => setNewCharacterName(e.target.value)}
          placeholder="Nome personaggio"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddCharacter();
            }
          }}
        />
        <Button onClick={handleAddCharacter} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {characters.map((character) => (
          <div
            key={character.id}
            className="flex items-center gap-2 p-2 border rounded-lg mb-2"
          >
            {character.image ? (
              <img
                src={character.image}
                alt={character.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Image className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <span className="flex-1">{character.name}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id={`image-upload-${character.id}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(character.id, file);
                }
              }}
            />
            <label
              htmlFor={`image-upload-${character.id}`}
              className="cursor-pointer p-1 hover:bg-gray-100 rounded"
            >
              <Image className="h-4 w-4" />
            </label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteCharacter(character.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
