import {
  initializeMainHero,
  moveMainHero,
  updateMainHeroPosition,
} from "./objects/hero";
import {
  spawnAnimals,
  updateFollowingAnimals,
  updatePatrollingAnimals,
} from "./objects/animal";

import { app } from "./app";
import { createYard } from "./objects/yard";

createYard();
initializeMainHero();
spawnAnimals();

// Game Loop
app.ticker.add(() => {
  updateMainHeroPosition();
  updateFollowingAnimals();
  updatePatrollingAnimals();
});

// Event Listener for clicks
window.addEventListener("click", (event: MouseEvent) => {
  const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  moveMainHero(x, y);
});
