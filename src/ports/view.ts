import * as THREE from "three";

export type PlaneParameters = {
  width: number;
  height: number;
};

export type Vector3Like = {
  x: number;
  y: number;
  z: number;
};

export type QuarterionLike = {
  x: number;
  y: number;
  z: number;
  w: number;
};

export interface Loadable {
  load(): Promise<void>;
}

export interface Syncable {
  sync(position: Vector3Like, rotation: QuarterionLike): void;
}

export interface Tickable {
  tick(delta: number): void;
}

export interface View {
  getRootMesh(): THREE.Object3D;
}
