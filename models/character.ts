export interface Character {
  id: string;
  name: string;
  image: string | null;
}

export function createCharacter(
  name: string,
  image: string | null = null
): Character {
  return {
    id: crypto.randomUUID(),
    name,
    image,
  };
}
