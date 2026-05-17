import * as Tone from "tone";
import type { AudioWorld } from "../../ports/audio";
import { TonePianoAudio } from "./TonePianoAudio";
import { ToneBackgroundAudio } from "./ToneBackgroundAudio";
import { RandomWalkStrategy } from "./RandomWalkStrategy";
import type { Note } from "../../domains/PianosModel";
import { ToneCollisionAudio } from "./ToneCollisionAudio";

export class ToneAudioWorld implements AudioWorld {
  private pianoAudio: TonePianoAudio | undefined = undefined;
  private backgroundAudio: ToneBackgroundAudio | undefined = undefined;
  private collisionAudio: ToneCollisionAudio | undefined = undefined;

  async start() {
    await Tone.start();

    const transport = Tone.getTransport();
    transport.bpm.value = 60;
    transport.start();

    this.pianoAudio = new TonePianoAudio();
    this.backgroundAudio = new ToneBackgroundAudio(new RandomWalkStrategy());
    this.collisionAudio = new ToneCollisionAudio();
  }

  triggerNote(note: Note, pan: number): void {
    if (!this.pianoAudio) {
      throw new Error("Audio world hasn't started");
    }

    this.pianoAudio?.triggerNote(note, pan);
  }

  runBackgroundAudio(): void {
    if (!this.backgroundAudio) {
      throw new Error("Audio world hasn't started");
    }

    this.backgroundAudio.runSequence();
  }

  triggerCollisionAudio(pan: number, vol: number): void {
    if (!this.collisionAudio || !this.pianoAudio) {
      throw new Error("Audio world hasn't started");
    }

    this.collisionAudio.trigger(pan, vol);
  }
}
