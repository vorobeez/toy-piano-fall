import { getNote, PianoModel, type KeyName } from "../../domains/PianoModel";
import type { DiscreteAudio } from "../../ports/Audio";
import { PianoThreeJS } from "./PianoThreeJS";

export class PianoService {
  private pianoModel: PianoModel;
  private pianoThreeJS: PianoThreeJS;
  private pianoAudio: DiscreteAudio;

  constructor(pianoAudio: DiscreteAudio) {
    this.pianoModel = new PianoModel();
    this.pianoThreeJS = new PianoThreeJS();
    this.pianoAudio = pianoAudio;
  }

  async load() {
    await this.pianoAudio.start();
    await this.pianoThreeJS.loadGLTF();
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
    return this.pianoThreeJS.keyMeshes;
  }

  getPianoObject() {
    if (!this.pianoThreeJS.pianoGltf) {
      throw new Error("Getting piano gltf before loading");
    }

    return this.pianoThreeJS.pianoGltf.scene;
  }

  tick(delta: number) {
    this.pianoThreeJS.tick(
      delta,
      this.pianoModel.currentState,
      this.pianoModel.prevState,
    );
  }
}
