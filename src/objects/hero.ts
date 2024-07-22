import * as PIXI from "pixi.js";

import { CONFIG } from "../config";
import { Position } from "../models/position";
import { app } from "../app";

const { heroSize, yardSize, speed } = CONFIG;

const heroStartPosition: Position = {
  x: app.screen.width - yardSize / 2 - heroSize / 2,
  y: app.screen.height - yardSize / 2 - heroSize / 2,
};

// Declare and initialize mainHero
let mainHero: PIXI.Graphics;
let targetPosition: Position = { ...heroStartPosition };

const createMainHero = (): PIXI.Graphics => {
  const hero = new PIXI.Graphics();
  hero.beginFill(0xff0000);
  hero.drawCircle(0, 0, heroSize);
  hero.endFill();
  // Position the hero initially at the center of the yard
  hero.position.set(heroStartPosition.x, heroStartPosition.y);
  app.stage.addChild(hero);
  return hero;
};

// Added separate export for layout correct rendering - hero after yard
// Function to initialize mainHero
export const initializeMainHero = () => {
  if (!mainHero) {
    mainHero = createMainHero();
  }
};
export { mainHero };

// Function to update the target position for the hero to move to
export const moveMainHero = (x: number, y: number) => {
  if (!mainHero) return;

  // Ensure the target position is not of the game area
  targetPosition = {
    x: Math.min(Math.max(x, heroSize), app.screen.width - heroSize),
    y: Math.min(Math.max(y, heroSize), app.screen.height - heroSize),
  };
};

// Function to update the hero's position, moving it to the target position
export const updateMainHeroPosition = () => {
  if (!mainHero) return;

  // Calculate the angle between the current position and the target position
  const angle = Math.atan2(
    targetPosition.y - mainHero.y,
    targetPosition.x - mainHero.x
  );
  // Calculate the change in x and y based on the angle and the speed
  const dx = Math.cos(angle) * speed;
  const dy = Math.sin(angle) * speed;
  const distance = Math.sqrt(
    (targetPosition.x - mainHero.x) ** 2 + (targetPosition.y - mainHero.y) ** 2
  );
  // If distance is greater than speed, move to pointed place
  if (distance > speed) {
    mainHero.x += dx;
    mainHero.y += dy;
  } else {
    // Otherwise, set the hero directly to the target position
    mainHero.x = targetPosition.x;
    mainHero.y = targetPosition.y;
  }
};
