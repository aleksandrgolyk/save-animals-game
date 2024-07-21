import * as PIXI from "pixi.js";
import { app } from "../app";
import { CONFIG } from "../config";
import { Position } from "../models/position";

// Main Hero
export const createMainHero = (): PIXI.Graphics => {
  const hero = new PIXI.Graphics();
  hero.beginFill(0xff0000);
  hero.drawCircle(0, 0, CONFIG.heroSize);
  hero.endFill();
  // Position the hero initially at the center of the yard
  hero.x = app.screen.width - CONFIG.yardSize / 2 - CONFIG.heroSize / 2;
  hero.y = app.screen.height - CONFIG.yardSize / 2 - CONFIG.heroSize / 2;
  app.stage.addChild(hero);
  return hero;
};

export const mainHero = createMainHero();

let targetPosition: Position = { x: mainHero.x, y: mainHero.y };

// Function to update the target position for the hero to move to
export const moveMainHero = (x: number, y: number) => {
  // Ensure the target position is within the bounds of the screen
  targetPosition = {
    x: Math.min(
      Math.max(x, CONFIG.heroSize),
      app.screen.width - CONFIG.heroSize
    ),
    y: Math.min(
      Math.max(y, CONFIG.heroSize),
      app.screen.height - CONFIG.heroSize
    ),
  };
};

// Function to update the hero's position, moving it towards the target position
export const updateMainHeroPosition = () => {
  // Calculate the angle between the current position and the target position
  const angle = Math.atan2(
    targetPosition.y - mainHero.y,
    targetPosition.x - mainHero.x
  );
  // Calculate the change in x and y based on the angle and the speed
  const dx = Math.cos(angle) * CONFIG.speed;
  const dy = Math.sin(angle) * CONFIG.speed;
  const distance = Math.sqrt(
    (targetPosition.x - mainHero.x) ** 2 + (targetPosition.y - mainHero.y) ** 2
  );
  // Move the hero towards the target position if the distance is greater than the speed
  if (distance > CONFIG.speed) {
    mainHero.x += dx;
    mainHero.y += dy;
  } else {
    // Otherwise, set the hero directly to the target position
    mainHero.x = targetPosition.x;
    mainHero.y = targetPosition.y;
  }
};
