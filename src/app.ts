import "./style.css";

import * as PIXI from "pixi.js";

import { CONFIG } from "./config";

export const app = new PIXI.Application({
  width: CONFIG.fieldSize[0],
  height: CONFIG.fieldSize[1],
  backgroundColor: 0x0a8e0a,
  view: document.getElementById("game-canvas") as HTMLCanvasElement,
});
