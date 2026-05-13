import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { debugDirectionalLight, debugRenderer } from "./debug";
import type { Repository } from "../../ports/Repository";
import type { Sizes } from "../../ports/sizes";
import type { Renderable } from "../../ports/Renderable";

export class ThreeJSRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private orbitControls: OrbitControls;
  private mainService: Renderable;
  private timer: THREE.Timer;

  constructor(
    canvas: HTMLCanvasElement,
    sizesRepository: Repository<Sizes>,
    mainService: Renderable,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
  ) {
    const sizes = sizesRepository.getState();
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: sizes.pixelRatio > 1 ? true : false,
    });

    this.timer = new THREE.Timer();
    this.timer.connect(document);

    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(sizes.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;

    this.scene = scene;
    this.camera = camera;

    this.orbitControls = new OrbitControls(this.camera, canvas);
    this.orbitControls.enableDamping = true;

    this.mainService = mainService;

    debugRenderer(this.renderer);

    this.addLights();
  }

  private addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.normalBias = 0.002;
    directionalLight.shadow.bias = -0.004;
    directionalLight.position.set(-5, 5, 8);

    debugDirectionalLight(directionalLight);

    this.scene.add(ambientLight, directionalLight, directionalLight.target);
  }

  public updateSizes({ width, height, pixelRatio, aspectRatio }: Sizes) {
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(pixelRatio);
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
  }

  public startLoop() {
    this.tick();
  }

  private tick() {
    this.timer.update();

    const delta = this.timer.getDelta();

    this.mainService.tick(delta);

    this.orbitControls.update();

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.tick.bind(this));
  }
}
