import * as Tone from "tone";
import { PANNNER_DISPOSE_TIMEOUT } from "./constants";
import { pickRandomNotes } from "../../domains/PianosModel";

const NOTE_DURATION: Tone.Unit.Time = "16n";

const MAX_VOLUME = 0;
const MIN_VOLUME = -8;

// [0..1] to db
const getVolume = (vol: number) => {
  return vol * (MAX_VOLUME - MIN_VOLUME) + MIN_VOLUME;
};

export class ToneCollisionAudio {
  private mainNode: Tone.ToneAudioNode;
  private noiseSynth: Tone.NoiseSynth;
  private polySynth: Tone.PolySynth;

  constructor() {
    const limiter = new Tone.Limiter(MAX_VOLUME);

    const reverb = new Tone.Reverb({
      decay: 1,
      wet: 0.5,
      preDelay: 0.05,
    }).connect(limiter);

    const master = new Tone.Channel({ volume: 0 }).connect(reverb);

    const noiseChannel = new Tone.Channel({ volume: 0 }).connect(master);
    const bellsChannel = new Tone.Channel({ volume: -8 }).connect(master);

    const noiseFilter = new Tone.Filter({
      type: "lowpass",
      frequency: 1000,
    });

    noiseFilter.connect(noiseChannel);

    this.noiseSynth = new Tone.NoiseSynth({
      noise: {
        type: "pink",
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.1,
        release: 0.1,
      },
    });

    this.noiseSynth.connect(noiseFilter);

    this.polySynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 10,
      modulationIndex: 50,
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.1,
      },
      modulation: {
        type: "triangle",
      },
    });

    this.polySynth.connect(bellsChannel);

    this.mainNode = limiter;
  }

  trigger(pan: number, vol: number) {
    const now = Tone.now();

    const panner = new Tone.PanVol({
      pan,
      volume: getVolume(vol),
    }).toDestination();

    this.mainNode.connect(panner);

    this.noiseSynth?.triggerAttackRelease(NOTE_DURATION, now);
    this.polySynth?.triggerAttackRelease(
      pickRandomNotes(3),
      NOTE_DURATION,
      now,
    );

    setTimeout(() => {
      panner.dispose();
    }, PANNNER_DISPOSE_TIMEOUT);
  }
}
