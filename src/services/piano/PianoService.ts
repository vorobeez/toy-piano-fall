import * as THREE from "three";
import { PianoModel, type KeyName } from "../../domains/PianoModel";
import { PianoThreeJS } from "./PianoThreeJS";

export class PianoService {
  private pianoModel: PianoModel;
  private pianoThreeJS: PianoThreeJS;

  constructor(onGLTFLoad: (pianoObj: THREE.Object3D) => void) {
    this.pianoModel = new PianoModel();
    this.pianoThreeJS = new PianoThreeJS(onGLTFLoad);
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
    return this.pianoThreeJS.keys;
  }

  tick() {
    this.pianoThreeJS.tick(this.pianoModel);
  }
}
