import type { Mouse } from "../../ports/mouse";
import { Dispatcher } from "../../ports/Dispatcher";
import type { Repository } from "../../ports/Repository";
import type { Sizes } from "../../ports/sizes";

type MouseEventData = {
  mouse: Mouse;
};

type MouseEventListener = (data: MouseEventData["mouse"]) => void;

type EventMap = {
  mouse: MouseEventData;
};

export class MouseDispatcher
  extends Dispatcher<EventMap, Mouse>
  implements Repository<Mouse>
{
  private mouse: Mouse = {
    x: 0,
    y: 0,
  };

  constructor(sizesRepository: Repository<Sizes>) {
    super();

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
      this.dispatch();
    });
  }

  protected update(mouse: Mouse) {
    this.mouse = mouse;
  }

  protected dispatch() {
    this.dispatcher.dispatchEvent({
      type: "mouse",
      mouse: this.mouse,
    });
  }

  getState(): Mouse {
    return this.mouse;
  }

  addListener(listener: MouseEventListener) {
    this.dispatcher.addEventListener("mouse", ({ mouse }) => listener(mouse));
  }
}
