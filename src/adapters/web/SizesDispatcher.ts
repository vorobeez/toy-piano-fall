import type { Sizes } from "../../ports/sizes";
import { Dispatcher } from "../../ports/Dispatcher";

type ResizeEventData = {
  sizes: Sizes;
};

type ResizeEventListener = (data: ResizeEventData["sizes"]) => void;

type EventMap = {
  resize: ResizeEventData;
};

export class SizesDispatcher extends Dispatcher<EventMap, Sizes> {
  sizes: Sizes = {
    width: 0,
    height: 0,
    pixelRatio: 0,
    aspectRatio: 0,
  };

  constructor() {
    super();
    this.update();

    window.addEventListener("resize", () => {
      this.update();
      this.dispatch();
    });
  }

  protected update() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };
  }

  protected dispatch() {
    this.dispatcher.dispatchEvent({
      type: "resize",
      sizes: this.sizes,
    });
  }

  addListener(listener: ResizeEventListener) {
    this.dispatcher.addEventListener("resize", ({ sizes }) => listener(sizes));
  }
}
