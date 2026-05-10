import * as THREE from "three";

import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { type KeyName, type PianoState } from "../../domains/PianoModel";
import { PianoKeyThreeJS } from "./PianoKeyThreeJS";

type KeyMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

export class PianoThreeJS {
  public keyMeshes: KeyMesh[];
  private pianoGltf: GLTF | undefined = undefined;
  private keys: Record<KeyName, PianoKeyThreeJS>;

  constructor(onLoad: (model: THREE.Object3D) => void) {
    this.keys = {};
    this.keyMeshes = [];

    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      "/models/toy-piano.glb",
      (gltf) => {
        this.pianoGltf = gltf;

        this.pianoGltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.pianoGltf.scene.rotation.y = -Math.PI / 2;

        this.keyMeshes =
          this.pianoGltf.scene
            .getObjectByName("Keys")
            ?.children.filter<KeyMesh>((key) => key instanceof THREE.Mesh) ??
          [];

        this.keys = this.keyMeshes.reduce<Record<KeyName, PianoKeyThreeJS>>(
          (acc, keyMesh) => {
            acc[keyMesh.name] = new PianoKeyThreeJS(keyMesh);
            return acc;
          },
          {},
        );

        onLoad(this.pianoGltf.scene);
      },
      () => {},
      () => {
        throw new Error(`Error on loading piano gltf`);
      },
    );
  }

  tick(delta: number, { activeKey, keyPressed }: PianoState) {
    // reset keys materials
    const keyArr = Object.values(this.keys);

    keyArr.forEach((key) => {
      key.resetKey();
    });

    if (activeKey) {
      const key = this.keys[activeKey];

      if (!key) {
        throw new Error(`Key mesh wasn\'t found: ${activeKey}`);
      }

      key.highlightKey();

      if (keyPressed) {
        key.pressKey();
      } else {
        key.releaseKey();
      }
    }

    keyArr.forEach((key) => {
      key.tick(delta);
    });
  }
}
