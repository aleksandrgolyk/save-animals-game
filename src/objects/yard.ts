import * as PIXI from "pixi.js";

import { CONFIG } from "../config";
import { app } from "../app";

const { yardSize } = CONFIG;

// Yard (destination point)
export const createYard = (): PIXI.Graphics => {
  const yard = new PIXI.Graphics();
  yard.beginFill(0xffff00);
  yard.drawRect(0, 0, yardSize, yardSize);
  yard.endFill();
  yard.x = app.screen.width - yardSize - 10;
  yard.y = app.screen.height - yardSize - 10;
  app.stage.addChild(yard);
  return yard;
};

export const yard = createYard();
