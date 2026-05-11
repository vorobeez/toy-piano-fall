import { NOTES, type Note } from "../domains/PianoModel";

export interface PianoAudio {
  start(): Promise<void>;
  triggerNote(note: Note): void;
}
