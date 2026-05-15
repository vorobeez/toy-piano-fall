import * as THREE from "three";

import { gui } from "../../debug";

export const debugRenderer = (renderer: THREE.WebGLRenderer) => {
  const rendererFolder = gui.addFolder("Renderer");

  rendererFolder.add(renderer, "toneMapping", {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  });

  rendererFolder
    .add(renderer, "toneMappingExposure")
    .min(0)
    .max(10)
    .step(0.001);
};

export const debugDirectionalLight = (dirLight: THREE.DirectionalLight) => {
  const dirLightFolder = gui.addFolder("Directional Light");

  dirLightFolder.add(dirLight.position, "x").min(-20).max(20).step(0.001);
  dirLightFolder.add(dirLight.position, "y").min(-20).max(20).step(0.001);
  dirLightFolder.add(dirLight.position, "z").min(-20).max(20).step(0.001);
  dirLightFolder.add(dirLight, "intensity").min(0).max(20).step(0.001);
  dirLightFolder
    .add(dirLight.shadow, "normalBias")
    .min(-0.05)
    .max(0.05)
    .step(0.001);
  dirLightFolder.add(dirLight.shadow, "bias").min(-0.05).max(0.05).step(0.001);
};
