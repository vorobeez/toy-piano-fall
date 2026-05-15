import * as Tone from "tone";
import type { AudioWorld } from "../../ports/audio";
import { TonePianoAudio } from "./TonePianoAudio";
import { ToneBackgroundAudio } from "./ToneBackgroundAudio";
import { RandomWalkStrategy } from "./RandomWalkStrategy";
import type { Note } from "../../domains/PianosModel";

export class ToneAudioWorld implements AudioWorld {
  private pianoAudio: TonePianoAudio | undefined = undefined;
  private backgroundAudio: ToneBackgroundAudio | undefined = undefined;

  async start() {
    await Tone.start();

    const transport = Tone.getTransport();
    transport.bpm.value = 60;
    transport.start();

    this.pianoAudio = new TonePianoAudio();
    this.backgroundAudio = new ToneBackgroundAudio(new RandomWalkStrategy());
  }

  triggerNote(note: Note): void {
    if (!this.pianoAudio) {
      throw new Error("Audio world hasn't started");
    }

    this.pianoAudio?.triggerNote(note);
  }

  runBackgroundAudio(): void {
    if (!this.backgroundAudio) {
      throw new Error("Audio world hasn't started");
    }

    this.backgroundAudio.runSequence();
  }
}
