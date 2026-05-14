import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";

import { MouseRaycaster } from "./MouseRaycaster";
import type { FloorParameters } from "../floor/types";
import { FloorService } from "../floor/FloorService";
import { PianoService } from "../piano/PianoService";
import type { DiscreteAudio } from "../../ports/Audio";
import type { Mouse } from "../../ports/mouse";
import type { Repository } from "../../ports/Repository";
import type { Sizes } from "../../ports/sizes";

const GRAVITY = { x: 0, y: -9.81, z: 0 };

const FLOOR_PARAMETERS: FloorParameters = {
  width: 30,
  height: 30,
};

export class WorldService {
  private pianoService: PianoService;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private floorService: FloorService;
  private mouseRaycaster: MouseRaycaster;
  private physicsWorld: RAPIER.World;
  private testCubeMesh: THREE.Mesh | undefined;
  private testCubeBody: RAPIER.RigidBody | undefined;
  private pianoBody: RAPIER.RigidBody | undefined;

  constructor(
    sizesRepository: Repository<Sizes>,
    mouseRepository: Repository<Mouse>,
    pianoAudio: DiscreteAudio,
  ) {
    const sizes = sizesRepository.getState();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
    this.camera.position.set(0, 4, 10);
    this.scene.add(this.camera);

    this.scene.background = new THREE.Color("#010d1a");

    this.floorService = new FloorService(this.scene, FLOOR_PARAMETERS);
    this.pianoService = new PianoService(this.scene, pianoAudio);
    this.mouseRaycaster = new MouseRaycaster(mouseRepository);
    this.physicsWorld = new RAPIER.World(GRAVITY);
  }

  handleMouseDown() {
    this.pianoService.pressKey();
  }

  handleMouseUp() {
    this.pianoService.releaseKey();
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  async load() {
    await this.floorService.load();
    await this.pianoService.load();

    const floorColliderDesc = RAPIER.ColliderDesc.cuboid(
      FLOOR_PARAMETERS.width / 2,
      0.01,
      FLOOR_PARAMETERS.height / 2,
    );

    this.physicsWorld.createCollider(floorColliderDesc);

    this.testCubeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: "blue",
      }),
    );

    this.scene.add(this.testCubeMesh);

    const testCubeBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
      0,
      0,
      0,
    );

    this.testCubeBody = this.physicsWorld.createRigidBody(testCubeBodyDesc);

    const testCubeColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    this.physicsWorld.createCollider(testCubeColliderDesc, this.testCubeBody);

    // Piano Body

    const pianoCollider = this.pianoService.getCollider();

    const pianoBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
      0,
      10,
      0,
    );

    this.pianoBody = this.physicsWorld.createRigidBody(pianoBodyDesc);

    pianoCollider.traverse((child) => {
      if (
        !(
          child instanceof THREE.Mesh &&
          child.geometry instanceof THREE.BufferGeometry
        )
      ) {
        return;
      }

      child.geometry.computeBoundingBox();

      const box = child.geometry.boundingBox;
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();

      box?.getCenter(center);
      box?.getSize(size);

      const position = new THREE.Vector3();
      const quarterion = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      child.matrix.decompose(position, quarterion, scale);

      const colliderCenter = center.clone().applyMatrix4(child.matrix);

      const colliderDesc = RAPIER.ColliderDesc.cuboid(
        Math.abs(size.x * scale.x) / 2,
        Math.abs(size.y * scale.y) / 2,
        Math.abs(size.z * scale.z) / 2,
      )
        .setTranslation(colliderCenter.x, colliderCenter.y, colliderCenter.z)
        .setRotation(quarterion);

      this.physicsWorld.createCollider(colliderDesc, this.pianoBody);
    });
  }

  tick(delta: number) {
    this.physicsWorld.step();

    const testCubePosition = this.testCubeBody?.translation();
    const testCubeRotation = this.testCubeBody?.rotation();

    if (testCubePosition && testCubeRotation && this.testCubeMesh) {
      this.testCubeMesh.position.set(
        testCubePosition.x,
        testCubePosition.y,
        testCubePosition.z,
      );

      this.testCubeMesh.quaternion.set(
        testCubeRotation.x,
        testCubeRotation.y,
        testCubeRotation.z,
        testCubeRotation.w,
      );
    }

    const pianoBodyPosition = this.pianoBody?.translation();
    const pianoBodyRotation = this.pianoBody?.rotation();

    if (pianoBodyPosition && pianoBodyRotation) {
      this.pianoService.sync(pianoBodyPosition, pianoBodyRotation);
    }

    const firstIntersection = this.mouseRaycaster.checkIntersections(
      this.camera,
      this.pianoService.getKeyMeshes(),
    )[0];

    if (firstIntersection) {
      this.pianoService.setActiveKey(firstIntersection.object.name);
    } else {
      this.pianoService.resetActiveKey();
    }

    this.pianoService.tick(delta);
  }
}
