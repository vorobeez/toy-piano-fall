import type { DiscreteAudio } from "../../ports/Audio";
import type { Mouse } from "../../ports/mouse";
import type { Renderable } from "../../ports/Renderable";
import type { Repository } from "../../ports/Repository";
import type { Sizes } from "../../ports/sizes";
import { FloorService } from "../floor/FloorService";
import { PianoService } from "../piano/PianoService";
import { MouseRaycaster } from "./MouseRaycaster";
import { WorldThreeJS } from "./WorldThreeJS";

export class WorldService implements Renderable {
  private pianoService: PianoService;
  private worldThreeJS: WorldThreeJS;
  private floorService: FloorService;
  private mouseRaycaster: MouseRaycaster;

  constructor(
    sizesRepository: Repository<Sizes>,
    mouseRepository: Repository<Mouse>,
    pianoAudio: DiscreteAudio,
  ) {
    this.worldThreeJS = new WorldThreeJS(sizesRepository);
    this.floorService = new FloorService(this.worldThreeJS.scene);
    this.pianoService = new PianoService(this.worldThreeJS.scene, pianoAudio);
    this.mouseRaycaster = new MouseRaycaster(mouseRepository);
  }

  handleMouseDown() {
    this.pianoService.pressKey();
  }

  handleMouseUp() {
    this.pianoService.releaseKey();
  }

  getScene() {
    return this.worldThreeJS.scene;
  }

  getCamera() {
    return this.worldThreeJS.camera;
  }

  async load() {
    await this.worldThreeJS.load();
    await this.floorService.load();
    await this.pianoService.load();
  }

  tick(delta: number) {
    const firstIntersection = this.mouseRaycaster.checkIntersections(
      this.worldThreeJS.camera,
      this.pianoService.getKeyMeshes(),
    )[0];

    if (firstIntersection) {
      this.pianoService.setActiveKey(firstIntersection.object.name);
    } else {
      this.pianoService.resetActiveKey();
    }

    this.floorService.tick();
    this.pianoService.tick(delta);
    this.worldThreeJS.tick();
  }
}
