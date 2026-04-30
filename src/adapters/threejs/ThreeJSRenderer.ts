import * as THREE from "three";
import type { Sizes } from "../../ports/sizes";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class ThreeJSRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private orbitControls: OrbitControls;

  constructor(canvas: HTMLCanvasElement, sizes: Sizes) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
    });

    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(sizes.pixelRatio);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
    this.camera.position.set(4, 5, 4);
    this.scene.add(this.camera);

    this.orbitControls = new OrbitControls(this.camera, canvas);
    this.orbitControls.enableDamping = true;

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

    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({
        color: 0x002233,
      }),
    );
    boxMesh.position.y = 1;

    const ambientLight = new THREE.AmbientLight(0xffffff, 10);

    this.scene.add(floorMesh, boxMesh, ambientLight);
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
