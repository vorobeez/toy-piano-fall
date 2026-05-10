import * as THREE from "three";

import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  BLACK_KEYS,
  isWhiteKey,
  KEY_PREFIX,
  WHITE_KEYS,
  type PianoState,
} from "../../domains/PianoModel";

const HIGHLIGHT_COLOR = "#E78E04";

type KeyMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

export class PianoThreeJS {
  private pianoGltf: GLTF | undefined = undefined;
  private whiteKeyMaterial: THREE.MeshStandardMaterial | undefined;
  private whiteKeyMaterialHighlighted: THREE.MeshStandardMaterial | undefined;
  private blackKeyMaterial: THREE.MeshStandardMaterial | undefined;
  private blackKeyMaterialHighlighted: THREE.MeshStandardMaterial | undefined;
  keys: KeyMesh[];

  constructor(onLoad: (model: THREE.Object3D) => void) {
    this.keys = [];

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

        this.keys =
          this.pianoGltf.scene
            .getObjectByName("Keys")
            ?.children.filter<KeyMesh>((key) => key instanceof THREE.Mesh) ??
          [];

        const whiteKey = this.pianoGltf.scene.getObjectByName(
          `${KEY_PREFIX}${WHITE_KEYS[0]}`,
        );

        if (
          whiteKey &&
          whiteKey instanceof THREE.Mesh &&
          whiteKey.material instanceof THREE.MeshStandardMaterial
        ) {
          this.whiteKeyMaterial = whiteKey.material;
          this.whiteKeyMaterialHighlighted = this.whiteKeyMaterial.clone();
          this.whiteKeyMaterialHighlighted.emissive.set(HIGHLIGHT_COLOR);
        }

        const blackKey = this.pianoGltf.scene.getObjectByName(
          `${KEY_PREFIX}${BLACK_KEYS[0]}`,
        );

        if (
          blackKey &&
          blackKey instanceof THREE.Mesh &&
          blackKey.material instanceof THREE.MeshStandardMaterial
        ) {
          this.blackKeyMaterial = blackKey.material;
          this.blackKeyMaterialHighlighted = this.blackKeyMaterial.clone();
          this.blackKeyMaterialHighlighted.emissive.set(HIGHLIGHT_COLOR);
        }

        onLoad(this.pianoGltf.scene);
      },
      () => {},
      () => {
        throw new Error(`Error on loading piano gltf`);
      },
    );
  }

  tick({ activeKey, keyPressed }: PianoState) {
    this.keys.forEach((key) => {
      if (isWhiteKey(key.name) && this.whiteKeyMaterial) {
        key.material = this.whiteKeyMaterial;
      } else if (this.blackKeyMaterial) {
        key.material = this.blackKeyMaterial;
      }
    });

    if (activeKey) {
      const keyMesh = this.keys.find((key) => key.name === activeKey);

      if (keyMesh) {
        if (isWhiteKey(activeKey) && this.whiteKeyMaterialHighlighted) {
          keyMesh.material = this.whiteKeyMaterialHighlighted;
        } else if (this.blackKeyMaterialHighlighted) {
          keyMesh.material = this.blackKeyMaterialHighlighted;
        }

        if (keyPressed) {
          keyMesh.rotation.z = -Math.PI / 50;
        } else {
          keyMesh.rotation.z = 0;
        }
      }
    }
  }
}
