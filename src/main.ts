import * as THREE from "three";
import { SizesService } from "./services/SizesService";

export const main = () => {
  const canvas = document.createElement("canvas");
  document.body.prepend(canvas);

  const sizesService = new SizesService();

  const renderer = new THREE.WebGLRenderer({
    canvas,
  });

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    sizesService.aspectRatio,
    0.1,
    100,
  );
  camera.position.set(4, 5, 4);
  scene.add(camera);

  renderer.setSize(sizesService.width, sizesService.height);
  renderer.setPixelRatio(sizesService.pixelRatio);

  sizesService.addResizeListener(
    ({ width, height, pixelRatio, aspectRatio }) => {
      renderer.setSize(width, height);
      renderer.setPixelRatio(pixelRatio);
      camera.aspect = aspectRatio;
      camera.updateProjectionMatrix();
    },
  );

  /**
   * Animate
   */
  const tick = () => {
    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
};

main();
