import { ThreeJSRenderer } from "./entrypoints/threejs/ThreeJSRenderer";
import { MouseDispatcher } from "./adapters/web/MouseDispatcher";
import { SizesDispatcher } from "./adapters/web/SizesDispatcher";
import { PianoService } from "./services/piano/PianoService";

export const main = async () => {
  const canvas = document.createElement("canvas");
  document.body.prepend(canvas);

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

main();
