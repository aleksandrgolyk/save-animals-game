import { CONFIG } from "../config";

const { spawnIntervalMin, spawnIntervalMax } = CONFIG;

export const getRandomTime = (): number => {
  return (
    Math.random() * (spawnIntervalMax - spawnIntervalMin) + spawnIntervalMin
  );
};
