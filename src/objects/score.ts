import * as PIXI from "pixi.js";

import { app } from "../app";

let score = 0;
const scoreText = new PIXI.Text("Score: 0", { fontSize: 24, fill: 0 });
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

const updateScore = () => {
  scoreText.text = `Score: ${score}`;
};

export const increaseScore = () => {
  score++;
  updateScore();
};
