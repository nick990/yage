import { useState } from "react";
import { Character, createCharacter } from "@/models/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Plus, Trash2, X, Pencil } from "lucide-react";

interface CharactersSidebarProps {
  characters: Character[];
  onCharactersChange: (characters: Character[]) => void;
  onClose: () => void;
  onCharacterUpdate?: (
    oldCharacter: Character,
    newCharacter: Character
  ) => void;
  onCharacterDelete?: (deletedCharacter: Character) => void;
}

export function CharactersSidebar({
  characters,
  onCharactersChange,
  onClose,
  onCharacterUpdate,
  onCharacterDelete,
}: CharactersSidebarProps) {
  const [newCharacterName, setNewCharacterName] = useState("");
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [editName, setEditName] = useState("");

  const handleAddCharacter = () => {
    if (newCharacterName.trim()) {
      const newCharacter = createCharacter(newCharacterName.trim());
      onCharactersChange([...characters, newCharacter]);
      setNewCharacterName("");
    }
  };

  const handleDeleteCharacter = (id: string) => {
    const character = characters.find((char) => char.id === id);
    if (!character) return;

    if (
      window.confirm(
        `Are you sure you want to delete the character "${character.name}"?`
      )
    ) {
      onCharactersChange(characters.filter((char) => char.id !== id));
      if (editingCharacter?.id === id) {
        setEditingCharacter(null);
      }
      if (onCharacterDelete) {
        onCharacterDelete(character);
      }
    }
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;
      const oldCharacter = characters.find((char) => char.id === id);
      const newCharacter = { ...oldCharacter!, image: base64Image };

      onCharactersChange(
        characters.map((char) => (char.id === id ? newCharacter : char))
      );

      if (onCharacterUpdate && oldCharacter) {
        onCharacterUpdate(oldCharacter, newCharacter);
      }
    };
    reader.readAsDataURL(file);
  };

  const startEditing = (character: Character) => {
    setEditingCharacter(character);
    setEditName(character.name);
  };

  const saveEditing = () => {
    if (editingCharacter && editName.trim()) {
      const newCharacter = { ...editingCharacter, name: editName.trim() };

      onCharactersChange(
        characters.map((char) =>
          char.id === editingCharacter.id ? newCharacter : char
        )
      );

      if (onCharacterUpdate) {
        onCharacterUpdate(editingCharacter, newCharacter);
      }

      setEditingCharacter(null);
      setEditName("");
    }
  };

  const cancelEditing = () => {
    setEditingCharacter(null);
    setEditName("");
  };

  return (
    <div className="w-64 h-full border-l border-slate-200 flex flex-col flex-shrink-0">
      <div className="flex-none p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-800">Characters</h3>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-2 mb-4">
          <Input
            value={newCharacterName}
            onChange={(e) => setNewCharacterName(e.target.value)}
            placeholder="Name"
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

        <div className="space-y-3">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`flex items-center gap-2 p-2 border rounded-lg ${
                editingCharacter?.id === character.id
                  ? "border-red-200 bg-red-50"
                  : ""
              }`}
            >
              {editingCharacter?.id === character.id ? (
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {character.image ? (
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-14 h-14 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-gray-200 flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name"
                      className="flex-1 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={cancelEditing}
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-800"
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={saveEditing}
                      variant="default"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Salva
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 w-full">
                    {character.image ? (
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm break-words leading-tight whitespace-normal">
                        {character.name}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
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
                          className="cursor-pointer p-0.5 hover:bg-gray-100 rounded"
                        >
                          <Image className="h-3.5 w-3.5" />
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(character)}
                          className="h-6 w-6"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCharacter(character.id)}
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
