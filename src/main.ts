import { ThreeJSRenderer } from "./entrypoints/threejs/ThreeJSRenderer";
import { MouseDispatcher } from "./adapters/web/MouseDispatcher";
import { SizesDispatcher } from "./adapters/web/SizesDispatcher";
import { TonePianoAudio } from "./adapters/tone/TonePianoAudio";
import { RandomWalkStrategy } from "./adapters/tone/RandomWalkStrategy";
import { ToneBackgroundAudio } from "./adapters/tone/ToneBackgroundAudio";
import { World } from "./entrypoints/world/World";
import { debugWorld } from "./debug";
import { RapierPhysicsWorld } from "./adapters/rapier/RapierPhysicsWorld";

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

  backgroundAudio.runLoop();

  const pianoAudio = new TonePianoAudio();

  const sizesDispatcher = new SizesDispatcher();
  const mouseDispatcher = new MouseDispatcher(sizesDispatcher);

  const physicsWorld = new RapierPhysicsWorld();

  const world = new World(
    sizesDispatcher,
    mouseDispatcher,
    physicsWorld,
    pianoAudio,
  );

  debugWorld(world);

  await world.load();

  const renderer = new ThreeJSRenderer(
    canvas,
    sizesDispatcher,
    world,
    world.getScene(),
    world.getCamera(),
  );

  sizesDispatcher.addListener((sizes) => {
    renderer.updateSizes(sizes);
  });

  window.addEventListener("mousedown", () => {
    world.handleMouseDown();
  });

  window.addEventListener("mouseup", () => {
    world.handleMouseUp();
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
