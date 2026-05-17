import { type Note } from "../domains/PianosModel";

export interface NextNoteStrategy {
  getNextNote(): string;
}

export interface AudioWorld {
  start(): Promise<void>;
  triggerNote(note: Note, pan: number): void;
  triggerCollisionAudio(pan: number, vol: number): void;
  runBackgroundAudio(): void;
}
