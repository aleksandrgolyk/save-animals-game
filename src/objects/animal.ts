import * as PIXI from "pixi.js";
import { app } from "../app";
import { CONFIG } from "../config";
import { Position } from "../models/position";
import { getRandomPosition } from "../utils/randomPosition";
import { getRandomTime } from "../utils/randomTime";
import { yard } from "./yard";
import { mainHero } from "./hero";

// Animals array and following animals array
export const animals: PIXI.Graphics[] = [];
export const followingAnimals: PIXI.Graphics[] = [];

const createAnimal = (position: Position): PIXI.Graphics => {
  const animal = new PIXI.Graphics();
  animal.beginFill(0xffffff);
  animal.drawCircle(0, 0, CONFIG.animalSize);
  animal.endFill();
  animal.x = position.x;
  animal.y = position.y;
  app.stage.addChild(animal);
  return animal;
};

export const createAnimals = () => {
  if (animals.length >= CONFIG.animalsAllowed) return;
  // Determine a random number of animals to spawn within the min and max spawn amount
  const randomAmountToSpawn =
    Math.floor(
      Math.random() * (CONFIG.maxSpawnAmount - CONFIG.minSpawnAmount + 1)
    ) + CONFIG.minSpawnAmount;

  // Create each animal at a random valid position (random - its not in the yard and outside of the game area)
  for (let i = 0; i < randomAmountToSpawn; i++) {
    const position = getRandomPosition(
      app.screen.width,
      app.screen.height,
      CONFIG.animalSize
    );
    const animal = createAnimal(position);
    animals.push(animal);
  }
};

// Function to spawn animals at random intervals
export const spawnAnimals = () => {
  setInterval(createAnimals, getRandomTime());
};

// Function to update the positions of animals following the main hero
export const updateFollowingAnimals = () => {
  animals.forEach((animal) => {
    // Calculate the distance between the animal and the main hero
    const animalDistance = Math.sqrt(
      (animal.x - mainHero.x) ** 2 + (animal.y - mainHero.y) ** 2
    );
    // If the animal is close enough to the main hero and there's room for more followers - add it to the queue
    if (
      animalDistance < 50 &&
      followingAnimals.length < CONFIG.maxFollowers &&
      !followingAnimals.includes(animal)
    ) {
      followingAnimals.push(animal);
    }
  });

  followingAnimals.forEach((animal, index) => {
    // First animal follows the main hero, the rest follow the animal in front of them (index - 1)
    const target = index === 0 ? mainHero : followingAnimals[index - 1];
    // Calculate the angle to the target using the arctangent of the differences in x and y
    const followAngle = Math.atan2(target.y - animal.y, target.x - animal.x);
    // Calculate the actual distance to the target
    const followDistanceActual = Math.sqrt(
      (target.x - animal.x) ** 2 + (target.y - animal.y) ** 2
    );
    // If the actual distance is greater than the desired follow distance, move the animal towards the target
    if (followDistanceActual > CONFIG.followDistance) {
      const followDx = Math.cos(followAngle) * CONFIG.speed;
      const followDy = Math.sin(followAngle) * CONFIG.speed;
      animal.x += followDx;
      animal.y += followDy;
    }
    // Check if the animal has reached the yard
    if (
      animal.x >= yard.x &&
      animal.x <= yard.x + yard.width &&
      animal.y >= yard.y &&
      animal.y <= yard.y + yard.height
    ) {
      app.stage.removeChild(animal);
      followingAnimals.splice(index, 1);
      animals.splice(animals.indexOf(animal), 1);
      score += 1;
      updateScore();
    }
  });
};

// Score
let score = 0;
const scoreText = new PIXI.Text("Score: 0", { fontSize: 24, fill: 0x000000 });
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

const updateScore = () => {
  scoreText.text = `Score: ${score}`;
};
