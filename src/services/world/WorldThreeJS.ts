import * as THREE from "three";
import type { Repository } from "../../ports/Repository";
import type { Sizes } from "../../ports/sizes";
import type { Renderable } from "../../ports/Renderable";

export class WorldThreeJS implements Renderable {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  constructor(sizesRepository: Repository<Sizes>) {
    const sizes = sizesRepository.getState();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
    this.camera.position.set(0, 4, 10);
    this.scene.add(this.camera);

    this.scene.background = new THREE.Color("#010d1a");
  }

  async load() {}
  tick() {}
}
