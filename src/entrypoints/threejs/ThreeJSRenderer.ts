import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { debugDirectionalLight, debugRenderer } from "./debug";
import type { Repository } from "../../ports/Repository";
import type { Mouse } from "../../ports/mouse";
import type { Sizes } from "../../ports/sizes";
import { MouseRaycaster } from "./MouseRaycaster";
import { PianoService } from "../../services/piano/PianoService";

export class ThreeJSRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private orbitControls: OrbitControls;
  private mouseRaycaster: MouseRaycaster;
  private pianoService: PianoService;
  private mouseRepository: Repository<Mouse>;

  constructor(
    canvas: HTMLCanvasElement,
    sizesRepository: Repository<Sizes>,
    mouseRepository: Repository<Mouse>,
  ) {
    const sizes = sizesRepository.getState();
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: sizes.pixelRatio > 1 ? true : false,
    });

    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(sizes.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
    this.camera.position.set(0, 4, 10);
    this.scene.add(this.camera);

    this.orbitControls = new OrbitControls(this.camera, canvas);
    this.orbitControls.enableDamping = true;

    this.mouseRepository = mouseRepository;
    this.mouseRaycaster = new MouseRaycaster(mouseRepository);

    this.pianoService = new PianoService((model) => {
      this.scene.add(model);
    });

    debugRenderer(this.renderer);

    this.addTestObjects();
  }

  private addTestObjects() {
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: 0x005500,
      }),
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    floorMesh.castShadow = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.normalBias = 0.002;
    directionalLight.shadow.bias = -0.004;
    directionalLight.position.set(-5, 5, 8);

    debugDirectionalLight(directionalLight);

    this.scene.add(
      floorMesh,
      ambientLight,
      directionalLight,
      directionalLight.target,
    );
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
    const mouseState = this.mouseRepository.getState();
    const firstIntersection = this.mouseRaycaster.checkIntersections(
      this.camera,
      this.pianoService.getKeyMeshes(),
    )[0];

    if (firstIntersection) {
      this.pianoService.setActiveKey(firstIntersection.object.name);
    } else {
      this.pianoService.resetActiveKey();
    }

    if (mouseState.down) {
      this.pianoService.pressKey();
    } else {
      this.pianoService.releaseKey();
    }

    this.pianoService.tick();

    this.orbitControls.update();

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.tick.bind(this));
  }
}
