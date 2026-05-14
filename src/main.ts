import { ThreeJSRenderer } from "./entrypoints/threejs/ThreeJSRenderer";
import { MouseDispatcher } from "./adapters/web/MouseDispatcher";
import { SizesDispatcher } from "./adapters/web/SizesDispatcher";
import { TonePianoAudio } from "./adapters/tone/TonePianoAudio";
import { RandomWalkStrategy } from "./adapters/tone/RandomWalkStrategy";
import { ToneBackgroundAudio } from "./adapters/tone/ToneBackgroundAudio";
import { WorldService } from "./services/world/WorldService";

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

  const backgroundNotesStrategy = new RandomWalkStrategy();
  const backgroundAudio = new ToneBackgroundAudio(backgroundNotesStrategy);

  await backgroundAudio.start();

  //backgroundAudio.runLoop();

  const pianoAudio = new TonePianoAudio();

  const sizesDispatcher = new SizesDispatcher();
  const mouseDispatcher = new MouseDispatcher(sizesDispatcher);

  const worldService = new WorldService(
    sizesDispatcher,
    mouseDispatcher,
    pianoAudio,
  );

  await worldService.load();

  const renderer = new ThreeJSRenderer(
    canvas,
    sizesDispatcher,
    worldService,
    worldService.getScene(),
    worldService.getCamera(),
  );

  sizesDispatcher.addListener((sizes) => {
    renderer.updateSizes(sizes);
  });

  window.addEventListener("mousedown", () => {
    worldService.handleMouseDown();
  });

  window.addEventListener("mouseup", () => {
    worldService.handleMouseUp();
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
