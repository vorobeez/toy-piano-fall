import * as THREE from "three";

import type { PlaneParameters, QuarterionLike, Vector3Like } from "./view";

export interface PhysicsWorld {
  step(): void;
  getPianoBodyPosition(index: number): Vector3Like;
  getPianoBodyRotation(index: number): QuarterionLike;
  addFloorBody(floorParameters: PlaneParameters): void;
  addPianoBody(position: Vector3Like, collider: THREE.Object3D): void;
}
