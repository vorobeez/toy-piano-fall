import { ThreeJSRenderer } from "./entrypoints/threejs/ThreeJSRenderer";
import { MouseDispatcher } from "./adapters/web/MouseDispatcher";
import { SizesDispatcher } from "./adapters/web/SizesDispatcher";
import { PianoService } from "./services/piano/PianoService";

const startScreen = document.querySelector<HTMLElement>(".start-screen");
const startButton = document.querySelector<HTMLButtonElement>(".start-button");
const startButtonLabel = document.querySelector<HTMLElement>(
  ".start-button__label",
);

export const main = async () => {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas.threejs");

  if (!canvas) {
    throw new Error("html canvas hasn't found");
  }

  const pianoService = new PianoService();

  await pianoService.load();

  window.addEventListener("mousedown", () => {
    pianoService.pressKey();
  });

  window.addEventListener("mouseup", () => {
    pianoService.releaseKey();
  });

  const sizesDispatcher = new SizesDispatcher();
  const mouseDispatcher = new MouseDispatcher(sizesDispatcher);

  const renderer = new ThreeJSRenderer(
    canvas,
    sizesDispatcher,
    mouseDispatcher,
    pianoService,
  );

  sizesDispatcher.addListener((sizes) => {
    renderer.updateSizes(sizes);
  });

  renderer.startLoop();
};

startButton?.addEventListener(
  "click",
  async () => {
    startButton.disabled = true;
    startButton.classList.add("start-button--loading");

    if (startButtonLabel) {
      startButtonLabel.textContent = "Loading";
    }

    await main();

    startScreen?.remove();
  },
  { once: true },
);
