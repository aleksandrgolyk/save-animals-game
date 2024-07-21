import * as PIXI from "pixi.js";
import { app } from "../app";
import { CONFIG } from "../config";

// Yard (destination point)
export const createYard = (): PIXI.Graphics => {
  const yard = new PIXI.Graphics();
  yard.beginFill(0xffff00);
  yard.drawRect(0, 0, CONFIG.yardSize, CONFIG.yardSize);
  yard.endFill();
  yard.x = app.screen.width - CONFIG.yardSize - 10;
  yard.y = app.screen.height - CONFIG.yardSize - 10;
  app.stage.addChild(yard);
  return yard;
};

export const yard = createYard();
