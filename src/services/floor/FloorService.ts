import * as THREE from "three";
import { FloorThreeJS } from "./FloorThreeJS";
import type { Renderable } from "../../ports/Renderable";

export class FloorService implements Renderable {
  private floorThreeJS: FloorThreeJS;

  constructor(scene: THREE.Scene) {
    this.floorThreeJS = new FloorThreeJS(scene);
  }

  async load() {
    await this.floorThreeJS.load();
  }

  tick(): void {
    this.floorThreeJS.tick();
  }
}
