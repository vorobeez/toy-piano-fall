import * as THREE from "three";

import type { Tickable, View } from "../../ports/view";

const HIGHLIGHT_COLOR = "#E78E04";

const MAX_Z_ROTATION = -Math.PI / 50;

export type KeyMesh = THREE.Mesh<
  THREE.BufferGeometry,
  THREE.MeshStandardMaterial
>;

export class PianoKeyView implements View, Tickable {
  private rootMesh: KeyMesh;
  private material: THREE.MeshStandardMaterial;
  private highlightedMaterial: THREE.MeshStandardMaterial;
  private mixer: THREE.AnimationMixer;
  private pressAction: THREE.AnimationAction | undefined;
  private releaseAction: THREE.AnimationAction | undefined;

  constructor(mesh: KeyMesh) {
    this.rootMesh = mesh;

    this.material = this.rootMesh.material;
    this.highlightedMaterial = this.rootMesh.material.clone();
    this.highlightedMaterial.emissive.set(HIGHLIGHT_COLOR);

    this.mixer = new THREE.AnimationMixer(this.rootMesh);
  }

  highlightKey() {
    this.rootMesh.material = this.highlightedMaterial;
  }

  resetKey() {
    this.rootMesh.material = this.material;
  }

  pressKey() {
    if (!this.pressAction) {
      const currentZ = this.rootMesh.rotation.z;

      if (this.releaseAction) {
        this.releaseAction.stop();
        this.releaseAction = undefined;
      }

      const pressTrack = new THREE.NumberKeyframeTrack(
        ".rotation[z]",
        [0, 0.2],
        [currentZ, MAX_Z_ROTATION],
      );
      const pressClip = new THREE.AnimationClip("keyPress", -1, [pressTrack]);

      this.pressAction = this.mixer.clipAction(pressClip);
      this.pressAction.setLoop(THREE.LoopOnce, 0);
      this.pressAction.clampWhenFinished = true;
      this.pressAction.reset().play();
    }
  }

  releaseKey() {
    if (this.pressAction) {
      const currentZ = this.rootMesh.rotation.z;

      this.pressAction.stop();
      this.pressAction = undefined;

      const releaseTrack = new THREE.NumberKeyframeTrack(
        ".rotation[z]",
        [0, 0.1],
        [currentZ, 0],
      );

      const releaseClip = new THREE.AnimationClip("keyRelease", -1, [
        releaseTrack,
      ]);

      this.releaseAction = this.mixer.clipAction(releaseClip);
      this.releaseAction.setLoop(THREE.LoopOnce, 0);
      this.releaseAction.clampWhenFinished = true;

      this.releaseAction.reset().play();
    }
  }

  tick(delta: number) {
    this.mixer.update(delta);
  }

  getRootMesh() {
    return this.rootMesh;
  }
}
