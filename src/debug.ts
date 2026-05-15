import GUI from "lil-gui";
import type { World } from "./entrypoints/world/World";

export const gui = new GUI();

gui.hide();
if (document.location.hash.includes("#debug")) {
  gui.show();
}

export const debugWorld = (world: World) => {
  const worldFolder = gui.addFolder("World");

  const debugObj = {
    spawnPiano: () => {
      world.spawnPiano();
    },
  };

  worldFolder.add(debugObj, "spawnPiano");
};
