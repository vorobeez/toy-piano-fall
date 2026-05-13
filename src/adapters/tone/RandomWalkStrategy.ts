import type { NextNoteStrategy } from "../../ports/Audio";

const SCALE = ["C3", "Db3", "F3", "G3", "Bb3"];

export class RandomWalkStrategy implements NextNoteStrategy {
  private index = Math.floor(SCALE.length / 2);

  getNextNote(): string {
    let walk = 0;
    const rnd = Math.random();

    if (rnd < 0.2) {
      walk = 2;
    } else if (rnd < 0.6) {
      walk = 1;
    } else if (rnd < 0.8) {
      walk = -1;
    } else {
      walk = -2;
    }

    this.index = (SCALE.length + (this.index + walk)) % SCALE.length;

    return SCALE[this.index];
  }
}
