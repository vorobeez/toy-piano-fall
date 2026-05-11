import type { NextNoteStrategy } from "../../ports/Audio";

const SCALE = [
  "C2",
  "D2",
  "E2",
  "G2",
  "A2",
  "C3",
  "D3",
  "E3",
  "G3",
  "A3",
  "C4",
];

export class RandomWalkStrategy implements NextNoteStrategy {
  private index = 0;
  // private index = Math.floor(SCALE.length / 2);

  getNextNote(): string {
    let walk = 0;
    const rnd = Math.random();

    if (rnd < 0.4) {
      walk = 1;
    } else if (rnd < 0.9) {
      walk = -1;
    }

    this.index = (SCALE.length + (this.index + walk)) % SCALE.length;

    return SCALE[this.index];
  }
}
