import type { Mouse } from "../../ports/mouse";
import { StateDispatcher } from "../../ports/StateDispatcher";
import type { Repository } from "../../ports/Repository";
import type { Sizes } from "../../ports/sizes";

const INITIAL_STATE: Mouse = {
  x: 0,
  y: 0,
};

export class MouseDispatcher extends StateDispatcher<Mouse> {
  constructor(sizesRepository: Repository<Sizes>) {
    super(INITIAL_STATE);

    window.addEventListener("mousemove", (event) => {
      const sizes = sizesRepository.getState();
      this.update({
        // right === 1
        // left === -1
        x: (2 * event.clientX) / sizes.width - 1,
        // top === 1
        // bottom === -1
        y: -((2 * event.clientY) / sizes.height - 1),
      });
    });
  }
}
