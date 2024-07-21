import { Position } from "../models/position";
import { yard } from "../objects/yard";

// Function to generate random positions
export const getRandomPosition = (
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
    // we have to check if the animal spawn place is not in the yard and outside of the game area
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
