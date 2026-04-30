import { EventDispatcher } from "three";
import type { Sizes } from "../../ports/sizes";

type ResizeEventData = {
  sizes: Sizes;
};

type ResizeEventListener = (data: ResizeEventData["sizes"]) => void;

type EventMap = {
  resize: ResizeEventData;
};

export class SizesDispatcher {
  private dispatcher: EventDispatcher<EventMap>;

  sizes: Sizes = {
    width: 0,
    height: 0,
    pixelRatio: 0,
    aspectRatio: 0,
  };

  constructor() {
    this.updateSizes();
    this.dispatcher = new EventDispatcher<EventMap>();

    window.addEventListener("resize", () => {
      this.updateSizes();
      this.dispatchResize();
    });
  }

  private updateSizes() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };
  }

  private dispatchResize() {
    this.dispatcher.dispatchEvent({
      type: "resize",
      sizes: this.sizes,
    });
  }

  addResizeListener(listener: ResizeEventListener) {
    this.dispatcher.addEventListener("resize", ({ sizes }) => listener(sizes));
  }
}
