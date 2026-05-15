import * as Tone from "tone";
import type { Note } from "../../domains/PianosModel";

const NOTE_DURATION: Tone.Unit.Time = "16n";

export class TonePianoAudio {
  private leadToneSynth: Tone.MonoSynth;
  private bellSynth: Tone.FMSynth;
  private noiseSynth: Tone.NoiseSynth;

  constructor() {
    const reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.7,
      preDelay: 0.05,
    }).toDestination();

    const master = new Tone.Channel({ volume: -4 }).connect(reverb);

    const leadToneChannel = new Tone.Channel({ volume: -2 }).connect(master);
    const bellChannel = new Tone.Channel({ volume: -4 }).connect(master);
    const noiseChannel = new Tone.Channel({ volume: 0 }).connect(master);

    this.leadToneSynth = new Tone.MonoSynth({
      oscillator: {
        type: "sawtooth",
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.14,
      },
      filter: {
        type: "lowpass",
        frequency: 500,
      },
    });

    this.bellSynth = new Tone.FMSynth({
      harmonicity: 10,
      modulationIndex: 100,
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.1,
        release: 0.3,
      },
      modulation: {
        type: "sawtooth",
      },
    });

    const noiseFilter = new Tone.Filter({
      type: "lowpass",
      frequency: 200,
    });

    noiseFilter.connect(noiseChannel);

    this.noiseSynth = new Tone.NoiseSynth({
      noise: {
        type: "pink",
      },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.1,
        release: 0.01,
      },
    });

    this.leadToneSynth.connect(leadToneChannel);
    this.bellSynth.connect(bellChannel);
    this.noiseSynth.connect(noiseFilter);
  }

  triggerNote(note: Note) {
    const now = Tone.now();

    this.leadToneSynth.triggerAttackRelease(note, NOTE_DURATION, now);
    this.bellSynth?.triggerAttackRelease(note, NOTE_DURATION, now);
    this.noiseSynth?.triggerAttackRelease(NOTE_DURATION, now);
  }
}
