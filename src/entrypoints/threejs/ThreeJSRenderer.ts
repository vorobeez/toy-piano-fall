import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { debugDirectionalLight, debugRenderer } from "./debug";
import type { Repository } from "../../ports/Repository";
import type { Sizes } from "../../ports/sizes";
import type { World } from "../world/World";

export class ThreeJSRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private orbitControls: OrbitControls;
  private world: World;
  private timer: THREE.Timer;

  constructor(
    canvas: HTMLCanvasElement,
    sizesRepository: Repository<Sizes>,
    world: World,
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

    this.world = world;

    debugRenderer(this.renderer);

    this.addLights();
  }

  private addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 40;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.normalBias = 0.002;
    directionalLight.shadow.bias = -0.004;
    directionalLight.position.set(-10, 13, 20);

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

    this.world.tick(delta);

    this.orbitControls.update();

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.tick.bind(this));
  }
}
