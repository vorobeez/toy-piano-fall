import * as THREE from "three";

import { type KeyName } from "../../domains/PianosModel";
import { PianoKeyView } from "./PianoKeyView";
import type {
  QuarterionLike,
  Syncable,
  Tickable,
  Vector3Like,
  View,
} from "../../ports/view";

type KeyMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

export class PianoView implements View, Syncable, Tickable {
  private rootMesh: THREE.Object3D;
  private keyMeshes: KeyMesh[];
  private keys: Record<KeyName, PianoKeyView>;

  constructor(pianoObject: THREE.Object3D) {
    this.rootMesh = pianoObject.clone(true);

    this.rootMesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.keyMeshes =
      this.rootMesh
        .getObjectByName("Keys")
        ?.children.filter<KeyMesh>((key) => key instanceof THREE.Mesh) ?? [];

    this.keys = this.keyMeshes.reduce<Record<KeyName, PianoKeyView>>(
      (acc, keyMesh) => {
        acc[keyMesh.name] = new PianoKeyView(keyMesh);
        return acc;
      },
      {},
    );
  }

  sync(position: Vector3Like, rotation: QuarterionLike): void {
    const rootMesh = this.getRootMesh();

    rootMesh.position.set(position.x, position.y, position.z);

    rootMesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  tick(delta: number) {
    const keyArr = Object.values(this.keys);

    keyArr.forEach((key) => {
      key.tick(delta);
    });
  }

  resetKeys() {
    const keyArr = Object.values(this.keys);

    keyArr.forEach((key) => {
      key.resetKey();
    });
  }

  highlightKey(keyName: KeyName) {
    const key = this.keys[keyName];

    if (!key) {
      throw new Error(`Key mesh wasn\'t found: ${keyName}`);
    }

    key.highlightKey();
  }

  pressKey(keyName: KeyName) {
    const key = this.keys[keyName];

    if (!key) {
      throw new Error(`Key mesh wasn\'t found: ${keyName}`);
    }

    key.pressKey();
  }

  releaseKey(keyName: KeyName) {
    const key = this.keys[keyName];

    if (!key) {
      throw new Error(`Key mesh wasn\'t found: ${keyName}`);
    }

    key.releaseKey();
  }

  getKeyMeshes() {
    if (!this.keyMeshes) {
      throw new Error("GLTF Model hasn't loaded");
    }

    return this.keyMeshes;
  }

  getRootMesh() {
    if (!this.rootMesh) {
      throw new Error("GLTF Model hasn't loaded");
    }

    return this.rootMesh;
  }
}
