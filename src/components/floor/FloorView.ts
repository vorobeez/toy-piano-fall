import * as THREE from "three";
import type { Loadable, View, PlaneParameters } from "../../ports/view";

const TEXTURE_REPEAT = 1;

export class FloorView implements View, Loadable {
  private rootMesh: THREE.Mesh | undefined = undefined;
  private parameters: PlaneParameters;

  constructor(parameters: PlaneParameters) {
    this.parameters = parameters;
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

    this.rootMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(
        this.parameters.width,
        this.parameters.height,
        100,
        100,
      ),
      new THREE.MeshStandardMaterial({
        map: colorTexture,
        displacementMap: dispTexture,
        displacementScale: 0.2,
        displacementBias: -0.1,
        normalMap: normalTexture,
        aoMap: armTexture,
        roughnessMap: armTexture,
        metalnessMap: armTexture,
        color: "#308528",
      }),
    );
    this.rootMesh.rotation.x = -Math.PI / 2;
    this.rootMesh.receiveShadow = true;
    this.rootMesh.castShadow = true;
  }

  getRootMesh(): THREE.Object3D {
    if (!this.rootMesh) {
      throw new Error("View isn't loaded");
    }

    return this.rootMesh;
  }
}
