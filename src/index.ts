import * as PIXI from "pixi.js";

const app = new PIXI.Application({
  width: 1000,
  height: 800,
  backgroundColor: 0x00ff00,
  view: document.getElementById("game-canvas") as HTMLCanvasElement,
});

// Function to generate random positions
const getRandomPosition = (maxWidth: number, maxHeight: number) => {
  return {
    x: Math.random() * maxWidth,
    y: Math.random() * maxHeight,
  };
};

// Main Hero
const mainHero = new PIXI.Graphics();
mainHero.beginFill(0xff0000);
mainHero.drawCircle(0, 0, 20);
mainHero.endFill();
mainHero.x = app.screen.width / 2;
mainHero.y = app.screen.height / 2;
app.stage.addChild(mainHero);

// Add random animals
const animals: PIXI.Graphics[] = [];
for (let i = 0; i < 5; i++) {
  const animal = new PIXI.Graphics();
  animal.beginFill(0xffffff);
  animal.drawCircle(0, 0, 10);
  animal.endFill();
  const position = getRandomPosition(app.screen.width, app.screen.height);
  animal.x = position.x;
  animal.y = position.y;
  animals.push(animal);
  app.stage.addChild(animal);
}

// Yard (destination point)
const yard = new PIXI.Graphics();
yard.beginFill(0xffff00);
yard.drawRect(0, 0, 100, 100);
yard.endFill();
yard.x = app.screen.width - 120;
yard.y = app.screen.height - 120;
app.stage.addChild(yard);

// Score Text
const scoreText = new PIXI.Text("Score: 0", {
  fontSize: 24,
  fill: 0x000000,
});
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

let score = 0;
// Function to update the score
const updateScore = () => {
  scoreText.text = `Score: ${score}`;
};

let targetX = mainHero.x;
let targetY = mainHero.y;
const speed = 5;

// Function to move Main Hero to a position
const moveMainHero = (x: number, y: number) => {
  targetX = x;
  targetY = y;
};

// Main game loop
app.ticker.add(() => {
  const angle = Math.atan2(targetY - mainHero.y, targetX - mainHero.x);
  const dx = Math.cos(angle) * speed;
  const dy = Math.sin(angle) * speed;

  const distance = Math.sqrt(
    (targetX - mainHero.x) ** 2 + (targetY - mainHero.y) ** 2
  );
  if (distance > speed) {
    mainHero.x += dx;
    mainHero.y += dy;
  } else {
    mainHero.x = targetX;
    mainHero.y = targetY;
  }

  // Check for nearby animals
  animals.forEach((animal, index) => {
    const animalDistance = Math.sqrt(
      (animal.x - mainHero.x) ** 2 + (animal.y - mainHero.y) ** 2
    );
    if (animalDistance < 50) {
      animal.x += dx;
      animal.y += dy;

      // Check if the animal reached the yard
      if (
        animal.x >= yard.x &&
        animal.x <= yard.x + yard.width &&
        animal.y >= yard.y &&
        animal.y <= yard.y + yard.height
      ) {
        app.stage.removeChild(animal);
        animals.splice(index, 1);
        score += 1;
        updateScore();
      }
    }
  });
});

// Add click event listener
window.addEventListener("pointerdown", (event: MouseEvent) => {
  const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
  if (rect) {
    const targetX = event.clientX - rect.left || 0;
    const targetY = event.clientY - rect.top || 0;
    console.log(targetX, targetY);
    moveMainHero(targetX, targetY);
  }
});
