import * as THREE from "three";
import type { Sizes } from "../../ports/sizes";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { debugDirectionalLight, debugRenderer } from "./debug";

export class ThreeJSRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private orbitControls: OrbitControls;
  private pianoGltf: GLTF | undefined = undefined;
  private gltfLoader: GLTFLoader;

  constructor(canvas: HTMLCanvasElement, sizes: Sizes) {
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

    this.gltfLoader = new GLTFLoader();

    debugRenderer(this.renderer);

    this.addTestObjects();
    this.loadPiano();
  }

  private async loadPiano() {
    this.pianoGltf = await this.gltfLoader.loadAsync("/models/toy-piano.glb");

    this.pianoGltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.pianoGltf.scene.rotation.y = -Math.PI / 2;

    this.scene.add(this.pianoGltf.scene);
  }

  private addTestObjects() {
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: 0x005500,
      }),
    );
    floorMesh.rotation.x = -Math.PI / 2;

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

  public startAnimationLoop() {
    this.animationTick();
  }

  private animationTick() {
    this.orbitControls.update();

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.animationTick.bind(this));
  }
}
