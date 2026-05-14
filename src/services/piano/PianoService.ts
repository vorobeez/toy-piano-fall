import * as THREE from "three";
import { getNote, PianoModel, type KeyName } from "../../domains/PianoModel";
import type { DiscreteAudio } from "../../ports/Audio";
import { PianoThreeJS } from "./PianoThreeJS";
import type { QuarterionLike, Vector3Like } from "../../ports/Render";

export class PianoService {
  private pianoModel: PianoModel;
  private pianoThreeJS: PianoThreeJS;
  private pianoAudio: DiscreteAudio;

  constructor(scene: THREE.Scene, pianoAudio: DiscreteAudio) {
    this.pianoModel = new PianoModel();
    this.pianoThreeJS = new PianoThreeJS(scene);
    this.pianoAudio = pianoAudio;
  }

  async load() {
    await this.pianoAudio.start();
    await this.pianoThreeJS.load();
  }

  setActiveKey(keyName: KeyName) {
    this.pianoModel.setActiveKey(keyName);
  }

  resetActiveKey() {
    this.pianoModel.resetActiveKey();
  }

  pressKey() {
    this.pianoModel.pressKey();

    if (
      this.pianoModel.currentState.activeKey &&
      !this.pianoModel.prevState?.keyPressed &&
      this.pianoModel.currentState.keyPressed
    ) {
      this.pianoAudio.triggerNote(
        getNote(this.pianoModel.currentState.activeKey),
      );
    }
  }

  releaseKey() {
    this.pianoModel.releaseKey();
  }

  getKeyMeshes() {
    return this.pianoThreeJS.getKeyMeshes();
  }

  tick(delta: number) {
    this.pianoThreeJS.tick(
      delta,
      this.pianoModel.currentState,
      this.pianoModel.prevState,
    );
  }

  sync(position: Vector3Like, rotation: QuarterionLike): void {
    this.pianoThreeJS.sync(position, rotation);
  }

  getRootMesh(): THREE.Object3D {
    return this.pianoThreeJS.getRootMesh();
  }

  getCollider() {
    return this.pianoThreeJS.getCollider();
  }
}
