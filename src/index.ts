import { app } from "./app";
import { spawnAnimals, updateFollowingAnimals } from "./objects/animal";
import { moveMainHero, updateMainHeroPosition } from "./objects/hero";

// Start spawning animals
spawnAnimals();

// Game Loop
app.ticker.add(() => {
  updateMainHeroPosition();
  updateFollowingAnimals();
});

// Event Listener for clicks
window.addEventListener("click", (event: MouseEvent) => {
  const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  moveMainHero(x, y);
});
