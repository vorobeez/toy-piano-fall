import type { Sizes } from "../../ports/sizes";
import { StateDispatcher } from "../../ports/StateDispatcher";

const INITIAL_STATE: Sizes = {
  width: 0,
  height: 0,
  pixelRatio: 0,
  aspectRatio: 0,
};

export class SizesDispatcher extends StateDispatcher<Sizes> {
  constructor() {
    super(INITIAL_STATE);
    this.update({
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    });

    window.addEventListener("resize", () => {
      this.update({
        width: window.innerWidth,
        height: window.innerHeight,
        aspectRatio: window.innerWidth / window.innerHeight,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
      });
    });
  }
}
