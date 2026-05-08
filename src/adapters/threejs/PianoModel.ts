import * as THREE from "three";

import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";

const HIGHLIGHT_COLOR = "#E78E04";

const KEY_PREFIX = "Key";

const WHITE_KEYS = [1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25];

const BLACK_KEYS = Array.from({ length: 25 }, (_, i) => i + 1).filter(
  (key) => !WHITE_KEYS.includes(key),
);

const KEY_PATTERN = /Key(\d{1,2})/;

const getKeyNum = (keyName: string): number => {
  const result = KEY_PATTERN.exec(keyName);

  if (!result) {
    throw new Error(`Provided incorrect key name: ${keyName}`);
  }

  return Number.parseInt(result[1]);
};

const isWhiteKey = (keyName: string): boolean => {
  return WHITE_KEYS.includes(getKeyNum(keyName));
};

export class PianoModel {
  private pianoGltf: GLTF | undefined = undefined;
  private whiteKeyMaterial: THREE.MeshStandardMaterial | undefined;
  private whiteKeyMaterialHighlighted: THREE.MeshStandardMaterial | undefined;
  private blackKeyMaterial: THREE.MeshStandardMaterial | undefined;
  private blackKeyMaterialHighlighted: THREE.MeshStandardMaterial | undefined;
  keys: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[];

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
            ?.children.filter<
              THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
            >((key) => key instanceof THREE.Mesh) ?? [];

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

  resetKeys() {
    this.keys.forEach((key) => {
      if (isWhiteKey(key.name) && this.whiteKeyMaterial) {
        key.material = this.whiteKeyMaterial;
      } else if (this.blackKeyMaterial) {
        key.material = this.blackKeyMaterial;
      }
    });
  }

  highlightKey(keyName: string) {
    const key = this.keys.find((key) => key.name === keyName);

    if (key) {
      if (isWhiteKey(keyName) && this.whiteKeyMaterialHighlighted) {
        key.material = this.whiteKeyMaterialHighlighted;
      } else if (this.blackKeyMaterialHighlighted) {
        key.material = this.blackKeyMaterialHighlighted;
      }
    }
  }
}
