import { EventDispatcher } from "three";

type ResizeEventData = {
  sizes: {
    width: number;
    height: number;
    pixelRatio: number;
    aspectRatio: number;
  };
};

type ResizeEventListener = (data: ResizeEventData["sizes"]) => void;

type EventMap = {
  resize: ResizeEventData;
};

export class SizesService {
  width: number = 0;
  height: number = 0;
  pixelRatio: number = 0;
  aspectRatio: number = 0;
  dispatcher: EventDispatcher<EventMap>;

  constructor() {
    this.updateSizes();
    this.dispatcher = new EventDispatcher<EventMap>();

    window.addEventListener("resize", () => {
      this.updateSizes();
      this.dispatchResize();
    });
  }

  private updateSizes() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspectRatio = this.width / this.height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }

  private dispatchResize() {
    this.dispatcher.dispatchEvent({
      type: "resize",
      sizes: {
        width: this.width,
        height: this.height,
        pixelRatio: this.pixelRatio,
        aspectRatio: this.aspectRatio,
      },
    });
  }

  addResizeListener(listener: ResizeEventListener) {
    this.dispatcher.addEventListener("resize", ({ sizes }) => listener(sizes));
  }
}
