"use strict";
const vec = (n) => [...Array(n)].map(n => 0);
const layer = (prevNeurons, neurons = prevNeurons) => vec(neurons).map(n => ({ bias: 0, weights: vec(prevNeurons) }));
const brain = (inputNeurons, hiddenLayerNeurons, outputNeurons, hiddenLayers) => [
    layer(inputNeurons, hiddenLayerNeurons),
    ...vec(hiddenLayers - 1).map(hl => layer(hiddenLayerNeurons)),
    layer(hiddenLayerNeurons, outputNeurons),
];
const next = (layers, inputs) => layers.reduce((inputs, layer) => layer.map(({ bias, weights }) => {
    let sum = inputs.reduce((sum, input, i) => sum + input * weights[i], 0) + bias;
    return sum / (1 + Math.abs(sum));
}), inputs);
const mutant = (brain, rn, rate = .2) => brain.map(l => l.map(({ bias, weights }) => ({
    bias: rn() < rate ? rn() : bias,
    weights: weights.map(w => (rn() < rate ? rn() * 2 - 1 : w)),
})));
/// <reference path="Brain.ts" />
const timeout = 100, w = 16, h = 16;
let rng;
let snakes;
let defaultSnake;
let snake;
function initSnakes() {
    rng = new RNG("...");
    snakes = vec(100)
        .map(n => mutant(brain(12, 12, 4, 2), () => rng.uniform()))
        .map(brain => ({ brain, ate: 0, age: 0 }));
    defaultSnake = () => ({
        head: { x: w / 2, y: h / 2 },
        food: { x: Math.floor(w / 3), y: Math.floor(h / 3) },
        body: vec(h).map(y => vec(w)),
        ate: 0,
        age: 0,
        rng: new RNG("."),
    });
    snake = defaultSnake();
}
const view = { generation: 0, snake: 0 };
function think(brain) {
    const { head, food, body } = snake;
    const noN = !head.y, noE = head.x == w - 1, noS = head.y == h - 1, noW = !head.x;
    const inputs = [
        ...[noN, noE, noS, noW],
        head.x == food.x && head.y > food.y,
        head.y == food.y && head.x < food.x,
        head.x == food.x && head.y < food.y,
        head.y == food.y && head.x > food.x,
        !noN && body[head.y - 1][head.x],
        !noE && body[head.y][head.x + 1],
        !noS && body[head.y + 1][head.x],
        !noW && body[head.y][head.x - 1], //Body West
    ];
    return next(brain, inputs.map(b => (b ? 1 : 0)));
}
function nextAct() {
    const { brain } = snakes[view.snake];
    const { head, food, body, ate, age } = snake;
    const [N, E, S, W] = think(brain);
    const most = Math.max(N, E, S, W);
    head.y += most == S ? 1 : most == N ? -1 : 0;
    head.x += most == N || most == S ? 0 : most == E ? 1 : -1;
    //If snake ate
    if (head.x == food.x && head.y == food.y) {
        ++snake.ate;
        food.x = Math.floor(snake.rng.uniform() * w);
        food.y = Math.floor(snake.rng.uniform() * h);
    }
    //If snake died
    if (head.x < 0 ||
        head.x == body[0].length ||
        head.y < 0 ||
        head.y == body.length ||
        body[head.y][head.x] ||
        age > timeout) {
        //Save snake stats
        snakes[view.snake++] = { brain, ate: snake.ate, age: snake.age };
        //Reset snake
        snake = defaultSnake();
        //If we've reached the end of the generation
        if (view.snake == snakes.length) {
            view.snake = 0;
            ++view.generation;
            //Breed winners
            const fit = (s) => s.age + s.ate * timeout;
            snakes = snakes.sort((s0, s1) => fit(s1) - fit(s0));
            const numTop = Math.ceil(snakes.length / 10), numChild = snakes.length / numTop - 1;
            for (let i = 0; i < numTop; ++i) {
                for (let child = 0; child < numChild; ++child) {
                    snakes[numTop + i * numChild + child].brain = mutant(snakes[i].brain, () => rng.uniform());
                }
            }
            snakes.forEach(s => {
                s.age = s.ate = 0;
            });
        }
        return;
    }
    ++snake.age;
    for (let y = 0; y < body.length; ++y) {
        for (let x = 0; x < body[y].length; ++x) {
            body[y][x] && --body[y][x];
        }
    }
    body[head.y][head.x] = ate + 2;
}
function nextFrame(board, info) {
    nextAct();
    const { body, head, food, ate, age } = snake;
    const [height, width] = [body.length, body[0].length];
    board.clearRect(0, 0, board.canvas.width, board.canvas.height);
    board.save();
    board.scale(board.canvas.width / width, board.canvas.height / height);
    //Draw Snake body & head
    board.fillStyle = "#000";
    body.forEach((row, y) => row.forEach((dot, x) => dot && board.fillRect(x, y, 1, 1)));
    board.fillRect(head.x, head.y, 1, 1);
    board.fillStyle = "#fff";
    board.font = ".75px Arial";
    board.fillText(ate.toString(), head.x, head.y + 0.75);
    //Draw food
    board.fillStyle = "#d00";
    board.fillRect(food.x, food.y, 1, 1);
    //Draw info
    info.clearRect(0, 0, info.canvas.width, info.canvas.height);
    info.fillStyle = "#000";
    info.font = "12px Arial";
    info.fillText(JSON.stringify(view), 12, 24);
    board.restore();
}
//# sourceMappingURL=SnakeAI.js.map