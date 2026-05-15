import { ThreeJSRenderer } from "./entrypoints/threejs/ThreeJSRenderer";
import { MouseDispatcher } from "./adapters/web/MouseDispatcher";
import { SizesDispatcher } from "./adapters/web/SizesDispatcher";
import { World } from "./entrypoints/world/World";
import { debugWorld } from "./debug";
import { RapierPhysicsWorld } from "./adapters/rapier/RapierPhysicsWorld";
import { ToneAudioWorld } from "./adapters/tone/ToneAudioWorld";

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

  const sizesDispatcher = new SizesDispatcher();
  const mouseDispatcher = new MouseDispatcher(sizesDispatcher);

  const audioWorld = new ToneAudioWorld();

  await audioWorld.start();

  const physicsWorld = new RapierPhysicsWorld();

  const world = new World(
    sizesDispatcher,
    mouseDispatcher,
    physicsWorld,
    audioWorld,
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
  audioWorld.runBackgroundAudio();
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
