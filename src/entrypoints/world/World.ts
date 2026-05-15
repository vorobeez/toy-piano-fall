import * as THREE from "three";

import { MouseRaycaster } from "./MouseRaycaster";
import type { Mouse } from "../../ports/mouse";
import type { Repository } from "../../ports/Repository";
import type { Sizes } from "../../ports/sizes";
import { PianosController } from "../../components/pianos/PianosController";
import { FloorView } from "../../components/floor/FloorView";
import type { PlaneParameters, Vector3Like } from "../../ports/view";
import type { PhysicsWorld } from "../../ports/physics";
import type { AudioWorld } from "../../ports/audio";

const FLOOR_PARAMETERS: PlaneParameters = {
  width: 30,
  height: 30,
};

export class World {
  private pianosController: PianosController;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private floorView: FloorView;
  private mouseRaycaster: MouseRaycaster;
  private physicsWorld: PhysicsWorld;
  private audioWorld: AudioWorld;

  constructor(
    sizesRepository: Repository<Sizes>,
    mouseRepository: Repository<Mouse>,
    physicsWorld: PhysicsWorld,
    audioWorld: AudioWorld,
  ) {
    const sizes = sizesRepository.getState();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
    this.camera.position.set(0, 4, 10);
    this.scene.add(this.camera);

    this.scene.background = new THREE.Color("#010d1a");

    this.floorView = new FloorView(FLOOR_PARAMETERS);

    this.pianosController = new PianosController(
      this.scene,
      audioWorld,
      FLOOR_PARAMETERS,
    );

    this.mouseRaycaster = new MouseRaycaster(mouseRepository);

    this.physicsWorld = physicsWorld;

    this.audioWorld = audioWorld;
  }

  handleMouseDown() {
    this.pianosController.pressKey();
  }

  handleMouseUp() {
    this.pianosController.releaseKey();
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  async load() {
    await this.floorView.load();
    await this.pianosController.load();

    const floorMesh = this.floorView.getRootMesh();
    this.physicsWorld.addFloorBody(FLOOR_PARAMETERS);
    this.scene.add(floorMesh);

    this.pianosController.spawnPiano({
      x: 0,
      y: 0,
      z: 0,
    });
    this.physicsWorld.addPianoBody(
      {
        x: 0,
        y: 0,
        z: 0,
      },
      this.pianosController.getCollider(),
    );
  }

  spawnPiano() {
    const position: Vector3Like = {
      x: (2 * Math.random() - 1) * 3,
      y: 20,
      z: (2 * Math.random() - 1) * 3,
    };

    this.pianosController.spawnPiano(position);
    this.physicsWorld.addPianoBody(
      position,
      this.pianosController.getCollider(),
    );
  }

  tick(delta: number) {
    this.physicsWorld.step();

    const pianosLength = this.pianosController.getPianoViewsLength();

    for (let i = 0; i < pianosLength; i += 1) {
      const pianoBodyPosition = this.physicsWorld.getPianoBodyPosition(i);
      const pianoBodyRotation = this.physicsWorld.getPianoBodyRotation(i);

      this.pianosController.sync(i, pianoBodyPosition, pianoBodyRotation);
    }

    const firstIntersection = this.mouseRaycaster.checkIntersections(
      this.camera,
      this.pianosController.getKeyMeshes(),
    )[0];

    if (firstIntersection) {
      const pianoIndex = firstIntersection.object.userData.pianoIndex;

      if (typeof pianoIndex !== "number") {
        throw new Error("Piano index is not defined");
      }

      this.pianosController.setActiveKey(
        pianoIndex,
        firstIntersection.object.name,
      );
    } else {
      this.pianosController.resetActiveKey();
    }

    this.pianosController.tick(delta);
  }
}
