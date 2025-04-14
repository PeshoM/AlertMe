export interface SavedSequence {
  id: string;
  name: string;
  sequence: string[];
  createdAt: number;
}

export interface Combination {
  id: string;
  name: string;
  target: string;
  sequence: string[];
  createdAt: number;
  message?: string;
}
