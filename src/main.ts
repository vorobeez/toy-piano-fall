import { ThreeJSRenderer } from "./adapters/threejs/ThreeJSRenderer";
import { MouseDispatcher } from "./adapters/web/MouseDispatcher";
import { SizesDispatcher } from "./adapters/web/SizesDispatcher";

export const main = () => {
  const canvas = document.createElement("canvas");
  document.body.prepend(canvas);

  const sizesDispatcher = new SizesDispatcher();
  const mouseDispatcher = new MouseDispatcher(sizesDispatcher);
  const renderer = new ThreeJSRenderer(canvas, sizesDispatcher.sizes);

  sizesDispatcher.addListener((sizes) => {
    renderer.updateSizes(sizes);
  });

  mouseDispatcher.addListener((mouse) => {
    console.log(mouse);
  });

  renderer.startAnimationLoop();
};

main();
