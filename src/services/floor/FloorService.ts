import * as THREE from "three";
import { FloorThreeJS } from "./FloorThreeJS";
import type { FloorParameters } from "./types";

export class FloorService {
  private floorThreeJS: FloorThreeJS;

  constructor(scene: THREE.Scene, parameters: FloorParameters) {
    this.floorThreeJS = new FloorThreeJS(scene, parameters);
  }

  async load() {
    await this.floorThreeJS.load();
  }
}
