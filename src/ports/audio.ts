import { type Note } from "../domains/PianosModel";

export interface DiscreteAudio {
  start(): Promise<void>;
  triggerNote(note: Note): void;
}

export interface NextNoteStrategy {
  getNextNote(): string;
}

export interface LoopedAudio {
  start(): Promise<void>;
  runLoop(): void;
}
