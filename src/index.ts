import * as PIXI from "pixi.js";

const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x00ff00,
  view: document.getElementById("game-canvas") as HTMLCanvasElement,
});

// Game Configuration
const CONFIG = {
  animalsAllowed: 40,
  animalSize: 10,
  yardSize: 100,
  heroSize: 20,
  spawnIntervalMin: 500,
  spawnIntervalMax: 2000,
  minSpawnAmount: 1,
  maxSpawnAmount: 7,
  maxFollowers: 5,
  speed: 10,
  followDistance: 30,
};

interface Position {
  x: number;
  y: number;
}

// Yard (destination point)
const createYard = (): PIXI.Graphics => {
  const yard = new PIXI.Graphics();
  yard.beginFill(0xffff00);
  yard.drawRect(0, 0, CONFIG.yardSize, CONFIG.yardSize);
  yard.endFill();
  yard.x = app.screen.width - CONFIG.yardSize - 10;
  yard.y = app.screen.height - CONFIG.yardSize - 10;
  app.stage.addChild(yard);
  return yard;
};

const yard = createYard();

// Function to generate random positions
const getRandomPosition = (
  maxWidth: number,
  maxHeight: number,
  animalSize: number
): Position => {
  let x: number = 0;
  let y: number = 0;
  let validPosition = false;

  while (!validPosition) {
    x = Math.random() * (maxWidth - 3 * animalSize) + animalSize;
    y = Math.random() * (maxHeight - 3 * animalSize) + animalSize;

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
const createMainHero = (): PIXI.Graphics => {
  const hero = new PIXI.Graphics();
  hero.beginFill(0xff0000);
  hero.drawCircle(0, 0, CONFIG.heroSize);
  hero.endFill();
  hero.x = app.screen.width - CONFIG.yardSize / 2 - CONFIG.heroSize / 2;
  hero.y = app.screen.height - CONFIG.yardSize / 2 - CONFIG.heroSize / 2;
  app.stage.addChild(hero);
  return hero;
};

const mainHero = createMainHero();

// Animals
const animals: PIXI.Graphics[] = [];
const followingAnimals: PIXI.Graphics[] = [];

// Create Animal
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

// Add Animals
const createAnimals = () => {
  if (animals.length >= CONFIG.animalsAllowed) return;
  const randomAmountToSpawn =
    Math.floor(
      Math.random() * (CONFIG.maxSpawnAmount - CONFIG.minSpawnAmount + 1)
    ) + CONFIG.minSpawnAmount;

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

// Spawn Animals at Interval
const spawnAnimals = () => {
  setInterval(
    createAnimals,
    Math.random() * (CONFIG.spawnIntervalMax - CONFIG.spawnIntervalMin) +
      CONFIG.spawnIntervalMin
  );
};
spawnAnimals();

// Score
let score = 0;
const scoreText = new PIXI.Text("Score: 0", { fontSize: 24, fill: 0x000000 });
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

const updateScore = () => {
  scoreText.text = `Score: ${score}`;
};

// Movement
let targetPosition: Position = { x: mainHero.x, y: mainHero.y };

const moveMainHero = (x: number, y: number) => {
  // to prevent the Main Hero from going out of the screen we shoose min of clicled position and max of screen width/height
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

const updateMainHeroPosition = () => {
  // Calculate the angle between the Main Hero and the target position
  const angle = Math.atan2(
    targetPosition.y - mainHero.y,
    targetPosition.x - mainHero.x
  );
  // Calculate the change in x and y based on the angle and speed
  const dx = Math.cos(angle) * CONFIG.speed;
  const dy = Math.sin(angle) * CONFIG.speed;
  // Compute the distance between the Main Hero and the target position
  const distance = Math.sqrt(
    (targetPosition.x - mainHero.x) ** 2 + (targetPosition.y - mainHero.y) ** 2
  );
  // Move the Main Hero towards the target position
  if (distance > CONFIG.speed) {
    mainHero.x += dx;
    mainHero.y += dy;
  } else {
    mainHero.x = targetPosition.x;
    mainHero.y = targetPosition.y;
  }
};

// Animal Follow Logic
const updateFollowingAnimals = () => {
  animals.forEach((animal) => {
    // Calculate the distance between the Main Hero and the current animal
    const animalDistance = Math.sqrt(
      (animal.x - mainHero.x) ** 2 + (animal.y - mainHero.y) ** 2
    );
    // If the animal is close enough to the Main Hero and there's room for more followers
    // add it to the following queues
    if (
      animalDistance < 50 &&
      followingAnimals.length < CONFIG.maxFollowers &&
      !followingAnimals.includes(animal)
    ) {
      followingAnimals.push(animal);
    }
  });

  followingAnimals.forEach((animal, index) => {
    // target to follow - First animal following Hero and every next - previous animal in the list)
    const target = index === 0 ? mainHero : followingAnimals[index - 1];
    // Calculate the angle for the animal to follow its target
    const followAngle = Math.atan2(target.y - animal.y, target.x - animal.x);
    // Compute the distance between the animal and its target
    const followDistanceActual = Math.sqrt(
      (target.x - animal.x) ** 2 + (target.y - animal.y) ** 2
    );
    // Move the animal towards its target if it's farther than the desired follow distance
    // (this will make the animals follow each other in a line)
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
      // Remove the animal from the stage and the respective arrays
      app.stage.removeChild(animal);
      followingAnimals.splice(index, 1);
      animals.splice(animals.indexOf(animal), 1);
      // Increase the score and update the display
      score += 1;
      updateScore();
    }
  });
};

// Game Loop
app.ticker.add(() => {
  updateMainHeroPosition();
  updateFollowingAnimals();
});

// Event Listener
window.addEventListener("click", (event: MouseEvent) => {
  const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  moveMainHero(x, y);
});
