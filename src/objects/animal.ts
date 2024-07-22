import * as PIXI from "pixi.js";

import { CONFIG } from "../config";
import { Position } from "../models/position";
import { app } from "../app";
import { getRandomPosition } from "../utils/randomPosition";
import { getRandomTime } from "../utils/randomTime";
import { mainHero } from "./hero";
import { yard } from "./yard";

const {
  animalSize,
  animalsAllowed,
  maxAnimalSpeed,
  minSpawnAmount,
  maxSpawnAmount,
  maxFollowers,
  speed,
  followDistance,
} = CONFIG;

// Animals array and following animals array
export const animals: PIXI.Graphics[] = [];
export const followingAnimals: PIXI.Graphics[] = [];

// Score
let score = 0;
const scoreText = new PIXI.Text("Score: 0", { fontSize: 24, fill: 0x000000 });
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);
const updateScore = () => {
  scoreText.text = `Score: ${score}`;
};

const createAnimal = (position: Position): PIXI.Graphics => {
  const animal = new PIXI.Graphics();
  animal.beginFill(0xffffff);
  animal.drawCircle(0, 0, animalSize);
  animal.endFill();
  animal.x = position.x;
  animal.y = position.y;
  app.stage.addChild(animal);
  // Add initial patrol properties to the animal
  (animal as any).patrol = {
    angle: Math.random() * Math.PI * 2,
    speed: Math.random() * maxAnimalSpeed,
    nextChange: Date.now() + getRandomTime(),
  };

  return animal;
};

export const createAnimals = () => {
  if (animals.length >= animalsAllowed) return;
  // Determine a random number of animals to spawn within the min and max spawn amount
  const randomAmountToSpawn =
    Math.floor(Math.random() * (maxSpawnAmount - minSpawnAmount + 1)) +
    minSpawnAmount;

  // Create each animal at a random valid position (random - its not in the yard and outside of the game area)
  for (let i = 0; i < randomAmountToSpawn; i++) {
    const position = getRandomPosition(
      app.screen.width,
      app.screen.height,
      animalSize
    );
    const animal = createAnimal(position);
    animals.push(animal);
  }
};

// Function to spawn animals at random intervals
export const spawnAnimals = () => {
  const spawn = () => {
    createAnimals();
    // Schedule the next call to this function after a random delay
    setTimeout(spawn, getRandomTime());
  };

  // Start the first call
  spawn();
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
      followingAnimals.length < maxFollowers &&
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
    if (followDistanceActual > followDistance) {
      const followDx = Math.cos(followAngle) * speed;
      const followDy = Math.sin(followAngle) * speed;
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

const patrolAnimal = (animal: PIXI.Graphics) => {
  // Here we update the patrol behavior of the animals.
  // It checks if it is time for the animal to change its patrol direction and speed.
  // If it is time, it generates a new random angle and speed for the animal's patrol.
  // The nextChange property is used to keep track of when the animal should change its patrol behavior.
  const now = Date.now();
  const patrol = (animal as any).patrol;

  if (now > patrol.nextChange) {
    patrol.angle = Math.random() * Math.PI * 2;
    patrol.speed = Math.random() * maxAnimalSpeed;
    patrol.nextChange = now + getRandomTime();
  }

  const dx = Math.cos(patrol.angle) * patrol.speed;
  const dy = Math.sin(patrol.angle) * patrol.speed;

  animal.x += dx;
  animal.y += dy;

  // check if animal is outside of the game area - then redirect it to another direction
  if (animal.x < animalSize) {
    animal.x = animalSize;
    patrol.angle = Math.random() * Math.PI * 2;
  }
  if (animal.x > app.screen.width - animalSize) {
    animal.x = app.screen.width - animalSize;
    patrol.angle = Math.random() * Math.PI * 2;
  }
  if (animal.y < animalSize) {
    animal.y = animalSize;
    patrol.angle = Math.random() * Math.PI * 2;
  }
  if (animal.y > app.screen.height - animalSize) {
    animal.y = app.screen.height - animalSize;
    patrol.angle = Math.random() * Math.PI * 2;
  }

  // here we check if the animal is inside the yard
  const isInsideYard = (x: number, y: number): boolean => {
    return (
      x >= yard.x - animalSize &&
      x <= yard.x + yard.width + animalSize &&
      y >= yard.y - animalSize &&
      y <= yard.y + yard.height + animalSize
    );
  };

  // if animal is close to yard without Hero - redirect it
  if (isInsideYard(animal.x, animal.y)) {
    const angleToYardCenter = Math.atan2(
      yard.y + yard.height / 2 - animal.y,
      yard.x + yard.width / 2 - animal.x
    );
    animal.x -= Math.cos(angleToYardCenter) * patrol.speed;
    animal.y -= Math.sin(angleToYardCenter) * patrol.speed;
    patrol.angle = Math.random() * Math.PI * 2;
  }
};

// Function to update the positions of patrolling animals
export const updatePatrollingAnimals = () => {
  animals.forEach((animal) => {
    if (!followingAnimals.includes(animal)) {
      patrolAnimal(animal);
    }
  });
};
