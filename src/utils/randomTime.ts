import { CONFIG } from "../config";

export const getRandomTime = (): number => {
  return (
    Math.random() * (CONFIG.spawnIntervalMax - CONFIG.spawnIntervalMin) +
    CONFIG.spawnIntervalMin
  );
};
