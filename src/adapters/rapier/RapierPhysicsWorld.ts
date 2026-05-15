import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";

import type {
  QuarterionLike,
  Vector3Like,
  PlaneParameters,
} from "../../ports/view";
import type { PhysicsWorld } from "../../ports/physics";

const GRAVITY = { x: 0, y: -9.81, z: 0 };

export class RapierPhysicsWorld implements PhysicsWorld {
  private physicsWorld: RAPIER.World;
  private pianoBodies: RAPIER.RigidBody[] = [];

  constructor() {
    this.physicsWorld = new RAPIER.World(GRAVITY);
  }

  step() {
    this.physicsWorld.step();
  }

  private getPianoBody(index: number): RAPIER.RigidBody {
    const pianoBody = this.pianoBodies[index];

    if (!pianoBody) {
      throw new Error("Wrong piano body index");
    }

    return pianoBody;
  }

  getPianoBodyPosition(index: number): Vector3Like {
    const pianoBody = this.getPianoBody(index);

    return pianoBody.translation();
  }

  getPianoBodyRotation(index: number): QuarterionLike {
    const pianoBody = this.getPianoBody(index);

    return pianoBody.rotation();
  }

  addFloorBody(floorParameters: PlaneParameters) {
    const floorColliderDesc = RAPIER.ColliderDesc.cuboid(
      floorParameters.width / 2,
      0.01,
      floorParameters.height / 2,
    );

    this.physicsWorld.createCollider(floorColliderDesc);
  }

  addPianoBody(position: Vector3Like, collider: THREE.Object3D) {
    const pianoBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
      position.x,
      position.y,
      position.z,
    );

    const pianoBody = this.physicsWorld.createRigidBody(pianoBodyDesc);

    collider.traverse((child) => {
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

      this.physicsWorld.createCollider(colliderDesc, pianoBody);
    });

    this.pianoBodies.push(pianoBody);
  }
}
