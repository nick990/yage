export interface Milestone {
  id: string;
  text: string;
  active: boolean;
}

export function createMilestone(text: string): Milestone {
  return {
    id: crypto.randomUUID(),
    text,
    active: false,
  };
}
