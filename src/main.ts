import { ThreeJSRenderer } from "./adapters/threejs/ThreeJSRenderer";
import { SizesDispatcher } from "./adapters/web/SizesDispatcher";

export const main = () => {
  const canvas = document.createElement("canvas");
  document.body.prepend(canvas);

  const sizesDispatcher = new SizesDispatcher();
  const renderer = new ThreeJSRenderer(canvas, sizesDispatcher.sizes);

  sizesDispatcher.addResizeListener((sizes) => {
    renderer.updateSizes(sizes);
  });

  renderer.startAnimationLoop();
};

main();
