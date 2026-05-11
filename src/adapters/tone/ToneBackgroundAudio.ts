import * as Tone from "tone";
import type { NextNoteStrategy, LoopedAudio } from "../../ports/Audio";

const SYNTHS = [
  { volume: -8, detune: 0 },
  { volume: -11, detune: 10 },
  { volume: -14, detune: -15 },
] as const;

const NOTE_DURATION: Tone.Unit.Time = "2n";

export class ToneBackgroundAudio implements LoopedAudio {
  private nextNoteStrategy: NextNoteStrategy;
  private sequence: Tone.Loop | undefined = undefined;

  constructor(nextNoteStrategy: NextNoteStrategy) {
    this.nextNoteStrategy = nextNoteStrategy;
  }

  async start() {
    await Tone.start();

    const reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0.8,
      preDelay: 0.05,
    }).toDestination();

    const master = new Tone.Channel({ volume: -15 }).connect(reverb);
    const filter = new Tone.Filter({
      type: "lowpass",
      frequency: 400,
    }).connect(master);
    const mix = new Tone.Channel({ volume: 0 }).connect(filter);

    const sawtoothSynths = SYNTHS.map(({ volume, detune }) => {
      const channel = new Tone.Channel({ volume }).connect(mix);
      const synth = new Tone.Synth({
        oscillator: {
          type: "sawtooth",
        },
        detune,
        envelope: {
          attack: 1,
          decay: 0.7,
          sustain: 0.5,
          release: 0.5,
        },
      });

      synth.connect(channel);

      return synth;
    });

    this.sequence = new Tone.Loop((time) => {
      const note = this.nextNoteStrategy.getNextNote();

      const octave = Tone.Frequency(note).transpose(12).toNote();
      const fourth = Tone.Frequency(note).transpose(5).toNote();

      [note, fourth, octave].forEach((n, i) => {
        sawtoothSynths[i].triggerAttackRelease(n, NOTE_DURATION, time);
      });
    }, NOTE_DURATION);
  }

  runLoop() {
    if (!this.sequence) {
      throw new Error("run start before running loop");
    }

    const transport = Tone.getTransport();
    transport.bpm.value = 50;
    this.sequence.start(0);
    transport.start();
  }
}
