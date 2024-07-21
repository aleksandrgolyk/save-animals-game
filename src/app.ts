import * as PIXI from "pixi.js";

export const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x00ff00,
  view: document.getElementById("game-canvas") as HTMLCanvasElement,
});
