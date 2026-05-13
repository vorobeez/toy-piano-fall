import * as THREE from "three";
import type { Renderable } from "../../ports/Renderable";

const TEXTURE_REPEAT = 1;

export class FloorThreeJS implements Renderable {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  async load() {
    const textureLoader = new THREE.TextureLoader();

    const colorTexture = await textureLoader.loadAsync(
      "/textures/crepe_georgette_diff_1k.jpg",
    );
    const armTexture = await textureLoader.loadAsync(
      "/textures/crepe_georgette_arm_1k.jpg",
    );
    const dispTexture = await textureLoader.loadAsync(
      "/textures/crepe_georgette_disp_1k.jpg",
    );
    const normalTexture = await textureLoader.loadAsync(
      "/textures/crepe_georgette_nor_gl_1k.jpg",
    );

    colorTexture.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
    colorTexture.wrapT = THREE.RepeatWrapping;
    colorTexture.wrapS = THREE.RepeatWrapping;
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    colorTexture.anisotropy = 1;
    colorTexture.magFilter = THREE.NearestFilter;
    colorTexture.minFilter = THREE.LinearMipmapLinearFilter;

    armTexture.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
    armTexture.wrapT = THREE.RepeatWrapping;
    armTexture.wrapS = THREE.RepeatWrapping;

    dispTexture.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
    dispTexture.wrapT = THREE.RepeatWrapping;
    dispTexture.wrapS = THREE.RepeatWrapping;

    normalTexture.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.wrapS = THREE.RepeatWrapping;

    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30, 100, 100),
      new THREE.MeshStandardMaterial({
        map: colorTexture,
        displacementMap: dispTexture,
        displacementScale: 0.3,
        displacementBias: -0.1,
        normalMap: normalTexture,
        aoMap: armTexture,
        roughnessMap: armTexture,
        metalnessMap: armTexture,
        color: "#308528",
      }),
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    floorMesh.castShadow = true;

    this.scene.add(floorMesh);
  }

  tick() {}
}
