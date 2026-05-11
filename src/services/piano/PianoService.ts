import { PianoModel, type KeyName } from "../../domains/PianoModel";
import { PianoThreeJS } from "./PianoThreeJS";

export class PianoService {
  private pianoModel: PianoModel;
  private pianoThreeJS: PianoThreeJS;

  constructor() {
    this.pianoModel = new PianoModel();
    this.pianoThreeJS = new PianoThreeJS();
  }

  async load() {
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
