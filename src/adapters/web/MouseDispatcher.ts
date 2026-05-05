import type { Mouse } from "../../ports/mouse";
import type { SizesDispatcher } from "./SizesDispatcher";
import { Dispatcher } from "../../ports/Dispatcher";

type MouseEventData = {
  mouse: Mouse;
};

type MouseEventListener = (data: MouseEventData["mouse"]) => void;

type EventMap = {
  mouse: MouseEventData;
};

export class MouseDispatcher extends Dispatcher<EventMap, Mouse> {
  mouse: Mouse = {
    x: 0,
    y: 0,
  };

  constructor(sizesDispatcher: SizesDispatcher) {
    super();

    window.addEventListener("mousemove", (event) => {
      this.update({
        // right === 1
        // left === -1
        x: (2 * event.clientX) / sizesDispatcher.sizes.width - 1,
        // top === 1
        // bottom === -1
        y: -((2 * event.clientY) / sizesDispatcher.sizes.height - 1),
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

  addListener(listener: MouseEventListener) {
    this.dispatcher.addEventListener("mouse", ({ mouse }) => listener(mouse));
  }
}
