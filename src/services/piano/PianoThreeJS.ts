import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { type KeyName, type PianoState } from "../../domains/PianoModel";
import { PianoKeyThreeJS } from "./PianoKeyThreeJS";

type KeyMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

export class PianoThreeJS {
  public keyMeshes: KeyMesh[];
  private keys: Record<KeyName, PianoKeyThreeJS>;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.keys = {};
    this.keyMeshes = [];
    this.scene = scene;
  }

  async load() {
    const gltfLoader = new GLTFLoader();

    const pianoGltf = await gltfLoader.loadAsync("/models/toy-piano.glb");
    const pianoObj = pianoGltf.scene.getObjectByName("Piano");

    if (!pianoObj) {
      throw new Error("Piano object hasn't found");
    }

    pianoObj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    pianoObj.rotation.y = -Math.PI / 2;

    this.keyMeshes =
      pianoObj
        .getObjectByName("Keys")
        ?.children.filter<KeyMesh>((key) => key instanceof THREE.Mesh) ?? [];

    this.keys = this.keyMeshes.reduce<Record<KeyName, PianoKeyThreeJS>>(
      (acc, keyMesh) => {
        acc[keyMesh.name] = new PianoKeyThreeJS(keyMesh);
        return acc;
      },
      {},
    );

    this.scene.add(pianoObj);
  }

  tick(
    delta: number,
    currentState: PianoState,
    prevState: PianoState | undefined,
  ) {
    // reset keys materials
    const keyArr = Object.values(this.keys);

    keyArr.forEach((key) => {
      key.resetKey();
    });

    if (currentState.activeKey) {
      const key = this.keys[currentState.activeKey];

      if (!key) {
        throw new Error(`Key mesh wasn\'t found: ${currentState.activeKey}`);
      }

      key.highlightKey();

      if (currentState.keyPressed && prevState && !prevState.keyPressed) {
        key.pressKey();
      }

      if (!currentState.keyPressed && prevState && prevState.keyPressed) {
        key.releaseKey();
      }
    }

    if (
      prevState?.activeKey &&
      prevState.activeKey !== currentState.activeKey
    ) {
      const key = this.keys[prevState.activeKey];

      if (!key) {
        throw new Error(`Key mesh wasn\'t found: ${prevState.activeKey}`);
      }

      key.releaseKey();
    }

    keyArr.forEach((key) => {
      key.tick(delta);
    });
  }
}
