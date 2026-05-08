import * as THREE from "three";
import type { Repository } from "../../ports/Repository";
import type { Mouse } from "../../ports/mouse";

export class MouseRaycaster {
  private raycaster: THREE.Raycaster;
  private mouseRepository: Repository<Mouse>;

  constructor(mouseRepository: Repository<Mouse>) {
    this.raycaster = new THREE.Raycaster();
    this.mouseRepository = mouseRepository;
  }

  checkIntersections(camera: THREE.Camera, objectsToCheck: THREE.Object3D[]) {
    const mouse = this.mouseRepository.getState();

    this.raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    return this.raycaster.intersectObjects(objectsToCheck);
  }
}
