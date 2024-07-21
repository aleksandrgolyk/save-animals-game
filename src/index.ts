import * as PIXI from "pixi.js";

const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x00ff00,
  view: document.getElementById("game-canvas") as HTMLCanvasElement,
});
// VARIABLES
let animalsAllowed = 40;
let animalSize = 10;
let yardSize = 100;
let heroSize = 20;
let spawnIntervalMin = 500;
let spawnIntervalMax = 2000;
let minSpawnAmount = 1;
let maxSpawnAmount = 7;
let maxFollowers = 5;

// Yard (destination point)
const yard = new PIXI.Graphics();
yard.beginFill(0xffff00);
yard.drawRect(0, 0, yardSize, yardSize);
yard.endFill();
yard.x = app.screen.width - yardSize - 10;
yard.y = app.screen.height - yardSize - 10;
app.stage.addChild(yard);

// Function to generate random positions
const getRandomPosition = (
  maxWidth: number,
  maxHeight: number,
  animalSize: number
) => {
  let x: number = 0;
  let y: number = 0;
  let validPosition = false;

  // Loop to recreate the position if it is in the forbidden area (yard)
  while (!validPosition) {
    x = Math.random() * (maxWidth - 3 * animalSize) + animalSize;
    y = Math.random() * (maxHeight - 3 * animalSize) + animalSize;
    // Check if the position is outside the yard + animal size
    if (
      x + animalSize < yard.x ||
      x > yard.x + yard.width ||
      y + animalSize < yard.y ||
      y > yard.y + yard.height
    ) {
      validPosition = true;
    }
  }

  return { x, y };
};

// Main Hero
const mainHero = new PIXI.Graphics();
mainHero.beginFill(0xff0000);
mainHero.drawCircle(0, 0, heroSize);
mainHero.endFill();
mainHero.x = app.screen.width - yardSize / 2 - heroSize / 2;
mainHero.y = app.screen.height - yardSize / 2 - heroSize / 2;
app.stage.addChild(mainHero);

// Add random animals
const animals: PIXI.Graphics[] = [];
const followingAnimals: PIXI.Graphics[] = [];

const createAnimals = () => {
  // Do not exceed max number of animals - to avoid mess on a screen
  if (animals.length >= animalsAllowed) return;
  const randomAmoutToSpawn =
    Math.floor(Math.random() * (maxSpawnAmount - minSpawnAmount + 1)) +
    minSpawnAmount;
  for (let i = 0; i < randomAmoutToSpawn; i++) {
    const animal = new PIXI.Graphics();
    animal.beginFill(0xffffff);
    animal.drawCircle(0, 0, animalSize);
    animal.endFill();
    const position = getRandomPosition(
      app.screen.width,
      app.screen.height,
      animalSize
    );
    animal.x = position.x;
    animal.y = position.y;
    animals.push(animal);
    app.stage.addChild(animal);
  }
};

// Add a spawn interval generator
const spawnAnimals = () => {
  setInterval(() => {
    createAnimals();
  }, Math.random() * (spawnIntervalMax - spawnIntervalMin) + spawnIntervalMin);
};
spawnAnimals();
// Score Text
const scoreText = new PIXI.Text("Score: 0", {
  fontSize: 24,
  fill: 0x000000,
});
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

// Function to update the score
let score = 0;
const updateScore = () => {
  scoreText.text = `Score: ${score}`;
};

let targetX = mainHero.x;
let targetY = mainHero.y;
const speed = 10;
const followDistance = 30; // Distance between animals in the queue

// Function to move Main Hero to a position
const moveMainHero = (x: number, y: number) => {
  // Limit the target position to the bounds of the field minus the size of the hero
  targetX = Math.min(Math.max(x, heroSize), app.screen.width - heroSize);
  targetY = Math.min(Math.max(y, heroSize), app.screen.height - heroSize);
};

app.ticker.add(() => {
  // Calculate the angle between the Main Hero and the target position
  // atan2(y, x) computes the angle in radians from the positive x-axis to the point (x, y)
  const angle = Math.atan2(targetY - mainHero.y, targetX - mainHero.x);

  // Calculate the change in x and y based on the angle and speed
  // dx and dy determine how much to move the Main Hero each frame
  const dx = Math.cos(angle) * speed; // Horizontal movement component
  const dy = Math.sin(angle) * speed; // Vertical movement component

  // Compute the distance between the Main Hero and the target position
  // sqrt((x2 - x1)² + (y2 - y1)²) is the Euclidean distance
  const distance = Math.sqrt(
    (targetX - mainHero.x) ** 2 + (targetY - mainHero.y) ** 2
  );

  // Move the Main Hero towards the target position
  if (distance > speed) {
    // If the distance to the target is greater than the speed, move towards it
    mainHero.x += dx; // Update the x position of the Main Hero
    mainHero.y += dy; // Update the y position of the Main Hero
  } else {
    // If the Main Hero is close to the target, set the position to the target
    mainHero.x = targetX;
    mainHero.y = targetY;
  }

  // Iterate over all animals to check if they should start following the Main Hero
  animals.forEach((animal, index) => {
    // Calculate the distance between the Main Hero and the current animal
    const animalDistance = Math.sqrt(
      (animal.x - mainHero.x) ** 2 + (animal.y - mainHero.y) ** 2
    );

    // If the animal is within 50 pixels of the Main Hero and is not already following
    if (
      animalDistance < 50 &&
      followingAnimals.length < maxFollowers && // Limit the number of following animals
      !followingAnimals.includes(animal)
    ) {
      followingAnimals.push(animal); // Add the animal to the list of following animals
    }
  });

  // Move each animal in the followingAnimals array
  followingAnimals.forEach((animal, index) => {
    let target;
    // The first animal in the list follows the Main Hero, others follow the previous animal (up to maxFollowers)
    // this creates a visual queue of animals following each other
    if (index === 0) {
      target = mainHero;
    } else {
      target = followingAnimals[index - 1];
    }

    // Calculate the angle for the animal to follow its target
    // atan2(y, x) gives the angle between the positive x-axis and the point (x, y)
    const followAngle = Math.atan2(
      target.y - animal.y, // y component of the target direction
      target.x - animal.x // x component of the target direction
    );

    // Compute the distance between the animal and its target
    const followDistanceActual = Math.sqrt(
      (target.x - animal.x) ** 2 + (target.y - animal.y) ** 2
    );

    // Move the animal towards its target if it's farther than the desired follow distance
    if (followDistanceActual > followDistance) {
      // Calculate the movement components for the animal
      // to move towards its target at the desired speed
      const followDx = Math.cos(followAngle) * speed;
      const followDy = Math.sin(followAngle) * speed;

      // Update the position of the animal following target
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
      app.stage.removeChild(animal); // Remove the animal from the stage
      followingAnimals.splice(index, 1); // Remove the animal from the followingAnimals list
      animals.splice(animals.indexOf(animal), 1); // Remove the animal from the animals list
      score += 1; // Increase the score
      updateScore(); // Update the score display
    }
  });
});

// Add click event listener
window.addEventListener("click", (event: MouseEvent) => {
  const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
  if (rect) {
    const targetX = event.clientX - rect.left || 0;
    const targetY = event.clientY - rect.top || 0;
    moveMainHero(targetX, targetY);
  }
});
