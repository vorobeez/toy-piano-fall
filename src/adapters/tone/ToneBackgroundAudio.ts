import * as Tone from "tone";
import type { NextNoteStrategy } from "../../ports/audio";

const SYNTHS = [
  { volume: -8, detune: 0 },
  { volume: -11, detune: -11 },
  { volume: -11, detune: 10 },
  { volume: -14, detune: -20 },
] as const;

const NOTE_DURATION: Tone.Unit.Time = "2n";

export class ToneBackgroundAudio {
  private nextNoteStrategy: NextNoteStrategy;
  private sequence: Tone.Loop;

  constructor(nextNoteStrategy: NextNoteStrategy) {
    this.nextNoteStrategy = nextNoteStrategy;

    const reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0.5,
      preDelay: 0.05,
    }).toDestination();

    const master = new Tone.Channel({ volume: -15 }).connect(reverb);
    const filter = new Tone.Filter({
      type: "bandpass",
      frequency: 600,
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
          attack: 0.1,
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

      const third = Tone.Frequency(note).transpose(4).toNote();
      const fifth = Tone.Frequency(note).transpose(7).toNote();
      const octave = Tone.Frequency(note).transpose(12).toNote();

      [note, third, fifth, octave].forEach((n, i) => {
        sawtoothSynths[i].triggerAttackRelease(
          n,
          NOTE_DURATION,
          time + i * 0.2,
        );
      });
    }, NOTE_DURATION);
  }

  runSequence() {
    const now = Tone.now();

    this.sequence.start(now);
  }
}
