import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { type KeyName, type PianoState } from "../../domains/PianoModel";
import { PianoKeyThreeJS } from "./PianoKeyThreeJS";
import type { QuarterionLike, Vector3Like } from "../../ports/Render";

type KeyMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

export class PianoThreeJS {
  private rootMesh: THREE.Object3D | undefined;
  private keyMeshes: KeyMesh[] | undefined;
  private collider: THREE.Object3D | undefined;
  private keys: Record<KeyName, PianoKeyThreeJS> | undefined;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  async load() {
    const gltfLoader = new GLTFLoader();

    const pianoGltf = await gltfLoader.loadAsync("/models/toy-piano.glb");
    const pianoObj = pianoGltf.scene.getObjectByName("Piano");
    const pianoCollider = pianoGltf.scene.getObjectByName("PianoCollider");

    if (!pianoObj) {
      throw new Error("Piano object hasn't found");
    }

    if (!pianoCollider) {
      throw new Error("Collider object hasn't found");
    }

    this.rootMesh = pianoObj;
    this.collider = pianoCollider;

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

    this.keys = this.keyMeshes.reduce<Record<KeyName, PianoKeyThreeJS>>(
      (acc, keyMesh) => {
        acc[keyMesh.name] = new PianoKeyThreeJS(keyMesh);
        return acc;
      },
      {},
    );

    this.scene.add(this.rootMesh);
  }

  sync(position: Vector3Like, rotation: QuarterionLike): void {
    const rootMesh = this.getRootMesh();

    rootMesh.position.set(position.x, position.y, position.z);

    rootMesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  tick(
    delta: number,
    currentState: PianoState,
    prevState: PianoState | undefined,
  ) {
    if (!this.keys) {
      throw new Error("GLTF Model hasn't loaded");
    }

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

  getCollider() {
    if (!this.collider) {
      throw new Error("GLTF Model hasn't loaded");
    }

    return this.collider;
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
