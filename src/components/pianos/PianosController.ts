import * as THREE from "three";

import { getNote, PianosModel, type KeyName } from "../../domains/PianosModel";
import type { DiscreteAudio } from "../../ports/audio";
import type { QuarterionLike, Vector3Like } from "../../ports/view";
import { PianoView } from "./PianoView";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class PianosController {
  private pianosModel: PianosModel;
  private pianoViews: PianoView[] = [];
  private pianoAudio: DiscreteAudio;
  private pianoObject: THREE.Object3D | undefined;
  private pianoCollider: THREE.Object3D | undefined;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, pianoAudio: DiscreteAudio) {
    this.pianosModel = new PianosModel();
    this.pianoAudio = pianoAudio;
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

    this.pianoObject = pianoObj;
    this.pianoCollider = pianoCollider;

    await this.pianoAudio.start();
  }

  spawnPiano(position: Vector3Like) {
    if (!this.pianoObject) {
      throw new Error("Piano GLTF model hasn't loaded");
    }

    const pianoView = new PianoView(this.pianoObject);
    const pianoViewMesh = pianoView.getRootMesh();
    const keyMeshes = pianoView.getKeyMeshes();

    pianoViewMesh.userData.pianoIndex = this.pianoViews.length;

    keyMeshes.forEach((mesh) => {
      mesh.userData.pianoIndex = this.pianoViews.length;
    });

    pianoViewMesh.position.set(position.x, position.y, position.z);

    this.scene.add(pianoViewMesh);

    this.pianoViews.push(pianoView);
  }

  setActiveKey(pianoIndex: number, keyName: KeyName) {
    this.pianosModel.setActiveKey(pianoIndex, keyName);
  }

  resetActiveKey() {
    this.pianosModel.resetActiveKey();
  }

  pressKey() {
    this.pianosModel.pressKey();

    if (
      this.pianosModel.currentState.activeKey &&
      !this.pianosModel.prevState?.keyPressed &&
      this.pianosModel.currentState.keyPressed
    ) {
      this.pianoAudio.triggerNote(
        getNote(this.pianosModel.currentState.activeKey),
      );
    }
  }

  releaseKey() {
    this.pianosModel.releaseKey();
  }

  getKeyMeshes() {
    return this.pianoViews.flatMap((view) => view.getKeyMeshes());
  }

  tick(delta: number) {
    const currentState = this.pianosModel.currentState;
    const prevState = this.pianosModel.prevState;

    this.pianoViews.forEach((view, index) => {
      view.resetKeys();

      if (currentState.pianoIndex === index && currentState.activeKey) {
        view.highlightKey(currentState.activeKey);

        if (currentState.keyPressed && prevState && !prevState.keyPressed) {
          view.pressKey(currentState.activeKey);
        }

        if (!currentState.keyPressed && prevState && prevState.keyPressed) {
          view.releaseKey(currentState.activeKey);
        }
      }

      if (
        prevState?.activeKey &&
        prevState?.pianoIndex === index &&
        currentState.pianoIndex !== index
      ) {
        view.releaseKey(prevState.activeKey);
      }

      if (
        prevState?.activeKey &&
        prevState?.pianoIndex === index &&
        currentState.pianoIndex === index &&
        prevState.activeKey !== currentState.activeKey
      ) {
        view.releaseKey(prevState.activeKey);
      }

      view.tick(delta);
    });
  }

  sync(
    pianoIndex: number,
    position: Vector3Like,
    rotation: QuarterionLike,
  ): void {
    this.pianoViews[pianoIndex].sync(position, rotation);
  }

  getPianoViewsLength() {
    return this.pianoViews.length;
  }

  getCollider() {
    if (!this.pianoCollider) {
      throw new Error("Piano GLTF model hasn't loaded");
    }

    return this.pianoCollider;
  }
}
