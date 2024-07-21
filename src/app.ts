import "./style.css";
import * as PIXI from "pixi.js";

export const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x0a8e0a,
  view: document.getElementById("game-canvas") as HTMLCanvasElement,
});
