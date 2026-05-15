import * as THREE from "three";

import type { PlaneParameters, QuarterionLike, Vector3Like } from "./view";
import type { Listener } from "../utilities/Dispatcher";

export type ContactForceEvent = {
  force: number;
  position: Vector3Like;
};

export interface PhysicsWorld {
  step(): void;
  getPianoBodyPosition(index: number): Vector3Like;
  getPianoBodyRotation(index: number): QuarterionLike;
  addFloorBody(floorParameters: PlaneParameters): void;
  addPianoBody(position: Vector3Like, colliderModel: THREE.Object3D): void;
  addContactForceListener(listener: Listener<ContactForceEvent>): void;
}
