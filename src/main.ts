import { ThreeJSRenderer } from "./adapters/threejs/ThreeJSRenderer";
import { MouseDispatcher } from "./adapters/web/MouseDispatcher";
import { SizesDispatcher } from "./adapters/web/SizesDispatcher";

export const main = () => {
  const canvas = document.createElement("canvas");
  document.body.prepend(canvas);

  const sizesDispatcher = new SizesDispatcher();
  const mouseDispatcher = new MouseDispatcher(sizesDispatcher);
  const renderer = new ThreeJSRenderer(
    canvas,
    sizesDispatcher,
    mouseDispatcher,
  );

  sizesDispatcher.addListener((sizes) => {
    renderer.updateSizes(sizes);
  });

  renderer.startLoop();
};

main();
