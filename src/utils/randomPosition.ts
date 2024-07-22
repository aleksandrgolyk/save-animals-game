import { Position } from "../models/position";
import { yard } from "../objects/yard";

// valid position is when the animal is not in the yard and outside of the game area
const isPositionValid = (x: number, y: number, animalSize: number): boolean => {
  return (
    x + animalSize < yard.x ||
    x > yard.x + yard.width ||
    y + animalSize < yard.y ||
    y > yard.y + yard.height
  );
};

// Function to generate random positions
export const getRandomPosition = (
  maxWidth: number,
  maxHeight: number,
  animalSize: number
): Position => {
  let x: number = 0;
  let y: number = 0;

  // Continue generating random positions until a valid one appears
  while (isPositionValid(x, y, animalSize)) {
    // take a random position within the game area but with extra space - not to close
    x = Math.random() * (maxWidth - 3 * animalSize) + animalSize;
    y = Math.random() * (maxHeight - 3 * animalSize) + animalSize;
  }

  return { x, y };
};
